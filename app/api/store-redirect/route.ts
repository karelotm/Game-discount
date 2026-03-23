import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * In-memory cache: dealID → resolved store URL.
 * Entries expire after 24 hours (URLs don't change often).
 */
const cache = new Map<string, { url: string; ts: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24h

function getCached(dealID: string): string | null {
  const entry = cache.get(dealID);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(dealID);
    return null;
  }
  return entry.url;
}

/**
 * GET /api/store-redirect?dealID=xxx
 *
 * Follows CheapShark's redirect server-side to resolve the real store URL,
 * then 302-redirects the user's browser there.
 */
export async function GET(req: NextRequest) {
  const dealID = req.nextUrl.searchParams.get('dealID');
  if (!dealID) {
    return NextResponse.json({ error: 'dealID is required' }, { status: 400 });
  }

  // Check cache first
  const cached = getCached(dealID);
  if (cached) {
    return NextResponse.redirect(cached, 302);
  }

  try {
    // Follow the redirect chain manually to extract the final URL
    const res = await fetch(
      `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`,
      {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
        },
      },
    );

    // CheapShark returns a 301/302 with the real store URL in Location
    const location = res.headers.get('location');

    if (location && !location.includes('cheapshark.com')) {
      // Cache the resolved URL
      cache.set(dealID, { url: location, ts: Date.now() });

      // Keep cache from growing unbounded (max ~5000 entries)
      if (cache.size > 5000) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }

      return NextResponse.redirect(location, 302);
    }

    // If no redirect or it loops back to CheapShark, try following further
    // Some redirects go through multiple hops
    if (location) {
      const hop2 = await fetch(location, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
        },
      });

      const finalLocation = hop2.headers.get('location');
      if (finalLocation && !finalLocation.includes('cheapshark.com')) {
        cache.set(dealID, { url: finalLocation, ts: Date.now() });
        return NextResponse.redirect(finalLocation, 302);
      }
    }

    // Fallback: if server-side redirect also fails, return the CheapShark
    // redirect URL directly (user may still get through)
    console.error(`[store-redirect] Could not resolve dealID=${dealID}, location=${location}`);
    return NextResponse.redirect(
      `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`,
      302,
    );
  } catch (err) {
    console.error('[store-redirect] Error resolving redirect:', err);
    return NextResponse.redirect(
      `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`,
      302,
    );
  }
}
