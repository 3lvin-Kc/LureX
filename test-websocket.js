const WebSocket = require('ws');

// Test WebSocket connection to port 3000
console.log('Testing WebSocket connection to ws://localhost:3000/ws/generate...');

const ws = new WebSocket('ws://localhost:3000/ws/generate');

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket on port 3000');
  
  // Send a test message
  ws.send(JSON.stringify({
    type: 'ping'
  }));
});

ws.on('message', function message(data) {
  console.log('📨 Received:', data.toString());
});

ws.on('close', function close() {
  console.log('❌ Connection closed');
});

ws.on('error', function error(err) {
  console.log('🚨 Error:', err.message);
});

// Close after 5 seconds
setTimeout(() => {
  ws.close();
}, 5000);
