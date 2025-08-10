import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('miners.db');

// First check users
db.all("SELECT * FROM users", (err, users) => {
    if (err) {
        console.error("Error querying users:", err);
        return;
    }
    console.log("\nUsers in database:");
    console.log(users);

    // Then check user_miners
    db.all("SELECT * FROM user_miners", (err, miners) => {
        if (err) {
            console.error("Error querying user_miners:", err);
            return;
        }
        console.log("\nMiner assignments:");
        console.log(miners);

        // Check actual miners
        db.all("SELECT * FROM mining_rigs", (err, rigs) => {
            if (err) {
                console.error("Error querying mining_rigs:", err);
                return;
            }
            console.log("\nMining rigs:");
            console.log(rigs.length, "rigs found");
            
            // Close connection
            db.close();
        });
    });
});
