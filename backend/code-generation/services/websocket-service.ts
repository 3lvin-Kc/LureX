/**
 * WebSocket Service for Real-Time Code Generation Streaming
 *
 * Provides bidirectional communication between frontend and backend for:
 * - Starting code generation
 * - Streaming narration, code chunks, and file events
 * - Cancelling generation mid-stream
 *
 * Uses the 'ws' package for WebSocket server functionality.
 */

import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { v4 as uuidv4 } from "uuid";
import {
  StreamingParser,
  ParseEvent,
  createStreamingParser,
} from "./streaming-parser";
import { getCodeGeneratorService } from "./code-generator-service";
import { getActiveAIProvider } from "./ai-provider-factory";
import { PromptAssembler, getPromptAssembler } from "./prompt-assembler";
import { getScaffoldInjector } from "./scaffold-injector";
import { ProjectIdentityService } from "../../project-identity/project-identity-service";
import { ProjectIdentityRepository } from "../../project-identity/repository";
import { ArchitectureService } from "../../architecture/architecture-service";
import { ArchitectureRepository } from "../../architecture/repository";
import { ProjectStateService } from "../../project-state/project-state-service";
import { ProjectStateRepository } from "../../project-state/repository";
import {
  validatePromptCategory,
  UnsupportedCategoryError,
} from "../../architecture/feature-extractor";
import { NARRATION_INSTRUCTIONS } from "../../instruction/narration-instructions";
import { StorageService, getStorageService } from "./storage-service";
import { ArtifactRepository, getArtifactRepository } from "../repositories/artifact-repository";
import { createArtifactInput, ParsedFile } from "../models/generated-artifact";

// ============================================================================
// Types
// ============================================================================

/**
 * Messages from Frontend to Backend
 */
interface ClientMessage {
  type: "start" | "cancel" | "ping";
  projectId?: string;
  prompt?: string;
  sessionId?: string;
}

/**
 * Messages from Backend to Frontend
 */
interface ServerMessage {
  type:
    | "connected"
    | "session_started"
    | "thinking"
    | "narration"
    | "plan"
    | "file_start"
    | "code_chunk"
    | "file_complete"
    | "generation_complete"
    | "error"
    | "cancelled"
    | "pong"
    | "validation_error";
  sessionId?: string;
  message?: string;
  data?: any;
  timestamp?: string;
}

/**
 * Active generation session
 */
interface GenerationSession {
  sessionId: string;
  projectId: string;
  ws: WebSocket;
  abortController: AbortController;
  parser: StreamingParser;
  status: "starting" | "generating" | "complete" | "cancelled" | "error";
  startedAt: Date;
  files: Map<
    string,
    {
      path: string;
      content: string;
      complete: boolean;
    }
  >;
  scaffold?: ReturnType<typeof getScaffoldInjector extends () => infer T ? T extends { generateScaffold: (...args: any) => infer R } ? () => R : never : never>;
}

