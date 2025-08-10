@echo off
echo Starting TERA Trading System...

REM Start Redis Server on port 6380
echo Starting Redis Server...
start redis-server --port 6380 --requirepass tera_pool_redis_2024

REM Install dependencies if needed
echo Installing dependencies...
call npm install

REM Start the mining server
echo Starting mining server...
cd mining-control
start cmd /k "npx ts-node server.ts"
cd ..

REM Start the main API server
echo Starting API server...
start cmd /k "npm run dev"

REM Start the client development server
echo Starting client development server...
cd client
call npm install
start cmd /k "npm run dev"

echo All systems started! The UI will be available at:
echo Main UI: http://localhost:5000
echo WebSocket: ws://localhost:5000/mining-ws
echo.
echo Press any key to close this window...
pause
