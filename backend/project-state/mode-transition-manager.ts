import { ProjectState, ProjectMode } from './model';
import { ProjectStateRepository } from './repository';
import { ModeDetector } from './mode-detector';

export class ModeTransitionManager {
  constructor(private repository: ProjectStateRepository) {}

  /**
   * Handles the irreversible transition from ZERO_TO_ONE to ONE_TO_N
   * This occurs exactly when the first artifact is created or project configuration is set
   */
  /**
   * Handles the irreversible transition from ZERO_TO_ONE to ONE_TO_N
   * This occurs exactly when the first artifact is created or project configuration is set
   * @param identifier Can be either database row id or project_id (FK to project_identities)
   */
  async handleTransition(identifier: string | null, update: Partial<ProjectState>): Promise<ProjectState> {
    // First, get the current state using flexible lookup
    let currentState: ProjectState | null = null;

    if (identifier) {
      // Try to find by database row id first
      currentState = await this.repository.findById(identifier);

      // If not found, try by project_id (FK to project_identities)
      if (!currentState) {
        currentState = await this.repository.findByProjectId(identifier);
      }
    }

    if (!currentState) {
      // If no state exists, create initial state with NULL project_id
      // project_id will be linked later when project identity is established
      currentState = await this.repository.create({
        project_id: null, // NULL during ZERO_TO_ONE phase - no FK reference yet
        artifact_count: 0,
        has_config: false,
        architecture_decisions_recorded: false,
        architecture_plan_established: false,
        mode_locked: 'ZERO_TO_ONE'
      });
    }

    // Check if we're transitioning from initial state to modified state
    const wasInitialState = ModeDetector.isInInitialState(currentState);

    // Apply the updates using the database row id for reliable lookup
    const updatedState = await this.repository.updateById(currentState.id, {
      artifact_count: update.artifact_count ?? currentState.artifact_count,
      has_config: update.has_config ?? currentState.has_config,
      architecture_decisions_recorded: update.architecture_decisions_recorded ?? currentState.architecture_decisions_recorded,
      architecture_plan_established: update.architecture_plan_established ?? currentState.architecture_plan_established,
      mode_locked: update.mode_locked // Only update if explicitly provided
    });

    // Check if we're transitioning from initial state to modified state
    const isNowModified = !ModeDetector.isInInitialState(updatedState);

    // If we transitioned from initial to modified, lock the mode to ONE_TO_N
    // Use database row id for reliable update
    if (wasInitialState && isNowModified && updatedState.mode_locked === 'ZERO_TO_ONE') {
      // Perform the irreversible transition using database row id
      const finalState = await this.repository.updateById(currentState.id, {
        mode_locked: 'ONE_TO_N'
      });

      return finalState;
    }

    return updatedState;
  }

  /**
   * Checks if a destructive user language requires a new project
   * instead of attempting to revert to zero-to-one mode
   */
  static requiresNewProject(userInput: string): boolean {
    const destructivePhrases = [
      'start over',
      'rebuild from scratch',
      'wipe everything',
      'reset project',
      'clear all',
      'delete all',
      'begin again',
      'from scratch',
      'restart project'
    ];

    const lowerInput = userInput.toLowerCase();

    return destructivePhrases.some(phrase =>
      lowerInput.includes(phrase)
    );
  }

  /**
   * Creates a new project state for a fresh start
   */
  async createNewProject(): Promise<ProjectState> {
    return await this.repository.create({
      project_id: null, // Will be assigned when first artifact is created
      artifact_count: 0,
      has_config: false,
      architecture_decisions_recorded: false,
      mode_locked: 'ZERO_TO_ONE'
    });
  }
}
