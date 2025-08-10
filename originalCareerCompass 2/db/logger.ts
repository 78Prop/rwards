import fs from 'fs';
import path from 'path';

class Logger {
  private logFile: string;

  constructor() {
    this.logFile = path.join(process.cwd(), 'mining.log');
  }

  public log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    if (data) {
      const formattedData = JSON.stringify(data, null, 2);
      fs.appendFileSync(this.logFile, `${logEntry}${formattedData}\n`);
    } else {
      fs.appendFileSync(this.logFile, logEntry);
    }
  }

  public logReward(rigId: string, amount: string, poolId: string) {
    const message = `💰 Mining reward logged - Rig: ${rigId}, Pool: ${poolId}, Amount: ${amount} BTC`;
    this.log(message, { rigId, amount, poolId, timestamp: new Date().toISOString() });
  }

  public logError(error: Error, context?: any) {
    const message = `❌ Error: ${error.message}`;
    this.log(message, { error: error.stack, context });
  }
}

export const logger = new Logger();
