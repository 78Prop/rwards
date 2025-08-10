import fs from 'fs';
import path from 'path';
import sqlite from 'better-sqlite3';
const Database = sqlite;

// Pool configuration
const pools = [
    'KLOUDBUGSCAFE POOL',
    'TERA SOCIAL JUSTICE POOL',
    'TERA TOKEN POOL'
];

// Core miners from mining-control
const coreMiners = [
    {
        id: 'tera-core-7',
        name: 'TERACORE7',
        type: 'bitcoin',
        hashrate: 110.0,
        powerDraw: 3250,
        temperature: 67,
        status: 'online',
        efficiency: 95.2,
        dailyRevenue: 45.80,
        location: 'KLOUDBUGS Data Center Alpha',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'ASIC S19 Pro',
        autoConfig: true
    },
    {
        id: 'tera-alpha-7',
        name: 'TERAALPHA7',
        type: 'bitcoin',
        hashrate: 95.0,
        powerDraw: 2900,
        temperature: 63,
        status: 'online',
        efficiency: 93.8,
        dailyRevenue: 38.90,
        location: 'KLOUDBUGS Data Center Beta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'ASIC S17+',
        autoConfig: true
    },
    {
        id: 'tera-omega-7',
        name: 'TERAOMEGA7',
        type: 'bitcoin',
        hashrate: 125.0,
        powerDraw: 3500,
        temperature: 71,
        status: 'online',
        efficiency: 91.4,
        dailyRevenue: 52.30,
        location: 'KLOUDBUGS Data Center Gamma',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'Custom ASIC',
        autoConfig: false
    },
    {
        id: 'tera-node-7',
        name: 'TERANODE7',
        type: 'bitcoin',
        hashrate: 130.0,
        powerDraw: 3600,
        temperature: 69,
        status: 'online',
        efficiency: 97.1,
        dailyRevenue: 56.70,
        location: 'KLOUDBUGS Data Center Delta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'ASIC S19 Pro',
        autoConfig: true
    },
    {
        id: 'tera-optimus-7',
        name: 'TERAOPTIMUS7',
        type: 'bitcoin',
        hashrate: 115.0,
        powerDraw: 3300,
        temperature: 65,
        status: 'maintenance',
        efficiency: 94.5,
        dailyRevenue: 0,
        location: 'KLOUDBUGS Data Center Epsilon',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'ASIC S17+',
        autoConfig: true
    },
    {
        id: 'tera-justice-7',
        name: 'TERAJUSTICE7',
        type: 'bitcoin',
        hashrate: 120.0,
        powerDraw: 3400,
        temperature: 68,
        status: 'online',
        efficiency: 96.3,
        dailyRevenue: 51.20,
        location: 'KLOUDBUGS Data Center Zeta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'Custom ASIC',
        autoConfig: true
    },
    {
        id: 'tera-ann-harris-7',
        name: 'TERAANNHARRIS7',
        type: 'bitcoin',
        hashrate: 105.0,
        powerDraw: 3100,
        temperature: 64,
        status: 'online',
        efficiency: 92.7,
        dailyRevenue: 43.15,
        location: 'KLOUDBUGS Data Center Eta',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'ASIC S19 Pro',
        autoConfig: true
    },
    {
        id: 'tera-zig-miner-7',
        name: 'TERA-ZIG-MINER7',
        type: 'bitcoin',
        hashrate: 140.0,
        powerDraw: 3800,
        temperature: 72,
        status: 'online',
        efficiency: 98.9,
        dailyRevenue: 62.40,
        location: 'KLOUDBUGS Data Center Theta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'Custom ASIC',
        autoConfig: false
    }
];

