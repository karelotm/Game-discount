import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDb() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

// Lazy singleton — only created when first used
let _db: ReturnType<typeof getDb> | null = null;

export function db() {
  if (!_db) _db = getDb();
  return _db;
}

export * from './schema';
