/**
 * Generation Store
 *
 * Zustand store for managing code generation state with WebSocket integration.
 * Handles real-time streaming, narration, and generation lifecycle.
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ============================================================================
// Types
// ============================================================================

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export type GenerationStatus =
  | "idle"
  | "planning"
  | "generating"
  | "complete"
  | "error"
  | "cancelled";

export interface Narration {
  id: string;
  message: string;
  timestamp: Date;
  type: "thinking" | "narration" | "plan";
}

export interface GenerationPlan {
  screens: string[];
  widgets: string[];
  category: string;
  minScreens: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  status: "pending" | "streaming" | "complete" | "error";
  isPartial: boolean;
  size: number;
}

export interface GenerationError {
  message: string;
  code?: string;
  partialFiles?: GeneratedFile[];
}

// WebSocket message data types
interface PlanData {
  screens: string[];
  widgets: string[];
  category: string;
  minScreens: number;
}

interface FileStartData {
  path: string;
  index: number;
  total: number;
}

interface CodeChunkData {
  path: string;
  content: string;
  chunkIndex?: number;
}

interface FileCompleteData {
  path: string;
  size: number;
}

interface GenerationCompleteData {
  filesGenerated: number;
}

interface ErrorData {
  partialFiles?: GeneratedFile[];
}

interface CancelledData {
  partialFiles: GeneratedFile[];
}

// WebSocket message types from server
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
  data?:
    | PlanData
    | FileStartData
    | CodeChunkData
    | FileCompleteData
    | GenerationCompleteData
    | ErrorData
    | CancelledData;
  timestamp?: string;
}

// ============================================================================
// Store Interface
// ============================================================================

export interface UserMessage {
  id: string;
  content: string;
  timestamp: Date;
}

interface GenerationState {
  // Connection
  socket: WebSocket | null;
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  // Session
  sessionId: string | null;
  projectId: string | null;
  generationStatus: GenerationStatus;

  // User Messages
  userMessages: UserMessage[];

  // Narration
  narrations: Narration[];
  currentThinking: string | null;

  // Plan
  plan: GenerationPlan | null;

  // Progress
  currentFileIndex: number;
  totalFiles: number;
  currentFilePath: string | null;

  // Files
  files: Map<string, GeneratedFile>;

  // Error
  error: GenerationError | null;

  // Timestamps
  startedAt: Date | null;
  completedAt: Date | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  startGeneration: (projectId: string, prompt: string) => void;
  cancelGeneration: () => void;
  reset: () => void;
  resetReconnect: () => void;
  addUserMessage: (content: string) => void;
  loadChatHistory: (messages: Array<{ role: string; content: string; message_type: string }>) => void;

  // Internal handlers (called from WebSocket messages)
  _handleMessage: (message: ServerMessage) => void;
  _addNarration: (message: string, type: Narration["type"]) => void;
  _setThinking: (message: string | null) => void;
  _setPlan: (plan: GenerationPlan) => void;
  _startFile: (path: string, index: number, total: number) => void;
  _appendChunk: (path: string, content: string) => void;
  _completeFile: (path: string, size: number) => void;
  _setComplete: (filesCount: number) => void;
  _setError: (error: GenerationError) => void;
  _setCancelled: (partialFiles: GeneratedFile[]) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateNarrationId(): string {
  return `narration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getWebSocketUrl(): string {
  // Use the same host as the main application for WebSocket connection
  // This allows the WebSocket to work properly with the proxy configuration
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host; // Use the same host as the main app
  return `${protocol}//${host}/ws/generate`;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useGenerationStore = create<GenerationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    socket: null,
    connectionStatus: "disconnected",
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    sessionId: null,
    projectId: null,
    generationStatus: "idle",
    userMessages: [],
    narrations: [],
    currentThinking: null,
    plan: null,
    currentFileIndex: 0,
    totalFiles: 0,
    currentFilePath: null,
    files: new Map(),
    error: null,
    startedAt: null,
    completedAt: null,

    // ========================================================================
    // Public Actions
    // ========================================================================

    connect: () => {
      const state = get();

      // Don't reconnect if already connected or connecting
      if (
        state.connectionStatus === "connected" ||
        state.connectionStatus === "connecting"
      ) {
        return;
      }

      set({ connectionStatus: "connecting" });

      // First check if backend is available
      console.log("[GenerationStore] Checking backend health...");
      
      fetch('/api/health')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          console.log("[GenerationStore] Backend is healthy, connecting WebSocket...");
          
          const wsUrl = getWebSocketUrl();
          console.log("[GenerationStore] Connecting to:", wsUrl);

          try {
            const socket = new WebSocket(wsUrl);
            
            // Connection timeout - 10 seconds
            const connectionTimeout = setTimeout(() => {
              if (get().connectionStatus === "connecting") {
                console.error("[GenerationStore] WebSocket connection timeout after 10s");
                socket.close();
                set({ connectionStatus: "disconnected" });
                
                // Trigger reconnect
                const attempts = get().reconnectAttempts;
                if (attempts < get().maxReconnectAttempts) {
                  const delay = Math.min(3000 * Math.pow(2, attempts), 60000);
                  console.log(`[GenerationStore] Will retry in ${delay / 1000}s...`);
                  setTimeout(() => {
                    set({ reconnectAttempts: attempts + 1 });
                    get().connect();
                  }, delay);
                }
              }
            }, 10000);

            socket.onopen = () => {
              clearTimeout(connectionTimeout);
              console.log("[GenerationStore] WebSocket connected successfully");
              set({ socket, connectionStatus: "connected", reconnectAttempts: 0 });
            };

            socket.onclose = (event) => {
              clearTimeout(connectionTimeout);
              console.log(
                "[GenerationStore] Disconnected:",
                event.code,
                event.reason || "(no reason)",
              );
              set({
                socket: null,
                connectionStatus: "disconnected",
              });

              // Auto-reconnect with exponential backoff if not intentionally closed
              if (event.code !== 1000) {
                const currentState = get();
                const attempts = currentState.reconnectAttempts;
                const maxAttempts = currentState.maxReconnectAttempts;

                if (attempts < maxAttempts) {
                  // Exponential backoff: 3s, 6s, 12s, 24s, 48s
                  const delay = Math.min(3000 * Math.pow(2, attempts), 60000);
                  console.log(
                    `[GenerationStore] Reconnect attempt ${attempts + 1}/${maxAttempts} in ${delay / 1000}s...`,
                  );

                  setTimeout(() => {
                    const state = get();
                    if (state.connectionStatus === "disconnected") {
                      set({ reconnectAttempts: attempts + 1 });
                      state.connect();
                    }
                  }, delay);
                } else {
                  console.log(
                    "[GenerationStore] Max reconnect attempts reached. Please refresh or reconnect manually.",
                  );
                }
              }
            };

            socket.onerror = (error) => {
              console.error("[GenerationStore] WebSocket error:", error);
              // Don't set disconnected here - let onclose handle it
            };

            socket.onmessage = (event) => {
              try {
                const message: ServerMessage = JSON.parse(event.data);
                get()._handleMessage(message);
              } catch (error) {
                console.error("[GenerationStore] Failed to parse message:", error);
              }
            };

            set({ socket });
          } catch (error) {
            console.error("[GenerationStore] Failed to create WebSocket:", error);
            set({ connectionStatus: "disconnected" });
          }
        })
        .catch(error => {
          console.error("[GenerationStore] Backend health check failed:", error.message);
          console.log("[GenerationStore] Make sure the backend server is running on port 3000");
          set({ connectionStatus: "disconnected" });
          
          // Schedule retry
          const attempts = get().reconnectAttempts;
          if (attempts < get().maxReconnectAttempts) {
            const delay = Math.min(3000 * Math.pow(2, attempts), 60000);
            console.log(`[GenerationStore] Will retry in ${delay / 1000}s...`);
            setTimeout(() => {
              set({ reconnectAttempts: attempts + 1 });
              get().connect();
            }, delay);
          }
        });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.close(1000, "User disconnected");
        set({
          socket: null,
          connectionStatus: "disconnected",
          reconnectAttempts: 0,
        });
      }
    },

    startGeneration: (projectId: string, prompt: string) => {
      const { socket, connectionStatus } = get();

      if (connectionStatus !== "connected" || !socket) {
        console.error("[GenerationStore] Not connected");
        get()._setError({ message: "Not connected to server" });
        return;
      }

      // Reset state for new generation
      set({
        sessionId: null,
        projectId,
        generationStatus: "planning",
        narrations: [],
        currentThinking: "Starting generation...",
        plan: null,
        currentFileIndex: 0,
        totalFiles: 0,
        currentFilePath: null,
        files: new Map(),
        error: null,
        startedAt: new Date(),
        completedAt: null,
      });

      // Send start message
      socket.send(
        JSON.stringify({
          type: "start",
          projectId,
          prompt,
        }),
      );
    },

    cancelGeneration: () => {
      const { socket, sessionId, connectionStatus } = get();

      if (connectionStatus !== "connected" || !socket) {
        return;
      }

      socket.send(
        JSON.stringify({
          type: "cancel",
          sessionId,
        }),
      );

      set({ currentThinking: "Cancelling..." });
    },

    reset: () => {
      set({
        sessionId: null,
        projectId: null,
        generationStatus: "idle",
        userMessages: [],
        narrations: [],
        currentThinking: null,
        plan: null,
        currentFileIndex: 0,
        totalFiles: 0,
        currentFilePath: null,
        files: new Map(),
        error: null,
        startedAt: null,
        completedAt: null,
      });
    },

    resetReconnect: () => {
      set({ reconnectAttempts: 0 });
    },

    addUserMessage: (content: string) => {
      const message: UserMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        timestamp: new Date(),
      };
      set((state) => ({
        userMessages: [...state.userMessages, message],
      }));
    },

    loadChatHistory: (messages: Array<{ role: string; content: string; message_type: string }>) => {
      const userMsgs: UserMessage[] = [];
      const narrationMsgs: Narration[] = [];

      messages.forEach((msg) => {
        if (msg.role === 'user') {
          userMsgs.push({
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: msg.content,
            timestamp: new Date(),
          });
        } else if (msg.role === 'assistant') {
          narrationMsgs.push({
            id: generateNarrationId(),
            message: msg.content,
            timestamp: new Date(),
            type: msg.message_type === 'narration' ? 'narration' : 
                  msg.message_type === 'thinking' ? 'thinking' : 
                  msg.message_type === 'plan' ? 'plan' : 'narration',
          });
        }
      });

      set({
        userMessages: userMsgs,
        narrations: narrationMsgs,
      });
    },

    // ========================================================================
    // Internal Handlers
    // ========================================================================

    _handleMessage: (message: ServerMessage) => {
      console.log("[GenerationStore] Message:", message.type, message);

      switch (message.type) {
        case "connected":
          // Already handled by onopen
          break;

        case "session_started":
          set({
            sessionId: message.sessionId || null,
            generationStatus: "planning",
          });
          break;

        case "thinking":
          get()._setThinking(message.message || null);
          break;

        case "narration":
          get()._addNarration(message.message || "", "narration");
          get()._setThinking(null);
          break;

        case "plan":
          if (message.data) {
            const planData = message.data as PlanData;
            get()._setPlan({
              screens: planData.screens || [],
              widgets: planData.widgets || [],
              category: planData.category || "Unknown",
              minScreens: planData.minScreens || 1,
            });
          }
          set({ generationStatus: "generating" });
          break;

        case "file_start":
          if (message.data) {
            const fileStartData = message.data as FileStartData;
            get()._startFile(
              fileStartData.path,
              fileStartData.index,
              fileStartData.total,
            );
          }
          break;

        case "code_chunk":
          if (message.data) {
            const chunkData = message.data as CodeChunkData;
            get()._appendChunk(chunkData.path, chunkData.content);
          }
          break;

        case "file_complete":
          if (message.data) {
            const completeData = message.data as FileCompleteData;
            get()._completeFile(completeData.path, completeData.size);
          }
          break;

        case "generation_complete": {
          const genCompleteData = message.data as
            | GenerationCompleteData
            | undefined;
          get()._setComplete(genCompleteData?.filesGenerated || 0);
          break;
        }

        case "error": {
          const errorData = message.data as ErrorData | undefined;
          get()._setError({
            message: message.message || "Unknown error",
            partialFiles: errorData?.partialFiles,
          });
          break;
        }

        case "validation_error":
          get()._setError({
            message: message.message || "Validation error",
            code: "VALIDATION_ERROR",
          });
          break;

        case "cancelled": {
          const cancelledData = message.data as CancelledData | undefined;
          get()._setCancelled(cancelledData?.partialFiles || []);
          break;
        }

        case "pong":
          // Heartbeat response, ignore
          break;

        default:
          console.warn("[GenerationStore] Unknown message type:", message.type);
      }
    },

    _addNarration: (message: string, type: Narration["type"]) => {
      if (!message.trim()) return;

      const narration: Narration = {
        id: generateNarrationId(),
        message: message.trim(),
        timestamp: new Date(),
        type,
      };

      set((state) => ({
        narrations: [...state.narrations, narration],
      }));
    },

    _setThinking: (message: string | null) => {
      set({ currentThinking: message });
    },

    _setPlan: (plan: GenerationPlan) => {
      set({
        plan,
        totalFiles: plan.screens.length + plan.widgets.length,
      });

      // Add plan as a narration
      get()._addNarration(
        `Planning: ${plan.screens.length} screens, ${plan.widgets.length} widgets`,
        "plan",
      );
    },

    _startFile: (path: string, index: number, total: number) => {
      const files = new Map(get().files);
      files.set(path, {
        path,
        content: "",
        status: "streaming",
        isPartial: false,
        size: 0,
      });

      set({
        files,
        currentFileIndex: index,
        totalFiles: total,
        currentFilePath: path,
      });
    },

    _appendChunk: (path: string, content: string) => {
      const files = new Map(get().files);
      const file = files.get(path);

      if (file) {
        files.set(path, {
          ...file,
          content: file.content + content,
          size: file.content.length + content.length,
        });
        set({ files });
      }
    },

    _completeFile: (path: string, size: number) => {
      const files = new Map(get().files);
      const file = files.get(path);

      if (file) {
        files.set(path, {
          ...file,
          status: "complete",
          size,
        });

        set({
          files,
          currentFilePath: null,
        });
      }
    },

    _setComplete: (filesCount: number) => {
      set({
        generationStatus: "complete",
        currentThinking: null,
        completedAt: new Date(),
      });

      get()._addNarration(
        `Generation complete! Created ${filesCount} files.`,
        "narration",
      );
    },

    _setError: (error: GenerationError) => {
      // If there are partial files, add them to the files map
      if (error.partialFiles) {
        const files = new Map(get().files);
        for (const partialFile of error.partialFiles) {
          files.set(partialFile.path, {
            ...partialFile,
            status: "error",
            isPartial: true,
          });
        }
        set({ files });
      }

      set({
        generationStatus: "error",
        error,
        currentThinking: null,
        completedAt: new Date(),
      });
    },

    _setCancelled: (partialFiles: GeneratedFile[]) => {
      // Add partial files to the files map
      const files = new Map(get().files);
      for (const partialFile of partialFiles) {
        files.set(partialFile.path, {
          ...partialFile,
          isPartial: partialFile.status !== "complete",
        });
      }

      set({
        generationStatus: "cancelled",
        files,
        currentThinking: null,
        completedAt: new Date(),
      });

      get()._addNarration("Generation cancelled.", "narration");
    },
  })),
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectConnectionStatus = (state: GenerationState) =>
  state.connectionStatus;

export const selectGenerationStatus = (state: GenerationState) =>
  state.generationStatus;

export const selectNarrations = (state: GenerationState) => state.narrations;

export const selectCurrentThinking = (state: GenerationState) =>
  state.currentThinking;

export const selectPlan = (state: GenerationState) => state.plan;

export const selectFiles = (state: GenerationState) => state.files;

export const selectCurrentFile = (state: GenerationState) => {
  if (!state.currentFilePath) return null;
  return state.files.get(state.currentFilePath) || null;
};

export const selectCurrentFileIndex = (state: GenerationState) =>
  state.currentFileIndex;

export const selectTotalFiles = (state: GenerationState) =>
  state.totalFiles;

export const selectProgress = (state: GenerationState) => ({
  current: state.currentFileIndex,
  total: state.totalFiles,
  percentage:
    state.totalFiles > 0
      ? Math.round((state.currentFileIndex / state.totalFiles) * 100)
      : 0,
});

export const selectError = (state: GenerationState) => state.error;

export const selectIsGenerating = (state: GenerationState) =>
  state.generationStatus === "planning" ||
  state.generationStatus === "generating";

export const selectIsComplete = (state: GenerationState) =>
  state.generationStatus === "complete";

export const selectHasError = (state: GenerationState) =>
  state.generationStatus === "error";
