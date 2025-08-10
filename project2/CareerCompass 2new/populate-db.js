import sqlite3 from 'sqlite3';

// Create a new database connection
const db = new sqlite3.Database('miners.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');

    // Sample data for miners
    const miners = [
        {
            id: 'rig1',
            name: 'Test Miner 1',
            ip_address: '192.168.1.101',
            status: 'online',
            hashrate: '50000',
        },
        {
            id: 'rig2',
            name: 'Test Miner 2',
            ip_address: '192.168.1.102',
            status: 'online',
            hashrate: '75000',
        },
        {
            id: 'rig3',
            name: 'Test Miner 3',
            ip_address: '192.168.1.103',
            status: 'offline',
            hashrate: '0',
        }
    ];

    // Insert sample miners
    const stmt = db.prepare('INSERT INTO mining_rigs (id, name, ip_address, status, hashrate) VALUES (?, ?, ?, ?, ?)');
    
    miners.forEach((miner) => {
        stmt.run([
            miner.id,
            miner.name,
            miner.ip_address,
            miner.status,
            miner.hashrate
        ], (err) => {
            if (err) {
                console.error('Error inserting miner:', err.message);
            }
        });
    });

    stmt.finalize((err) => {
        if (err) {
            console.error('Error finalizing statement:', err.message);
        }
        console.log('Sample miners added to database.');
        
        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
                process.exit(1);
            }
            console.log('Database connection closed.');
        });
    });
});
