import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

// Users
export const users = sqliteTable("users", {
    userId: text("user_id").primaryKey(),
    username: text("username").notNull().unique(),
    role: text("role").notNull().default('user'),
    email: text("email").notNull().unique(),
    btcAddress: text("btc_address"),
    createdAt: integer("created_at").notNull(),
    lastLogin: integer("last_login")
});

// Mining Rigs
export const miningRigs = sqliteTable("mining_rigs", {
    rigId: text("rig_id").primaryKey(),
    userId: text("user_id").notNull(),
    rigName: text("rig_name").notNull(),
    hardware: text("hardware").notNull(),
    poolId: text("pool_id").notNull(),
    hashCapacity: real("hash_capacity"),
    totalShares: integer("total_shares").default(0),
    acceptedShares: integer("accepted_shares").default(0),
    rejectedShares: integer("rejected_shares").default(0),
    totalEarned: real("total_earned").default(0),
    status: text("status").default('offline'),
    firstSeen: integer("first_seen").notNull(),
    lastSeen: integer("last_seen").notNull()
});

// Mining Rig Connections
export const poolConnections = sqliteTable("pool_connections", {
    rigId: text("rig_id").notNull(),
    poolId: text("pool_id").notNull(),
    sharesSubmitted: integer("shares_submitted").default(0),
    sharesAccepted: integer("shares_accepted").default(0),
    hashRate: real("hash_rate"),
    lastUpdate: integer("last_update").default(Date.now())
});

// Miner Balances  
export const minerBalances = sqliteTable("miner_balances", {
    rigId: text("rig_id").notNull(),
    userId: text("user_id").notNull(),
    poolId: text("pool_id").notNull(),
    pendingBalance: real("pending_balance").default(0),
    confirmedBalance: real("confirmed_balance").default(0), 
    totalEarned: real("total_earned").default(0),
    lastPayout: integer("last_payout"),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.rigId, table.poolId] })
    };
});

// Mining Rewards
export const miningRewards = sqliteTable("mining_rewards", {
    rigId: text("rig_id").notNull(),
    poolId: text("pool_id").notNull(), 
    userId: text("user_id"),
    rewardType: text("reward_type").notNull(),
    currency: text("currency").notNull().default('BTC'),
    amount: real("amount").notNull(),
    shareContribution: real("share_contribution"),
    status: text("status").notNull().default('pending'),
    createdAt: integer("created_at").default(Date.now())
});

// Withdrawals
export const withdrawals = sqliteTable("withdrawals", {
    withdrawalId: text("withdrawal_id").primaryKey(),
    userId: text("user_id").notNull(),
    amount: real("amount").notNull(),
    btcAddress: text("btc_address").notNull(),
    status: text("status").notNull().default('pending'),
    txHash: text("tx_hash"),
    createdAt: integer("created_at").notNull().default(Date.now()),
    processedAt: integer("processed_at"),
    error: text("error"),
    blockCypherTxUrl: text("blockcypher_tx_url")
});
