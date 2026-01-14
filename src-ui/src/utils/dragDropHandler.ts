/**
 * Drag and Drop Handler Utility
 * Provides drag-and-drop functionality for file and folder handling
 */

import { safeDialogOpen, isTauri } from './tauri';

export interface DragDropResult {
  files: File[];
  folders: string[];
  cancelled: boolean;
}

export interface FileWithPath extends File {
  path?: string;
}

/**
 * Handle drag enter event
 */
export const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // Could add visual feedback here
};

/**
 * Handle drag over event
 */
export const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // Could add visual feedback here
};

/**
 * Handle drag leave event
 */
export const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // Could remove visual feedback here
};

/**
 * Process dropped items - handles both files and folders if supported
 */
export const handleDrop = async (e: React.DragEvent): Promise<DragDropResult> => {
  e.preventDefault();
  e.stopPropagation();

  const files: File[] = [];
  const folders: string[] = [];

  if (e.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i];
      
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          // Check if this is a folder by checking size and type
          // Note: Browser limitations mean we can't definitively detect folders via drag-and-drop
          // This is a workaround that treats all dropped items as files
          files.push(file);
        }
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      files.push(file);
    }
  }

  return {
    files,
    folders,
    cancelled: false
  };
};

/**
 * Select files via dialog (fallback for browsers that don't support folder drag-and-drop well)
 */
export const selectFilesViaDialog = async (): Promise<DragDropResult> => {
  if (!isTauri()) {
    console.warn('[Browser Mode] File selection not available');
    return {
      files: [],
      folders: [],
      cancelled: true
    };
  }

  try {
    const selected = await safeDialogOpen({
      directory: false,
      multiple: true,
      defaultPath: undefined,
    });

    if (selected === null) {
      return {
        files: [] as File[],
        folders: [],
        cancelled: true
      };
    }

    // Convert selected paths to a format compatible with our drag drop result
    // Note: We can't create File objects from paths in the frontend, so we'll return paths
    return {
      files: [] as File[], // Placeholder - in practice, we'd need to handle this differently
      folders: Array.isArray(selected) ? selected : [selected],
      cancelled: false
    };
  } catch (error) {
    console.error('File selection error:', error);
    return {
      files: [] as File[],
      folders: [],
      cancelled: true
    };
  }
};

/**
 * Select folders via dialog (traditional folder selection)
 */
export const selectFoldersViaDialog = async (): Promise<DragDropResult> => {
  if (!isTauri()) {
    console.warn('[Browser Mode] Folder selection not available');
    return {
      files: [],
      folders: [],
      cancelled: true
    };
  }

  try {
    const selected = await safeDialogOpen({
      directory: true,
      multiple: true,
      defaultPath: undefined,
    });

    if (selected === null) {
      return {
        files: [] as File[],
        folders: [],
        cancelled: true
      };
    }

    return {
      files: [] as File[],
      folders: Array.isArray(selected) ? selected : [selected],
      cancelled: false
    };
  } catch (error) {
    console.error('Folder selection error:', error);
    return {
      files: [] as File[],
      folders: [],
      cancelled: true
    };
  }
};

export default {
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  selectFilesViaDialog,
  selectFoldersViaDialog
};