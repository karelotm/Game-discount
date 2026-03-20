# Steam Deals Hub

## Project Overview
A publicly deployed Next.js web application that aggregates current Steam game discounts and displays upcoming Steam sale events. Combines multiple free APIs for a comprehensive, real-time view of PC gaming deals.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript 5.9
**Deploy target:** Vercel
**Live URL:** https://game-discount-nine.vercel.app
**APIs:** CheapShark + Steam Storefront (unofficial) + static Steam sale calendar data

## Commands
```bash
npm run dev    # Start dev server (http://localhost:3000)
npm run build  # Production build — ALWAYS run before pushing to verify no errors
npm run start  # Start production server from .next/
npm run lint   # Run ESLint
```

## Architecture

```
steam-deals-hub/
├── app/
│   ├── layout.tsx                 # Root layout, metadata, Navbar + Footer
│   ├── page.tsx                   # Homepage (client component)
│   ├── deals/page.tsx             # Deals browser with filters & pagination
│   ├── game/[steamAppId]/page.tsx # Game detail page
│   ├── calendar/page.tsx          # Sales calendar
│   └── api/                       # Server-side proxy routes (all force-dynamic)
│       ├── deals/route.ts         # Proxy → CheapShark /deals
│       ├── games/route.ts         # Proxy → CheapShark /games
│       ├── game-detail/route.ts   # Proxy → Steam /api/appdetails
│       ├── featured/route.ts      # Proxy → Steam /api/featuredcategories
│       ├── search/route.ts        # Proxy → CheapShark /games?title=
│       └── track-click/route.ts   # Affiliate click tracking (logs to console/DB)
├── components/
│   ├── Navbar.tsx                 # Sticky nav with search bar, mobile hamburger
│   ├── Footer.tsx                 # Attribution footer
│   ├── DealCard.tsx               # Individual deal card with affiliate links
│   ├── DealsGrid.tsx              # Responsive grid container with skeleton loading
│   ├── FilterSidebar.tsx          # Filter form (sort, price, metacritic, rating)
│   ├── SearchBar.tsx              # Debounced autocomplete search (300ms)
│   ├── PriceHistoryChart.tsx      # Recharts line chart for price trends
│   ├── StoreComparison.tsx        # Multi-store price table with affiliate tracking
│   ├── SaleCountdown.tsx          # Live countdown timer for current/next sale
│   ├── SaleCalendar.tsx           # Sale event cards with status badges
│   ├── AdBanner.tsx               # Ad placement component (placeholder until provider configured)
│   └── AffiliateLink.tsx          # Reusable affiliate link with click tracking
├── lib/
│   ├── affiliate.ts               # Affiliate URL builder + click tracking helpers
│   ├── cheapshark.ts              # CheapShark API client (browser-side, calls /api/ routes)
│   ├── steam.ts                   # Steam API client (unused — steam calls go through /api/)
│   ├── types.ts                   # All TypeScript interfaces
│   └── utils.ts                   # Formatting helpers, cn(), time utilities
├── data/
│   └── steam-sales-calendar.json  # Static sale events (update quarterly from steamdb.info)
├── next.config.js                 # Image remote patterns for Steam CDN + CheapShark
├── tailwind.config.ts             # Theme colors, font families
└── public/store-icons/            # (placeholder for store logos)
```

## Pages & Features

### Homepage (`/`) — Client Component
- **SaleCountdown**: Live countdown to current or next Steam sale (updates every second)
- **Top Deals**: 8 deals sorted by Deal Rating from CheapShark
- **Top Rated on Sale**: 8 deals with Metacritic ≥ 75
- **Sales calendar CTA**: Links to `/calendar`
- Fetches data client-side via `/api/deals`

### Browse Deals (`/deals`) — Client Component
- Grid/list view toggle
- **FilterSidebar** with: sort (6 options), price range, Metacritic threshold, Steam rating, store filter
- Pagination (20 deals/page)
- Each DealCard links to `/game/[steamAppId]` if Steam ID available, else external CheapShark redirect

