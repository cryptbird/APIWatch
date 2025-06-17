/**
 * Database connection and exports for APIWatch core.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

export function createDbPool(connectionString: string): pg.Pool {
  return new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export function createDrizzle(pool: pg.Pool) {
  return drizzle(pool, { schema });
}

export * from './schema.js';
