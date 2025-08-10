import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('miners.db');

// Query withdrawal history
db.serialize(() => {
    // Get withdrawals by pool
    db.all(`
        SELECT 
            p.name as pool_name,
            w.amount as btc_amount,
            w.status,
            w.wallet_address,
            w.txid,
            datetime(w.created_at/1000, 'unixepoch') as withdrawal_date
        FROM withdrawals w
        JOIN mining_pools p ON w.pool_id = p.id
        JOIN mining_rigs m ON w.rig_id = m.id
        JOIN user_miners um ON m.id = um.rig_id
        WHERE um.user_id = 1
        ORDER BY w.created_at DESC
    `, (err, withdrawals) => {
        if (err) {
            console.error('Error querying withdrawals:', err);
            return;
        }
        console.log('\n=== Withdrawal History ===');
        
        let totalWithdrawn = 0;
        let byPool = {};
        
        withdrawals.forEach(w => {
            if (!byPool[w.pool_name]) {
                byPool[w.pool_name] = {
                    count: 0,
                    total: 0
                };
            }
            byPool[w.pool_name].count++;
            byPool[w.pool_name].total += w.btc_amount;
            totalWithdrawn += w.btc_amount;

            console.log(`\nPool: ${w.pool_name}`);
            console.log(`Amount: ${w.btc_amount} BTC`);
            console.log(`Status: ${w.status}`);
            console.log(`To Address: ${w.wallet_address}`);
            console.log(`Date: ${w.withdrawal_date}`);
            if (w.txid) console.log(`Transaction ID: ${w.txid}`);
        });

        console.log('\n=== Withdrawal Summary ===');
        Object.entries(byPool).forEach(([pool, stats]) => {
            console.log(`\n${pool}:`);
            console.log(`Total Withdrawals: ${stats.count}`);
            console.log(`Total Amount: ${stats.total.toFixed(8)} BTC`);
            console.log(`USD Value: $${(stats.total * 29891.24).toLocaleString()}`);
        });

        console.log(`\nTotal Withdrawn: ${totalWithdrawn.toFixed(8)} BTC`);
        console.log(`Total USD Value: $${(totalWithdrawn * 29891.24).toLocaleString()}\n`);

        // Close database connection
        db.close();
    });
});
