export interface ProjectState {
  id: string; // Database row UUID - unique identifier for this project state record
  project_id: string | null; // FK to project_identities - NULL during ZERO_TO_ONE phase
  identity_id: string | null; // Direct link to project_identities.identity_id for Zero-to-One pipeline
  artifact_count: number;
  has_config: boolean;
  architecture_decisions_recorded: boolean;
  architecture_plan_established: boolean;
  created_at: Date;
  mode_locked: 'ZERO_TO_ONE' | 'ONE_TO_N';
  updated_at: Date;
}

export type Mode = 'ZERO_TO_ONE' | 'ONE_TO_N';
export type ProjectMode = 'ZERO_TO_ONE' | 'ONE_TO_N';

export const ProjectStateSchema = {
  id: 'string',
  project_id: 'string | null',
  identity_id: 'string | null',
  artifact_count: 'number',
  has_config: 'boolean',
  architecture_decisions_recorded: 'boolean',
  architecture_plan_established: 'boolean',
  created_at: 'Date',
  mode_locked: 'ZERO_TO_ONE | ONE_TO_N',
  updated_at: 'Date'
};

export interface ProjectStateInput {
  project_id?: string | null;
  identity_id?: string | null;
  artifact_count?: number;
  has_config?: boolean;
  architecture_decisions_recorded?: boolean;
  architecture_plan_established?: boolean;
  mode_locked?: ProjectMode;
  created_at?: Date | string;
}

export interface ProjectStateUpdate {
  project_id?: string | null;
  identity_id?: string | null;
  artifact_count?: number;
  has_config?: boolean;
  architecture_decisions_recorded?: boolean;
  architecture_plan_established?: boolean;
  mode_locked?: ProjectMode;
}
