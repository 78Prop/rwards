-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  email TEXT NOT NULL UNIQUE,
  btc_address TEXT,
  created_at INTEGER NOT NULL,
  last_login INTEGER
);

-- Create mining_rigs table 
CREATE TABLE IF NOT EXISTS mining_rigs (
  rig_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rig_name TEXT NOT NULL,
  hardware TEXT NOT NULL,
  pool_id TEXT NOT NULL,
  hash_capacity REAL,
  total_shares INTEGER DEFAULT 0,
  accepted_shares INTEGER DEFAULT 0,
  rejected_shares INTEGER DEFAULT 0,
  total_earned REAL DEFAULT 0,
  status TEXT DEFAULT 'offline',
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- Create pool_connections table
CREATE TABLE IF NOT EXISTS pool_connections (
  rig_id TEXT NOT NULL,
  pool_id TEXT NOT NULL,
  shares_submitted INTEGER DEFAULT 0,
  shares_accepted INTEGER DEFAULT 0,
  hash_rate REAL,
  last_update INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (rig_id) REFERENCES mining_rigs (rig_id)
);

-- Create miner_balances table
CREATE TABLE IF NOT EXISTS miner_balances (
  rig_id TEXT NOT NULL,
  pool_id TEXT NOT NULL,
  pending_balance REAL,
  confirmed_balance REAL,
  total_earned REAL,
  last_payout INTEGER,
  FOREIGN KEY (rig_id) REFERENCES mining_rigs (rig_id)
);

-- Create mining_rewards table
CREATE TABLE IF NOT EXISTS mining_rewards (
  rig_id TEXT NOT NULL,
  pool_id TEXT NOT NULL,
  user_id TEXT,
  reward_type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BTC',
  amount REAL NOT NULL,
  share_contribution REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (rig_id) REFERENCES mining_rigs (rig_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);
