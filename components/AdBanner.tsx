'use client';

import { useEffect, useRef } from 'react';

type AdSlot = 'banner-top' | 'sidebar' | 'in-feed' | 'banner-bottom';

interface AdBannerProps {
  slot: AdSlot;
  className?: string;
}

const SLOT_SIZES: Record<AdSlot, { width: number; height: number; label: string }> = {
  'banner-top': { width: 728, height: 90, label: 'Leaderboard' },
  'sidebar': { width: 300, height: 250, label: 'Medium Rectangle' },
  'in-feed': { width: 728, height: 90, label: 'In-Feed' },
  'banner-bottom': { width: 728, height: 90, label: 'Bottom Banner' },
};

/**
 * Ad banner placeholder that will load real ads once an ad provider is configured.
 *
 * To activate with Google AdSense:
 *   1. Add your AdSense script to layout.tsx <head>
 *   2. Replace the placeholder below with <ins className="adsbygoogle" ... />
 *   3. Set NEXT_PUBLIC_ADSENSE_PUB_ID in env vars
 *
 * To activate with Carbon Ads:
 *   1. Get a placement ID from carbonads.net
 *   2. Replace placeholder with their <script> embed
 */
export default function AdBanner({ slot, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const config = SLOT_SIZES[slot];
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  useEffect(() => {
    // When a real ad provider is configured, initialize ads here.
    // Example for AdSense:
    // if (pubId && window.adsbygoogle) {
    //   window.adsbygoogle.push({});
    // }
  }, [pubId]);

  return (
    <div
      ref={adRef}
      className={`flex items-center justify-center rounded-lg border border-white/5 bg-surface/50 text-muted text-xs overflow-hidden ${className}`}
      style={{ minHeight: config.height, maxWidth: config.width, width: '100%' }}
      data-ad-slot={slot}
    >
      {/* Placeholder — replaced by real ads once provider is configured */}
      {!pubId && (
        <span className="opacity-40 select-none">Ad Space — {config.label}</span>
      )}
    </div>
  );
}
