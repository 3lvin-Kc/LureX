import { supabase } from '../integrations/supabase/client';

interface ProjectStateResponse {
  projectState: {
    id: string; // Database row UUID - unique identifier for this project state record
    project_id: string | null; // FK to project_identities - NULL during ZERO_TO_ONE phase
    artifact_count: number;
    has_config: boolean;
    architecture_decisions_recorded: boolean;
    created_at: string;
    mode_locked: 'ZERO_TO_ONE' | 'ONE_TO_N';
    updated_at: string;
  };
}

interface GatekeepingResponse {
  mode: 'ZERO_TO_ONE' | 'ONE_TO_N';
  allowed: boolean;
  reason?: string;
  projectState: {
    id: string; // Database row UUID - unique identifier for this project state record
    project_id: string | null; // FK to project_identities - NULL during ZERO_TO_ONE phase
    artifact_count: number;
    has_config: boolean;
    architecture_decisions_recorded: boolean;
    created_at: string;
    mode_locked: 'ZERO_TO_ONE' | 'ONE_TO_N';
    updated_at: string;
  };
}

interface UpdateProjectStateRequest {
  artifact_count?: number;
  has_config?: boolean;
  architecture_decisions_recorded?: boolean;
}

/**
 * API service for interacting with the backend project state system
 */
export class ProjectStateApiService {
  // Use relative URL to work with Vite proxy
  private static readonly API_BASE_URL = '/api/project-state';

  /**
   * Check the current project state and mode
   */
  static async getProjectState(projectId: string | null): Promise<ProjectStateResponse['projectState'] | null> {
    const token = await this.ensureValidToken();

    try {
      const url = projectId ? `${this.API_BASE_URL}/${projectId}` : this.API_BASE_URL;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get project state: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projectState;
    } catch (error) {
      console.error('Error getting project state:', error);
      throw error;
    }
  }

  /**
   * Execute the mode detection gatekeeping logic
   */
  static async executeGatekeeping(
    projectId: string | null,
    userInput: string,
    isZeroToOneRequest: boolean
  ): Promise<GatekeepingResponse> {
    const token = await this.ensureValidToken();

    try {
      const response = await fetch(`${this.API_BASE_URL}/gatekeep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          userInput,
          isZeroToOneRequest
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute gatekeeping: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error executing gatekeeping:', error);
      throw error;
    }
  }

  /**
   * Update the project state
   */
  static async updateProjectState(
    projectId: string | null,
    update: UpdateProjectStateRequest
  ): Promise<ProjectStateResponse['projectState']> {
    const token = await this.ensureValidToken();

    try {
      const url = projectId ? `${this.API_BASE_URL}/${projectId}` : this.API_BASE_URL;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project state: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projectState;
    } catch (error) {
      console.error('Error updating project state:', error);
      throw error;
    }
  }

  /**
   * Create a new project state for zero-to-one flow
   */
  static async createNewProject(): Promise<ProjectStateResponse['projectState']> {
    const token = await this.ensureValidToken();

    try {
      const response = await fetch(`${this.API_BASE_URL}/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create new project: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projectState;
    } catch (error) {
      console.error('Error creating new project:', error);
      throw error;
    }
  }

  /**
   * Helper to get the access token from Supabase
   */
  private static async getAccessToken(): Promise<string | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session?.access_token || null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null && token !== '';
  }

  static async ensureValidToken(): Promise<string> {
    let token = await this.getAccessToken();

    if (!token) {
      // Try to refresh or get a new session
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        throw new Error('No valid authentication token available');
      }
      token = session?.access_token || null;
    }

    if (!token) {
      throw new Error('No valid authentication token available');
    }

    return token;
  }
}
