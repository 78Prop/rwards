"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const mining_protocols_js_1 = require("./mining-protocols.js");
const config_js_1 = require("./config.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const app = (0, express_1.default)();
const PORT = 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// TERA Mining Rigs - Enhanced from attached assets
const miningRigs = [
    {
        id: 'tera-core-7',
        name: 'TERACORE7',
        type: 'bitcoin',
        hashrate: 110.0,
        powerDraw: 3250,
        temperature: 67,
        status: 'online',
        efficiency: 95.2,
        dailyRevenue: 45.80,
        location: 'KLOUDBUGS Data Center Alpha',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'ASIC S19 Pro',
        autoConfig: true,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-alpha-7',
        name: 'TERAALPHA7',
        type: 'bitcoin',
        hashrate: 95.0,
        powerDraw: 2900,
        temperature: 63,
        status: 'online',
        efficiency: 93.8,
        dailyRevenue: 38.90,
        location: 'KLOUDBUGS Data Center Beta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'ASIC S17+',
        autoConfig: true,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-omega-7',
        name: 'TERAOMEGA7',
        type: 'bitcoin',
        hashrate: 125.0,
        powerDraw: 3500,
        temperature: 71,
        status: 'online',
        efficiency: 91.4,
        dailyRevenue: 52.30,
        location: 'KLOUDBUGS Data Center Gamma',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'Custom ASIC',
        autoConfig: false,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-node-7',
        name: 'TERANODE7',
        type: 'bitcoin',
        hashrate: 130.0,
        powerDraw: 3600,
        temperature: 69,
        status: 'online',
        efficiency: 97.1,
        dailyRevenue: 56.70,
        location: 'KLOUDBUGS Data Center Delta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'ASIC S19 Pro',
        autoConfig: true,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-optimus-7',
        name: 'TERAOPTIMUS7',
        type: 'bitcoin',
        hashrate: 115.0,
        powerDraw: 3300,
        temperature: 65,
        status: 'maintenance',
        efficiency: 94.5,
        dailyRevenue: 0,
        location: 'KLOUDBUGS Data Center Epsilon',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'ASIC S17+',
        autoConfig: true,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-justice-7',
        name: 'TERAJUSTICE7',
        type: 'bitcoin',
        hashrate: 120.0,
        powerDraw: 3400,
        temperature: 68,
        status: 'online',
        efficiency: 96.3,
        dailyRevenue: 51.20,
        location: 'KLOUDBUGS Data Center Zeta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'Custom ASIC',
        autoConfig: true,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-ann-harris-7',
        name: 'TERAANNHARRIS7',
        type: 'bitcoin',
        hashrate: 105.0,
        powerDraw: 3100,
        temperature: 64,
        status: 'online',
        efficiency: 92.7,
        dailyRevenue: 43.15,
        location: 'KLOUDBUGS Data Center Eta',
        pool: 'KLOUDBUGSCAFE POOL',
        hardware: 'ASIC S19 Pro',
        autoConfig: true,
        lastUpdate: Date.now()
    },
    {
        id: 'tera-zig-miner-7',
        name: 'TERA-ZIG-MINER7',
        type: 'bitcoin',
        hashrate: 140.0,
        powerDraw: 3800,
        temperature: 72,
        status: 'online',
        efficiency: 98.9,
        dailyRevenue: 62.40,
        location: 'KLOUDBUGS Data Center Theta',
        pool: 'TERA SOCIAL JUSTICE POOL',
        hardware: 'Custom ASIC',
        autoConfig: false,
        lastUpdate: Date.now()
    }
];
// Initialize mining pools with dynamic host configuration
// Initialize mining servers
const kloudBugsCafeServer = new mining_protocols_js_1.MiningServer(config_js_1.config.pools.kloudBugsCafe.port);
const teraSocialJusticeServer = new mining_protocols_js_1.MiningServer(config_js_1.config.pools.teraSocialJustice.port);
const teraTokenServer = new mining_protocols_js_1.MiningServer(config_js_1.config.pools.teraToken.port);
// Start mining servers
kloudBugsCafeServer.start();
teraSocialJusticeServer.start();
teraTokenServer.start();
const miningPools = [
    {
        id: 'kloudbugscafe-pool',
        name: config_js_1.config.pools.kloudBugsCafe.name,
        url: `stratum+tcp://${config_js_1.config.host}:4004`, // Fixed port to match config
        status: 'connected',
        hashRate: 450,
        address: config_js_1.config.pools.kloudBugsCafe.address,
        username: 'Kloudbugs7',
        managed: true,
        fees: config_js_1.config.pools.kloudBugsCafe.fee,
        connectedRigs: 4,
        server: kloudBugsCafeServer
    },
    {
        id: 'tera-social-justice-pool',
        name: config_js_1.config.pools.teraSocialJustice.name,
        url: `stratum+tcp://${config_js_1.config.host}:4005`, // Fixed port to match config
        status: 'connected',
        hashRate: 490,
        address: config_js_1.config.pools.teraSocialJustice.address,
        username: 'Kloudbugs7',
        managed: true,
        fees: config_js_1.config.pools.teraSocialJustice.fee,
        connectedRigs: 4,
        server: teraSocialJusticeServer
    },
    {
        id: 'tera-token-pool',
        name: config_js_1.config.pools.teraToken.name,
        url: `stratum+tcp://${config_js_1.config.host}:4006`, // Fixed port to match config
        status: 'connected',
        hashRate: 470,
        address: config_js_1.config.pools.teraToken.address,
        username: 'Kloudbugs7',
        managed: true,
        fees: config_js_1.config.pools.teraToken.fee,
        connectedRigs: 4,
        server: teraTokenServer
    }
];
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Create WebSocket server for real-time mining data
const wss = new ws_1.WebSocketServer({
    server,
    path: '/mining-ws'
});
// WebSocket connections
const clients = new Set();
wss.on('connection', (ws) => {
    console.log('Mining control client connected');
    clients.add(ws);
    // Send initial data
    ws.send(JSON.stringify({
        type: 'initial_data',
        data: {
            rigs: miningRigs,
            pools: miningPools,
            summary: calculateSummary()
        }
    }));
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Mining control client disconnected');
    });
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            handleWebSocketMessage(data, ws);
        }
        catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
});
// Calculate mining summary
function calculateSummary() {
    const onlineRigs = miningRigs.filter(rig => rig.status === 'online');
    const totalRevenue = onlineRigs.reduce((sum, rig) => sum + rig.dailyRevenue, 0);
    const totalPower = onlineRigs.reduce((sum, rig) => sum + rig.powerDraw, 0);
    const avgEfficiency = onlineRigs.reduce((sum, rig) => sum + rig.efficiency, 0) / onlineRigs.length;
    return {
        totalRevenue: totalRevenue.toFixed(2),
        totalPower,
        efficiency: avgEfficiency.toFixed(1),
        onlineRigs: onlineRigs.length,
        totalRigs: miningRigs.length,
        totalHashrate: onlineRigs.reduce((sum, rig) => sum + rig.hashrate, 0)
    };
}
// Handle WebSocket messages
function handleWebSocketMessage(data, ws) {
    switch (data.type) {
        case 'rig_control':
            handleRigControl(data.rigId, data.action);
            break;
        case 'request_update':
            sendRealTimeUpdate();
            break;
        case 'auto_configure':
            handleAutoConfiguration(data.rigId);
            break;
    }
}
// Handle rig control commands
function handleRigControl(rigId, action) {
    const rigIndex = miningRigs.findIndex(rig => rig.id === rigId);
    if (rigIndex === -1)
        return;
    const rig = miningRigs[rigIndex];
    switch (action) {
        case 'start':
            rig.status = 'online';
            rig.temperature = Math.floor(Math.random() * 10) + 60;
            break;
        case 'stop':
            rig.status = 'offline';
            rig.dailyRevenue = 0;
            break;
        case 'restart':
            rig.status = 'maintenance';
            setTimeout(() => {
                rig.status = 'online';
                rig.temperature = Math.floor(Math.random() * 15) + 55;
                sendRealTimeUpdate();
            }, 3000);
            break;
    }
    rig.lastUpdate = Date.now();
    sendRealTimeUpdate();
}
// Handle auto-configuration
function handleAutoConfiguration(rigId) {
    const rigIndex = miningRigs.findIndex(rig => rig.id === rigId);
    if (rigIndex === -1)
        return;
    const rig = miningRigs[rigIndex];
    rig.autoConfig = !rig.autoConfig;
    rig.status = 'configuring';
    setTimeout(() => {
        rig.status = 'online';
        rig.temperature = Math.floor(Math.random() * 15) + 55;
        rig.efficiency = Math.min(99, rig.efficiency + Math.random() * 3);
        sendRealTimeUpdate();
    }, 2000);
    sendRealTimeUpdate();
}
// Send real-time updates to all clients
function sendRealTimeUpdate() {
    const updateData = {
        type: 'rigs:update',
        data: miningRigs,
        summary: calculateSummary(),
        timestamp: Date.now()
    };
    clients.forEach(client => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(updateData));
        }
    });
}
// REST API Endpoints
// Get all rigs
app.get('/api/rigs', (req, res) => {
    res.json({
        rigs: miningRigs,
        summary: calculateSummary()
    });
});
// Get specific rig
app.get('/api/rigs/:id', (req, res) => {
    const rig = miningRigs.find(r => r.id === req.params.id);
    if (!rig) {
        return res.status(404).json({ error: 'Rig not found' });
    }
    res.json(rig);
});
// Control rig
app.post('/api/rigs/:id/control', (req, res) => {
    const { action } = req.body;
    handleRigControl(req.params.id, action);
    res.json({ success: true, action });
});
// Get pools
app.get('/api/pools', (req, res) => {
    res.json(miningPools);
});
// Mining operations summary
app.get('/api/operations', (req, res) => {
    res.json({
        operations: miningRigs,
        pools: miningPools,
        summary: calculateSummary(),
        platformCapacity: 7000,
        socialAllocation: {
            percentage: 30,
            dailyAmount: (parseFloat(calculateSummary().totalRevenue) * 0.3).toFixed(2)
        }
    });
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'mining-control',
        port: PORT,
        rigs: miningRigs.length,
        onlineRigs: miningRigs.filter(r => r.status === 'online').length
    });
});
// Serve mining control interface
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Simulate real-time data updates
setInterval(() => {
    // Update rig temperatures and efficiency randomly
    miningRigs.forEach(rig => {
        if (rig.status === 'online') {
            rig.temperature += (Math.random() - 0.5) * 2;
            rig.temperature = Math.max(55, Math.min(80, rig.temperature));
            rig.efficiency += (Math.random() - 0.5) * 0.5;
            rig.efficiency = Math.max(85, Math.min(99, rig.efficiency));
            rig.lastUpdate = Date.now();
        }
    });
    sendRealTimeUpdate();
}, 10000); // Update every 10 seconds
// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`KLOUDBUGS Mining Control Center running on port ${PORT}`);
    console.log(`Managing ${miningRigs.length} TERA mining rigs`);
    console.log(`Total hashrate: ${miningRigs.reduce((sum, rig) => sum + (rig.status === 'online' ? rig.hashrate : 0), 0)} TH/s`);
});
exports.default = app;
