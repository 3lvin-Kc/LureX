import { ProjectStateService } from './project-state-service';

/**
 * Integration example showing how the Zero-to-One Mode Detection & Hard Boundary Layer works
 * This demonstrates the complete flow from request to pipeline routing
 */
export class ProjectStateIntegrationExample {
  private service: ProjectStateService;

  constructor() {
    this.service = new ProjectStateService();
  }

  /**
   * Example of handling a new project creation (Zero-to-One flow)
   */
  async handleNewProjectCreation(userId: string, userInput: string): Promise<void> {
    console.log('=== Starting New Project Creation (Zero-to-One Flow) ===');
    
    // Initially, there's no project ID
    const projectId = null;
    const isZeroToOneRequest = true;

    // Execute the gatekeeping logic
    const result = await this.service.executeGatekeeping(
      projectId,
      userInput,
      isZeroToOneRequest
    );

    console.log(`Project Mode: ${result.mode}`);
    console.log(`Request Allowed: ${result.allowed}`);
    
    if (result.allowed) {
      console.log('✓ Request passed gatekeeping - routing to Zero-to-One pipeline');
      
      // In a real implementation, this would call the actual Zero-to-One pipeline
      // For this example, we'll simulate creating the first artifact
      await this.simulateFirstArtifactCreation(userId);
      
      console.log('✓ First artifact created - mode should now be locked to ONE_TO_N');
    } else {
      console.log(`✗ Request blocked: ${result.reason}`);
    }
  }

  /**
   * Example of handling a project modification (One-to-N flow)
   */
  async handleProjectModification(projectId: string, userInput: string): Promise<void> {
    console.log('\n=== Starting Project Modification (One-to-N Flow) ===');
    
    const isZeroToOneRequest = false; // This is a modification request

    // Execute the gatekeeping logic
    const result = await this.service.executeGatekeeping(
      projectId,
      userInput,
      isZeroToOneRequest
    );

    console.log(`Project Mode: ${result.mode}`);
    console.log(`Request Allowed: ${result.allowed}`);
    
    if (result.allowed) {
      console.log('✓ Request passed gatekeeping - routing to One-to-N pipeline');
      
      // In a real implementation, this would call the actual One-to-N pipeline
    } else {
      console.log(`✗ Request blocked: ${result.reason}`);
    }
  }

  /**
   * Example of attempting to use Zero-to-One logic on an existing project
   */
  async handleInvalidZeroToOneRequest(projectId: string, userInput: string): Promise<void> {
    console.log('\n=== Attempting Invalid Zero-to-One Request on Existing Project ===');
    
    const isZeroToOneRequest = true; // This is incorrectly a zero-to-one request

    // Execute the gatekeeping logic
    const result = await this.service.executeGatekeeping(
      projectId,
      userInput,
      isZeroToOneRequest
    );

    console.log(`Project Mode: ${result.mode}`);
    console.log(`Request Allowed: ${result.allowed}`);
    
    if (result.allowed) {
      console.log('✓ Request passed gatekeeping');
    } else {
      console.log(`✗ Request correctly blocked: ${result.reason}`);
    }
  }

  /**
   * Example of handling destructive user language
   */
  async handleDestructiveUserLanguage(projectId: string): Promise<void> {
    console.log('\n=== Handling Destructive User Language ("start over") ===');
    
    const userInput = "Please start over and rebuild from scratch";
    const isZeroToOneRequest = true;

    // Execute the gatekeeping logic
    const result = await this.service.executeGatekeeping(
      projectId,
      userInput,
      isZeroToOneRequest
    );

    console.log(`Project Mode: ${result.mode}`);
    console.log(`Request Allowed: ${result.allowed}`);
    
    if (result.allowed) {
      console.log('✓ Request passed gatekeeping');
    } else {
      console.log(`✗ Request correctly blocked: ${result.reason}`);
      
      // Check if new project is required
      if (this.service.requiresNewProject(userInput)) {
        console.log('→ User language requires creating a new project instead of modifying existing');
        
        // Create a new project for the user
        const newProject = await this.service.createNewProject();
        console.log(`→ Created new project with ID: ${newProject.project_id}`);
      }
    }
  }

  /**
   * Simulates creating the first artifact which should trigger the mode transition
   */
  private async simulateFirstArtifactCreation(userId: string): Promise<void> {
    console.log('\n→ Simulating creation of first project artifact...');
    
    // Create a new project state (this would happen when the first file is created)
    const newProjectState = await this.service.createNewProject();
    console.log(`→ Created new project state with ID: ${newProjectState.project_id}`);
    
    // Update the project state to reflect that we now have artifacts
    const updatedState = await this.service.updateProjectState(newProjectState.project_id, {
      artifact_count: 1,
      has_config: true,
      architecture_decisions_recorded: true
    });
    
    console.log(`→ Updated project state:`);
    console.log(`  - Artifact count: ${updatedState.artifact_count}`);
    console.log(`  - Has config: ${updatedState.has_config}`);
    console.log(`  - Architecture decisions recorded: ${updatedState.architecture_decisions_recorded}`);
    console.log(`  - Mode locked: ${updatedState.mode_locked}`);
    
    // Verify that the mode is now locked to ONE_TO_N
    if (updatedState.mode_locked === 'ONE_TO_N') {
      console.log('✓ Mode successfully locked to ONE_TO_N after first artifact creation');
    } else {
      console.log('✗ Mode was not properly locked to ONE_TO_N');
    }
  }

  /**
   * Run all examples to demonstrate the system
   */
  async runAllExamples(): Promise<void> {
    console.log('🚀 Starting Zero-to-One Mode Detection & Hard Boundary Layer Integration Examples\n');

    // Example 1: New project creation
    await this.handleNewProjectCreation('user-123', 'Create a login screen with email and password fields');

    // Example 2: Project modification (after simulating that a project exists)
    await this.handleProjectModification('project-456', 'Add a forgot password link to the login screen');

    // Example 3: Invalid zero-to-one request on existing project
    await this.handleInvalidZeroToOneRequest('project-456', 'Create a completely new app from scratch');

    // Example 4: Destructive user language
    await this.handleDestructiveUserLanguage('project-456');

    console.log('\n✅ All integration examples completed successfully');
  }
}

// Example usage
if (require.main === module) {
  const example = new ProjectStateIntegrationExample();
  example.runAllExamples().catch(console.error);
}