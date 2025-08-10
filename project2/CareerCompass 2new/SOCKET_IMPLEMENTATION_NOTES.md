# CareerCompass Mining Pool Socket Implementation Notes

## Architecture Overview

### 1. Main Components
- Express.js Web Server (port 5000)
- Stratum Mining Pool Server (dynamic port)
- Port Management System

### 2. Socket Implementation (`mining-pool-server.ts`)

#### Key Classes
- `MiningPool`: Main class extending EventEmitter
- `PoolWorker`: Interface for connected miners
- `MiningJob`: Interface for mining tasks
- `PoolStats`: Interface for pool statistics

#### Socket Communication
- Uses Node.js `net` module for TCP connections
- Implements Stratum mining protocol
- Handles four main methods:
  1. `mining.subscribe`: Initial miner connection
  2. `mining.authorize`: Worker authentication
  3. `mining.submit`: Share submission
  4. `mining.get_transactions`: Transaction updates

#### Worker Management
- Tracks active workers in a Map
- Auto-cleanup of inactive workers (10-minute timeout)
- Real-time hashrate calculation
- Share validation and block detection

#### Job Management
- Generates new jobs every 60 seconds
- Updates pool statistics every 30 seconds
- Handles block rewards and pool fees
- Broadcasts new jobs to all connected workers

### 3. Port Management (`ports.ts`)
- Dynamic port allocation
- Port availability checking
- Range-based port finding (with fallback)

## Key Features
1. Real-time worker statistics
2. Automatic job generation
3. Share validation system
4. Block detection and reward distribution
5. Worker authentication
6. Connection keepalive system
7. Error handling and recovery

## Protocol Details
- Uses Stratum+TCP protocol
- JSON-RPC message format
- Supports difficulty adjustment
- Handles extended nonce

## Security Features
- Worker timeout management
- Error handling for invalid JSON
- Socket error recovery
- Clean shutdown process
