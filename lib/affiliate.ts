/**
 * Store affiliate & direct link configuration.
 *
 * Link priority:
 * 1. Direct store affiliate link (if env var is configured for that store)
 * 2. Direct store link (search by game title — always works, no stale dealIDs)
 * 3. CheapShark redirect (absolute last resort)
 *
 * CheapShark's /redirect?dealID= is unreliable — stale deal IDs redirect to
 * CheapShark's homepage instead of the store. We now build direct store URLs
 * for every known store so links always land on the right page.
 */

function getEnv(key: string): string | undefined {
  return typeof window !== 'undefined'
    ? (process.env[key] as string | undefined)
    : process.env[key];
}

interface StoreConfig {
  /** Build an affiliate link (returns null if env var not set) */
  affiliateUrl?: (title: string, steamAppId?: string | null) => string | null;
  /** Build a direct store link (always works, no affiliate commission) */
  directUrl: (title: string, steamAppId?: string | null) => string;
}

/**
 * Direct store links & affiliate builders, keyed by CheapShark storeID.
 * Every store has a directUrl so we never need CheapShark's redirect.
 */
const STORE_CONFIG: Record<string, StoreConfig> = {
  // Steam (storeID 1)
  '1': {
    directUrl: (title, steamAppId) =>
      steamAppId
        ? `https://store.steampowered.com/app/${steamAppId}`
        : `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`,
  },

  // GamersGate (storeID 2)
  '2': {
    affiliateUrl: (title) => {
      const ref = getEnv('NEXT_PUBLIC_GAMERSGATE_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.gamersgate.com/games/?query=${encodeURIComponent(title)}&aff=${encodeURIComponent(ref)}`;
    },
    directUrl: (title) =>
      `https://www.gamersgate.com/games/?query=${encodeURIComponent(title)}`,
  },

  // GreenManGaming (storeID 3)
  '3': {
    affiliateUrl: (title) => {
      const ref = getEnv('NEXT_PUBLIC_GMG_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.greenmangaming.com/search/?query=${encodeURIComponent(title)}&tap_a=${encodeURIComponent(ref)}`;
    },
    directUrl: (title) =>
      `https://www.greenmangaming.com/search/?query=${encodeURIComponent(title)}`,
  },

  // GOG (storeID 7)
  '7': {
    affiliateUrl: (title) => {
      const ref = getEnv('NEXT_PUBLIC_GOG_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.gog.com/games?query=${encodeURIComponent(title)}&pp=${encodeURIComponent(ref)}`;
    },
    directUrl: (title) =>
      `https://www.gog.com/games?query=${encodeURIComponent(title)}`,
  },

  // Origin / EA App (storeID 8)
  '8': {
    directUrl: (title) =>
      `https://www.ea.com/games/library?search=${encodeURIComponent(title)}`,
  },

  // Humble Store (storeID 11)
  '11': {
    affiliateUrl: (title) => {
      const partner = getEnv('NEXT_PUBLIC_HUMBLE_PARTNER_ID');
      if (!partner) return null;
      return `https://www.humblebundle.com/store/search?search=${encodeURIComponent(title)}&partner=${encodeURIComponent(partner)}`;
    },
    directUrl: (title) =>
      `https://www.humblebundle.com/store/search?search=${encodeURIComponent(title)}`,
  },

  // Ubisoft (storeID 13)
  '13': {
    directUrl: (title) =>
      `https://store.ubisoft.com/search/?q=${encodeURIComponent(title)}`,
  },

  // Fanatical (storeID 15)
  '15': {
    affiliateUrl: (title) => {
      const ref = getEnv('NEXT_PUBLIC_FANATICAL_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.fanatical.com/en/search?search=${encodeURIComponent(title)}&ref=${encodeURIComponent(ref)}`;
    },
    directUrl: (title) =>
      `https://www.fanatical.com/en/search?search=${encodeURIComponent(title)}`,
  },

  // WinGameStore (storeID 21)
  '21': {
    directUrl: (title) =>
      `https://www.wingamestore.com/search/?SearchWord=${encodeURIComponent(title)}`,
  },

  // GameBillet (storeID 23)
  '23': {
    directUrl: (title) =>
      `https://www.gamebillet.com/AllProducts?search=${encodeURIComponent(title)}`,
  },

  // Voidu (storeID 24)
  '24': {
    directUrl: (title) =>
      `https://www.voidu.com/search/?search=${encodeURIComponent(title)}`,
  },

  // Epic Games Store (storeID 25)
  '25': {
    directUrl: (title) =>
      `https://store.epicgames.com/browse?q=${encodeURIComponent(title)}&sortBy=relevancy`,
  },

  // Games Planet (storeID 27)
  '27': {
    directUrl: (title) =>
      `https://us.gamesplanet.com/search?query=${encodeURIComponent(title)}`,
  },

  // 2Game (storeID 29)
  '29': {
    directUrl: (title) =>
      `https://2game.com/search?q=${encodeURIComponent(title)}`,
  },

  // IndieGala (storeID 30)
  '30': {
    directUrl: (title) =>
      `https://www.indiegala.com/search?q=${encodeURIComponent(title)}`,
  },

  // DLGamer (storeID 33)
  '33': {
    directUrl: (title) =>
      `https://www.dlgamer.com/us/search?keywords=${encodeURIComponent(title)}`,
  },

  // Noctre (storeID 34)
  '34': {
    directUrl: (title) =>
      `https://www.noctre.com/search?q=${encodeURIComponent(title)}`,
  },

  // DreamGame (storeID 35)
  '35': {
    directUrl: (title) =>
      `https://www.dreamgame.com/search?q=${encodeURIComponent(title)}`,
  },
};

/**
 * Get the direct store search/fallback link for a store.
 * Used by /api/redirect as fallback when CheapShark redirect fails.
 */
export function getDirectStoreLink(
  storeID?: string,
  gameTitle?: string,
  steamAppId?: string | null,
): string {
  const title = gameTitle || '';
  const config = storeID ? STORE_CONFIG[storeID] : undefined;

  if (config) {
    // Try affiliate link first
    if (config.affiliateUrl) {
      const affiliateLink = config.affiliateUrl(title, steamAppId);
      if (affiliateLink) return affiliateLink;
    }
    return config.directUrl(title, steamAppId);
  }

  // Unknown store — Steam search as generic fallback
  return `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`;
}

/**
 * Get the best link for a deal.
 *
 * For Steam deals with a known steamAppId, links directly to the store page.
 * For everything else, routes through /api/redirect which resolves the
 * CheapShark redirect server-side to get the exact product page URL.
 * If CheapShark fails, /api/redirect falls back to a direct store search link.
 */
export function getAffiliateLink(
  dealID: string,
  storeID?: string,
  gameTitle?: string,
  steamAppId?: string | null,
): string {
  // Steam deals with a known app ID → link directly (no redirect needed)
  if (storeID === '1' && steamAppId) {
    return `https://store.steampowered.com/app/${steamAppId}`;
  }

  // All other deals → route through our redirect proxy which resolves
  // CheapShark's redirect server-side to get the exact product page
  const params = new URLSearchParams({ dealID });
  if (storeID) params.set('storeID', storeID);
  if (gameTitle) params.set('title', gameTitle);
  if (steamAppId) params.set('steamAppId', steamAppId);

  return `/api/redirect?${params.toString()}`;
}

/**
 * Build a direct Steam store link (no affiliate — Steam doesn't offer one).
 */
export function getSteamStoreLink(steamAppId: string | number): string {
  return `https://store.steampowered.com/app/${steamAppId}`;
}

/**
 * Track an outbound affiliate click by firing a beacon to our API route.
 * Non-blocking — failures are silently ignored so UX is never affected.
 */
export function trackClick(dealID: string, storeName: string) {
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/track-click',
      JSON.stringify({ dealID, storeName, timestamp: Date.now() }),
    );
  }
}

/**
 * Check whether any direct store affiliate IDs are configured.
 * Useful for showing an "affiliate earnings active" indicator in dev.
 */
export function hasDirectAffiliates(): boolean {
  return !!(
    getEnv('NEXT_PUBLIC_FANATICAL_AFFILIATE_ID') ||
    getEnv('NEXT_PUBLIC_GOG_AFFILIATE_ID') ||
    getEnv('NEXT_PUBLIC_HUMBLE_PARTNER_ID') ||
    getEnv('NEXT_PUBLIC_GMG_AFFILIATE_ID') ||
    getEnv('NEXT_PUBLIC_GAMERSGATE_AFFILIATE_ID')
  );
}

/**
 * Store IDs that have affiliate programs (commission-paying).
 * These stores earn revenue when users purchase through our links.
 */
export const AFFILIATE_STORE_IDS = new Set(['3', '7', '11', '15', '23']);

/**
 * Check if a store pays affiliate commission.
 */
export function isAffiliateStore(storeID: string): boolean {
  return AFFILIATE_STORE_IDS.has(storeID);
}
