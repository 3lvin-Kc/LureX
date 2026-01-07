/**
 * End-to-End WebSocket Connection Test
 * 
 * Validates the complete frontend-to-backend WebSocket connection flow
 * to identify why the UI shows only "connecting" status instead of 
 * establishing a proper connection when a user submits a prompt.
 */

import WebSocket from 'ws';

// Configuration
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 8080;

// For ES modules, we can't use require.main, so we'll use a different approach
const isMain = import.meta.url === `file://${process.argv[1]}`;

interface WebSocketTestResult {
  proxyConnectionSuccess: boolean;
  directConnectionSuccess: boolean;
  handshakeSuccess: boolean;
  connectionState: string;
  messagesReceived: number;
  errors: string[];
  timing: {
    connectStart: number;
    connectEnd: number;
    handshakeStart: number;
    handshakeEnd: number;
  };
}

/**
 * Test the complete WebSocket connection flow
 */
async function testWebSocketConnectionFlow(): Promise<WebSocketTestResult> {
  console.log('🔍 Starting WebSocket Connection Flow Test...\n');

  const result: WebSocketTestResult = {
    proxyConnectionSuccess: false,
    directConnectionSuccess: false,
    handshakeSuccess: false,
    connectionState: 'unknown',
    messagesReceived: 0,
    errors: [],
    timing: {
      connectStart: Date.now(),
      connectEnd: 0,
      handshakeStart: 0,
      handshakeEnd: 0,
    }
  };

  try {
    // Test 1: Direct connection to backend (bypassing proxy)
    console.log('1️⃣  Testing direct connection to backend WebSocket...');
    result.directConnectionSuccess = await testDirectConnection();
    console.log(`   Direct connection: ${result.directConnectionSuccess ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    // Test 2: Connection through Vite proxy (frontend-facing)
    console.log('2️⃣  Testing connection through Vite proxy...');
    result.proxyConnectionSuccess = await testProxyConnection();
    console.log(`   Proxy connection: ${result.proxyConnectionSuccess ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    // Test 3: Detailed handshake and message flow
    console.log('3️⃣  Testing WebSocket handshake and message flow...');
    const handshakeResult = await testHandshakeFlow();
    result.handshakeSuccess = handshakeResult.success;
    result.messagesReceived = handshakeResult.messagesReceived;
    result.connectionState = handshakeResult.connectionState;
    result.errors = handshakeResult.errors;
    console.log(`   Handshake: ${result.handshakeSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Messages received: ${result.messagesReceived}`);
    console.log(`   Connection state: ${result.connectionState}\n`);

    result.timing.connectEnd = Date.now();
  } catch (error) {
    console.error('❌ Error during WebSocket connection test:', error);
    result.errors.push((error as Error).message);
  }

  return result;
}

/**
 * Test direct connection to backend WebSocket
 */
async function testDirectConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${BACKEND_PORT}/ws/generate`);

    let connected = false;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      ws.close();
      resolve(false);
    }, 5000);

    ws.on('open', () => {
      console.log('   Direct connection opened successfully');
      connected = true;
      clearTimeout(timeout);
      ws.close();
      resolve(true);
    });

    ws.on('error', (error) => {
      console.error('   Direct connection error:', error.message);
      clearTimeout(timeout);
      if (!timedOut) {
        resolve(false);
      }
    });

    ws.on('close', () => {
      if (!timedOut && !connected) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });
}

/**
 * Test connection through Vite proxy (simulating frontend behavior)
 */
async function testProxyConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${FRONTEND_PORT}/ws/generate`);

    let connected = false;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      ws.close();
      resolve(false);
    }, 5000);

    ws.on('open', () => {
      console.log('   Proxy connection opened successfully');
      connected = true;
      clearTimeout(timeout);
      ws.close();
      resolve(true);
    });

    ws.on('error', (error) => {
      console.error('   Proxy connection error:', error.message);
      clearTimeout(timeout);
      if (!timedOut) {
        resolve(false);
      }
    });

    ws.on('close', () => {
      if (!timedOut && !connected) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });
}

/**
 * Test detailed handshake and message flow
 */
