"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningServer = void 0;
const net_1 = __importDefault(require("net"));
const events_1 = require("events");
class MiningServer extends events_1.EventEmitter {
    constructor(port) {
        super();
        this.poolName = '';
        this.currentBlock = 850000;
        this.jobId = 1;
        this.poolName = '';
        this.currentJob = {
            id: 1,
            height: 850000,
            prevHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'
        };
        this.currentJob = {
            id: 1,
            blockHeight: 850000,
            prevHash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
            timestamp: Date.now()
        };
        this.workers = new Map();
        this.port = port;
        this.server = net_1.default.createServer((socket) => this.handleConnection(socket));
        // Start job generation loop
        setInterval(() => this.generateNewJob(), 30000);
    }
    generateNewJob() {
        this.currentJob.id++;
        console.log(`[${this.poolName}] New job ${this.currentJob.id} generated for block ${this.currentJob.height}`);
        // Notify all connected workers
        this.workers.forEach(worker => {
            if (worker.authorized) {
                this.sendNewJobToWorker(worker);
            }
        });
    }
    sendNewJobToWorker(worker) {
        const jobNotification = {
            id: null,
            method: 'mining.notify',
            params: [
                this.currentJob.id.toString(),
                this.currentJob.prevHash,
                '01000000',
                '00000000',
                [],
                '00000002',
                '1d00ffff',
                Math.floor(Date.now() / 1000).toString(16),
                true
            ]
        };
        this.sendToWorker(worker, jobNotification);
    }
    start() {
        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`Mining server listening on port ${this.port}`);
        });
    }
    generateNewJob() {
        this.currentJob = {
            id: this.currentJob.id + 1,
            blockHeight: this.currentJob.blockHeight,
            prevHash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
            timestamp: Date.now()
        };
        // Broadcast new job to all connected workers
        this.workers.forEach(worker => {
            if (worker.authorized) {
                this.sendMiningJob(worker);
            }
        });
    }
    sendMiningJob(worker) {
        const jobNotify = {
            id: null,
            method: "mining.notify",
            params: [
                this.currentJob.id.toString(),
                this.currentJob.prevHash,
                "01000000", // coinbase1
                "00000000", // coinbase2
                [], // merkle branches
                "00000002", // version
                "1d00ffff", // nbits
                Math.floor(Date.now() / 1000).toString(16), // ntime
                true // clean jobs
            ]
        };
        this.sendToWorker(worker, jobNotify);
        console.log(`[${worker.username || worker.id}] New job ${this.currentJob.id} generated for block ${this.currentJob.blockHeight}`);
    }
    handleConnection(socket) {
        const workerId = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`🔌 New connection from ${workerId}`);
        const worker = {
            id: workerId,
            socket,
            address: socket.remoteAddress || '',
            username: '',
            protocol: 'tcp',
            lastActivity: Date.now(),
            authorized: false,
            difficulty: 1,
            submittedShares: 0,
            rejectedShares: 0
        };
        this.workers.set(workerId, worker);
        this.setupSocketHandlers(worker);
    }
    setupSocketHandlers(worker) {
        const socket = worker.socket;
        let buffer = '';
        socket.setKeepAlive(true, 30000);
        socket.setTimeout(300000);
        socket.on('data', (data) => {
            try {
                buffer += data.toString();
                const messages = buffer.split('\\n');
                buffer = messages.pop() || '';
                for (const message of messages) {
                    if (message.trim()) {
                        this.handleMessage(worker, message.trim());
                    }
                }
            }
            catch (err) {
                console.error(`❌ Error processing data from ${worker.id}:`, err);
            }
        });
        socket.on('close', () => {
            console.log(`📴 [${worker.username || worker.id}] Disconnected - Stats: ${worker.submittedShares} shares submitted, ${worker.rejectedShares} rejected`);
            this.workers.delete(worker.id);
            this.emit('workerDisconnected', worker);
        });
        socket.on('error', (err) => {
            console.error(`Socket error from ${worker.id}:`, err);
        });
        socket.on('timeout', () => {
            console.log(`Connection timeout: ${worker.id}`);
            socket.destroy();
        });
    }
    handleMessage(worker, messageStr) {
        try {
            const message = JSON.parse(messageStr);
            worker.lastActivity = Date.now();
            // Detect protocol based on initial message
            if (!worker.protocol) {
                worker.protocol = this.detectProtocol(message);
            }
            // Handle message based on protocol
            if (worker.protocol === 'nomp') {
                this.handleNompMessage(worker, message);
            }
            else {
                this.handleTcpMessage(worker, message);
            }
        }
        catch (err) {
            console.error(`Error parsing message from ${worker.id}:`, err);
        }
    }
    detectProtocol(message) {
        if (message.method && ['mining.subscribe', 'mining.authorize'].includes(message.method)) {
            return 'nomp';
        }
        return 'tcp';
    }
    handleNompMessage(worker, message) {
        switch (message.method) {
            case 'mining.subscribe':
                this.handleNompSubscribe(worker, message);
                break;
            case 'mining.authorize':
                this.handleNompAuthorize(worker, message);
                break;
            case 'mining.submit':
                this.handleNompSubmit(worker, message);
                break;
        }
    }
    handleTcpMessage(worker, message) {
        // Handle legacy TCP protocol messages
        if (message.username && !worker.authorized) {
            worker.username = message.username;
            worker.authorized = true;
            this.sendToWorker(worker, {
                status: 'ok',
                authorized: true
            });
        }
        else if (message.share) {
            this.handleTcpShare(worker, message);
        }
    }
    handleNompSubscribe(worker, message) {
        const subscribeResponse = {
            id: message.id,
            result: [
                [["mining.set_difficulty", "b4b6693b72a50c7116db18d6497cac52"],
                    ["mining.notify", "ae6812eb4cd7735a302a8a9dd95cf71f"]],
                "08000002",
                4
            ],
            error: null
        };
        this.sendToWorker(worker, subscribeResponse);
    }
    handleNompAuthorize(worker, message) {
        worker.username = message.params[0];
        worker.authorized = true;
        console.log(`✅ Miner ${worker.username} authorized successfully`);
        const response = {
            id: message.id,
            result: true,
            error: null
        };
        this.sendToWorker(worker, response);
        // Send initial difficulty
        this.sendToWorker(worker, {
            id: null,
            method: "mining.set_difficulty",
            params: [worker.difficulty]
        });
        // Send initial job immediately after authorization
        this.sendMiningJob(worker);
    }
    handleNompSubmit(worker, message) {
        // Validate share submission
        const isValid = Math.random() > 0.1; // Simplified share validation
        worker.submittedShares++;
        if (!isValid) {
            worker.rejectedShares++;
        }
        // Log share submission with hashrate calculation
        const hashrate = Math.floor(Math.random() * 50) + 100; // Simulated hashrate between 100-150 TH/s
        console.log(`⛏️  [${worker.username}] Share #${worker.submittedShares} submitted - ${isValid ? 'accepted' : 'rejected'} (${hashrate} TH/s)`);
        const response = {
            id: message.id,
            result: isValid,
            error: isValid ? null : [21, "Share rejected", null]
        };
        this.sendToWorker(worker, response);
        // Occasionally generate new job
        if (Math.random() < 0.2) { // 20% chance of new job after share
            this.generateNewJob();
        }
    }
    handleTcpShare(worker, message) {
        const isValid = Math.random() > 0.1; // Simplified share validation
        worker.submittedShares++;
        if (!isValid) {
            worker.rejectedShares++;
        }
        this.sendToWorker(worker, {
            status: isValid ? 'accepted' : 'rejected',
            error: isValid ? null : 'Share rejected'
        });
    }
    sendToWorker(worker, data) {
        try {
            worker.socket.write(JSON.stringify(data) + '\\n');
        }
        catch (err) {
            console.error(`Error sending data to ${worker.id}:`, err);
            worker.socket.destroy();
        }
    }
    getStats() {
        const stats = {
            connections: this.workers.size,
            totalShares: 0,
            totalRejected: 0,
            workers: Array.from(this.workers.values()).map(w => ({
                id: w.id,
                username: w.username,
                protocol: w.protocol,
                authorized: w.authorized,
                submitted: w.submittedShares,
                rejected: w.rejectedShares
            }))
        };
        return stats;
    }
}
exports.MiningServer = MiningServer;
