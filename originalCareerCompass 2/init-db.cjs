const Database = require('better-sqlite3');
const path = require('path');

// Target database
const dbPath = path.resolve(__dirname, 'mining.db');
console.log('Initializing database at:', dbPath);
const db = new Database(dbPath);

// Create schema
db.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'user',
        email TEXT NOT NULL UNIQUE,
        btc_address TEXT,
        created_at INTEGER NOT NULL,
        last_login INTEGER
    );

    -- Mining Pools
    CREATE TABLE IF NOT EXISTS mining_pools (
        pool_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        username TEXT,
        password TEXT
    );

    -- Mining Rigs
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
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (pool_id) REFERENCES mining_pools (pool_id)
    );

    -- Pool Connections
    CREATE TABLE IF NOT EXISTS pool_connections (
        rig_id TEXT NOT NULL,
        pool_id TEXT NOT NULL,
        shares_submitted INTEGER DEFAULT 0,
        shares_accepted INTEGER DEFAULT 0,
        hash_rate REAL,
        last_update INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (rig_id) REFERENCES mining_rigs (rig_id),
        FOREIGN KEY (pool_id) REFERENCES mining_pools (pool_id),
        PRIMARY KEY (rig_id, pool_id)
    );

    -- Miner Balances
    CREATE TABLE IF NOT EXISTS miner_balances (
        rig_id TEXT NOT NULL,
        pool_id TEXT NOT NULL,
        pending_balance REAL DEFAULT 0,
        confirmed_balance REAL DEFAULT 0,
        total_earned REAL DEFAULT 0,
        last_payout INTEGER,
        FOREIGN KEY (rig_id) REFERENCES mining_rigs (rig_id),
        FOREIGN KEY (pool_id) REFERENCES mining_pools (pool_id),
        PRIMARY KEY (rig_id, pool_id)
    );

    -- Mining Rewards
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
        FOREIGN KEY (pool_id) REFERENCES mining_pools (pool_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

    -- Withdrawals
    CREATE TABLE IF NOT EXISTS withdrawals (
        withdrawal_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        btc_address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        tx_hash TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        processed_at INTEGER,
        error TEXT,
        blockcypher_tx_url TEXT,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

    -- Insert default admin user if not exists
    INSERT OR IGNORE INTO users (user_id, username, role, email, created_at)
    VALUES ('1', 'admin', 'admin', 'admin@system', strftime('%s', 'now'));
`);

console.log('Database initialized successfully');
db.close();
