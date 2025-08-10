import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read SQL file
const setupSQL = fs.readFileSync(path.join(__dirname, 'migrations', 'setup-withdrawal.sql'), 'utf8');

// Create a new database connection
const db = new sqlite3.Database('miners.db');

const setupWithdrawal = async () => {
    try {
        // Execute the SQL setup script
        await new Promise((resolve, reject) => {
            console.log('Setting up withdrawal system...');
            db.exec(setupSQL, (err) => {
                if (err) reject(err);
                console.log('Withdrawal system setup completed.');
                resolve();
            });
        });

        // Verify setup by checking tables
        await new Promise((resolve, reject) => {
            db.all(`
                SELECT name 
                FROM sqlite_master 
                WHERE type='table' 
                AND name IN ('withdrawals', 'blockchain_transactions')
            `, (err, tables) => {
                if (err) reject(err);
                if (tables.length === 2) {
                    console.log('Verified withdrawal tables created successfully:', tables.map(t => t.name).join(', '));
                    resolve();
                } else {
                    reject(new Error('Not all withdrawal tables were created'));
                }
            });
        });

        // Verify admin user
        await new Promise((resolve, reject) => {
            db.get(`
                SELECT username, btc_address 
                FROM users 
                WHERE username = 'admin.user'
            `, (err, user) => {
                if (err) reject(err);
                if (user) {
                    console.log('Verified admin user exists with BTC address:', user.btc_address);
                    resolve();
                } else {
                    reject(new Error('Admin user not found'));
                }
            });
        });

        // Close database connection
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                console.log('Database connection closed.');
                resolve();
            });
        });

    } catch (err) {
        console.error('Setup error:', err.message);
        process.exit(1);
    }
};

// Run setup
setupWithdrawal();
