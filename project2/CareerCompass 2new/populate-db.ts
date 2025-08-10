import { db } from './server/db';
import { miningRigs, miningPools } from './shared/mining-schema';

// Sample mining rig names
const rigNames = [
  'TERACORE7', 'TERAALPHA7', 'TERAOMEGA7', 'TERANODE7', 'TERAOPTIMUS7',
  'TERAJUSTICE7', 'TERAANNHARRIS7', 'TERA-ZIG-MINER7', 'TERAELITE7', 'TERAPOWER7',
  'TERASUPREME7', 'TERAMAX7', 'TERAULTIMATE7', 'TERAPRIME7', 'TERABOOST7',
  'TERAFORCE7', 'TERAENERGY7', 'TERASPEED7', 'TERASTRONG7', 'TERABEAST7',
  'TERATITAN7', 'TERAGIANT7', 'TERALIGHTNING7', 'TERATHUNDER7', 'TERASTORM7'
];

// Insert mining pools
async function insertPools() {
  await db.insert(miningPools).values([
    {
      id: 'pool-1',
      name: 'KLOUDBUGSCAFE POOL',
      host: 'localhost',
      port: 4001,
      username: 'Kloudbugs7',
      password: 'x',
    },
    {
      id: 'pool-2',
      name: 'TERA SOCIAL JUSTICE POOL',
      host: 'localhost',
      port: 4002,
      username: 'Kloudbugs7',
      password: 'x',
    }
  ]);
}

// Insert mining rigs
async function insertRigs() {
  const rigs = rigNames.map((name, index) => ({
    id: `rig-${index + 1}`,
    name,
    ipAddress: `192.168.1.${100 + index}`,
    status: Math.random() > 0.2 ? 'online' : 'offline',
    hashrate: `${(100 + Math.random() * 50).toFixed(2)} TH/s`,
    primaryPoolId: 'pool-1',
    backupPool1Id: 'pool-2',
  }));

  await db.insert(miningRigs).values(rigs);
}

// Run the population
async function populate() {
  try {
    await insertPools();
    console.log('✓ Mining pools inserted');
    await insertRigs();
    console.log('✓ Mining rigs inserted');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populate();
