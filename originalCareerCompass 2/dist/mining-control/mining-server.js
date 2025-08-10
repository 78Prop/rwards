"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningServer = void 0;
const net_1 = __importDefault(require("net"));
const events_1 = require("events");
const config_1 = require("./config");
class MiningServer extends events_1.EventEmitter {
    constructor(port, poolName) {
        super();
        this.currentBlock = 850000;
        this.jobId = 1;
        this.minerTypes = [
            'AntMiner S19 Pro',
            'WhatsMiner M30S+',
            'AntMiner S19',
            'AvalonMiner A1246',
            'BitMain S19P',
            'MicroBT M30S',
            'Canaan A1246'
        ];
        this.workers = new Map();
        this.port = port;
        this.poolName = poolName;
        this.server = net_1.default.createServer((socket) => this.handleConnection(socket));
        // Start job generation and stats update loops
        setInterval(() => this.generateNewJob(), 60000); // New job every minute
        setInterval(() => this.updateStats(), 30000); // Update stats every 30 seconds
    }
    start() {
        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`✅ ${this.poolName} listening on port ${this.port}`);
            console.log(`   Protocol: stratum+tcp://0.0.0.0:${this.port}`);
            console.log(`   Pool address: ${config_1.config.pools.kloudBugsCafe.address}`);
        });
    }
    getRandomMinerName() {
        const type = this.minerTypes[Math.floor(Math.random() * this.minerTypes.length)];
        const number = Math.floor(Math.random() * 200) + 1;
        const pools = ['KLOUD', 'SOCIAL', 'TOKEN', 'JUSTICE', 'CUSTOM'];
        const pool = pools[Math.floor(Math.random() * pools.length)];
        return `${type} #${number.toString().padStart(3, '0')}_${pool}`;
    }
    handleConnection(socket) {
        const minerName = this.getRandomMinerName();
        const worker = {
            id: `${socket.remoteAddress}:${socket.remotePort}`,
            socket,
            name: minerName,
            type: minerName.split(' #')[0],
            hashrate: Math.floor(Math.random() * 50) + 90, // 90-140 TH/s
            shares: 0,
            pool: this.poolName,
            authorized: false,
            lastShare: new Date()
        };
        this.workers.set(worker.id, worker);
        console.log(`🔌 [${worker.name}] Connected to ${this.poolName}`);
        this.setupSocketHandlers(worker);
        this.generateNewJob(); // Generate initial job for new connection
    }
    setupSocketHandlers(worker) {
        worker.socket.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(worker, message);
            }
            catch (err) {
                // Ignore parse errors - could be partial data
            }
        });
        worker.socket.on('close', () => {
            console.log(`[${worker.name}] Disconnected from ${this.poolName} (pool${this.port % 10})`);
            this.workers.delete(worker.id);
        });
        worker.socket.on('error', (err) => {
            console.log(`[${worker.name}] Socket error on ${this.poolName}: ${err.message}`);
        });
    }
    handleMessage(worker, message) {
        if (message.method === 'mining.subscribe') {
            worker.authorized = true;
            console.log(`[${worker.name}] Subscribed to ${this.poolName}`);
            // Send job immediately after subscribe
            this.generateNewJob();
        }
        else if (message.method === 'mining.submit') {
            worker.shares++;
            worker.lastShare = new Date();
            worker.hashrate = Math.floor(Math.random() * 50) + 90; // Vary hashrate
            console.log(`[${worker.name}] Share accepted (${worker.shares} shares) - ${worker.hashrate.toFixed(1)} TH/s`);
        }
    }
    generateNewJob() {
        this.jobId++;
        console.log(`[${this.poolName} (TS/NOMP)] New job ${this.jobId} generated for block ${this.currentBlock}`);
        const jobNotification = {
            id: null,
            method: 'mining.notify',
            params: [
                this.jobId.toString(),
                '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
                '01000000',
                '00000000',
                [],
                '00000002',
                '1d00ffff',
                Math.floor(Date.now() / 1000).toString(16),
                true
            ]
        };
        // Send new job to all authorized workers
        for (const worker of this.workers.values()) {
            if (worker.authorized) {
                worker.socket.write(JSON.stringify(jobNotification) + '\n');
            }
        }
    }
    updateStats() {
        const totalHashrate = Array.from(this.workers.values())
            .reduce((sum, w) => sum + w.hashrate, 0);
        const totalShares = Array.from(this.workers.values())
            .reduce((sum, w) => sum + w.shares, 0);
        if (this.workers.size > 0) {
            console.log(`\n${this.poolName} Stats:`);
            console.log(`Connected Miners: ${this.workers.size}`);
            console.log(`Total Hashrate: ${totalHashrate.toFixed(1)} TH/s`);
            console.log(`Total Shares: ${totalShares}\n`);
        }
    }
}
exports.MiningServer = MiningServer;
