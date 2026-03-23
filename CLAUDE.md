# Steam Deals Hub

## Project Overview
A publicly deployed Next.js web application that aggregates current Steam game discounts, displays upcoming Steam sale events, and provides user accounts with price alerts and email notifications. Combines multiple free APIs for a comprehensive, real-time view of PC gaming deals.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript 5.9
**Database:** Neon (Vercel Postgres) + Drizzle ORM
**Auth:** JWT sessions with HTTP-only cookies (bcryptjs + jose)
**Email:** Resend for transactional emails
**Deploy target:** Vercel
**Live URL:** https://steam-deals-hub.coupons
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
│   ├── layout.tsx                 # Root layout, metadata, Navbar + Footer + AuthProvider
│   ├── page.tsx                   # Homepage (client component)
│   ├── deals/page.tsx             # Deals browser with filters & pagination
│   ├── game/[steamAppId]/page.tsx # Game detail page
│   ├── calendar/page.tsx          # Sales calendar
│   ├── free-games/page.tsx        # Free games discovery page
│   ├── watchlist/page.tsx         # User watchlist & price alerts
│   ├── settings/page.tsx          # User settings & notification preferences
│   ├── sitemap.ts                 # Dynamic sitemap generation
│   ├── robots.ts                  # Robots.txt generation
│   └── api/
│       ├── deals/route.ts         # Proxy → CheapShark /deals
│       ├── games/route.ts         # Proxy → CheapShark /games
│       ├── game-detail/route.ts   # Proxy → Steam /api/appdetails
│       ├── featured/route.ts      # Proxy → Steam /api/featuredcategories
│       ├── search/route.ts        # Proxy → CheapShark /games?title=
│       ├── track-click/route.ts   # Affiliate click tracking (logs to DB)
│       ├── free-games/route.ts    # Aggregates free games from CheapShark
│       ├── genres/route.ts        # Genre data with DB caching layer
│       ├── auth/
│       │   ├── signup/route.ts    # Email/password registration
│       │   ├── login/route.ts     # Credential verification + session
│       │   ├── logout/route.ts    # Session destruction
│       │   └── me/route.ts        # Current user info
│       ├── watchlist/route.ts     # GET list, POST add to watchlist
│       ├── alerts/route.ts        # PATCH update, DELETE remove alerts
│       ├── db-migrate/route.ts    # Schema initialization (protected by CRON_SECRET)
│       ├── email/
│       │   ├── subscriptions/route.ts  # GET/POST/PATCH email preferences
│       │   └── unsubscribe/route.ts    # One-click unsubscribe
│       └── cron/
│           ├── check-alerts/route.ts   # Every 6h: check prices vs alert targets
│           ├── free-games/route.ts     # Daily 8 AM: discover & notify free games
│           └── weekly-digest/route.ts  # Monday 10 AM: top deals email
├── components/
│   ├── Navbar.tsx                 # Sticky nav with search, auth menu, mobile hamburger
│   ├── Footer.tsx                 # Attribution footer
│   ├── DealCard.tsx               # Deal card with affiliate links + watchlist button
│   ├── DealsGrid.tsx              # Responsive grid container with skeleton loading
│   ├── FilterSidebar.tsx          # Filters: sort, price, metacritic, rating, genre
│   ├── SearchBar.tsx              # Debounced autocomplete search (300ms)
│   ├── PriceHistoryChart.tsx      # Recharts line chart for price trends
│   ├── StoreComparison.tsx        # Multi-store price table with affiliate tracking
│   ├── SaleCountdown.tsx          # Live countdown timer for current/next sale
│   ├── SaleCalendar.tsx           # Sale event cards with status badges
│   ├── AdBanner.tsx               # Google AdSense ad placements
│   ├── AffiliateLink.tsx          # Reusable affiliate link with click tracking
│   ├── AuthProvider.tsx           # React Context for global auth state + useAuth() hook
│   ├── AuthModal.tsx              # Login/Signup modal with form validation
│   └── WatchlistButton.tsx        # Bookmark toggle for deal cards & game detail
├── lib/
│   ├── affiliate.ts               # Affiliate URL builder + click tracking helpers
│   ├── cheapshark.ts              # CheapShark API client (browser-side, calls /api/ routes)
│   ├── steam.ts                   # Steam API client (unused — steam calls go through /api/)
│   ├── types.ts                   # All TypeScript interfaces
│   ├── utils.ts                   # Formatting helpers, cn(), time utilities
│   ├── auth.ts                    # JWT session helpers (createSession, getSession, requireAuth)
│   ├── db/
│   │   ├── index.ts               # Drizzle client singleton (lazy-loaded)
│   │   ├── schema.ts              # DB schema: users, priceAlerts, emailSubscriptions, clickTracking, gameGenres
│   │   └── migrate.ts             # Schema push/migration logic
│   └── email/
│       └── index.ts               # Resend client + email templates (price alert, free game, weekly digest)
├── data/
│   └── steam-sales-calendar.json  # Static sale events (update quarterly from steamdb.info)
├── vercel.json                    # Cron job schedules
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
- **FilterSidebar** with: sort (6 options), price range, Metacritic threshold, Steam rating, store filter, genre filter (15 genres)
- Pagination (20 deals/page)
- Each DealCard links to `/game/[steamAppId]` if Steam ID available, else external CheapShark redirect
- WatchlistButton on each card (requires auth)