async function testHandshakeFlow(): Promise<{
  success: boolean;
  messagesReceived: number;
  connectionState: string;
  errors: string[];
}> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${FRONTEND_PORT}/ws/generate`);
    
    let handshakeSuccess = false;
    let messagesReceived = 0;
    let connectionState = 'connecting';
    const errors: string[] = [];
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      connectionState = 'timeout';
      ws.close();
      resolve({
        success: handshakeSuccess,
        messagesReceived,
        connectionState,
        errors
      });
    }, 10000);

    ws.on('open', () => {
      console.log('   Handshake flow - Connection opened');
      connectionState = 'connected';
      
      // Simulate the start generation message that would be sent by the frontend
      console.log('   Sending start generation message...');
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
        connectionState = 'handshake-complete';
      }
      
      // If we receive a thinking or narration message, the connection is working
      if (['thinking', 'narration', 'plan'].includes(message.type)) {
        handshakeSuccess = true;
        connectionState = 'active';
      }
    });

    ws.on('error', (error) => {
      console.error('   Handshake flow error:', error.message);
      errors.push(error.message);
      clearTimeout(timeout);
      if (!timedOut) {
        resolve({
          success: handshakeSuccess,
          messagesReceived,
          connectionState,
          errors
        });
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`   Connection closed - Code: ${code}, Reason: ${reason?.toString() || 'none'}`);
      if (!timedOut) {
        clearTimeout(timeout);
        resolve({
          success: handshakeSuccess,
          messagesReceived,
          connectionState,
          errors
        });
      }
    });
  });
}

/**
 * Test the generation store connection state management
 */
async function testGenerationStoreFlow() {
  console.log('4️⃣  Testing Generation Store Connection State Management...\n');
  
  // This would require importing and testing the actual Zustand store
  // For now, we'll simulate the connection state changes
  console.log('   Simulating generation store connection flow...');
  
  // The actual test would need to run in a browser environment
  // to properly test the Zustand store behavior
  console.log('   Note: Full generation store test requires browser environment');
  console.log('   Testing connection state transitions...\n');
  
  // Simulate the connection state changes that should happen
  const states = ['disconnected', 'connecting', 'connected', 'generating', 'complete'];
  for (const state of states) {
    console.log(`   → State: ${state}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

/**
 * Run the complete test suite
 */
async function runTestSuite() {
  console.log('🚀 WebSocket End-to-End Connection Test Suite\n');
  console.log('Prerequisites:');
  console.log('- Backend server running on http://localhost:3000');
  console.log('- Frontend server running on http://localhost:8080');
  console.log('- Vite proxy configured to forward /ws to ws://localhost:3000\n');

  try {
    // Run the main connection test
    const result = await testWebSocketConnectionFlow();
    
    // Run the generation store test
    await testGenerationStoreFlow();
    
    // Output results
    console.log('📋 TEST RESULTS:\n');
    console.log(`Direct Connection:      ${result.directConnectionSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Proxy Connection:       ${result.proxyConnectionSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Handshake Success:      ${result.handshakeSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Messages Received:      ${result.messagesReceived}`);
    console.log(`Final Connection State: ${result.connectionState}`);
    console.log(`Errors Encountered:     ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n⏰ TIMING:');
    console.log(`   Total test duration: ${result.timing.connectEnd - result.timing.connectStart}ms`);
    
    // Root cause analysis
    console.log('\n🔍 ROOT CAUSE ANALYSIS:');
    
    if (!result.proxyConnectionSuccess && result.directConnectionSuccess) {
      console.log('   🎯 ROOT CAUSE: Vite proxy configuration issue');
      console.log('      - Direct connection works but proxy connection fails');
      console.log('      - Issue is likely in Vite proxy WebSocket configuration');
    } else if (result.proxyConnectionSuccess && !result.handshakeSuccess) {
      console.log('   🎯 ROOT CAUSE: Handshake or message flow issue');
      console.log('      - Connection establishes but handshake fails');
      console.log('      - Issue might be in initial message exchange or authentication');
    } else if (result.handshakeSuccess && result.connectionState === 'active') {
      console.log('   🎯 NO ISSUE DETECTED: Connection flow appears to be working');
      console.log('      - All tests passed, issue might be in UI component state management');
    } else {
      console.log('   🎯 UNCLEAR: Multiple potential causes detected');
      console.log('      - Further debugging needed to isolate the specific issue');
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (!result.proxyConnectionSuccess) {
      console.log('   - Verify Vite proxy configuration for WebSocket connections');
      console.log('   - Check if the proxy path matches the WebSocket endpoint');
      console.log('   - Consider adding more detailed proxy logging');
    }
    if (!result.handshakeSuccess) {
      console.log('   - Verify WebSocket authentication/handshake process');
      console.log('   - Check if required headers are being passed correctly');
      console.log('   - Validate initial message format and content');
    }
    if (result.handshakeSuccess) {
      console.log('   - Check UI component state management');
      console.log('   - Verify Zustand store connection state updates');
      console.log('   - Debug why UI doesn\'t update after successful connection');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the test suite when this file is executed directly
if (isMain) {
  runTestSuite().catch(console.error);
}

export { testWebSocketConnectionFlow, testDirectConnection, testProxyConnection, testHandshakeFlow };