import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('miners.db');

// Query withdrawal history with transaction details
db.serialize(() => {
    db.all(`
        SELECT 
            p.name as pool_name,
            w.amount as btc_amount,
            w.status,
            w.wallet_address,
            datetime(w.created_at/1000, 'unixepoch') as withdrawal_date,
            t.txid,
            t.block_height,
            t.confirmations,
            t.fee_btc,
            datetime(t.timestamp/1000, 'unixepoch') as tx_date,
            t.raw_tx
        FROM withdrawals w
        JOIN mining_pools p ON w.pool_id = p.id
        LEFT JOIN blockchain_transactions t ON w.id = t.withdrawal_id
        ORDER BY w.created_at DESC
    `, (err, results) => {
        if (err) {
            console.error('Error querying transactions:', err);
            return;
        }

        console.log('\n=== Withdrawal & Transaction History ===');
        
        results.forEach(r => {
            console.log(`\nPool: ${r.pool_name}`);
            console.log(`Amount: ${r.btc_amount} BTC`);
            console.log(`Status: ${r.status}`);
            console.log(`To Address: ${r.wallet_address}`);
            console.log(`Withdrawal Date: ${r.withdrawal_date}`);
            
            if (r.txid) {
                console.log('\nTransaction Details:');
                console.log(`TXID: ${r.txid}`);
                console.log(`Block Height: ${r.block_height || 'Pending'}`);
                console.log(`Confirmations: ${r.confirmations}`);
                console.log(`Network Fee: ${r.fee_btc} BTC`);
                console.log(`TX Date: ${r.tx_date}`);
                
                // Parse and show transaction details
                try {
                    const tx = JSON.parse(r.raw_tx);
                    console.log('\nTransaction Data:');
                    console.log(`Version: ${tx.version}`);
                    console.log(`Outputs: ${tx.vout.length}`);
                    tx.vout.forEach((out, i) => {
                        console.log(`  Output ${i + 1}: ${out.value} BTC -> ${out.scriptPubKey.address}`);
                    });
                } catch (e) {
                    console.log('Raw transaction data not available');
                }
            } else {
                console.log('\nNo blockchain transaction yet - withdrawal still processing');
            }
            
            console.log('\n----------------------------------------');
        });

        // Close database connection
        db.close();
    });
});