### Game Detail (`/game/[steamAppId]`) — Client Component
- Combines data from **two APIs**: CheapShark (via `/api/games?steamAppID=`) + Steam (via `/api/game-detail?appids=`)
- Header image, genres, description, platforms (Win/Mac/Linux), developer, release date
- Current price with discount badge
- **PriceHistoryChart**: Recharts line chart with "Cheapest Ever" reference line
- **StoreComparison**: Sorted table of prices across all stores
- Screenshots gallery (first 4)
- PC system requirements
- WatchlistButton to track the game

### Sales Calendar (`/calendar`) — Client Component
- Reads from `data/steam-sales-calendar.json`
- Events marked LIVE (green pulse) / UPCOMING (magenta) / PAST (grayed)
- Google Calendar integration links for future events
- Countdown widget for next upcoming sale

### Free Games (`/free-games`) — Client Component
- Aggregates currently free games from CheapShark (upperPrice=0)
- Displays game cards with thumbnails, store links, expiration info
- WatchlistButton integration

### Watchlist (`/watchlist`) — Client Component (Auth Required)
- Lists all user's watched games with live prices
- Shows current prices, discount percentages, thumbnails
- Edit/delete watchlist items
- Set alert targets (price or percentage threshold)
- Visual status indicators for active/inactive alerts

### Settings (`/settings`) — Client Component (Auth Required)
- Email notification preferences (free games, weekly deals, sale alerts)
- Active price alerts management (edit/delete)
- Account info display

## Database Schema

Six tables defined in `lib/db/schema.ts` (Drizzle ORM):

| Table                | Purpose                                      |
|---------------------|----------------------------------------------|
| `users`             | Email, password hash, verified status, verify token |
| `priceAlerts`       | User watchlist items with target price/pct thresholds |
| `emailSubscriptions`| Subscription types per user (free_games, weekly_deals, sale_alerts) |
| `clickTracking`     | Affiliate click logs with deal ID, store, IP, UA |
| `gameGenres`        | Cached genre data per Steam app ID (JSONB)   |

**Migration:** Hit `POST /api/db-migrate` with `Authorization: Bearer <CRON_SECRET>` to create all tables.

## Authentication

- **Signup**: Email + password → bcryptjs hash → stored in `users` table
- **Login**: Password verified → JWT signed with `jose` → HTTP-only cookie (30-day expiry)
- **Session**: `requireAuth()` helper checks cookie on protected API routes
- **Client**: `AuthProvider` context wraps app, exposes `useAuth()` hook with `login()`, `signup()`, `logout()`, `refresh()`
- **AuthModal**: Shared login/signup modal triggered from Navbar

## Email Notifications

- **Provider**: Resend (free tier: 3,000 emails/month)
- **Graceful fallback**: Logs to console when `RESEND_API_KEY` not set
- **Email types**:
  - Price alert triggered (target price/discount hit)
  - Free game discovered
  - Weekly top deals digest
- **Unsubscribe**: One-click unsubscribe with signed tokens via `/api/email/unsubscribe`

## Cron Jobs (vercel.json)

| Schedule           | Route                      | Purpose                              |
|-------------------|----------------------------|--------------------------------------|
| Every 6 hours     | `/api/cron/check-alerts`   | Check active alerts vs current prices |
| Daily 8 AM UTC    | `/api/cron/free-games`     | Discover new free games, send alerts  |
| Monday 10 AM UTC  | `/api/cron/weekly-digest`  | Email top 10 deals to subscribers     |

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
- Auth-protected routes use `requireAuth()` from `lib/auth.ts`

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
| Package              | Version | Purpose                          |
|---------------------|---------|----------------------------------|
| next                | 16.2    | App framework                    |
| react               | 19.2    | UI library                       |
| tailwindcss          | 4.2     | Styling (uses v4 @theme syntax)  |
| recharts             | 3.8     | Price history charts             |
| date-fns             | 4.1     | Date formatting in calendar      |
| lucide-react         | 0.577   | Icons throughout the app         |
| typescript           | 5.9     | Type safety                      |
| drizzle-orm          | 0.45    | Type-safe database ORM           |
| drizzle-kit          | 0.31    | Drizzle migrations/tooling       |
| @neondatabase/serverless | 1.0 | Neon Postgres driver             |
| bcryptjs             | 3.0     | Password hashing                 |
| jose                 | 6.2     | JWT signing/verification         |
| resend               | 6.9     | Transactional email delivery     |
| @vercel/analytics    | —       | Vercel Analytics integration     |

## Image Configuration
`next.config.js` allows images from:
- `cdn.akamai.steamstatic.com` (game thumbnails)
- `shared.akamai.steamstatic.com` (shared assets)
- `store.akamai.steamstatic.com` (store assets)
- `steamcdn-a.akamaihd.net` (legacy CDN)
- `www.cheapshark.com` (CheapShark thumbnails)
- Also uses `shared.fastly.steamstatic.com` (may need adding if images break)

