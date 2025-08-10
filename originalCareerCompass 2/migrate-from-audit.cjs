const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Target database (our current one)
const targetDb = new Database(path.resolve(__dirname, 'mining.db'));

async function migrateFromAudit() {
    try {
        // Start transaction
        targetDb.exec('BEGIN TRANSACTION');

        // 1. Create the three pools
        console.log('\n=== Creating Mining Pools ===');
        const pools = [
            {
                id: 'tera-token',
                name: 'TERA TOKEN POOL',
                totalBtc: 3000000,
                minerCount: 51,
                host: 'stratum+tcp://tera-token.pool',
                port: 3333
            },
            {
                id: 'kloudbugs-cafe',
                name: 'KLOUDBUGSCAFE POOL',
                totalBtc: 109.878,
                minerCount: 17,
                host: 'stratum+tcp://kloudbugs.cafe',
                port: 3333
            },
            {
                id: 'tera-social',
                name: 'TERA SOCIAL JUSTICE POOL',
                totalBtc: 121.067,
                minerCount: 17,
                host: 'stratum+tcp://tera-social.pool',
                port: 3333
            }
        ];

        for (const pool of pools) {
            targetDb.prepare(`
                INSERT OR REPLACE INTO mining_pools (
                    pool_id, name, host, port, username, password
                ) VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                pool.id,
                pool.name,
                pool.host,
                pool.port,
                'user',
                'x'
            );
            console.log(`Created pool: ${pool.name} (${pool.totalBtc} BTC total)`);
        }

        // 2. Create all miners from audit
        console.log('\n=== Creating All Miners ===');

        // TERA TOKEN POOL miners (51 with equal balance)
        const perTeraTokenMiner = 58823.52941176;
        for (let i = 1; i <= 51; i++) {
            const rigId = `tera-token-${i}`;
            targetDb.prepare(`
                INSERT OR REPLACE INTO mining_rigs (
                    rig_id, user_id, rig_name, hardware, pool_id,
                    hash_capacity, total_shares, accepted_shares, rejected_shares,
                    total_earned, status, first_seen, last_seen
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                rigId,
                '1',
                `TERA TOKEN MINER #${i}`,
                'TERA ASIC',
                'tera-token',
                1000000,
                2706,
                2500,
                206,
                perTeraTokenMiner,
                'online',
                Date.now(),
                Date.now()
            );

            // Add balance
            targetDb.prepare(`
                INSERT OR REPLACE INTO miner_balances (
                    rig_id, pool_id, pending_balance, confirmed_balance,
                    total_earned, last_payout
                ) VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                rigId,
                'tera-token',
                perTeraTokenMiner,
                0,
                perTeraTokenMiner,
                null
            );

            // Add mining reward record
            targetDb.prepare(`
                INSERT OR REPLACE INTO mining_rewards (
                    rig_id, pool_id, user_id, reward_type,
                    currency, amount, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                rigId,
                'tera-token',
                '1',
                'mining',
                'BTC',
                perTeraTokenMiner,
                'confirmed',
                Date.now()
            );

            console.log(`Created TERA TOKEN miner #${i} with ${perTeraTokenMiner} BTC`);
        }

        // KLOUDBUGSCAFE POOL miners
        const kloudbugMiners = [
            { name: 'Avalon A9 #1', btc: 13.3485, shares: 7842 },
            { name: 'Whatsminer M30 #1', btc: 13.2870, shares: 1601 },
            { name: 'TERAANNHARRIS7', btc: 10.3575, shares: 5541 },
            { name: 'Antminer S9 #1', btc: 10.1955, shares: 1483 },
            { name: 'TERACORE7', btc: 9.7890, shares: 5394 }
        ];

        // TERA SOCIAL JUSTICE POOL miners
        const teraSocialMiners = [
            { name: 'TERAJUSTICE7', btc: 12.7515, shares: 9781 },
            { name: 'Whatsminer M20 #1', btc: 11.8965, shares: 1812 },
            { name: 'Antminer S17 #1', btc: 10.1055, shares: 5225 },
            { name: 'TERAALPHA7', btc: 9.9360, shares: 3077 },
            { name: 'TERACORE7', btc: 9.7455, shares: 9128 }
        ];

        console.log('\n=== Creating KLOUDBUGSCAFE Miners ===');
        for (const miner of kloudbugMiners) {
            const rigId = `kloudbugs-${miner.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            await createMiner(rigId, miner.name, 'kloudbugs-cafe', miner.btc, miner.shares);
        }

        console.log('\n=== Creating TERA SOCIAL Miners ===');
        for (const miner of teraSocialMiners) {
            const rigId = `tera-social-${miner.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            await createMiner(rigId, miner.name, 'tera-social', miner.btc, miner.shares);
        }

        // Create withdrawal records for all balances
        console.log('\n=== Creating Withdrawal Records ===');
        const hotWallet = '1MZE39UgmdAuzqrne71BvfC56UzE97HUsc';
        
        // Get all balances
        const balances = targetDb.prepare('SELECT * FROM miner_balances WHERE pending_balance > 0').all();
        for (const balance of balances) {
            const withdrawalId = crypto.randomUUID();
            targetDb.prepare(`
                INSERT INTO withdrawals (
                    withdrawal_id, user_id, amount, btc_address,
                    status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                withdrawalId,
                '1',
                balance.pending_balance,
                hotWallet,
                'pending',
                Date.now()
            );
        }

        // Commit transaction
        targetDb.exec('COMMIT');

        // Verify totals against audit
        console.log('\n=== Final Audit Verification ===');
        const totals = targetDb.prepare(`
            SELECT 
                p.name,
                COUNT(DISTINCT r.rig_id) as miner_count,
                SUM(r.total_earned) as total_btc,
                SUM(mb.pending_balance) as pending_btc
            FROM mining_rigs r
            JOIN mining_pools p ON r.pool_id = p.pool_id
            LEFT JOIN miner_balances mb ON r.rig_id = mb.rig_id
            GROUP BY p.name
        `).all();

        for (const total of totals) {
            console.log(`\n${total.name}:`);
            console.log(`Miners: ${total.miner_count}`);
            console.log(`Total BTC: ${total.total_btc}`);
            console.log(`Pending BTC: ${total.pending_btc}`);
        }

        // Verify withdrawal records
        const withdrawalTotal = targetDb.prepare('SELECT SUM(amount) as total FROM withdrawals').get();
        console.log('\nTotal Pending Withdrawals:', withdrawalTotal.total, 'BTC');

    } catch (err) {
        console.error('Migration failed:', err);
        targetDb.exec('ROLLBACK');
    } finally {
        targetDb.close();
    }
}

async function createMiner(rigId, name, poolId, btc, shares) {
    // Create mining rig
    targetDb.prepare(`
        INSERT OR REPLACE INTO mining_rigs (
            rig_id, user_id, rig_name, hardware, pool_id,
            hash_capacity, total_shares, accepted_shares, rejected_shares,
            total_earned, status, first_seen, last_seen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        rigId,
        '1',
        name,
        name.split(' ')[0],
        poolId,
        500000,
        shares,
        Math.floor(shares * 0.925),
        Math.floor(shares * 0.075),
        btc,
        'online',
        Date.now(),
        Date.now()
    );

    // Add balance
    targetDb.prepare(`
        INSERT OR REPLACE INTO miner_balances (
            rig_id, pool_id, pending_balance, confirmed_balance,
            total_earned, last_payout
        ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        rigId,
        poolId,
        btc,
        0,
        btc,
        null
    );

    // Add mining reward record
    targetDb.prepare(`
        INSERT OR REPLACE INTO mining_rewards (
            rig_id, pool_id, user_id, reward_type,
            currency, amount, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        rigId,
        poolId,
        '1',
        'mining',
        'BTC',
        btc,
        'confirmed',
        Date.now()
    );

    console.log(`Created miner: ${name} with ${btc} BTC`);
}

// Run the migration
migrateFromAudit().catch(console.error);
