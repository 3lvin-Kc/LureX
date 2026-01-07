import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";

// Load environment variables from .env file
dotenv.config();

import { ProjectStateService } from "./project-state/project-state-service";
import { ProjectStateRepository } from "./project-state/repository";
import {
  CodeGeneratorService,
  getCodeGeneratorService,
  createCodeGeneratorService,
} from "./code-generation/services/code-generator-service";
import {
  ArtifactRepository,
  getArtifactRepository,
} from "./code-generation/repositories/artifact-repository";
import {
  StorageService,
  getStorageService,
} from "./code-generation/services/storage-service";
import {
  GenerationSessionInput,
  GenerationStatus,
} from "./code-generation/models/generation-result";
import { ArchitectureService } from "./architecture/architecture-service";
import { ArchitectureRepository } from "./architecture/repository";
import { ProjectIdentityService } from "./project-identity/project-identity-service";
import { ProjectIdentityRepository } from "./project-identity/repository";
import {
  validatePromptCategory,
  SUPPORTED_CATEGORIES,
  UnsupportedCategoryError,
} from "./architecture/feature-extractor";
import { getWebSocketService } from "./code-generation/services/websocket-service";
import { getChatService } from "./chat/chat-service";

// Initialize the project state service with required repository
const repository = new ProjectStateRepository();
const projectStateService = new ProjectStateService(repository);

// Initialize code generation services
const artifactRepository = getArtifactRepository();
const storageService = getStorageService();

// Initialize architecture and identity services
const architectureRepository = new ArchitectureRepository();
const architectureService = new ArchitectureService(architectureRepository);
const projectIdentityRepository = new ProjectIdentityRepository();
const projectIdentityService = new ProjectIdentityService(
  projectIdentityRepository,
);

// Track active generation sessions for status polling
interface ActiveSession {
  sessionId: string;
  projectStateId: string;
  status: GenerationStatus;
  message: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  filesGenerated?: number;
  result?: any;
}

const activeSessions = new Map<string, ActiveSession>();

const app = express();
const PORT = process.env.PORT || 3000;

// Auth middleware - always requires valid Bearer token
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format" });
  }

  // Token is present and properly formatted
  // In production, you would verify the JWT token here with Supabase
  next();
};

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// Project State Endpoints
// ============================================================================

