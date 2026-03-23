import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * In-memory cache: dealID → resolved store URL.
 * Entries expire after 24 hours.
 */
const cache = new Map<string, { url: string; ts: number }>();
const TTL = 24 * 60 * 60 * 1000;

function getCached(dealID: string): string | null {
  const entry = cache.get(dealID);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(dealID);
    return null;
  }
  return entry.url;
}

function setCache(dealID: string, url: string) {
  cache.set(dealID, { url, ts: Date.now() });
  // Evict oldest if cache grows too large
  if (cache.size > 5000) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

/**
 * Map store name (from CheapShark og:title) → direct URL builder.
 * CheapShark's redirect HTML gives us "Game Title at Store Name" in og:title.
 * We parse that and build a direct link to the store's search/product page.
 */
const STORE_URL_BUILDERS: Record<string, (title: string) => string> = {
  'steam': (t) => `https://store.steampowered.com/search/?term=${enc(t)}`,
  'gamersgate': (t) => `https://www.gamersgate.com/games/?query=${enc(t)}`,
  'greenmangaming': (t) => `https://www.greenmangaming.com/search/?query=${enc(t)}`,
  'green man gaming': (t) => `https://www.greenmangaming.com/search/?query=${enc(t)}`,
  'gog': (t) => `https://www.gog.com/games?query=${enc(t)}`,
  'gog.com': (t) => `https://www.gog.com/games?query=${enc(t)}`,
  'origin': (t) => `https://www.ea.com/games/library?search=${enc(t)}`,
  'ea app': (t) => `https://www.ea.com/games/library?search=${enc(t)}`,
  'humble store': (t) => `https://www.humblebundle.com/store/search?search=${enc(t)}`,
  'humble bundle': (t) => `https://www.humblebundle.com/store/search?search=${enc(t)}`,
  'ubisoft': (t) => `https://store.ubisoft.com/search/?q=${enc(t)}`,
  'uplay': (t) => `https://store.ubisoft.com/search/?q=${enc(t)}`,
  'fanatical': (t) => `https://www.fanatical.com/en/search?search=${enc(t)}`,
  'wingamestore': (t) => `https://www.wingamestore.com/search/?SearchWord=${enc(t)}`,
  'gamebillet': (t) => `https://www.gamebillet.com/AllProducts?search=${enc(t)}`,
  'voidu': (t) => `https://www.voidu.com/search/?search=${enc(t)}`,
  'epic games store': (t) => `https://store.epicgames.com/browse?q=${enc(t)}&sortBy=relevancy`,
  'epic': (t) => `https://store.epicgames.com/browse?q=${enc(t)}&sortBy=relevancy`,
  'gamesplanet': (t) => `https://us.gamesplanet.com/search?query=${enc(t)}`,
  'games planet': (t) => `https://us.gamesplanet.com/search?query=${enc(t)}`,
  '2game': (t) => `https://2game.com/search?q=${enc(t)}`,
  'indiegala': (t) => `https://www.indiegala.com/search?q=${enc(t)}`,
  'dlgamer': (t) => `https://www.dlgamer.com/us/search?keywords=${enc(t)}`,
  'noctre': (t) => `https://www.noctre.com/search?q=${enc(t)}`,
  'dreamgame': (t) => `https://www.dreamgame.com/search?q=${enc(t)}`,
  'blizzard': (t) => `https://shop.blizzard.com/search?q=${enc(t)}`,
  'blizzard shop': (t) => `https://shop.blizzard.com/search?q=${enc(t)}`,
};

function enc(s: string): string {
  return encodeURIComponent(s);
}

/**
 * Parse CheapShark's redirect HTML to extract game title and store name
 * from the og:title meta tag: "Game Title at Store Name"
 */
function parseRedirectHtml(html: string): { gameTitle: string; storeName: string } | null {
  // Match: <meta property="og:title" content="Game Title at Store Name" />
  const match = html.match(/<meta\s+property="og:title"\s+content="(.+?)"\s*\/?>/i);
  if (!match) return null;

  const ogTitle = match[1];
  // Split on " at " from the right (game title might contain " at ")
  const lastAt = ogTitle.lastIndexOf(' at ');
  if (lastAt === -1) return null;

  return {
    gameTitle: ogTitle.substring(0, lastAt).trim(),
    storeName: ogTitle.substring(lastAt + 4).trim(),
  };
}

function buildStoreUrl(gameTitle: string, storeName: string): string {
  const key = storeName.toLowerCase();
  const builder = STORE_URL_BUILDERS[key];
  if (builder) return builder(gameTitle);

  // Fuzzy match: check if any known store name is contained in the parsed name
  for (const [storeKey, storeBuilder] of Object.entries(STORE_URL_BUILDERS)) {
    if (key.includes(storeKey) || storeKey.includes(key)) {
      return storeBuilder(gameTitle);
    }
  }

  // Ultimate fallback: Steam search
  return `https://store.steampowered.com/search/?term=${enc(gameTitle)}`;
}

/**
 * Look up the steamAppID for a deal via CheapShark's deal detail API.
 */
async function fetchSteamAppId(dealID: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.cheapshark.com/api/1.0/deals?id=${encodeURIComponent(dealID)}`,
      { headers: { 'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.gameInfo?.steamAppID || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/store-redirect?dealID=xxx
 *
 * Fetches CheapShark's redirect page server-side, parses the og:title
 * to get the game title + store name, then redirects the user to a
 * direct store search URL.
 */
export async function GET(req: NextRequest) {
  const dealID = req.nextUrl.searchParams.get('dealID');
  if (!dealID) {
    return NextResponse.json({ error: 'dealID is required' }, { status: 400 });
  }

  // Check cache
  const cached = getCached(dealID);
  if (cached) {
    return NextResponse.redirect(cached, 302);
  }

  try {
    const res = await fetch(
      `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`,
      {
        headers: { 'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)' },
      },
    );

    if (!res.ok) {
      console.error(`[store-redirect] CheapShark returned ${res.status} for dealID=${dealID}`);
      return NextResponse.json({ error: 'Failed to resolve deal' }, { status: 502 });
    }

    const html = await res.text();
    const parsed = parseRedirectHtml(html);

    if (!parsed) {
      console.error(`[store-redirect] Could not parse og:title for dealID=${dealID}`);
      return NextResponse.json({ error: 'Could not resolve store URL' }, { status: 502 });
    }

    let url: string;

    // For Steam deals, try to get the exact product page via steamAppID
    if (parsed.storeName.toLowerCase() === 'steam') {
      const steamAppID = await fetchSteamAppId(dealID);
      if (steamAppID) {
        url = `https://store.steampowered.com/app/${steamAppID}`;
      } else {
        url = buildStoreUrl(parsed.gameTitle, parsed.storeName);
      }
    } else {
      url = buildStoreUrl(parsed.gameTitle, parsed.storeName);
    }

    setCache(dealID, url);

    return NextResponse.redirect(url, 302);
  } catch (err) {
    console.error('[store-redirect] Error:', err);
    return NextResponse.json({ error: 'Internal error resolving deal' }, { status: 500 });
  }
}
