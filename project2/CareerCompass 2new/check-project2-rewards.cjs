// check-project2-rewards.cjs
require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const project2DbPath = path.resolve('C:/Users/admin/Desktop/project2/CareerCompass 2new/kloudbugs_mining_real.db');
console.log('\nChecking Project2 database:', project2DbPath);

try {
    const db = new Database(project2DbPath);
    
    // Check all mining rewards
    console.log('\n=== MINING REWARDS BY POOL ===');
    const poolRewards = db.prepare(`
        SELECT 
            p.name as pool_name,
            COUNT(DISTINCT r.rig_id) as miner_count,
            SUM(r.rewards) as total_rewards,
            SUM(r.share_count) as total_shares,
            SUM(r.accepted_shares) as accepted_shares
        FROM miner_shares r
        JOIN mining_pools p ON p.id = r.pool_id
        GROUP BY p.name
    `).all();
    
    let totalRewards = 0;
    poolRewards.forEach(pool => {
        console.log(`\nPool: ${pool.pool_name}`);
        console.log(`Miners: ${pool.miner_count}`);
        console.log(`Total Rewards: ${pool.total_rewards} BTC`);
        console.log(`Shares: ${pool.total_shares} (${pool.accepted_shares} accepted)`);
        totalRewards += pool.total_rewards;
    });
    
    console.log('\n=== TOP PERFORMING MINERS ===');
    const topMiners = db.prepare(`
        SELECT 
            m.name as miner_name,
            p.name as pool_name,
            ms.rewards as total_rewards,
            ms.share_count,
            ms.accepted_shares,
            ms.rejected_shares
        FROM miner_shares ms
        JOIN mining_rigs m ON m.id = ms.rig_id
        JOIN mining_pools p ON p.id = ms.pool_id
        ORDER BY ms.rewards DESC
        LIMIT 10
    `).all();
    
    topMiners.forEach(miner => {
        console.log(`\nMiner: ${miner.miner_name} (${miner.pool_name})`);
        console.log(`Rewards: ${miner.total_rewards} BTC`);
        console.log(`Shares: ${miner.share_count} (${miner.accepted_shares} accepted, ${miner.rejected_shares} rejected)`);
    });
    
    console.log('\n=== TERA TOKEN POOL SPECIFIC ===');
    const teraTokenStats = db.prepare(`
        SELECT 
            m.name as miner_name,
            ms.rewards as total_rewards,
            ms.share_count,
            ms.accepted_shares,
            ms.rejected_shares
        FROM miner_shares ms
        JOIN mining_rigs m ON m.id = ms.rig_id
        JOIN mining_pools p ON p.id = ms.pool_id
        WHERE p.name LIKE '%TERA TOKEN%'
        ORDER BY ms.rewards DESC
    `).all();
    
    if (teraTokenStats.length > 0) {
        teraTokenStats.forEach(miner => {
            console.log(`\nMiner: ${miner.miner_name}`);
            console.log(`Rewards: ${miner.total_rewards} BTC`);
            console.log(`Shares: ${miner.share_count} (${miner.accepted_shares} accepted, ${miner.rejected_shares} rejected)`);
        });
    }
    
    console.log('\n=== TOTAL PLATFORM SUMMARY ===');
    console.log(`Total Rewards Across All Pools: ${totalRewards} BTC`);
    
    db.close();
} catch (err) {
    console.error('Error:', err.message);
}
