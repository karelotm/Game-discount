import { NextRequest, NextResponse } from 'next/server';
import { db, priceAlerts, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendEmail, priceAlertEmail } from '@/lib/email';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const CS_HEADERS = {
  'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
  'Accept': 'application/json',
};

/**
 * GET /api/cron/check-alerts
 * Called by Vercel Cron every 6 hours.
 * Checks all active price alerts against current CheapShark prices.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeAlerts = await db()
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.isActive, true));

    let triggered = 0;

    for (const alert of activeAlerts) {
      if (!alert.cheapsharkGameId && !alert.steamAppId) continue;

      try {
        // Look up current price from CheapShark
        let currentPrice: number | null = null;
        let currentSavings: number | null = null;
        let dealUrl = '';

        if (alert.steamAppId) {
          const res = await fetch(
            `https://www.cheapshark.com/api/1.0/deals?storeID=1&steamAppID=${alert.steamAppId}&pageSize=1`,
            { headers: CS_HEADERS },
          );
          if (res.ok) {
            const deals = await res.json();
            if (Array.isArray(deals) && deals.length > 0) {
              currentPrice = parseFloat(deals[0].salePrice);
              currentSavings = Math.round(parseFloat(deals[0].savings));
              dealUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/game/${alert.steamAppId}`;
            }
          }
        }

        if (currentPrice === null) continue;

        // Update current price
        await db()
          .update(priceAlerts)
          .set({ currentPrice: String(currentPrice), lastChecked: new Date() })
          .where(eq(priceAlerts.id, alert.id));

        // Check if alert should fire
        const targetHit =
          (alert.targetPrice && currentPrice <= parseFloat(alert.targetPrice)) ||
          (alert.targetPct && currentSavings !== null && currentSavings >= alert.targetPct);

        if (!targetHit) continue;

        // Don't notify more than once per 24 hours
        if (alert.lastNotified) {
          const hoursSince = (Date.now() - new Date(alert.lastNotified).getTime()) / (1000 * 60 * 60);
          if (hoursSince < 24) continue;
        }

        // Get user email
        const [user] = await db().select().from(users).where(eq(users.id, alert.userId)).limit(1);
        if (!user) continue;

        const targetStr = alert.targetPrice
          ? formatPrice(alert.targetPrice)
          : `${alert.targetPct}% off`;

        const email = priceAlertEmail(
          alert.gameTitle,
          formatPrice(currentPrice),
          targetStr,
          dealUrl,
        );

        await sendEmail({ to: user.email, ...email });
        await db()
          .update(priceAlerts)
          .set({ lastNotified: new Date() })
          .where(eq(priceAlerts.id, alert.id));

        triggered++;
      } catch (err) {
        console.error(`Alert check failed for ${alert.id}:`, err);
      }

      // Rate limit: ~1 req/sec to CheapShark
      await new Promise((r) => setTimeout(r, 1100));
    }

    return NextResponse.json({ checked: activeAlerts.length, triggered });
  } catch (err) {
    console.error('Cron check-alerts error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
