# Steam Deals Hub

## Project Overview
A publicly deployable Next.js web application that aggregates current Steam game discounts and displays upcoming Steam sale events. Combines multiple free APIs for a comprehensive, real-time view of PC gaming deals.

**Stack:** Next.js 14+ (App Router), Tailwind CSS, TypeScript
**Deploy target:** Vercel
**APIs:** CheapShark + Steam Storefront (unofficial) + static Steam sale calendar data

## Data Sources & API Integration

### CheapShark API (Primary deals source)
- Free, no API key required. Base URL: `https://www.cheapshark.com/api/1.0`
- `GET /deals` — Current deals list (paginated). Params: `storeID=1` (Steam only), `pageSize=60`, `sortBy`, `upperPrice`, `lowerPrice`, `metacritic`, `steamRating`, `onSale=1`
- `GET /deals?id={dealID}` — Single deal detail
- `GET /games?title={query}` — Search games by title
- `GET /games?id={gameID}` — Game detail + price history
- `GET /stores` — List of all tracked stores
- `storeID=1` = Steam. Always filter by this for Steam-focused view.
- CORS not enabled — use Next.js API routes as proxy.
- Rate limiting: ~1 req/sec recommended.

### Steam Storefront API (Complementary data)
- Free, no API key. Base URL: `https://store.steampowered.com`
- `GET /api/featured/` — Featured items on homepage
- `GET /api/featuredcategories/` — Featured categories (specials, new releases, top sellers)
- `GET /api/appdetails/?appids={id}` — Full game details (rate-limited ~200 req/5min)
- `GET /search/results/?specials=1&json=1&page={n}` — Search specials
- `discount_expiration` gives UNIX timestamp for countdown timers.
- `cc` param sets country code for regional pricing.

### Steam Sale Calendar (Static data)
- Maintained in `/data/steam-sales-calendar.json`
- Update source: https://steamdb.info/sales/history/ (check quarterly)

## Architecture

```
steam-deals-hub/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Homepage
│   ├── deals/page.tsx          # Deals browser with filters & pagination
│   ├── game/[steamAppId]/page.tsx # Game detail page
│   ├── calendar/page.tsx       # Sales calendar
│   └── api/
│       ├── deals/route.ts      # Proxy → CheapShark /deals
│       ├── games/route.ts      # Proxy → CheapShark /games
│       ├── game-detail/route.ts # Proxy → Steam /api/appdetails
│       ├── featured/route.ts   # Proxy → Steam /api/featuredcategories
│       └── search/route.ts     # Combined search proxy
├── components/                 # React components
├── lib/
│   ├── cheapshark.ts           # CheapShark API client
│   ├── steam.ts                # Steam API client
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Helpers
├── data/
│   └── steam-sales-calendar.json
└── public/store-icons/
```

## Caching Strategy
- Deals list: revalidate every 5 minutes
- Game details (Steam appdetails): revalidate every 1 hour
- Featured/specials: revalidate every 15 minutes
- Sale calendar: static import, no revalidation

## Design Direction — "Neon Arcade"
- Background: Deep charcoal (`#0A0A0F`)
- Primary accent: Electric cyan (`#00F0FF`)
- Secondary accent: Hot magenta (`#FF2D6B`)
- Cards: Glassmorphism with blur backdrop
- Fonts: Rajdhani (headlines), DM Sans (body), JetBrains Mono (prices)

## Environment Variables
```
NEXT_PUBLIC_SITE_URL=https://steamdealshub.vercel.app
STEAM_COUNTRY_CODE=us
```

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run linter
```

## Key Notes
- Always proxy external API calls through /api/ routes (CORS)
- Don't spam Steam API on build — use ISR, not SSG for dynamic data
- Configure `images.remotePatterns` for Steam CDN domains
