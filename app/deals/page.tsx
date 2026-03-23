'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import DealsGrid from '@/components/DealsGrid';
import DealCard from '@/components/DealCard';
import FilterSidebar, { type Filters } from '@/components/FilterSidebar';
import AdBanner from '@/components/AdBanner';
import type { CheapSharkDeal } from '@/lib/types';

export default function DealsPage() {
  const [deals, setDeals] = useState<CheapSharkDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<CheapSharkDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [genreMap, setGenreMap] = useState<Record<string, string[]>>({});
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'Deal Rating',
    upperPrice: '',
    lowerPrice: '',
    metacritic: '',
    steamRating: '',
    storeID: '1',
    genres: [],
  });

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      pageSize: '20',
      pageNumber: String(page),
      sortBy: filters.sortBy,
      onSale: '1',
    });
    if (filters.storeID) params.set('storeID', filters.storeID);
    if (filters.upperPrice) params.set('upperPrice', filters.upperPrice);
    if (filters.lowerPrice) params.set('lowerPrice', filters.lowerPrice);
    if (filters.metacritic) params.set('metacritic', filters.metacritic);
    if (filters.steamRating) params.set('steamRating', filters.steamRating);

    try {
      const res = await fetch(`/api/deals?${params}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setDeals(list);

      // Fetch genres for deals that have steamAppID
      const steamIds = list
        .map((d: CheapSharkDeal) => d.steamAppID)
        .filter((id): id is string => !!id);

      if (steamIds.length > 0) {
        try {
          const genreRes = await fetch(`/api/genres?steamAppIds=${steamIds.join(',')}`);
          if (genreRes.ok) {
            const genres = await genreRes.json();
            setGenreMap((prev) => ({ ...prev, ...genres }));
          }
        } catch {
          // Genre fetch is non-critical
        }
      }
    } catch {
      setDeals([]);
    }
    setLoading(false);
  }, [page, filters.sortBy, filters.storeID, filters.upperPrice, filters.lowerPrice, filters.metacritic, filters.steamRating]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Client-side genre filtering
  useEffect(() => {
    if (filters.genres.length === 0) {
      setFilteredDeals(deals);
      return;
    }

    const filtered = deals.filter((deal) => {
      if (!deal.steamAppID) return false;
      const genres = genreMap[deal.steamAppID];
      if (!genres) return false;
      // Match if the game has ANY of the selected genres
      return filters.genres.some((g) =>
        genres.some((cached) => cached.toLowerCase().includes(g.toLowerCase()))
      );
    });
    setFilteredDeals(filtered);
  }, [deals, filters.genres, genreMap]);

  function handleFilterChange(newFilters: Filters) {
    // Only reset page if server-side filters changed
    const serverChanged =
      newFilters.sortBy !== filters.sortBy ||
      newFilters.storeID !== filters.storeID ||
      newFilters.upperPrice !== filters.upperPrice ||
      newFilters.lowerPrice !== filters.lowerPrice ||
      newFilters.metacritic !== filters.metacritic ||
      newFilters.steamRating !== filters.steamRating;

    setFilters(newFilters);
    if (serverChanged) setPage(0);
  }

  const displayDeals = filteredDeals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Browse Deals</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`rounded-md p-2 transition-colors ${
              view === 'grid' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-md p-2 transition-colors ${
              view === 'list' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <FilterSidebar filters={filters} onChange={handleFilterChange} />
          <AdBanner slot="sidebar" className="hidden lg:flex" />
        </aside>

        <div className="flex-1 space-y-6">
          {/* Mobile ad above deals (hidden on desktop where sidebar ad is shown) */}
          <AdBanner slot="in-feed" className="flex lg:hidden mx-auto" />

          {filters.genres.length > 0 && !loading && (
            <p className="text-xs text-muted">
              Showing {displayDeals.length} of {deals.length} deals matching selected genres
            </p>
          )}

          {view === 'grid' ? (
            <DealsGrid deals={displayDeals} loading={loading} />
          ) : (
            <div className="space-y-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card flex gap-4 p-3">
                      <div className="h-16 w-28 shrink-0 rounded shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 rounded shimmer" />
                        <div className="h-3 w-1/3 rounded shimmer" />
                      </div>
                    </div>
                  ))
                : displayDeals.map((deal) => (
                    <div key={deal.dealID} className="glass-card flex items-center gap-4 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={deal.thumb}
                        alt={deal.title}
                        className="h-16 w-28 shrink-0 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-heading font-semibold text-white truncate">
                          {deal.title}
                        </h3>
                        {parseInt(deal.steamRatingPercent) > 0 && (
                          <p className="text-xs text-muted">
                            {deal.steamRatingPercent}% positive · {deal.steamRatingText}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {Math.round(parseFloat(deal.savings)) > 0 && (
                          <span className="rounded-md bg-magenta px-2 py-0.5 text-xs font-bold text-white">
                            -{Math.round(parseFloat(deal.savings))}%
                          </span>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-muted line-through font-mono">
                            ${parseFloat(deal.normalPrice).toFixed(2)}
                          </p>
                          <p className="text-sm font-bold text-cyan font-mono">
                            ${parseFloat(deal.salePrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-md border border-white/10 px-3 py-2 text-sm text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-muted font-mono">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={deals.length < 20}
              className="flex items-center gap-1 rounded-md border border-white/10 px-3 py-2 text-sm text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
