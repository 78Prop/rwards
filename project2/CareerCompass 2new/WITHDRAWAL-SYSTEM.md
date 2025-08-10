# TERA CORE - Mining Pool Withdrawal System

## Overview
The withdrawal system is a comprehensive solution for managing cryptocurrency withdrawals from mining pools, built using Drizzle ORM for data persistence and ethers.js for blockchain interactions.

## How Withdrawals Work with Drizzle & Ethers.js

### Ethers.js Handles ALL Cryptocurrency Transactions
**Yes, ethers.js takes care of all crypto withdrawals** without requiring local blockchain nodes:

- **Bitcoin Transactions**: Uses external APIs (BlockCypher, Blockstream) for broadcasting
- **Ethereum Transactions**: Connects to Infura/Alchemy providers for network interaction  
- **TERA Token Transactions**: Custom RPC endpoints for TERA blockchain network
- **No Bitcoin Core Required**: External API providers eliminate need for local nodes
- **Instant Startup**: No blockchain synchronization or storage requirements

## How Withdrawals Work with Drizzle

### 1. Database Schema (Drizzle ORM)
```typescript
// shared/schema.ts
export const withdrawals = pgTable("withdrawals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id),
  tokenType: text("token_type").notNull(), // 'BTC', 'ETH', 'TERA'
  amount: decimal("amount", { precision: 18, scale: 8 }),
  toAddress: text("to_address").notNull(),
  status: text("status").notNull().default('pending'),
  approvedBy: text("approved_by"),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});
```

### 2. Storage Interface (server/storage.ts)
The storage interface provides CRUD operations for withdrawals:
- `createWithdrawal()` - Creates new withdrawal requests
- `getWithdrawals()` - Retrieves withdrawal history with optional user filtering
- `updateWithdrawal()` - Updates withdrawal status and transaction details

### 3. Withdrawal Manager (server/withdrawal-manager.ts)
Central processing engine that handles:
- **Validation**: Checks minimum/maximum amounts, user balances, address formats
- **Processing**: Manages withdrawal workflow from request to completion
- **Pool Integration**: Interfaces with different mining pools (KloudBugs Cafe, TERA Justice, BTC Backup)
- **Blockchain Interaction**: Uses ethers.js for transaction signing and broadcasting

## Port Configuration & Mining Network

### Application Ports
- **Primary Application**: Port 5000 (Unified Express + Vite server)
- **All Services Integrated**: Trading, mining, withdrawals run on single port

### Mining Rig Network
Each mining rig connects to multiple pools via stratum protocol:

| Rig Name | IP Address | Primary Pool | Backup Pools |
|----------|------------|--------------|--------------|
| AntMiner S19 Pro #001 | 192.168.1.101 | KloudBugs Cafe | TERA Justice, BTC Backup |
| WhatsMiner M30S+ #002 | 192.168.1.102 | TERA Justice | KloudBugs Cafe, BTC Backup |
| AntMiner S19 #003 | 192.168.1.103 | KloudBugs Cafe | BTC Backup, TERA Justice |
| AvalonMiner 1246 #004 | 192.168.1.104 | TERA Justice | KloudBugs Cafe, BTC Backup |
| AntMiner S17 Pro #005 | 192.168.1.105 | BTC Backup | KloudBugs Cafe, TERA Justice |

### Mining Pool Endpoints
- **KloudBugs Cafe Pool**: stratum.kloudbugs.cafe:4444 (simulated endpoint)
- **BTC Backup Pool**: stratum.btcpool.backup:3333 (simulated endpoint)  
- **TERA Social Justice Pool**: stratum.terajustice.org:4444 (simulated endpoint)

## Withdrawal Process Flow

### 1. Request Creation
```typescript
// User submits withdrawal via frontend form
const withdrawalData = {
  tokenType: 'BTC',
  amount: '0.01500000',
  toAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  userId: 1
};

// API endpoint processes request
app.post('/api/mining/withdraw', async (req, res) => {
  const withdrawal = await storage.createWithdrawal(req.body);
  await withdrawalManager.processWithdrawal(withdrawal.id);
  res.json(withdrawal);
});
```

### 2. Validation & Approval
- **Balance Check**: Verify sufficient funds in pool
- **Address Validation**: Validate cryptocurrency address format
- **Amount Limits**: Check against pool minimum/maximum thresholds
- **Security**: 2FA verification if enabled

