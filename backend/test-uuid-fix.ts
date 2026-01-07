import { ProjectStateService } from './project-state/project-state-service';
import { ProjectStateRepository } from './project-state/repository';
import { ModeGatekeeper } from './project-state/mode-gatekeeper';
import { ModeTransitionManager } from './project-state/mode-transition-manager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simple test to validate UUID generation fix
 * This test runs without needing the server to be active
 */

async function testUuidGeneration() {
  console.log('🧪 Testing UUID Generation Fix...\n');

  try {
    // Test 1: Validate uuidv4 is working properly
    console.log('📝 Testing UUID v4 generation...');
    const testUuid = uuidv4();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(testUuid)) {
      throw new Error(`Invalid UUID format generated: ${testUuid}`);
    }
    console.log(`✅ UUID v4 working correctly: ${testUuid}`);

    // Test 2: Test ProjectStateService createNewProject method
    console.log('\n📝 Testing ProjectStateService.createNewProject...');
    const repository = new ProjectStateRepository();
    const service = new ProjectStateService(repository);

    // Mock the repository.create method to avoid database calls
    const originalCreate = repository.create.bind(repository);
    let capturedProjectState: any = null;

    repository.create = async (state: any) => {
      capturedProjectState = state;
      // Simulate successful creation by returning the state with some modifications
      return {
        ...state,
        created_at: new Date(),
        updated_at: new Date(),
      };
    };

    const newProject = await service.createNewProject();

    if (!capturedProjectState || !capturedProjectState.project_id) {
      throw new Error('createNewProject did not generate a project_id');
    }

    if (!uuidRegex.test(capturedProjectState.project_id)) {
      throw new Error(`Invalid UUID format in createNewProject: ${capturedProjectState.project_id}`);
    }

    console.log(`✅ ProjectStateService generating proper UUIDs: ${capturedProjectState.project_id}`);

    // Test 3: Test ModeGatekeeper createNewProjectForZeroToOne method
    console.log('\n📝 Testing ModeGatekeeper.createNewProjectForZeroToOne...');
    const transitionManager = new ModeTransitionManager(repository);
    const gatekeeper = new ModeGatekeeper(repository, transitionManager);

    let capturedGatekeeperState: any = null;
    repository.create = async (state: any) => {
      capturedGatekeeperState = state;
      return {
        ...state,
        created_at: new Date(),
        updated_at: new Date(),
      };
    };

    const newZeroToOneProject = await gatekeeper.createNewProjectForZeroToOne();

    if (!capturedGatekeeperState || !capturedGatekeeperState.project_id) {
      throw new Error('createNewProjectForZeroToOne did not generate a project_id');
    }

    if (!uuidRegex.test(capturedGatekeeperState.project_id)) {
      throw new Error(`Invalid UUID format in createNewProjectForZeroToOne: ${capturedGatekeeperState.project_id}`);
    }

    console.log(`✅ ModeGatekeeper generating proper UUIDs: ${capturedGatekeeperState.project_id}`);

    // Test 4: Validate that different calls generate different UUIDs
    console.log('\n📝 Testing UUID uniqueness...');
    const uuid1 = uuidv4();
    const uuid2 = uuidv4();
    const uuid3 = uuidv4();

    if (uuid1 === uuid2 || uuid1 === uuid3 || uuid2 === uuid3) {
      throw new Error('UUIDs are not unique!');
    }

    console.log(`✅ UUIDs are unique: ${uuid1}, ${uuid2}, ${uuid3}`);

    // Restore original method
    repository.create = originalCreate;

    console.log('\n🎉 UUID GENERATION FIX VALIDATED!');
    console.log('');
    console.log('✅ UUID v4 generation working correctly');
    console.log('✅ ProjectStateService using proper UUIDs');
    console.log('✅ ModeGatekeeper using proper UUIDs');
    console.log('✅ UUIDs are unique across calls');
    console.log('');
    console.log('🚀 The server should now work without UUID errors!');

  } catch (error) {
    console.error('\n❌ UUID GENERATION TEST FAILED!');
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error('');
    console.error('The UUID fix may not be working correctly.');
    console.error('Please check the service implementations.');
    process.exit(1);
  }
}

// Run the test
testUuidGeneration().catch((error) => {
  console.error('💥 Test failed to run:', error);
  process.exit(1);
});
