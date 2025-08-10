import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import withdrawalRoutes from './routes/withdrawal.js';
import { WithdrawalProcessor } from './services/withdrawal-processor.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/withdrawals', withdrawalRoutes);

// Basic error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

app.use(errorHandler);

// Initialize hourly withdrawals
const withdrawalProcessor = new WithdrawalProcessor();
withdrawalProcessor.startHourlyProcessing();

const PORT = process.env.PORT || 5000;

// Start TCP mining pools
async function startMiningPools() {
  const net = await import('net');
  
  const pools = [
    { name: 'KLOUDBUGS CAFE POOL', port: 3333 },
    { name: 'TERA SOCIAL JUSTICE POOL', port: 4444 },
    { name: 'TERA TOKEN POOL', port: 5555 }
  ];

  pools.forEach(pool => {
    const server = net.createServer();
    server.listen(pool.port, '0.0.0.0', () => {
      console.log(`✅ ${pool.name} started on port ${pool.port}`);
    });
  });
}

app.listen(PORT, async () => {
  console.log(`🚀 Main server running on port ${PORT}`);
  console.log('⏰ Hourly withdrawal processing started');
  await startMiningPools();
  console.log('\n=== Mining Pools Status ===');
  console.log('✅ All mining pools are ready!');
  console.log('📊 Monitor mining at: http://localhost:5000');
});
