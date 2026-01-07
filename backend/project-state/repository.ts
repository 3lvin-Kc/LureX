import { createClient } from "@supabase/supabase-js";
import {
  ProjectState,
  ProjectStateInput,
  ProjectStateUpdate,
  ProjectMode,
} from "./model";

interface ProjectStateRow {
  id: string;
  project_id: string | null;
  identity_id: string | null;
  artifact_count: number;
  has_config: boolean;
  architecture_decisions_recorded: boolean;
  architecture_plan_established: boolean;
  mode_locked: ProjectMode;
  created_at: string;
  updated_at: string;
}

// Use environment variables directly instead of import.meta.env
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://imxrdomaamdcmhtxztcj.supabase.co";

// For backend operations, prefer service role key to bypass RLS
// Falls back to anon key if service role key is not available
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHJkb21hYW1kY21odHh6dGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODk2NDQsImV4cCI6MjA4MTk2NTY0NH0.pn9EZmPwB29Mf2jJwrBxZaMwvegehSzENgKRrcNSOFI";

// Use service role key for backend to bypass RLS, fallback to anon key
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Log which key type is being used (for debugging)
if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log("🔐 Backend repository using service role key (RLS bypassed)");
} else {
  console.warn("⚠️ Backend repository using anon key - RLS policies will apply");
  console.warn("   Set SUPABASE_SERVICE_ROLE_KEY env var for production use");
}

// Create a dedicated backend Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export class ProjectStateRepository {
  private readonly TABLE_NAME = "project_states";

  async create(projectState: ProjectStateInput): Promise<ProjectState> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        project_id: projectState.project_id,
        identity_id: projectState.identity_id || null,
        artifact_count: projectState.artifact_count || 0,
        has_config: projectState.has_config || false,
        architecture_decisions_recorded:
          projectState.architecture_decisions_recorded || false,
        architecture_plan_established:
          projectState.architecture_plan_established || false,
        mode_locked: projectState.mode_locked || "ZERO_TO_ONE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project state: ${error.message}`);
    }

    return this.mapToProjectState(data);
  }

  /**
   * Finds a project state by its database row ID (UUID).
   * This is the primary lookup method when project_id is NULL during ZERO_TO_ONE phase.
   * @param id The database row UUID to search for.
   * @returns The project state, or null if not found.
   */
  async findById(id: string): Promise<ProjectState | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, which is fine
        return null;
      }
      throw new Error(`Failed to find project state by id: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapToProjectState(data);
  }

  async findByProjectId(
    projectId: string | null,
  ): Promise<ProjectState | null> {
    if (projectId === null) {
      // When project_id is null, return null to indicate no specific project state exists
      // This allows new users to start with a fresh ZERO_TO_ONE state
      return null;
    } else {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned, which is fine
          return null;
        }
        throw new Error(`Failed to find project state: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return this.mapToProjectState(data);
    }
  }

  async update(
    projectId: string | null,
    update: ProjectStateUpdate,
  ): Promise<ProjectState> {
    let query;

    if (projectId === null) {
      // When project_id is null, create a new record instead of trying to update
      // This prevents issues with multiple null-project-id records
      return await this.create({
        project_id: null,
        artifact_count: update.artifact_count ?? 0,
        has_config: update.has_config ?? false,
        architecture_decisions_recorded:
          update.architecture_decisions_recorded ?? false,
        architecture_plan_established:
          update.architecture_plan_established ?? false,
        mode_locked: update.mode_locked ?? "ZERO_TO_ONE",
      });
    } else {
      query = supabase
        .from(this.TABLE_NAME)
        .update({
          ...update,
          updated_at: new Date().toISOString(),
        })
        .eq("project_id", projectId)
        .select()
        .single();
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to update project state: ${error.message}`);
    }

    return this.mapToProjectState(data);
  }

  /**
   * Updates a project state by its database row ID (UUID).
   * This is the primary update method when project_id is NULL during ZERO_TO_ONE phase.
   * @param id The database row UUID to update.
   * @param update The fields to update.
   * @returns The updated project state.
   */
  async updateById(
    id: string,
    update: ProjectStateUpdate,
  ): Promise<ProjectState> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project state by id: ${error.message}`);
    }

    return this.mapToProjectState(data);
  }

  async upsert(
    projectId: string | null,
    state: ProjectStateInput,
  ): Promise<ProjectState> {
    // For upsert with project_id = null, we need to handle it differently
    if (projectId === null) {
      // If project_id is null, use insert instead of upsert to avoid conflicts
      return await this.create({
        project_id: null,
        artifact_count: state.artifact_count || 0,
        has_config: state.has_config || false,
        architecture_decisions_recorded:
          state.architecture_decisions_recorded || false,
        architecture_plan_established:
          state.architecture_plan_established || false,
        mode_locked: state.mode_locked || "ZERO_TO_ONE",
      });
    }

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .upsert(
        {
          project_id: projectId,
          artifact_count: state.artifact_count || 0,
          has_config: state.has_config || false,
          architecture_decisions_recorded:
            state.architecture_decisions_recorded || false,
          architecture_plan_established:
            state.architecture_plan_established || false,
          mode_locked: state.mode_locked || "ZERO_TO_ONE",
          created_at: state.created_at
            ? new Date(state.created_at).toISOString()
            : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" },
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert project state: ${error.message}`);
    }

    return this.mapToProjectState(data);
  }

  private mapToProjectState(data: ProjectStateRow): ProjectState {
    return {
      id: data.id, // Database row UUID - unique identifier
      project_id: data.project_id,
      identity_id: data.identity_id,
      artifact_count: data.artifact_count,
      has_config: data.has_config,
      architecture_decisions_recorded: data.architecture_decisions_recorded,
      architecture_plan_established: data.architecture_plan_established,
      created_at: new Date(data.created_at),
      mode_locked: data.mode_locked as ProjectMode,
      updated_at: new Date(data.updated_at),
    };
  }
}
