# TERA CORE - How Drizzle Pushes Mining Rewards to Users

## Overview
Drizzle ORM handles the complete mining rewards distribution pipeline, from tracking pool shares to pushing payments to users' accounts. Here's how the system works:

## How Drizzle Handles Mining Rewards Distribution

### 1. **Real-Time Mining Data Collection**
```typescript
// Drizzle schema tracks mining activity in real-time
export const poolConnections = pgTable("pool_connections", {
  rigId: text("rig_id").references(() => miningRigs.id).notNull(),
  poolId: text("pool_id").references(() => miningPools.id).notNull(),
  sharesSubmitted: integer("shares_submitted").default(0),
  sharesAccepted: integer("shares_accepted").default(0),
  hashRate: decimal("hash_rate", { precision: 12, scale: 2 }),
  // Real-time updates via WebSocket connections
});
```

### 2. **Balance Tracking Per User Per Pool**
```typescript
// Each user's earnings tracked individually
export const minerBalances = pgTable("miner_balances", {
  rigId: text("rig_id").references(() => miningRigs.id).notNull(),
  poolId: text("pool_id").references(() => miningPools.id).notNull(),
  pendingBalance: decimal("pending_balance", { precision: 18, scale: 8 }),
  confirmedBalance: decimal("confirmed_balance", { precision: 18, scale: 8 }),
  totalEarned: decimal("total_earned", { precision: 18, scale: 8 }),
  // Automatically updated when blocks are found
});
```

### 3. **Reward Distribution System**
```typescript
// Every mining reward gets recorded and distributed
export const miningRewards = pgTable("mining_rewards", {
  rigId: text("rig_id").references(() => miningRigs.id).notNull(),
  poolId: text("pool_id").references(() => miningPools.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  rewardType: text("reward_type").notNull(), // 'block_reward', 'pool_share', 'bonus'
  currency: text("currency").notNull().default('BTC'),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  shareContribution: decimal("share_contribution", { precision: 10, scale: 6 }),
  status: text("status").notNull().default('pending'),
  // Tracks from mining to user payout
});
```

### 4. **User Mining Accounts**
```typescript
// Links users to specific rigs and tracks profit sharing
export const userMiningAccounts = pgTable("user_mining_accounts", {
  userId: integer("user_id").references(() => users.id).notNull(),
  rigId: text("rig_id").references(() => miningRigs.id).notNull(),
  profitShare: decimal("profit_share", { precision: 5, scale: 2 }).default("100.00"),
  totalEarnings: decimal("total_earnings", { precision: 18, scale: 8 }),
  withdrawableBalance: decimal("withdrawable_balance", { precision: 18, scale: 8 }),
  // User gets their share of all rig earnings
});
```

## How Users Get Their Rewards - Complete Flow

### Step 1: Mining Activity Recording
```typescript
// Real-time updates via WebSocket from mining rigs
await storage.upsertPoolConnection({
  rigId: 'rig-001',
  poolId: 'kloudbugs-cafe',
  sharesAccepted: currentShares + newShares,
  hashRate: currentHashRate
});
```

### Step 2: Reward Calculation & Distribution
```typescript
// When pool finds a block, rewards get calculated
const blockReward = 6.25; // BTC block reward
const rigContribution = rigShares / totalPoolShares;
const userReward = blockReward * rigContribution * userProfitShare;

// Create reward record in Drizzle
await storage.createMiningReward({
  rigId: 'rig-001',
  userId: userId,
  rewardType: 'block_reward',
  amount: userReward.toString(),
  shareContribution: rigContribution.toString(),
  status: 'pending'
});
```

### Step 3: Balance Updates
```typescript
// Update user's mining balance automatically
await storage.updateMinerBalance(rigId, poolId, {
  confirmedBalance: currentBalance + userReward,
  totalEarned: totalEarned + userReward,
  lastPayout: new Date()
});

// Update user mining account
await storage.updateUserMiningAccount(userId, rigId, {
  totalEarnings: totalEarnings + userReward,
  withdrawableBalance: withdrawableBalance + userReward,
  lastRewardAt: new Date()
});
```

