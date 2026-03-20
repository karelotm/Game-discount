'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import type { CheapSharkGameSearch } from '@/lib/types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CheapSharkGameSearch[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data.slice(0, 8) : []);
        setOpen(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center rounded-lg border border-white/10 bg-surface px-3 py-2 focus-within:border-cyan/40">
        <Search className="h-4 w-4 text-muted mr-2" />
        <input
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-surface shadow-xl z-50 max-h-80 overflow-auto">
          {loading && <p className="p-3 text-sm text-muted">Searching...</p>}
          {!loading && results.length === 0 && (
            <p className="p-3 text-sm text-muted">No results found</p>
          )}
          {results.map((game) => (
            <Link
              key={game.gameID}
              href={game.steamAppID ? `/game/${game.steamAppID}` : '#'}
              onClick={() => { setOpen(false); setQuery(''); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-surface-light transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={game.thumb}
                alt={game.external}
                className="h-8 w-14 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{game.external}</p>
                <p className="text-xs font-mono text-cyan">${game.cheapest}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
