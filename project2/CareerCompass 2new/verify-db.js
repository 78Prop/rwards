import sqlite3 from 'sqlite3';

// Create a new database connection
const db = new sqlite3.Database('miners.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');

    // Query all miners
    db.all('SELECT * FROM mining_rigs', [], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            process.exit(1);
        }
        console.log('Mining Rigs:');
        console.log(JSON.stringify(rows, null, 2));
        
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
