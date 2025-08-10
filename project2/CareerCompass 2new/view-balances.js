const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mining_accounts.db');

db.all('SELECT id, rigId, poolId, confirmedBalance FROM miner_balances', (err, rows) => {
  if (err) throw err;
  let total = 0;
  rows.forEach(row => {
    console.log(`Miner: ${row.rigId} | Pool: ${row.poolId} | Balance: ${row.confirmedBalance}`);
    total += parseFloat(row.confirmedBalance);
  });
  console.log(`\nTotal BTC balance: ${total}`);
  db.close();
});
