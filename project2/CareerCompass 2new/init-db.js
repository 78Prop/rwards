import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all SQL files
const schema = fs.readFileSync(path.join(__dirname, 'migrations', 'schema.sql'), 'utf8');
const userSchema = fs.readFileSync(path.join(__dirname, 'migrations', 'user-schema.sql'), 'utf8');
const seedData = fs.readFileSync(path.join(__dirname, 'migrations', 'seed-miners.sql'), 'utf8');
const duplicateData = fs.readFileSync(path.join(__dirname, 'migrations', 'duplicate-miners.sql'), 'utf8');
const shareTrackingSchema = fs.readFileSync(path.join(__dirname, 'migrations', 'share-tracking.sql'), 'utf8');
const transactionSchema = fs.readFileSync(path.join(__dirname, 'migrations', 'transaction-schema.sql'), 'utf8');
const initSharesData = fs.readFileSync(path.join(__dirname, 'migrations', 'init-shares.sql'), 'utf8');

// Create a new database connection
const db = new sqlite3.Database('miners.db');

// Execute migrations in sequence
const runMigrations = async () => {
    try {
        await new Promise((resolve, reject) => {
            console.log('Connected to SQLite database.');
            db.exec(schema, (err) => {
                if (err) reject(err);
                console.log('Database tables created successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(userSchema, (err) => {
                if (err) reject(err);
                console.log('User tables created successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(seedData, (err) => {
                if (err) reject(err);
                console.log('Database seeded with miners and pools successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(duplicateData, (err) => {
                if (err) reject(err);
                console.log('Miners duplicated across pools successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(shareTrackingSchema, (err) => {
                if (err) reject(err);
                console.log('Share tracking tables created successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(transactionSchema, (err) => {
                if (err) reject(err);
                console.log('Transaction tracking tables created successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(initSharesData, (err) => {
                if (err) reject(err);
                console.log('Share data initialized successfully.');
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                console.log('Database connection closed.');
                resolve();
            });
        });
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    }
};

// Run migrations
runMigrations().then(() => {
    // Start NOMP integration after database is initialized
    const { nompIntegration } = require('./server/nomp-integration');
    nompIntegration.startNOMP().catch(console.error);
});