// ============================================================================
// WebSocket Service Class
// ============================================================================

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, GenerationSession> = new Map();
  private clientSessions: Map<WebSocket, string> = new Map(); // ws -> sessionId

  // Services
  private projectIdentityService: ProjectIdentityService;
  private architectureService: ArchitectureService;
  private projectStateService: ProjectStateService;
  private promptAssembler: PromptAssembler;
  private storageService: StorageService;
  private artifactRepository: ArtifactRepository;

  constructor() {
    this.storageService = getStorageService();
    this.artifactRepository = getArtifactRepository();
    this.projectIdentityService = new ProjectIdentityService(
      new ProjectIdentityRepository()
    );
    this.architectureService = new ArchitectureService(
      new ArchitectureRepository()
    );
    this.projectStateService = new ProjectStateService(
      new ProjectStateRepository()
    );
    this.promptAssembler = getPromptAssembler();
  }

  /**
   * Initialize WebSocket server attached to HTTP server
   */
  initialize(server: Server): void {
    console.log("[WebSocket] Initializing WebSocket server...");
    
    this.wss = new WebSocketServer({
      server,
      path: "/ws/generate",
    });

    this.wss.on("listening", () => {
      console.log("[WebSocket] Server is now listening for connections");
    });

    this.wss.on("headers", (headers, request) => {
      console.log("[WebSocket] Upgrade request received:", request.url);
    });

    this.wss.on("error", (error) => {
      console.error("[WebSocket] Server error:", error);
    });

    this.wss.on("connection", (ws: WebSocket, request) => {
      console.log("[WebSocket] Client connected from:", request.url);
      console.log("[WebSocket] Client headers:", JSON.stringify({
        origin: request.headers.origin,
        host: request.headers.host,
        upgrade: request.headers.upgrade,
      }));

      // Send connected confirmation
      this.send(ws, {
        type: "connected",
        message: "Connected to code generation service",
        timestamp: new Date().toISOString(),
      });

      // Handle incoming messages
      ws.on("message", async (data: Buffer) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString());
          console.log("[WebSocket] Received message:", message.type);
          await this.handleClientMessage(ws, message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
          this.send(ws, {
            type: "error",
            message: "Invalid message format",
          });
        }
      });

      // Handle disconnect
      ws.on("close", (code, reason) => {
        console.log("[WebSocket] Client disconnected - code:", code, "reason:", reason.toString() || "(none)");
        const sessionId = this.clientSessions.get(ws);
        if (sessionId) {
          this.cancelSession(sessionId, "Client disconnected");
          this.clientSessions.delete(ws);
        }
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error("[WebSocket] Connection error:", error);
      });
    });

    console.log("[WebSocket] Server initialized on /ws/generate");
  }

  /**
   * Handle incoming client message
   */
  private async handleClientMessage(
    ws: WebSocket,
    message: ClientMessage
  ): Promise<void> {
    switch (message.type) {
      case "start":
        await this.handleStartGeneration(ws, message);
        break;

      case "cancel":
        await this.handleCancelGeneration(ws, message);
        break;

      case "ping":
        this.send(ws, { type: "pong", timestamp: new Date().toISOString() });
        break;

      default:
        this.send(ws, {
          type: "error",
          message: `Unknown message type: ${(message as any).type}`,
        });
    }
  }

  /**
   * Handle start generation request
   */
  private async handleStartGeneration(
    ws: WebSocket,
    message: ClientMessage
  ): Promise<void> {
    const { projectId, prompt } = message;

    if (!projectId || !prompt) {
      this.send(ws, {
        type: "error",
        message: "Missing required fields: projectId and prompt",
      });
      return;
    }

    // =========================================================================
    // ZERO_TO_ONE ENFORCEMENT - Strict gatekeeping before any generation
    // =========================================================================
    console.log(`[WS:Gatekeep] Checking gatekeeping for projectId=${projectId}`);
    
    const projectState = await this.projectStateService.getProjectStateById(projectId);
    
    if (projectState) {
      console.log(`[WS:Gatekeep] Found project state: mode_locked=${projectState.mode_locked}, identity_id=${projectState.identity_id}`);
      
      // Check 1: If mode is already ONE_TO_N, reject
      if (projectState.mode_locked === 'ONE_TO_N') {
        console.log(`[WS:Gatekeep] REJECTED - Project already in ONE_TO_N mode`);
        this.send(ws, {
          type: "validation_error",
          message: "Project has already been generated. Create a new project for a fresh start.",
          data: { currentMode: projectState.mode_locked }
        });
        return;
      }

      // Check 2: If artifacts already exist, reject
      const artifactCount = await this.artifactRepository.countByProjectStateId(projectId);
      console.log(`[WS:Gatekeep] Artifact count for project: ${artifactCount}`);
      
      if (artifactCount > 0) {
        console.log(`[WS:Gatekeep] REJECTED - Project already has ${artifactCount} artifacts`);
        this.send(ws, {
          type: "validation_error",
          message: "Project already has generated files. Create a new project to start fresh.",
          data: { artifactCount }
        });
        return;
      }
    }
    
    console.log(`[WS:Gatekeep] ALLOWED - Proceeding with generation`);
    // =========================================================================

    // Validate prompt category
    const categoryValidation = validatePromptCategory(prompt);
    if (!categoryValidation.valid) {
      this.send(ws, {
        type: "validation_error",
        message: categoryValidation.error,
        data: {
          supportedCategories: categoryValidation.supportedCategories,
        },
      });
      return;
    }

    // Create session
    const sessionId = `stream_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const abortController = new AbortController();
    const parser = createStreamingParser();

    const session: GenerationSession = {
      sessionId,
      projectId,
      ws,
      abortController,
      parser,
      status: "starting",
      startedAt: new Date(),
      files: new Map(),
    };

    this.sessions.set(sessionId, session);
    this.clientSessions.set(ws, sessionId);

    // Notify client that session started
    this.send(ws, {
      type: "session_started",
      sessionId,
      message: "Generation session started",
      timestamp: new Date().toISOString(),
    });

    // Start generation asynchronously
    this.executeGeneration(session, prompt).catch((error) => {
      console.error("[WebSocket] Generation error:", error);
      this.sendError(session, error.message);
    });
  }

  /**
   * Handle cancel generation request
   */
  private async handleCancelGeneration(
    ws: WebSocket,
    message: ClientMessage
  ): Promise<void> {
    const sessionId =
      message.sessionId || this.clientSessions.get(ws);

    if (!sessionId) {
      this.send(ws, {
        type: "error",
        message: "No active session to cancel",
      });
      return;
    }

    const cancelled = this.cancelSession(sessionId, "Cancelled by user");

    if (cancelled) {
      this.send(ws, {
        type: "cancelled",
        sessionId,
        message: "Generation cancelled",
        data: {
          partialFiles: this.getPartialFiles(sessionId),
        },
      });
    } else {
      this.send(ws, {
        type: "error",
        message: "Session not found or already completed",
      });
    }
  }

  /**
   * Execute the actual generation with streaming
   */
  private async executeGeneration(
    session: GenerationSession,
    userPrompt: string
  ): Promise<void> {
    const { ws, parser, abortController, projectId } = session;

    try {
      session.status = "generating";

      // Send initial thinking message
      this.send(ws, {
        type: "thinking",
        message: "Analyzing your request...",
      });

      // Step 1: Create or get project identity
      this.send(ws, {
        type: "thinking",
        message: "Creating project identity...",
      });

      const identity = await this.projectIdentityService.create({
        purpose: userPrompt,
      });

      // =========================================================================
      // CRITICAL: Link identity_id to project_states immediately after creation
      // =========================================================================
      console.log(`[WS:Identity] Created identity_id=${identity.identity_id}, linking to project_state...`);
      await this.projectStateService.updateProjectStateById(projectId, {
        identity_id: identity.identity_id
      });
      console.log(`[WS:Identity] Successfully linked identity to project state`);
      // =========================================================================

      // Check for cancellation
      if (abortController.signal.aborted) {
        return;
      }

      // Step 2: Create architecture plan
      this.send(ws, {
        type: "thinking",
        message: "Planning screens and components...",
      });

      let architecture;
      try {
        architecture =
          await this.architectureService.createArchitecturePlan(identity);
      } catch (e: any) {
        if (e.message.includes("already exists")) {
          architecture = await this.architectureService.getArchitecturePlan(
            identity.identity_id
          );
        } else {
          throw e;
        }
      }

      // =========================================================================
      // Update project_state with architecture flags
      // =========================================================================
      console.log(`[WS:Architecture] Updating project state with architecture flags`);
      await this.projectStateService.updateProjectStateById(projectId, {
        architecture_plan_established: true,
        architecture_decisions_recorded: true
      });
      // =========================================================================

      if (!architecture) {
        throw new Error("Failed to create architecture plan");
      }

      // Check for cancellation
      if (abortController.signal.aborted) {
        return;
      }

      // Send plan to frontend
      const featureAnalysis = architecture.feature_analysis;
      if (featureAnalysis) {
        const screens =
          featureAnalysis.screen_requirements.suggested_screens?.map(
            (s) => s.file_name
          ) || [];
        const widgets =
          featureAnalysis.widget_candidates?.map((w) => w.file_name) || [];

        parser.setTotalFilesEstimate(screens.length + widgets.length);

        this.send(ws, {
          type: "plan",
          data: {
            screens,
            widgets,
            category: validatePromptCategory(userPrompt).category,
            minScreens: featureAnalysis.screen_requirements.minimum,
          },
        });

        // Plan will be shown via AI narration from the actual generation
      }

      // Step 3: Generate scaffold
      const scaffoldInjector = getScaffoldInjector();
      const scaffold = scaffoldInjector.generateScaffold(identity);

      // Send scaffold files to frontend immediately
      this.sendScaffoldFiles(session, scaffold);

      // Store scaffold reference for router merging later
      (session as any).scaffold = scaffold;

      // Step 4: Assemble prompt with narration instructions
      const fullPrompt = this.buildStreamingPrompt(
        userPrompt,
        identity,
        architecture,
        scaffold
      );

      // Check for cancellation
      if (abortController.signal.aborted) {
        return;
      }

      // Step 5: Stream from LLM
      this.send(ws, {
        type: "thinking",
        message: "Generating code...",
      });

      const aiProvider = getActiveAIProvider();

      // Use the streaming generator
      const stream = (aiProvider as any).openRouterClient?.streamGenerate(
        fullPrompt,
        {}
      );

      if (!stream) {
        // Fallback to non-streaming if direct stream not available
        await this.executeNonStreamingGeneration(
          session,
          fullPrompt,
          aiProvider
        );
        return;
      }

      // Process stream chunks
      for await (const chunk of stream) {
        // Check for cancellation
        if (abortController.signal.aborted) {
          return;
        }

        if (chunk.content) {
          const events = parser.processChunk(chunk.content);
          this.processParseEvents(session, events);
        }

        if (chunk.done) {
          break;
        }
      }

      // Flush remaining content
      const flushEvents = parser.flush();
      this.processParseEvents(session, flushEvents);

      // Merge router additions into scaffold app_router.dart
      const savedScaffold = (session as any).scaffold;
      if (savedScaffold) {
        const routerAdditions = parser.getRouterAdditions();
        if (routerAdditions && (routerAdditions.imports.length > 0 || routerAdditions.routeCases.length > 0)) {
          const baseRouter = savedScaffold.files.find((f: any) => f.path === "lib/routing/app_router.dart");
          if (baseRouter) {
            const mergedRouter = scaffoldInjector.mergeRouterAdditions(
              baseRouter.content,
              routerAdditions
            );
            
            // Update the router file in session
            session.files.set("lib/routing/app_router.dart", {
              path: "lib/routing/app_router.dart",
              content: mergedRouter,
              complete: true,
            });
            
            // Send updated router to frontend
            this.send(ws, {
              type: "code_chunk",
              data: {
                path: "lib/routing/app_router.dart",
                content: mergedRouter,
                chunkIndex: 0,
              },
            });
            
            this.send(ws, {
              type: "file_complete",
              data: {
                path: "lib/routing/app_router.dart",
                size: mergedRouter.length,
                isRouterUpdate: true,
              },
            });
          }
        }
      }

      // Complete
      session.status = "complete";
      
      // Save files to storage
      await this.saveFilesToStorage(session, projectId);
      
      this.send(ws, {
        type: "generation_complete",
        sessionId: session.sessionId,
        message: "Generation complete!",
        data: {
          filesGenerated: session.files.size,
          files: Array.from(session.files.values()).map((f) => ({
            path: f.path,
            size: f.content.length,
            complete: f.complete,
          })),
        },
      });

      // Update project state
      await this.projectStateService.updateProjectStateById(projectId, {
        mode_locked: "ONE_TO_N",
        artifact_count: session.files.size,
      });
    } catch (error: any) {
      if (!abortController.signal.aborted) {
        session.status = "error";
        this.sendError(session, error.message);
      }
    }
  }

  /**
   * Fallback for non-streaming generation
   */
  private async executeNonStreamingGeneration(
    session: GenerationSession,
    prompt: string,
    aiProvider: any
  ): Promise<void> {
    const { ws, parser, abortController } = session;

    this.send(ws, {
      type: "thinking",
      message: "Starting code generation...",
    });

    const response = await aiProvider.streamGenerateWithRetry(
      prompt,
      {},
      0,
      (chunk: string) => {
        if (abortController.signal.aborted) {
          throw new Error("Generation cancelled");
        }

        const events = parser.processChunk(chunk);
        this.processParseEvents(session, events);
      }
    );

    // Flush remaining
    const flushEvents = parser.flush();
    this.processParseEvents(session, flushEvents);

    session.status = "complete";
    this.send(ws, {
      type: "generation_complete",
      sessionId: session.sessionId,
      data: {
        filesGenerated: session.files.size,
        tokensUsed: response.usage?.totalTokens,
      },
    });
  }

  /**
   * Process parse events and send to client
   */
  private processParseEvents(
    session: GenerationSession,
    events: ParseEvent[]
  ): void {
    const { ws } = session;

    for (const event of events) {
      switch (event.type) {
        case "narration":
          this.send(ws, {
            type: "narration",
            message: event.message,
          });
          break;

        case "plan":
          this.send(ws, {
            type: "plan",
            data: {
              screens: event.screens,
              widgets: event.widgets,
            },
          });
          break;

        case "file_start":
          session.files.set(event.path, {
            path: event.path,
            content: "",
            complete: false,
          });

          this.send(ws, {
            type: "file_start",
            data: {
              path: event.path,
              index: event.index,
              total: event.total,
            },
          });

          // File start narration will come from AI via actual generation context
          break;

        case "code_chunk":
          const file = session.files.get(event.path);
          if (file) {
            file.content += event.content;
          }

          this.send(ws, {
            type: "code_chunk",
            data: {
              path: event.path,
              content: event.content,
              chunkIndex: event.chunkIndex,
            },
          });
          break;

        case "file_complete":
          const completedFile = session.files.get(event.path);
          if (completedFile) {
            completedFile.content = event.content;
            completedFile.complete = true;
          }

          this.send(ws, {
            type: "file_complete",
            data: {
              path: event.path,
              size: event.size,
            },
          });
          break;

        case "parse_error":
          console.warn("[WebSocket] Parse error:", event.message);
          break;
      }
    }
  }

  /**
   * Build the streaming prompt with narration instructions
   */
  private buildStreamingPrompt(
    userPrompt: string,
    identity: any,
    architecture: any,
    scaffold: any
  ): string {
    // Get the base prompt
    const basePrompt = this.promptAssembler.assembleScaffoldBasedPrompt(
      userPrompt,
      identity,
      architecture,
      scaffold
    );

    // Add narration instructions at the beginning
    const narrationInstructions = NARRATION_INSTRUCTIONS;

    return narrationInstructions + basePrompt;
  }

  /**
   * Send scaffold files to client at start of generation
   */
  private sendScaffoldFiles(
    session: GenerationSession,
    scaffold: { files: Array<{ path: string; content: string; governance: string }> }
  ): void {
    const { ws } = session;

    // Scaffold setup notification
    this.send(ws, {
      type: "thinking",
      message: "Setting up project structure...",
    });

    // Add each scaffold file to session and send to client
    for (let i = 0; i < scaffold.files.length; i++) {
      const scaffoldFile = scaffold.files[i];
      const fileIndex = i + 1;
      const totalScaffold = scaffold.files.length;

      // Add to session files
      session.files.set(scaffoldFile.path, {
        path: scaffoldFile.path,
        content: scaffoldFile.content,
        complete: true, // Scaffold files are immediately complete
      });

      // Send file_start event
      this.send(ws, {
        type: "file_start",
        data: {
          path: scaffoldFile.path,
          index: fileIndex,
          total: totalScaffold,
          isScaffold: true,
        },
      });

      // Send complete content as single chunk
      this.send(ws, {
        type: "code_chunk",
        data: {
          path: scaffoldFile.path,
          content: scaffoldFile.content,
          chunkIndex: 0,
        },
      });

      // Send file_complete event
      this.send(ws, {
        type: "file_complete",
        data: {
          path: scaffoldFile.path,
          size: scaffoldFile.content.length,
          isScaffold: true,
        },
      });
    }

    // Scaffold completion notification
    this.send(ws, {
      type: "thinking",
      message: `Base structure ready. Generating custom files...`,
    });
  }

  /**
   * Save all generated files to Supabase Storage and create artifact records
   */
  private async saveFilesToStorage(
    session: GenerationSession,
    projectStateId: string
  ): Promise<void> {
    const { ws, files } = session;

    this.send(ws, {
      type: "thinking",
      message: "Saving files to storage...",
    });

    try {
      // Get project state to get identity_id and architecture_plan_id
      const projectState = await this.projectStateService.getProjectStateById(projectStateId);
      if (!projectState) {
        console.error("[WS:Save] Project state not found for saving files");
        this.send(ws, {
          type: "error",
          message: "Failed to save files: project state not found"
        });
        return;
      }

      const identityId = projectState.identity_id;
      if (!identityId) {
        console.error("[WS:Save] No identity_id found for project state - this should not happen");
        this.send(ws, {
          type: "error",
          message: "Failed to save files: identity not linked to project state"
        });
        return;
      }

      // Get architecture plan
      const architecture = await this.architectureService.getArchitecturePlan(identityId);
      if (!architecture) {
        console.error("[WS:Save] No architecture plan found");
        this.send(ws, {
          type: "error",
          message: "Failed to save files: architecture plan not found"
        });
        return;
      }

      const architecturePlanId = architecture.plan_id;

      // Convert session files to ParsedFile format
      const parsedFiles: ParsedFile[] = [];
      files.forEach((file, path) => {
        if (file.complete && file.content) {
          parsedFiles.push({
            path,
            content: file.content,
            isEntryPoint: path === "lib/main.dart",
          });
        }
      });

      if (parsedFiles.length === 0) {
        console.log("[WS:Save] No files to save");
        return;
      }

      console.log(`[WS:Save] Uploading ${parsedFiles.length} files to storage for project ${projectStateId}`);

      // Upload files to storage
      const uploadResult = await this.storageService.uploadFilesWithRetry(
        projectStateId,
        parsedFiles
      );

      if (!uploadResult.success) {
        console.error("[WS:Save] Failed to upload files:", uploadResult.errors);
        this.send(ws, {
          type: "error",
          message: `Failed to upload files to storage: ${uploadResult.errors?.join(", ") || "unknown error"}`
        });
        return;
      }

      console.log(`[WS:Save] Successfully uploaded files to storage`);

      // Create artifact metadata records
      const artifactInputs = parsedFiles.map((file, index) =>
        createArtifactInput(
          file,
          projectStateId,
          identityId,
          architecturePlanId,
          index
        )
      );

      await this.artifactRepository.createMany(artifactInputs);

      console.log(`[WebSocket] Saved ${parsedFiles.length} files to storage`);
    } catch (error) {
      console.error("[WebSocket] Error saving files to storage:", error);
    }
  }

  /**
   * Cancel a session
   */
  private cancelSession(sessionId: string, reason: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session || session.status === "complete") {
      return false;
    }

    session.abortController.abort();
    session.status = "cancelled";

    console.log(`[WebSocket] Session ${sessionId} cancelled: ${reason}`);

    return true;
  }

  /**
   * Get partial files from a session
   */
  private getPartialFiles(
    sessionId: string
  ): Array<{ path: string; content: string; complete: boolean }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return [];
    }

    return Array.from(session.files.values());
  }

  /**
   * Send error to client
   */
  private sendError(session: GenerationSession, message: string): void {
    this.send(session.ws, {
      type: "error",
      sessionId: session.sessionId,
      message,
      data: {
        partialFiles: Array.from(session.files.values()),
      },
    });
  }

  /**
   * Send message to WebSocket client
   */
  private send(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          ...message,
          timestamp: message.timestamp || new Date().toISOString(),
        })
      );
    }
  }

  /**
   * Cleanup old sessions
   */
  cleanupSessions(maxAgeMs: number = 3600000): void {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.startedAt.getTime();
      if (
        age > maxAgeMs &&
        (session.status === "complete" ||
          session.status === "cancelled" ||
          session.status === "error")
      ) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.status === "starting" || session.status === "generating") {
        count++;
      }
    }
    return count;
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    // Cancel all active sessions
    for (const [sessionId] of this.sessions.entries()) {
      this.cancelSession(sessionId, "Server shutdown");
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    console.log("[WebSocket] Server shutdown complete");
  }
}

// ============================================================================
// Singleton
// ============================================================================

let instance: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
  if (!instance) {
    instance = new WebSocketService();
  }
  return instance;
}

export function createWebSocketService(): WebSocketService {
  return new WebSocketService();
}
