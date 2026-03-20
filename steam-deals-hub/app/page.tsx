'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Award, Flame } from 'lucide-react';
import SaleCountdown from '@/components/SaleCountdown';
import DealsGrid from '@/components/DealsGrid';
import type { CheapSharkDeal } from '@/lib/types';
import Link from 'next/link';

export default function HomePage() {
  const [topDeals, setTopDeals] = useState<CheapSharkDeal[]>([]);
  const [topRated, setTopRated] = useState<CheapSharkDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dealsRes, ratedRes] = await Promise.all([
          fetch('/api/deals?sortBy=Deal+Rating&pageSize=8&storeID=1'),
          fetch('/api/deals?sortBy=Metacritic&metacritic=75&pageSize=8&storeID=1'),
        ]);
        const [deals, rated] = await Promise.all([dealsRes.json(), ratedRes.json()]);
        setTopDeals(Array.isArray(deals) ? deals : []);
        setTopRated(Array.isArray(rated) ? rated : []);
      } catch {
        // Silently fail — grids will show empty state
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero / Sale Countdown */}
      <SaleCountdown />

      {/* Top Deals */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-magenta" />
            <h2 className="font-heading text-xl font-bold text-white">Top Deals</h2>
          </div>
          <Link href="/deals" className="text-sm text-cyan hover:underline">
            View all →
          </Link>
        </div>
        <DealsGrid deals={topDeals} loading={loading} />
      </section>

      {/* Top Rated on Sale */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <h2 className="font-heading text-xl font-bold text-white">Top Rated on Sale</h2>
          </div>
          <Link href="/deals?sortBy=Metacritic&metacritic=75" className="text-sm text-cyan hover:underline">
            View all →
          </Link>
        </div>
        <DealsGrid deals={topRated} loading={loading} />
      </section>

      {/* Upcoming Sales CTA */}
      <section className="glass-card p-6 text-center">
        <TrendingUp className="mx-auto h-8 w-8 text-cyan mb-3" />
        <h2 className="font-heading text-lg font-bold text-white">Never Miss a Sale</h2>
        <p className="mt-1 text-sm text-muted">
          Check the full calendar of upcoming Steam sales and themed events.
        </p>
        <Link
          href="/calendar"
          className="mt-4 inline-block rounded-lg bg-cyan/10 px-6 py-2 text-sm font-semibold text-cyan hover:bg-cyan/20 transition-colors"
        >
          View Sale Calendar →
        </Link>
      </section>
    </div>
  );
}
