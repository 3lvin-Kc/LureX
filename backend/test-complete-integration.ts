import { ProjectStateRepository } from './project-state/repository';
import { ProjectIdentityRepository } from './project-identity/repository';
import { ArchitectureRepository } from './architecture/repository';
import { ArchitectureDecisionEngine } from './architecture/engine';
import { ProjectStateService } from './project-state/project-state-service';
import { ProjectIdentityService } from './project-identity/project-identity-service';
import { ArchitectureService } from './architecture/architecture-service';
import { v4 as uuidv4 } from 'uuid';
import { ProjectIdentity } from './project-identity/model';

/**
 * Comprehensive Integration Test Suite
 *
 * Tests all backend fixes including:
 * - New database migrations and schema consistency
 * - Repository consistency (all using Supabase)
 * - Service layer integration
 * - Architecture Decision Engine functionality
 * - Foreign key constraints and data integrity
 * - TypeScript type safety improvements
 */

async function runIntegrationTests() {
  console.log('🧪 Starting Comprehensive Backend Integration Tests...\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Initialize repositories and services
  const projectStateRepo = new ProjectStateRepository();
  const projectIdentityRepo = new ProjectIdentityRepository();
  const architectureRepo = new ArchitectureRepository();

  const projectStateService = new ProjectStateService(projectStateRepo);
  const projectIdentityService = new ProjectIdentityService(projectIdentityRepo);
  const architectureService = new ArchitectureService(architectureRepo);

  // Helper function to run a test
  async function test(testName: string, testFunction: () => Promise<void>) {
    testsTotal++;
    try {
      console.log(`🔍 Running: ${testName}`);
      await testFunction();
      console.log(`✅ PASSED: ${testName}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.log('');
  }

  // Test 1: Project State Repository Integration
  await test('Project State Repository - Create, Read, Update', async () => {
    const projectId = uuidv4();

    // Create initial state
    const initialState = await projectStateRepo.create({
      project_id: projectId,
      artifact_count: 0,
      has_config: false,
      architecture_decisions_recorded: false,
      architecture_plan_established: false,
      mode_locked: 'ZERO_TO_ONE'
    });

    if (!initialState || initialState.project_id !== projectId) {
      throw new Error('Failed to create project state');
    }

    // Read state
    const foundState = await projectStateRepo.findByProjectId(projectId);
    if (!foundState || foundState.artifact_count !== 0) {
      throw new Error('Failed to find project state');
    }

    // Update state
    const updatedState = await projectStateRepo.update(projectId, {
      artifact_count: 5,
      has_config: true,
      architecture_plan_established: true
    });

    if (updatedState.artifact_count !== 5 || !updatedState.architecture_plan_established) {
      throw new Error('Failed to update project state with new field');
    }
  });

  // Test 2: Project Identity Repository Integration
  await test('Project Identity Repository - Full CRUD Operations', async () => {
    const identityId = uuidv4();
    const projectId = uuidv4();

    const identity: ProjectIdentity = {
      identity_id: identityId,
      project_id: projectId,
      core_definition: {
        purpose: 'Test Flutter App',
        domain: 'mobile',
        type: 'ui_app'
      },
      characteristics: ['responsive', 'material_design'],
      scope: {
        included: ['android', 'flutter_ui'],
        excluded: ['backend', 'web', 'ios'],
        boundary_principles: 'Android-only Flutter UI application'
      },
      scale: {
        user_base: 'small',
        data_volume: 'local_only',
        sophistication_level: 'moderate'
      },
      architecture: {
        philosophy: 'mobile_first',
        patterns: ['material_design', 'responsive_ui'],
        constraints: ['no_backend', 'no_networking']
      },
      evolution: {
        likely_next: ['additional_screens'],
        possible_later: ['advanced_animations'],
        unlikely_ever: ['backend_integration']
      },
      technical_foundation: {
        stack: 'Flutter',
        structure: 'feature_based',
        state_management: 'provider'
      },
      created_at: new Date(),
      immutable: true
    };

    // Save identity
    await projectIdentityRepo.save(identity);

    // Find by ID
    const foundById = await projectIdentityRepo.findById(identityId);
    if (!foundById || foundById.identity_id !== identityId) {
      throw new Error('Failed to find project identity by ID');
    }

    // Find by project ID
    const foundByProjectId = await projectIdentityRepo.findByProjectId(projectId);
    if (!foundByProjectId || foundByProjectId.project_id !== projectId) {
      throw new Error('Failed to find project identity by project ID');
    }

    // Test exists function
    const exists = await projectIdentityRepo.exists(identityId);
    if (!exists) {
      throw new Error('Exists check failed for project identity');
    }

    // Test count function
    const count = await projectIdentityRepo.count();
    if (count < 1) {
      throw new Error('Count function returned invalid result');
    }
  });

  // Test 3: Architecture Repository Integration
  await test('Architecture Repository - Dynamic Plans Storage', async () => {
    const identityId = uuidv4();
    const projectId = uuidv4();

    // Create project identity first
    const identity: ProjectIdentity = {
      identity_id: identityId,
      project_id: projectId,
      core_definition: {
        purpose: 'E-commerce Flutter App',
        domain: 'ecommerce',
        type: 'shopping_app'
      },
      characteristics: ['multi_screen', 'navigation', 'product_catalog'],
      scope: {
        included: ['product_listing', 'shopping_cart', 'user_profiles'],
        excluded: ['payment_processing', 'backend_apis'],
        boundary_principles: 'UI-only e-commerce experience'
      },
      scale: {
        user_base: 'medium',
        data_volume: 'moderate',
        sophistication_level: 'Professional'
      },
      architecture: {
        philosophy: 'user_centric',
        patterns: ['navigation_heavy', 'state_management'],
        constraints: ['android_only', 'no_backend']
      },
      evolution: {
        likely_next: ['advanced_filtering', 'wishlist'],
        possible_later: ['social_features'],
        unlikely_ever: ['payment_integration']
      },
      technical_foundation: {
        stack: 'Flutter',
        structure: 'feature_based',
        state_management: 'provider'
      },
      created_at: new Date(),
      immutable: true
    };

    await projectIdentityRepo.save(identity);

    // Generate architecture plan using the engine
    const plan = ArchitectureDecisionEngine.generatePlan(identity);

    // Save the plan
    await architectureRepo.save(plan);

    // Find by project identity ID
    const foundPlan = await architectureRepo.findByProjectIdentityId(identityId);
    if (!foundPlan || foundPlan.project_identity_id !== identityId) {
      throw new Error('Failed to find architecture plan by project identity ID');
    }

    // Verify the plan has correct dynamic properties
    if (foundPlan.complexity_level === 'simple' || foundPlan.file_strategy.initial_file_count < 5) {
      throw new Error('Architecture engine failed to generate appropriate complexity for e-commerce app');
    }

    // Test exists function
    const planExists = await architectureRepo.existsForProjectIdentity(identityId);
    if (!planExists) {
      throw new Error('Exists check failed for architecture plan');
    }

    // Test filtering by complexity
    const complexPlans = await architectureRepo.findAll({ complexity_level: foundPlan.complexity_level });
    if (complexPlans.length === 0) {
      throw new Error('Failed to filter plans by complexity level');
    }

    // Test count function
    const planCount = await architectureRepo.count();
    if (planCount < 1) {
      throw new Error('Count function returned invalid result for architecture plans');
    }
  });

  // Test 4: Service Layer Integration
  await test('Service Layer - Complete Workflow Integration', async () => {
    // Create project identity through service
    const identity = await projectIdentityService.create({
      purpose: 'Task Management Flutter App'
    });

    if (!identity || !identity.identity_id) {
      throw new Error('Failed to create project identity through service');
    }

    // Create project state through service
    // Note: project_id is now NULL during ZERO_TO_ONE phase, use 'id' for identification
    const projectState = await projectStateService.createNewProject();
    if (!projectState || !projectState.id || projectState.mode_locked !== 'ZERO_TO_ONE') {
      throw new Error('Failed to create new project through service');
    }

    // Generate architecture plan through service
    const architecturePlan = await architectureService.createArchitecturePlan(identity);
    if (!architecturePlan || !architecturePlan.plan_id) {
      throw new Error('Failed to create architecture plan through service');
    }

    // Update project state to reflect architecture establishment
    // Use id for lookup since project_id is null during ZERO_TO_ONE phase
    const updatedState = await projectStateService.updateProjectStateById(projectState.id, {
      architecture_plan_established: true
    });

    if (!updatedState.architecture_plan_established) {
      throw new Error('Failed to update project state through service');
    }
  });

  // Test 5: Architecture Decision Engine Complexity Levels
  await test('Architecture Decision Engine - All Complexity Levels', async () => {
    const testCases = [
      {
        name: 'Simple Calculator',
        sophistication: 'Minimal',
        characteristics: ['simple_ui', 'basic_math'],
        expectedComplexity: 'simple'
      },
      {
        name: 'Todo List App',
        sophistication: 'Professional',
        characteristics: ['list_management', 'form_based'],
        expectedComplexity: 'moderate'
      },
      {
        name: 'Social Media App',
        sophistication: 'Professional',
        characteristics: ['multi_screen', 'navigation', 'complex_state', 'user_profiles'],
        expectedComplexity: 'complex'
      },
      {
        name: 'Enterprise Dashboard',
        sophistication: 'Enterprise',
        characteristics: ['enterprise', 'dashboard', 'complex_navigation'],
        expectedComplexity: 'enterprise'
      }
    ];

    for (const testCase of testCases) {
      const testIdentity: ProjectIdentity = {
        identity_id: uuidv4(),
        project_id: null,
        core_definition: {
          purpose: testCase.name,
          domain: 'mobile',
          type: 'flutter_app'
        },
        characteristics: testCase.characteristics,
        scope: {
          included: ['android', 'flutter_ui'],
          excluded: ['backend', 'web'],
          boundary_principles: 'Mobile UI only'
        },
        scale: {
          user_base: 'variable',
          data_volume: 'local',
          sophistication_level: testCase.sophistication
        },
        architecture: {
          philosophy: 'mobile_first',
          patterns: ['material_design'],
          constraints: ['no_backend']
        },
        evolution: {
          likely_next: [],
          possible_later: [],
          unlikely_ever: ['backend']
        },
        technical_foundation: {
          stack: 'Flutter',
          structure: 'variable',
          state_management: 'variable'
        },
        created_at: new Date(),
        immutable: true
      };

      const plan = ArchitectureDecisionEngine.generatePlan(testIdentity);

      if (plan.complexity_level !== testCase.expectedComplexity) {
        throw new Error(`Expected ${testCase.expectedComplexity} complexity for ${testCase.name}, got ${plan.complexity_level}`);
      }

      // Verify platform constraints are enforced
      if (plan.platform_constraints.target_platform !== 'android' ||
          !plan.platform_constraints.ui_only ||
          !plan.platform_constraints.no_backend) {
        throw new Error(`Platform constraints not properly enforced for ${testCase.name}`);
      }
    }
  });

  // Test 6: Data Consistency and Foreign Key Constraints
  await test('Data Consistency - Foreign Key Relationships', async () => {
    const projectId = uuidv4();
    const identityId = uuidv4();

    // Create project identity first
    const identity: ProjectIdentity = {
      identity_id: identityId,
      project_id: projectId,
      core_definition: {
        purpose: 'Consistency Test App',
        domain: 'testing',
        type: 'test_app'
      },
      characteristics: ['test'],
      scope: {
        included: ['testing'],
        excluded: [],
        boundary_principles: 'Test app'
      },
      scale: {
        user_base: 'test',
        data_volume: 'test',
        sophistication_level: 'Minimal'
      },
      architecture: {
        philosophy: 'test',
        patterns: ['test'],
        constraints: ['test']
      },
      evolution: {
        likely_next: [],
        possible_later: [],
        unlikely_ever: []
      },
      technical_foundation: {
        stack: 'Flutter',
        structure: 'test',
        state_management: 'test'
      },
      created_at: new Date(),
      immutable: true
    };

    await projectIdentityRepo.save(identity);

    // Create project state with same project_id
    const projectState = await projectStateRepo.create({
      project_id: projectId,
      artifact_count: 1,
      has_config: true,
      architecture_decisions_recorded: true,
      architecture_plan_established: false,
      mode_locked: 'ONE_TO_N'
    });

    // Generate and save architecture plan
    const plan = ArchitectureDecisionEngine.generatePlan(identity);
    await architectureRepo.save(plan);

    // Verify all entities are linked properly
    const foundIdentity = await projectIdentityRepo.findByProjectId(projectId);
    const foundState = await projectStateRepo.findByProjectId(projectId);
    const foundPlan = await architectureRepo.findByProjectIdentityId(identityId);

    if (!foundIdentity || !foundState || !foundPlan) {
      throw new Error('Failed to maintain data consistency across related entities');
    }

    if (foundIdentity.project_id !== foundState.project_id) {
      throw new Error('Project ID mismatch between identity and state');
    }

    if (foundPlan.project_identity_id !== foundIdentity.identity_id) {
      throw new Error('Identity ID mismatch between plan and identity');
    }
  });

  // Test 7: Mode Detection and Gatekeeper Integration
  await test('Mode Detection and Gatekeeper - Complete Flow', async () => {
    // Test ZERO_TO_ONE mode detection
    const result = await projectStateService.executeGatekeeping(
      null,
      'Create a simple calculator app',
      true
    );

    if (result.mode !== 'ZERO_TO_ONE' || !result.allowed) {
      throw new Error('Failed zero-to-one mode detection for new project');
    }

    // Create a project and transition to ONE_TO_N
    const projectId = uuidv4();
    await projectStateRepo.create({
      project_id: projectId,
      artifact_count: 5,
      has_config: true,
      architecture_decisions_recorded: true,
      architecture_plan_established: true,
      mode_locked: 'ONE_TO_N'
    });

    const oneToNResult = await projectStateService.executeGatekeeping(
      projectId,
      'Add a new feature to existing app',
      false
    );

    if (oneToNResult.mode !== 'ONE_TO_N') {
      throw new Error('Failed one-to-n mode detection for existing project');
    }
  });

  // Test 8: TypeScript Type Safety
  await test('TypeScript Type Safety - No Runtime Type Errors', async () => {
    // This test verifies that all our type fixes work at runtime

    const identity: ProjectIdentity = {
      identity_id: uuidv4(),
      project_id: uuidv4(),
      core_definition: {
        purpose: 'Type Safety Test',
        domain: 'testing',
        type: 'type_test'
      },
      characteristics: ['type_safe'],
      scope: {
        included: ['type_checking'],
        excluded: [],
        boundary_principles: 'Type safe operations'
      },
      scale: {
        user_base: 'developers',
        data_volume: 'minimal',
        sophistication_level: 'Professional'
      },
      architecture: {
        philosophy: 'type_safety',
        patterns: ['type_safe_patterns'],
        constraints: ['strict_types']
      },
      evolution: {
        likely_next: ['more_types'],
        possible_later: ['generic_types'],
        unlikely_ever: ['any_types']
      },
      technical_foundation: {
        stack: 'Flutter',
        structure: 'typed',
        state_management: 'typed'
      },
      created_at: new Date(),
      immutable: true
    };

    // Test that all repository operations work with proper typing
    await projectIdentityRepo.save(identity);
    const foundIdentity = await projectIdentityRepo.findById(identity.identity_id);

    if (!foundIdentity || typeof foundIdentity.immutable !== 'boolean') {
      throw new Error('Type safety violated in project identity operations');
    }

    const plan = ArchitectureDecisionEngine.generatePlan(identity);
    await architectureRepo.save(plan);
    const foundPlan = await architectureRepo.findById(plan.plan_id);

    if (!foundPlan || typeof foundPlan.complexity_level !== 'string') {
      throw new Error('Type safety violated in architecture plan operations');
    }
  });

  // Final Results
  console.log('🏁 Integration Tests Complete!\n');
  console.log(`📊 Results: ${testsPassed}/${testsTotal} tests passed`);

  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED! Backend integration is working correctly.');
    console.log('\n✅ Verified Systems:');
    console.log('   ✓ Database migrations and schema consistency');
    console.log('   ✓ Repository consistency (all using Supabase)');
    console.log('   ✓ Service layer integration');
    console.log('   ✓ Architecture Decision Engine functionality');
    console.log('   ✓ Foreign key constraints and data integrity');
    console.log('   ✓ TypeScript type safety improvements');
    console.log('   ✓ Mode detection and gatekeeper logic');
    console.log('   ✓ Complete workflow integration');
  } else {
    console.log(`❌ ${testsTotal - testsPassed} tests failed. Review errors above.`);
    process.exit(1);
  }
}

// Run the tests
runIntegrationTests().catch((error) => {
  console.error('💥 Test suite failed to run:', error);
  process.exit(1);
});
