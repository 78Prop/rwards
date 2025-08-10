import { platformWallet } from '../services/platform-wallet.js';
import { config } from './config.js';

async function initializeTeraPlatform() {
  try {
    // Initialize platform wallet
    const platformInfo = await platformWallet.initialize();
    
    console.log(`
=================================================
TERA ANN HARRIS MEMORIAL MINING PLATFORM
-------------------------------------------------
✅ Platform Wallet Ready
   Address: ${platformInfo.address}
   Balance: ${platformInfo.balance} BTC

✅ Mining Pools Configured:
   1. ${config.pools.kloudBugsCafe.name}
      - Port: ${config.pools.kloudBugsCafe.port}
      - Mining to: ${config.pools.kloudBugsCafe.address}

   2. ${config.pools.teraSocialJustice.name}
      - Port: ${config.pools.teraSocialJustice.port}
      - Mining to: ${config.pools.teraSocialJustice.address}

   3. ${config.pools.teraToken.name}
      - Port: ${config.pools.teraToken.port}
      - Mining to: ${config.pools.teraToken.address}

✅ Security Features:
   - Real-time transaction monitoring
   - Automated reward distribution
   - Secure wallet backups
   - BlockCypher integration

✅ Dedicated to:
   Tera Ann Harris
   Platform created in her honor
=================================================
`);

    // Start monitoring mining rewards
    await platformWallet.monitorMiningRewards((tx) => {
      console.log(`
New Mining Reward Received
-------------------------
Amount: ${tx.value / 100000000} BTC
From Pool: ${tx.inputs[0].addresses[0]}
Status: Confirmed
`);
    });

  } catch (error) {
    console.error('Failed to initialize TERA platform:', error);
    process.exit(1);
  }
}

// Run platform initialization
initializeTeraPlatform();
