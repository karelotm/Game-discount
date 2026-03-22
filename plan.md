# Steam Deals Hub — Feature Expansion Plan

## Overview

Add persistent storage, user engagement features, and better filtering to transform the app from a stateless aggregator into a full-featured deals platform.

---

## Phase 1: Database & Auth Foundation

### 1.1 — Add Vercel Postgres (via Drizzle ORM)

- Install: `drizzle-orm`, `drizzle-kit`, `@vercel/postgres`
- Create `lib/db/` with schema and client
- **Schema tables:**

```
users
  id            UUID (PK)
  email         TEXT UNIQUE NOT NULL
  password_hash TEXT (nullable — for future OAuth)
  verified      BOOLEAN DEFAULT false
  verify_token  TEXT
  created_at    TIMESTAMP

price_alerts
  id            UUID (PK)
  user_id       UUID (FK → users)
  game_title    TEXT
  steam_app_id  TEXT
  cheapshark_game_id TEXT
  target_price  DECIMAL       -- trigger when price ≤ this
  target_pct    INTEGER       -- OR trigger when discount ≥ this %
  current_price DECIMAL
  is_active     BOOLEAN DEFAULT true
  last_checked  TIMESTAMP
  last_notified TIMESTAMP
  created_at    TIMESTAMP

email_subscriptions
  id            UUID (PK)
  user_id       UUID (FK → users)
  type          TEXT          -- 'free_games' | 'weekly_deals' | 'sale_alerts'
  is_active     BOOLEAN DEFAULT true
  created_at    TIMESTAMP

click_tracking
  id            UUID (PK)
  deal_id       TEXT
  store_name    TEXT
  user_id       UUID (nullable)
  ip            TEXT
  user_agent    TEXT
  created_at    TIMESTAMP
```

### 1.2 — Simple Email/Password Auth (no third-party providers)

- API routes: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/verify-email`
- Session via HTTP-only secure cookie (JWT or signed token)
- No heavy auth library — lightweight custom implementation with `bcrypt` for password hashing
- Install: `bcryptjs`, `jose` (for JWT)
- Auth context provider component wrapping the app
- Simple login/signup modal (reuse glass-card styling)

---

## Phase 2: Price Alerts & Watchlist

### 2.1 — Watchlist / Saved Games

- New page: `/watchlist` (requires auth)
- "Add to Watchlist" button on DealCard and game detail page (heart/bookmark icon)
- Stores `steam_app_id` + `game_title` in `price_alerts` table (no target = just watching)
- Watchlist page shows current prices fetched live from CheapShark

### 2.2 — Price Alerts with Target Price/Percentage

- On watchlist or game detail page: "Set Alert" form
  - Target price input (e.g. "$9.99")
  - OR target discount % (e.g. "75% off")
- API route: `/api/alerts` (CRUD)
- Alert check via **Vercel Cron Job** (`vercel.json` cron):
  - Runs every 6 hours
  - `/api/cron/check-alerts` — fetches current prices from CheapShark for all active alerts
  - If price ≤ target or discount ≥ target%, trigger email notification
  - Update `last_checked` / `last_notified` timestamps

---

## Phase 3: Email Notifications

### 3.1 — Email Infrastructure

- Use **Resend** (free tier: 3,000 emails/month, perfect for this scale)
- Install: `resend`
- Env var: `RESEND_API_KEY`
- Email templates in `lib/email/templates/`:
  - `price-alert.tsx` — "Game X is now $Y (your target: $Z)"
  - `free-game.tsx` — "Free game available: Game X"
  - `weekly-deals.tsx` — "This week's top deals"
  - `verify-email.tsx` — "Verify your email address"

### 3.2 — Email Subscription Types

- **Price alerts** — triggered by cron when target is hit (Phase 2)
- **Free game alerts** — triggered when free games are detected (Phase 4)
- **Weekly deals digest** — cron job sends top 10 deals every Monday
- **Sale event reminders** — triggered 1 day before a Steam sale from the calendar

### 3.3 — Unsubscribe Flow

- Each email includes a one-click unsubscribe link with signed token
- `/api/email/unsubscribe?token=xxx` — deactivates specific subscription
- User settings page to manage all subscriptions

---

## Phase 4: Free Games Discovery

### 4.1 — Free Games Page (`/free-games`)

- **Source 1:** CheapShark API — filter deals where `salePrice` = "0.00" (`upperPrice=0`)
- **Source 2:** Static/scraped data for Epic Games Store free weekly games (use a public RSS/JSON source or manual updates)
- API route: `/api/free-games` — aggregates both sources
- Page displays:
  - Currently free games (permanent free-to-play + temporarily free)
  - "Free this week" section for rotating free offers
  - Countdown timers for expiring free offers
- Each game card links to store page or game detail

### 4.2 — Free Game Email Alerts

- Cron job checks for new free games daily
- Sends email to subscribers opted into `free_games` subscription type
- Stores previously-seen free games to avoid duplicate notifications

---

## Phase 5: Genre Filtering

### 5.1 — Genre Data Strategy

CheapShark does NOT include genre data in its API. Strategy:

- When a deal is loaded that has a `steamAppID`, fetch genre from Steam API and **cache it in DB**
- New table:

```
game_genres
  steam_app_id  TEXT (PK)
  genres        JSONB        -- e.g. ["Action", "Adventure", "RPG"]
  cached_at     TIMESTAMP
