/**
 * Simple WebSocket Connection Test
 * 
 * Validates the basic WebSocket connection flow
 */

const WebSocket = require('ws');

// Configuration
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 8080;

async function testConnectionFlow() {
  console.log('🚀 WebSocket Connection Test\n');
  
  // Test direct connection to backend
  console.log('1️⃣  Testing direct connection to backend...');
  const directResult = await testConnection(`ws://localhost:${BACKEND_PORT}/ws/generate`, 'Direct');
  console.log(`   Direct connection: ${directResult.success ? '✅ SUCCESS' : '❌ FAILED'}\n`);

  // Test connection through proxy
  console.log('2️⃣  Testing connection through Vite proxy...');
  const proxyResult = await testConnection(`ws://localhost:${FRONTEND_PORT}/ws/generate`, 'Proxy');
  console.log(`   Proxy connection: ${proxyResult.success ? '✅ SUCCESS' : '❌ FAILED'}\n`);

  // Test handshake flow with proxy
  console.log('3️⃣  Testing handshake flow with proxy...');
  const handshakeResult = await testHandshakeFlow(`ws://localhost:${FRONTEND_PORT}/ws/generate`);
  console.log(`   Handshake flow: ${handshakeResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Messages received: ${handshakeResult.messagesReceived}`);
  console.log(`   Final state: ${handshakeResult.state}\n`);

  // Analysis
  console.log('🔍 ANALYSIS:');
  if (!proxyResult.success && directResult.success) {
    console.log('   🎯 ROOT CAUSE: Vite proxy configuration issue');
    console.log('      - Direct connection works but proxy connection fails');
    console.log('      - Issue is likely in Vite proxy WebSocket configuration');
  } else if (proxyResult.success && !handshakeResult.success) {
    console.log('   🎯 ROOT CAUSE: Handshake or message flow issue');
    console.log('      - Connection establishes but handshake fails');
    console.log('      - Issue might be in initial message exchange');
  } else if (proxyResult.success && handshakeResult.success) {
    console.log('   ✅ NO ISSUE: Connection flow is working correctly');
    console.log('      - Issue might be in UI component state management');
  } else {
    console.log('   ❌ CONNECTION FAILURE: Both direct and proxy connections failing');
  }
}

function testConnection(url, type) {
  return new Promise((resolve) => {
    console.log(`   Attempting ${type.toLowerCase()} connection to: ${url}`);
    const ws = new WebSocket(url);

    let connected = false;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      ws.close();
      console.log(`   ${type} connection timeout`);
      resolve({ success: false, error: 'timeout' });
    }, 5000);

    ws.on('open', () => {
      console.log(`   ${type} connection opened successfully`);
      connected = true;
      clearTimeout(timeout);
      ws.close();
      resolve({ success: true });
    });

    ws.on('error', (error) => {
      console.error(`   ${type} connection error:`, error.message);
      clearTimeout(timeout);
      if (!timedOut) {
        resolve({ success: false, error: error.message });
      }
    });

    ws.on('close', () => {
      if (!timedOut && !connected) {
        clearTimeout(timeout);
        resolve({ success: false, error: 'closed before open' });
      }
    });
  });
}

function testHandshakeFlow(url) {
  return new Promise((resolve) => {
    console.log(`   Testing handshake flow to: ${url}`);
    const ws = new WebSocket(url);

    let handshakeSuccess = false;
    let messagesReceived = 0;
    let state = 'connecting';
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      state = 'timeout';
      ws.close();
      resolve({ success: handshakeSuccess, messagesReceived, state });
    }, 10000);

    ws.on('open', () => {
      console.log('   Connection opened, sending start message...');
      state = 'connected';
      
      // Simulate the start generation message
      const startMessage = {
        type: 'start',
        projectId: 'test-project',
        prompt: 'Create a simple counter app'
      };
      
      ws.send(JSON.stringify(startMessage));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      messagesReceived++;
      console.log(`   Message #${messagesReceived}: ${message.type}`, message);
      
      if (message.type === 'connected' || message.type === 'session_started') {
        handshakeSuccess = true;
        state = 'handshake-complete';
      }
      
      // If we receive a thinking or narration message, the connection is working
      if (['thinking', 'narration', 'plan'].includes(message.type)) {
        handshakeSuccess = true;
        state = 'active';
      }
    });

    ws.on('error', (error) => {
      console.error('   Handshake flow error:', error.message);
      clearTimeout(timeout);
      if (!timedOut) {
        resolve({ success: handshakeSuccess, messagesReceived, state: 'error' });
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`   Connection closed - Code: ${code}, Reason: ${reason?.toString() || 'none'}`);
      if (!timedOut) {
        clearTimeout(timeout);
        resolve({ success: handshakeSuccess, messagesReceived, state });
      }
    });
  });
}

// Run the test
testConnectionFlow().catch(console.error);