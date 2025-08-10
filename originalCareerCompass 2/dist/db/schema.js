"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawals = exports.miningRewards = exports.minerBalances = exports.poolConnections = exports.miningRigs = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Users
exports.users = (0, pg_core_1.pgTable)("users", {
    userId: (0, pg_core_1.text)("user_id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default('user'),
    email: (0, pg_core_1.text)("email"),
    btcAddress: (0, pg_core_1.text)("btc_address"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    lastLogin: (0, pg_core_1.timestamp)("last_login")
}, (table) => {
    return {
        usernameIdx: (0, pg_core_1.uniqueIndex)("username_idx").on(table.username),
        emailIdx: (0, pg_core_1.uniqueIndex)("email_idx").on(table.email)
    };
});
// Mining Rigs
exports.miningRigs = (0, pg_core_1.pgTable)("mining_rigs", {
    rigId: (0, pg_core_1.text)("rig_id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    rigName: (0, pg_core_1.text)("rig_name").notNull(),
    hardware: (0, pg_core_1.text)("hardware").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    hashCapacity: (0, pg_core_1.text)("hash_capacity"), // Store as string to match Postgres decimal
    totalShares: (0, pg_core_1.integer)("total_shares").default(0),
    acceptedShares: (0, pg_core_1.integer)("accepted_shares").default(0),
    rejectedShares: (0, pg_core_1.integer)("rejected_shares").default(0),
    totalEarned: (0, pg_core_1.text)("total_earned").default("0"),
    status: (0, pg_core_1.text)("status").notNull().default('online'),
    firstSeen: (0, pg_core_1.timestamp)("first_seen").defaultNow(),
    lastSeen: (0, pg_core_1.timestamp)("last_seen").defaultNow()
}, (table) => {
    return {
        poolIdx: (0, pg_core_1.index)("pool_idx").on(table.poolId),
        statusIdx: (0, pg_core_1.index)("status_idx").on(table.status),
        userIdx: (0, pg_core_1.index)("user_rig_idx").on(table.userId)
    };
});
// Mining Rig Connections
exports.poolConnections = (0, pg_core_1.pgTable)("pool_connections", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    sharesSubmitted: (0, pg_core_1.integer)("shares_submitted").default(0),
    sharesAccepted: (0, pg_core_1.integer)("shares_accepted").default(0),
    hashRate: (0, pg_core_1.text)("hash_rate"), // Store as string to match Postgres decimal
    lastUpdate: (0, pg_core_1.timestamp)("last_update").defaultNow()
}, (table) => {
    return {
        rigPoolIdx: (0, pg_core_1.uniqueIndex)("rig_pool_idx").on(table.rigId, table.poolId),
        userIdx: (0, pg_core_1.index)("conn_user_idx").on(table.userId)
    };
});
// Miner Balances
exports.minerBalances = (0, pg_core_1.pgTable)("miner_balances", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    pendingBalance: (0, pg_core_1.text)("pending_balance").default("0"),
    confirmedBalance: (0, pg_core_1.text)("confirmed_balance").default("0"),
    totalEarned: (0, pg_core_1.text)("total_earned").default("0"),
    lastPayout: (0, pg_core_1.timestamp)("last_payout")
}, (table) => {
    return {
        rigPoolIdx: (0, pg_core_1.uniqueIndex)("rig_pool_bal_idx").on(table.rigId, table.poolId),
        userIdx: (0, pg_core_1.index)("balance_user_idx").on(table.userId)
    };
});
// Mining Rewards
exports.miningRewards = (0, pg_core_1.pgTable)("mining_rewards", {
    rewardId: (0, pg_core_1.text)("reward_id").primaryKey(),
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    userId: (0, pg_core_1.text)("user_id"),
    rewardType: (0, pg_core_1.text)("reward_type").notNull(),
    currency: (0, pg_core_1.text)("currency").notNull().default('BTC'),
    amount: (0, pg_core_1.text)("amount").notNull(),
    shareContribution: (0, pg_core_1.text)("share_contribution"),
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
// Withdrawals
exports.withdrawals = (0, pg_core_1.pgTable)("withdrawals", {
    withdrawalId: (0, pg_core_1.text)("withdrawal_id").primaryKey(),
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    userId: (0, pg_core_1.text)("user_id"),
    amount: (0, pg_core_1.text)("amount").notNull(),
    destinationAddress: (0, pg_core_1.text)("destination_address").notNull(),
    txHash: (0, pg_core_1.text)("tx_hash"),
    status: (0, pg_core_1.text)("status").notNull().default('pending'),
    error: (0, pg_core_1.text)("error"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    processedAt: (0, pg_core_1.timestamp)("processed_at")
}, (table) => {
    return {
        rigIdx: (0, pg_core_1.index)("withdrawal_rig_idx").on(table.rigId),
        poolIdx: (0, pg_core_1.index)("withdrawal_pool_idx").on(table.poolId),
        statusIdx: (0, pg_core_1.index)("withdrawal_status_idx").on(table.status),
        timeIdx: (0, pg_core_1.index)("withdrawal_time_idx").on(table.createdAt)
    };
});
