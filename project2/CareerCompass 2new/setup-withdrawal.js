import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new database connection
const db = new sqlite3.Database('miners.db');

const setupWithdrawal = async () => {
    try {
        // 1. Check if withdrawal tables exist
        await new Promise((resolve, reject) => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='withdrawals'", (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        // 2. Create withdrawal tables if they don't exist
        await new Promise((resolve, reject) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS withdrawals (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    btc_address TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    txid TEXT,
                    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );

                CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
                CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
            `, (err) => {
                if (err) reject(err);
                console.log('Withdrawal tables created successfully.');
                resolve();
            });
        });

        // 3. Verify admin account exists and has correct BTC address
        await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = 'admin.user'", (err, row) => {
                if (err) reject(err);
                if (!row) {
                    db.run(`
                        INSERT INTO users (username, btc_address, email) 
                        VALUES ('admin.user', 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6', 'admin@mining.local')
                    `, (err) => {
                        if (err) reject(err);
                        console.log('Admin account created successfully.');
                        resolve();
                    });
                } else {
                    console.log('Admin account already exists.');
                    resolve();
                }
            });
        });

        // 4. Update admin BTC address if needed
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE users 
                SET btc_address = 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6' 
                WHERE username = 'admin.user'
            `, (err) => {
                if (err) reject(err);
                console.log('Admin BTC address verified/updated.');
                resolve();
            });
        });

        // Close the database connection
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                console.log('Database connection closed.');
                resolve();
            });
        });

        console.log('Withdrawal system setup completed successfully.');
    } catch (err) {
        console.error('Setup error:', err.message);
        process.exit(1);
    }
};

// Run setup
setupWithdrawal();
