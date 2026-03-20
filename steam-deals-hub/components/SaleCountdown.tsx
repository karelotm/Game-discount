'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTimeRemaining } from '@/lib/utils';
import type { SaleEvent } from '@/lib/types';
import salesData from '@/data/steam-sales-calendar.json';

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-3xl font-bold text-white sm:text-4xl md:text-5xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

function Separator() {
  return <span className="font-mono text-2xl text-cyan/60 sm:text-3xl md:text-4xl">:</span>;
}

export default function SaleCountdown() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sales = salesData.sales as SaleEvent[];
  const currentSale = sales.find(
    (s) => new Date(s.startDate).getTime() <= now && new Date(s.endDate).getTime() > now
  );
  const nextSale = sales
    .filter((s) => new Date(s.startDate).getTime() > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const targetSale = currentSale || nextSale;
  if (!targetSale) return null;

  const isLive = !!currentSale;
  const targetDate = isLive ? targetSale.endDate : targetSale.startDate;
  const time = getTimeRemaining(targetDate);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-surface via-surface-light to-surface p-6 sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.08),transparent_60%)]" />

      <div className="relative z-10 text-center">
        {isLive ? (
          <h2 className="font-heading text-2xl font-bold text-magenta sm:text-3xl md:text-4xl">
            {targetSale.name.toUpperCase()} IS LIVE
          </h2>
        ) : (
          <h2 className="font-heading text-xl font-bold text-cyan sm:text-2xl md:text-3xl">
            Next: {targetSale.name}
          </h2>
        )}

        <p className="mt-2 text-sm text-muted">
          {isLive ? 'Ends in' : 'Starts in'}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 sm:gap-4">
          <TimeBlock value={time.days} label="Days" />
          <Separator />
          <TimeBlock value={time.hours} label="Hours" />
          <Separator />
          <TimeBlock value={time.minutes} label="Min" />
          <Separator />
          <TimeBlock value={time.seconds} label="Sec" />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/deals"
            className="rounded-lg bg-cyan px-6 py-2.5 text-sm font-bold text-background hover:bg-cyan-dark transition-colors glow-cyan"
          >
            Browse Deals →
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-semibold text-muted hover:text-white hover:border-white/20 transition-colors"
          >
            View Calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
