// check-all-rewards.cjs
const Database = require('better-sqlite3');
const path = require('path');

function checkDb(dbPath) {
    console.log(`\nChecking database: ${dbPath}`);
    try {
        const db = new Database(dbPath);
        
        // Check miner_shares table
        const shares = db.prepare(`
            SELECT 
                COUNT(*) as count,
                SUM(rewards) as total_rewards,
                SUM(share_count) as total_shares
            FROM miner_shares
        `).get();
        
        console.log('Miner Shares Summary:');
        console.log(shares);
        
        // Check mining_pools table
        const pools = db.prepare(`SELECT * FROM mining_pools`).all();
        console.log('\nPools found:', pools.map(p => p.name).join(', '));
        
        db.close();
    } catch (err) {
        console.log('Error:', err.message);
    }
}

// Check both locations
[
    'C:/Users/admin/Desktop/project2/CareerCompass 2new/kloudbugs_mining_real.db',
    'C:/Users/admin/Desktop/project2/CareerCompass 2new/miners.db'
].forEach(checkDb);
