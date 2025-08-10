import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { poolConnections, minerBalances, miningRewards, miningRigs } from './schema';
import { db } from './db';

interface IMiningRig {
  rigId: string;
  rigName: string;
  hardware: string;
  poolId: string;
  hashCapacity: number;
  status?: string;
}

interface IPoolConnection {
  rigId: string;
  poolId: string;
  sharesSubmitted: number;
  sharesAccepted: number;
  hashRate?: number;
}

interface IMiningReward {
  rigId: string;
  poolId: string;
  userId?: string;
  rewardType: string;
  amount: string;
  shareContribution?: string;
  blockHeight?: number;
}

interface IStorage {
  // Rig management
  registerRig(rig: IMiningRig): Promise<void>;
  updateRigStatus(rigId: string, status: string): Promise<void>;
  getRigStats(rigId: string): Promise<any>;
  
  // Pool connections
  upsertPoolConnection(data: IPoolConnection): Promise<void>;
  getMiningStats(): Promise<{
    totalHashrate: number;
    totalShares: number;
    activeMiners: number;
  }>;

  // Balances and rewards
  getMinerBalances(rigId?: string): Promise<any[]>;
  getMiningRewards(rigId?: string): Promise<any[]>;
  createMiningReward(reward: IMiningReward): Promise<void>;
}

class Storage implements IStorage {
  // Rig Management
  async registerRig(rig: IMiningRig) {
    await db.insert(miningRigs).values({
      ...rig,
      firstSeen: new Date(),
      lastSeen: new Date()
    })
    .onConflictDoUpdate({
      target: [miningRigs.rigId],
      set: {
        lastSeen: new Date(),
        status: rig.status || 'online',
        hashCapacity: rig.hashCapacity
      }
    });
  }

  async updateRigStatus(rigId: string, status: string) {
    await db.update(miningRigs)
      .set({ status, lastSeen: new Date() })
      .where(eq(miningRigs.rigId, rigId));
  }

  async getRigStats(rigId: string) {
    const rig = await db.select().from(miningRigs).where(eq(miningRigs.rigId, rigId));
    const connection = await db.select().from(poolConnections)
      .where(eq(poolConnections.rigId, rigId));
    const balance = await db.select().from(minerBalances)
      .where(eq(minerBalances.rigId, rigId));
    
    return {
      rig: rig[0],
      connection: connection[0],
      balance: balance[0]
    };
  }

  // Pool Connections
  async upsertPoolConnection(data: IPoolConnection) {
    await db.insert(poolConnections).values(data)
      .onConflictDoUpdate({
        target: [poolConnections.rigId, poolConnections.poolId],
        set: data
      });
  }

  async getMiningStats() {
    const connections = await db.select().from(poolConnections);
    const activeRigs = await db.select().from(miningRigs)
      .where(eq(miningRigs.status, 'online'));
    
    return {
      totalHashrate: connections.reduce((sum: number, c: any) => sum + Number(c.hashRate || 0), 0),
      totalShares: connections.reduce((sum: number, c: any) => sum + (c.sharesAccepted || 0), 0),
      activeMiners: activeRigs.length
    };
  }

  // Balances and Rewards
  async getMinerBalances(rigId?: string) {
    const query = db.select().from(minerBalances);
    if (rigId) {
      query.where(eq(minerBalances.rigId, rigId));
    }
    return query;
  }

  async getMiningRewards(rigId?: string) {
    const query = db.select().from(miningRewards)
      .orderBy(desc(miningRewards.createdAt))
      .limit(100);
      
    if (rigId) {
      query.where(eq(miningRewards.rigId, rigId));
    }
    return query;
  }

  async createMiningReward(reward: IMiningReward) {
    await db.insert(miningRewards).values({
      rewardId: uuidv4(), // Generate unique ID for each reward
      ...reward,
      createdAt: new Date()
    });

    // Update miner balance
    await db.insert(minerBalances)
      .values({
        rigId: reward.rigId,
        poolId: reward.poolId,
        pendingBalance: reward.amount,
        totalEarned: reward.amount
      })
      .onConflictDoUpdate({
        target: [minerBalances.rigId, minerBalances.poolId],
        set: {
          pendingBalance: db.raw(`pending_balance + ${reward.amount}`),
          totalEarned: db.raw(`total_earned + ${reward.amount}`)
        }
      });
  }
}

export const storage = new Storage();
