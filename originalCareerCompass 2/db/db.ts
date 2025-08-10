import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database
const sqlite = new Database('mining.db');
sqlite.pragma('foreign_keys = ON');

// Create drizzle database instance
export const db = drizzle(sqlite, { schema });
