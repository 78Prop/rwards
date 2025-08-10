const Database = require('better-sqlite3');
const path = require('path');

// Connect to all databases
const sourceMinersDb = new Database(path.resolve(__dirname, '../project2/CareerCompass 2new/miners.db'));
const sourceAccountsDb = new Database(path.resolve(__dirname, '../project2/CareerCompass 2new/mining_accounts.db'));
const targetDb = new Database(path.resolve(__dirname, 'mining.db'));

console.log('\n=== AUDIT REPORT ===');

// Check Mining Pools
console.log('\n1. Mining Pools:');
console.log('Source Pools:');
const sourcePools = sourceMinersDb.prepare('SELECT * FROM mining_pools').all();
sourcePools.forEach(pool => {
    console.log(`- ${pool.name} (${pool.id})`);
});

// Check Mining Rigs
console.log('\n2. Mining Rigs:');
console.log('Source Rigs:');
const sourceRigs = sourceMinersDb.prepare(`
    SELECT r.*, pa.primaryPool, pa.backupPool1, pa.backupPool2 
    FROM mining_rigs r 
    LEFT JOIN pool_assignments pa ON r.id = pa.minerId
`).all();
console.log(`Total rigs in source: ${sourceRigs.length}`);
sourceRigs.forEach(rig => {
    console.log(`- ${rig.name} (ID: ${rig.id})`);
    console.log(`  Pools: Primary=${rig.primaryPool}, Backup1=${rig.backupPool1}, Backup2=${rig.backupPool2}`);
});

// Check Balances
console.log('\n3. Balances:');
const balances = sourceAccountsDb.prepare('SELECT * FROM miner_balances').all();
console.log(`Total balances: ${balances.length}`);
let totalConfirmed = 0;
let totalPending = 0;
balances.forEach(balance => {
    totalConfirmed += parseFloat(balance.confirmedBalance || 0);
    totalPending += parseFloat(balance.pendingBalance || 0);
});
console.log(`Total confirmed balance: ${totalConfirmed} BTC`);
console.log(`Total pending balance: ${totalPending} BTC`);

// Check Mining Rewards
console.log('\n4. Mining Rewards:');
const rewards = sourceAccountsDb.prepare('SELECT * FROM mining_rewards').all();
console.log(`Total rewards: ${rewards.length}`);
let totalRewards = 0;
rewards.forEach(reward => {
    totalRewards += parseFloat(reward.amount || 0);
});
console.log(`Total rewards amount: ${totalRewards} BTC`);

// Check Pool Connections
console.log('\n5. Pool Connections:');
const connections = sourceMinersDb.prepare('SELECT * FROM pool_connections').all();
console.log(`Total connections: ${connections.length}`);
connections.forEach(conn => {
    console.log(`- Rig ${conn.rigId} -> Pool ${conn.poolId} (${conn.connectionType})`);
});

// Check Shares
console.log('\n6. Mining Shares:');
const shares = sourceMinersDb.prepare('SELECT * FROM miner_shares').all();
console.log(`Total share records: ${shares.length}`);
let totalShareCount = 0;
let totalAcceptedShares = 0;
let totalRejectedShares = 0;
shares.forEach(share => {
    totalShareCount += share.share_count || 0;
    totalAcceptedShares += share.accepted_shares || 0;
    totalRejectedShares += share.rejected_shares || 0;
});
console.log(`Total shares submitted: ${totalShareCount}`);
console.log(`Total accepted shares: ${totalAcceptedShares}`);
console.log(`Total rejected shares: ${totalRejectedShares}`);

// Close connections
sourceMinersDb.close();
sourceAccountsDb.close();
targetDb.close();
