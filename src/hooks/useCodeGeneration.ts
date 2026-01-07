/**
 * useCodeGeneration Hook
 *
 * Bridges the generation store and editor store for a unified code generation workflow.
 * Handles WebSocket connection, syncs file state between stores, and provides
 * a clean API for components to use.
 */

import { useEffect, useCallback, useMemo, useRef } from "react";
import {
  useGenerationStore,
  selectConnectionStatus,
  selectGenerationStatus,
  selectNarrations,
  selectCurrentThinking,
  selectPlan,
  selectCurrentFileIndex,
  selectTotalFiles,
  selectError,
  selectIsGenerating,
  selectIsComplete,
  selectHasError,
  GeneratedFile,
} from "../stores/generation-store";
import {
  useEditorStore,
  selectFileTree,
  selectActiveFilePath,
  selectStreamingFilePath,
  selectDisplayContent,
  selectIsTypewriting,
  selectFileCount,
  selectCompleteFileCount,
  selectIsReadOnly,
  EditorFile,
} from "../stores/editor-store";

// ============================================================================
// Types
// ============================================================================

export interface UseCodeGenerationReturn {
  // Connection
  connectionStatus: "disconnected" | "connecting" | "connected";
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;

  // Generation
  generationStatus: string;
  isGenerating: boolean;
  isComplete: boolean;
  hasError: boolean;
  startGeneration: (projectId: string, prompt: string) => void;
  cancelGeneration: () => void;
  reset: () => void;

  // Narration & Thinking
  narrations: Array<{
    id: string;
    message: string;
    timestamp: Date;
    type: "thinking" | "narration" | "plan";
  }>;
  currentThinking: string | null;

  // Plan
  plan: {
    screens: string[];
    widgets: string[];
    category: string;
    minScreens: number;
  } | null;

  // Progress
  progress: {
    current: number;
    total: number;
    percentage: number;
  };

  // Error
  error: {
    message: string;
    code?: string;
    partialFiles?: GeneratedFile[];
  } | null;

  // File Tree
  fileTree: Array<{
    name: string;
    path: string;
    type: "file" | "folder";
    children?: Array<unknown>;
  }>;
  fileCount: number;
  completeFileCount: number;

  // Active File
  activeFilePath: string | null;
  streamingFilePath: string | null;
  displayContent: string;
  isTypewriting: boolean;
  isReadOnly: boolean;

  // File Actions
  setActiveFile: (path: string | null) => void;
  toggleFolder: (path: string) => void;
  getFileByPath: (path: string) => EditorFile | undefined;

