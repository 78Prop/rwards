import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { users, miningRigs, poolConnections, minerBalances, miningRewards, withdrawals } from './schema.js';

async function createTables() {
  try {
    console.log('Creating tables...');

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'user',
        email TEXT NOT NULL UNIQUE,
        btc_address TEXT,
        created_at INTEGER NOT NULL,
        last_login INTEGER
      )
    `);

    await db.run(`
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
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS pool_connections (
        rig_id TEXT NOT NULL,
        pool_id TEXT NOT NULL,
        shares_submitted INTEGER DEFAULT 0,
        shares_accepted INTEGER DEFAULT 0,
        hash_rate REAL,
        last_update INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (rig_id) REFERENCES mining_rigs(rig_id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS miner_balances (
        rig_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        pool_id TEXT NOT NULL,
        pending_balance REAL DEFAULT 0,
        confirmed_balance REAL DEFAULT 0,
        total_earned REAL DEFAULT 0,
        last_payout INTEGER,
        PRIMARY KEY (rig_id, pool_id),
        FOREIGN KEY (rig_id) REFERENCES mining_rigs(rig_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    await db.run(`
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
        FOREIGN KEY (rig_id) REFERENCES mining_rigs(rig_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    await db.run(`
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
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

async function dropTables() {
  try {
    // Drop in reverse order of dependencies
    const tables = ["withdrawals", "mining_rewards", "miner_balances", "pool_connections", "mining_rigs", "users"];
    for (const tableName of tables) {
      console.log(`Dropping table ${tableName}...`);
      await db.run(`DROP TABLE IF EXISTS ${tableName}`);
    }
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}

async function initialize() {
  try {
    await dropTables();
    await createTables();
    // Create admin user
    const userId = uuidv4();
    await db.insert(users).values({
      userId: userId,
      username: 'admin.user',
      role: 'admin',
      email: 'admin@example.com',
      btcAddress: 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6',
      createdAt: Math.floor(Date.now() / 1000),
      lastLogin: Math.floor(Date.now() / 1000)
    });

    // Create some initial mining rigs for admin
    const pools = ['kloudBugsCafe', 'teraSocialJustice', 'teraToken'];
    const hardwareTypes = ['GPU', 'ASIC', 'CPU'];
    
    for (const pool of pools) {
      // Create rigs for each pool
      for (let i = 0; i < 3; i++) {
        const rigId = uuidv4();
        await db.insert(miningRigs).values({
          rigId: rigId,
          userId: userId,
          rigName: `${pool}-rig-${i + 1}`,
          hardware: hardwareTypes[i % 3],
          poolId: pool,
          hashCapacity: parseFloat(((Math.random() * 100) + 50).toFixed(2)),
          totalShares: Math.floor(Math.random() * 10000),
          acceptedShares: Math.floor(Math.random() * 9000),
          rejectedShares: Math.floor(Math.random() * 1000),
          totalEarned: parseFloat((Math.random() * 0.1).toFixed(8)),
          status: 'online',
          firstSeen: Math.floor(Date.now() / 1000),
          lastSeen: Math.floor(Date.now() / 1000)
        });
      }
    }

    console.log('Admin user and mining rigs initialized with ID:', userId);
    return userId;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to initialize database:', error.message);
    }
    throw error;
  }
}

initialize()
  .then(() => {
    console.log('Database initialization completed successfully');
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
