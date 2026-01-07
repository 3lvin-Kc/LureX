/**
 * Editor Store
 *
 * Zustand store for managing editor state with typewriter effect support.
 * Handles file tree, active file, and streaming code display.
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ============================================================================
// Types
// ============================================================================

export type FileStatus = "pending" | "streaming" | "complete" | "error";

export interface EditorFile {
  path: string;
  content: string;
  status: FileStatus;
  isPartial: boolean;
  size: number;
  folder: string;
  fileName: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  status?: FileStatus;
  children?: FileTreeNode[];
  expanded?: boolean;
}

export interface TypewriterState {
  isActive: boolean;
  displayedContent: string;
  fullContent: string;
  charIndex: number;
  speed: number; // milliseconds per character
}

// ============================================================================
// Store Interface
// ============================================================================

interface EditorState {
  // Files
  files: Map<string, EditorFile>;
  fileTree: FileTreeNode[];

  // Active State
  activeFilePath: string | null;
  streamingFilePath: string | null;

  // Typewriter Effect
  typewriter: TypewriterState;
  typewriterInterval: NodeJS.Timeout | null;

  // Editor Settings
  isReadOnly: boolean;
  showLineNumbers: boolean;
  fontSize: number;

  // Actions - File Management
  setFiles: (files: Map<string, EditorFile>) => void;
  addFile: (path: string, status?: FileStatus) => void;
  updateFileContent: (path: string, content: string) => void;
  appendFileContent: (path: string, chunk: string) => void;
  setFileStatus: (path: string, status: FileStatus) => void;
  setFileComplete: (path: string, finalContent?: string) => void;
  removeFile: (path: string) => void;
  clearFiles: () => void;

  // Actions - Active File
  setActiveFile: (path: string | null) => void;
  setStreamingFile: (path: string | null) => void;

  // Actions - Typewriter
  startTypewriter: (content: string, speed?: number) => void;
  stopTypewriter: () => void;
  tickTypewriter: () => void;
  setTypewriterSpeed: (speed: number) => void;
  completeTypewriter: () => void;

  // Actions - File Tree
  buildFileTree: () => void;
  toggleFolder: (path: string) => void;
  expandToFile: (filePath: string) => void;

  // Actions - Settings
  setReadOnly: (readOnly: boolean) => void;
  setFontSize: (size: number) => void;

  // Utilities
  getFileByPath: (path: string) => EditorFile | undefined;
  getActiveFile: () => EditorFile | undefined;
  getStreamingFile: () => EditorFile | undefined;
  getDisplayContent: () => string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseFilePath(path: string): { folder: string; fileName: string } {
  const parts = path.split("/");
  const fileName = parts.pop() || "";
  const folder = parts.join("/");
  return { folder, fileName };
}

function buildTreeFromFiles(files: Map<string, EditorFile>): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const folderMap = new Map<string, FileTreeNode>();

  // Sort files by path
  const sortedPaths = Array.from(files.keys()).sort();

  for (const filePath of sortedPaths) {
    const file = files.get(filePath)!;
    const parts = filePath.split("/");
    let currentLevel = root;
    let currentPath = "";

    // Create/navigate folder structure
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      let folder = folderMap.get(currentPath);
      if (!folder) {
        folder = {
          name: folderName,
          path: currentPath,
          type: "folder",
          children: [],
          expanded: true, // Auto-expand folders during generation
        };
        folderMap.set(currentPath, folder);
        currentLevel.push(folder);
      }
      currentLevel = folder.children!;
    }

    // Add file node
    const fileName = parts[parts.length - 1];
    currentLevel.push({
      name: fileName,
      path: filePath,
      type: "file",
      status: file.status,
    });
  }

  return root;
}

function findNodeByPath(
  nodes: FileTreeNode[],
  path: string
): FileTreeNode | null {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function expandParentFolders(tree: FileTreeNode[], filePath: string): void {
  const parts = filePath.split("/");
  let currentPath = "";

  for (let i = 0; i < parts.length - 1; i++) {
    currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
    const node = findNodeByPath(tree, currentPath);
    if (node && node.type === "folder") {
      node.expanded = true;
    }
  }
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    files: new Map(),
    fileTree: [],
    activeFilePath: null,
    streamingFilePath: null,
    typewriter: {
      isActive: false,
      displayedContent: "",
      fullContent: "",
      charIndex: 0,
      speed: 5, // 5ms per character (fast typing)
    },
    typewriterInterval: null,
    isReadOnly: true,
    showLineNumbers: true,
    fontSize: 14,

    // ========================================================================
    // File Management
    // ========================================================================

    setFiles: (files: Map<string, EditorFile>) => {
      set({ files: new Map(files) });
      get().buildFileTree();
    },

    addFile: (path: string, status: FileStatus = "pending") => {
      const { folder, fileName } = parseFilePath(path);
      const files = new Map(get().files);

      files.set(path, {
        path,
        content: "",
        status,
        isPartial: false,
        size: 0,
        folder,
        fileName,
      });

      set({ files });
      get().buildFileTree();
    },

    updateFileContent: (path: string, content: string) => {
      const files = new Map(get().files);
      const file = files.get(path);

      if (file) {
        files.set(path, {
          ...file,
          content,
          size: content.length,
        });
        set({ files });
      }
    },

    appendFileContent: (path: string, chunk: string) => {
      const files = new Map(get().files);
      const file = files.get(path);

      if (file) {
        const newContent = file.content + chunk;
        files.set(path, {
          ...file,
          content: newContent,
          size: newContent.length,
        });
        set({ files });

        // If this is the streaming file, update typewriter
        if (path === get().streamingFilePath && get().typewriter.isActive) {
          set((state) => ({
            typewriter: {
              ...state.typewriter,
              fullContent: newContent,
            },
          }));
        }
      }
    },

    setFileStatus: (path: string, status: FileStatus) => {
      const files = new Map(get().files);
      const file = files.get(path);

      if (file) {
        files.set(path, { ...file, status });
        set({ files });
        get().buildFileTree();
      }
    },

    setFileComplete: (path: string, finalContent?: string) => {
      const files = new Map(get().files);
      const file = files.get(path);

      if (file) {
        files.set(path, {
          ...file,
          status: "complete",
          content: finalContent ?? file.content,
          size: (finalContent ?? file.content).length,
          isPartial: false,
        });
        set({ files });
        get().buildFileTree();

        // If this was the streaming file, complete typewriter
        if (path === get().streamingFilePath) {
          get().completeTypewriter();
          set({ streamingFilePath: null });
        }
      }
    },

    removeFile: (path: string) => {
      const files = new Map(get().files);
      files.delete(path);
      set({ files });
      get().buildFileTree();

      // If active file was removed, clear it
      if (get().activeFilePath === path) {
        set({ activeFilePath: null });
      }
    },

    clearFiles: () => {
      get().stopTypewriter();
      set({
        files: new Map(),
        fileTree: [],
        activeFilePath: null,
        streamingFilePath: null,
      });
    },

    // ========================================================================
    // Active File
    // ========================================================================

    setActiveFile: (path: string | null) => {
      const { files, typewriter } = get();

      // Stop typewriter if switching away from streaming file
      if (typewriter.isActive && path !== get().streamingFilePath) {
        get().stopTypewriter();
      }

      set({ activeFilePath: path });

      // If selecting a streaming file, start typewriter
      if (path && path === get().streamingFilePath) {
        const file = files.get(path);
        if (file) {
          get().startTypewriter(file.content);
        }
      }
    },

    setStreamingFile: (path: string | null) => {
      const previousPath = get().streamingFilePath;

      // If there was a previous streaming file, complete it
      if (previousPath && previousPath !== path) {
        get().setFileStatus(previousPath, "complete");
        get().stopTypewriter();
      }

      set({ streamingFilePath: path });

      if (path) {
        // Set the new file as active and start typewriter
        set({ activeFilePath: path });
        get().setFileStatus(path, "streaming");

        const file = get().files.get(path);
        if (file) {
          get().startTypewriter(file.content);
        }

        // Expand file tree to show this file
        get().expandToFile(path);
      }
    },

    // ========================================================================
    // Typewriter Effect
    // ========================================================================

    startTypewriter: (content: string, speed?: number) => {
      // Stop any existing typewriter
      get().stopTypewriter();

      set({
        typewriter: {
          isActive: true,
          displayedContent: "",
          fullContent: content,
          charIndex: 0,
          speed: speed ?? get().typewriter.speed,
        },
      });

      // Start interval for typewriter effect
      const interval = setInterval(() => {
        get().tickTypewriter();
      }, get().typewriter.speed);

      set({ typewriterInterval: interval });
    },

    stopTypewriter: () => {
      const { typewriterInterval } = get();
      if (typewriterInterval) {
        clearInterval(typewriterInterval);
      }

      set({
        typewriterInterval: null,
        typewriter: {
          ...get().typewriter,
          isActive: false,
        },
      });
    },

    tickTypewriter: () => {
      const { typewriter } = get();

      if (!typewriter.isActive) return;

      // Calculate how many characters to add (batch for performance)
      const charsPerTick = Math.max(1, Math.floor(50 / typewriter.speed));
      const nextIndex = Math.min(
        typewriter.charIndex + charsPerTick,
        typewriter.fullContent.length
      );

      if (nextIndex >= typewriter.fullContent.length) {
        // Reached the end of current content
        set({
          typewriter: {
            ...typewriter,
            displayedContent: typewriter.fullContent,
            charIndex: typewriter.fullContent.length,
          },
        });
      } else {
        // Continue typing
        set({
          typewriter: {
            ...typewriter,
            displayedContent: typewriter.fullContent.substring(0, nextIndex),
            charIndex: nextIndex,
          },
        });
      }
    },

    setTypewriterSpeed: (speed: number) => {
      set({
        typewriter: {
          ...get().typewriter,
          speed: Math.max(1, Math.min(100, speed)),
        },
      });
    },

    completeTypewriter: () => {
      const { typewriter, typewriterInterval } = get();

      if (typewriterInterval) {
        clearInterval(typewriterInterval);
      }

      set({
        typewriterInterval: null,
        typewriter: {
          ...typewriter,
          isActive: false,
          displayedContent: typewriter.fullContent,
          charIndex: typewriter.fullContent.length,
        },
      });
    },

    // ========================================================================
    // File Tree
    // ========================================================================

    buildFileTree: () => {
      const tree = buildTreeFromFiles(get().files);
      set({ fileTree: tree });
    },

    toggleFolder: (path: string) => {
      const tree = [...get().fileTree];
      const node = findNodeByPath(tree, path);

      if (node && node.type === "folder") {
        node.expanded = !node.expanded;
        set({ fileTree: tree });
      }
    },

    expandToFile: (filePath: string) => {
      const tree = [...get().fileTree];
      expandParentFolders(tree, filePath);
      set({ fileTree: tree });
    },

    // ========================================================================
    // Settings
    // ========================================================================

    setReadOnly: (readOnly: boolean) => {
      set({ isReadOnly: readOnly });
    },

    setFontSize: (size: number) => {
      set({ fontSize: Math.max(10, Math.min(24, size)) });
    },

    // ========================================================================
    // Utilities
    // ========================================================================

    getFileByPath: (path: string) => {
      return get().files.get(path);
    },

    getActiveFile: () => {
      const { activeFilePath, files } = get();
      if (!activeFilePath) return undefined;
      return files.get(activeFilePath);
    },

    getStreamingFile: () => {
      const { streamingFilePath, files } = get();
      if (!streamingFilePath) return undefined;
      return files.get(streamingFilePath);
    },

    getDisplayContent: () => {
      const { activeFilePath, streamingFilePath, typewriter, files } = get();

      // If viewing the streaming file, show typewriter content
      if (activeFilePath === streamingFilePath && typewriter.isActive) {
        return typewriter.displayedContent;
      }

      // Otherwise show full file content
      if (activeFilePath) {
        const file = files.get(activeFilePath);
        return file?.content || "";
      }

      return "";
    },
  }))
);

// ============================================================================
// Selectors
// ============================================================================

export const selectFiles = (state: EditorState) => state.files;

export const selectFileTree = (state: EditorState) => state.fileTree;

export const selectActiveFilePath = (state: EditorState) => state.activeFilePath;

export const selectStreamingFilePath = (state: EditorState) =>
  state.streamingFilePath;

export const selectActiveFile = (state: EditorState) => {
  if (!state.activeFilePath) return null;
  return state.files.get(state.activeFilePath) || null;
};

export const selectIsTypewriting = (state: EditorState) =>
  state.typewriter.isActive;

export const selectDisplayContent = (state: EditorState) => {
  if (
    state.activeFilePath === state.streamingFilePath &&
    state.typewriter.isActive
  ) {
    return state.typewriter.displayedContent;
  }
  if (state.activeFilePath) {
    const file = state.files.get(state.activeFilePath);
    return file?.content || "";
  }
  return "";
};

export const selectTypewriterProgress = (state: EditorState) => {
  const { fullContent, charIndex } = state.typewriter;
  if (fullContent.length === 0) return 100;
  return Math.round((charIndex / fullContent.length) * 100);
};

export const selectFileCount = (state: EditorState) => state.files.size;

export const selectCompleteFileCount = (state: EditorState) => {
  let count = 0;
  for (const file of state.files.values()) {
    if (file.status === "complete") count++;
  }
  return count;
};

export const selectIsReadOnly = (state: EditorState) => state.isReadOnly;