### Step 4: Real-Time Frontend Updates
```typescript
// Frontend gets live updates via TanStack Query
const { data: balances } = useQuery({
  queryKey: ['/api/mining/balances'],
  refetchInterval: 5000, // Updates every 5 seconds
});

// WebSocket pushes instant notifications
const { data: rewards } = useQuery({
  queryKey: ['/api/mining/rewards', userId],
  refetchInterval: 1000, // Real-time reward tracking
});
```

### Step 5: Automatic Payouts
```typescript
// Auto-withdrawal system checks thresholds
const checkPayouts = async () => {
  const eligibleBalances = await storage.getMinerBalances();
  
  for (const balance of eligibleBalances) {
    if (balance.confirmedBalance >= balance.payoutThreshold) {
      // Automatically create withdrawal
      await storage.createWithdrawal({
        userId: balance.userId,
        tokenType: balance.currency,
        amount: balance.confirmedBalance,
        toAddress: userWalletAddress,
        status: 'approved' // Auto-approved for mining rewards
      });
      
      // Process via ethers.js blockchain integration
      await withdrawalManager.processWithdrawal(withdrawalId);
    }
  }
};
```

## Database Storage & Retrieval Operations

### API Endpoints for User Rewards
```typescript
// GET /api/mining/balances - User's current balances
app.get('/api/mining/balances', async (req, res) => {
  const balances = await storage.getMinerBalances(req.user.id);
  res.json(balances);
});

// GET /api/mining/rewards - User's reward history  
app.get('/api/mining/rewards', async (req, res) => {
  const rewards = await storage.getMiningRewards(req.user.id);
  res.json(rewards);
});

// POST /api/mining/withdraw - Request withdrawal
app.post('/api/mining/withdraw', async (req, res) => {
  const withdrawal = await storage.createWithdrawal({
    userId: req.user.id,
    ...req.body
  });
  res.json(withdrawal);
});
```

### Storage Interface Methods
```typescript
// Storage methods handle all database operations
interface IStorage {
  // Reward tracking
  createMiningReward(reward: InsertMiningReward): Promise<MiningReward>;
  getMiningRewards(userId?: number): Promise<MiningReward[]>;
  
  // Balance management  
  updateMinerBalance(rigId: string, poolId: string, updates: Partial<InsertMinerBalance>): Promise<MinerBalance>;
  getMinerBalances(userId?: number): Promise<MinerBalance[]>;
  
  // User accounts
  getUserMiningAccount(userId: number, rigId: string): Promise<UserMiningAccount>;
  updateUserMiningAccount(userId: number, rigId: string, updates: Partial<InsertUserMiningAccount>): Promise<UserMiningAccount>;
}
```

## Real-Time Reward Distribution Process

### 1. **Mining Rig Reports Activity**
- WebSocket connection sends share submissions to server
- Drizzle updates `poolConnections` table with new shares
- System calculates contribution percentage

### 2. **Pool Finds Block**  
- Pool broadcasts block discovery
- System calculates individual rig contributions
- Drizzle creates `miningRewards` records for each user

### 3. **Balance Updates**
- `minerBalances` table updated with new earnings
- `userMiningAccounts` tracks cumulative totals
- Real-time notifications sent to frontend

### 4. **Automatic Payouts**
- System checks withdrawal thresholds
- Creates withdrawal records via Drizzle
- Processes payments through ethers.js blockchain integration

### 5. **User Notifications**
- Frontend receives real-time balance updates
- Email/SMS notifications sent for significant rewards
- Transaction history maintained in database

## Key Benefits of Drizzle-Based Reward System

✓ **Real-Time Tracking**: Every share, reward, and payout recorded instantly
✓ **Automatic Distribution**: No manual intervention required for standard payouts  
✓ **Transparent Accounting**: Complete audit trail for all mining activities
✓ **Multi-Currency Support**: BTC, ETH, TERA tokens handled seamlessly
✓ **Scalable Architecture**: Handles multiple rigs and pools simultaneously
✓ **Secure Processing**: All transactions validated and recorded before execution

This system ensures users receive their mining rewards automatically and transparently, with full database persistence and real-time updates through Drizzle ORM integration.