app.get(
  "/api/project-state",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const projectState = await projectStateService.getProjectState(null);

      if (!projectState) {
        // Return a default ZERO_TO_ONE state without creating database records
        const defaultState = {
          project_id: null,
          artifact_count: 0,
          has_config: false,
          architecture_decisions_recorded: false,
          architecture_plan_established: false,
          mode_locked: "ZERO_TO_ONE" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return res.json({ projectState: defaultState });
      }

      res.json({ projectState });
    } catch (error) {
      console.error("Error getting project state:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

app.get(
  "/api/project-state/:projectId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      // Use flexible lookup that tries id first, then project_id
      // This supports both database row id (for ZERO_TO_ONE phase when project_id is NULL)
      // and project_id (for established projects linked to project_identities)
      const projectState =
        await projectStateService.getProjectStateByIdOrProjectId(projectId);

      if (!projectState) {
        return res.status(404).json({ error: "Project state not found" });
      }

      res.json({ projectState });
    } catch (error) {
      console.error("Error getting project state:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

app.post(
  "/api/project-state/gatekeep",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectId, userInput, isZeroToOneRequest } = req.body;
      const result = await projectStateService.executeGatekeeping(
        projectId || null,
        userInput || "",
        isZeroToOneRequest || false,
      );

      res.json(result);
    } catch (error) {
      console.error("Error executing gatekeeping:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

app.put(
  "/api/project-state/:projectId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { artifact_count, has_config, architecture_decisions_recorded } =
        req.body;

      // Use updateProjectStateById which supports lookup by database row id
      // This is necessary during ZERO_TO_ONE phase when project_id is NULL
      const updatedState = await projectStateService.updateProjectStateById(
        projectId,
        {
          artifact_count,
          has_config,
          architecture_decisions_recorded,
        },
      );

      res.json({ projectState: updatedState });
    } catch (error) {
      console.error("Error updating project state:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

app.post(
  "/api/project-state/new",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const newProject = await projectStateService.createNewProject();
      res.status(201).json({ projectState: newProject });
    } catch (error) {
      console.error("Error creating new project:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
        hint: "Check if foreign key constraints or RLS policies are blocking the insert",
      });
    }
  },
);

// ============================================================================
// Code Generation Endpoints
// ============================================================================

/**
 * POST /api/generate
 *
 * Triggers the Zero-to-One code generation pipeline.
 * This endpoint starts the generation asynchronously and returns a session ID
 * that can be used to poll for status.
 *
 * Request body:
 * {
 *   project_state_id: string,  // The project state ID (database row id)
 *   user_prompt: string        // The user's description of what to build
 * }
 *
 * Response:
 * {
 *   sessionId: string,
 *   status: 'pending' | 'generating' | 'completed' | 'failed',
 *   message: string
 * }
 */
app.post(
  "/api/generate",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { project_state_id, user_prompt } = req.body;

      // Validate required fields
      if (!project_state_id) {
        return res.status(400).json({
          error: "Missing required field: project_state_id",
          hint: "Create a new project first using POST /api/project-state/new",
        });
      }

      if (
        !user_prompt ||
        typeof user_prompt !== "string" ||
        user_prompt.trim().length === 0
      ) {
        return res.status(400).json({
          error: "Missing or invalid user_prompt",
          hint: "Provide a description of the Flutter app you want to generate",
        });
      }

      // Validate prompt against supported categories
      const categoryValidation = validatePromptCategory(user_prompt);
      if (!categoryValidation.valid) {
        return res.status(400).json({
          error: "Unsupported app type",
          message: categoryValidation.error,
          supportedCategories: categoryValidation.supportedCategories,
          hint: "Please modify your prompt to match one of the supported app categories.",
        });
      }

      // Verify project state exists
      const projectState =
        await projectStateService.getProjectStateById(project_state_id);
      if (!projectState) {
        return res.status(404).json({
          error: "Project state not found",
          hint: "Create a new project first using POST /api/project-state/new",
        });
      }

      // Check if project is in ZERO_TO_ONE mode
      if (projectState.mode_locked !== "ZERO_TO_ONE") {
        return res.status(400).json({
          error: "Project is not in ZERO_TO_ONE mode",
          currentMode: projectState.mode_locked,
          hint: "This endpoint is only for initial code generation. Use modification endpoints for existing projects.",
        });
      }

      // Check if artifacts already exist
      const existingArtifacts =
        await artifactRepository.countByProjectStateId(project_state_id);
      if (existingArtifacts > 0) {
        return res.status(400).json({
          error: "Project already has generated artifacts",
          artifactCount: existingArtifacts,
          hint: "This project has already been generated. Create a new project for a fresh start.",
        });
      }

      // Create session
      const sessionId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: ActiveSession = {
        sessionId,
        projectStateId: project_state_id,
        status: "pending",
        message: "Generation queued...",
        progress: 0,
        startedAt: new Date(),
      };
      activeSessions.set(sessionId, session);

      // Return immediately with session ID
      res.status(202).json({
        sessionId,
        status: "pending",
        message:
          "Generation started. Poll /api/generate/:sessionId/status for updates.",
        projectStateId: project_state_id,
      });

      // Start generation asynchronously
      const codeGeneratorService = getCodeGeneratorService();

      const input: GenerationSessionInput = {
        project_state_id,
        user_prompt: user_prompt.trim(),
        max_attempts: 3,
      };

      // Run generation with callbacks to update session status
      codeGeneratorService
        .executeZeroToOnePipeline(input, {
          onStatusChange: (status, message) => {
            const existingSession = activeSessions.get(sessionId);
            if (existingSession) {
              existingSession.status = status;
              existingSession.message = message;

              // Update progress based on status
              switch (status) {
                case "pending":
                  existingSession.progress = 10;
                  break;
                case "generating":
                  existingSession.progress = 30;
                  break;
                case "validating":
                  existingSession.progress = 60;
                  break;
                case "uploading":
                  existingSession.progress = 80;
                  break;
                case "completed":
                  existingSession.progress = 100;
                  break;
                case "failed":
                  existingSession.progress = 0;
                  break;
                default:
                  existingSession.progress = 50;
              }
            }
          },
          onError: (error, retrying, attempt) => {
            const existingSession = activeSessions.get(sessionId);
            if (existingSession) {
              if (retrying) {
                existingSession.status = "retrying";
                existingSession.message = `Attempt ${attempt} failed: ${error}. Retrying...`;
              } else {
                existingSession.status = "failed";
                existingSession.message = error;
                existingSession.error = error;
                existingSession.completedAt = new Date();
              }
            }
          },
          onComplete: (result) => {
            const existingSession = activeSessions.get(sessionId);
            if (existingSession) {
              existingSession.completedAt = new Date();
              existingSession.result = result;

              if (result.success) {
                existingSession.status = "completed";
                existingSession.message = `Successfully generated ${result.files_count} files`;
                existingSession.filesGenerated = result.files_count;
                existingSession.progress = 100;
              } else {
                existingSession.status = "failed";
                existingSession.message =
                  result.validation_errors?.[0]?.message || "Generation failed";
                existingSession.error = result.validation_errors?.[0]?.message;
                existingSession.progress = 0;
              }
            }
          },
        })
        .catch((error) => {
          const existingSession = activeSessions.get(sessionId);
          if (existingSession) {
            existingSession.status = "failed";
            existingSession.message =
              error instanceof Error ? error.message : String(error);
            existingSession.error = existingSession.message;
            existingSession.completedAt = new Date();
          }
        });
    } catch (error) {
      console.error("Error starting generation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
      });
    }
  },
);

/**
 * GET /api/generate/:sessionId/status
 *
 * Polls the status of a generation session.
 *
 * Response:
 * {
 *   sessionId: string,
 *   status: 'pending' | 'generating' | 'validating' | 'uploading' | 'completed' | 'failed' | 'retrying',
 *   message: string,
 *   progress: number (0-100),
 *   startedAt: string,
 *   completedAt?: string,
 *   error?: string,
 *   filesGenerated?: number,
 *   result?: GenerationResult
 * }
 */
app.get(
  "/api/generate/:sessionId/status",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = activeSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          error: "Session not found",
          hint: "The session may have expired or never existed. Start a new generation with POST /api/generate",
        });
      }

      res.json({
        sessionId: session.sessionId,
        projectStateId: session.projectStateId,
        status: session.status,
        message: session.message,
        progress: session.progress,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString(),
        error: session.error,
        filesGenerated: session.filesGenerated,
        // Only include full result if completed
        result:
          session.status === "completed" || session.status === "failed"
            ? session.result
            : undefined,
      });
    } catch (error) {
      console.error("Error getting session status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

/**
 * GET /api/artifacts/:projectStateId
 *
 * Gets all generated artifacts for a project.
 *
 * Response:
 * {
 *   projectStateId: string,
 *   artifactCount: number,
 *   artifacts: GeneratedArtifact[]
 * }
 */
app.get(
  "/api/artifacts/:projectStateId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectStateId } = req.params;

      // Verify project state exists
      const projectState =
        await projectStateService.getProjectStateById(projectStateId);
      if (!projectState) {
        return res.status(404).json({ error: "Project state not found" });
      }

      const artifacts =
        await artifactRepository.findByProjectStateId(projectStateId);

      res.json({
        projectStateId,
        artifactCount: artifacts.length,
        artifacts,
      });
    } catch (error) {
      console.error("Error getting artifacts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

/**
 * GET /api/artifacts/:projectStateId/:filePath
 *
 * Gets the content of a specific generated file.
 *
 * Response:
 * {
 *   filePath: string,
 *   content: string,
 *   size: number,
 *   mimeType: string
 * }
 */
app.get(
  /\/api\/artifacts\/([^\/]+)\/(.*)/,
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const projectStateId = req.params[0];
      const filePath = req.params[1];

      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      // Find the artifact metadata
      const artifact = await artifactRepository.findByProjectStateAndPath(
        projectStateId,
        filePath,
      );
      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found", filePath });
      }

      // Download the file content from storage
      const fileContent = await storageService.downloadFile(
        artifact.storage_path,
      );
      if (!fileContent) {
        return res.status(404).json({
          error: "File content not found in storage",
          storagePath: artifact.storage_path,
        });
      }

      res.json({
        filePath: artifact.file_path,
        fileName: artifact.file_name,
        content: fileContent.content,
        size: fileContent.size,
        mimeType: fileContent.mimeType,
        isEntryPoint: artifact.is_entry_point,
      });
    } catch (error) {
      console.error("Error getting artifact content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

/**
 * DELETE /api/artifacts/:projectStateId
 *
 * Deletes all artifacts for a project (both metadata and storage files).
 * This can be used to allow regeneration.
 */
app.delete(
  "/api/artifacts/:projectStateId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectStateId } = req.params;

      // Verify project state exists
      const projectState =
        await projectStateService.getProjectStateById(projectStateId);
      if (!projectState) {
        return res.status(404).json({ error: "Project state not found" });
      }

      // Delete files from storage
      const filesDeleted =
        await storageService.deleteProjectFiles(projectStateId);

      // Delete artifact metadata from database
      const artifactsDeleted =
        await artifactRepository.deleteByProjectStateId(projectStateId);

      // Reset project state to ZERO_TO_ONE mode
      await projectStateService.updateProjectStateById(projectStateId, {
        mode_locked: "ZERO_TO_ONE",
        artifact_count: 0,
      });

      res.json({
        success: true,
        message: "Artifacts deleted successfully",
        filesDeleted,
        artifactsDeleted,
      });
    } catch (error) {
      console.error("Error deleting artifacts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

// ============================================================================
// Code Generator Configuration Endpoint
// ============================================================================

/**
 * GET /api/generate/config
 *
 * Gets the current code generator configuration (for debugging/admin purposes).
 */
app.get(
  "/api/generate/config",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const codeGeneratorService = getCodeGeneratorService();
      const config = codeGeneratorService.getConfiguration();

      res.json({
        config,
        storage: {
          bucket: storageService.getBucketName(),
        },
      });
    } catch (error) {
      console.error("Error getting config:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

/**
 * POST /api/generate/test-connection
 *
 * Tests the AI provider connection.
 */
app.post(
  "/api/generate/test-connection",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const codeGeneratorService = getCodeGeneratorService();
      const result = await codeGeneratorService.testAIProviderConnection();

      res.json(result);
    } catch (error) {
      console.error("Error testing AI provider connection:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: errorMessage,
      });
    }
  },
);

// ============================================================================
// Architecture Endpoints
// ============================================================================

/**
 * GET /api/architecture/plan/:identity_id
 *
 * Gets the architecture plan for a project identity.
 */
app.get(
  "/api/architecture/plan/:identity_id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { identity_id } = req.params;

      if (!identity_id) {
        return res.status(400).json({
          error: "Missing required parameter: identity_id",
        });
      }

      const plan = await architectureService.getArchitecturePlan(identity_id);

      if (!plan) {
        return res.status(404).json({
          error: "Architecture plan not found",
          hint: "The architecture plan may not have been created yet for this identity.",
        });
      }

      res.json(plan);
    } catch (error) {
      console.error("Error getting architecture plan:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
      });
    }
  },
);

/**
 * POST /api/architecture/plan
 *
 * Creates an architecture plan for a project identity.
 */
app.post(
  "/api/architecture/plan",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { identity_id, project_id } = req.body;

      if (!identity_id) {
        return res.status(400).json({
          error: "Missing required field: identity_id",
        });
      }

      // Get the project identity
      const identity = await projectIdentityService.getById(identity_id);
      if (!identity) {
        return res.status(404).json({
          error: "Project identity not found",
        });
      }

      // Create the architecture plan
      const plan = await architectureService.createArchitecturePlan(identity);

      // Update project state if provided
      if (project_id) {
        await projectStateService.updateProjectStateById(project_id, {
          architecture_plan_established: true,
        });
      }

      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating architecture plan:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if it's an unsupported category error
      if (error instanceof UnsupportedCategoryError) {
        return res.status(400).json({
          error: "Unsupported app type",
          message: errorMessage,
          supportedCategories: error.supportedCategories,
        });
      }

      // Check if plan already exists
      if (errorMessage.includes("already exists")) {
        return res.status(409).json({
          error: "Architecture plan already exists",
          hint: "Use GET /api/architecture/plan/:identity_id to retrieve it.",
        });
      }

      res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
      });
    }
  },
);

