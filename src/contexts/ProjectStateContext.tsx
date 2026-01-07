import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProjectStateApiService } from '../services/project-state-api';

interface ProjectState {
  id: string; // Database row UUID - unique identifier for this project state record
  project_id: string | null; // FK to project_identities - NULL during ZERO_TO_ONE phase
  artifact_count: number;
  has_config: boolean;
  architecture_decisions_recorded: boolean;
  created_at: string;
  mode_locked: 'ZERO_TO_ONE' | 'ONE_TO_N';
  updated_at: string;
}

interface GatekeepingResult {
  mode: 'ZERO_TO_ONE' | 'ONE_TO_N';
  allowed: boolean;
  reason?: string;
  projectState: ProjectState;
}

interface ProjectStateContextType {
  projectState: ProjectState | null;
  mode: 'ZERO_TO_ONE' | 'ONE_TO_N' | null;
  isLoading: boolean;
  error: string | null;
  checkProjectState: (projectId: string | null) => Promise<void>;
  executeGatekeeping: (
    projectId: string | null,
    userInput: string,
    isZeroToOneRequest: boolean
  ) => Promise<GatekeepingResult | null>;
  updateProjectState: (update: Partial<ProjectState>) => Promise<void>;
  createNewProject: () => Promise<ProjectState | null>;
  refreshProjectState: (projectId: string | null) => Promise<void>;
}

const ProjectStateContext = createContext<ProjectStateContextType | undefined>(undefined);

export const ProjectStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [mode, setMode] = useState<'ZERO_TO_ONE' | 'ONE_TO_N' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkProjectState = useCallback(async (projectId: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated before making the call
      const isAuthenticated = await ProjectStateApiService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('User authentication required');
      }

      const state = await ProjectStateApiService.getProjectState(projectId);
      setProjectState(state);

      if (state) {
        setMode(state.mode_locked);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error checking project state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeGatekeeping = useCallback(async (
    projectId: string | null,
    userInput: string,
    isZeroToOneRequest: boolean
  ): Promise<GatekeepingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated before making the call
      const isAuthenticated = await ProjectStateApiService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('User authentication required');
      }

      const result = await ProjectStateApiService.executeGatekeeping(
        projectId,
        userInput,
        isZeroToOneRequest
      );

      setProjectState(result.projectState);
      setMode(result.mode);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error executing gatekeeping:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProjectState = useCallback(async (update: Partial<ProjectState>) => {
    if (!projectState) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated before making the call
      const isAuthenticated = await ProjectStateApiService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('User authentication required');
      }

      const updated = await ProjectStateApiService.updateProjectState(
        projectState.project_id,
        {
          artifact_count: update.artifact_count,
          has_config: update.has_config,
          architecture_decisions_recorded: update.architecture_decisions_recorded
        }
      );

      setProjectState(updated);
      setMode(updated.mode_locked);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating project state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectState]);

  const createNewProject = useCallback(async (): Promise<ProjectState | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated before making the call
      const isAuthenticated = await ProjectStateApiService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('User authentication required');
      }

      const newProject = await ProjectStateApiService.createNewProject();
      setProjectState(newProject);
      setMode(newProject.mode_locked);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error creating new project:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProjectState = useCallback(async (projectId: string | null) => {
    await checkProjectState(projectId);
  }, [checkProjectState]);

  // Load initial state when the context is created
  useEffect(() => {
    // Initialize with a default check - you can customize this as needed
    // Only check project state if user is authenticated
    const initialize = async () => {
      const isAuthenticated = await ProjectStateApiService.isAuthenticated();
      if (isAuthenticated) {
        checkProjectState(null);
      }
    };

    initialize();
  }, [checkProjectState]);

  const value: ProjectStateContextType = {
    projectState,
    mode,
    isLoading,
    error,
    checkProjectState,
    executeGatekeeping,
    updateProjectState,
    createNewProject,
    refreshProjectState
  };

  return (
    <ProjectStateContext.Provider value={value}>
      {children}
    </ProjectStateContext.Provider>
  );
};

export const useProjectState = (): ProjectStateContextType => {
  const context = useContext(ProjectStateContext);
  if (context === undefined) {
    throw new Error('useProjectState must be used within a ProjectStateProvider');
  }
  return context;
};
