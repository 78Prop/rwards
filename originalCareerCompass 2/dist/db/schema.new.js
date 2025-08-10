"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.miningRewards = exports.minerBalances = exports.poolConnections = exports.miningRigs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Mining Rigs
exports.miningRigs = (0, pg_core_1.pgTable)("mining_rigs", {
    rigId: (0, pg_core_1.text)("rig_id").primaryKey(),
    rigName: (0, pg_core_1.text)("rig_name").notNull(),
    hardware: (0, pg_core_1.text)("hardware").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    hashCapacity: (0, pg_core_1.decimal)("hash_capacity", { precision: 12, scale: 2 }),
    status: (0, pg_core_1.text)("status").notNull().default('online'),
    firstSeen: (0, pg_core_1.timestamp)("first_seen").defaultNow(),
    lastSeen: (0, pg_core_1.timestamp)("last_seen").defaultNow()
}, (table) => {
    return {
        poolIdx: (0, pg_core_1.index)("pool_idx").on(table.poolId),
        statusIdx: (0, pg_core_1.index)("status_idx").on(table.status)
    };
});
// Mining Rig Connections
exports.poolConnections = (0, pg_core_1.pgTable)("pool_connections", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    sharesSubmitted: (0, pg_core_1.integer)("shares_submitted").default(0),
    sharesAccepted: (0, pg_core_1.integer)("shares_accepted").default(0),
    hashRate: (0, pg_core_1.decimal)("hash_rate", { precision: 12, scale: 2 }),
    lastUpdate: (0, pg_core_1.timestamp)("last_update").defaultNow()
}, (table) => {
    return {
        rigPoolIdx: (0, pg_core_1.uniqueIndex)("rig_pool_idx").on(table.rigId, table.poolId)
    };
});
// Miner Balances
exports.minerBalances = (0, pg_core_1.pgTable)("miner_balances", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    pendingBalance: (0, pg_core_1.decimal)("pending_balance", { precision: 18, scale: 8 }).default("0"),
    confirmedBalance: (0, pg_core_1.decimal)("confirmed_balance", { precision: 18, scale: 8 }).default("0"),
    totalEarned: (0, pg_core_1.decimal)("total_earned", { precision: 18, scale: 8 }).default("0"),
    lastPayout: (0, pg_core_1.timestamp)("last_payout")
}, (table) => {
    return {
        rigPoolIdx: (0, pg_core_1.uniqueIndex)("rig_pool_bal_idx").on(table.rigId, table.poolId)
    };
});
// Mining Rewards
exports.miningRewards = (0, pg_core_1.pgTable)("mining_rewards", {
    rewardId: (0, pg_core_1.text)("reward_id").primaryKey(), // UUID for each reward
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    userId: (0, pg_core_1.text)("user_id"),
    rewardType: (0, pg_core_1.text)("reward_type").notNull(),
    currency: (0, pg_core_1.text)("currency").notNull().default('BTC'),
    amount: (0, pg_core_1.decimal)("amount", { precision: 18, scale: 8 }).notNull(),
    shareContribution: (0, pg_core_1.decimal)("share_contribution", { precision: 10, scale: 6 }),
    blockHeight: (0, pg_core_1.integer)("block_height"),
    status: (0, pg_core_1.text)("status").notNull().default('pending'),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
}, (table) => {
    return {
        rigIdx: (0, pg_core_1.index)("reward_rig_idx").on(table.rigId),
        poolIdx: (0, pg_core_1.index)("reward_pool_idx").on(table.poolId),
        timeIdx: (0, pg_core_1.index)("reward_time_idx").on(table.createdAt)
    };
});
