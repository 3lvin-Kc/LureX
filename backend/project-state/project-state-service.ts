import { ProjectState, ProjectMode } from "./model";
import { ProjectStateRepository } from "./repository";
import { ModeDetector } from "./mode-detector";
import { ModeTransitionManager } from "./mode-transition-manager";
import { ModeGatekeeper } from "./mode-gatekeeper";
import { v4 as uuidv4 } from "uuid";

export interface ProjectStateServiceInterface {
  getProjectState(projectId: string | null): Promise<ProjectState | null>;
  getProjectStateById(id: string): Promise<ProjectState | null>;
  getProjectStateByIdOrProjectId(identifier: string): Promise<ProjectState | null>;
  updateProjectStateById(id: string, update: Partial<ProjectState>): Promise<ProjectState>;
  executeGatekeeping(
    projectId: string | null,
    userInput: string,
    isZeroToOneRequest: boolean,
  ): Promise<{
    mode: ProjectMode;
    allowed: boolean;
    reason?: string;
    projectState: ProjectState;
  }>;
  updateProjectState(
    projectId: string | null,
    update: Partial<ProjectState>,
  ): Promise<ProjectState>;
  createNewProject(): Promise<ProjectState>;
  detectMode(projectId: string | null): Promise<ProjectMode>;
  requiresNewProject(userInput: string): boolean;
}

export class ProjectStateService implements ProjectStateServiceInterface {
  private repository: ProjectStateRepository;
  private transitionManager: ModeTransitionManager;
  private gatekeeper: ModeGatekeeper;

  constructor(repository: ProjectStateRepository) {
    this.repository = repository;
    this.transitionManager = new ModeTransitionManager(this.repository);
    this.gatekeeper = new ModeGatekeeper(
      this.repository,
      this.transitionManager,
    );
  }

  /**
   * Gets the current project state by project_id
   */
  async getProjectState(
    projectId: string | null,
  ): Promise<ProjectState | null> {
    return await this.repository.findByProjectId(projectId);
  }

  /**
   * Gets the project state by database row id (UUID)
   * This is the primary lookup method when project_id is NULL during ZERO_TO_ONE phase.
   */
  async getProjectStateById(id: string): Promise<ProjectState | null> {
    return await this.repository.findById(id);
  }

  /**
   * Gets the project state by either id or project_id
   * Tries id first, then falls back to project_id lookup
   */
  async getProjectStateByIdOrProjectId(
    identifier: string,
  ): Promise<ProjectState | null> {
    // First try to find by database row id
    let state = await this.repository.findById(identifier);
    if (state) {
      return state;
    }
    // Fall back to project_id lookup
    return await this.repository.findByProjectId(identifier);
  }

  /**
   * Executes the complete gatekeeping logic (main entry point)
   */
  async executeGatekeeping(
    projectId: string | null,
    userInput: string,
    isZeroToOneRequest: boolean,
  ): Promise<{
    mode: ProjectMode;
    allowed: boolean;
    reason?: string;
    projectState: ProjectState;
  }> {
    return await this.gatekeeper.executeGatekeeping(
      projectId,
      userInput,
      isZeroToOneRequest,
    );
  }

  /**
   * Updates the project state and handles transitions
   */
  async updateProjectState(
    projectId: string | null,
    update: Partial<ProjectState>,
  ): Promise<ProjectState> {
    return await this.gatekeeper.updateProjectState(projectId, update);
  }

  /**
   * Updates the project state by database row id (UUID)
   * This is the primary update method when project_id is NULL during ZERO_TO_ONE phase.
   */
  async updateProjectStateById(
    id: string,
    update: Partial<ProjectState>,
  ): Promise<ProjectState> {
    return await this.repository.updateById(id, update);
  }

  /**
   * Creates a new project for zero-to-one flow
   *
   * Note: project_id is initially NULL to avoid FK constraint violation.
   * The project_states table has a FK to project_identities, but during
   * ZERO_TO_ONE phase, no project identity exists yet. The project_id
   * will be set later when the project identity is established.
   */
  async createNewProject(): Promise<ProjectState> {
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

  /**
   * Detects the current mode of a project
   */
  async detectMode(projectId: string | null): Promise<ProjectMode> {
    const projectState = await this.getProjectState(projectId);

    if (!projectState) {
      // If no project exists, it's in zero-to-one state by default
      return "ZERO_TO_ONE";
    }

    return ModeDetector.detectMode(projectState);
  }

  /**
   * Checks if user input requires a new project instead of modifying existing
   */
  requiresNewProject(userInput: string): boolean {
    return ModeTransitionManager.requiresNewProject(userInput);
  }

  /**
   * Initializes a project state for a new project
   */
  async initializeProjectState(projectId: string): Promise<ProjectState> {
    return await this.repository.upsert(projectId, {
      project_id: projectId,
      artifact_count: 0,
      has_config: false,
      architecture_decisions_recorded: false,
      architecture_plan_established: false,
      mode_locked: "ZERO_TO_ONE",
    });
  }
}
