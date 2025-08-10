import axios from 'axios';
import { config } from '../config/now-payments-config.json';

class NOWBalanceManager {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.nowpayments.io/v1',
            headers: {
                'x-api-key': config.nowPayments.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    // Check NOW merchant balance
    async checkBalance() {
        try {
            const response = await this.client.get('/balance');
            const balances = response.data.currencies;
            
            // Log all currency balances
            console.log('NOW Payment Balances:');
            balances.forEach(balance => {
                console.log(`${balance.currency}: ${balance.balance}`);
            });

            // Check if BTC balance is low
            const btcBalance = balances.find(b => b.currency === 'BTC');
            if (btcBalance && btcBalance.balance < config.nowPayments.minBalance) {
                console.warn(`WARNING: BTC balance low! Current: ${btcBalance.balance} BTC`);
                // Here you could add notification logic (email, SMS, etc)
            }

            return balances;
        } catch (err) {
            console.error('Error checking NOW balance:', err);
            throw err;
        }
    }

    // Get deposit address to top up your NOW merchant balance
    async getDepositAddress(currency = 'BTC') {
        try {
            const response = await this.client.get(`/deposit/${currency}`);
            return {
                currency,
                address: response.data.address
            };
        } catch (err) {
            console.error('Error getting deposit address:', err);
            throw err;
        }
    }

    // Check pending invoices that need payment
    async checkPendingInvoices() {
        try {
            const response = await this.client.get('/payment');
            const pendingPayments = response.data.filter(
                payment => payment.payment_status === 'waiting'
            );

            console.log(`Found ${pendingPayments.length} pending payments`);
            return pendingPayments;
        } catch (err) {
            console.error('Error checking pending invoices:', err);
            throw err;
        }
    }
}

export default NOWBalanceManager;
