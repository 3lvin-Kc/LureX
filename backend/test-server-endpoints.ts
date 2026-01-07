import { v4 as uuidv4 } from "uuid";

/**
 * Test script to validate server endpoints are working correctly
 * Tests the fixed UUID generation and database integration
 */

const API_BASE_URL = "http://localhost:3000/api";
const TEST_TOKEN = "test-token-123"; // Mock token for testing

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: unknown;
}

async function makeRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TEST_TOKEN}`,
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${data.error || "Unknown error"}`,
    );
  }

  return data;
}

async function testEndpoint(
  name: string,
  testFn: () => Promise<unknown>,
): Promise<TestResult> {
  try {
    console.log(`🔍 Testing: ${name}`);
    const data = await testFn();
    console.log(`✅ PASSED: ${name}`);
    return { name, success: true, data };
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(
      `   Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      name,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runServerTests() {
  console.log("🧪 Starting Server Endpoint Tests...\n");

  const results: TestResult[] = [];

  // Test 1: Health Check
  results.push(
    await testEndpoint("Health Check Endpoint", async () => {
      return await makeRequest("/health");
    }),
  );

  // Test 2: Get Project State (should create new project with proper UUID)
  results.push(
    await testEndpoint("Get Project State - Auto Create", async () => {
      const result = await makeRequest("/project-state");

      // Validate that project_id is a proper UUID
      if (result.projectState?.project_id) {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(result.projectState.project_id)) {
          throw new Error(
            `Invalid UUID format: ${result.projectState.project_id}`,
          );
        }
      }

      return result;
    }),
  );

  // Test 3: Create New Project
  results.push(
    await testEndpoint("Create New Project", async () => {
      const result = await makeRequest("/project-state/new", {
        method: "POST",
      });

      // Validate that id (database row UUID) is present and valid
      // Note: project_id is now NULL during ZERO_TO_ONE phase
      if (!result.projectState?.id) {
        throw new Error("Missing id field in project state response");
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(result.projectState.id)) {
        throw new Error(
          `Invalid UUID format for id: ${result.projectState.id}`,
        );
      }

      // project_id should be null during ZERO_TO_ONE phase
      if (result.projectState.project_id !== null) {
        console.warn(
          `Note: project_id is ${result.projectState.project_id}, expected null for new ZERO_TO_ONE project`,
        );
      }

      return result;
    }),
  );

  // Test 4: Get Specific Project State
  let testProjectId: string;
  results.push(
    await testEndpoint("Get Specific Project State", async () => {
      // First create a project to get its ID (database row id, not project_id)
      const createResult = await makeRequest("/project-state/new", {
        method: "POST",
      });
      // Use 'id' field since project_id is null during ZERO_TO_ONE phase
      testProjectId = createResult.projectState.id;

      // Then fetch it specifically using the database row id
      const result = await makeRequest(`/project-state/${testProjectId}`);

      if (result.projectState.id !== testProjectId) {
        throw new Error("Project state id mismatch");
      }

      return result;
    }),
  );

  // Test 5: Update Project State
  results.push(
    await testEndpoint("Update Project State", async () => {
      if (!testProjectId) {
        throw new Error("No test project ID available");
      }

      const updateData = {
        artifact_count: 5,
        has_config: true,
        architecture_decisions_recorded: true,
        architecture_plan_established: true,
      };

      const result = await makeRequest(`/project-state/${testProjectId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      // Validate the update was applied
      if (
        result.projectState.artifact_count !== 5 ||
        !result.projectState.architecture_plan_established
      ) {
        throw new Error("Update was not applied correctly");
      }

      return result;
    }),
  );

  // Test 6: Gatekeeping Logic
  results.push(
    await testEndpoint("Gatekeeping Logic", async () => {
      const gatekeepData = {
        projectId: testProjectId,
        userInput: "Create a simple Flutter app",
        isZeroToOneRequest: false,
      };

      const result = await makeRequest("/project-state/gatekeep", {
        method: "POST",
        body: JSON.stringify(gatekeepData),
      });

      // Validate response structure
      if (
        !result.mode ||
        !Object.prototype.hasOwnProperty.call(result, "allowed")
      ) {
        throw new Error("Invalid gatekeeping response structure");
      }

      return result;
    }),
  );

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log("========================");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    console.log(`${result.success ? "✅" : "❌"} ${result.name}`);
  });

  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("✅ Server is working correctly with proper UUID generation");
    console.log("✅ Database integration is functional");
    console.log("✅ All endpoints are operational");
  } else {
    console.log("\n❌ Some tests failed. Please check the errors above.");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️ Test interrupted by user");
  process.exit(0);
});

// Check if server is running before starting tests
fetch(`${API_BASE_URL}/health`)
  .then(() => {
    console.log("✅ Server is running, starting tests...\n");
    return runServerTests();
  })
  .catch(() => {
    console.error("❌ Server is not running!");
    console.error("Please start the server first: npx tsx server.ts");
    process.exit(1);
  });
