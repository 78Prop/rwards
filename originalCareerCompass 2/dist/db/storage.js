"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
const db_1 = require("./db");
class Storage {
    async upsertPoolConnection(data) {
        await db_1.db.insert(schema_1.poolConnections).values(data)
            .onConflictDoUpdate({
            target: [schema_1.poolConnections.rigId, schema_1.poolConnections.poolId],
            set: data
        });
    }
    async getMiningStats() {
        const connections = await db_1.db.select().from(schema_1.poolConnections);
        return {
            totalHashrate: connections.reduce((sum, c) => sum + Number(c.hashRate || 0), 0),
            totalShares: connections.reduce((sum, c) => sum + (c.sharesAccepted || 0), 0),
            activeMiners: connections.length
        };
    }
    async getMinerBalances(userId) {
        const query = db_1.db.select().from(schema_1.minerBalances);
        if (userId) {
            query.where((0, drizzle_orm_1.eq)(schema_1.minerBalances.rigId, userId));
        }
        return query;
    }
    async getMiningRewards(userId) {
        const query = db_1.db.select().from(schema_1.miningRewards);
        if (userId) {
            query.where((0, drizzle_orm_1.eq)(schema_1.miningRewards.userId, userId));
        }
        return query;
    }
    async createMiningReward(reward) {
        await db_1.db.insert(schema_1.miningRewards).values(reward);
    }
}
exports.storage = new Storage();
