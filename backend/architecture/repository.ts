import { createClient } from "@supabase/supabase-js";
import {
  ArchitecturePlan,
  ExecutionModelSchema,
  ConcernSeparationSchema,
  StateManagementSchema,
  FileStrategySchema,
  UIArchitectureSchema,
  NavigationArchitectureSchema,
  NamingConventionsSchema,
  PerformanceStrategySchema,
} from "./model";
import { z } from "zod";

// Type definitions for JSONB fields
type ExecutionModel = z.infer<typeof ExecutionModelSchema>;
type ConcernSeparation = z.infer<typeof ConcernSeparationSchema>;
type StateManagement = z.infer<typeof StateManagementSchema>;
type FileStrategy = z.infer<typeof FileStrategySchema>;
type UIArchitecture = z.infer<typeof UIArchitectureSchema>;
type NavigationArchitecture = z.infer<typeof NavigationArchitectureSchema>;
type NamingConventions = z.infer<typeof NamingConventionsSchema>;
type PerformanceStrategy = z.infer<typeof PerformanceStrategySchema>;
type PlatformConstraints = {
  target_platform: "android";
  ui_only: true;
  no_backend: true;
  no_networking: true;
  no_databases: true;
};

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

interface ArchitecturePlanRow {
  plan_id: string;
  project_identity_id: string;
  conceptual_category: string;
  complexity_level: string;
  structural_philosophy: string;
  execution_model: ExecutionModel;
  concern_separation: ConcernSeparation;
  state_management: StateManagement;
  file_strategy: FileStrategy;
  ui_architecture: UIArchitecture;
  navigation_architecture: NavigationArchitecture;
  naming_conventions: NamingConventions;
  performance_strategy: PerformanceStrategy;
  extensibility_model: string;
  maintenance_strategy: string;
  platform_constraints: PlatformConstraints;
  created_at: string;
}

/**
 * Repository for managing the persistence of Architecture Plans.
 * Stores comprehensive Flutter UI architecture plans in the Supabase database
 * with proper relational integrity to project identities.
 */
export class ArchitectureRepository {
  private readonly TABLE_NAME = "architecture_plans";

  /**
   * Saves an architecture plan to the Supabase database.
   * The plan is stored with JSONB fields for complex architectural data.
   * @param plan The architecture plan to save.
   */
  async save(plan: ArchitecturePlan): Promise<void> {
    const { error } = await supabase.from(this.TABLE_NAME).insert({
      plan_id: plan.plan_id,
      project_identity_id: plan.project_identity_id,
      conceptual_category: plan.conceptual_category,
      complexity_level: plan.complexity_level,
      structural_philosophy: plan.structural_philosophy,
      execution_model: plan.execution_model,
      concern_separation: plan.concern_separation,
      state_management: plan.state_management,
      file_strategy: plan.file_strategy,
      ui_architecture: plan.ui_architecture,
      navigation_architecture: plan.navigation_architecture,
      naming_conventions: plan.naming_conventions,
      performance_strategy: plan.performance_strategy,
      extensibility_model: plan.extensibility_model,
      maintenance_strategy: plan.maintenance_strategy,
      platform_constraints: plan.platform_constraints,
      created_at: plan.created_at.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to save architecture plan: ${error.message}`);
    }
  }

  /**
   * Finds an architecture plan by project identity ID.
   * Each project identity can have one active architecture plan.
   * @param project_identity_id The project identity ID to search for.
   * @returns The architecture plan, or null if not found.
   */
  async findByProjectIdentityId(
    project_identity_id: string,
  ): Promise<ArchitecturePlan | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("project_identity_id", project_identity_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, which is fine
        return null;
      }
      throw new Error(`Failed to find architecture plan: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapToArchitecturePlan(data);
  }

  /**
   * Finds an architecture plan by its unique plan ID.
   * @param plan_id The plan ID to search for.
   * @returns The architecture plan, or null if not found.
   */
  async findById(plan_id: string): Promise<ArchitecturePlan | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("plan_id", plan_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, which is fine
        return null;
      }
      throw new Error(
        `Failed to find architecture plan by ID: ${error.message}`,
      );
    }

    if (!data) {
      return null;
    }

    return this.mapToArchitecturePlan(data);
  }