## Monetization

### Affiliate Links (CheapShark + Direct Store)
- All outbound "buy" links go through `getAffiliateLink()` in `lib/affiliate.ts`
- CheapShark redirect URL: `https://www.cheapshark.com/redirect?dealID={id}`
- Direct store affiliate links for: Fanatical, GOG, Humble, Green Man Gaming, GamersGate
- Click tracking fires a beacon to `/api/track-click` (persists to DB via `clickTracking` table)
- `DealCard.tsx` and `StoreComparison.tsx` both use affiliate links with tracking
- `AffiliateLink.tsx` is a reusable component for any future affiliate link placements

### Ad Placements (Google AdSense)
- `AdBanner.tsx` renders ad slots activated by `NEXT_PUBLIC_ADSENSE_PUB_ID`
- Current placement slots:
  - `in-feed` — Homepage between Top Deals and Top Rated sections
  - `banner-bottom` — Homepage before the sales calendar CTA
  - `sidebar` — Deals page sidebar below filters (desktop only)
  - `banner-top` — Game detail page between price comparison and screenshots

### Click Tracking API (`/api/track-click`)
- Receives POST from `navigator.sendBeacon()` — non-blocking, fire-and-forget
- Logs `dealID`, `storeName`, timestamp, IP, and UA to `clickTracking` DB table

## Environment Variables
```
# ─── Site ───────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://steam-deals-hub.coupons
STEAM_COUNTRY_CODE=us

# ─── Database (Neon / Vercel Postgres) ────────────────────────
POSTGRES_URL=postgresql://...

# ─── Auth ─────────────────────────────────────────────────────
JWT_SECRET=<openssl rand -hex 32>

# ─── Email (Resend) ──────────────────────────────────────────
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=Steam Deals Hub <alerts@steam-deals-hub.coupons>

# ─── Cron Security ───────────────────────────────────────────
CRON_SECRET=<any secret string>

# ─── Affiliate Programs ──────────────────────────────────────
NEXT_PUBLIC_CHEAPSHARK_TAG=          # CheapShark affiliate tag
NEXT_PUBLIC_FANATICAL_AFFILIATE_ID=
NEXT_PUBLIC_GOG_AFFILIATE_ID=
NEXT_PUBLIC_HUMBLE_PARTNER_ID=
NEXT_PUBLIC_GMG_AFFILIATE_ID=
NEXT_PUBLIC_GAMERSGATE_AFFILIATE_ID=

# ─── Ads ─────────────────────────────────────────────────────
NEXT_PUBLIC_ADSENSE_PUB_ID=          # Google AdSense publisher ID
NEXT_PUBLIC_AD_SLOT_BANNER_TOP=
NEXT_PUBLIC_AD_SLOT_SIDEBAR=
NEXT_PUBLIC_AD_SLOT_IN_FEED=
NEXT_PUBLIC_AD_SLOT_BANNER_BOTTOM=
```

## Key Development Notes
- Always proxy external API calls through `/api/` routes (CORS + User-Agent)
- All API routes must include `User-Agent` header — CheapShark returns 403 without it
- Don't spam Steam API on build — all pages are client components or force-dynamic
- Homepage, deals, and game detail pages are all `'use client'` components
- The `lib/cheapshark.ts` client is for browser-side use (calls `/api/` routes, not CheapShark directly)
- `lib/steam.ts` exists but is unused — Steam calls go through `/api/game-detail` and `/api/featured`
- Tailwind v4 uses `@theme` directive in `globals.css` for CSS variables (not `@apply` theme)
- DB connection uses lazy-loaded singleton pattern via `@neondatabase/serverless`
- Auth routes set HTTP-only cookies; client reads auth state via `/api/auth/me`
- Cron jobs are protected by `CRON_SECRET` (Vercel sets this automatically)
- No test framework is configured yet
- No linter plugins beyond default Next.js ESLint config

## Post-Deploy Setup
1. Set all environment variables in Vercel dashboard
2. Deploy the app
3. Run DB migration: `curl -H "Authorization: Bearer <CRON_SECRET>" https://steam-deals-hub.coupons/api/db-migrate`
4. Verify cron jobs in Vercel dashboard (Settings → Cron Jobs)
5. Submit sitemap to Google Search Console: `https://steam-deals-hub.coupons/sitemap.xml`

## Known Issues & Gotchas
- CheapShark's `sortBy` param uses spaces (e.g. `Deal Rating`) — URL-encode properly
- Some games lack a `steamAppID` in CheapShark data — those link externally instead of to `/game/[id]`
- Steam `appdetails` is rate-limited (~200 req/5min) — avoid batch fetching
- `shared.fastly.steamstatic.com` may serve thumbnails not covered by `next.config.js` image patterns
- Price values from CheapShark are strings, not numbers — always parse before comparing
- Email verification flow exists in schema (`verify_token`) but is not fully wired up yet
- Genre filtering is client-side post-fetch (CheapShark doesn't support genre params)
