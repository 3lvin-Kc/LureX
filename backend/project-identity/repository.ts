import { createClient } from "@supabase/supabase-js";
import { ProjectIdentity } from "./model";

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

// Create a dedicated backend Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ProjectIdentityRow {
  identity_id: string;
  project_id: string | null;
  core_definition: {
    purpose: string;
    domain: string;
    type: string;
  };
  characteristics: string[];
  scope: {
    included: string[];
    excluded: string[];
    boundary_principles: string;
  };
  scale: {
    user_base: string;
    data_volume: string;
    sophistication_level: string;
  };
  architecture: {
    philosophy: string;
    patterns: string[];
    constraints: string[];
  };
  evolution: {
    likely_next: string[];
    possible_later: string[];
    unlikely_ever: string[];
  };
  technical_foundation: {
    stack: "Flutter";
    structure: string;
    state_management: string;
  };
  created_at: string;
  immutable: boolean;
}

/**
 * The repository for managing the persistence of the Project Identity.
 * It ensures that the identity is stored immutably in the Supabase database
 * and can be retrieved when needed.
 */
export class ProjectIdentityRepository {
  private readonly TABLE_NAME = "project_identities";

  /**
   * Saves the project identity to the Supabase database.
   * The identity is stored as an immutable record with JSONB fields for complex data.
   * @param identity The project identity to save.
   */
  async save(identity: ProjectIdentity): Promise<void> {
    const { error } = await supabase.from(this.TABLE_NAME).insert({
      identity_id: identity.identity_id,
      project_id: identity.project_id,
      core_definition: identity.core_definition,
      characteristics: identity.characteristics,
      scope: identity.scope,
      scale: identity.scale,
      architecture: identity.architecture,
      evolution: identity.evolution,
      technical_foundation: identity.technical_foundation,
      created_at: identity.created_at.toISOString(),
      immutable: identity.immutable,
    });

    if (error) {
      throw new Error(`Failed to save project identity: ${error.message}`);
    }
  }

  /**
   * Finds a project identity by its ID.
   * It queries the Supabase database and maps the result back to the ProjectIdentity type.
   * @param identity_id The ID of the identity to find.
   * @returns The project identity, or null if not found.
   */
  async findById(identity_id: string): Promise<ProjectIdentity | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("identity_id", identity_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, which is fine
        return null;
      }
      throw new Error(`Failed to find project identity: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapToProjectIdentity(data);
  }

  /**
   * Finds a project identity by its project ID.
   * This allows lookup of identities associated with specific projects.
   * @param project_id The project ID to search for.
   * @returns The project identity, or null if not found.
   */
  async findByProjectId(project_id: string): Promise<ProjectIdentity | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("project_id", project_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, which is fine
        return null;
      }
      throw new Error(
        `Failed to find project identity by project ID: ${error.message}`,
      );
    }

    if (!data) {
      return null;
    }

    return this.mapToProjectIdentity(data);
  }

  /**
   * Lists all project identities, optionally filtered by criteria.
   * Useful for administrative purposes or identity browsing.
   * @param limit Optional limit on number of results.
   * @param offset Optional offset for pagination.
   * @returns Array of project identities.
   */
  async findAll(
    limit: number = 50,
    offset: number = 0,
  ): Promise<ProjectIdentity[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list project identities: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map((row) => this.mapToProjectIdentity(row));
  }

  /**
   * Counts total number of project identities.
   * Useful for pagination and statistics.
   * @returns Total count of project identities.
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(`Failed to count project identities: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Checks if a project identity exists by ID.
   * More efficient than findById when you only need existence check.
   * @param identity_id The ID to check for.
   * @returns True if identity exists, false otherwise.
   */
  async exists(identity_id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("identity_id")
      .eq("identity_id", identity_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false; // No rows found
      }
      throw new Error(
        `Failed to check if project identity exists: ${error.message}`,
      );
    }

    return data !== null;
  }

  /**
   * Maps a database row to a ProjectIdentity object.
   * Handles type conversion and ensures proper Date object creation.
   * @param data The raw database row data.
   * @returns Properly typed ProjectIdentity object.
   */
  private mapToProjectIdentity(data: ProjectIdentityRow): ProjectIdentity {
    return {
      identity_id: data.identity_id,
      project_id: data.project_id,
      core_definition: data.core_definition,
      characteristics: data.characteristics,
      scope: data.scope,
      scale: data.scale,
      architecture: data.architecture,
      evolution: data.evolution,
      technical_foundation: data.technical_foundation,
      created_at: new Date(data.created_at),
      immutable: data.immutable as true,
    };
  }
}