async function migrateMiningData() {
    try {
        // Open the SQLite database
        const db = new Database('miners.db');
        
        // Create tables if they don't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS miners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                hashrate REAL,
                powerDraw INTEGER,
                temperature INTEGER,
                status TEXT,
                efficiency REAL,
                dailyRevenue REAL,
                location TEXT,
                pool TEXT,
                hardware TEXT,
                autoConfig INTEGER,
                lastUpdate INTEGER
            );

            CREATE TABLE IF NOT EXISTS miner_stats (
                minerId TEXT,
                timestamp INTEGER,
                hashrate REAL,
                shares INTEGER,
                accepted INTEGER,
                rejected INTEGER,
                temperature INTEGER,
                powerDraw INTEGER,
                efficiency REAL,
                FOREIGN KEY(minerId) REFERENCES miners(id)
            );

            CREATE TABLE IF NOT EXISTS pool_assignments (
                minerId TEXT PRIMARY KEY,
                primaryPool TEXT,
                backupPool1 TEXT,
                backupPool2 TEXT,
                FOREIGN KEY(minerId) REFERENCES miners(id)
            );
        `);

        // Insert core miners
        const insertMiner = db.prepare(`
            INSERT OR REPLACE INTO miners (
                id, name, type, hashrate, powerDraw, temperature,
                status, efficiency, dailyRevenue, location, pool,
                hardware, autoConfig, lastUpdate
            ) VALUES (
                @id, @name, @type, @hashrate, @powerDraw, @temperature,
                @status, @efficiency, @dailyRevenue, @location, @pool,
                @hardware, @autoConfig, @lastUpdate
            )
        `);

        const insertPoolAssignment = db.prepare(`
            INSERT OR REPLACE INTO pool_assignments (
                minerId, primaryPool, backupPool1, backupPool2
            ) VALUES (
                @minerId, @primaryPool, @backupPool1, @backupPool2
            )
        `);

        // Begin transaction
        const migrate = db.transaction((miners) => {
            for (const miner of miners) {
                // Insert miner data
                insertMiner.run({
                    ...miner,
                    autoConfig: miner.autoConfig ? 1 : 0,
                    lastUpdate: Date.now()
                });

                // Assign pools (primary and backups)
                const availablePools = pools.filter(p => p !== miner.pool);
                insertPoolAssignment.run({
                    minerId: miner.id,
                    primaryPool: miner.pool,
                    backupPool1: availablePools[0],
                    backupPool2: availablePools[1]
                });
            }
        });

        // Migrate core miners
        console.log('Migrating core miners...');
        migrate(coreMiners);
        
        // Create additional miners to reach 51 total
        const additionalMiners = [];
        const totalNeeded = 51 - coreMiners.length;
        
        for (let i = 0; i < totalNeeded; i++) {
            additionalMiners.push({
                id: `tera-miner-${i + 9}`,
                name: `TERAMINER${i + 9}`,
                type: 'bitcoin',
                hashrate: 100 + Math.random() * 50,
                powerDraw: 3000 + Math.floor(Math.random() * 1000),
                temperature: 60 + Math.floor(Math.random() * 15),
                status: Math.random() > 0.1 ? 'online' : 'maintenance',
                efficiency: 90 + Math.random() * 10,
                dailyRevenue: 40 + Math.random() * 25,
                location: `KLOUDBUGS Data Center ${String.fromCharCode(73 + Math.floor(i / 5))}`,
                pool: pools[i % pools.length],
                hardware: ['ASIC S19 Pro', 'ASIC S17+', 'Custom ASIC'][Math.floor(Math.random() * 3)],
                autoConfig: Math.random() > 0.2
            });
        }

        console.log('Migrating additional miners...');
        migrate(additionalMiners);

        // Get distribution stats
        const poolStats = db.prepare(`
            SELECT pool, COUNT(*) as count 
            FROM miners 
            GROUP BY pool
        `).all();
        
        console.log('\nMiner distribution across pools:');
        poolStats.forEach(stat => {
            console.log(`${stat.pool}: ${stat.count} miners`);
        });

        // Verify total count
        const count = db.prepare('SELECT COUNT(*) as count FROM miners').get();
        console.log(`\nTotal miners in database: ${count.count}`);

        // Close database
        db.close();
        
        console.log('Migration completed successfully!');
        console.log('Miners ready for pool connections.');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migration
migrateMiningData();
