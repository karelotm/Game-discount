/**
 * Deal links go through /api/store-redirect which resolves the real
 * store URL server-side by following CheapShark's redirect chain.
 *
 * For Steam deals where we have the steamAppId, we link directly
 * to the Steam product page (no redirect needed).
 */

/**
 * Get the link for a deal. Steam deals with a known appId go direct,
 * everything else goes through our server-side redirect resolver.
 */
export function getAffiliateLink(
  dealID: string,
  storeID?: string,
  _gameTitle?: string,
  steamAppId?: string | null,
): string {
  // Steam (storeID 1) with known appId → direct link
  if (storeID === '1' && steamAppId) {
    return `https://store.steampowered.com/app/${steamAppId}`;
  }

  // All other stores → resolve via our backend proxy
  // dealID from CheapShark is already URL-safe (base64 with %2B etc.) — don't double-encode
  return `/api/store-redirect?dealID=${dealID}`;
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