  /**
   * Updates an existing architecture plan.
   * Useful for plan refinements and architectural evolution.
   * @param plan_id The ID of the plan to update.
   * @param updates Partial plan data to update.
   */
  async update(
    plan_id: string,
    updates: Partial<ArchitecturePlan>,
  ): Promise<ArchitecturePlan> {
    const updateData: Partial<ArchitecturePlanRow> = {};

    // Only include fields that are being updated
    if (updates.conceptual_category)
      updateData.conceptual_category = updates.conceptual_category;
    if (updates.complexity_level)
      updateData.complexity_level = updates.complexity_level;
    if (updates.structural_philosophy)
      updateData.structural_philosophy = updates.structural_philosophy;
    if (updates.execution_model)
      updateData.execution_model = updates.execution_model;
    if (updates.concern_separation)
      updateData.concern_separation = updates.concern_separation;
    if (updates.state_management)
      updateData.state_management = updates.state_management;
    if (updates.file_strategy) updateData.file_strategy = updates.file_strategy;
    if (updates.ui_architecture)
      updateData.ui_architecture = updates.ui_architecture;
    if (updates.navigation_architecture)
      updateData.navigation_architecture = updates.navigation_architecture;
    if (updates.naming_conventions)
      updateData.naming_conventions = updates.naming_conventions;
    if (updates.performance_strategy)
      updateData.performance_strategy = updates.performance_strategy;
    if (updates.extensibility_model)
      updateData.extensibility_model = updates.extensibility_model;
    if (updates.maintenance_strategy)
      updateData.maintenance_strategy = updates.maintenance_strategy;
    if (updates.platform_constraints)
      updateData.platform_constraints =
        updates.platform_constraints as PlatformConstraints;

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateData)
      .eq("plan_id", plan_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update architecture plan: ${error.message}`);
    }

    return this.mapToArchitecturePlan(data);
  }

  /**
   * Deletes an architecture plan by ID.
   * Used when regenerating plans or cleaning up obsolete architectures.
   * @param plan_id The ID of the plan to delete.
   */
  async delete(plan_id: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq("plan_id", plan_id);

    if (error) {
      throw new Error(`Failed to delete architecture plan: ${error.message}`);
    }
  }

  /**
   * Lists architecture plans with optional filtering and pagination.
   * Useful for administrative purposes and plan browsing.
   * @param filters Optional filters for complexity level and category.
   * @param limit Optional limit on number of results.
   * @param offset Optional offset for pagination.
   * @returns Array of architecture plans.
   */
  async findAll(
    filters: {
      complexity_level?: string;
      conceptual_category?: string;
      project_identity_id?: string;
    } = {},
    limit: number = 50,
    offset: number = 0,
  ): Promise<ArchitecturePlan[]> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (filters.complexity_level) {
      query = query.eq("complexity_level", filters.complexity_level);
    }
    if (filters.conceptual_category) {
      query = query.eq("conceptual_category", filters.conceptual_category);
    }
    if (filters.project_identity_id) {
      query = query.eq("project_identity_id", filters.project_identity_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list architecture plans: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map((row) => this.mapToArchitecturePlan(row));
  }

  /**
   * Counts total number of architecture plans with optional filters.
   * Useful for pagination and statistics.
   * @param filters Optional filters for counting.
   * @returns Total count of matching architecture plans.
   */
  async count(
    filters: {
      complexity_level?: string;
      conceptual_category?: string;
      project_identity_id?: string;
    } = {},
  ): Promise<number> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select("*", { count: "exact", head: true });

    // Apply filters if provided
    if (filters.complexity_level) {
      query = query.eq("complexity_level", filters.complexity_level);
    }
    if (filters.conceptual_category) {
      query = query.eq("conceptual_category", filters.conceptual_category);
    }
    if (filters.project_identity_id) {
      query = query.eq("project_identity_id", filters.project_identity_id);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count architecture plans: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Checks if an architecture plan exists for a project identity.
   * More efficient than findByProjectIdentityId when you only need existence check.
   * @param project_identity_id The project identity ID to check for.
   * @returns True if plan exists, false otherwise.
   */
  async existsForProjectIdentity(
    project_identity_id: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("plan_id")
      .eq("project_identity_id", project_identity_id)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false; // No rows found
      }
      throw new Error(
        `Failed to check if architecture plan exists: ${error.message}`,
      );
    }

    return data !== null;
  }

  /**
   * Gets architecture plans grouped by complexity level.
   * Useful for analytics and understanding architectural distribution.
   * @returns Object with complexity levels as keys and counts as values.
   */
  async getComplexityDistribution(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("complexity_level");

    if (error) {
      throw new Error(
        `Failed to get complexity distribution: ${error.message}`,
      );
    }

    if (!data) {
      return {};
    }

    const distribution: Record<string, number> = {};
    data.forEach((row) => {
      const level = row.complexity_level;
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Maps a database row to an ArchitecturePlan object.
   * Handles type conversion and ensures proper Date object creation.
   * @param data The raw database row data.
   * @returns Properly typed ArchitecturePlan object.
   */
  private mapToArchitecturePlan(data: ArchitecturePlanRow): ArchitecturePlan {
    return {
      plan_id: data.plan_id,
      project_identity_id: data.project_identity_id,
      conceptual_category:
        data.conceptual_category as ArchitecturePlan["conceptual_category"],
      complexity_level:
        data.complexity_level as ArchitecturePlan["complexity_level"],
      structural_philosophy:
        data.structural_philosophy as ArchitecturePlan["structural_philosophy"],
      execution_model: data.execution_model,
      concern_separation: data.concern_separation,
      state_management: data.state_management,
      file_strategy: data.file_strategy,
      ui_architecture: data.ui_architecture,
      navigation_architecture: data.navigation_architecture,
      naming_conventions: data.naming_conventions,
      performance_strategy: data.performance_strategy,
      extensibility_model:
        data.extensibility_model as ArchitecturePlan["extensibility_model"],
      maintenance_strategy:
        data.maintenance_strategy as ArchitecturePlan["maintenance_strategy"],
      platform_constraints: data.platform_constraints,
      created_at: new Date(data.created_at),
    };
  }
}
