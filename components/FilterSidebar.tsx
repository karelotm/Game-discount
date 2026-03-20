'use client';

import { SlidersHorizontal } from 'lucide-react';

export interface Filters {
  sortBy: string;
  upperPrice: string;
  lowerPrice: string;
  metacritic: string;
  steamRating: string;
  storeID: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="glass-card p-4 space-y-5">
      <div className="flex items-center gap-2 font-heading text-sm font-bold text-cyan">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => update('sortBy', e.target.value)}
          className="w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
        >
          <option value="Deal Rating">Best Deal</option>
          <option value="Savings">Highest Discount</option>
          <option value="Price">Lowest Price</option>
          <option value="Metacritic">Metacritic Score</option>
          <option value="Reviews">User Reviews</option>
          <option value="recent">Newest</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.lowerPrice}
            onChange={(e) => update('lowerPrice', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.upperPrice}
            onChange={(e) => update('upperPrice', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Min Metacritic</label>
        <select
          value={filters.metacritic}
          onChange={(e) => update('metacritic', e.target.value)}
          className="w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
        >
          <option value="">Any</option>
          <option value="50">50+</option>
          <option value="60">60+</option>
          <option value="70">70+</option>
          <option value="75">75+</option>
          <option value="80">80+</option>
          <option value="85">85+</option>
          <option value="90">90+</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Min Steam Rating</label>
        <select
          value={filters.steamRating}
          onChange={(e) => update('steamRating', e.target.value)}
          className="w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
        >
          <option value="">Any</option>
          <option value="50">50%+</option>
          <option value="70">70%+</option>
          <option value="80">80%+</option>
          <option value="90">90%+</option>
          <option value="95">95%+</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Store</label>
        <select
          value={filters.storeID}
          onChange={(e) => update('storeID', e.target.value)}
          className="w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
        >
          <option value="1">Steam Only</option>
          <option value="">All Stores</option>
        </select>
      </div>
    </div>
  );
}
