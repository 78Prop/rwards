# Mining Pool System Setup Notes

## System Configuration

### Port Configuration
- Main API/UI: Port 5000
- Mining Pools:
  - KloudBugs Cafe Pool: Port 3333 (1% fee)
  - TERA Social Justice Pool: Port 4444 (0.5% fee)
  - TERA TOKEN POOL: Port 5555 (0% fee)

### WebSocket Configuration
- WebSocket endpoint: `/mining-ws`
- WebSocket enabled in poolServer config
- All pools configured with stratum+tcp protocol

## Database Setup
- SQLite database: `miners.db`
- 51 miners distributed across pools:
  - KLOUDBUGSCAFE POOL: 19 miners
  - TERA SOCIAL JUSTICE POOL: 18 miners
  - TERA TOKEN POOL: 14 miners

### Database Schema
```sql
- miners table: Main miner information
- miner_stats table: Real-time mining statistics
- pool_assignments table: Pool assignments with backups
```

## How to Start the System

1. **Start Redis Server**
   - Redis running on port 6380
   - Password: tera_pool_redis_2024

2. **Run Miner Migration**
   ```bash
   node migrate-miners.js
   ```

3. **Start Mining Pool Server**
   ```bash
   cd mining-control
   npx ts-node server.ts
   ```

## Access Points
- Main UI: `http://localhost:5000`
- API Statistics: `http://localhost:5000/api/stats`
- WebSocket Connection: `ws://localhost:5000/mining-ws`

## Configuration Files
1. **pool-config.json**
   - API configured on port 5000
   - WebSocket enabled
   - Three mining pools configured
   - Redis connection details

## Miner Distribution
- Core miners preserved with original configurations
- Additional miners auto-generated to reach 51 total
- Even distribution across pools with varied hardware specs

## Security Notes
- API password required for administrative actions
- Redis password protection enabled
- No private keys stored in configuration
- RPC authentication enabled for daemon connection

## System Requirements
- Node.js
- Redis Server
- SQLite3
- TypeScript (for server)

## Installed Dependencies
- better-sqlite3
- ts-node (for TypeScript execution)

## Monitoring
- Hashrate window: 300 seconds
- Update interval: 5 seconds
- Blocks monitored: 50
- Payment records kept: 50

## Next Steps
1. Set up monitoring dashboards
2. Configure backup pools for failover
3. Implement automated health checks
4. Set up alerting system for pool status