// ============================================================================
// Prompt Validation Endpoints
// ============================================================================

/**
 * POST /api/validate/prompt
 *
 * Validates if a user prompt matches a supported app category.
 * Use this before starting generation to provide early feedback.
 */
app.post(
  "/api/validate/prompt",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({
          error: "Missing or invalid prompt",
          hint: "Provide a description of the Flutter app you want to generate",
        });
      }

      const validation = validatePromptCategory(prompt);

      if (validation.valid) {
        res.json({
          valid: true,
          category: validation.category,
          message: `Your prompt matches the "${validation.category}" category.`,
        });
      } else {
        res.status(400).json({
          valid: false,
          error: validation.error,
          supportedCategories: validation.supportedCategories,
          hint: "Modify your prompt to match one of the supported categories.",
        });
      }
    } catch (error) {
      console.error("Error validating prompt:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
      });
    }
  },
);

/**
 * GET /api/categories
 *
 * Returns the list of supported app categories.
 */
app.get("/api/categories", (req: Request, res: Response) => {
  res.json({
    categories: SUPPORTED_CATEGORIES,
    count: SUPPORTED_CATEGORIES.length,
    hint: "Use one of these categories when describing your app.",
  });
});

// ============================================================================
// Utility Endpoints
// ============================================================================

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      projectState: "available",
      codeGeneration: "available",
      storage: "available",
      architecture: "available",
    },
  });
});

