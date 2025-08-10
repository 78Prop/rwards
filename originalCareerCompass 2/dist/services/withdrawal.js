"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalService = void 0;
const uuid_1 = require("uuid");
const ________where__and_1 = require("..      where: and(");
(0, drizzle_orm_1.eq)(schema_1.minerBalances.rigId, rigId),
    (0, drizzle_orm_1.eq)(schema_1.minerBalances.poolId, poolId),
    (0, drizzle_orm_1.eq)(schema_1.minerBalances.userId, userId);
;
return withdrawalId;
';;
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const blockcypher_1 = __importDefault(require("blockcypher"));
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN || 'e2e32295cc634affa76c8287da2ae5af';
const MINIMUM_WITHDRAWAL = '0.001'; // Minimum BTC withdrawal amount
const bc = new blockcypher_1.default('btc', 'main', BLOCKCYPHER_TOKEN);
class WithdrawalService {
    // Request a withdrawal
    async requestWithdrawal(rigId, poolId, userId, amount, destinationAddress) {
        // Validate the amount is a valid number and above minimum
        if (parseFloat(amount) < parseFloat(MINIMUM_WITHDRAWAL)) {
            throw new Error(`Withdrawal amount must be at least ${MINIMUM_WITHDRAWAL} BTC`);
        }
        // Validate that this is the user's rig
        const rig = await ________where__and_1.db.query.miningRigs.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.miningRigs.rigId, rigId), (0, drizzle_orm_1.eq)(schema_1.miningRigs.userId, userId))
        });
        if (!rig) {
            throw new Error('Unauthorized: Rig does not belong to user');
        }
        // Check balance is sufficient
        const balance = await ________where__and_1.db.query.minerBalances.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.minerBalances.rigId, rigId), (0, drizzle_orm_1.eq)(schema_1.minerBalances.poolId, poolId))
        });
        if (!balance || !balance.confirmedBalance || parseFloat(balance.confirmedBalance) < parseFloat(amount)) {
            throw new Error('Insufficient confirmed balance for withdrawal');
        }
        // Create withdrawal record
        const withdrawalId = (0, uuid_1.v4)();
        await ________where__and_1.db.insert(schema_1.withdrawals).values({
            withdrawalId,
            rigId,
            poolId,
            userId,
            amount,
            destinationAddress,
            status: 'pending'
        });
        // Update balance
        const confirmedBalance = balance.confirmedBalance || "0";
        const newBalance = (parseFloat(confirmedBalance) - parseFloat(amount)).toString();
        await ________where__and_1.db.update(schema_1.minerBalances)
            .set({ confirmedBalance: newBalance })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.minerBalances.rigId, rigId), (0, drizzle_orm_1.eq)(schema_1.minerBalances.poolId, poolId)));
        return withdrawalId;
    }
    // Process pending withdrawals
    async processPendingWithdrawals() {
        const pending = await ________where__and_1.db.query.withdrawals.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.withdrawals.status, 'pending')
        });
        for (const withdrawal of pending) {
            try {
                // Create transaction using BlockCypher
                const tx = await bc.newTX({
                    inputs: [{ addresses: [withdrawal.destinationAddress] }],
                    outputs: [{ addresses: [withdrawal.destinationAddress], value: Math.floor(parseFloat(withdrawal.amount) * 100000000) }]
                });
                // Sign and send transaction
                const signedTx = await bc.signAndSendTX(tx);
                // Update withdrawal record
                await ________where__and_1.db.update(schema_1.withdrawals)
                    .set({
                    status: 'completed',
                    txHash: signedTx.hash,
                    processedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.withdrawalId, withdrawal.withdrawalId));
            }
            catch (err) {
                // Update withdrawal with error
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                await ________where__and_1.db.update(schema_1.withdrawals)
                    .set({
                    status: 'failed',
                    error: errorMessage,
                    processedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.withdrawalId, withdrawal.withdrawalId));
            }
        }
    }
    // Get withdrawal history for a rig
    async getWithdrawalHistory(rigId, poolId, userId) {
        return await ________where__and_1.db.query.withdrawals.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.withdrawals.rigId, rigId), (0, drizzle_orm_1.eq)(schema_1.withdrawals.poolId, poolId), (0, drizzle_orm_1.eq)(schema_1.withdrawals.userId, userId)),
            orderBy: (w, { desc }) => [desc(w.createdAt)]
        });
    }
    // Get withdrawal status
    async getWithdrawalStatus(withdrawalId) {
        const withdrawal = await ________where__and_1.db.query.withdrawals.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.withdrawals.withdrawalId, withdrawalId)
        });
        if (!withdrawal) {
            throw new Error('Withdrawal not found');
        }
        // If completed, check transaction status on blockchain
        if (withdrawal.status === 'completed' && withdrawal.txHash) {
            const txInfo = await bc.getTX(withdrawal.txHash);
            return {
                ...withdrawal,
                confirmations: txInfo.confirmations
            };
        }
        return withdrawal;
    }
}
exports.WithdrawalService = WithdrawalService;
