import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { walletManager } from './wallet-manager';

class WithdrawProcessor {
    constructor(dbPath = 'miners.db') {
        this.db = new sqlite3.Database(dbPath);
        this.db.getAsync = promisify(this.db.get).bind(this.db);
        this.db.allAsync = promisify(this.db.all).bind(this.db);
        this.db.runAsync = promisify(this.db.run).bind(this.db);
    }

    // Get available balance with fees calculated
    async getAvailableBalance(rigId, poolId) {
        try {
            const result = await this.db.getAsync(`
                SELECT SUM(rewards) as total_rewards
                FROM miner_shares 
                WHERE rig_id = ? AND pool_id = ?
            `, [rigId, poolId]);

            const totalRewards = result?.total_rewards || 0;
            const networkFee = 0.0001; // Standard BTC network fee
            const availableAfterFees = Math.max(0, totalRewards - networkFee);

            return {
                totalRewards,
                networkFee,
                availableAfterFees,
                canWithdraw: availableAfterFees >= 0.01 // Minimum 0.01 BTC withdrawal
            };
        } catch (err) {
            console.error('Error getting available balance:', err);
            throw err;
        }
    }

    // Process withdrawal with fees
    async processWithdrawal(rigId, poolId, toAddress) {
        try {
            // Check balance first
            const balance = await this.getAvailableBalance(rigId, poolId);
            
            if (!balance.canWithdraw) {
                throw new Error('Insufficient balance for withdrawal');
            }

            // Create withdrawal record
            const withdrawalId = `w-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            await this.db.runAsync(`
                INSERT INTO withdrawals (
                    id, rig_id, pool_id, amount, fee_amount, status, wallet_address
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                withdrawalId,
                rigId,
                poolId,
                balance.availableAfterFees,
                balance.networkFee,
                'processing',
                toAddress
            ]);

            // Process the actual blockchain transaction
            const txid = await walletManager.sendTransaction(toAddress, balance.availableAfterFees);

            // Update withdrawal with transaction ID
            await this.db.runAsync(`
                UPDATE withdrawals 
                SET status = 'completed', 
                    txid = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [txid, withdrawalId]);

            // Reset rewards after successful withdrawal
            await this.db.runAsync(`
                UPDATE miner_shares 
                SET rewards = 0
                WHERE rig_id = ? AND pool_id = ?
            `, [rigId, poolId]);

            return {
                withdrawalId,
                txid,
                amount: balance.availableAfterFees,
                fee: balance.networkFee,
                status: 'completed'
            };
        } catch (err) {
            console.error('Error processing withdrawal:', err);
            throw err;
        }
    }

    // Get withdrawal history
    async getWithdrawals(rigId, poolId) {
        try {
            return await this.db.allAsync(`
                SELECT id, amount, fee_amount, status, txid, wallet_address, created_at 
                FROM withdrawals 
                WHERE rig_id = ? AND pool_id = ?
                ORDER BY created_at DESC
            `, [rigId, poolId]);
        } catch (err) {
            console.error('Error getting withdrawals:', err);
            throw err;
        }
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

export default WithdrawProcessor;
