/**
 * Frontend Authentication Simulation
 * 
 * This script simulates the frontend authentication flow using Node.js
 * to identify where "user not found" errors occur.
 */

const fetch = require('node-fetch');
const WebSocket = require('ws');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

// Mock JWT token (same as in the e2e test)
const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiaWF0IjoxNjM0NTY3ODkwfQ.mock-signature';

class FrontendAuthSimulator {
  constructor() {
    this.backendUrl = BACKEND_URL;
    this.wsUrl = WS_URL;
    this.authToken = MOCK_JWT_TOKEN;
  }

  // Simulate the Supabase auth client
  simulateSupabaseAuth() {
    console.log('🔐 Simulating Supabase Authentication Client');
    
    // In a real frontend, this would be:
    // import { createClient } from '@supabase/supabase-js'
    // const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    
    return {
      // Simulate getting current session
      async getSession() {
        console.log('📱 Checking for existing Supabase session...');
        
        // In real frontend, this would check localStorage and validate with Supabase
        const mockSession = {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated',
            app_metadata: {},
            user_metadata: { full_name: 'Test User' },
          },
          access_token: this.authToken,
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
        };
        
        console.log('✅ Mock session found:', mockSession.user.email);
        return { data: { session: mockSession }, error: null };
      },

      // Simulate sign up
      async signUp(email, password, options = {}) {
        console.log(`📝 Simulating sign up for: ${email}`);
        
        // In real frontend, this would call Supabase auth
        const mockUser = {
          id: 'new-user-id',
          email: email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { full_name: options.data?.full_name },
        };

        return {
          data: { 
            user: mockUser,
            session: {
              user: mockUser,
              access_token: this.authToken,
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
            }
          },
          error: null
        };
      },

      // Simulate sign in
      async signInWithPassword(email, password) {
        console.log(`🔑 Simulating sign in for: ${email}`);
        
        // In real frontend, this would validate credentials with Supabase
        const mockUser = {
          id: 'test-user-id',
          email: email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { full_name: 'Test User' },
        };

        return {
          data: { 
            user: mockUser,
            session: {
              user: mockUser,
              access_token: this.authToken,
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
            }
          },
          error: null
        };
      },

      // Simulate auth state change listener
      onAuthStateChange(callback) {
        console.log('👂 Setting up auth state change listener');
        
        // In real frontend, this would listen to Supabase auth events
        // For simulation, we'll trigger it immediately
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              aud: 'authenticated',
              role: 'authenticated',
            },
            access_token: this.authToken,
          });
        }, 100);
      }
    };
  }

  // Make authenticated requests to backend
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const url = `${this.backendUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      ...options.headers,
    };

    console.log(`🌐 Making authenticated request to: ${endpoint}`);
    console.log(`📋 Headers:`, headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      console.log(`📊 Response status: ${response.status}`);
      console.log(`📄 Response data:`, responseData);

      // Check for user-related errors
      if (typeof responseData === 'object' && responseData.error) {
        const errorStr = responseData.error.toLowerCase();
        if (errorStr.includes('user') || errorStr.includes('not found')) {
          console.log('🚨 USER ERROR DETECTED!');
          console.log('🔍 Error details:', responseData);
        }
      }

      return {
        status: response.status,
        ok: response.ok,
        data: responseData,
      };
    } catch (error) {
      console.error(`❌ Request failed:`, error);
      throw error;
    }
  }

  // Simulate complete frontend auth flow
  async simulateFrontendAuthFlow() {
    console.log('\n🎭 Starting Frontend Authentication Flow Simulation\n');

    try {
      // Step 1: Initialize Supabase client
      console.log('📍 Step 1: Initializing Supabase client...');
      const supabase = this.simulateSupabaseAuth();

      // Step 2: Check for existing session (like useAuth hook does)
      console.log('\n📍 Step 2: Checking existing session...');
      const { data: sessionData, error: sessionError } = await supabase.getSession();
      
      if (sessionError) {
        console.log('❌ Session check failed:', sessionError);
        return;
      }

      if (sessionData.session) {
        console.log('✅ User is authenticated');
        console.log('👤 User:', sessionData.session.user);
        
        // Step 3: Make authenticated requests (like the frontend would)
        console.log('\n📍 Step 3: Making authenticated requests...');
        
        // Test project state endpoint
        await this.testProjectStateEndpoint();
        
        // Test project creation
        await this.testProjectCreation();
        
        // Test code generation
        await this.testCodeGeneration();
        
      } else {
        console.log('⚠️ No active session - would redirect to auth page');
        
        // Simulate sign up flow
        console.log('\n📍 Step 4: Simulating sign up flow...');
        const { data: signUpData, error: signUpError } = await supabase.signUp(
          'newuser@example.com',
          'password123',
          { data: { full_name: 'New User' } }
        );
        
        if (signUpError) {
          console.log('❌ Sign up failed:', signUpError);
        } else {
          console.log('✅ Sign up successful');
          console.log('👤 New user:', signUpData.user);
        }
      }

      console.log('\n✅ Frontend auth flow simulation completed');

    } catch (error) {
      console.error('\n❌ Frontend simulation failed:', error);
    }
  }

  async testProjectStateEndpoint() {
    console.log('\n🔍 Testing project state endpoint...');
    
    try {
      const response = await this.makeAuthenticatedRequest('/api/project-state');
      
      if (response.ok) {
        console.log('✅ Project state endpoint successful');
        console.log('📊 Project state:', response.data);
      } else {
        console.log('⚠️ Project state endpoint failed');
        console.log('❌ Error:', response.data);
      }
    } catch (error) {
      console.error('❌ Project state test failed:', error);
    }
  }

  async testProjectCreation() {
    console.log('\n🔍 Testing project creation...');
    
    try {
      const response = await this.makeAuthenticatedRequest('/api/project-state/new', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('✅ Project creation successful');
        console.log('📊 Created project:', response.data);
        return response.data.projectState;
      } else {
        console.log('⚠️ Project creation failed');
        console.log('❌ Error:', response.data);
      }
    } catch (error) {
      console.error('❌ Project creation test failed:', error);
    }
  }

  async testCodeGeneration() {
    console.log('\n🔍 Testing code generation...');
    
    try {
      // First create a project
      const projectResponse = await this.makeAuthenticatedRequest('/api/project-state/new', {
        method: 'POST',
      });
      
      if (!projectResponse.ok) {
        throw new Error('Failed to create project for generation test');
      }
      
      const projectId = projectResponse.data.projectState.id;
      console.log(`📝 Using project ID: ${projectId}`);
      
      // Test generation
      const response = await this.makeAuthenticatedRequest('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          project_state_id: projectId,
          user_prompt: 'Create a simple Flutter todo app',
        }),
      });
      
      if (response.ok) {
        console.log('✅ Code generation successful');
        console.log('📊 Generation session:', response.data);
      } else {
        console.log('⚠️ Code generation failed');
        console.log('❌ Error:', response.data);
      }
    } catch (error) {
      console.error('❌ Code generation test failed:', error);
    }
  }

  // Test WebSocket connection with auth
  async testWebSocketAuth() {
    console.log('\n🔍 Testing WebSocket authentication...');
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${this.wsUrl}/ws/generate`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);

      ws.on('open', () => {
        console.log('✅ WebSocket connection established');
        clearTimeout(timeout);
        
        // Send a test message
        ws.send(JSON.stringify({
          type: 'ping',
          message: 'Hello from frontend simulation'
        }));
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 1000);
      });

      ws.on('message', (data) => {
        console.log('📨 WebSocket message:', data.toString());
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        console.error('❌ WebSocket error:', error);
        reject(error);
      });

      ws.on('close', (code, reason) => {
        clearTimeout(timeout);
        console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
      });
    });
  }
}

// Main execution
async function runFrontendSimulation() {
  console.log('🚀 Starting Frontend Authentication Simulation\n');

  const simulator = new FrontendAuthSimulator();

  try {
    // Check if backend is running
    console.log('🔍 Checking backend availability...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    
    if (!healthResponse.ok) {
      throw new Error('Backend is not available');
    }
    
    console.log('✅ Backend is available\n');
    
    // Run the simulation
    await simulator.simulateFrontendAuthFlow();
    
    // Test WebSocket
    await simulator.testWebSocketAuth();
    
    console.log('\n🎉 Frontend simulation completed!');
    console.log('\n📝 Summary:');
    console.log('   - If no "user not found" errors appeared above, the issue might be:');
    console.log('     1. In real Supabase JWT validation vs our mock token');
    console.log('     2. In database RLS policies blocking user access');
    console.log('     3. In environment-specific configuration');
    console.log('     4. In the actual Supabase user creation process');
    
  } catch (error) {
    console.error('\n💥 Frontend simulation failed:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the backend is running:');
      console.log('   cd backend && npm start');
    }
  }
}

// Run the simulation
if (require.main === module) {
  runFrontendSimulation().catch(console.error);
}

module.exports = { FrontendAuthSimulator };
