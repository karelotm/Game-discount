'use client';

import { useEffect, useRef, useState } from 'react';

type AdSlot = 'banner-top' | 'sidebar' | 'in-feed' | 'banner-bottom';

interface AdBannerProps {
  slot: AdSlot;
  className?: string;
}

interface AdSize {
  width: number;
  height: number;
  label: string;
}

// Desktop and mobile sizes per slot following standard IAB ad formats
const SLOT_SIZES: Record<AdSlot, { desktop: AdSize; mobile: AdSize }> = {
  'banner-top': {
    desktop: { width: 728, height: 90, label: 'Leaderboard' },
    mobile: { width: 320, height: 50, label: 'Mobile Banner' },
  },
  'sidebar': {
    desktop: { width: 300, height: 250, label: 'Medium Rectangle' },
    mobile: { width: 300, height: 250, label: 'Medium Rectangle' },
  },
  'in-feed': {
    desktop: { width: 728, height: 90, label: 'In-Feed' },
    mobile: { width: 320, height: 100, label: 'Mobile In-Feed' },
  },
  'banner-bottom': {
    desktop: { width: 728, height: 90, label: 'Bottom Banner' },
    mobile: { width: 320, height: 50, label: 'Mobile Banner' },
  },
};

const MOBILE_BREAKPOINT = 768;

/**
 * Responsive ad banner placeholder that adapts to mobile and desktop viewports.
 * Loads real ads once an ad provider is configured.
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
  const [isMobile, setIsMobile] = useState(false);
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // When a real ad provider is configured, initialize ads here.
    // Example for AdSense:
    // if (pubId && window.adsbygoogle) {
    //   window.adsbygoogle.push({});
    // }
  }, [pubId]);

  const config = isMobile ? SLOT_SIZES[slot].mobile : SLOT_SIZES[slot].desktop;

  return (
    <div
      ref={adRef}
      className={`flex items-center justify-center rounded-lg border border-white/5 bg-surface/50 text-muted text-xs overflow-hidden ${className}`}
      style={{ minHeight: config.height, maxWidth: config.width, width: '100%' }}
      data-ad-slot={slot}
      data-ad-format={isMobile ? 'mobile' : 'desktop'}
    >
      {/* Placeholder — replaced by real ads once provider is configured */}
      {!pubId && (
        <span className="opacity-40 select-none">Ad Space — {config.label}</span>
      )}
    </div>
  );
}