// Active sessions endpoint (for debugging)
app.get("/api/sessions", authMiddleware, (req: Request, res: Response) => {
  const sessions = Array.from(activeSessions.values()).map((session) => ({
    sessionId: session.sessionId,
    projectStateId: session.projectStateId,
    status: session.status,
    progress: session.progress,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString(),
  }));

  res.json({
    activeSessionCount: sessions.length,
    sessions,
  });
});

// Cleanup old sessions periodically (run every 30 minutes)
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    for (const [sessionId, session] of activeSessions.entries()) {
      const sessionAge = now - session.startedAt.getTime();
      if (
        sessionAge > maxAge &&
        (session.status === "completed" || session.status === "failed")
      ) {
        activeSessions.delete(sessionId);
      }
    }
  },
  30 * 60 * 1000,
);

// ============================================================================
// Chat/Conversation Endpoints
// ============================================================================

const chatService = getChatService();

/**
 * GET /api/conversations/:projectStateId
 * Gets the conversation and messages for a project
 */
app.get(
  "/api/conversations/:projectStateId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectStateId } = req.params;
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(400).json({ error: "Missing x-user-id header" });
      }

      const conversation = await chatService.getConversationByProjectState(
        projectStateId,
        userId
      );

      res.json({ conversation });
    } catch (error) {
      console.error("Error getting conversation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Internal server error", details: errorMessage });
    }
  }
);

