import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Details — Price History & Store Comparison',
  description:
    'View detailed game information, price history charts, and compare prices across all stores. Find the cheapest deal for any Steam game.',
  openGraph: {
    title: 'Game Price Comparison',
    description: 'Price history, store comparison, and best deals for this game.',
  },
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
