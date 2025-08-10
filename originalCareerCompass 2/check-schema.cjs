const Database = require('better-sqlite3');
const path = require('path');

const dbPaths = [
    path.resolve(__dirname, 'miners.db'),
    path.resolve(__dirname, 'mining.db'),
    path.resolve('../project2/CareerCompass 2new/kloudbugs_mining_real.db'),
    path.resolve('../project2/CareerCompass 2new/mining_accounts.db'),
    path.resolve('../project2/CareerCompass 2new/miners.db')
];

dbPaths.forEach(dbPath => {
    try {
        console.log(`\nChecking schema for: ${dbPath}`);
        const db = new Database(dbPath);
        
        // Get all table names
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        
        tables.forEach(table => {
            console.log(`\nTable: ${table.name}`);
            // Get table schema
            const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table.name);
            console.log(schema.sql);
            
            // Get row count
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
            console.log(`Row count: ${count.count}`);
        });
        
        db.close();
    } catch (err) {
        console.error(`Error with ${dbPath}:`, err.message);
    }
});
