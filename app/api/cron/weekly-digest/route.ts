import { NextRequest, NextResponse } from 'next/server';
import { db, emailSubscriptions, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { sendEmail, weeklyDealsEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const CS_HEADERS = {
  'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
  'Accept': 'application/json',
};

/**
 * GET /api/cron/weekly-digest
 * Called by Vercel Cron every Monday at 10 AM.
 * Sends top 10 deals to weekly_deals subscribers.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(
      'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=10&sortBy=Deal+Rating&onSale=1',
      { headers: CS_HEADERS },
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'CheapShark failed' }, { status: 502 });
    }

    const rawDeals = await res.json();
    if (!Array.isArray(rawDeals) || rawDeals.length === 0) {
      return NextResponse.json({ message: 'No deals found', notified: 0 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const deals = rawDeals.map((d: { title: string; salePrice: string; normalPrice: string; savings: string; steamAppID?: string; dealID: string }) => ({
      title: d.title,
      salePrice: `$${parseFloat(d.salePrice).toFixed(2)}`,
      normalPrice: `$${parseFloat(d.normalPrice).toFixed(2)}`,
      savings: String(Math.round(parseFloat(d.savings))),
      url: d.steamAppID ? `${siteUrl}/game/${d.steamAppID}` : `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
    }));

    const subs = await db()
      .select()
      .from(emailSubscriptions)
      .where(and(eq(emailSubscriptions.type, 'weekly_deals'), eq(emailSubscriptions.isActive, true)));

    let notified = 0;
    for (const sub of subs) {
      const [user] = await db().select().from(users).where(eq(users.id, sub.userId)).limit(1);
      if (!user) continue;

      const email = weeklyDealsEmail(deals);
      const sent = await sendEmail({ to: user.email, ...email });
      if (sent) notified++;
    }

    return NextResponse.json({ deals: deals.length, notified });
  } catch (err) {
    console.error('Cron weekly-digest error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
