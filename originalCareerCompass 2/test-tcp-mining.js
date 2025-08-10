#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import net from 'net';
import http from 'node:http';

console.log('🚀 KLOUD BUGS Career Compass 2 - TCP Mining Test\n');

// Check if server is running
async function checkServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/mining/stats',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.setTimeout(3000);
    req.end();
  });
}

// Test TCP connection to mining pools
async function testTCPConnection(host, port, poolName) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 5000);

    socket.connect(port, host, () => {
      console.log(`   ✅ ${poolName}: TCP connection successful (${host}:${port})`);
      clearTimeout(timeout);
      socket.destroy();
      resolve(true);
    });

    socket.on('error', (err) => {
      console.log(`   ❌ ${poolName}: Connection failed (${host}:${port}) - ${err.message}`);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

// Test stratum protocol
async function testStratumProtocol(host, port, poolName) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let responseReceived = false;
    
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        console.log(`   ⚠️  ${poolName}: Stratum timeout (${host}:${port})`);
        socket.destroy();
        resolve(false);
      }
    }, 10000);

    socket.connect(port, host, () => {
      // Send stratum subscribe message
      const subscribeMsg = JSON.stringify({
        id: 1,
        method: 'mining.subscribe',
        params: ['test-miner', null, host, port]
      }) + '\n';
      
      socket.write(subscribeMsg);
    });

    socket.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString().trim());
        if (response.id === 1 && response.result) {
          console.log(`   ✅ ${poolName}: Stratum protocol working (${host}:${port})`);
          responseReceived = true;
          clearTimeout(timeout);
          socket.destroy();
          resolve(true);
        }
      } catch (err) {
        console.log(`   ⚠️  ${poolName}: Stratum response parsing error (${host}:${port})`);
      }
    });

    socket.on('error', (err) => {
      console.log(`   ❌ ${poolName}: Stratum error (${host}:${port}) - ${err.message}`);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('📡 Testing CareerCompass 2 Mining System...\n');

  // Check if server is running
  console.log('1. Checking Server Status:');
  const serverRunning = await checkServer();
  if (serverRunning) {
    console.log('   ✅ CareerCompass 2 server is running on port 5000');
  } else {
    console.log('   ❌ CareerCompass 2 server is not running');
    console.log('   💡 Start with: npm run dev');
    console.log('');
  }

  // Test TCP connections to mining pools
  console.log('2. Testing TCP Mining Pool Connections:');
  
  const poolTests = [
    { host: 'localhost', port: 3333, name: 'KLOUDBUGS CAFE POOL' },
    { host: 'localhost', port: 4444, name: 'TERA SOCIAL JUSTICE POOL' },
    { host: 'localhost', port: 5555, name: 'TERA TOKEN POOL' }
  ];

  let activeConnections = 0;
  for (const pool of poolTests) {
    const connected = await testTCPConnection(pool.host, pool.port, pool.name);
    if (connected) activeConnections++;
  }

  console.log('');
  console.log('3. Testing Stratum Mining Protocol:');
  
  let stratumWorking = 0;
  for (const pool of poolTests) {
    const working = await testStratumProtocol(pool.host, pool.port, pool.name);
    if (working) stratumWorking++;
  }

  console.log('');
  console.log('4. Testing Withdrawal Configuration:');
  
  // Check withdrawal config
  try {
    const withdrawalConfig = JSON.parse(fs.readFileSync('./withdrawal-config.json', 'utf8'));
    console.log('   ✅ Withdrawal configuration loaded successfully');
    console.log(`   💰 Mining pool address: ${withdrawalConfig.bitcoin.addresses.mining_pool}`);
    console.log(`   💸 Withdrawal address: ${withdrawalConfig.bitcoin.addresses.withdrawal}`);
    
    if (withdrawalConfig.bitcoin.addresses.mining_pool === withdrawalConfig.bitcoin.addresses.withdrawal) {
      console.log('   ✅ Using single mining address for withdrawals (recommended for testing)');
    }
  } catch (error) {
    console.log('   ❌ Withdrawal configuration not found or invalid');
  }

  console.log('');
  console.log('📊 Test Results Summary:');
  console.log(`   • Server Running: ${serverRunning ? '✅' : '❌'}`);
  console.log(`   • TCP Connections: ${activeConnections}/3 pools active`);
  console.log(`   • Stratum Protocol: ${stratumWorking}/3 pools working`);
  console.log('');

  if (activeConnections === 3 && stratumWorking >= 1) {
    console.log('🎉 SUCCESS: Your TCP mining pools are ready!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Connect your Python miners to:');
    console.log('      • stratum+tcp://0.0.0.0:3333 (KLOUDBUGS CAFE)');
    console.log('      • stratum+tcp://0.0.0.0:4444 (TERA SOCIAL JUSTICE)');
    console.log('      • stratum+tcp://0.0.0.0:5555 (TERA TOKEN)');
    console.log('   2. Withdrawals will go to: bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6');
    console.log('   3. Monitor mining at: http://0.0.0.0:5000');
    console.log('');
  } else {
    console.log('⚠️  ISSUES DETECTED:');
    if (!serverRunning) {
      console.log('   • Start the server: npm run dev');
    }
    if (activeConnections < 3) {
      console.log('   • Some mining pools are not responding');
    }
    if (stratumWorking === 0) {
      console.log('   • Stratum protocol not working - check server logs');
    }
  }

  console.log('✨ Test complete!');
}

// Run the tests
runTests().catch(console.error);
