'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Bookmark, Trash2, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface WatchlistItem {
  id: string;
  gameTitle: string;
  steamAppId: string | null;
  cheapsharkGameId: string | null;
  targetPrice: string | null;
  targetPct: number | null;
  currentPrice: string | null;
  isActive: boolean;
  thumb: string | null;
  createdAt: string;
}

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editPct, setEditPct] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchWatchlist();
  }, [user]);

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  async function removeItem(id: string) {
    await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function updateAlert(id: string) {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        targetPrice: editPrice || null,
        targetPct: editPct ? parseInt(editPct) : null,
      }),
    });
    setEditingId(null);
    setEditPrice('');
    setEditPct('');
    fetchWatchlist();
  }

  async function toggleAlert(id: string, currentlyActive: boolean) {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !currentlyActive }),
    });
    fetchWatchlist();
  }

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-32 rounded-xl shimmer" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <Bookmark className="mx-auto h-10 w-10 text-muted mb-3" />
        <h1 className="font-heading text-2xl font-bold text-white">Your Watchlist</h1>
        <p className="mt-2 text-sm text-muted">Log in to save games and set price alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-cyan" />
        <h1 className="font-heading text-2xl font-bold text-white">Your Watchlist</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card flex gap-4 p-4">
              <div className="h-16 w-28 shrink-0 rounded shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded shimmer" />
                <div className="h-3 w-1/3 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted">Your watchlist is empty.</p>
          <Link href="/deals" className="mt-3 inline-block text-sm text-cyan hover:underline">
            Browse deals to add games →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-card flex items-center gap-4 p-4">
              {item.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumb} alt={item.gameTitle} className="h-16 w-28 shrink-0 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                {item.steamAppId ? (
                  <Link href={`/game/${item.steamAppId}`} className="text-sm font-heading font-semibold text-white hover:text-cyan truncate block">
                    {item.gameTitle}
                  </Link>
                ) : (
                  <p className="text-sm font-heading font-semibold text-white truncate">{item.gameTitle}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                  {item.currentPrice && <span>Current: <span className="text-cyan font-mono">{formatPrice(item.currentPrice)}</span></span>}
                  {item.targetPrice && <span>Target: <span className="text-green-400 font-mono">{formatPrice(item.targetPrice)}</span></span>}
                  {item.targetPct && <span>Target: <span className="text-green-400">{item.targetPct}% off</span></span>}
                </div>

                {editingId === item.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Target $"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 rounded border border-white/10 bg-surface-light px-2 py-1 text-xs text-white outline-none focus:border-cyan/40"
                    />
                    <span className="text-xs text-muted">or</span>
                    <input
                      type="number"
                      placeholder="% off"
                      value={editPct}
                      onChange={(e) => setEditPct(e.target.value)}
                      className="w-20 rounded border border-white/10 bg-surface-light px-2 py-1 text-xs text-white outline-none focus:border-cyan/40"
                    />
                    <button
                      onClick={() => updateAlert(item.id)}
                      className="rounded bg-cyan/10 px-2 py-1 text-xs text-cyan hover:bg-cyan/20"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-muted hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditPrice(item.targetPrice || '');
                    setEditPct(item.targetPct?.toString() || '');
                  }}
                  title="Set alert"
                  className="rounded p-1.5 text-muted hover:text-cyan hover:bg-cyan/10 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleAlert(item.id, item.isActive)}
                  title={item.isActive ? 'Disable alert' : 'Enable alert'}
                  className={`rounded p-1.5 transition-colors ${
                    item.isActive ? 'text-green-400 hover:text-green-300' : 'text-muted hover:text-white'
                  }`}
                >
                  {item.isActive ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                  className="rounded p-1.5 text-muted hover:text-magenta hover:bg-magenta/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
