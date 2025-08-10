"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_integration_1 = require("./server/db-integration");
var sqlite3_1 = require("sqlite3");
var sqlite_1 = require("sqlite");
var path_1 = require("path");
function migrateData() {
    return __awaiter(this, void 0, void 0, function () {
        var sourceDb, rigs, _i, rigs_1, rig, pools, _a, pools_1, pool, connections, _b, connections_1, conn, balances, _c, balances_1, balance, shares, _d, shares_1, share, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, sqlite_1.open)({
                        filename: path_1.default.join(__dirname, '..', 'CareerCompass 2 copy', 'kloudbugs_mining_real.db'),
                        driver: sqlite3_1.default.Database
                    })];
                case 1:
                    sourceDb = _e.sent();
                    console.log('🔄 Starting data migration...');
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 28, 29, 31]);
                    return [4 /*yield*/, sourceDb.all('SELECT * FROM mining_rigs')];
                case 3:
                    rigs = _e.sent();
                    console.log("Found ".concat(rigs.length, " miners to migrate"));
                    _i = 0, rigs_1 = rigs;
                    _e.label = 4;
                case 4:
                    if (!(_i < rigs_1.length)) return [3 /*break*/, 7];
                    rig = rigs_1[_i];
                    return [4 /*yield*/, db_integration_1.dbManager.db.run("INSERT OR REPLACE INTO mining_rigs (\n                    id, name, type, hashrate, powerDraw, temperature, status,\n                    efficiency, dailyRevenue, location, ipAddress, primaryPoolId,\n                    backupPool1Id, backupPool2Id, hardware, autoConfig, createdAt, lastUpdate\n                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                            rig.id, rig.name, rig.type, rig.hashrate, rig.powerDraw,
                            rig.temperature, rig.status, rig.efficiency, rig.dailyRevenue,
                            rig.location, rig.ipAddress, rig.primaryPoolId, rig.backupPool1Id,
                            rig.backupPool2Id, rig.hardware, rig.autoConfig, rig.createdAt,
                            rig.lastUpdate
                        ])];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [4 /*yield*/, sourceDb.all('SELECT * FROM mining_pools')];
                case 8:
                    pools = _e.sent();
                    console.log("Found ".concat(pools.length, " pools to migrate"));
                    _a = 0, pools_1 = pools;
                    _e.label = 9;
                case 9:
                    if (!(_a < pools_1.length)) return [3 /*break*/, 12];
                    pool = pools_1[_a];
                    return [4 /*yield*/, db_integration_1.dbManager.db.run("INSERT OR REPLACE INTO mining_pools (\n                    id, name, host, port, username, password, protocol,\n                    fee, status, hashRate, connectedRigs, totalShares,\n                    acceptedShares, rejectedShares, createdAt, lastUpdate\n                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                            pool.id, pool.name, pool.host, pool.port, pool.username,
                            pool.password, pool.protocol, pool.fee, pool.status,
                            pool.hashRate, pool.connectedRigs, pool.totalShares,
                            pool.acceptedShares, pool.rejectedShares, pool.createdAt,
                            pool.lastUpdate
                        ])];
                case 10:
                    _e.sent();
                    _e.label = 11;
                case 11:
                    _a++;
                    return [3 /*break*/, 9];
                case 12: return [4 /*yield*/, sourceDb.all('SELECT * FROM pool_connections')];
                case 13:
                    connections = _e.sent();
                    console.log("Found ".concat(connections.length, " pool connections to migrate"));
                    _b = 0, connections_1 = connections;
                    _e.label = 14;
                case 14:
                    if (!(_b < connections_1.length)) return [3 /*break*/, 17];
                    conn = connections_1[_b];
                    return [4 /*yield*/, db_integration_1.dbManager.db.run("INSERT OR REPLACE INTO pool_connections (\n                    rigId, poolId, connectionType, status, ipAddress,\n                    lastConnected, lastDisconnected, lastUpdate\n                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                            conn.rigId, conn.poolId, conn.connectionType, conn.status,
                            conn.ipAddress, conn.lastConnected, conn.lastDisconnected,
                            conn.lastUpdate
                        ])];
                case 15:
                    _e.sent();
                    _e.label = 16;
                case 16:
                    _b++;
                    return [3 /*break*/, 14];
                case 17: return [4 /*yield*/, sourceDb.all('SELECT * FROM miner_balances')];
                case 18:
                    balances = _e.sent();
                    console.log("Found ".concat(balances.length, " miner balances to migrate"));
                    _c = 0, balances_1 = balances;
                    _e.label = 19;
                case 19:
                    if (!(_c < balances_1.length)) return [3 /*break*/, 22];
                    balance = balances_1[_c];
                    return [4 /*yield*/, db_integration_1.dbManager.db.run("INSERT OR REPLACE INTO miner_balances (\n                    id, rigId, poolId, currency, pendingBalance, confirmedBalance,\n                    totalEarned, payoutThreshold, lastPayout, createdAt, lastUpdate\n                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                            balance.id, balance.rigId, balance.poolId, balance.currency,
                            balance.pendingBalance, balance.confirmedBalance, balance.totalEarned,
                            balance.payoutThreshold, balance.lastPayout, balance.createdAt,
                            balance.lastUpdate
                        ])];
                case 20:
                    _e.sent();
                    _e.label = 21;
                case 21:
                    _c++;
                    return [3 /*break*/, 19];
                case 22: return [4 /*yield*/, sourceDb.all('SELECT * FROM share_submissions')];
                case 23:
                    shares = _e.sent();
                    console.log("Found ".concat(shares.length, " share submissions to migrate"));
                    _d = 0, shares_1 = shares;
                    _e.label = 24;
                case 24:
                    if (!(_d < shares_1.length)) return [3 /*break*/, 27];
                    share = shares_1[_d];
                    return [4 /*yield*/, db_integration_1.dbManager.db.run("INSERT OR REPLACE INTO share_submissions (\n                    id, rigId, poolId, difficulty, shareValue, accepted, createdAt\n                ) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                            share.id, share.rigId, share.poolId, share.difficulty,
                            share.shareValue, share.accepted, share.createdAt
                        ])];
                case 25:
                    _e.sent();
                    _e.label = 26;
                case 26:
                    _d++;
                    return [3 /*break*/, 24];
                case 27:
                    console.log('✅ Data migration completed successfully!');
                    return [3 /*break*/, 31];
                case 28:
                    error_1 = _e.sent();
                    console.error('Failed to migrate data:', error_1);
                    throw error_1;
                case 29: return [4 /*yield*/, sourceDb.close()];
                case 30:
                    _e.sent();
                    return [7 /*endfinally*/];
                case 31: return [2 /*return*/];
            }
        });
    });
}
// Run migration
migrateData().catch(console.error);
