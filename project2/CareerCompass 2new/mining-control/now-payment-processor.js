import axios from 'axios';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { config } from '../config/config.js';

class NOWPaymentProcessor {
    constructor(dbPath = 'miners.db') {
        this.db = new sqlite3.Database(dbPath);
        this.db.getAsync = promisify(this.db.get).bind(this.db);
        this.db.allAsync = promisify(this.db.all).bind(this.db);
        this.db.runAsync = promisify(this.db.run).bind(this.db);
        
        // Initialize NOW Payments client
        this.client = axios.create({
            baseURL: 'https://api.nowpayments.io/v1',
            headers: {
                'x-api-key': config.nowPayments.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    // Process payouts for miners that have reached threshold
    async processPayouts(minPayout = 0.01) {
        try {
            // Get miners eligible for payout
            const pendingPayouts = await this.db.allAsync(`
                SELECT 
                    ms.rig_id,
                    ms.pool_id,
                    mr.wallet_address,
                    SUM(ms.rewards) as total_rewards
                FROM miner_shares ms
                JOIN mining_rigs mr ON ms.rig_id = mr.id
                WHERE ms.rewards >= ?
                GROUP BY ms.rig_id, ms.pool_id, mr.wallet_address
            `, [minPayout]);

            for (const payout of pendingPayouts) {
                // Create NOW payment
                const paymentResponse = await this.client.post('/payment', {
                    price_amount: payout.total_rewards,
                    price_currency: 'BTC',  // or 'LTC', 'ETH' etc
                    pay_currency: 'BTC',
                    ipn_callback_url: config.nowPayments.callbackUrl,
                    order_id: `${payout.rig_id}-${Date.now()}`,
                    order_description: `Mining payout for ${payout.rig_id}`,
                    pay_address: payout.wallet_address
                });

                if (paymentResponse.data && paymentResponse.data.payment_id) {
                    // Record withdrawal attempt
                    await this.db.runAsync(`
                        INSERT INTO withdrawals (
                            id, 
                            rig_id, 
                            pool_id, 
                            amount, 
                            status, 
                            txid,
                            wallet_address
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        paymentResponse.data.payment_id,
                        payout.rig_id,
                        payout.pool_id,
                        payout.total_rewards,
                        'processing',
                        null,
                        payout.wallet_address
                    ]);

                    // Reset miner's reward balance after initiating payment
                    await this.db.runAsync(`
                        UPDATE miner_shares 
                        SET rewards = 0
                        WHERE rig_id = ? AND pool_id = ?
                    `, [payout.rig_id, payout.pool_id]);

                    console.log(`Payment initiated for ${payout.rig_id}: ${payout.total_rewards} BTC`);
                }
            }
        } catch (err) {
            console.error('Error processing NOW payments:', err);
            throw err;
        }
    }

    // Handle NOW Payments IPN callback
    async handleCallback(ipnData) {
        try {
            if (ipnData.payment_status === 'finished') {
                await this.db.runAsync(`
                    UPDATE withdrawals
                    SET status = 'completed',
                        txid = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [ipnData.hash, ipnData.payment_id]);
                
                console.log(`Payment completed: ${ipnData.payment_id}`);
            }
        } catch (err) {
            console.error('Error handling NOW payment callback:', err);
            throw err;
        }
    }

    // Get pending withdrawal status
    async getPendingWithdrawals() {
        return await this.db.allAsync(`
            SELECT * FROM withdrawals 
            WHERE status IN ('pending', 'processing')
            ORDER BY created_at ASC
        `);
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

export default NOWPaymentProcessor;
