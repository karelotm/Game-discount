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

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({ slot, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pushed = useRef(false);
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
    if (pubId && !pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense may not be loaded yet or blocker is active
      }
    }
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
      {pubId ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: config.height }}
          data-ad-client={`ca-${pubId}`}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <span className="opacity-40 select-none">Ad Space — {config.label}</span>
      )}
    </div>
  );
}