```

- API route: `/api/genres` — returns list of known genres from cache
- Background: when deals page loads, for any deal missing genre cache, fire a request to Steam API and store it (rate-limited, async)

### 5.2 — Genre Filter UI in FilterSidebar

- Add genre multi-select filter to `FilterSidebar.tsx`
- Common genres: Action, Adventure, RPG, Strategy, Simulation, Indie, Sports, Racing, Puzzle, Horror, FPS, Open World
- Client-side filtering: fetch deals from CheapShark, cross-reference genre cache, filter by selected genres
- Show "genre loading" state for games not yet cached

---

## Phase 6: Navbar & Settings Updates

### 6.1 — Navbar Updates

- Add user auth button (login/signup or avatar+dropdown when logged in)
- Add `/free-games` link
- Add `/watchlist` link (visible when logged in)

### 6.2 — User Settings Page (`/settings`)

- Email notification preferences (toggle each subscription type)
- Active price alerts list with edit/delete
- Account info (email, change password)
- Delete account option

---

## New Dependencies

| Package | Purpose |
|---------|---------|
| `drizzle-orm` | Database ORM |
| `drizzle-kit` | Schema migrations |
| `@vercel/postgres` | Vercel Postgres driver |
| `bcryptjs` | Password hashing |
| `jose` | JWT token signing/verification |
| `resend` | Email sending |

## New Environment Variables

```
# Database (Vercel Postgres — auto-set by Vercel when you add the addon)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Auth
JWT_SECRET=            # Random 256-bit secret for signing tokens

# Email
RESEND_API_KEY=        # From resend.com dashboard
RESEND_FROM_EMAIL=     # e.g. alerts@steam-deals-hub.coupons
```

## Vercel Cron Jobs (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/check-alerts", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/free-games",   "schedule": "0 8 * * *" },
    { "path": "/api/cron/weekly-digest", "schedule": "0 10 * * 1" }
  ]
}
```

## Implementation Order

1. **Phase 1** — DB + Auth (foundation for everything else)
2. **Phase 5** — Genre Filtering (quick win, no auth required)
3. **Phase 2** — Watchlist + Price Alerts
4. **Phase 3** — Email Notifications
5. **Phase 4** — Free Games
6. **Phase 6** — Navbar + Settings polish

Phase 5 (genres) is moved up because it's user-facing, doesn't depend on auth, and improves the deals page immediately.
