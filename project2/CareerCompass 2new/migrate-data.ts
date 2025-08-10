import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateData() {
    // Open source database
    const sourceDb = await open({
        filename: path.join(__dirname, 'kloudbugs_mining_real.db'),
        driver: sqlite3.Database
    });
    
    // Open target database
    const targetDb = await open({
        filename: path.join(__dirname, 'miners.db'),
        driver: sqlite3.Database
    });

    console.log('🔄 Starting data migration...');

    try {
        // Migrate mining rigs
        const rigs = await sourceDb.all('SELECT * FROM mining_rigs');
        console.log(`Found ${rigs.length} miners to migrate`);
        
        for (const rig of rigs) {
            await targetDb.run(
                `INSERT OR REPLACE INTO mining_rigs (
                    id, name, type, hashrate, powerDraw, temperature, status,
                    efficiency, dailyRevenue, location, ipAddress, primaryPoolId,
                    backupPool1Id, backupPool2Id, hardware, autoConfig, createdAt, lastUpdate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    rig.id, rig.name, rig.type, rig.hashrate, rig.powerDraw,
                    rig.temperature, rig.status, rig.efficiency, rig.dailyRevenue,
                    rig.location, rig.ipAddress, rig.primaryPoolId, rig.backupPool1Id,
                    rig.backupPool2Id, rig.hardware, rig.autoConfig, rig.createdAt,
                    rig.lastUpdate
                ]
            );
        }

        // Migrate mining pools
        const pools = await sourceDb.all('SELECT * FROM mining_pools');
        console.log(`Found ${pools.length} pools to migrate`);
        
        for (const pool of pools) {
            await targetDb.run(
                `INSERT OR REPLACE INTO mining_pools (
                    id, name, host, port, username, password, protocol,
                    fee, status, hashRate, connectedRigs, totalShares,
                    acceptedShares, rejectedShares, createdAt, lastUpdate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    pool.id, pool.name, pool.host, pool.port, pool.username,
                    pool.password, pool.protocol, pool.fee, pool.status,
                    pool.hashRate, pool.connectedRigs, pool.totalShares,
                    pool.acceptedShares, pool.rejectedShares, pool.createdAt,
                    pool.lastUpdate
                ]
            );
        }

        // Migrate pool connections
        const connections = await sourceDb.all('SELECT * FROM pool_connections');
        console.log(`Found ${connections.length} pool connections to migrate`);
        
        for (const conn of connections) {
            await targetDb.run(
                `INSERT OR REPLACE INTO pool_connections (
                    rigId, poolId, connectionType, status, ipAddress,
                    lastConnected, lastDisconnected, lastUpdate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    conn.rigId, conn.poolId, conn.connectionType, conn.status,
                    conn.ipAddress, conn.lastConnected, conn.lastDisconnected,
                    conn.lastUpdate
                ]
            );
        }

        // Migrate miner balances
        const balances = await sourceDb.all('SELECT * FROM miner_balances');
        console.log(`Found ${balances.length} miner balances to migrate`);
        
        for (const balance of balances) {
            await targetDb.run(
                `INSERT OR REPLACE INTO miner_balances (
                    id, rigId, poolId, currency, pendingBalance, confirmedBalance,
                    totalEarned, payoutThreshold, lastPayout, createdAt, lastUpdate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    balance.id, balance.rigId, balance.poolId, balance.currency,
                    balance.pendingBalance, balance.confirmedBalance, balance.totalEarned,
                    balance.payoutThreshold, balance.lastPayout, balance.createdAt,
                    balance.lastUpdate
                ]
            );
        }

        // Migrate share submissions
        const shares = await sourceDb.all('SELECT * FROM share_submissions');
        console.log(`Found ${shares.length} share submissions to migrate`);
        
        for (const share of shares) {
            await targetDb.run(
                `INSERT OR REPLACE INTO share_submissions (
                    id, rigId, poolId, difficulty, shareValue, accepted, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    share.id, share.rigId, share.poolId, share.difficulty,
                    share.shareValue, share.accepted, share.createdAt
                ]
            );
        }

        console.log('✅ Data migration completed successfully!');

    } catch (error) {
        console.error('Failed to migrate data:', error);
        throw error;
    } finally {
        await sourceDb.close();
    }
}

// Run migration
migrateData().catch(console.error);
