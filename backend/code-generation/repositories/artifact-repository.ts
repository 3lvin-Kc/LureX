/**
 * Artifact Repository
 *
 * Manages persistence of generated artifact metadata in the database.
 * Actual file content is stored in Supabase Storage bucket.
 *
 * This repository handles:
 * - CRUD operations for artifact metadata
 * - Batch operations for atomic artifact creation
 * - Querying artifacts by project, identity, or architecture plan
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  GeneratedArtifact,
  GeneratedArtifactInput,
  GeneratedArtifactRow,
  mapRowToArtifact,
} from '../models/generated-artifact';

// ============================================================================
// Supabase Client Setup
// ============================================================================

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://imxrdomaamdcmhtxztcj.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHJkb21hYW1kY21odHh6dGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODk2NDQsImV4cCI6MjA4MTk2NTY0NH0.pn9EZmPwB29Mf2jJwrBxZaMwvegehSzENgKRrcNSOFI';

const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// Artifact Repository Class
// ============================================================================

export class ArtifactRepository {
  private readonly TABLE_NAME = 'generated_artifacts';

  // ==========================================================================
  // Create Operations
  // ==========================================================================

  /**
   * Creates a single artifact record
   */
  async create(input: GeneratedArtifactInput): Promise<GeneratedArtifact> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        project_state_id: input.project_state_id,
        identity_id: input.identity_id,
        architecture_plan_id: input.architecture_plan_id,
        file_path: input.file_path,
        file_name: input.file_name,
        storage_path: input.storage_path,
        file_type: input.file_type,
        file_size_bytes: input.file_size_bytes,
        is_entry_point: input.is_entry_point,
        generation_order: input.generation_order,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create artifact: ${error.message}`);
    }

    return mapRowToArtifact(data as GeneratedArtifactRow);
  }

  /**
   * Creates multiple artifacts atomically (all-or-nothing)
   * Used for Zero-to-One generation where all files must be created together
   */
  async createMany(inputs: GeneratedArtifactInput[]): Promise<GeneratedArtifact[]> {
    if (inputs.length === 0) {
      return [];
    }

    const records = inputs.map((input) => ({
      project_state_id: input.project_state_id,
      identity_id: input.identity_id,
      architecture_plan_id: input.architecture_plan_id,
      file_path: input.file_path,
      file_name: input.file_name,
      storage_path: input.storage_path,
      file_type: input.file_type,
      file_size_bytes: input.file_size_bytes,
      is_entry_point: input.is_entry_point,
      generation_order: input.generation_order,
    }));

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(records)
      .select();

    if (error) {
      throw new Error(`Failed to create artifacts: ${error.message}`);
    }

    return (data as GeneratedArtifactRow[]).map(mapRowToArtifact);
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  /**
   * Finds an artifact by its ID
   */
  async findById(id: string): Promise<GeneratedArtifact | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to find artifact: ${error.message}`);
    }

    return data ? mapRowToArtifact(data as GeneratedArtifactRow) : null;
  }

  /**
   * Finds all artifacts for a project state
   */
  async findByProjectStateId(projectStateId: string): Promise<GeneratedArtifact[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('project_state_id', projectStateId)
      .order('generation_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to find artifacts by project state: ${error.message}`);
    }

    return (data as GeneratedArtifactRow[]).map(mapRowToArtifact);
  }

  /**
   * Finds all artifacts for a project identity
   */
  async findByIdentityId(identityId: string): Promise<GeneratedArtifact[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('identity_id', identityId)
      .order('generation_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to find artifacts by identity: ${error.message}`);
    }

    return (data as GeneratedArtifactRow[]).map(mapRowToArtifact);
  }

  /**
   * Finds all artifacts for an architecture plan
   */
  async findByArchitecturePlanId(planId: string): Promise<GeneratedArtifact[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('architecture_plan_id', planId)
      .order('generation_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to find artifacts by architecture plan: ${error.message}`);
    }

    return (data as GeneratedArtifactRow[]).map(mapRowToArtifact);
  }

  /**
   * Finds an artifact by project state and file path
   */
  async findByProjectStateAndPath(
    projectStateId: string,
    filePath: string
  ): Promise<GeneratedArtifact | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('project_state_id', projectStateId)
      .eq('file_path', filePath)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to find artifact by path: ${error.message}`);
    }

    return data ? mapRowToArtifact(data as GeneratedArtifactRow) : null;
  }

  /**
   * Finds the entry point file for a project state
   */
  async findEntryPoint(projectStateId: string): Promise<GeneratedArtifact | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('project_state_id', projectStateId)
      .eq('is_entry_point', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to find entry point: ${error.message}`);
    }

    return data ? mapRowToArtifact(data as GeneratedArtifactRow) : null;
  }

  // ==========================================================================
  // Count Operations
  // ==========================================================================

  /**
   * Counts artifacts for a project state
   */
  async countByProjectStateId(projectStateId: string): Promise<number> {
    const { count, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('project_state_id', projectStateId);

    if (error) {
      throw new Error(`Failed to count artifacts: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Checks if any artifacts exist for a project state
   */
  async existsForProjectState(projectStateId: string): Promise<boolean> {
    const count = await this.countByProjectStateId(projectStateId);
    return count > 0;
  }

  // ==========================================================================
  // Delete Operations
  // ==========================================================================

  /**
   * Deletes an artifact by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete artifact: ${error.message}`);
    }
  }

  /**
   * Deletes all artifacts for a project state
   * Used when regenerating or cleaning up failed generation
   */
  async deleteByProjectStateId(projectStateId: string): Promise<number> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('project_state_id', projectStateId)
      .select('id');

    if (error) {
      throw new Error(`Failed to delete artifacts: ${error.message}`);
    }

    return data?.length || 0;
  }

  // ==========================================================================
  // Aggregate Operations
  // ==========================================================================

  /**
   * Gets total size of all artifacts for a project state
   */
  async getTotalSizeByProjectStateId(projectStateId: string): Promise<number> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('file_size_bytes')
      .eq('project_state_id', projectStateId);

    if (error) {
      throw new Error(`Failed to get total size: ${error.message}`);
    }

    return (data || []).reduce((sum, row) => sum + (row.file_size_bytes || 0), 0);
  }

  /**
   * Gets file type distribution for a project state
   */
  async getFileTypeDistribution(
    projectStateId: string
  ): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('file_type')
      .eq('project_state_id', projectStateId);

    if (error) {
      throw new Error(`Failed to get file type distribution: ${error.message}`);
    }

    const distribution: Record<string, number> = {};
    for (const row of data || []) {
      distribution[row.file_type] = (distribution[row.file_type] || 0) + 1;
    }

    return distribution;
  }

  /**
   * Gets all file paths for a project state
   */
  async getFilePaths(projectStateId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('file_path')
      .eq('project_state_id', projectStateId)
      .order('generation_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to get file paths: ${error.message}`);
    }

    return (data || []).map((row) => row.file_path);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultRepository: ArtifactRepository | null = null;

/**
 * Get the default ArtifactRepository instance
 */
export function getArtifactRepository(): ArtifactRepository {
  if (!defaultRepository) {
    defaultRepository = new ArtifactRepository();
  }
  return defaultRepository;
}

/**
 * Create a new ArtifactRepository instance
 */
export function createArtifactRepository(): ArtifactRepository {
  return new ArtifactRepository();
}
