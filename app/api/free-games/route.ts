import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CS_HEADERS = {
  'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
  'Accept': 'application/json',
};

/**
 * GET /api/free-games
 * Fetches currently free games from CheapShark (upperPrice=0).
 */
export async function GET() {
  try {
    // CheapShark: free games (price = $0)
    const params = new URLSearchParams({
      upperPrice: '0',
      pageSize: '40',
      sortBy: 'Deal Rating',
      onSale: '1',
    });

    const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?${params}`, { headers: CS_HEADERS });
    if (!res.ok) {
      return NextResponse.json({ error: `CheapShark returned ${res.status}` }, { status: 502 });
    }

    const deals = await res.json();

    // Also try to get Steam featured free games
    let steamFree: unknown[] = [];
    try {
      const steamRes = await fetch(
        `https://store.steampowered.com/api/featuredcategories/?cc=${process.env.STEAM_COUNTRY_CODE || 'us'}`,
        { headers: CS_HEADERS },
      );
      if (steamRes.ok) {
        const steamData = await steamRes.json();
        // Extract games with final_price = 0 from specials
        if (steamData.specials?.items) {
          steamFree = steamData.specials.items.filter(
            (item: { final_price: number; discounted: boolean }) => item.final_price === 0 && item.discounted,
          );
        }
      }
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      cheapshark: Array.isArray(deals) ? deals : [],
      steam: steamFree,
    });
  } catch (err) {
    console.error('Free games fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch free games' }, { status: 500 });
  }
}
