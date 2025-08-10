import sqlite3 from 'sqlite3';
import axios from 'axios';
import { config } from '../config/now-payments-config.json';

// Create NOW Payments client
const client = axios.create({
    baseURL: 'https://api.nowpayments.io/v1',
    headers: {
        'x-api-key': config.nowPayments.apiKey,
        'Content-Type': 'application/json'
    }
});

// Connect to database
const db = new sqlite3.Database('miners.db');

// Get total rewards
db.get(`
    SELECT SUM(rewards) as total_rewards 
    FROM miner_shares
`, async (err, result) => {
    if (err) {
        console.error('Error getting rewards:', err);
        return;
    }

    const totalRewards = result.total_rewards;
    console.log(`\nTotal Mining Rewards: ${totalRewards} BTC`);

    if (totalRewards >= 0.01) {
        // Ask if user wants to withdraw
        console.log('\nWould you like to withdraw? (Create payment URL)');
        console.log('Press Ctrl+C to cancel or any key to continue...');
        
        process.stdin.once('data', async () => {
            try {
                // Create payment URL
                const response = await client.post('/payment', {
                    price_amount: totalRewards,
                    price_currency: 'BTC',
                    pay_currency: 'BTC',
                    is_fee_paid_by_user: true,
                    order_description: 'Mining Rewards Withdrawal'
                });

                console.log('\nPayment URL created!');
                console.log('Open this URL to complete your withdrawal:');
                console.log(response.data.invoice_url);
                
                // Save withdrawal record
                db.run(`
                    INSERT INTO withdrawals (
                        id, rig_id, amount, status, payment_url
                    ) VALUES (?, ?, ?, ?, ?)
                `, [
                    response.data.payment_id,
                    'YOUR_RIG_ID',
                    totalRewards,
                    'created',
                    response.data.invoice_url
                ]);

            } catch (error) {
                console.error('Error creating payment:', error.message);
            }
            process.exit();
        });
    } else {
        console.log('Need at least 0.01 BTC to withdraw');
        process.exit();
    }
});
