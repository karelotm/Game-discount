'use client';

import { ExternalLink } from 'lucide-react';

interface StoreDeal {
  storeID: string;
  storeName: string;
  dealID: string;
  price: string;
  retailPrice: string;
  savings: string;
}

interface StoreComparisonProps {
  deals: StoreDeal[];
}

const STORE_NAMES: Record<string, string> = {
  '1': 'Steam',
  '2': 'GamersGate',
  '3': 'GreenManGaming',
  '7': 'GOG',
  '8': 'Origin',
  '11': 'Humble Store',
  '13': 'Uplay',
  '15': 'Fanatical',
  '21': 'WinGameStore',
  '23': 'GameBillet',
  '24': 'Voidu',
  '25': 'Epic Games Store',
  '27': 'Games Planet',
  '28': 'Games Load',
  '29': '2Game',
  '30': 'IndieGala',
  '31': 'Blizzard Shop',
  '33': 'DLGamer',
  '34': 'Noctre',
  '35': 'DreamGame',
};

export default function StoreComparison({ deals }: StoreComparisonProps) {
  if (deals.length === 0) return null;

  const sorted = [...deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  return (
    <div className="space-y-2">
      {sorted.map((deal, i) => {
        const discount = Math.round(parseFloat(deal.savings));
        const isBest = i === 0;
        return (
          <a
            key={deal.dealID}
            href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              isBest
                ? 'border-cyan/30 bg-cyan/5 hover:bg-cyan/10'
                : 'border-white/5 bg-surface hover:bg-surface-light'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isBest ? 'text-cyan' : 'text-white'}`}>
                {deal.storeName || STORE_NAMES[deal.storeID] || `Store #${deal.storeID}`}
              </span>
              {isBest && (
                <span className="rounded bg-cyan/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan">
                  BEST
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {discount > 0 && (
                <span className="text-xs text-magenta font-bold">-{discount}%</span>
              )}
              <span className="font-mono text-sm font-bold text-white">${parseFloat(deal.price).toFixed(2)}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
