"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAdminUser = initializeAdminUser;
const db_js_1 = require("../db/db.js");
const user_js_1 = require("./user.js");
const uuid_1 = require("uuid");
const schema_js_1 = require("../db/schema.js");
const userService = new user_js_1.UserService();
async function initializeAdminUser() {
    try {
        // Create admin user
        const adminUserId = await userService.createUser('admin.user', 'admin@example.com', 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6' // Replace with your actual BTC address
        );
        // Create some initial mining rigs for admin
        const pools = ['kloudBugsCafe', 'teraSocialJustice', 'teraToken'];
        const hardwareTypes = ['GPU', 'ASIC', 'CPU'];
        for (const pool of pools) {
            // Create rigs for each pool
            for (let i = 0; i < 3; i++) {
                const rigId = (0, uuid_1.v4)();
                await db_js_1.db.insert(schema_js_1.miningRigs).values({
                    rigId,
                    userId: adminUserId,
                    rigName: `${pool}-rig-${i + 1}`,
                    hardware: hardwareTypes[i % 3],
                    poolId: pool,
                    hashCapacity: ((Math.random() * 100) + 50).toFixed(2),
                    totalShares: Math.floor(Math.random() * 10000),
                    acceptedShares: Math.floor(Math.random() * 9000),
                    rejectedShares: Math.floor(Math.random() * 1000),
                    totalEarned: (Math.random() * 0.1).toFixed(8),
                    status: 'online'
                });
            }
        }
        console.log('Admin user initialized with ID:', adminUserId);
        return adminUserId;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Failed to initialize admin user:', error.message);
        }
        throw error;
    }
}
