/**
 * Build a CheapShark affiliate redirect URL.
 * CheapShark's redirect endpoint forwards users to the store page.
 *
 * Set NEXT_PUBLIC_CHEAPSHARK_TAG in your .env to append your registered
 * affiliate tag (e.g. &tag=yourtag). Without a registered tag, the redirect
 * still works — you just don't get affiliate tracking credit.
 *
 * To register a tag, contact CheapShark via their API docs or support page.
 */
export function getAffiliateLink(dealID: string): string {
  const tag = process.env.NEXT_PUBLIC_CHEAPSHARK_TAG;
  const base = `https://www.cheapshark.com/redirect?dealID=${dealID}`;
  return tag ? `${base}&tag=${tag}` : base;
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
