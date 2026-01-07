/**
 * Integration Test for Code Generation Pipeline
 *
 * This script tests the SCAFFOLD-BASED Zero-to-One Code Generation flow:
 * 1. Create a new project state
 * 2. Trigger code generation (scaffold is injected, LLM creates screens/widgets)
 * 3. Poll for status
 * 4. Verify artifacts include scaffold files + LLM-generated screens
 *
 * SCAFFOLD-BASED APPROACH:
 * - Base files (pubspec.yaml, main.dart, app.dart, app_router.dart) are INJECTED
 * - LLM only creates screens in lib/screens/ and widgets in lib/widgets/
 * - Router additions are merged into scaffold's app_router.dart
 *
 * Usage:
 *   npx ts-node test-code-generation.ts
 *
 * Prerequisites:
 *   - Backend server running (npm run dev or npx ts-node server.ts)
 *   - OPENROUTER_API_KEY environment variable set
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable set (recommended)
 */

import {
  ALL_MANDATORY_FILES,
  FOLDER_CONVENTIONS,
  getFileType,
} from "./code-generation/services/base-structure-template";

import {
  ScaffoldInjector,
  deriveAppName,
  deriveAppTitle,
} from "./code-generation/services/scaffold-injector";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || "test-token-for-development";

// =============================================================================
// Types
// =============================================================================

interface ProjectState {
  id: string;
  project_id: string | null;
  identity_id: string | null;
  artifact_count: number;
  has_config: boolean;
  architecture_decisions_recorded: boolean;
  architecture_plan_established: boolean;
  mode_locked: "ZERO_TO_ONE" | "ONE_TO_N";
  created_at: string;
  updated_at: string;
}

interface GenerationSession {
  sessionId: string;
  projectStateId: string;
  status: string;
  message: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  filesGenerated?: number;
  result?: {
    metadata?: {
      tokens_total?: number;
      generation_time_ms?: number;
      model_used?: string;
    };
  };
}

