import { MiningPool } from './server/mining-pool-server.js';
import fs from 'fs';

// Read pool config
const config = JSON.parse(fs.readFileSync('./pool-config.json', 'utf8'));

// Create pools for each port
const pools = config.ports && Object.entries(config.ports).map(([port, portConfig]) => {
    return new MiningPool(
        portConfig.name,
        parseInt(port),
        config.address,
        portConfig.fee
    );
});

// Start all pools
async function startPools() {
    try {
        await Promise.all(pools.map(pool => pool.start()));
        console.log('✅ All mining pools started successfully!');
        
        // Print pool info
        pools.forEach(pool => {
            console.log(`\nPool: ${pool.name}`);
            console.log(`Port: ${pool.port}`);
            console.log(`Protocol: stratum+tcp://0.0.0.0:${pool.port}`);
            console.log(`Fee: ${pool.fee}%`);
        });
    } catch (error) {
        console.error('Failed to start pools:', error);
    }
}

startPools();
