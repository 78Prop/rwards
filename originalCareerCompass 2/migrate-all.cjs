const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Source databases
const minersDb = new Database(path.resolve(__dirname, '../project2/CareerCompass 2new/miners.db'));
const accountsDb = new Database(path.resolve(__dirname, '../project2/CareerCompass 2new/mining_accounts.db'));
const kloudbugsDb = new Database(path.resolve(__dirname, '../project2/CareerCompass 2new/kloudbugs_mining_real.db'));

// Target database (our current one)
const targetDb = new Database(path.resolve(__dirname, 'mining.db'));

async function migrateAll() {
    try {
        // Start transaction
        targetDb.exec('BEGIN TRANSACTION');

        // 1. First get all pools from source
        console.log('\n=== Migrating Mining Pools ===');
        const pools = minersDb.prepare('SELECT * FROM mining_pools').all();
        for (const pool of pools) {
            try {
                targetDb.prepare(`
                    INSERT OR IGNORE INTO mining_pools (
                        pool_id, name, host, port, username, password, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    pool.id,
                    pool.name,
                    pool.host,
                    pool.port,
                    pool.username,
                    pool.password,
                    pool.created_at,
                    pool.updated_at
                );
                console.log(`Migrated pool: ${pool.name}`);
            } catch (err) {
                console.error(`Error migrating pool ${pool.name}:`, err.message);
            }
        }

        // 2. Migrate all mining rigs
        console.log('\n=== Migrating Mining Rigs ===');
        const rigs = minersDb.prepare('SELECT * FROM mining_rigs').all();
        for (const rig of rigs) {
            try {
                // Get pool assignments for this rig
                const poolAssignment = minersDb.prepare('SELECT * FROM pool_assignments WHERE minerId = ?').get(rig.id);
                
                targetDb.prepare(`
                    INSERT OR IGNORE INTO mining_rigs (
                        rig_id, user_id, rig_name, hardware, pool_id,
                        hash_capacity, total_shares, accepted_shares, rejected_shares,
                        total_earned, status, first_seen, last_seen
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    rig.id,
                    '1', // Default user ID since we're consolidating
                    rig.name,
                    rig.hardware || 'Unknown',
                    poolAssignment?.primaryPool || rig.primary_pool_id,
                    parseFloat(rig.hashrate) || 0,
                    0, // Will update from shares table
                    0,
                    0,
                    0, // Will update from balances
                    rig.status || 'offline',
                    rig.created_at || Date.now(),
                    rig.updated_at || Date.now()
                );
                console.log(`Migrated rig: ${rig.name}`);
            } catch (err) {
                console.error(`Error migrating rig ${rig.name}:`, err.message);
            }
        }

        // 3. Migrate pool connections
        console.log('\n=== Migrating Pool Connections ===');
        const connections = minersDb.prepare('SELECT * FROM pool_connections').all();
        for (const conn of connections) {
            try {
                targetDb.prepare(`
                    INSERT OR IGNORE INTO pool_connections (
                        rig_id, pool_id, shares_submitted, shares_accepted,
                        hash_rate, last_update
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    conn.rig_id,
                    conn.pool_id,
                    0, // Will update from shares
                    0,
                    0,
                    conn.updated_at || Date.now()
                );
                console.log(`Migrated connection: ${conn.rig_id} -> ${conn.pool_id}`);
            } catch (err) {
                console.error(`Error migrating connection ${conn.rig_id}:`, err.message);
            }
        }

        // 4. Migrate miner shares and update totals
        console.log('\n=== Migrating Miner Shares ===');
        const shares = minersDb.prepare('SELECT * FROM miner_shares').all();
        for (const share of shares) {
            try {
                // Update rig totals
                targetDb.prepare(`
                    UPDATE mining_rigs 
                    SET total_shares = total_shares + ?,
                        accepted_shares = accepted_shares + ?,
                        rejected_shares = rejected_shares + ?
                    WHERE rig_id = ?
                `).run(
                    share.share_count || 0,
                    share.accepted_shares || 0,
                    share.rejected_shares || 0,
                    share.rig_id
                );

                // Update pool connection stats
                targetDb.prepare(`
                    UPDATE pool_connections
                    SET shares_submitted = shares_submitted + ?,
                        shares_accepted = shares_accepted + ?
                    WHERE rig_id = ? AND pool_id = ?
                `).run(
                    share.share_count || 0,
                    share.accepted_shares || 0,
                    share.rig_id,
                    share.pool_id
                );
                
                console.log(`Migrated shares for rig: ${share.rig_id}`);
            } catch (err) {
                console.error(`Error migrating shares for ${share.rig_id}:`, err.message);
            }
        }

        // 5. Migrate balances
        console.log('\n=== Migrating Miner Balances ===');
        const balances = accountsDb.prepare('SELECT * FROM miner_balances').all();
        for (const balance of balances) {
            try {
                targetDb.prepare(`
                    INSERT OR IGNORE INTO miner_balances (
                        rig_id, pool_id, pending_balance, confirmed_balance,
                        total_earned, last_payout
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    balance.rigId,
                    balance.poolId,
                    parseFloat(balance.pendingBalance) || 0,
                    parseFloat(balance.confirmedBalance) || 0,
                    parseFloat(balance.totalEarned) || 0,
                    balance.lastPayout ? new Date(balance.lastPayout).getTime() : null
                );

                // Update rig's total earned
                targetDb.prepare(`
                    UPDATE mining_rigs
                    SET total_earned = total_earned + ?
                    WHERE rig_id = ?
                `).run(parseFloat(balance.totalEarned) || 0, balance.rigId);

                console.log(`Migrated balance for rig: ${balance.rigId}`);
            } catch (err) {
                console.error(`Error migrating balance for ${balance.rigId}:`, err.message);
            }
        }

        // 6. Migrate rewards
        console.log('\n=== Migrating Mining Rewards ===');
        const rewards = accountsDb.prepare('SELECT * FROM mining_rewards').all();
        for (const reward of rewards) {
            try {
                targetDb.prepare(`
                    INSERT OR IGNORE INTO mining_rewards (
                        rig_id, pool_id, user_id, reward_type, currency,
                        amount, status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    reward.minerId,
                    'auto', // We'll need to determine the pool from the rig's primary pool
                    '1', // Default user
                    'mining',
                    reward.type || 'BTC',
                    parseFloat(reward.amount) || 0,
                    reward.status || 'confirmed',
                    new Date(reward.timestamp).getTime() || Date.now()
                );
                console.log(`Migrated reward for rig: ${reward.minerId}`);
            } catch (err) {
                console.error(`Error migrating reward for ${reward.minerId}:`, err.message);
            }
        }

        // Commit transaction
        targetDb.exec('COMMIT');
        console.log('\n=== Migration Complete ===');

    } catch (err) {
        console.error('Migration failed:', err);
        targetDb.exec('ROLLBACK');
    } finally {
        // Close all database connections
        minersDb.close();
        accountsDb.close();
        targetDb.close();
    }
}

// Run the migration
migrateAll().catch(console.error);
