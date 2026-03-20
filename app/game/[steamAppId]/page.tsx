'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Monitor, Apple, Cpu, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import StoreComparison from '@/components/StoreComparison';
import type { SteamAppDetails, CheapSharkGameDetail } from '@/lib/types';

interface GameData {
  steam: SteamAppDetails['data'] | null;
  cheapshark: CheapSharkGameDetail | null;
}

export default function GameDetailPage() {
  const params = useParams();
  const steamAppId = params.steamAppId as string;
  const [data, setData] = useState<GameData>({ steam: null, cheapshark: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [steamRes, csRes] = await Promise.all([
          fetch(`/api/game-detail?appids=${steamAppId}`),
          fetch(`/api/games?steamAppID=${steamAppId}`),
        ]);

        const steamJson = await steamRes.json();
        const steamData = steamJson[steamAppId]?.success ? steamJson[steamAppId].data : null;

        const csJson = await csRes.json();
        // CheapShark returns array for steamAppID search, need to get gameID then fetch detail
        let csDetail = null;
        if (Array.isArray(csJson) && csJson.length > 0) {
          const gameID = csJson[0].gameID;
          const detailRes = await fetch(`/api/games?id=${gameID}`);
          csDetail = await detailRes.json();
        }

        setData({ steam: steamData, cheapshark: csDetail });
      } catch {
        // silent fail
      }
      setLoading(false);
    }
    fetchData();
  }, [steamAppId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-64 rounded-xl shimmer" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48 rounded-xl shimmer" />
          <div className="h-48 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  const game = data.steam;
  const cs = data.cheapshark;

  if (!game) {
    return (
      <div className="text-center py-20">
        <h1 className="font-heading text-2xl text-white">Game Not Found</h1>
        <p className="mt-2 text-muted">Could not load details for this game.</p>
        <Link href="/deals" className="mt-4 inline-block text-cyan hover:underline">
          ← Back to Deals
        </Link>
      </div>
    );
  }

  const priceHistoryData = cs?.deals?.map((deal, i) => ({
    date: `Deal ${i + 1}`,
    price: parseFloat(deal.price),
  })) || [];

  const storeDeals = cs?.deals?.map((deal) => ({
    ...deal,
    storeName: '',
  })) || [];

  return (
    <div className="space-y-8">
      <Link href="/deals" className="inline-flex items-center gap-1 text-sm text-muted hover:text-cyan transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Deals
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.header_image}
          alt={game.name}
          className="w-full rounded-xl md:w-96 object-cover"
        />
        <div className="space-y-3">
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">{game.name}</h1>

          {game.genres && (
            <div className="flex flex-wrap gap-1.5">
              {game.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted"
                >
                  {g.description}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-muted leading-relaxed line-clamp-4">
            {game.short_description}
          </p>

          <div className="flex items-center gap-4">
            {game.platforms?.windows && <span title="Windows"><Monitor className="h-4 w-4 text-muted" /></span>}
            {game.platforms?.mac && <span title="macOS"><Apple className="h-4 w-4 text-muted" /></span>}
            {game.platforms?.linux && <span title="Linux"><Cpu className="h-4 w-4 text-muted" /></span>}
          </div>

          {game.developers && (
            <p className="text-xs text-muted">
              <span className="text-white/40">Developer:</span> {game.developers.join(', ')}
            </p>
          )}

          {game.release_date && (
            <p className="text-xs text-muted">
              <span className="text-white/40">Release:</span> {game.release_date.date}
            </p>
          )}

          {/* Price */}
          {game.price_overview && (
            <div className="flex items-baseline gap-3 mt-2">
              {game.price_overview.discount_percent > 0 && (
                <span className="rounded-md bg-magenta px-2 py-0.5 text-sm font-bold text-white glow-magenta">
                  -{game.price_overview.discount_percent}%
                </span>
              )}
              {game.price_overview.discount_percent > 0 && (
                <span className="text-sm text-muted line-through font-mono">
                  {game.price_overview.initial_formatted}
                </span>
              )}
              <span className="text-xl font-bold text-cyan font-mono">
                {game.price_overview.final_formatted}
              </span>
            </div>
          )}

          {game.is_free && (
            <span className="text-xl font-bold text-green-400 font-mono">Free to Play</span>
          )}

          <a
            href={`https://store.steampowered.com/app/${steamAppId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan px-5 py-2 text-sm font-bold text-background hover:bg-cyan-dark transition-colors glow-cyan"
          >
            View on Steam <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Price History & Store Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Price History</h2>
          <PriceHistoryChart
            data={priceHistoryData}
            cheapestEver={
              cs?.cheapestPriceEver
                ? {
                    price: parseFloat(cs.cheapestPriceEver.price),
                    date: new Date(cs.cheapestPriceEver.date * 1000).toLocaleDateString(),
                  }
                : undefined
            }
          />
          {cs?.cheapestPriceEver && (
            <p className="mt-3 text-xs text-muted">
              Cheapest ever: <span className="text-green-400 font-mono">${cs.cheapestPriceEver.price}</span>
              {' '}on {new Date(cs.cheapestPriceEver.date * 1000).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Compare Prices</h2>
          <StoreComparison deals={storeDeals} />
          {storeDeals.length === 0 && (
            <p className="text-sm text-muted">No price comparison data available.</p>
          )}
        </div>
      </div>

      {/* Screenshots */}
      {game.screenshots && game.screenshots.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-bold text-white mb-4">Screenshots</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {game.screenshots.slice(0, 4).map((ss) => (
              <a key={ss.id} href={ss.path_full} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ss.path_thumbnail}
                  alt="Screenshot"
                  className="w-full rounded-lg hover:opacity-80 transition-opacity"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* System Requirements */}
      {game.pc_requirements?.minimum && (
        <section className="glass-card p-5">
          <h2 className="font-heading text-lg font-bold text-white mb-4">System Requirements</h2>
          <div
            className="prose prose-invert prose-sm max-w-none text-muted [&_strong]:text-white/80 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: game.pc_requirements.minimum }}
          />
        </section>
      )}
    </div>
  );
}
