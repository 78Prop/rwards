#!/bin/sh
# Start redis server if not running
redis-server --port 6380 --requirepass tera_pool_redis_2024 &

# Start the main server
npm run dev &

# Start the mining server
cd mining-control && npx ts-node server.ts &

# Wait for all background processes
wait
