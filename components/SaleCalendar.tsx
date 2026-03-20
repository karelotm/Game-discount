'use client';

import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import type { SaleEvent } from '@/lib/types';

interface SaleCalendarProps {
  sales: SaleEvent[];
}

function getStatus(sale: SaleEvent): 'past' | 'active' | 'upcoming' {
  const now = new Date();
  const start = new Date(sale.startDate);
  const end = new Date(sale.endDate);
  if (isWithinInterval(now, { start, end })) return 'active';
  if (isPast(end)) return 'past';
  return 'upcoming';
}

function generateGoogleCalendarUrl(sale: SaleEvent): string {
  const start = format(new Date(sale.startDate), "yyyyMMdd'T'HHmmss'Z'");
  const end = format(new Date(sale.endDate), "yyyyMMdd'T'HHmmss'Z'");
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: sale.name,
    dates: `${start}/${end}`,
    details: sale.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function SaleCalendar({ sales }: SaleCalendarProps) {
  return (
    <div className="space-y-3">
      {sales.map((sale) => {
        const status = getStatus(sale);
        const start = new Date(sale.startDate);
        const end = new Date(sale.endDate);

        return (
          <div
            key={sale.name}
            className={`glass-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
              status === 'active' ? 'border-cyan/30' : ''
            } ${status === 'past' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 rounded-lg p-2 ${
                  status === 'active'
                    ? 'bg-cyan/10 text-cyan'
                    : status === 'upcoming'
                    ? 'bg-magenta/10 text-magenta'
                    : 'bg-white/5 text-muted'
                }`}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-white">{sale.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      sale.type === 'seasonal'
                        ? 'bg-cyan/10 text-cyan'
                        : 'bg-purple-500/10 text-purple-400'
                    }`}
                  >
                    {sale.type}
                  </span>
                  {status === 'active' && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-green-400 animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted">{sale.description}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" />
                  {format(start, 'MMM d')} — {format(end, 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            {status !== 'past' && isFuture(start) && (
              <a
                href={generateGoogleCalendarUrl(sale)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-muted hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="h-3 w-3" />
                Add to Calendar
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
