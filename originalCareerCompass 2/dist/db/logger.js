"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Logger {
    constructor() {
        this.logFile = path_1.default.join(process.cwd(), 'mining.log');
    }
    log(message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        if (data) {
            const formattedData = JSON.stringify(data, null, 2);
            fs_1.default.appendFileSync(this.logFile, `${logEntry}${formattedData}\n`);
        }
        else {
            fs_1.default.appendFileSync(this.logFile, logEntry);
        }
    }
    logReward(rigId, amount, poolId) {
        const message = `💰 Mining reward logged - Rig: ${rigId}, Pool: ${poolId}, Amount: ${amount} BTC`;
        this.log(message, { rigId, amount, poolId, timestamp: new Date().toISOString() });
    }
    logError(error, context) {
        const message = `❌ Error: ${error.message}`;
        this.log(message, { error: error.stack, context });
    }
}
exports.logger = new Logger();
