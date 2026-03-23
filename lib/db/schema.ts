import { pgTable, uuid, text, boolean, timestamp, decimal, integer, jsonb } from 'drizzle-orm/pg-core';

// ── Users ──────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  verified: boolean('verified').default(false).notNull(),
  verifyToken: text('verify_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Price Alerts ───────────────────────────────────────────────
export const priceAlerts = pgTable('price_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  gameTitle: text('game_title').notNull(),
  steamAppId: text('steam_app_id'),
  cheapsharkGameId: text('cheapshark_game_id'),
  targetPrice: decimal('target_price', { precision: 10, scale: 2 }),
  targetPct: integer('target_pct'),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastChecked: timestamp('last_checked'),
  lastNotified: timestamp('last_notified'),
  thumb: text('thumb'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Email Subscriptions ────────────────────────────────────────
export const emailSubscriptions = pgTable('email_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'free_games' | 'weekly_deals' | 'sale_alerts'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Click Tracking ─────────────────────────────────────────────
export const clickTracking = pgTable('click_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  dealId: text('deal_id').notNull(),
  storeName: text('store_name').notNull(),
  userId: uuid('user_id'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Game Genres Cache ──────────────────────────────────────────
export const gameGenres = pgTable('game_genres', {
  steamAppId: text('steam_app_id').primaryKey(),
  genres: jsonb('genres').$type<string[]>().notNull(),
  cachedAt: timestamp('cached_at').defaultNow().notNull(),
});