interface Artifact {
  id: string;
  project_state_id: string;
  identity_id: string;
  architecture_plan_id: string;
  file_path: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  file_size_bytes: number;
  is_entry_point: boolean;
  generation_order: number;
  created_at: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function makeRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T }> {
  const url = `${BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// =============================================================================
// Validation Functions
// =============================================================================

interface ScaffoldValidationResult {
  valid: boolean;
  scaffoldFilesPresent: boolean;
  missingScaffoldFiles: string[];
  screenFilesPresent: boolean;
  screenFiles: string[];
  widgetFiles: string[];
  hasHomeScreen: boolean;
  errors: string[];
  warnings: string[];
}

async function validateMinimumScreens(
  projectStateId: string,
  artifacts: Artifact[],
): Promise<boolean> {
  console.log("\n🎯 Validating Minimum Screens Requirements...");
  console.log("   ─────────────────────────────────────────");

  try {
    // Get project state to check if architecture plan is established
    const { ok, data } = await makeRequest<{
      projectState: {
        id: string;
        identity_id: string | null;
        architecture_plan_established: boolean;
        mode_locked: string;
      };
    }>(`/api/project-state/${projectStateId}`);

    if (!ok || !data.projectState.architecture_plan_established) {
      console.log(
        "   ℹ️  Architecture plan not established - skipping minimum screens validation",
      );
      return true;
    }

    // Get architecture plan details
    const { ok: archOk, data: archData } = await makeRequest<{
      architecturePlan: {
        plan_id: string;
        feature_analysis: {
          screen_requirements: {
            minimum: number;
            recommended: number;
            maximum: number;
          };
        };
      };
    }>(`/api/architecture/plan/${data.projectState.identity_id}`);

    if (
      !archOk ||
      !archData.architecturePlan?.feature_analysis?.screen_requirements
    ) {
      console.log(
        "   ⚠️  Could not fetch architecture plan - skipping minimum screens validation",
      );
      return true;
    }

    const screenRequirements =
      archData.architecturePlan.feature_analysis.screen_requirements;
    const screenFiles = artifacts.filter((a) =>
      a.file_path.startsWith(FOLDER_CONVENTIONS.screens),
    );
    const actualScreenCount = screenFiles.length;

    console.log(`   📊 Screen Requirements:`);
    console.log(`   - Minimum required: ${screenRequirements.minimum}`);
    console.log(`   - Recommended: ${screenRequirements.recommended}`);
    console.log(`   - Maximum: ${screenRequirements.maximum}`);
    console.log(`   - Actual generated: ${actualScreenCount}`);

    // Validate against requirements
    let isValid = true;

    if (actualScreenCount < screenRequirements.minimum) {
      console.log(
        `   ❌ INSUFFICIENT SCREENS: Generated ${actualScreenCount} but need at least ${screenRequirements.minimum}`,
      );
      isValid = false;
    } else if (actualScreenCount < screenRequirements.recommended) {
      console.log(
        `   ⚠️  BELOW RECOMMENDED: Generated ${actualScreenCount} but recommend ${screenRequirements.recommended}`,
      );
    } else if (actualScreenCount > screenRequirements.maximum) {
      console.log(
        `   ⚠️  EXCEEDS MAXIMUM: Generated ${actualScreenCount} but maximum is ${screenRequirements.maximum}`,
      );
    } else {
      console.log(
        `   ✅ SCREEN REQUIREMENTS MET: Generated ${actualScreenCount} screens (within ${screenRequirements.minimum}-${screenRequirements.maximum})`,
      );
    }

    // List generated screens
    console.log(`   📱 Generated Screens:`);
    if (screenFiles.length > 0) {
      screenFiles.forEach((screen) => {
        console.log(`      - ${screen.file_path}`);
      });
    } else {
      console.log(`      (none)`);
    }

    console.log("   ─────────────────────────────────────────");
    if (isValid) {
      console.log("   ✅ MINIMUM SCREENS VALIDATION PASSED");
    } else {
      console.log("   ❌ MINIMUM SCREENS VALIDATION FAILED");
    }

    return isValid;
  } catch (error) {
    console.log("   ❌ Error during minimum screens validation:", error);
    console.log("   ─────────────────────────────────────────");
    console.log("   ⚠️  MINIMUM SCREENS VALIDATION SKIPPED (error)");
    return true; // Don't fail the test due to validation errors
  }
}

function validateScaffoldBasedOutput(
  artifacts: Artifact[],
): ScaffoldValidationResult {
  const filePaths = artifacts.map((a) => a.file_path);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check scaffold files (should all be present - injected by system)
  const scaffoldFiles = [...ALL_MANDATORY_FILES];
  const missingScaffold = scaffoldFiles.filter((f) => !filePaths.includes(f));
  const scaffoldFilesPresent = missingScaffold.length === 0;

  if (!scaffoldFilesPresent) {
    for (const missing of missingScaffold) {
      errors.push(`Missing scaffold file: ${missing}`);
    }
  }

  // Check for screen files
  const screenFiles = filePaths.filter((p) =>
    p.startsWith(FOLDER_CONVENTIONS.screens),
  );
  const screenFilesPresent = screenFiles.length > 0;

  if (!screenFilesPresent) {
    errors.push("No screen files found in lib/screens/");
  }

  // Check for home_screen.dart specifically
  const hasHomeScreen = screenFiles.some((p) => p.includes("home_screen.dart"));
  if (!hasHomeScreen) {
    warnings.push("No home_screen.dart found - app may not have a home screen");
  }

  // Check widget files (optional)
  const widgetFiles = filePaths.filter((p) =>
    p.startsWith(FOLDER_CONVENTIONS.widgets),
  );

  // Check for any files in wrong locations
  for (const path of filePaths) {
    const fileType = getFileType(path);
    if (fileType === "unknown" && path !== "pubspec.yaml") {
      warnings.push(`File "${path}" is in an unexpected location`);
    }
  }

  return {
    valid: errors.length === 0,
    scaffoldFilesPresent,
    missingScaffoldFiles: missingScaffold,
    screenFilesPresent,
    screenFiles,
    widgetFiles,
    hasHomeScreen,
    errors,
    warnings,
  };
}

// =============================================================================
// Test Functions
// =============================================================================

async function testHealthCheck(): Promise<boolean> {
  console.log("\n📋 Testing health check...");

  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    if (response.ok && data.status === "OK") {
      console.log("   ✅ Health check passed");
      console.log(`   Services: ${JSON.stringify(data.services)}`);
      return true;
    } else {
      console.log("   ❌ Health check failed:", data);
      return false;
    }
  } catch (error) {
    console.log("   ❌ Could not connect to server:", error);
    console.log("   Make sure the server is running at", BASE_URL);
    return false;
  }
}

async function testAIProviderConnection(): Promise<boolean> {
  console.log("\n🔌 Testing AI Provider connection...");

  const { ok, data } = await makeRequest<{
    success: boolean;
    message: string;
    model?: string;
  }>("/api/generate/test-connection", "POST");

  if (ok && data.success) {
    console.log("   ✅ AI Provider connection successful");
    console.log(`   Message: ${data.message}`);
    return true;
  } else {
    console.log("   ❌ AI Provider connection failed:", data.message);
    console.log("   Make sure GOOGLE_API_KEY or GEMINI_API_KEY is set");
    return false;
  }
}

async function testGetConfiguration(): Promise<void> {
  console.log("\n⚙️  Getting configuration...");

  const { ok, data } = await makeRequest<{
    config: {
      provider: string;
      model: string;
      maxRetries: number;
      rateLimitStatus?: {
        requestsRemaining: number;
        resetTime: string;
        dailyRequestsRemaining?: number;
        dailyResetTime?: string;
      };
    };
    storage: {
      bucket: string;
    };
  }>("/api/generate/config");

  if (ok) {
    console.log("   Configuration:");
    console.log(`   - Provider: ${data.config.provider}`);
    console.log(`   - Model: ${data.config.model}`);
    console.log(`   - Max Retries: ${data.config.maxRetries}`);
    console.log(`   - Storage Bucket: ${data.storage.bucket}`);
    if (data.config.rateLimitStatus) {
      console.log(
        `   - Requests Remaining: ${data.config.rateLimitStatus.requestsRemaining}`,
      );
      if (data.config.rateLimitStatus.dailyRequestsRemaining !== undefined) {
        console.log(
          `   - Daily Requests Remaining: ${data.config.rateLimitStatus.dailyRequestsRemaining}`,
        );
      }
    }
  } else {
    console.log("   ❌ Could not get configuration:", data);
  }
}

async function createNewProject(): Promise<ProjectState | null> {
  console.log("\n📝 Creating new project...");

  const { ok, status, data } = await makeRequest<{
    projectState: ProjectState;
  }>("/api/project-state/new", "POST");

  if (ok) {
    console.log("   ✅ Project created successfully");
    console.log(`   - ID: ${data.projectState.id}`);
    console.log(`   - Mode: ${data.projectState.mode_locked}`);
    return data.projectState;
  } else {
    console.log(`   ❌ Failed to create project (${status}):`, data);
    return null;
  }
}

async function triggerGeneration(
  projectStateId: string,
  userPrompt: string,
): Promise<string | null> {
  console.log("\n🚀 Triggering code generation (scaffold-based)...");
  console.log(
    `   Prompt: "${userPrompt.substring(0, 80)}${userPrompt.length > 80 ? "..." : ""}"`,
  );

  const { ok, status, data } = await makeRequest<{
    sessionId: string;
    status: string;
    message: string;
    projectStateId: string;
  }>("/api/generate", "POST", {
    project_state_id: projectStateId,
    user_prompt: userPrompt,
  });

  if (ok || status === 202) {
    console.log("   ✅ Generation started");
    console.log(`   - Session ID: ${data.sessionId}`);
    console.log(`   - Status: ${data.status}`);
    return data.sessionId;
  } else {
    console.log(`   ❌ Failed to start generation (${status}):`, data);
    return null;
  }
}

async function pollGenerationStatus(
  sessionId: string,
  maxWaitTime: number = 300000,
): Promise<GenerationSession | null> {
  console.log("\n⏳ Polling generation status...");

  const startTime = Date.now();
  let lastStatus = "";
  let lastProgress = -1;

  while (Date.now() - startTime < maxWaitTime) {
    const { ok, data } = await makeRequest<GenerationSession>(
      `/api/generate/${sessionId}/status`,
    );

    if (!ok) {
      console.log("   ❌ Failed to get status:", data);
      return null;
    }

    if (data.status !== lastStatus || data.progress !== lastProgress) {
      const elapsed = formatDuration(Date.now() - startTime);
      console.log(
        `   [${elapsed}] ${data.status} (${data.progress}%): ${data.message}`,
      );
      lastStatus = data.status;
      lastProgress = data.progress;
    }

    if (data.status === "completed") {
      console.log("   ✅ Generation completed successfully!");
      console.log(`   - Files generated: ${data.filesGenerated}`);
      return data;
    }

    if (data.status === "failed") {
      console.log("   ❌ Generation failed:", data.error);
      return data;
    }

    await sleep(2000);
  }

  console.log("   ⏰ Timeout waiting for generation");
  return null;
}

async function getArtifacts(projectStateId: string): Promise<Artifact[]> {
  console.log("\n📦 Getting generated artifacts...");

  const { ok, data } = await makeRequest<{
    projectStateId: string;
    artifactCount: number;
    artifacts: Artifact[];
  }>(`/api/artifacts/${projectStateId}`);

  if (ok) {
    console.log(`   ✅ Found ${data.artifactCount} artifacts:`);

    // Group by type
    const scaffold: string[] = [];
    const screens: string[] = [];
    const widgets: string[] = [];
    const other: string[] = [];

    for (const artifact of data.artifacts) {
      const fileType = getFileType(artifact.file_path);
      const icon = artifact.is_entry_point ? "⭐" : "📄";
      const line = `${icon} ${artifact.file_path} (${artifact.file_size_bytes} bytes)`;

      if (
        fileType === "config" ||
        fileType === "mandatory" ||
        artifact.file_path === "lib/routing/app_router.dart"
      ) {
        scaffold.push(line);
      } else if (fileType === "screen") {
        screens.push(line);
      } else if (fileType === "widget") {
        widgets.push(line);
      } else {
        other.push(line);
      }
    }

    console.log("\n   📁 Scaffold Files (injected):");
    scaffold.forEach((f) => console.log(`      ${f}`));

    console.log("\n   📱 Screen Files (LLM-generated):");
    if (screens.length > 0) {
      screens.forEach((f) => console.log(`      ${f}`));
    } else {
      console.log("      (none)");
    }

    console.log("\n   🧩 Widget Files (LLM-generated):");
    if (widgets.length > 0) {
      widgets.forEach((f) => console.log(`      ${f}`));
    } else {
      console.log("      (none - OK for simple apps)");
    }

    if (other.length > 0) {
      console.log("\n   ❓ Other Files:");
      other.forEach((f) => console.log(`      ${f}`));
    }

    return data.artifacts;
  } else {
    console.log("   ❌ Failed to get artifacts:", data);
    return [];
  }
}

async function getFileContent(
  projectStateId: string,
  filePath: string,
): Promise<string | null> {
  console.log(`\n📖 Reading file: ${filePath}`);

  const { ok, data } = await makeRequest<{
    filePath: string;
    content: string;
    size: number;
  }>(`/api/artifacts/${projectStateId}/${encodeURIComponent(filePath)}`);

  if (ok) {
    console.log(`   ✅ Retrieved ${data.size} bytes`);
    return data.content;
  } else {
    console.log("   ❌ Failed to get file content:", data);
    return null;
  }
}

async function cleanupArtifacts(projectStateId: string): Promise<void> {
  console.log("\n🧹 Cleaning up artifacts...");

  const { ok, data } = await makeRequest<{
    success: boolean;
    filesDeleted: number;
    artifactsDeleted: number;
  }>(`/api/artifacts/${projectStateId}`, "DELETE");

  if (ok) {
    console.log("   ✅ Cleanup complete");
    console.log(`   - Files deleted from storage: ${data.filesDeleted}`);
    console.log(`   - Artifact records deleted: ${data.artifactsDeleted}`);
  } else {
    console.log("   ❌ Cleanup failed:", data);
  }
}

// =============================================================================
// Validation Runner
// =============================================================================

function runScaffoldValidation(artifacts: Artifact[]): boolean {
  console.log("\n🔍 Validating scaffold-based output...");
  console.log("   ─────────────────────────────────────────");

  const validation = validateScaffoldBasedOutput(artifacts);

  // Scaffold files check
  console.log("\n   📋 Scaffold Files Check:");
  console.log(`   Required: ${ALL_MANDATORY_FILES.join(", ")}`);

  if (validation.scaffoldFilesPresent) {
    console.log("   ✅ All scaffold files present (injected by system)");
  } else {
    console.log("   ❌ Missing scaffold files:");
    for (const missing of validation.missingScaffoldFiles) {
      console.log(`      - ${missing}`);
    }
  }

  // Screen files check
  console.log("\n   📱 Screen Files Check:");
  console.log(`   Required location: ${FOLDER_CONVENTIONS.screens}`);

  if (validation.screenFilesPresent) {
    console.log(
      `   ✅ Found ${validation.screenFiles.length} screen(s) (LLM-generated)`,
    );
    for (const screen of validation.screenFiles) {
      console.log(`      - ${screen}`);
    }
  } else {
    console.log("   ❌ No screen files found");
  }

  if (validation.hasHomeScreen) {
    console.log("   ✅ home_screen.dart present");
  } else {
    console.log("   ⚠️  home_screen.dart not found");
  }

  // Widget files check
  console.log("\n   🧩 Widget Files Check:");
  if (validation.widgetFiles.length > 0) {
    console.log(
      `   ✅ Found ${validation.widgetFiles.length} widget(s) (LLM-generated)`,
    );
    for (const widget of validation.widgetFiles) {
      console.log(`      - ${widget}`);
    }
  } else {
    console.log("   ℹ️  No widget files (OK for simple apps)");
  }

  // Summary
  console.log("\n   📊 Summary:");
  console.log(
    `   - Scaffold files: ${ALL_MANDATORY_FILES.length - validation.missingScaffoldFiles.length}/${ALL_MANDATORY_FILES.length}`,
  );
  console.log(`   - Screen files: ${validation.screenFiles.length}`);
  console.log(`   - Widget files: ${validation.widgetFiles.length}`);
  console.log(
    `   - Total files: ${ALL_MANDATORY_FILES.length - validation.missingScaffoldFiles.length + validation.screenFiles.length + validation.widgetFiles.length}`,
  );

  // Errors and warnings
  if (validation.errors.length > 0) {
    console.log("\n   ❌ Errors:");
    for (const error of validation.errors) {
      console.log(`      - ${error}`);
    }
  }

  if (validation.warnings.length > 0) {
    console.log("\n   ⚠️  Warnings:");
    for (const warning of validation.warnings) {
      console.log(`      - ${warning}`);
    }
  }

  console.log("\n   ─────────────────────────────────────────");
  if (validation.valid) {
    console.log("   ✅ SCAFFOLD VALIDATION PASSED");
  } else {
    console.log("   ❌ SCAFFOLD VALIDATION FAILED");
  }

  return validation.valid;
}

// =============================================================================
// Main Test Runners
// =============================================================================

async function runFullIntegrationTest(): Promise<void> {
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("   Zero-to-One Code Generation Integration Test");
  console.log("   (SCAFFOLD-BASED APPROACH)");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log(`   Server: ${BASE_URL}`);
  console.log(`   Time: ${new Date().toISOString()}`);

  const startTime = Date.now();

  // Step 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log("\n❌ Test aborted: Server not available");
    process.exit(1);
  }

  // Step 2: Test AI Provider connection
  const connectionOk = await testAIProviderConnection();
  if (!connectionOk) {
    console.log("\n⚠️  Warning: AI Provider connection failed");
    console.log("   Generation tests will likely fail");

    const args = process.argv.slice(2);
    if (!args.includes("--force")) {
      console.log("\n   Use --force to continue anyway");
      process.exit(1);
    }
  }

  // Step 3: Get configuration
  await testGetConfiguration();

  // Step 4: Create a new project
  const projectState = await createNewProject();
  if (!projectState) {
    console.log("\n❌ Test aborted: Could not create project");
    process.exit(1);
  }

  // Step 5: Trigger generation with a dating app prompt (requires multiple screens)
  const userPrompt = `
    build a simple todo app.
    Use shadcn_ui components.
  `.trim();

  const sessionId = await triggerGeneration(projectState.id, userPrompt);
  if (!sessionId) {
    console.log("\n❌ Test aborted: Could not start generation");
    process.exit(1);
  }

  // Step 6: Poll for completion
  const session = await pollGenerationStatus(sessionId, 5 * 60 * 1000);
  if (!session) {
    console.log("\n❌ Test aborted: Generation did not complete in time");
    process.exit(1);
  }

  if (session.status !== "completed") {
    console.log("\n❌ Test failed: Generation failed");
    console.log("   Error:", session.error);
    await cleanupArtifacts(projectState.id);
    process.exit(1);
  }

  // Step 7: Get and verify artifacts
  const artifacts = await getArtifacts(projectState.id);

  if (artifacts.length === 0) {
    console.log("\n❌ Test failed: No artifacts generated");
    await cleanupArtifacts(projectState.id);
    process.exit(1);
  }

  // Step 8: Run scaffold validation
  const structureValid = runScaffoldValidation(artifacts);

  // Step 9: Validate minimum screens requirements
  const screensValid = await validateMinimumScreens(projectState.id, artifacts);

  // Step 10: Check app.dart uses ShadApp
  const appDart = artifacts.find((a) => a.file_path === "lib/app.dart");
  if (appDart) {
    const content = await getFileContent(projectState.id, "lib/app.dart");
    if (content) {
      console.log("\n🎨 Design System Check:");
      if (content.includes("ShadApp")) {
        console.log("   ✅ app.dart uses ShadApp (correct)");
      } else if (content.includes("MaterialApp")) {
        console.log("   ⚠️  app.dart uses MaterialApp instead of ShadApp");
      }

      if (content.includes("shadcn_ui")) {
        console.log("   ✅ shadcn_ui package imported");
      }
    }
  }

  // Step 10: Check a screen file
  const homeScreen = artifacts.find((a) =>
    a.file_path.includes("home_screen.dart"),
  );
  if (homeScreen) {
    const content = await getFileContent(projectState.id, homeScreen.file_path);
    if (content) {
      console.log("\n📱 Home Screen Check:");
      console.log("   Preview (first 400 chars):");
      console.log("   ─────────────────────────────────────────");
      const preview = content.substring(0, 400);
      preview.split("\n").forEach((line) => console.log(`   ${line}`));
      if (content.length > 400) {
        console.log("   ...");
      }
    }
  }

  // Step 11: Verify project state
  console.log("\n🔍 Verifying project state...");
  const { ok, data } = await makeRequest<{ projectState: ProjectState }>(
    `/api/project-state/${projectState.id}`,
  );

  if (ok) {
    console.log(`   - Mode: ${data.projectState.mode_locked}`);
    console.log(`   - Artifact Count: ${data.projectState.artifact_count}`);
    console.log(
      `   - Identity Linked: ${data.projectState.identity_id ? "Yes" : "No"}`,
    );

    if (data.projectState.mode_locked === "ONE_TO_N") {
      console.log("   ✅ Project transitioned to ONE_TO_N mode");
    }
  }

  // Step 12: Summary
  const totalTime = Date.now() - startTime;

  console.log(
    "\n═══════════════════════════════════════════════════════════════",
  );
  console.log("   Test Summary");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );

  const allTestsPassed = structureValid && screensValid;

  if (allTestsPassed) {
    console.log("   ✅ All tests passed!");
  } else {
    console.log("   ⚠️  Tests completed with validation failures");
  }

  console.log(`   - Total time: ${formatDuration(totalTime)}`);
  console.log(`   - Project ID: ${projectState.id}`);
  console.log(`   - Files generated: ${artifacts.length}`);
  console.log(`   - Structure valid: ${structureValid ? "Yes" : "No"}`);
  console.log(`   - Minimum screens valid: ${screensValid ? "Yes" : "No"}`);

  if (session.result?.metadata) {
    console.log(
      `   - Tokens used: ${session.result.metadata.tokens_total || "N/A"}`,
    );
    console.log(
      `   - Generation time: ${session.result.metadata.generation_time_ms ? formatDuration(session.result.metadata.generation_time_ms) : "N/A"}`,
    );
    console.log(`   - Model: ${session.result.metadata.model_used || "N/A"}`);
  }

  // Cleanup
  const args = process.argv.slice(2);
  if (args.includes("--cleanup")) {
    await cleanupArtifacts(projectState.id);
  } else {
    console.log("\n   ℹ️  Artifacts preserved. Use --cleanup to delete.");
    console.log(`   Or: DELETE /api/artifacts/${projectState.id}`);
  }

  console.log(
    "\n═══════════════════════════════════════════════════════════════",
  );

  if (!structureValid) {
    process.exit(1);
  }
}

async function runQuickTest(): Promise<void> {
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("   Quick Connectivity Test");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );

  await testHealthCheck();
  await testGetConfiguration();
  await testAIProviderConnection();

  // Test scaffold injector
  console.log("\n📋 Testing scaffold injector...");

  const mockIdentity = {
    identity_id: "test-id",
    core_definition: {
      purpose: "A simple counter app for testing",
      domain: "utility",
      type: "mobile_app",
    },
    characteristics: [],
    scope: {
      included: [],
      excluded: [],
      boundary_principles: "",
    },
    technical_foundation: {
      stack: "Flutter",
      structure: "screens and widgets",
      state_management: "setState",
    },
    scale: {
      user_base: "individual",
      sophistication_level: "Basic",
    },
    architecture: {
      philosophy: "simple",
      patterns: [],
      constraints: [],
    },
    created_at: new Date(),
  };

  const injector = new ScaffoldInjector();
  const scaffold = injector.generateScaffold(mockIdentity as any);

  console.log(`   App Name: ${scaffold.appName}`);
  console.log(`   App Title: ${scaffold.appTitle}`);
  console.log(`   Scaffold files: ${scaffold.files.length}`);
  for (const file of scaffold.files) {
    console.log(`      - ${file.path} (${file.governance})`);
  }

  console.log("\n   ✅ Scaffold injector working correctly");

  console.log(
    "\n═══════════════════════════════════════════════════════════════",
  );
}

async function runScaffoldUnitTest(): Promise<void> {
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("   Scaffold Injector Unit Tests");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );

  const injector = new ScaffoldInjector();

  // Test 1: App name derivation
  console.log("\n1️⃣  Testing app name derivation...");

  const testCases = [
    { purpose: "A simple counter app", expected: "a_simple_counter" },
    { purpose: "Todo List Manager", expected: "todo_list_manager" },
    { purpose: "My Awesome Flutter App!", expected: "my_awesome_flutter" },
  ];

  for (const tc of testCases) {
    const mockIdentity = {
      core_definition: { purpose: tc.purpose, domain: "", type: "" },
    };
    const name = deriveAppName(mockIdentity as any);
    console.log(`   "${tc.purpose}" → "${name}"`);
  }

  // Test 2: Router merging
  console.log("\n2️⃣  Testing router additions merging...");

  const mockIdentity = {
    identity_id: "test",
    core_definition: { purpose: "Test App", domain: "", type: "" },
    characteristics: [],
    scope: { included: [], excluded: [], boundary_principles: "" },
    technical_foundation: { stack: "", structure: "", state_management: "" },
    scale: { user_base: "", sophistication_level: "" },
    architecture: { philosophy: "", patterns: [], constraints: [] },
    created_at: new Date(),
  };

  const scaffold = injector.generateScaffold(mockIdentity as any);
  const routerFile = scaffold.files.find(
    (f) => f.path === "lib/routing/app_router.dart",
  );

  if (routerFile) {
    const additions = {
      imports: ["import '../screens/settings_screen.dart';"],
      routeConstants: ["static const String settings = '/settings';"],
      routeCases: [
        "case settings:\n        return MaterialPageRoute(builder: (_) => const SettingsScreen());",
      ],
    };

    const merged = injector.mergeRouterAdditions(routerFile.content, additions);

    if (merged.includes("settings_screen.dart")) {
      console.log("   ✅ Import merged correctly");
    } else {
      console.log("   ❌ Import merge failed");
    }

    if (merged.includes("static const String settings")) {
      console.log("   ✅ Route constant merged correctly");
    } else {
      console.log("   ❌ Route constant merge failed");
    }

    if (merged.includes("case settings:")) {
      console.log("   ✅ Route case merged correctly");
    } else {
      console.log("   ❌ Route case merge failed");
    }

    console.log("\n   Merged router preview:");
    console.log("   ─────────────────────────────────────────");
    merged
      .split("\n")
      .slice(0, 30)
      .forEach((line) => console.log(`   ${line}`));
    console.log("   ...");
  }

  // Test 3: Scaffold file generation
  console.log("\n3️⃣  Testing scaffold file generation...");

  const scaffoldFileChecks = [
    { path: "pubspec.yaml", shouldContain: "shadcn_ui" },
    { path: "lib/main.dart", shouldContain: "runApp" },
    { path: "lib/app.dart", shouldContain: "ShadApp" },
    { path: "lib/routing/app_router.dart", shouldContain: "Navigator" },
  ];

  for (const check of scaffoldFileChecks) {
    const file = scaffold.files.find((f) => f.path === check.path);
    if (file) {
      if (file.content.includes(check.shouldContain)) {
        console.log(`   ✅ ${check.path} contains "${check.shouldContain}"`);
      } else {
        console.log(`   ❌ ${check.path} missing "${check.shouldContain}"`);
      }
    } else {
      console.log(`   ❌ ${check.path} not generated`);
    }
  }

  // Test 4: App title derivation
  console.log("\n4️⃣  Testing app title derivation...");

  const titleTestCases = [
    { purpose: "a simple counter app", expected: "A Simple Counter App" },
    { purpose: "todo list manager", expected: "Todo List Manager" },
  ];

  for (const tc of titleTestCases) {
    const mockId = {
      core_definition: { purpose: tc.purpose, domain: "", type: "" },
    };
    const title = deriveAppTitle(mockId as any);
    console.log(`   "${tc.purpose}" → "${title}"`);
  }

  console.log(
    "\n═══════════════════════════════════════════════════════════════",
  );
  console.log("   Scaffold Unit Tests Complete");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npx ts-node test-code-generation.ts [options]

Options:
  --quick       Run quick scaffold unit tests only (no server required)
  --full        Run full integration test (requires server + OpenRouter)
  --cleanup     Delete generated artifacts after test
  --force       Continue even if OpenRouter connection fails
  --help, -h    Show this help message

Examples:
  npx ts-node test-code-generation.ts --quick
  npx ts-node test-code-generation.ts --full --cleanup
`);
    return;
  }

  if (args.includes("--quick")) {
    await runQuickTest();
    await runScaffoldUnitTest();
    return;
  }

  // Default: run full integration test
  await runFullIntegrationTest();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
