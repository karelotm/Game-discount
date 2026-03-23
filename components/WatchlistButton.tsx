'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface WatchlistButtonProps {
  gameTitle: string;
  steamAppId?: string | null;
  cheapsharkGameId?: string | null;
  currentPrice?: string | null;
  thumb?: string | null;
  className?: string;
}

export default function WatchlistButton({
  gameTitle,
  steamAppId,
  cheapsharkGameId,
  currentPrice,
  thumb,
  className = '',
}: WatchlistButtonProps) {
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function handleAdd() {
    if (added || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTitle,
          steamAppId,
          cheapsharkGameId,
          currentPrice,
          thumb,
        }),
      });
      if (res.ok) setAdded(true);
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added || loading}
      title={added ? 'Added to watchlist' : 'Add to watchlist'}
      className={`rounded p-1.5 transition-colors ${
        added
          ? 'text-cyan bg-cyan/10'
          : 'text-muted hover:text-cyan hover:bg-cyan/10'
      } ${className}`}
    >
      {added ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </button>
  );
}