### Game Detail (`/game/[steamAppId]`) — Client Component
- Combines data from **two APIs**: CheapShark (via `/api/games?steamAppID=`) + Steam (via `/api/game-detail?appids=`)
- Header image, genres, description, platforms (Win/Mac/Linux), developer, release date
- Current price with discount badge
- **PriceHistoryChart**: Recharts line chart with "Cheapest Ever" reference line
- **StoreComparison**: Sorted table of prices across all stores
- Screenshots gallery (first 4)
- PC system requirements

### Sales Calendar (`/calendar`) — Client Component
- Reads from `data/steam-sales-calendar.json`
- Events marked LIVE (green pulse) / UPCOMING (magenta) / PAST (grayed)
- Google Calendar integration links for future events
- Countdown widget for next upcoming sale

## Data Sources & API Integration

### CheapShark API (Primary deals source)
- Free, no API key required. Base URL: `https://www.cheapshark.com/api/1.0`
- `GET /deals` — Current deals list (paginated). Key params: `storeID=1` (Steam), `pageSize`, `sortBy`, `upperPrice`, `lowerPrice`, `metacritic`, `steamRating`, `onSale=1`
- `GET /deals?id={dealID}` — Single deal detail
- `GET /games?title={query}` — Search games by title
- `GET /games?id={gameID}` — Game detail + full price history + cheapestPriceEver
- `GET /games?steamAppID={id}` — Lookup by Steam app ID
- `GET /stores` — List of all tracked stores
- `storeID=1` = Steam. Always filter by this for Steam-focused view.
- CORS not enabled — **must use Next.js API routes as proxy**.
- Rate limiting: ~1 req/sec recommended.
- **Important:** CheapShark blocks requests without a proper `User-Agent` header (returns 403). All API routes include `User-Agent: SteamDealsHub/1.0 (Next.js; Vercel)`.

### Steam Storefront API (Complementary data)
- Free, no API key. Base URL: `https://store.steampowered.com`
- `GET /api/appdetails/?appids={id}` — Full game details (rate-limited ~200 req/5min)
- `GET /api/featuredcategories/` — Featured categories (specials, new releases, top sellers)
- `cc` param sets country code for regional pricing.

### Steam Sale Calendar (Static data)
- Maintained in `/data/steam-sales-calendar.json`
- Contains 2026 events: 4 seasonal sales + 7 themed fests
- Update source: https://steamdb.info/sales/history/ (check quarterly)

## API Route Conventions
All routes in `app/api/` follow these patterns:
- `export const dynamic = 'force-dynamic'` — no caching, fresh data on every request
- Custom `User-Agent` header on all outbound fetches (CheapShark requires it)
- `res.ok` check with 502 response if upstream API fails
- `console.error` logging for debugging in Vercel function logs
- Return `NextResponse.json(data)` on success, `{ error: string }` on failure

## Design System — "Neon Arcade"

### Colors (defined in `globals.css` @theme + `tailwind.config.ts`)
| Token           | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| `background`   | `#0A0A0F` | Page background                |
| `surface`      | `#12121A` | Card backgrounds               |
| `surface-light`| `#1A1A25` | Elevated surfaces              |
| `cyan`         | `#00F0FF` | Primary accent, links, CTAs    |
| `cyan-dark`    | `#00B8C4` | Cyan hover/active states       |
| `magenta`      | `#FF2D6B` | Discount badges, highlights    |
| `magenta-dark` | `#CC2456` | Magenta hover/active states    |
| `muted`        | `#8888AA` | Secondary text                 |

### CSS Utilities (globals.css)
- `.glass-card` — Glassmorphism with `backdrop-filter: blur(12px)`, subtle border, hover glow + lift
- `.shimmer` — Skeleton loading animation
- `.glow-cyan` / `.glow-magenta` — Box shadow glow effects
- Custom scrollbar styling (webkit)

### Typography
- **Headings**: System UI fallback (`Segoe UI`, system-ui) — via `font-heading`
- **Body**: System UI fallback — via `font-body`
- **Prices/Mono**: `Cascadia Code`, `Fira Code`, `Consolas` — via `font-mono`

