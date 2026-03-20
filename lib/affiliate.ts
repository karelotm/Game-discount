const AFFILIATE_TAG = 'steamdealshub';

/**
 * Build a CheapShark affiliate redirect URL.
 * CheapShark's redirect endpoint forwards users to the store page,
 * earning commission through their affiliate partnerships.
 */
export function getAffiliateLink(dealID: string): string {
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}&tag=${AFFILIATE_TAG}`;
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
