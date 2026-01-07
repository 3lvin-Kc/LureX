import { Request, Response } from 'express';
import { ProjectStateService } from '../project-state/project-state-service';
import { ProjectState } from '../project-state/model';
import { ProjectStateRepository } from '../project-state/repository';

/**
 * API endpoint for handling project state and mode detection
 * This represents how the backend would integrate the hard boundary layer
 */
export class ProjectStateEndpoint {
  private service: ProjectStateService;

  constructor(service?: ProjectStateService) {
    this.service = service || new ProjectStateService(new ProjectStateRepository());
  }

  /**
   * Main endpoint that handles requests and enforces mode detection
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userInput, isZeroToOneRequest } = req.body;
      const userId = req.headers['user-id'] as string; // Assuming user authentication

      if (!userId) {
        res.status(401).json({ error: 'User authentication required' });
        return;
      }

      // Execute the hard boundary gatekeeping logic
      const result = await this.service.executeGatekeeping(
        projectId || null,
        userInput || '',
        isZeroToOneRequest || false
      );

      // If the request is not allowed, return an error
      if (!result.allowed) {
        res.status(403).json({
          error: result.reason,
          mode: result.mode,
          projectState: result.projectState
        });
        return;
      }

      // If allowed, proceed with the appropriate pipeline based on mode
      if (result.mode === 'ZERO_TO_ONE') {
        // Route to Zero-to-One Pipeline
        await this.handleZeroToOneRequest(req, res, result.projectState);
      } else {
        // Route to One-to-N Pipeline
        await this.handleOneToNRequest(req, res, result.projectState);
      }
    } catch (error) {
      console.error('Error in project state endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handle Zero-to-One pipeline requests
   */
  private async handleZeroToOneRequest(req: Request, res: Response, projectState: ProjectState): Promise<void> {
    // This would connect to the actual zero-to-one pipeline
    // For now, return a success response indicating the mode
    res.status(200).json({
      message: 'Request routed to Zero-to-One pipeline',
      mode: 'ZERO_TO_ONE',
      projectState
    });
  }

  /**
   * Handle One-to-N pipeline requests
   */
  private async handleOneToNRequest(req: Request, res: Response, projectState: ProjectState): Promise<void> {
    // This would connect to the actual one-to-n pipeline
    // For now, return a success response indicating the mode
    res.status(200).json({
      message: 'Request routed to One-to-N pipeline',
      mode: 'ONE_TO_N',
      projectState
    });
  }

  /**
   * Endpoint to get current project state
   */
  async getProjectState(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.headers['user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: 'User authentication required' });
        return;
      }

      const projectState = await this.service.getProjectState(projectId || null);

      if (!projectState) {
        res.status(404).json({ error: 'Project state not found' });
        return;
      }

      res.status(200).json({
        projectState
      });
    } catch (error) {
      console.error('Error getting project state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Endpoint to update project state (used internally by the system)
   */
  async updateProjectState(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { artifact_count, has_config, architecture_decisions_recorded } = req.body;
      const userId = req.headers['user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: 'User authentication required' });
        return;
      }

      const updatedState = await this.service.updateProjectState(projectId || null, {
        artifact_count,
        has_config,
        architecture_decisions_recorded
      });

      res.status(200).json({
        projectState: updatedState
      });
    } catch (error) {
      console.error('Error updating project state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}