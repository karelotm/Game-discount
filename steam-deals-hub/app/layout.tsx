import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Steam Deals Hub — Best PC Gaming Deals',
  description:
    'Find the best Steam game deals, discounts, and upcoming sale events. Compare prices across stores and never miss a sale.',
  openGraph: {
    title: 'Steam Deals Hub',
    description: 'Aggregating the best PC gaming deals in real-time',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-white antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
