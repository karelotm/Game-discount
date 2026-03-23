/**
 * Store affiliate configuration.
 *
 * Each store that has a real affiliate program gets a direct link builder.
 * Set the corresponding NEXT_PUBLIC_*_AFFILIATE_ID env var to activate.
 * Without a configured ID, we fall back to the CheapShark redirect
 * (which doesn't pay commission but still works as a link).
 *
 * Supported stores & their programs:
 *   - Fanatical         → up to 5%, 30-day cookie
 *   - Green Man Gaming  → up to 5%, 30-day cookie
 *   - Humble Store      → ~5-10%, 30-day cookie
 *   - GOG               → ~5%, 30-day cookie
 *   - Kinguin           → 5-10%, 90-day cookie
 *   - GamersGate        → ~5%, 30-day cookie
 *
 * Steam itself has no affiliate program, so Steam links are always direct.
 */

/** CheapShark storeID → config */
interface StoreAffiliateConfig {
  /** Base URL for the store's affiliate link */
  buildUrl: (gameTitle: string, steamAppId?: string | null) => string | null;
}

function getEnv(key: string): string | undefined {
  return typeof window !== 'undefined'
    ? (process.env[key] as string | undefined)
    : process.env[key];
}

/**
 * Store affiliate link builders, keyed by CheapShark storeID.
 * Returns null when the env var for that store isn't set.
 */
const STORE_AFFILIATES: Record<string, StoreAffiliateConfig> = {
  // Fanatical (storeID 15)
  '15': {
    buildUrl: (_title, steamAppId) => {
      const ref = getEnv('NEXT_PUBLIC_FANATICAL_AFFILIATE_ID');
      if (!ref) return null;
      // Fanatical uses a ref param for affiliates
      const base = steamAppId
        ? `https://www.fanatical.com/en/search?search=${encodeURIComponent(steamAppId)}`
        : `https://www.fanatical.com`;
      return `${base}&ref=${encodeURIComponent(ref)}`;
    },
  },

  // Green Man Gaming (storeID 3 in some mappings, but CheapShark uses 23 for GMG — let's map it)
  '3': {
    buildUrl: () => {
      // GamersGate — storeID 3 in CheapShark is actually GamersGate
      const ref = getEnv('NEXT_PUBLIC_GAMERSGATE_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.gamersgate.com/?aff=${encodeURIComponent(ref)}`;
    },
  },

  // GOG (storeID 7)
  '7': {
    buildUrl: (_title, steamAppId) => {
      const ref = getEnv('NEXT_PUBLIC_GOG_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.gog.com/?pp=${encodeURIComponent(ref)}`;
    },
  },

  // Humble Store (storeID 11)
  '11': {
    buildUrl: () => {
      const partner = getEnv('NEXT_PUBLIC_HUMBLE_PARTNER_ID');
      if (!partner) return null;
      return `https://www.humblebundle.com/store?partner=${encodeURIComponent(partner)}`;
    },
  },

  // Green Man Gaming (storeID — CheapShark maps GMG differently, but commonly it's storeID 23 or varies)
  // We'll add a safe mapping. In CheapShark docs, GMG is not always present; adding as an entry:
  '23': {
    buildUrl: () => {
      const ref = getEnv('NEXT_PUBLIC_GMG_AFFILIATE_ID');
      if (!ref) return null;
      return `https://www.greenmangaming.com/?tap_a=${encodeURIComponent(ref)}`;
    },
  },
};

/**
 * Get the best link for a deal.
 *
 * Priority:
 * 1. Direct store affiliate link (if env var configured for that store)
 * 2. Direct Steam store link (storeID=1 + steamAppId available)
 * 3. CheapShark redirect (last resort — unreliable for expired dealIDs)
 */
export function getAffiliateLink(
  dealID: string,
  storeID?: string,
  gameTitle?: string,
  steamAppId?: string | null,
): string {
  // Try direct store affiliate first
  if (storeID && STORE_AFFILIATES[storeID]) {
    const directUrl = STORE_AFFILIATES[storeID].buildUrl(gameTitle || '', steamAppId);
    if (directUrl) return directUrl;
  }

  // For Steam deals, link directly to the Steam store page.
  // CheapShark redirect often fails (expired dealIDs → cheapshark.com homepage).
  if (storeID === '1' && steamAppId) {
    return `https://store.steampowered.com/app/${steamAppId}`;
  }

  // Fallback: CheapShark redirect (may redirect to homepage if dealID is stale)
  const tag = getEnv('NEXT_PUBLIC_CHEAPSHARK_TAG');
  const base = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
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
