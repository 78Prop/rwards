import { eq } from 'drizzle-orm';
import { poolConnections, minerBalances, miningRewards } from './schema';
import { db } from './db';

interface IStorage {
  // Pool connections
  upsertPoolConnection(data: { 
    rigId: string;
    poolId: string;
    sharesSubmitted: number;
    sharesAccepted: number;
    hashRate?: number;
  }): Promise<void>;

  // Mining stats
  getMiningStats(): Promise<{
    totalHashrate: number;
    totalShares: number;
    activeMiners: number;
  }>;

  // Balances
  getMinerBalances(userId?: string): Promise<any[]>;

  // Rewards
  getMiningRewards(userId?: string): Promise<any[]>;
  createMiningReward(reward: {
    rigId: string;
    poolId: string;
    userId?: string;
    rewardType: string;
    amount: string;
    shareContribution?: string;
  }): Promise<void>;
}

class Storage implements IStorage {
  async upsertPoolConnection(data: any) {
    await db.insert(poolConnections).values(data)
      .onConflictDoUpdate({
        target: [poolConnections.rigId, poolConnections.poolId],
        set: data
      });
  }

  async getMiningStats() {
    const connections = await db.select().from(poolConnections);
    
    return {
      totalHashrate: connections.reduce((sum: number, c: any) => sum + Number(c.hashRate || 0), 0),
      totalShares: connections.reduce((sum: number, c: any) => sum + (c.sharesAccepted || 0), 0),
      activeMiners: connections.length
    };
  }

  async getMinerBalances(userId?: string) {
    const query = db.select().from(minerBalances);
    if (userId) {
      query.where(eq(minerBalances.rigId, userId));
    }
    return query;
  }

  async getMiningRewards(userId?: string) {
    const query = db.select().from(miningRewards);
    if (userId) {
      query.where(eq(miningRewards.userId, userId));
    }
    return query;
  }

  async createMiningReward(reward: any) {
    await db.insert(miningRewards).values(reward);
  }
}

export const storage = new Storage();
