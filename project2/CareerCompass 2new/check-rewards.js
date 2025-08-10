import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('miners.db');

// Query rewards by pool
db.serialize(() => {
    // Get total rewards per pool
    db.all(`
        SELECT 
            p.name as pool_name,
            COUNT(DISTINCT m.id) as miner_count,
            SUM(ms.share_count) as total_shares,
            SUM(ms.accepted_shares) as accepted_shares,
            SUM(ms.rejected_shares) as rejected_shares,
            ROUND(SUM(ms.rewards), 8) as total_btc,
            ROUND(SUM(ms.rewards) * 29891.24, 2) as total_usd
        FROM miner_shares ms
        JOIN mining_pools p ON ms.pool_id = p.id
        JOIN mining_rigs m ON ms.rig_id = m.id
        JOIN user_miners um ON m.id = um.rig_id
        JOIN users u ON um.user_id = u.id
        WHERE u.username = 'admin.user'
        GROUP BY p.name
    `, (err, poolResults) => {
        if (err) {
            console.error('Error querying pool rewards:', err);
            return;
        }
        console.log('\n=== Mining Rewards by Pool ===');
        poolResults.forEach(pool => {
            console.log(`\n${pool.pool_name}:`);
            console.log(`Miners: ${pool.miner_count}`);
            console.log(`Total Shares: ${pool.total_shares.toLocaleString()}`);
            console.log(`Accepted: ${pool.accepted_shares.toLocaleString()}`);
            console.log(`Rejected: ${pool.rejected_shares.toLocaleString()}`);
            console.log(`BTC Earned: ${pool.total_btc}`);
            console.log(`USD Value: $${pool.total_usd.toLocaleString()}`);
        });

        // Get total rewards across all pools
        db.get(`
            SELECT 
                COUNT(DISTINCT m.id) as total_miners,
                SUM(ms.share_count) as total_shares,
                SUM(ms.accepted_shares) as accepted_shares,
                SUM(ms.rejected_shares) as rejected_shares,
                ROUND(SUM(ms.rewards), 8) as total_btc,
                ROUND(SUM(ms.rewards) * 29891.24, 2) as total_usd
            FROM miner_shares ms
            JOIN mining_rigs m ON ms.rig_id = m.id
            JOIN user_miners um ON m.id = um.rig_id
            JOIN users u ON um.user_id = u.id
            WHERE u.username = 'admin.user'
        `, (err, totals) => {
            if (err) {
                console.error('Error querying total rewards:', err);
                return;
            }
            console.log('\n=== Total Mining Rewards ===');
            console.log(`Total Miners: ${totals.total_miners}`);
            console.log(`Total Shares: ${totals.total_shares.toLocaleString()}`);
            console.log(`Total Accepted: ${totals.accepted_shares.toLocaleString()}`);
            console.log(`Total Rejected: ${totals.rejected_shares.toLocaleString()}`);
            console.log(`Total BTC: ${totals.total_btc}`);
            console.log(`Total USD: $${totals.total_usd.toLocaleString()}\n`);

            // Close database connection
            db.close();
        });
    });
});
