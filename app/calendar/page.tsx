'use client';

import { Calendar } from 'lucide-react';
import SaleCalendar from '@/components/SaleCalendar';
import SaleCountdown from '@/components/SaleCountdown';
import type { SaleEvent } from '@/lib/types';
import salesData from '@/data/steam-sales-calendar.json';

export default function CalendarPage() {
  const sales = salesData.sales as SaleEvent[];

  const seasonalSales = sales.filter((s) => s.type === 'seasonal');
  const festSales = sales.filter((s) => s.type === 'fest');

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-cyan" />
        <h1 className="font-heading text-2xl font-bold text-white">Steam Sale Calendar 2026</h1>
      </div>

      <SaleCountdown />

      <section>
        <h2 className="font-heading text-lg font-bold text-white mb-4">Seasonal Sales</h2>
        <SaleCalendar sales={seasonalSales} />
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-white mb-4">Themed Fests</h2>
        <SaleCalendar sales={festSales} />
      </section>

      <section className="glass-card p-6 text-center">
        <p className="text-sm text-muted">
          Sale dates are based on historical patterns and community sources.
          Dates marked with ~ are estimates. Last updated: March 2026.
        </p>
      </section>
    </div>
  );
}
