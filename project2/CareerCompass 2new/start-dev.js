import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to start a process with nodemon
function startWithNodemon(name, cmd, args, cwd) {
    const process = spawn('nodemon', [cmd, ...args], {
        cwd,
        stdio: 'inherit',
        shell: true
    });

    return process;
}

// Start Redis
const redis = spawn('redis-server', [
    '--port', '6380',
    '--requirepass', 'tera_pool_redis_2024'
]);

// Start Mining Server
const miningServer = startWithNodemon(
    'Mining Server',
    'server.ts',
    [],
    join(__dirname, 'mining-control')
);

// Start API Server on port 3000
const apiServer = startWithNodemon(
    'API Server',
    'server/index.ts',
    [],
    __dirname
);

// Start Client on port 5173 (Vite default)
const clientServer = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, 'client'),
    stdio: 'pipe',
    shell: true
});

// Handle cleanup
process.on('SIGINT', () => {
    redis.kill();
    miningServer.kill();
    apiServer.kill();
    clientServer.kill();
    process.exit();
});

console.log(`
Server URLs:
============
API Server: http://localhost:3000
Trading UI: http://localhost:5173
Mining WebSocket: ws://localhost:3000/mining-ws

Mining Pools:
============
KloudBugs Cafe Pool: stratum+tcp://localhost:3333 (1% fee)
TERA Social Justice Pool: stratum+tcp://localhost:4444 (0.5% fee)
TERA TOKEN POOL: stratum+tcp://localhost:5555 (0% fee)
`);