  // Reconnection
  reconnect: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCodeGeneration(): UseCodeGenerationReturn {
  // Generation store state
  const connectionStatus = useGenerationStore(selectConnectionStatus);
  const generationStatus = useGenerationStore(selectGenerationStatus);
  const narrations = useGenerationStore(selectNarrations);
  const currentThinking = useGenerationStore(selectCurrentThinking);
  const plan = useGenerationStore(selectPlan);
  const current = useGenerationStore(selectCurrentFileIndex);
  const total = useGenerationStore(selectTotalFiles);
  const progress = useMemo(() => ({
    current,
    total,
    percentage: total > 0 ? Math.round((current / total) * 100) : 0,
  }), [current, total]);
  const error = useGenerationStore(selectError);
  const isGenerating = useGenerationStore(selectIsGenerating);
  const isComplete = useGenerationStore(selectIsComplete);
  const hasError = useGenerationStore(selectHasError);
  const generationFiles = useGenerationStore((state) => state.files);

  // Generation store actions
  const connect = useGenerationStore((state) => state.connect);
  const disconnect = useGenerationStore((state) => state.disconnect);
  const startGenerationAction = useGenerationStore(
    (state) => state.startGeneration,
  );
  const cancelGenerationAction = useGenerationStore(
    (state) => state.cancelGeneration,
  );
  const resetGeneration = useGenerationStore((state) => state.reset);
  const resetReconnect = useGenerationStore((state) => state.resetReconnect);

  // Editor store state
  const fileTree = useEditorStore(selectFileTree);
  const activeFilePath = useEditorStore(selectActiveFilePath);
  const streamingFilePath = useEditorStore(selectStreamingFilePath);
  const displayContent = useEditorStore(selectDisplayContent);
  const isTypewriting = useEditorStore(selectIsTypewriting);
  const fileCount = useEditorStore(selectFileCount);
  const completeFileCount = useEditorStore(selectCompleteFileCount);
  const isReadOnly = useEditorStore(selectIsReadOnly);

  // Editor store actions
  const setActiveFile = useEditorStore((state) => state.setActiveFile);
  const setStreamingFile = useEditorStore((state) => state.setStreamingFile);
  const addFile = useEditorStore((state) => state.addFile);
  const appendFileContent = useEditorStore((state) => state.appendFileContent);
  const setFileComplete = useEditorStore((state) => state.setFileComplete);
  const setFileStatus = useEditorStore((state) => state.setFileStatus);
  const clearFiles = useEditorStore((state) => state.clearFiles);
  const toggleFolder = useEditorStore((state) => state.toggleFolder);
  const getFileByPath = useEditorStore((state) => state.getFileByPath);
  const setReadOnly = useEditorStore((state) => state.setReadOnly);

  // ========================================================================
  // Sync generation files to editor files
  // ========================================================================

    // ========================================================================
  // Batch-sync generation files to editor files
  // ========================================================================

  useEffect(() => {
    const subscription = useGenerationStore.subscribe(
      (state) => state.files,
      (files, prevFiles) => {
        // This subscriber is now the *only* place that should react to file changes.
        // It's decoupled from the component's render cycle.

        const updates: Array<() => void> = [];

        for (const [path, file] of files.entries()) {
          const prevFile = prevFiles.get(path);

          if (!prevFile) {
            // New file
            updates.push(() => useEditorStore.getState().addFile(path, file.status));
            updates.push(() => useEditorStore.getState().setStreamingFile(path));
          } else {
            // Existing file
            if (file.content !== prevFile.content) {
              const newContent = file.content.substring(prevFile.content.length);
              if (newContent) {
                updates.push(() => useEditorStore.getState().appendFileContent(path, newContent));
              }
              updates.push(() => useEditorStore.getState().setStreamingFile(path));
            }

            if (file.status === "complete" && prevFile.status !== "complete") {
              updates.push(() => useEditorStore.getState().setFileComplete(path, file.content));
              if (useEditorStore.getState().streamingFilePath === path) {
                updates.push(() => useEditorStore.getState().setStreamingFile(null));
              }
            } else if (file.status !== prevFile.status) {
              updates.push(() => useEditorStore.getState().setFileStatus(path, file.status));
            }
          }
        }

        if (updates.length > 0) {
          // Batch all updates into a single transaction to avoid multiple re-renders
          useEditorStore.setState((state) => {
            updates.forEach(update => update());
            return { ...state }; // Trigger a single update
          });
        }
      },
      { equalityFn: (a, b) => a === b, fireImmediately: false }
    );

    return () => subscription();
  }, []);

  // ========================================================================
  // Handle generation status changes
  // ========================================================================

  useEffect(() => {
    const isGenerating = generationStatus === "planning" || generationStatus === "generating";
    const { isReadOnly, setReadOnly } = useEditorStore.getState();

    if (isGenerating && !isReadOnly) {
      setReadOnly(true);
    } else if (!isGenerating && isReadOnly) {
      setReadOnly(false);
    }
  }, [generationStatus]);

  // ========================================================================
  // Auto-connect on mount
  // ========================================================================

  // Use a ref to track if we've already attempted to connect
  const hasAttemptedConnect = useRef(false);

  useEffect(() => {
    // Only attempt to connect once on mount
    if (!hasAttemptedConnect.current && connectionStatus === "disconnected") {
      hasAttemptedConnect.current = true;
      connect();
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount - keep connection alive
      // disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset the connect attempt flag when explicitly disconnected
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      // Allow reconnect attempts after a brief delay
      const timer = setTimeout(() => {
        hasAttemptedConnect.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // ========================================================================
  // Wrapped Actions
  // ========================================================================

  const startGeneration = useCallback(
    (projectId: string, prompt: string) => {
      // Reset previous state before starting a new generation
      clearFiles();
      setReadOnly(true);
      startGenerationAction(projectId, prompt);
    },
    [clearFiles, setReadOnly, startGenerationAction],
  );

  const cancelGeneration = useCallback(() => {
    cancelGenerationAction();
    setReadOnly(false); // Allow user interaction after cancellation
  }, [cancelGenerationAction, setReadOnly]);

  const reset = useCallback(() => {
    resetGeneration();
    clearFiles();
    setReadOnly(false);
  }, [resetGeneration, clearFiles, setReadOnly]);

  const reconnect = useCallback(() => {
    console.log("Attempting to reconnect WebSocket...");
    resetReconnect();
    connect();
  }, [resetReconnect, connect]);

  // ========================================================================
  // Reconnection Logic
  // ========================================================================

  useEffect(() => {
    const onOnline = () => {
      if (connectionStatus === "disconnected") {
        console.log("Network reconnected. Attempting to reconnect WebSocket...");
        reconnect();
      }
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [connectionStatus, reconnect]);

  // ========================================================================
  // API Definition
  // ========================================================================

  return useMemo(
    () => ({
      // Connection
      connectionStatus,
      isConnected: connectionStatus === "connected",
      connect,
      disconnect,

      // Generation
      generationStatus,
      isGenerating,
      isComplete,
      hasError,
      startGeneration,
      cancelGeneration,
      reset,

      // Narration & Thinking
      narrations,
      currentThinking,

      // Plan
      plan,

      // Progress
      progress,

      // Error
      error,

      // File Tree
      fileTree,
      fileCount,
      completeFileCount,

      // Active File
      activeFilePath,
      streamingFilePath,
      displayContent,
      isTypewriting,
      isReadOnly,

      // File Actions
      setActiveFile,
      toggleFolder,
      getFileByPath,

      // Reconnection
      reconnect,
    }),
    [
      connectionStatus,
      connect,
      disconnect,
      generationStatus,
      isGenerating,
      isComplete,
      hasError,
      startGeneration,
      cancelGeneration,
      reset,
      narrations,
      currentThinking,
      plan,
      progress,
      error,
      fileTree,
      fileCount,
      completeFileCount,
      activeFilePath,
      streamingFilePath,
      displayContent,
      isTypewriting,
      isReadOnly,
      setActiveFile,
      toggleFolder,
      getFileByPath,
      reconnect,
    ],
  );
}

// ============================================================================
// Additional Utility Hooks
// ============================================================================

/**
 * Hook to get just the connection status and actions
 */
export function useGenerationConnection() {
  const connectionStatus = useGenerationStore(selectConnectionStatus);
  const connect = useGenerationStore((state) => state.connect);
  const disconnect = useGenerationStore((state) => state.disconnect);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    isConnecting: connectionStatus === "connecting",
    isDisconnected: connectionStatus === "disconnected",
    connect,
    disconnect,
  };
}

/**
 * Hook to get just the narration/thinking state
 */
export function useNarration() {
  const narrations = useGenerationStore(selectNarrations);
  const currentThinking = useGenerationStore(selectCurrentThinking);

  return {
    narrations,
    currentThinking,
    latestNarration: narrations[narrations.length - 1] || null,
    hasNarrations: narrations.length > 0,
  };
}

/**
 * Hook to get just the file streaming state
 */
export function useStreamingFile() {
  const streamingFilePath = useEditorStore(selectStreamingFilePath);
  const displayContent = useEditorStore(selectDisplayContent);
  const isTypewriting = useEditorStore(selectIsTypewriting);
  const getStreamingFile = useEditorStore((state) => state.getStreamingFile);

  return {
    path: streamingFilePath,
    content: displayContent,
    isTypewriting,
    file: getStreamingFile(),
  };
}

/**
 * Hook to get generation progress
 */
export function useGenerationProgress() {
  const current = useGenerationStore(selectCurrentFileIndex);
  const total = useGenerationStore(selectTotalFiles);
  const progress = useMemo(() => ({
    current,
    total,
    percentage: total > 0 ? Math.round((current / total) * 100) : 0,
  }), [current, total]);
  const generationStatus = useGenerationStore(selectGenerationStatus);
  const fileCount = useEditorStore(selectFileCount);
  const completeFileCount = useEditorStore(selectCompleteFileCount);

  return {
    ...progress,
    status: generationStatus,
    filesTotal: fileCount,
    filesComplete: completeFileCount,
    filesRemaining: fileCount - completeFileCount,
  };
}

export default useCodeGeneration;
