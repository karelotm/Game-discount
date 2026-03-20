import Link from 'next/link';
import { Clock, Star } from 'lucide-react';
import type { CheapSharkDeal } from '@/lib/types';
import { formatPrice, getRatingColor } from '@/lib/utils';
import { getAffiliateLink, trackClick } from '@/lib/affiliate';

interface DealCardProps {
  deal: CheapSharkDeal;
}

export default function DealCard({ deal }: DealCardProps) {
  const discount = Math.round(parseFloat(deal.savings));
  const rating = parseInt(deal.steamRatingPercent);
  const href = deal.steamAppID ? `/game/${deal.steamAppID}` : getAffiliateLink(deal.dealID, deal.storeID, deal.title, deal.steamAppID);
  const isExternal = !deal.steamAppID;

  return (
    <div className="glass-card overflow-hidden group">
      <div className="relative aspect-[460/215] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={deal.thumb}
          alt={deal.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 rounded-md bg-magenta px-2 py-0.5 text-xs font-bold text-white glow-magenta">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-heading text-sm font-semibold text-white truncate leading-tight">
          {deal.title}
        </h3>

        {rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className={getRatingColor(rating)}>{rating}%</span>
            {deal.steamRatingText && (
              <span className="text-muted ml-1">{deal.steamRatingText}</span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted line-through font-mono">
            {formatPrice(deal.normalPrice)}
          </span>
          <span className="text-base font-bold text-cyan font-mono">
            {formatPrice(deal.salePrice)}
          </span>
        </div>

        {deal.lastChange > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" />
            <span>Updated {new Date(deal.lastChange * 1000).toLocaleDateString()}</span>
          </div>
        )}

        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(deal.dealID, 'Steam')}
            className="mt-1 block w-full rounded-md bg-cyan/10 py-1.5 text-center text-xs font-semibold text-cyan hover:bg-cyan/20 transition-colors"
          >
            View Deal →
          </a>
        ) : (
          <Link
            href={href}
            className="mt-1 block w-full rounded-md bg-cyan/10 py-1.5 text-center text-xs font-semibold text-cyan hover:bg-cyan/20 transition-colors"
          >
            View Deal →
          </Link>
        )}
      </div>
    </div>
  );
}
