import express from 'express';
import cors from 'cors';
import { tcpMiningServer } from './tcp-mining-server.js';
import withdrawalRoutes from './routes/withdrawal.js';
import { WithdrawalProcessor } from './services/withdrawal-processor.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/withdrawals', withdrawalRoutes);

// Initialize services
async function startAllServices() {
  console.log('🚀 Starting all services on port 5000...');
  
  // Start TCP Mining Server
  try {
    await tcpMiningServer.startAllPools();
    console.log('✅ Mining pools started successfully');
  } catch (err) {
    console.error('❌ Failed to start mining pools:', err);
  }

  // Start withdrawal processor
  const withdrawalProcessor = new WithdrawalProcessor();
  withdrawalProcessor.startHourlyProcessing();
  console.log('✅ Withdrawal processor started');

  // Start main server
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`
=== KLOUD BOT PRO Services Running ===
🌐 Main Trading Platform: http://localhost:${PORT}
⛏️ Mining Control Center: http://localhost:${PORT}/mining
🤝 Social Justice Platform: http://localhost:${PORT}/social
    
💻 All services running on port ${PORT}
📊 Miners status: http://localhost:${PORT}/mining/stats
    `);
  });
}

startAllServices().catch(console.error);
