"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.miningRewards = exports.minerBalances = exports.poolConnections = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// Mining Rig Connections
exports.poolConnections = (0, pg_core_1.pgTable)("pool_connections", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    sharesSubmitted: (0, pg_core_1.integer)("shares_submitted").default(0),
    sharesAccepted: (0, pg_core_1.integer)("shares_accepted").default(0),
    hashRate: (0, pg_core_1.decimal)("hash_rate", { precision: 12, scale: 2 }),
    lastUpdate: (0, pg_core_1.timestamp)("last_update").defaultNow()
});
// Miner Balances
exports.minerBalances = (0, pg_core_1.pgTable)("miner_balances", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    pendingBalance: (0, pg_core_1.decimal)("pending_balance", { precision: 18, scale: 8 }),
    confirmedBalance: (0, pg_core_1.decimal)("confirmed_balance", { precision: 18, scale: 8 }),
    totalEarned: (0, pg_core_1.decimal)("total_earned", { precision: 18, scale: 8 }),
    lastPayout: (0, pg_core_1.timestamp)("last_payout")
});
// Mining Rewards
exports.miningRewards = (0, pg_core_1.pgTable)("mining_rewards", {
    rigId: (0, pg_core_1.text)("rig_id").notNull(),
    poolId: (0, pg_core_1.text)("pool_id").notNull(),
    userId: (0, pg_core_1.text)("user_id"),
    rewardType: (0, pg_core_1.text)("reward_type").notNull(),
    currency: (0, pg_core_1.text)("currency").notNull().default('BTC'),
    amount: (0, pg_core_1.decimal)("amount", { precision: 18, scale: 8 }).notNull(),
    shareContribution: (0, pg_core_1.decimal)("share_contribution", { precision: 10, scale: 6 }),
    status: (0, pg_core_1.text)("status").notNull().default('pending'),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
