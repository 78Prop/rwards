@echo off
echo Starting TERA Mining System...

REM Start Redis Server
echo Starting Redis Server...
start redis-server --port 6380 --requirepass tera_pool_redis_2024

REM Start the mining server (which also starts the API on port 5000)
echo Starting mining server on port 5000...
cd mining-control
start cmd /k "npx ts-node server.ts"
cd ..

REM Start the UI on port 3000
echo Starting UI on port 3000...
cd client
start cmd /k "npm run dev"

echo.
echo Services started:
echo - Mining API: http://localhost:5000
echo - Trading UI: http://localhost:3000
echo - Mining WebSocket: ws://localhost:5000/mining-ws
echo.
echo Mining Pools:
echo - KloudBugs Cafe Pool: stratum+tcp://localhost:3333 (1%% fee)
echo - TERA Social Justice Pool: stratum+tcp://localhost:4444 (0.5%% fee)
echo - TERA TOKEN POOL: stratum+tcp://localhost:5555 (0%% fee)
echo.
echo Press any key to stop all services...
pause
