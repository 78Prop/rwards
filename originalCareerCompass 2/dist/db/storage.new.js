"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const schema_1 = require("./schema");
const db_1 = require("./db");
class Storage {
    // Rig Management
    async registerRig(rig) {
        await db_1.db.insert(schema_1.miningRigs).values({
            ...rig,
            firstSeen: new Date(),
            lastSeen: new Date()
        })
            .onConflictDoUpdate({
            target: [schema_1.miningRigs.rigId],
            set: {
                lastSeen: new Date(),
                status: rig.status || 'online',
                hashCapacity: rig.hashCapacity
            }
        });
    }
    async updateRigStatus(rigId, status) {
        await db_1.db.update(schema_1.miningRigs)
            .set({ status, lastSeen: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.miningRigs.rigId, rigId));
    }
    async getRigStats(rigId) {
        const rig = await db_1.db.select().from(schema_1.miningRigs).where((0, drizzle_orm_1.eq)(schema_1.miningRigs.rigId, rigId));
        const connection = await db_1.db.select().from(schema_1.poolConnections)
            .where((0, drizzle_orm_1.eq)(schema_1.poolConnections.rigId, rigId));
        const balance = await db_1.db.select().from(schema_1.minerBalances)
            .where((0, drizzle_orm_1.eq)(schema_1.minerBalances.rigId, rigId));
        return {
            rig: rig[0],
            connection: connection[0],
            balance: balance[0]
        };
    }
    // Pool Connections
    async upsertPoolConnection(data) {
        await db_1.db.insert(schema_1.poolConnections).values(data)
            .onConflictDoUpdate({
            target: [schema_1.poolConnections.rigId, schema_1.poolConnections.poolId],
            set: data
        });
    }
    async getMiningStats() {
        const connections = await db_1.db.select().from(schema_1.poolConnections);
        const activeRigs = await db_1.db.select().from(schema_1.miningRigs)
            .where((0, drizzle_orm_1.eq)(schema_1.miningRigs.status, 'online'));
        return {
            totalHashrate: connections.reduce((sum, c) => sum + Number(c.hashRate || 0), 0),
            totalShares: connections.reduce((sum, c) => sum + (c.sharesAccepted || 0), 0),
            activeMiners: activeRigs.length
        };
    }
    // Balances and Rewards
    async getMinerBalances(rigId) {
        const query = db_1.db.select().from(schema_1.minerBalances);
        if (rigId) {
            query.where((0, drizzle_orm_1.eq)(schema_1.minerBalances.rigId, rigId));
        }
        return query;
    }
    async getMiningRewards(rigId) {
        const query = db_1.db.select().from(schema_1.miningRewards)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.miningRewards.createdAt))
            .limit(100);
        if (rigId) {
            query.where((0, drizzle_orm_1.eq)(schema_1.miningRewards.rigId, rigId));
        }
        return query;
    }
    async createMiningReward(reward) {
        await db_1.db.insert(schema_1.miningRewards).values({
            rewardId: (0, uuid_1.v4)(), // Generate unique ID for each reward
            ...reward,
            createdAt: new Date()
        });
        // Update miner balance
        await db_1.db.insert(schema_1.minerBalances)
            .values({
            rigId: reward.rigId,
            poolId: reward.poolId,
            pendingBalance: reward.amount,
            totalEarned: reward.amount
        })
            .onConflictDoUpdate({
            target: [schema_1.minerBalances.rigId, schema_1.minerBalances.poolId],
            set: {
                pendingBalance: db_1.db.raw(`pending_balance + ${reward.amount}`),
                totalEarned: db_1.db.raw(`total_earned + ${reward.amount}`)
            }
        });
    }
}
exports.storage = new Storage();
