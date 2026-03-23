'use client';

import { SlidersHorizontal, X } from 'lucide-react';

export interface Filters {
  sortBy: string;
  upperPrice: string;
  lowerPrice: string;
  metacritic: string;
  steamRating: string;
  storeID: string;
  genres: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
  'Indie', 'Sports', 'Racing', 'Puzzle', 'Horror',
  'FPS', 'Open World', 'Casual', 'Platformer', 'Survival',
];

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function toggleGenre(genre: string) {
    const current = filters.genres;
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    onChange({ ...filters, genres: next });
  }

  function clearGenres() {
    onChange({ ...filters, genres: [] });
  }

  const selectClass = 'w-full rounded-md border border-white/10 bg-surface-light px-3 py-2 text-sm text-white outline-none focus:border-cyan/40';
  const inputClass = selectClass;

  return (
    <div className="glass-card p-4 space-y-5">
      <div className="flex items-center gap-2 font-heading text-sm font-bold text-cyan">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Sort By</label>
        <select value={filters.sortBy} onChange={(e) => update('sortBy', e.target.value)} className={selectClass}>
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
          <input type="number" placeholder="Min" value={filters.lowerPrice} onChange={(e) => update('lowerPrice', e.target.value)} className={inputClass} />
          <input type="number" placeholder="Max" value={filters.upperPrice} onChange={(e) => update('upperPrice', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted">Min Metacritic</label>
        <select value={filters.metacritic} onChange={(e) => update('metacritic', e.target.value)} className={selectClass}>
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
        <select value={filters.steamRating} onChange={(e) => update('steamRating', e.target.value)} className={selectClass}>
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
        <select value={filters.storeID} onChange={(e) => update('storeID', e.target.value)} className={selectClass}>
          <option value="1">Steam Only</option>
          <option value="">All Stores</option>
        </select>
      </div>

      {/* Genre Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted">Genres</label>
          {filters.genres.length > 0 && (
            <button onClick={clearGenres} className="flex items-center gap-0.5 text-[10px] text-magenta hover:text-magenta-dark">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GENRE_OPTIONS.map((genre) => {
            const active = filters.genres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? 'bg-cyan/20 text-cyan border border-cyan/30'
                    : 'bg-white/5 text-muted border border-transparent hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
