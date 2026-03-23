/**
 * Run this script to create all tables:
 *   npx tsx lib/db/migrate.ts
 *
 * Or use the API route /api/db-migrate (protected by CRON_SECRET).
 *
 * This uses raw SQL rather than drizzle-kit push so we don't need
 * a separate drizzle config file for the Neon driver.
 */
import { neon } from '@neondatabase/serverless';

async function migrate() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    console.error('POSTGRES_URL not set');
    process.exit(1);
  }

  const sql = neon(url);

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT false,
      verify_token TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      game_title TEXT NOT NULL,
      steam_app_id TEXT,
      cheapshark_game_id TEXT,
      target_price DECIMAL(10,2),
      target_pct INTEGER,
      current_price DECIMAL(10,2),
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_checked TIMESTAMP,
      last_notified TIMESTAMP,
      thumb TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS email_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS click_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id TEXT NOT NULL,
      store_name TEXT NOT NULL,
      user_id UUID,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS game_genres (
      steam_app_id TEXT PRIMARY KEY,
      genres JSONB NOT NULL,
      cached_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  console.log('All tables created successfully.');
}

migrate().catch(console.error);
