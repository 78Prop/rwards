"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../db/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class UserService {
    // Create a new user
    async createUser(username, email = null, btcAddress = null) {
        const userId = (0, uuid_1.v4)();
        await db_1.db.insert(schema_1.users).values({
            userId,
            username,
            email,
            btcAddress,
            role: username === 'admin.user' ? 'admin' : 'user'
        });
        return userId;
    }
    // Get user details with mining statistics
    async getUserDetails(userId) {
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.userId, userId)
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Get all rigs for user
        const rigs = await db_1.db.query.miningRigs.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.miningRigs.userId, userId)
        });
        // Calculate total shares and earnings
        let totalShares = 0;
        let totalAcceptedShares = 0;
        let totalEarnings = "0";
        for (const rig of rigs) {
            totalShares += rig.totalShares || 0;
            totalAcceptedShares += rig.acceptedShares || 0;
            if (rig.totalEarned) {
                totalEarnings = (parseFloat(totalEarnings) + parseFloat(rig.totalEarned)).toString();
            }
        }
        // Get balances across all pools
        const balances = await db_1.db.query.minerBalances.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.minerBalances.userId, userId)
        });
        let totalPendingBalance = "0";
        let totalConfirmedBalance = "0";
        for (const balance of balances) {
            if (balance.pendingBalance) {
                totalPendingBalance = (parseFloat(totalPendingBalance) + parseFloat(balance.pendingBalance)).toString();
            }
            if (balance.confirmedBalance) {
                totalConfirmedBalance = (parseFloat(totalConfirmedBalance) + parseFloat(balance.confirmedBalance)).toString();
            }
        }
        return {
            ...user,
            miningStats: {
                rigCount: rigs.length,
                totalShares,
                totalAcceptedShares,
                acceptanceRate: totalShares > 0 ? (totalAcceptedShares / totalShares) * 100 : 0,
                totalEarnings,
                pendingBalance: totalPendingBalance,
                confirmedBalance: totalConfirmedBalance
            },
            rigs
        };
    }
    // Get user's mining history
    async getUserMiningHistory(userId) {
        const rewards = await db_1.db.query.miningRewards.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.miningRewards.userId, userId),
            orderBy: (rewards, { desc }) => [desc(rewards.createdAt)]
        });
        return rewards;
    }
    // Update user's BTC address
    async updateBtcAddress(userId, btcAddress) {
        await db_1.db.update(schema_1.users)
            .set({ btcAddress })
            .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId));
    }
    // Get user's active mining sessions
    async getActiveSessions(userId) {
        const connections = await db_1.db.query.poolConnections.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.poolConnections.userId, userId)
        });
        return connections;
    }
}
exports.UserService = UserService;
