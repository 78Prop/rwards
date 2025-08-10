import sqlite3 from 'sqlite3';

// Create a new database connection
const db = new sqlite3.Database('miners.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');

    // Query all data
    console.log('\nMining Rigs:');
    db.all('SELECT * FROM mining_rigs', [], (err, rows) => {
        if (err) {
            console.error('Error querying mining_rigs:', err.message);
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }

        console.log('\nMining Pools:');
        db.all('SELECT * FROM mining_pools', [], (err, rows) => {
            if (err) {
                console.error('Error querying mining_pools:', err.message);
            } else {
                console.log(JSON.stringify(rows, null, 2));
            }

            console.log('\nPool Connections:');
            db.all('SELECT * FROM pool_connections', [], (err, rows) => {
                if (err) {
                    console.error('Error querying pool_connections:', err.message);
                } else {
                    console.log(JSON.stringify(rows, null, 2));
                }
                
                // Close the database connection
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        process.exit(1);
                    }
                    console.log('\nDatabase connection closed.');
                });
            });
        });
    });
});
