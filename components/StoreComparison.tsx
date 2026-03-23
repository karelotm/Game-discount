'use client';

import { ExternalLink, BadgePercent } from 'lucide-react';
import { getAffiliateLink, trackClick, isAffiliateStore } from '@/lib/affiliate';

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
  steamAppId?: string | null;
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

/**
 * Smart sort: lowest price first, but when an affiliate store matches the
 * cheapest price (within $0.01), boost it to the top so we earn commission
 * without costing the user anything extra.
 */
function smartSort(deals: StoreDeal[]): StoreDeal[] {
  const sorted = [...deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  if (sorted.length < 2) return sorted;

  const bestPrice = parseFloat(sorted[0].price);

  // Find the first affiliate store that matches the best price
  const affiliateIdx = sorted.findIndex(
    (d, i) => i > 0 && isAffiliateStore(d.storeID) && Math.abs(parseFloat(d.price) - bestPrice) < 0.02,
  );

  if (affiliateIdx > 0 && !isAffiliateStore(sorted[0].storeID)) {
    // Swap the affiliate store to the top
    const [affiliate] = sorted.splice(affiliateIdx, 1);
    sorted.unshift(affiliate);
  }

  return sorted;
}

export default function StoreComparison({ deals, steamAppId }: StoreComparisonProps) {
  if (deals.length === 0) return null;

  const sorted = smartSort(deals);
  const bestPrice = parseFloat(sorted[0].price);

  return (
    <div className="space-y-2">
      {sorted.map((deal, i) => {
        const discount = Math.round(parseFloat(deal.savings));
        const price = parseFloat(deal.price);
        const isBest = i === 0;
        const isAffiliate = isAffiliateStore(deal.storeID);
        // "Best Deal" = affiliate store at or within $0.01 of the best price
        const isBestDeal = isAffiliate && Math.abs(price - bestPrice) < 0.02;

        return (
          <a
            key={deal.dealID}
            href={getAffiliateLink(deal.dealID, deal.storeID, deal.storeName, steamAppId)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(deal.dealID, deal.storeName || STORE_NAMES[deal.storeID] || 'Unknown')}
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              isBest
                ? 'border-cyan/30 bg-cyan/5 hover:bg-cyan/10'
                : isBestDeal
                  ? 'border-green-400/20 bg-green-400/5 hover:bg-green-400/10'
                  : 'border-white/5 bg-surface hover:bg-surface-light'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isBest ? 'text-cyan' : isBestDeal ? 'text-green-400' : 'text-white'}`}>
                {deal.storeName || STORE_NAMES[deal.storeID] || `Store #${deal.storeID}`}
              </span>
              {isBest && (
                <span className="rounded bg-cyan/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan">
                  BEST
                </span>
              )}
              {isBestDeal && !isBest && (
                <span className="rounded bg-green-400/20 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                  BEST DEAL
                </span>
              )}
              {isAffiliate && (
                <span title="Supports us at no extra cost">
                  <BadgePercent className="h-3.5 w-3.5 text-green-400/60" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {discount > 0 && (
                <span className="text-xs text-magenta font-bold">-{discount}%</span>
              )}
              <span className="font-mono text-sm font-bold text-white">${price.toFixed(2)}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
