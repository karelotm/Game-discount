import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://steam-deals-hub.coupons';
const rawPubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || '';
// Normalise: accept "ca-pub-xxx", "pub-xxx", or raw "xxx"
const adClient = rawPubId.startsWith('ca-') ? rawPubId : rawPubId ? `ca-${rawPubId}` : '';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Steam Deals Hub — Best PC Gaming Deals & Discounts 2026',
    template: '%s | Steam Deals Hub',
  },
  description:
    'Find the best Steam game deals, discounts, and upcoming sale events. Compare prices across 30+ stores, track price history, and never miss a Steam sale.',
  keywords: [
    'Steam deals', 'PC game deals', 'Steam sale', 'game discounts',
    'cheap Steam games', 'Steam sale calendar', 'PC gaming deals',
    'game price comparison', 'Steam discounts 2026',
  ],
  openGraph: {
    title: 'Steam Deals Hub — Best PC Gaming Deals',
    description: 'Compare prices across 30+ stores. Track price history. Never miss a Steam sale.',
    type: 'website',
    siteName: 'Steam Deals Hub',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steam Deals Hub — Best PC Gaming Deals',
    description: 'Compare prices across 30+ stores. Track price history. Never miss a Steam sale.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Steam Deals Hub',
    url: SITE_URL,
    description: 'Find the best Steam game deals, discounts, and upcoming sale events.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/deals?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        {adClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-white antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
