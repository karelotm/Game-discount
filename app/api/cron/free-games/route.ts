import { NextRequest, NextResponse } from 'next/server';
import { db, emailSubscriptions, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { sendEmail, freeGameEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const CS_HEADERS = {
  'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
  'Accept': 'application/json',
};

/**
 * GET /api/cron/free-games
 * Called by Vercel Cron daily at 8 AM.
 * Checks for free games and notifies subscribers.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch free games from CheapShark
    const res = await fetch(
      'https://www.cheapshark.com/api/1.0/deals?upperPrice=0&pageSize=20&sortBy=Deal+Rating&onSale=1',
      { headers: CS_HEADERS },
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'CheapShark failed' }, { status: 502 });
    }

    const deals = await res.json();
    if (!Array.isArray(deals) || deals.length === 0) {
      return NextResponse.json({ message: 'No free games found', notified: 0 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const games = deals.slice(0, 10).map((d: { title: string; steamAppID?: string; dealID: string }) => ({
      title: d.title,
      url: d.steamAppID ? `${siteUrl}/game/${d.steamAppID}` : `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
    }));

    // Get subscribers
    const subs = await db()
      .select()
      .from(emailSubscriptions)
      .where(and(eq(emailSubscriptions.type, 'free_games'), eq(emailSubscriptions.isActive, true)));

    let notified = 0;
    for (const sub of subs) {
      const [user] = await db().select().from(users).where(eq(users.id, sub.userId)).limit(1);
      if (!user) continue;

      const email = freeGameEmail(games);
      const sent = await sendEmail({ to: user.email, ...email });
      if (sent) notified++;
    }

    return NextResponse.json({ freeGames: games.length, notified });
  } catch (err) {
    console.error('Cron free-games error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
