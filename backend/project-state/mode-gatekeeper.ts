import { ProjectState, ProjectMode } from "./model";
import { ProjectStateRepository } from "./repository";
import { ModeDetector } from "./mode-detector";
import { ModeTransitionManager } from "./mode-transition-manager";
import {
  ZeroToOneIntentClassifier,
  ZERO_INTENT,
  IntentClassification,
} from "./zero-to-one-intent-classifier";
import { v4 as uuidv4 } from "uuid";

export interface GatekeeperResult {
  mode: ProjectMode;
  allowed: boolean;
  reason?: string;
  projectState: ProjectState;
  intentClassification?: IntentClassification;
}

export class ModeGatekeeper {
  constructor(
    private repository: ProjectStateRepository,
    private transitionManager: ModeTransitionManager,
  ) {}

  /**
   * Executes the complete gatekeeping logic:
   * 1. Load project state
   * 2. Run atomic mode detection
   * 3. Apply hard boundary rules
   * 4. Route to appropriate pipeline
   */
  async executeGatekeeping(
    projectId: string | null,
    userInput: string,
    isZeroToOneRequest: boolean,
  ): Promise<GatekeeperResult> {
    // Step 1: Load project state
    // Try to find by project_id first, then by id if projectId looks like a UUID
    let projectState: ProjectState | null = null;

    if (projectId) {
      // First try to find by database row id
      projectState = await this.repository.findById(projectId);

      // If not found, try by project_id (FK to project_identities)
      if (!projectState) {
        projectState = await this.repository.findByProjectId(projectId);
      }
    }

    if (!projectState) {
      // If no project state exists, create initial state with NULL project_id
      // project_id will be linked later when project identity is established
      projectState = await this.repository.create({
        project_id: null, // NULL during ZERO_TO_ONE phase - no FK reference yet
        artifact_count: 0,
        has_config: false,
        architecture_decisions_recorded: false,
        architecture_plan_established: false,
        mode_locked: "ZERO_TO_ONE",
      });
    }

    // Step 2: Run atomic mode detection
    const detectedMode = ModeDetector.detectMode(projectState);

    // Step 3: Check for destructive user language that requires new project
    if (ModeTransitionManager.requiresNewProject(userInput)) {
      return {
        mode: detectedMode,
        allowed: false,
        reason:
          "Destructive user language detected. A new project must be created instead of modifying the existing one.",
        projectState,
      };
    }

    // Step 4: Apply hard boundary rules and intent classification for Zero-to-One
    let isAllowed = true;
    let reason: string | undefined;
    let intentClassification: IntentClassification | undefined;

    if (isZeroToOneRequest) {
      if (projectState.mode_locked === "ONE_TO_N" && projectId !== null) {
        isAllowed = false;
        reason =
          "Zero-to-one operations are not allowed. Project has transitioned to ONE_TO_N mode.";
      } else if (detectedMode === "ZERO_TO_ONE") {
        intentClassification = ZeroToOneIntentClassifier.classify(userInput);

        switch (intentClassification.intent) {
          case ZERO_INTENT.INVALID_MODIFICATION:
            isAllowed = false;
            reason =
              "I don’t see an existing project. Would you like me to create one?";
            break;
          case ZERO_INTENT.DISCUSSION:
          case ZERO_INTENT.PLANNING:
            // These are allowed, but won't trigger project creation yet.
            isAllowed = true;
            break;
          case ZERO_INTENT.CREATION:
            if (!projectState.architecture_plan_established) {
              isAllowed = false;
              reason =
                "Architecture plan not established. Please define the architecture before generating code.";
            } else {
              isAllowed = true; // Proceed to project identity creation
            }
            break;
        }
      } else {
        isAllowed = false;
        reason =
          "Zero-to-one operations are not allowed. Project is not in initial state.";
      }
    } else {
      // For ONE_TO_N requests, check if we're in the right mode
      if (
        detectedMode === "ZERO_TO_ONE" &&
        projectState.mode_locked !== "ONE_TO_N"
      ) {
        // If we're in initial state but this is a ONE_TO_N request,
        // we might need to transition first
        if (
          projectState.artifact_count > 0 ||
          projectState.has_config ||
          projectState.architecture_decisions_recorded
        ) {
          // Transition the mode
          projectState = await this.transitionManager.handleTransition(
            projectId,
            {
              ...projectState,
            },
          );
        }
      }
    }

    return {
      mode: projectState.mode_locked,
      allowed: isAllowed,
      reason,
      projectState,
      intentClassification,
    };
  }

  /**
   * Updates the project state and handles any necessary mode transitions
   */
  async updateProjectState(
    projectId: string | null,
    update: Partial<ProjectState>,
  ): Promise<ProjectState> {
    return await this.transitionManager.handleTransition(projectId, update);
  }

  /**
   * Checks if a request is allowed based on current mode
   */
  async isRequestAllowed(
    projectId: string | null,
    isZeroToOneRequest: boolean,
  ): Promise<boolean> {
    const result = await this.executeGatekeeping(
      projectId,
      "",
      isZeroToOneRequest,
    );
    return result.allowed;
  }

  /**
   * Creates a new project with initial state for zero-to-one flow
   *
   * Note: project_id is initially NULL to avoid FK constraint violation.
   * The project_states table has a FK to project_identities, but during
   * ZERO_TO_ONE phase, no project identity exists yet. The project_id
   * will be set later when the project identity is established.
   */
  async createNewProjectForZeroToOne(): Promise<ProjectState> {
    // Use NULL for project_id initially - FK constraint allows NULL
    // The project_id will be linked later when project identity is created
    return await this.repository.create({
      project_id: null,
      artifact_count: 0,
      has_config: false,
      architecture_decisions_recorded: false,
      architecture_plan_established: false,
      mode_locked: "ZERO_TO_ONE",
    });
  }
}