## Dependencies
| Package        | Version | Purpose                          |
|---------------|---------|----------------------------------|
| next          | 16.2    | App framework                    |
| react         | 19.2    | UI library                       |
| tailwindcss   | 4.2     | Styling (uses v4 @theme syntax)  |
| recharts      | 3.8     | Price history charts             |
| date-fns      | 4.1     | Date formatting in calendar      |
| lucide-react  | 0.577   | Icons throughout the app         |
| typescript    | 5.9     | Type safety                      |

## Image Configuration
`next.config.js` allows images from:
- `cdn.akamai.steamstatic.com` (game thumbnails)
- `shared.akamai.steamstatic.com` (shared assets)
- `store.akamai.steamstatic.com` (store assets)
- `steamcdn-a.akamaihd.net` (legacy CDN)
- `www.cheapshark.com` (CheapShark thumbnails)
- Also uses `shared.fastly.steamstatic.com` (may need adding if images break)

## Monetization

### Affiliate Links (CheapShark)
- All outbound "buy" links go through `getAffiliateLink()` in `lib/affiliate.ts`
- URL format: `https://www.cheapshark.com/redirect?dealID={id}` (appends `&tag=X` if `NEXT_PUBLIC_CHEAPSHARK_TAG` is set)
- Click tracking fires a beacon to `/api/track-click` (currently logs to console; connect to DB when ready)
- `DealCard.tsx` and `StoreComparison.tsx` both use affiliate links with tracking
- `AffiliateLink.tsx` is a reusable component for any future affiliate link placements

### Ad Placements
- `AdBanner.tsx` renders placeholder ad slots that activate when `NEXT_PUBLIC_ADSENSE_PUB_ID` is set
- Current placement slots:
  - `in-feed` — Homepage between Top Deals and Top Rated sections
  - `banner-bottom` — Homepage before the sales calendar CTA
  - `sidebar` — Deals page sidebar below filters (desktop only)
  - `banner-top` — Game detail page between price comparison and screenshots
- To activate ads:
  1. Set `NEXT_PUBLIC_ADSENSE_PUB_ID` env var with your Google AdSense publisher ID
  2. Add the AdSense script tag to `layout.tsx` `<head>`
  3. Update AdBanner component to render `<ins className="adsbygoogle" />` elements
- Alternative providers: Carbon Ads, Nitropay, Playwire (see AdBanner.tsx comments)

### Click Tracking API (`/api/track-click`)
- Receives POST from `navigator.sendBeacon()` — non-blocking, fire-and-forget
- Logs `dealID`, `storeName`, timestamp, IP, and UA to Vercel function logs
- To persist: connect to Vercel KV, Upstash Redis, or Vercel Postgres

## Environment Variables
```
NEXT_PUBLIC_SITE_URL=https://game-discount-nine.vercel.app
NEXT_PUBLIC_ADSENSE_PUB_ID=          # Google AdSense publisher ID (optional, enables ads)
NEXT_PUBLIC_CHEAPSHARK_TAG=          # CheapShark affiliate tag (optional, register at cheapshark.com)
STEAM_COUNTRY_CODE=us
```

## Key Development Notes
- Always proxy external API calls through `/api/` routes (CORS + User-Agent)
- All API routes must include `User-Agent` header — CheapShark returns 403 without it
- Don't spam Steam API on build — all pages are client components or force-dynamic
- Homepage, deals, and game detail pages are all `'use client'` components
- The `lib/cheapshark.ts` client is for browser-side use (calls `/api/` routes, not CheapShark directly)
- `lib/steam.ts` exists but is unused — Steam calls go through `/api/game-detail` and `/api/featured`
- Tailwind v4 uses `@theme` directive in `globals.css` for CSS variables (not `@apply` theme)
- No test framework is configured yet
- No linter plugins beyond default Next.js ESLint config

## Known Issues & Gotchas
- CheapShark's `sortBy` param uses spaces (e.g. `Deal Rating`) — URL-encode properly
- Some games lack a `steamAppID` in CheapShark data — those link externally instead of to `/game/[id]`
- Steam `appdetails` is rate-limited (~200 req/5min) — avoid batch fetching
- `shared.fastly.steamstatic.com` may serve thumbnails not covered by `next.config.js` image patterns
- Price values from CheapShark are strings, not numbers — always parse before comparing