### 3. Blockchain Processing (Ethers.js Integration)
- **Wallet Manager**: Uses ethers.js to sign transactions locally
- **External API Providers**: 
  - Bitcoin: BlockCypher/Blockstream APIs for transaction broadcasting
  - Ethereum: Infura/Alchemy providers for network interaction
  - TERA: Custom RPC endpoints for TERA blockchain
- **No Local Nodes**: External APIs eliminate Bitcoin Core/full node requirements
- **Transaction Broadcasting**: Submits signed transactions via API providers
- **Status Updates**: Updates Drizzle database with transaction hash and confirmation status

### 4. Status Tracking
Real-time status updates through the system:
- `pending` → `approved` → `processing` → `completed`
- Failed transactions marked as `failed` with error details
- Users can cancel `pending` withdrawals

## Security Features

### Multi-Layer Validation
- **Pool Settings**: Each pool has configurable withdrawal policies
- **User Settings**: Individual auto-withdrawal thresholds and preferences  
- **Transaction Limits**: Daily/weekly/monthly withdrawal caps
- **2FA Integration**: Two-factor authentication for sensitive operations

### Wallet Security
- **HD Wallet**: Hierarchical deterministic wallet management
- **Multi-Signature**: Support for multi-sig wallet configurations
- **Address Verification**: Cryptographic address validation before processing

## Auto-Withdrawal System

### Threshold-Based Processing
- **Pool Monitoring**: Continuous balance tracking across all connected rigs
- **Automatic Triggers**: Withdrawals initiated when balances exceed user-defined thresholds
- **Smart Scheduling**: Optimized for network fees and pool payout schedules

### Configuration Options
- **Per-Token Thresholds**: Separate limits for BTC, ETH, TERA
- **Frequency Settings**: Daily, weekly, monthly, or manual processing
- **Emergency Controls**: Instant suspension and manual override capabilities

## Integration Points

### Frontend Integration
- **React Components**: Real-time withdrawal dashboard with TanStack Query
- **WebSocket Updates**: Live status updates for withdrawal progress
- **Form Validation**: Zod schema validation with react-hook-form

### API Endpoints
- `GET /api/mining/balances` - Retrieve current pool balances
- `POST /api/mining/withdraw` - Create new withdrawal request
- `GET /api/mining/withdrawals` - Fetch withdrawal history
- `PATCH /api/mining/withdrawals/:id` - Update withdrawal status

### External Services
- **Kraken API**: Real-time price data for USD conversion
- **Blockchain API Providers**: 
  - BlockCypher/Blockstream (Bitcoin network access)
  - Infura/Alchemy (Ethereum network access)
  - Custom RPC endpoints (TERA network access)
- **Mining Pools**: WebSocket connections for real-time balance updates
- **No Local Blockchain Nodes**: All blockchain interaction via external APIs

## Error Handling

### Common Issues
- **Network Connectivity**: Automatic retry with exponential backoff
- **Insufficient Funds**: Clear error messages with balance information
- **Invalid Addresses**: Pre-validation prevents invalid transactions
- **Pool Downtime**: Fallback to backup pools when primary is unavailable

### Recovery Mechanisms
- **Transaction Monitoring**: Continuous tracking of pending transactions
- **Resubmission Logic**: Automatic retry for failed network submissions
- **Manual Override**: Admin interface for handling edge cases
- **Audit Trail**: Complete transaction history for compliance and debugging

## API Provider Configuration for Production

### Required API Keys
```typescript
// Environment variables needed for production
INFURA_PROJECT_ID=your_infura_key_here
ALCHEMY_API_KEY=your_alchemy_key_here
BLOCKCYPHER_TOKEN=your_blockcypher_token_here
TERA_RPC_ENDPOINT=https://rpc.tera-network.org
```

### Ethers.js Provider Setup
```typescript
// Bitcoin provider (via external API)
const btcProvider = new ethers.providers.JsonRpcProvider('https://api.blockcypher.com/v1/btc/main');

// Ethereum provider
const ethProvider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);

// TERA token provider
const teraProvider = new ethers.providers.JsonRpcProvider(process.env.TERA_RPC_ENDPOINT);
```

### Benefits of External API Approach
- **No Bitcoin Core Required**: Eliminates need for local blockchain nodes
- **Instant Startup**: No blockchain synchronization delays
- **Reduced Infrastructure**: No storage requirements for blockchain data
- **Scalable**: External providers handle network reliability and performance
- **Cost Effective**: Pay-per-use model vs. maintaining full nodes

This system provides a robust, secure, and user-friendly solution for managing mining pool withdrawals with full database persistence via Drizzle ORM and lightweight blockchain integration through ethers.js and external API providers.