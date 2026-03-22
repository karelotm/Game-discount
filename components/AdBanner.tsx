'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

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

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Google AdSense ad banner.
 *
 * Setup:
 *   1. Set NEXT_PUBLIC_ADSENSE_PUB_ID (e.g. "pub-1234567890123456")
 *   2. AdSense "Auto ads" is enabled → Google picks the best placements.
 *      OR create manual ad units in AdSense and set NEXT_PUBLIC_AD_SLOT_* env vars.
 *
 * The component uses `usePathname()` as a React key so the <ins> element
 * re-mounts on every client-side navigation, which re-triggers adsbygoogle.push().
 */
export default function AdBanner({ slot, className = '' }: AdBannerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const pushed = useRef(false);
  const pathname = usePathname();

  // Normalise publisher ID — accept both "pub-xxx" and raw "xxx"
  const rawPubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || '';
  const adClient = rawPubId.startsWith('ca-') ? rawPubId : rawPubId ? `ca-${rawPubId}` : '';

  // Optional per-slot ad unit IDs from AdSense dashboard.
  // If not set, we rely on Auto Ads to fill the <ins> element.
  const slotEnvMap: Record<AdSlot, string | undefined> = {
    'banner-top': process.env.NEXT_PUBLIC_AD_SLOT_BANNER_TOP,
    'sidebar': process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR,
    'in-feed': process.env.NEXT_PUBLIC_AD_SLOT_IN_FEED,
    'banner-bottom': process.env.NEXT_PUBLIC_AD_SLOT_BANNER_BOTTOM,
  };
  const adSlotId = slotEnvMap[slot] || '';

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Push ad on mount (and on route change via key)
  useEffect(() => {
    if (!adClient || pushed.current) return;

    const tryPush = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense script may not be loaded yet
      }
    };

    // Small delay to ensure the <ins> is in DOM and script is loaded
    const timer = setTimeout(tryPush, 100);
    return () => clearTimeout(timer);
  }, [adClient, pathname]);

  const config = isMobile ? SLOT_SIZES[slot].mobile : SLOT_SIZES[slot].desktop;

  // No publisher ID → show placeholder
  if (!adClient) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-white/5 bg-surface/50 text-muted text-xs overflow-hidden ${className}`}
        style={{ minHeight: config.height, maxWidth: config.width, width: '100%' }}
      >
        <span className="opacity-40 select-none">Ad Space — {config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: config.height, maxWidth: config.width, width: '100%' }}
    >
      <ins
        key={`${slot}-${pathname}`}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: config.height }}
        data-ad-client={adClient}
        {...(adSlotId ? { 'data-ad-slot': adSlotId } : {})}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
