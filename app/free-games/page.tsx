'use client';

import { useEffect, useState } from 'react';
import { Gift, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { CheapSharkDeal, SteamSpecialItem } from '@/lib/types';
import WatchlistButton from '@/components/WatchlistButton';

interface FreeGamesData {
  cheapshark: CheapSharkDeal[];
  steam: SteamSpecialItem[];
}

export default function FreeGamesPage() {
  const [data, setData] = useState<FreeGamesData>({ cheapshark: [], steam: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/free-games');
        if (res.ok) {
          setData(await res.json());
        }
      } catch { /* silent */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  const hasFreeGames = data.cheapshark.length > 0 || data.steam.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Gift className="h-6 w-6 text-green-400" />
        <h1 className="font-heading text-2xl font-bold text-white">Free Games</h1>
      </div>

      <p className="text-sm text-muted">
        Games currently available for free — grab them before they&apos;re gone!
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="aspect-[460/215] shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 rounded shimmer" />
                <div className="h-3 w-1/2 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasFreeGames ? (
        <div className="glass-card p-8 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-muted">No free games found right now. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Steam Featured Free */}
          {data.steam.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold text-white mb-4">Steam Featured Free</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.steam.map((item) => (
                  <div key={item.id} className="glass-card overflow-hidden group">
                    <Link href={`/game/${item.id}`} className="block">
                      <div className="relative aspect-[460/215] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.large_capsule_image || item.header_image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute top-2 left-2 rounded-md bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                          FREE
                        </span>
                      </div>
                    </Link>
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <Link href={`/game/${item.id}`} className="font-heading text-sm font-semibold text-white truncate hover:text-cyan">
                          {item.name}
                        </Link>
                        <WatchlistButton
                          gameTitle={item.name}
                          steamAppId={String(item.id)}
                          currentPrice="0"
                          thumb={item.header_image}
                        />
                      </div>
                      {item.original_price && item.original_price > 0 && (
                        <p className="text-xs text-muted">
                          Was <span className="line-through font-mono">${(item.original_price / 100).toFixed(2)}</span>
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Link
                          href={`/game/${item.id}`}
                          className="flex-1 block rounded-md bg-cyan/10 py-1.5 text-center text-xs font-semibold text-cyan hover:bg-cyan/20 transition-colors"
                        >
                          View Details
                        </Link>
                        <a
                          href={`https://store.steampowered.com/app/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
                        >
                          Get Free <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CheapShark Free Deals */}
          {data.cheapshark.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold text-white mb-4">Free Across All Stores</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.cheapshark.map((deal) => {
                  const hasDetail = !!deal.steamAppID;

                  return (
                    <div key={deal.dealID} className="glass-card overflow-hidden group">
                      {hasDetail ? (
                        <Link href={`/game/${deal.steamAppID}`} className="block">
                          <div className="relative aspect-[460/215] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={deal.thumb}
                              alt={deal.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="absolute top-2 left-2 rounded-md bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                              FREE
                            </span>
                            {parseFloat(deal.normalPrice) > 0 && (
                              <span className="absolute top-2 right-2 rounded-md bg-magenta px-2 py-0.5 text-xs font-bold text-white">
                                -100%
                              </span>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className="relative aspect-[460/215] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={deal.thumb}
                            alt={deal.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute top-2 left-2 rounded-md bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                            FREE
                          </span>
                          {parseFloat(deal.normalPrice) > 0 && (
                            <span className="absolute top-2 right-2 rounded-md bg-magenta px-2 py-0.5 text-xs font-bold text-white">
                              -100%
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          {hasDetail ? (
                            <Link href={`/game/${deal.steamAppID}`} className="font-heading text-sm font-semibold text-white truncate hover:text-cyan">
                              {deal.title}
                            </Link>
                          ) : (
                            <h3 className="font-heading text-sm font-semibold text-white truncate">{deal.title}</h3>
                          )}
                          <WatchlistButton
                            gameTitle={deal.title}
                            steamAppId={deal.steamAppID}
                            cheapsharkGameId={deal.gameID}
                            currentPrice="0"
                            thumb={deal.thumb}
                          />
                        </div>
                        {parseFloat(deal.normalPrice) > 0 && (
                          <p className="text-xs text-muted">
                            Was <span className="line-through font-mono">${parseFloat(deal.normalPrice).toFixed(2)}</span>
                          </p>
                        )}
                        <div className="flex gap-2">
                          {hasDetail ? (
                            <>
                              <Link
                                href={`/game/${deal.steamAppID}`}
                                className="flex-1 block rounded-md bg-cyan/10 py-1.5 text-center text-xs font-semibold text-cyan hover:bg-cyan/20 transition-colors"
                              >
                                View Details
                              </Link>
                              <a
                                href={`https://store.steampowered.com/app/${deal.steamAppID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
                              >
                                Get Free <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          ) : (
                            <a
                              href={`https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(deal.dealID)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 block rounded-md bg-green-500/10 py-1.5 text-center text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                              Get Free →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
