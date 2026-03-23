/**
 * All outbound deal links use CheapShark's redirect endpoint.
 * CheapShark already knows the exact store page URL for every deal,
 * so we just pass the dealID and it redirects to the correct page.
 */

/**
 * Get the store link for a deal via CheapShark's redirect.
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
