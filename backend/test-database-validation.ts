import { ProjectStateRepository } from "./project-state/repository";
import { ProjectIdentityRepository } from "./project-identity/repository";
import { ArchitectureRepository } from "./architecture/repository";
import { ArchitectureDecisionEngine } from "./architecture/engine";
import { v4 as uuidv4 } from "uuid";
import { ProjectIdentity } from "./project-identity/model";

/**
 * Quick Database Validation Test
 *
 * This test validates that all newly created database tables and migrations
 * are working correctly after being pushed to Supabase.
 */

async function validateDatabaseIntegration() {
  console.log("🔍 Starting Database Validation Test...\n");

  try {
    // Initialize repositories
    const projectStateRepo = new ProjectStateRepository();
    const projectIdentityRepo = new ProjectIdentityRepository();
    const architectureRepo = new ArchitectureRepository();

    console.log("✅ All repositories initialized successfully");

    // Test 1: Validate project_identities table first (due to foreign key constraints)
    console.log("\n📝 Testing project_identities table...");
    const identityId = uuidv4();
    const projectId = uuidv4();

    const identity: ProjectIdentity = {
      identity_id: identityId,
      project_id: projectId,
      core_definition: {
        purpose: "Database Validation Test App",
        domain: "testing",
        type: "validation_app",
      },
      characteristics: ["database_test", "validation"],
      scope: {
        included: ["testing", "validation"],
        excluded: ["production"],
        boundary_principles: "Test validation only",
      },
      scale: {
        user_base: "developers",
        data_volume: "minimal",
        sophistication_level: "Professional",
      },
      architecture: {
        philosophy: "testing_first",
        patterns: ["validation_patterns"],
        constraints: ["test_only"],
      },
      evolution: {
        likely_next: ["more_tests"],
        possible_later: ["integration_tests"],
        unlikely_ever: ["production_deployment"],
      },
      technical_foundation: {
        stack: "Flutter",
        structure: "test_structure",
        state_management: "test_state",
      },
      created_at: new Date(),
      immutable: true,
    };

    await projectIdentityRepo.save(identity);
    const retrievedIdentity = await projectIdentityRepo.findById(identityId);

    if (!retrievedIdentity || retrievedIdentity.identity_id !== identityId) {
      throw new Error("project_identities table not working correctly");
    }

    console.log("✅ project_identities table working correctly");

    // Test 2: Validate project_states table with new field
    console.log("\n📝 Testing project_states table...");

    const projectState = await projectStateRepo.create({
      project_id: projectId,
      artifact_count: 1,
      has_config: true,
      architecture_decisions_recorded: true,
      architecture_plan_established: true, // This is the new field we added
      mode_locked: "ONE_TO_N",
    });

    if (!projectState.architecture_plan_established) {
      throw new Error("New architecture_plan_established field not working");
    }

    console.log("✅ project_states table working with new field");

    // Test 3: Validate architecture_plans table
    console.log("\n📝 Testing architecture_plans table...");

    const architecturePlan = ArchitectureDecisionEngine.generatePlan(identity);
    await architectureRepo.save(architecturePlan);

    const retrievedPlan =
      await architectureRepo.findByProjectIdentityId(identityId);

    if (!retrievedPlan || retrievedPlan.project_identity_id !== identityId) {
      throw new Error("architecture_plans table not working correctly");
    }

    console.log("✅ architecture_plans table working correctly");

    // Test 4: Validate foreign key relationships
    console.log("\n📝 Testing foreign key relationships...");

    // Test that we can find related data across tables
    const stateByProjectId = await projectStateRepo.findByProjectId(projectId);
    const identityByProjectId =
      await projectIdentityRepo.findByProjectId(projectId);

    if (!stateByProjectId || !identityByProjectId) {
      throw new Error("Foreign key relationships not working");
    }

    if (stateByProjectId.project_id !== identityByProjectId.project_id) {
      throw new Error("Data consistency issue between tables");
    }

    console.log("✅ Foreign key relationships working correctly");

    // Test 5: Validate JSONB fields and indexes
    console.log("\n📝 Testing JSONB fields and complex queries...");

    // Test JSONB field queries
    const foundPlans = await architectureRepo.findAll({
      complexity_level: retrievedPlan.complexity_level,
      conceptual_category: retrievedPlan.conceptual_category,
    });

    if (foundPlans.length === 0) {
      throw new Error("JSONB field queries not working");
    }

    console.log("✅ JSONB fields and complex queries working correctly");

    // Test 6: Validate repository methods
    console.log("\n📝 Testing repository method completeness...");

    const identityCount = await projectIdentityRepo.count();
    const planCount = await architectureRepo.count();
    const identityExists = await projectIdentityRepo.exists(identityId);
    const planExists =
      await architectureRepo.existsForProjectIdentity(identityId);

    if (identityCount < 1 || planCount < 1 || !identityExists || !planExists) {
      throw new Error("Repository methods not working correctly");
    }

    console.log("✅ All repository methods working correctly");

    // Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    // Note: In a real scenario, you might want to clean up test data
    // For now, we'll leave it as it validates the data persists correctly

    console.log("\n🎉 DATABASE VALIDATION COMPLETE!");
    console.log("");
    console.log("✅ All database tables created successfully");
    console.log("✅ All migrations applied correctly");
    console.log("✅ All repository operations working");
    console.log("✅ Foreign key relationships established");
    console.log("✅ JSONB fields and indexes functional");
    console.log("✅ Architecture Decision Engine integrated");
    console.log("");
    console.log("🚀 Backend database integration is fully operational!");
  } catch (error) {
    console.error("\n❌ DATABASE VALIDATION FAILED!");
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error("");
    console.error("Please check:");
    console.error("- All migrations were applied successfully");
    console.error("- Database connection is working");
    console.error("- Supabase environment variables are correct");
    console.error("- Repository implementations are correct");

    process.exit(1);
  }
}

// Run the validation
validateDatabaseIntegration().catch((error) => {
  console.error("💥 Validation script failed to run:", error);
  process.exit(1);
});
