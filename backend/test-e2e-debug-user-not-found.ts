/**
 * End-to-End Debug Test: "User not found" Error Investigation
 *
 * This file traces the complete code generation workflow step-by-step
 * to identify exactly WHERE the "User not found" error originates.
 *
 * Run with: npx ts-node backend/test-e2e-debug-user-not-found.ts
 *
 * DO NOT MODIFY THIS FILE - This is a diagnostic tool only.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

// ============================================================================
// Colorful Console Output
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title: string) {
  console.log("\n" + "=".repeat(80));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log("=".repeat(80));
}

function step(number: number, description: string) {
  log(`\n[STEP ${number}] ${description}`, colors.yellow);
  console.log("-".repeat(60));
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function warn(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_PROMPT = "create a todo app";

interface TestResult {
  step: string;
  success: boolean;
  error?: string;
  details?: any;
  duration?: number;
}

const testResults: TestResult[] = [];

// ============================================================================
// Step 1: Environment Variables Check
// ============================================================================

async function testEnvironmentVariables(): Promise<TestResult> {
  step(1, "Checking Environment Variables");

  const envVars = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  info("Environment Variables Status:");

  let hasOpenRouter = false;
  let hasGemini = false;

  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      const masked = key.includes("KEY")
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value.substring(0, 30) + "...";
      success(`${key}: ${masked}`);

      if (key === "OPENROUTER_API_KEY") hasOpenRouter = true;
      if (key === "GOOGLE_API_KEY" || key === "GEMINI_API_KEY") hasGemini = true;
    } else {
      warn(`${key}: NOT SET`);
    }
  }

  console.log("");
  info(`OpenRouter configured: ${hasOpenRouter ? "YES" : "NO"}`);
  info(`Gemini configured: ${hasGemini ? "YES" : "NO"}`);

  if (!hasOpenRouter && !hasGemini) {
    error("NO AI PROVIDERS CONFIGURED!");
    return { step: "Environment Variables", success: false, error: "No AI providers configured" };
  }

  return { step: "Environment Variables", success: true, details: { hasOpenRouter, hasGemini } };
}

// ============================================================================
// Step 2: OpenRouter API Key Validation
// ============================================================================

async function testOpenRouterApiKey(): Promise<TestResult> {
  step(2, "Validating OpenRouter API Key");

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    warn("OPENROUTER_API_KEY not set - skipping OpenRouter validation");
    return { step: "OpenRouter API Key", success: true, details: { skipped: true } };
  }

  info("Testing OpenRouter API key validity...");

  try {
    // Test 1: Check key format
    info(`Key format: ${apiKey.startsWith("sk-or-") ? "Valid (sk-or-...)" : "Unexpected format"}`);
    info(`Key length: ${apiKey.length} characters`);

    // Test 2: Query the /auth/key endpoint (if available)
    const authResponse = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log(`Auth endpoint status: ${authResponse.status}`);

    if (authResponse.ok) {
      const authData = await authResponse.json();
      success("API Key is VALID!");
      info(`Account info: ${JSON.stringify(authData, null, 2)}`);
      return { step: "OpenRouter API Key", success: true, details: authData };
    } else {
      const errorText = await authResponse.text();
      error(`API Key validation failed: ${authResponse.status}`);
      error(`Response: ${errorText}`);

      // Check if this is the "User not found" error
      if (errorText.includes("User not found")) {
        error("🎯 FOUND THE ERROR SOURCE: OpenRouter /auth/key endpoint returned 'User not found'");
        error("This means your OpenRouter API key is invalid or the associated account doesn't exist.");
      }

      return {
        step: "OpenRouter API Key",
        success: false,
        error: `Auth failed: ${authResponse.status} - ${errorText}`,
      };
    }
  } catch (err: any) {
    error(`Network error testing OpenRouter: ${err.message}`);
    return { step: "OpenRouter API Key", success: false, error: err.message };
  }
}

// ============================================================================
// Step 3: OpenRouter Model Endpoint Test
// ============================================================================

async function testOpenRouterModelEndpoint(): Promise<TestResult> {
  step(3, "Testing OpenRouter Chat Completions Endpoint");

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-coder:free";

  if (!apiKey) {
    warn("OPENROUTER_API_KEY not set - skipping model test");
    return { step: "OpenRouter Model", success: true, details: { skipped: true } };
  }

  info(`Testing model: ${model}`);

  try {
    const startTime = Date.now();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://flutter-ui-generator.app",
        "X-Title": "Flutter UI Generator - Debug Test",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: 'Say "Hello" and nothing else.' }],
        max_tokens: 10,
        temperature: 0,
        stream: false,
      }),
    });

    const duration = Date.now() - startTime;
    console.log(`Response status: ${response.status} (${duration}ms)`);

    if (response.ok) {
      const data = await response.json();
      success(`Model ${model} responded successfully!`);
      info(`Response: ${JSON.stringify((data as any).choices?.[0]?.message?.content || data)}`);
      return { step: "OpenRouter Model", success: true, duration, details: data };
    } else {
      const errorText = await response.text();
      error(`Model request failed: ${response.status}`);
      error(`Response body: ${errorText}`);

      // Parse error for specific issues
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          error(`Error message: ${errorJson.error.message}`);

          if (errorJson.error.message.includes("User not found")) {
            error("🎯 FOUND THE ERROR SOURCE: Chat completions endpoint returned 'User not found'");
            error("Your API key does not correspond to a valid OpenRouter user.");
          }
        }
      } catch {
        // Not JSON
      }

      return {
        step: "OpenRouter Model",
        success: false,
        error: `${response.status}: ${errorText}`,
        duration,
      };
    }
  } catch (err: any) {
    error(`Network error: ${err.message}`);
    return { step: "OpenRouter Model", success: false, error: err.message };
  }
}

// ============================================================================
// Step 4: OpenRouter Streaming Endpoint Test
// ============================================================================

async function testOpenRouterStreaming(): Promise<TestResult> {
  step(4, "Testing OpenRouter Streaming Endpoint");

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-coder:free";

  if (!apiKey) {
    warn("OPENROUTER_API_KEY not set - skipping streaming test");
    return { step: "OpenRouter Streaming", success: true, details: { skipped: true } };
  }

  info(`Testing streaming with model: ${model}`);

  try {
    const startTime = Date.now();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://flutter-ui-generator.app",
        "X-Title": "Flutter UI Generator - Debug Test",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: 'Say "Test" and nothing else.' }],
        max_tokens: 10,
        temperature: 0,
        stream: true, // Enable streaming
      }),
    });

    const duration = Date.now() - startTime;
    console.log(`Stream initiation status: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      error(`Streaming request failed: ${response.status}`);
      error(`Response body: ${errorText}`);

      if (errorText.includes("User not found")) {
        error("🎯 FOUND THE ERROR SOURCE: Streaming endpoint returned 'User not found'");
      }

      return {
        step: "OpenRouter Streaming",
        success: false,
        error: `${response.status}: ${errorText}`,
      };
    }

    // Read some of the stream
    const reader = response.body?.getReader();
    if (!reader) {
      error("No response body reader available");
      return { step: "OpenRouter Streaming", success: false, error: "No body reader" };
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      fullContent += text;
      chunkCount++;

      // Check for errors in stream
      if (text.includes("error") && text.includes("User not found")) {
        error("🎯 FOUND THE ERROR SOURCE: Stream chunk contained 'User not found'");
        reader.releaseLock();
        return {
          step: "OpenRouter Streaming",
          success: false,
          error: "User not found in stream",
          details: { chunk: text },
        };
      }

      // Limit to first few chunks for testing
      if (chunkCount > 10) break;
    }

    reader.releaseLock();

    success(`Streaming works! Received ${chunkCount} chunks`);
    info(`Content preview: ${fullContent.substring(0, 200)}...`);

    return { step: "OpenRouter Streaming", success: true, details: { chunkCount } };
  } catch (err: any) {
    error(`Network error: ${err.message}`);
    return { step: "OpenRouter Streaming", success: false, error: err.message };
  }
}

// ============================================================================
// Step 5: Test OpenRouterClient Class Directly
// ============================================================================

async function testOpenRouterClient(): Promise<TestResult> {
  step(5, "Testing OpenRouterClient Class");

  try {
    const { OpenRouterClient } = await import("./code-generation/services/openrouter-client");

    const client = new OpenRouterClient();
    const config = client.getConfig();

    info(`Client config:`);
    info(`  - Model: ${config.model}`);
    info(`  - Has API Key: ${config.hasApiKey}`);
    info(`  - Max Tokens: ${config.maxTokens}`);
    info(`  - Temperature: ${config.temperature}`);

    if (!config.hasApiKey) {
      warn("OpenRouterClient has no API key configured");
      return { step: "OpenRouterClient", success: true, details: { noApiKey: true } };
    }

    // Test connection
    info("Testing connection via client.testConnection()...");
    const connectionResult = await client.testConnection();

    console.log(`Connection test result: ${JSON.stringify(connectionResult)}`);

    if (connectionResult.success) {
      success("OpenRouterClient connection successful!");
      return { step: "OpenRouterClient", success: true, details: connectionResult };
    } else {
      error(`OpenRouterClient connection failed: ${connectionResult.message}`);

      if (connectionResult.message.includes("User not found")) {
        error("🎯 FOUND THE ERROR SOURCE: OpenRouterClient.testConnection() returned 'User not found'");
      }

      return { step: "OpenRouterClient", success: false, error: connectionResult.message };
    }
  } catch (err: any) {
    error(`Error loading or testing OpenRouterClient: ${err.message}`);
    console.error(err.stack);
    return { step: "OpenRouterClient", success: false, error: err.message };
  }
}

// ============================================================================
// Step 6: Test AI Provider Factory
// ============================================================================

async function testAIProviderFactory(): Promise<TestResult> {
  step(6, "Testing AI Provider Factory");

  try {
    const { getAIProviderFactory, getActiveAIProvider } = await import(
      "./code-generation/services/ai-provider-factory"
    );

    const factory = getAIProviderFactory();

    info("Available providers:");
    const availableProviders = factory.getAvailableProviders();
    availableProviders.forEach((p) => info(`  - ${p}`));

    if (availableProviders.length === 0) {
      error("No AI providers available!");
      return { step: "AI Provider Factory", success: false, error: "No providers available" };
    }

    info("\nProvider status:");
    const status = factory.getProviderStatus();
    status.forEach((s) => {
      info(`  - ${s.type}: available=${s.available}, model=${s.model}`);
    });

    // Try to get active provider
    info("\nGetting active provider...");
    try {
      const activeProvider = getActiveAIProvider();
      success(`Active provider: ${activeProvider.getProviderName()}`);
      info(`Active model: ${activeProvider.getModel()}`);

      // Test connection
      info("Testing provider connection...");
      const connected = await activeProvider.testConnection();

      if (connected) {
        success("Active provider connection successful!");
        return { step: "AI Provider Factory", success: true, details: { provider: activeProvider.getProviderName() } };
      } else {
        error("Active provider connection failed!");
        return { step: "AI Provider Factory", success: false, error: "Connection test failed" };
      }
    } catch (providerError: any) {
      error(`Failed to get active provider: ${providerError.message}`);

      if (providerError.message.includes("User not found")) {
        error("🎯 FOUND THE ERROR SOURCE: getActiveAIProvider() threw 'User not found'");
      }

      return { step: "AI Provider Factory", success: false, error: providerError.message };
    }
  } catch (err: any) {
    error(`Error testing AI Provider Factory: ${err.message}`);
    console.error(err.stack);
    return { step: "AI Provider Factory", success: false, error: err.message };
  }
}

// ============================================================================
// Step 7: Test Project Identity Creation
// ============================================================================

async function testProjectIdentityCreation(): Promise<TestResult> {
  step(7, "Testing Project Identity Creation");

  try {
    const { ProjectIdentityService } = await import("./project-identity/project-identity-service");
    const { ProjectIdentityRepository } = await import("./project-identity/repository");

    const service = new ProjectIdentityService(new ProjectIdentityRepository());

    info(`Creating identity for prompt: "${TEST_PROMPT}"`);

    const identity = await service.create({ purpose: TEST_PROMPT });

    success("Project identity created successfully!");
    info(`Identity ID: ${identity.identity_id}`);
    info(`Project ID: ${identity.project_id}`);
    info(`Category: ${JSON.stringify((identity as any).core_definition?.purpose?.category)}`);

    return { step: "Project Identity", success: true, details: { identityId: identity.identity_id } };
  } catch (err: any) {
    error(`Error creating project identity: ${err.message}`);

    if (err.message.includes("User not found")) {
      error("🎯 FOUND THE ERROR SOURCE: Project identity creation threw 'User not found'");
    }

    return { step: "Project Identity", success: false, error: err.message };
  }
}

// ============================================================================
// Step 8: Test Architecture Plan Creation
// ============================================================================

async function testArchitecturePlanCreation(): Promise<TestResult> {
  step(8, "Testing Architecture Plan Creation");

  try {
    const { ProjectIdentityService } = await import("./project-identity/project-identity-service");
    const { ProjectIdentityRepository } = await import("./project-identity/repository");
    const { ArchitectureService } = await import("./architecture/architecture-service");
    const { ArchitectureRepository } = await import("./architecture/repository");

    // First create an identity
    const identityService = new ProjectIdentityService(new ProjectIdentityRepository());
    const identity = await identityService.create({ purpose: TEST_PROMPT });

    info(`Using identity: ${identity.identity_id}`);

    // Now create architecture plan
    const archService = new ArchitectureService(new ArchitectureRepository());

    info("Creating architecture plan...");

    const plan = await archService.createArchitecturePlan(identity);

    success("Architecture plan created!");
    info(`Plan ID: ${plan.plan_id}`);
    info(`Category: ${plan.conceptual_category}`);
    info(`Complexity: ${plan.complexity_level}`);

    return { step: "Architecture Plan", success: true, details: { planId: plan.plan_id } };
  } catch (err: any) {
    error(`Error creating architecture plan: ${err.message}`);

    if (err.message.includes("User not found")) {
      error("🎯 FOUND THE ERROR SOURCE: Architecture plan creation threw 'User not found'");
    }

    return { step: "Architecture Plan", success: false, error: err.message };
  }
}

// ============================================================================
// Step 9: Test Prompt Assembly (No LLM call)
// ============================================================================

async function testPromptAssembly(): Promise<TestResult> {
  step(9, "Testing Prompt Assembly (No LLM Call)");

  try {
    const { getPromptAssembler } = await import("./code-generation/services/prompt-assembler");
    const { ProjectIdentityService } = await import("./project-identity/project-identity-service");
    const { ProjectIdentityRepository } = await import("./project-identity/repository");
    const { ArchitectureService } = await import("./architecture/architecture-service");
    const { ArchitectureRepository } = await import("./architecture/repository");
    const { getScaffoldInjector } = await import("./code-generation/services/scaffold-injector");

    const identityService = new ProjectIdentityService(new ProjectIdentityRepository());
    const archService = new ArchitectureService(new ArchitectureRepository());
    const promptAssembler = getPromptAssembler();
    const scaffoldInjector = getScaffoldInjector();

    // Create identity
    const identity = await identityService.create({ purpose: TEST_PROMPT });
    info(`Identity created: ${identity.identity_id}`);

    // Create or get architecture
    let architecture;
    try {
      architecture = await archService.createArchitecturePlan(identity);
    } catch (e: any) {
      if (e.message.includes("already exists")) {
        architecture = await archService.getArchitecturePlan(identity.identity_id);
      } else {
        throw e;
      }
    }
    info(`Architecture plan: ${architecture?.plan_id || "N/A"}`);

    // Generate scaffold
    const scaffold = scaffoldInjector.generateScaffold(identity);
    info(`Scaffold files: ${scaffold.files.length}`);

    // Assemble prompt
    const fullPrompt = promptAssembler.assembleScaffoldBasedPrompt(TEST_PROMPT, identity, architecture, scaffold);

    success("Prompt assembled successfully!");
    info(`Prompt length: ${fullPrompt.length} characters`);
    info(`Prompt preview: ${fullPrompt.substring(0, 500)}...`);

    return { step: "Prompt Assembly", success: true, details: { promptLength: fullPrompt.length } };
  } catch (err: any) {
    error(`Error assembling prompt: ${err.message}`);
    console.error(err.stack);
    return { step: "Prompt Assembly", success: false, error: err.message };
  }
}

// ============================================================================
// Step 10: Full Generation Test with Direct Stream
// ============================================================================

async function testFullGenerationStream(): Promise<TestResult> {
  step(10, "Testing Full Generation Stream (Where 'User not found' likely occurs)");

  try {
    const { getPromptAssembler } = await import("./code-generation/services/prompt-assembler");
    const { ProjectIdentityService } = await import("./project-identity/project-identity-service");
    const { ProjectIdentityRepository } = await import("./project-identity/repository");
    const { ArchitectureService } = await import("./architecture/architecture-service");
    const { ArchitectureRepository } = await import("./architecture/repository");
    const { getScaffoldInjector } = await import("./code-generation/services/scaffold-injector");
    const { getActiveAIProvider } = await import("./code-generation/services/ai-provider-factory");

    const identityService = new ProjectIdentityService(new ProjectIdentityRepository());
    const archService = new ArchitectureService(new ArchitectureRepository());
    const promptAssembler = getPromptAssembler();
    const scaffoldInjector = getScaffoldInjector();

    // Create identity
    info("Creating identity...");
    const identity = await identityService.create({ purpose: TEST_PROMPT });

    // Create architecture
    info("Creating architecture plan...");
    let architecture;
    try {
      architecture = await archService.createArchitecturePlan(identity);
    } catch (e: any) {
      if (e.message.includes("already exists")) {
        architecture = await archService.getArchitecturePlan(identity.identity_id);
      } else {
        throw e;
      }
    }

    // Generate scaffold
    info("Generating scaffold...");
    const scaffold = scaffoldInjector.generateScaffold(identity);

    // Assemble prompt
    info("Assembling prompt...");
    const fullPrompt = promptAssembler.assembleScaffoldBasedPrompt(TEST_PROMPT, identity, architecture, scaffold);

    // Get AI provider
    info("Getting active AI provider...");
    const aiProvider = getActiveAIProvider();
    info(`Using provider: ${aiProvider.getProviderName()}, model: ${aiProvider.getModel()}`);

    // Try to get the OpenRouter client directly and stream
    info("Attempting to stream generate...");

    const openRouterClient = (aiProvider as any).openRouterClient;

    if (!openRouterClient) {
      warn("No OpenRouterClient available on provider - using non-streaming test");

      // Use the provider's generate method instead
      info("Testing provider.generate() instead...");
      try {
        const result = await aiProvider.generate(fullPrompt.substring(0, 1000), { maxTokens: 50 });
        success("Provider generate succeeded!");
        return { step: "Full Generation", success: true, details: { method: "generate" } };
      } catch (genError: any) {
        error(`Provider generate failed: ${genError.message}`);
        if (genError.message.includes("User not found")) {
          error("🎯 FOUND THE ERROR SOURCE: aiProvider.generate() threw 'User not found'");
        }
        return { step: "Full Generation", success: false, error: genError.message };
      }
    }

    // Stream test
    info("Starting stream generation...");
    const startTime = Date.now();
    let chunkCount = 0;
    let totalContent = "";

    try {
      const stream = openRouterClient.streamGenerate(fullPrompt.substring(0, 1000), { maxTokens: 50 });

      for await (const chunk of stream) {
        chunkCount++;

        if (chunk.content) {
          totalContent += chunk.content;
        }

        // Early termination for test
        if (chunkCount > 5) {
          info("Early termination after 5 chunks (test successful)");
          break;
        }

        if (chunk.done) break;
      }

      const duration = Date.now() - startTime;
      success(`Stream generation works! Received ${chunkCount} chunks in ${duration}ms`);

      return { step: "Full Generation", success: true, details: { chunkCount, duration } };
    } catch (streamError: any) {
      error(`Stream generation failed: ${streamError.message}`);

      if (streamError.message.includes("User not found")) {
        error("🎯🎯🎯 FOUND THE ERROR SOURCE: streamGenerate() threw 'User not found'");
        error("This is the exact point in the workflow where the error originates!");
        error("");
        error("ROOT CAUSE: Your OpenRouter API key is invalid or expired.");
        error("SOLUTION: Get a new API key from https://openrouter.ai/keys");
      }

      return { step: "Full Generation", success: false, error: streamError.message };
    }
  } catch (err: any) {
    error(`Error in full generation test: ${err.message}`);
    console.error(err.stack);
    return { step: "Full Generation", success: false, error: err.message };
  }
}

// ============================================================================
// Summary Report
// ============================================================================

function printSummary() {
  header("TEST SUMMARY REPORT");

  console.log("");
  log("Step Results:", colors.bright);
  console.log("-".repeat(60));

  let passCount = 0;
  let failCount = 0;

  for (const result of testResults) {
    if (result.success) {
      passCount++;
      success(`${result.step}: PASSED`);
    } else {
      failCount++;
      error(`${result.step}: FAILED - ${result.error}`);
    }
  }

  console.log("");
  console.log("-".repeat(60));
  log(`Total: ${passCount} passed, ${failCount} failed`, colors.bright);

  // Analysis
  console.log("\n");
  header("ERROR ANALYSIS");

  const failedSteps = testResults.filter((r) => !r.success);

  if (failedSteps.length === 0) {
    success("All tests passed! The 'User not found' error might be intermittent.");
    success("Try running your generation again.");
  } else {
    error("Failed steps indicate where the problem lies:");
    console.log("");

    for (const failed of failedSteps) {
      error(`📍 ${failed.step}`);
      error(`   Error: ${failed.error}`);
      console.log("");
    }

    // Provide specific recommendations
    console.log("");
    log("RECOMMENDED FIXES:", colors.bright + colors.yellow);
    console.log("");

    if (failedSteps.some((s) => s.step.includes("OpenRouter"))) {
      log("1. Get a new OpenRouter API key:", colors.yellow);
      log("   → Go to https://openrouter.ai/keys", colors.reset);
      log("   → Generate a new key", colors.reset);
      log("   → Update backend/.env with: OPENROUTER_API_KEY=sk-or-...", colors.reset);
      console.log("");

      log("2. Verify your API key is valid:", colors.yellow);
      log("   → Run: curl https://openrouter.ai/api/v1/auth/key -H 'Authorization: Bearer YOUR_KEY'", colors.reset);
      console.log("");

      log("3. Use a free model if credits are an issue:", colors.yellow);
      log("   → Update backend/.env with: OPENROUTER_MODEL=qwen/qwen3-coder:free", colors.reset);
      console.log("");
    }

    if (failedSteps.some((s) => s.step.includes("Environment"))) {
      log("1. Ensure backend/.env exists with proper values", colors.yellow);
      log("2. Check that .env is being loaded (dotenv.config() path)", colors.reset);
    }
  }

  console.log("");
  console.log("=".repeat(80));
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  header("End-to-End Debug: 'User not found' Error Investigation");

  console.log("\nThis test traces the complete code generation workflow");
  console.log("to identify exactly where the 'User not found' error originates.\n");

  // Run all tests in sequence
  testResults.push(await testEnvironmentVariables());
  testResults.push(await testOpenRouterApiKey());
  testResults.push(await testOpenRouterModelEndpoint());
  testResults.push(await testOpenRouterStreaming());
  testResults.push(await testOpenRouterClient());
  testResults.push(await testAIProviderFactory());

  // Only run database-dependent tests if previous tests passed
  const earlyFailure = testResults.some((r) => !r.success && !r.details?.skipped);

  if (earlyFailure) {
    warn("\n⚠️ Skipping database-dependent tests due to early failure");
    warn("Fix the OpenRouter API key issue first.\n");
  } else {
    testResults.push(await testProjectIdentityCreation());
    testResults.push(await testArchitecturePlanCreation());
    testResults.push(await testPromptAssembly());
    testResults.push(await testFullGenerationStream());
  }

  // Print summary
  printSummary();
}

// Run
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
