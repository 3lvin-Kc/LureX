/**
 * Type definitions for the Zero-to-One Mode Detection & Hard Boundary Layer
 */

export type ProjectMode = 'ZERO_TO_ONE' | 'ONE_TO_N';

export interface ProjectState {
  project_id: string | null;
  artifact_count: number;
  has_config: boolean;
  architecture_decisions_recorded: boolean;
  created_at: Date;
  mode_locked: ProjectMode;
  updated_at: Date;
}

export interface ProjectStateInput {
  project_id?: string | null;
  artifact_count?: number;
  has_config?: boolean;
  architecture_decisions_recorded?: boolean;
  mode_locked?: ProjectMode;
  created_at?: Date | string;
}

export interface ProjectStateUpdate {
  artifact_count?: number;
  has_config?: boolean;
  architecture_decisions_recorded?: boolean;
  mode_locked?: ProjectMode;
}

export interface GatekeeperResult {
  mode: ProjectMode;
  allowed: boolean;
  reason?: string;
  projectState: ProjectState;
}

export interface ProjectStateServiceInterface {
  getProjectState(projectId: string | null): Promise<ProjectState | null>;
  executeGatekeeping(
    projectId: string | null, 
    userInput: string, 
    isZeroToOneRequest: boolean
  ): Promise<GatekeeperResult>;
  updateProjectState(projectId: string | null, update: Partial<ProjectState>): Promise<ProjectState>;
  createNewProject(): Promise<ProjectState>;
  detectMode(projectId: string | null): Promise<ProjectMode>;
  requiresNewProject(userInput: string): boolean;
}