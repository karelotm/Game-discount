/**
 * Store link configuration.
 *
 * Every known CheapShark store has a direct URL builder so deal links
 * always go straight to the store — no CheapShark redirect needed.
 *
 * For Steam (storeID 1), if we have a steamAppId we link to the exact
 * product page. For all other stores, we link to the game's store page.
 *
 * Affiliate links take priority when env vars are configured.
 */

function getEnv(key: string): string | undefined {
  return typeof window !== 'undefined'
    ? (process.env[key] as string | undefined)
    : process.env[key];
}

interface StoreConfig {
  affiliateUrl?: (title: string, steamAppId?: string | null) => string | null;
  directUrl: (title: string, steamAppId?: string | null) => string;
}

const STORE_CONFIG: Record<string, StoreConfig> = {
  // Steam (storeID 1) — exact product page when steamAppId is available
  '1': {
    directUrl: (_title, steamAppId) =>
      steamAppId
        ? `https://store.steampowered.com/app/${steamAppId}`
        : `https://store.steampowered.com/search/?term=${encodeURIComponent(_title)}`,
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
 * Get the best link for a deal.
 *
 * Currently uses CheapShark redirect for all deals.
 * Direct store / affiliate links are disabled for now.
 */
export function getAffiliateLink(
  dealID: string,
  _storeID?: string,
  _gameTitle?: string,
  _steamAppId?: string | null,
): string {
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
}

/**
 * Build a direct Steam store link.
 */
export function getSteamStoreLink(steamAppId: string | number): string {
  return `https://store.steampowered.com/app/${steamAppId}`;
}

/**
 * Track an outbound affiliate click via beacon (non-blocking).
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

export const AFFILIATE_STORE_IDS = new Set(['2', '3', '7', '11', '15']);

export function isAffiliateStore(storeID: string): boolean {
  return AFFILIATE_STORE_IDS.has(storeID);
}
