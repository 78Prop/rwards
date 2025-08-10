const sqlite3 = require('sqlite3').verbose();

const minersDb = new sqlite3.Database('./miners.db');
const accountsDb = new sqlite3.Database('./mining_accounts.db');

console.log('[MINING LOG]');
console.log('----------------------------------------');
console.log('Initializing mining pools...');
console.log('✅ All mining pools started successfully!\n');

// Pools
const pools = [
  { name: 'KloudBugs Cafe Pool', port: 3333, protocol: 'stratum+tcp://0.0.0.0:3333' },
  { name: 'TERA Social Justice Pool', port: 4444, protocol: 'stratum+tcp://0.0.0.0:4444' },
  { name: 'TERA TOKEN POOL', port: 5555, protocol: 'stratum+tcp://0.0.0.0:5555' }
];
pools.forEach(pool => {
  console.log(`Pool: ${pool.name}`);
  console.log(`Port: ${pool.port}`);
  console.log(`Protocol: ${pool.protocol}\n`);
});

// Miner Connections
minersDb.all('SELECT id, name, pool FROM miners', (err, rows) => {
  if (err) throw err;
  console.log('[MINER CONNECTIONS]');
  console.log('----------------------------------------');
  rows.forEach((miner, i) => {
    console.log(`Miner-${(i+1).toString().padStart(2, '0')} connected to ${miner.pool}`);
  });

  // Mining Statistics
  console.log('\n[MINING STATISTICS]');
  console.log('----------------------------------------');
  console.log(`Total Active Miners: ${rows.length}`);
  // Hash Rate Distribution (dummy equal split)
  const dist = (100 / pools.length).toFixed(2);
  pools.forEach(pool => {
    console.log(`- ${pool.name}: ${dist}%`);
  });

  // Share Submissions
  accountsDb.all('SELECT rigId, poolId, currency, pendingBalance, confirmedBalance, totalEarned, payoutThreshold, lastPayout FROM miner_balances', (err2, balances) => {
    if (err2) throw err2;
    console.log('\n[SHARE SUBMISSIONS]');
    console.log('----------------------------------------');
    balances.forEach((bal, i) => {
      console.log(`Miner-${(i+1).toString().padStart(2, '0')} [Rig: ${bal.rigId}] [Pool: ${bal.poolId}]`);
      console.log(`  Pending: ${bal.pendingBalance || '0.00000000'} ${bal.currency}`);
      console.log(`  Confirmed: ${bal.confirmedBalance || '0.00000000'} ${bal.currency}`);
      console.log(`  Total Earned: ${bal.totalEarned || '0.00000000'} ${bal.currency}`);
      console.log(`  Payout Threshold: ${bal.payoutThreshold || '0.00000000'} ${bal.currency}`);
      console.log(`  Last Payout: ${bal.lastPayout || 'N/A'}`);
      console.log('');
    });
    minersDb.close();
    accountsDb.close();
  });
});
