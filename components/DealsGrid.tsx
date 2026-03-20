import DealCard from './DealCard';
import type { CheapSharkDeal } from '@/lib/types';

interface DealsGridProps {
  deals: CheapSharkDeal[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="aspect-[460/215] shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
        <div className="h-5 w-1/3 rounded shimmer" />
        <div className="h-8 w-full rounded shimmer" />
      </div>
    </div>
  );
}

export default function DealsGrid({ deals, loading }: DealsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted">
        <p className="text-lg font-heading">No deals found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {deals.map((deal) => (
        <DealCard key={deal.dealID} deal={deal} />
      ))}
    </div>
  );
}
