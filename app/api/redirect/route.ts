import { NextRequest, NextResponse } from 'next/server';
import { getDirectStoreLink } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';

/**
 * Server-side redirect resolver.
 *
 * Follows CheapShark's /redirect?dealID= to discover the real store URL,
 * then sends the user there via 302. If CheapShark returns a stale redirect
 * (homepage or error), falls back to a direct store search link.
 *
 * Usage: /api/redirect?dealID=xxx&storeID=1&title=Game+Name&steamAppId=12345
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dealID = searchParams.get('dealID');
  const storeID = searchParams.get('storeID') || undefined;
  const title = searchParams.get('title') || '';
  const steamAppId = searchParams.get('steamAppId') || undefined;

  if (!dealID) {
    return NextResponse.json({ error: 'dealID is required' }, { status: 400 });
  }

  // Log the click
  console.log('[redirect-click]', {
    dealID,
    storeID,
    title,
    ip: request.headers.get('x-forwarded-for') ?? 'unknown',
  });

  // Try resolving CheapShark's redirect to get the exact product page URL
  try {
    const cheapsharkUrl = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
    const res = await fetch(cheapsharkUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
      },
      signal: AbortSignal.timeout(5000),
    });

    const resolvedUrl = res.url;

    // Check if CheapShark resolved to a real product page
    // Bad signs: landing on CheapShark itself, or a store homepage with no path
    const isCheapSharkHomepage =
      resolvedUrl.includes('cheapshark.com') &&
      !resolvedUrl.includes('redirect');
    const parsed = new URL(resolvedUrl);
    const isStoreHomepage = parsed.pathname === '/' && !parsed.search;

    if (res.ok && !isCheapSharkHomepage && !isStoreHomepage) {
      return NextResponse.redirect(resolvedUrl, 302);
    }
  } catch (err) {
    console.error('[redirect] CheapShark resolve failed:', err);
  }

  // Fallback: direct store link (search page with game title)
  const fallback = getDirectStoreLink(storeID, title, steamAppId);
  return NextResponse.redirect(fallback, 302);
}
