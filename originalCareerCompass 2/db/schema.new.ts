import { pgTable, text, integer, decimal, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

// Mining Rigs
export const miningRigs = pgTable("mining_rigs", {
  rigId: text("rig_id").primaryKey(),
  rigName: text("rig_name").notNull(),
  hardware: text("hardware").notNull(),
  poolId: text("pool_id").notNull(),
  hashCapacity: decimal("hash_capacity", { precision: 12, scale: 2 }),
  status: text("status").notNull().default('online'),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow()
}, (table) => {
  return {
    poolIdx: index("pool_idx").on(table.poolId),
    statusIdx: index("status_idx").on(table.status)
  }
});

// Mining Rig Connections
export const poolConnections = pgTable("pool_connections", {
  rigId: text("rig_id").notNull(),
  poolId: text("pool_id").notNull(),
  sharesSubmitted: integer("shares_submitted").default(0),
  sharesAccepted: integer("shares_accepted").default(0),
  hashRate: decimal("hash_rate", { precision: 12, scale: 2 }),
  lastUpdate: timestamp("last_update").defaultNow()
}, (table) => {
  return {
    rigPoolIdx: uniqueIndex("rig_pool_idx").on(table.rigId, table.poolId)
  }
});

// Miner Balances
export const minerBalances = pgTable("miner_balances", {
  rigId: text("rig_id").notNull(),
  poolId: text("pool_id").notNull(),
  pendingBalance: decimal("pending_balance", { precision: 18, scale: 8 }).default("0"),
  confirmedBalance: decimal("confirmed_balance", { precision: 18, scale: 8 }).default("0"),
  totalEarned: decimal("total_earned", { precision: 18, scale: 8 }).default("0"),
  lastPayout: timestamp("last_payout")
}, (table) => {
  return {
    rigPoolIdx: uniqueIndex("rig_pool_bal_idx").on(table.rigId, table.poolId)
  }
});

// Mining Rewards
export const miningRewards = pgTable("mining_rewards", {
  rewardId: text("reward_id").primaryKey(), // UUID for each reward
  rigId: text("rig_id").notNull(),
  poolId: text("pool_id").notNull(),
  userId: text("user_id"),
  rewardType: text("reward_type").notNull(),
  currency: text("currency").notNull().default('BTC'),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  shareContribution: decimal("share_contribution", { precision: 10, scale: 6 }),
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
