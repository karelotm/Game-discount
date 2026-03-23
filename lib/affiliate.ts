/**
 * Direct store links built from storeID + game title / steamAppId.
 *
 * CheapShark's redirect endpoint loops through Cloudflare and fails,
 * so we build direct URLs to each store's product or search page.
 */

const STORE_URLS: Record<string, (title: string, steamAppId?: string | null) => string> = {
  '1': (_t, id) => id ? `https://store.steampowered.com/app/${id}` : `https://store.steampowered.com/search/?term=${enc(_t)}`,
  '2': (t) => `https://www.gamersgate.com/games/?query=${enc(t)}`,
  '3': (t) => `https://www.greenmangaming.com/search/?query=${enc(t)}`,
  '7': (t) => `https://www.gog.com/games?query=${enc(t)}`,
  '8': (t) => `https://www.ea.com/games/library?search=${enc(t)}`,
  '11': (t) => `https://www.humblebundle.com/store/search?search=${enc(t)}`,
  '13': (t) => `https://store.ubisoft.com/search/?q=${enc(t)}`,
  '15': (t) => `https://www.fanatical.com/en/search?search=${enc(t)}`,
  '21': (t) => `https://www.wingamestore.com/search/?SearchWord=${enc(t)}`,
  '23': (t) => `https://www.gamebillet.com/AllProducts?search=${enc(t)}`,
  '24': (t) => `https://www.voidu.com/search/?search=${enc(t)}`,
  '25': (t) => `https://store.epicgames.com/browse?q=${enc(t)}&sortBy=relevancy`,
  '27': (t) => `https://us.gamesplanet.com/search?query=${enc(t)}`,
  '29': (t) => `https://2game.com/search?q=${enc(t)}`,
  '30': (t) => `https://www.indiegala.com/search?q=${enc(t)}`,
  '33': (t) => `https://www.dlgamer.com/us/search?keywords=${enc(t)}`,
  '34': (t) => `https://www.noctre.com/search?q=${enc(t)}`,
  '35': (t) => `https://www.dreamgame.com/search?q=${enc(t)}`,
};

function enc(s: string): string {
  return encodeURIComponent(s);
}

/**
 * Get a direct store link for a deal.
 */
export function getAffiliateLink(
  _dealID: string,
  storeID?: string,
  gameTitle?: string,
  steamAppId?: string | null,
): string {
  const title = gameTitle || '';
  const builder = storeID ? STORE_URLS[storeID] : undefined;
  if (builder) return builder(title, steamAppId);
  return `https://store.steampowered.com/search/?term=${enc(title)}`;
}

/**
 * Track an outbound click via beacon (non-blocking).
 */
export function trackClick(dealID: string, storeName: string) {
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/track-click',
      JSON.stringify({ dealID, storeName, timestamp: Date.now() }),
    );
  }
}

export const AFFILIATE_STORE_IDS = new Set(['2', '3', '7', '11', '15']);

export function isAffiliateStore(storeID: string): boolean {
  return AFFILIATE_STORE_IDS.has(storeID);
}
