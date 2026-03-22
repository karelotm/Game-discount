import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Steam Deals — Compare PC Game Prices',
  description:
    'Browse thousands of Steam game deals. Filter by price, Metacritic score, and Steam rating. Compare prices across 30+ stores to find the cheapest games.',
  openGraph: {
    title: 'Browse Steam Deals',
    description: 'Filter and compare thousands of PC game deals across 30+ stores.',
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
