import { ProjectState, ProjectMode } from './model';

export class ModeDetector {
  /**
   * Implements the atomic mode detection rule:
   * IF (artifact_count == 0)
   * AND (project_id == null)
   * AND (has_config == false)
   * AND (architecture_decisions_recorded == false)
   * THEN mode = ZERO_TO_ONE
   * ELSE mode = ONE_TO_N
   */
  public static detectMode(projectState: ProjectState): ProjectMode {
    // This is a pure function with no AI, no heuristics, and no external dependencies
    // It evaluates based only on hard backend state
    
    if (
      projectState.artifact_count === 0 &&
      projectState.project_id === null &&
      projectState.has_config === false &&
      projectState.architecture_decisions_recorded === false
    ) {
      return 'ZERO_TO_ONE';
    } else {
      // Fail-safe toward ONE_TO_N
      return 'ONE_TO_N';
    }
  }

  /**
   * Determines if a project has transitioned from ZERO_TO_ONE to ONE_TO_N
   * This happens when any of the creation conditions are no longer met
   */
  public static hasTransitioned(projectState: ProjectState): boolean {
    // The transition occurs when any of these conditions change from the initial state
    return !(
      projectState.artifact_count === 0 &&
      projectState.project_id === null &&
      projectState.has_config === false &&
      projectState.architecture_decisions_recorded === false
    );
  }

  /**
   * Determines if a project is in the initial state (zero-to-one)
   */
  public static isInInitialState(projectState: ProjectState): boolean {
    return (
      projectState.artifact_count === 0 &&
      projectState.project_id === null &&
      projectState.has_config === false &&
      projectState.architecture_decisions_recorded === false
    );
  }
}