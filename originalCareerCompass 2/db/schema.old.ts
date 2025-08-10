import { sqliteTable, text, integer, primaryKey, sql } from 'drizzle-orm/sqlite-core';

// Users
export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull(),
  role: text("role").notNull().default('user'),
  email: text("email"),
  btcAddress: text("btc_address"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login")
}, (table) => {
  return {
    usernameIdx: uniqueIndex("username_idx").on(table.username),
    emailIdx: uniqueIndex("email_idx").on(table.email)
  }
});

// Mining Rigs
export const miningRigs = pgTable("mining_rigs", {
  rigId: text("rig_id").primaryKey(),
  userId: text("user_id").notNull(),
  rigName: text("rig_name").notNull(),
  hardware: text("hardware").notNull(),
  poolId: text("pool_id").notNull(),
  hashCapacity: text("hash_capacity"),  // Store as string to match Postgres decimal
  totalShares: integer("total_shares").default(0),
  acceptedShares: integer("accepted_shares").default(0),
  rejectedShares: integer("rejected_shares").default(0),
  totalEarned: text("total_earned").default("0"),
  status: text("status").notNull().default('online'),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow()
}, (table) => {
  return {
    poolIdx: index("pool_idx").on(table.poolId),
    statusIdx: index("status_idx").on(table.status),
    userIdx: index("user_rig_idx").on(table.userId)
  }
});

// Mining Rig Connections
export const poolConnections = pgTable("pool_connections", {
  rigId: text("rig_id").notNull(),
  userId: text("user_id").notNull(),
  poolId: text("pool_id").notNull(),
  sharesSubmitted: integer("shares_submitted").default(0),
  sharesAccepted: integer("shares_accepted").default(0),
  hashRate: text("hash_rate"),  // Store as string to match Postgres decimal
  lastUpdate: timestamp("last_update").defaultNow()
}, (table) => {
  return {
    rigPoolIdx: uniqueIndex("rig_pool_idx").on(table.rigId, table.poolId),
    userIdx: index("conn_user_idx").on(table.userId)
  }
});

// Miner Balances
export const minerBalances = pgTable("miner_balances", {
  rigId: text("rig_id").notNull(),
  userId: text("user_id").notNull(),
  poolId: text("pool_id").notNull(),
  pendingBalance: text("pending_balance").default("0"),
  confirmedBalance: text("confirmed_balance").default("0"),
  totalEarned: text("total_earned").default("0"),
  lastPayout: timestamp("last_payout")
}, (table) => {
  return {
    rigPoolIdx: uniqueIndex("rig_pool_bal_idx").on(table.rigId, table.poolId),
    userIdx: index("balance_user_idx").on(table.userId)
  }
});

// Mining Rewards
export const miningRewards = pgTable("mining_rewards", {
  rewardId: text("reward_id").primaryKey(),
  rigId: text("rig_id").notNull(),
  poolId: text("pool_id").notNull(),
  userId: text("user_id"),
  rewardType: text("reward_type").notNull(),
  currency: text("currency").notNull().default('BTC'),
  amount: text("amount").notNull(),
  shareContribution: text("share_contribution"),
  blockHeight: integer("block_height"),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    rigIdx: index("reward_rig_idx").on(table.rigId),
    poolIdx: index("reward_pool_idx").on(table.poolId),
    timeIdx: index("reward_time_idx").on(table.createdAt)
  }
});

// Withdrawals
export const withdrawals = pgTable("withdrawals", {
  withdrawalId: text("withdrawal_id").primaryKey(),
  rigId: text("rig_id").notNull(),
  poolId: text("pool_id").notNull(),
  userId: text("user_id"),
  amount: text("amount").notNull(),
  destinationAddress: text("destination_address").notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull().default('pending'),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at")
}, (table) => {
  return {
    rigIdx: index("withdrawal_rig_idx").on(table.rigId),
    poolIdx: index("withdrawal_pool_idx").on(table.poolId),
    statusIdx: index("withdrawal_status_idx").on(table.status),
    timeIdx: index("withdrawal_time_idx").on(table.createdAt)
  }
});
