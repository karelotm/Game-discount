import { NextRequest, NextResponse } from 'next/server';
import { db, gameGenres } from '@/lib/db';
import { inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const STEAM_HEADERS = {
  'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
  'Accept': 'application/json',
};

/**
 * GET /api/genres?steamAppIds=123,456,789
 * Returns cached genre data for given Steam app IDs.
 * Any missing entries are fetched from Steam API and cached.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('steamAppIds');

  if (!idsParam) {
    return NextResponse.json({ error: 'steamAppIds required' }, { status: 400 });
  }

  const ids = idsParam.split(',').filter(Boolean).slice(0, 50); // cap at 50
  if (ids.length === 0) {
    return NextResponse.json({});
  }

  try {
    // Check cache first
    const cached = await db().select().from(gameGenres).where(inArray(gameGenres.steamAppId, ids));
    const result: Record<string, string[]> = {};
    const cachedIds = new Set<string>();

    for (const row of cached) {
      result[row.steamAppId] = row.genres;
      cachedIds.add(row.steamAppId);
    }

    // Fetch missing from Steam (max 5 at a time to respect rate limits)
    const missing = ids.filter((id) => !cachedIds.has(id));
    const toFetch = missing.slice(0, 5); // only fetch 5 per request

    for (const appId of toFetch) {
      try {
        const res = await fetch(
          `https://store.steampowered.com/api/appdetails/?appids=${appId}&cc=${process.env.STEAM_COUNTRY_CODE || 'us'}`,
          { headers: STEAM_HEADERS },
        );
        if (res.ok) {
          const json = await res.json();
          const data = json[appId];
          if (data?.success && data.data?.genres) {
            const genres = data.data.genres.map((g: { description: string }) => g.description);
            result[appId] = genres;
            // Cache it
            await db().insert(gameGenres).values({
              steamAppId: appId,
              genres,
            }).onConflictDoUpdate({
              target: gameGenres.steamAppId,
              set: { genres, cachedAt: new Date() },
            });
          }
        }
      } catch {
        // Skip this one — will be fetched next time
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Genres fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