/**
 * POST /api/conversations
 * Creates a new conversation for a project
 */
app.post(
  "/api/conversations",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { projectStateId, title } = req.body;
      const userId = req.headers["x-user-id"] as string;

      if (!projectStateId) {
        return res.status(400).json({ error: "Missing projectStateId" });
      }

      if (!userId) {
        return res.status(400).json({ error: "Missing x-user-id header" });
      }

      const conversation = await chatService.getOrCreateConversation(
        projectStateId,
        userId
      );

      res.status(201).json({ conversation });
    } catch (error) {
      console.error("Error creating conversation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Internal server error", details: errorMessage });
    }
  }
);

/**
 * POST /api/conversations/:conversationId/messages
 * Adds a message to a conversation
 */
app.post(
  "/api/conversations/:conversationId/messages",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { role, content, messageType, metadata } = req.body;

      if (!role || !content) {
        return res.status(400).json({ error: "Missing role or content" });
      }

      const message = await chatService.addMessage(
        conversationId,
        role,
        content,
        messageType || "text",
        metadata || {}
      );

      res.status(201).json({ message });
    } catch (error) {
      console.error("Error adding message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Internal server error", details: errorMessage });
    }
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Create HTTP server and attach WebSocket
const httpServer = createServer(app);

// Initialize WebSocket service
const wsService = getWebSocketService();
wsService.initialize(httpServer);

// Cleanup WebSocket sessions periodically
setInterval(
  () => {
    wsService.cleanupSessions();
  },
  30 * 60 * 1000,
);

httpServer.listen(PORT, () => {
  console.log(`🚀 Project State Backend Server running on port ${PORT}`);
  console.log(`   - API Base URL: http://localhost:${PORT}/api`);
  console.log(
    `   - Project State Endpoints: http://localhost:${PORT}/api/project-state`,
  );
  console.log(
    `   - Code Generation Endpoints: http://localhost:${PORT}/api/generate`,
  );
  console.log(
    `   - Artifact Endpoints: http://localhost:${PORT}/api/artifacts`,
  );
  console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   - WebSocket: ws://localhost:${PORT}/ws/generate`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  wsService.shutdown();
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
export { httpServer, wsService };
