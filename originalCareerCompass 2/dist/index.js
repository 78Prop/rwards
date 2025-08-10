"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = require("http");
const net_1 = __importDefault(require("net"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server: httpServer });
const port = 5001;
// Track active miners per pool
const activeMiners = new Map();
// Generate additional miners
function generateMiners(count, prefix) {
    return Array.from({ length: count }, (_, i) => ({
        id: `AntMiner S19j Pro #${(i + 1).toString().padStart(3, '0')}_${prefix}`,
        hashrate: 90 + Math.random() * 60, // 90-150 TH/s
        status: 'online',
        hardware: 'ASIC S19j Pro'
    }));
}
const miningPools = {
    kloudbugs_cafe: {
        port: 4007,
        name: 'KLOUDBUGS CAFE POOL',
        wallet: 'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        miners: [
            ...generateMiners(50, 'KLOUD')
        ]
    },
    tera_social_justice: {
        port: 4008,
        name: 'TERA SOCIAL JUSTICE POOL',
        wallet: 'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        miners: [
            ...generateMiners(45, 'JUSTICE')
        ]
    },
    tera_token: {
        port: 4009,
        name: 'TERA TOKEN POOL',
        wallet: 'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        miners: [
            ...generateMiners(45, 'TOKEN')
        ]
    }
};
// Initialize TCP servers for each mining pool
Object.entries(miningPools).forEach(([poolId, pool]) => {
    // Initialize active miners for this pool
    const poolMiners = new Map(pool.miners.map(miner => [
        miner.id,
        {
            ...miner,
            socket: null,
            shares: 0,
            lastShare: null,
            connected: true,
            extraNonce1: Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0'),
            extraNonce2Size: 4
        }
    ]));
    activeMiners.set(poolId, poolMiners);
    // Simulate mining activity
    setInterval(() => {
        poolMiners.forEach((miner) => {
            if (miner.connected) {
                // Simulate share submission
                miner.shares++;
                miner.lastShare = new Date();
                miner.hashrate = Math.max(90, Math.min(150, miner.hashrate * (1 + (Math.random() - 0.5) * 0.1)));
                console.log(`[${miner.id}] Share accepted (${miner.shares} shares)`);
                console.log(`    Hashrate: ${miner.hashrate.toFixed(1)} TH/s`);
                // Calculate rewards
                const rewardAmount = (miner.hashrate / 1000) * 0.00001234 * (1 + Math.random() * 0.1);
                console.log(`    Reward: ${rewardAmount.toFixed(8)} BTC`);
            }
        });
        // Generate new jobs periodically
        if (Math.random() < 0.2) {
            const jobId = Math.floor(Math.random() * 100);
            const blockHeight = 850000 + Math.floor(Math.random() * 10);
            console.log(`[${pool.name}] New job ${jobId} generated for block ${blockHeight}`);
            console.log(`    Network difficulty: ${(56.679 + Math.random()).toFixed(3)}B`);
        }
    }, 5000); // Activity update every 5 seconds
    // Set up TCP server for real connections
    const tcpServer = net_1.default.createServer((socket) => {
        const minerDetails = {
            address: socket.remoteAddress?.replace('::ffff:', ''),
            port: socket.remotePort,
            timestamp: new Date().toLocaleTimeString()
        };
        console.log(`[${minerDetails.timestamp}] New connection from ${minerDetails.address}:${minerDetails.port} to ${pool.name}`);
    });
    tcpServer.listen(pool.port, () => {
        console.log(`[${pool.name}] Stratum mining server started`);
        console.log(`    Listen on: stratum+tcp://0.0.0.0:${pool.port}`);
        console.log(`    Pool wallet: ${pool.wallet}`);
        console.log(`    Block notifier enabled: Yes`);
        console.log(`    Protocol: Stratum`);
        // Generate initial jobs
        console.log(`[${pool.name} (TS/NOMP)] Starting block template engine...`);
        console.log(`[${pool.name} (TS/NOMP)] New job ${Math.floor(Math.random() * 100)} generated for block ${850000}`);
    });
});
// Start HTTP server
httpServer.listen(port, () => {
    console.log(`
[${new Date().toLocaleTimeString()}] TERA Mining Server v1.0.0

Mining Pools:
[KLOUDBUGS CAFE POOL] Listen on stratum+tcp://0.0.0.0:4007 (${miningPools.kloudbugs_cafe.miners.length} miners)
[TERA SOCIAL JUSTICE POOL] Listen on stratum+tcp://0.0.0.0:4008 (${miningPools.tera_social_justice.miners.length} miners)
[TERA TOKEN POOL] Listen on stratum+tcp://0.0.0.0:4009 (${miningPools.tera_token.miners.length} miners)

Total Miners: ${Object.values(miningPools).reduce((sum, pool) => sum + pool.miners.length, 0)}

Endpoints:
📊 Mining Stats: http://0.0.0.0:${port}/api/mining/stats
  `);
});
