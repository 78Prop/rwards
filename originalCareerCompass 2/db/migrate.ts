import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const sqlite = new Database('mining.db');
sqlite.pragma('foreign_keys = ON');

try {
  // Read migration file
  const migration = readFileSync(path.join(__dirname, 'migrations', '0000_initial.sql'), 'utf8');

  // Execute all statements in one go
  sqlite.exec(migration);
  
  console.log('Migration completed successfully');

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
