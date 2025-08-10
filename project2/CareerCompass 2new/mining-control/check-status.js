import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('miners.db');
db.getAsync = promisify(db.get).bind(db);
db.allAsync = promisify(db.all).bind(db);

async function checkMiningStatus() {
    try {
        // Check active miners
        console.log('\n=== Active Mining Rigs ===');
        const miners = await db.allAsync(`
            SELECT r.*, 
                   p.name as pool_name,
                   pc.status as connection_status
            FROM mining_rigs r
            LEFT JOIN pool_connections pc ON r.id = pc.rig_id
            LEFT JOIN mining_pools p ON pc.pool_id = p.id
            WHERE pc.status = 'connected'
        `);
        
        if (miners.length === 0) {
            console.log('No active miners found');
        } else {
            miners.forEach(miner => {
                console.log(`\nRig: ${miner.name}`);
                console.log(`Status: ${miner.status}`);
                console.log(`Pool: ${miner.pool_name}`);
                console.log(`Hashrate: ${miner.hashrate}`);
            });
        }

        // Check mining rewards
        console.log('\n=== Mining Rewards ===');
        const rewards = await db.allAsync(`
            SELECT ms.rig_id,
                   r.name as rig_name,
                   p.name as pool_name,
                   SUM(ms.share_count) as total_shares,
                   SUM(ms.accepted_shares) as accepted_shares,
                   SUM(ms.rewards) as total_rewards
            FROM miner_shares ms
            JOIN mining_rigs r ON ms.rig_id = r.id
            JOIN mining_pools p ON ms.pool_id = p.id
            GROUP BY ms.rig_id, p.name
        `);

        if (rewards.length === 0) {
            console.log('No mining rewards found');
        } else {
            rewards.forEach(reward => {
                console.log(`\nRig: ${reward.rig_name}`);
                console.log(`Pool: ${reward.pool_name}`);
                console.log(`Total Shares: ${reward.total_shares}`);
                console.log(`Accepted Shares: ${reward.accepted_shares}`);
                console.log(`Total Rewards: ${reward.total_rewards} BTC`);
            });
        }

    } catch (err) {
        console.error('Error checking mining status:', err);
    } finally {
        db.close();
    }
}

checkMiningStatus();
