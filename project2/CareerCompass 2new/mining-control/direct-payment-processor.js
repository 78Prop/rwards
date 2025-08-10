import axios from 'axios';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { config } from '../config/now-payments-config.json';

class DirectPaymentProcessor {
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
                // Create payment with customer pays fees option
                const paymentResponse = await this.client.post('/payment', {
                    price_amount: payout.total_rewards,
                    price_currency: 'BTC',
                    pay_currency: 'BTC',
                    ipn_callback_url: config.nowPayments.callbackUrl,
                    order_id: `${payout.rig_id}-${Date.now()}`,
                    order_description: `Mining payout for ${payout.rig_id}`,
                    is_fee_paid_by_user: true,  // Miner pays the fees
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
                        'created',
                        null,
                        payout.wallet_address
                    ]);

                    // Zero out miner's balance only after they complete payment
                    console.log(`Payment created for ${payout.rig_id}: ${payout.total_rewards} BTC`);
                    console.log(`Payment URL: ${paymentResponse.data.invoice_url}`);
                    
                    // Store payment URL for miner to access
                    await this.db.runAsync(`
                        UPDATE withdrawals 
                        SET payment_url = ?
                        WHERE id = ?
                    `, [paymentResponse.data.invoice_url, paymentResponse.data.payment_id]);
                }
            }
        } catch (err) {
            console.error('Error processing payments:', err);
            throw err;
        }
    }

    // Handle NOW Payments IPN callback
    async handleCallback(ipnData) {
        try {
            if (ipnData.payment_status === 'confirmed') {
                // Update withdrawal status
                await this.db.runAsync(`
                    UPDATE withdrawals
                    SET status = 'completed',
                        txid = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [ipnData.hash, ipnData.payment_id]);

                // Get withdrawal details
                const withdrawal = await this.db.getAsync(`
                    SELECT rig_id, pool_id, amount 
                    FROM withdrawals 
                    WHERE id = ?
                `, [ipnData.payment_id]);

                // Reset miner's reward balance after successful payment
                if (withdrawal) {
                    await this.db.runAsync(`
                        UPDATE miner_shares 
                        SET rewards = rewards - ?
                        WHERE rig_id = ? AND pool_id = ?
                    `, [withdrawal.amount, withdrawal.rig_id, withdrawal.pool_id]);
                }
                
                console.log(`Payment completed: ${ipnData.payment_id}`);
            }
        } catch (err) {
            console.error('Error handling payment callback:', err);
            throw err;
        }
    }

    // Get pending withdrawals
    async getPendingWithdrawals() {
        return await this.db.allAsync(`
            SELECT * FROM withdrawals 
            WHERE status IN ('created', 'pending')
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

export default DirectPaymentProcessor;
