/**
 * File System Service
 * Frontend integration for local file system operations
 * Handles folder selection, file indexing, and file opening
 */

import { safeShellOpen, safeDialogOpen, isTauri } from '../utils/tauri';

export interface FileSystemError {
  code: string;
  message: string;
}

export interface FolderSelection {
  paths: string[];
  cancelled: boolean;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  modified_at: string;
  file_type: string;
}

/**
 * File System Service
 * Manages all local file system interactions from the frontend
 */
export class FileSystemService {
  /**
   * Open folder selection dialog
   * Allows user to select one or more folders for indexing
   */
  static async selectFolders(): Promise<FolderSelection> {
    try {
      const selected = await safeDialogOpen({
        directory: true,
        multiple: true,
        defaultPath: undefined,
      });

      // Dialog not available OR user cancelled
      if (selected === null) {
        return {
          cancelled: true,
          paths: [],
        };
      }

      const paths = Array.isArray(selected) ? selected : [selected];

      return {
        paths,
        cancelled: false,
      };
    } catch (error) {
      // Should be rare because safeDialogOpen returns null for most failures.
      console.error('Folder selection error:', error);
      throw {
        code: 'FOLDER_SELECTION_ERROR',
        message: `Failed to select folders: ${
          error instanceof Error ? error.message : String(error)
        }`,
      } as FileSystemError;
    }
  }

  /**
   * Open a single folder selection dialog
   */
  static async selectFolder(): Promise<string | null> {
    const result = await this.selectFolders();
    return result.paths.length > 0 ? result.paths[0] : null;
  }

  /**
   * Open file selection dialog
   * Allows user to select one or more files for indexing
   */
  static async selectFiles(): Promise<FolderSelection> {
    try {
      const selected = await safeDialogOpen({
        directory: false,
        multiple: true,
        defaultPath: undefined,
      });

      if (selected === null) {
        return {
          cancelled: true,
          paths: [],
        };
      }

      const paths = Array.isArray(selected) ? selected : [selected];

      return {
        paths,
        cancelled: false,
      };
    } catch (error) {
      // Log the actual error for debugging
      console.error('File selection error:', error);
      throw {
        code: 'FILE_SELECTION_ERROR',
        message: `Failed to select files: ${error instanceof Error ? error.message : String(error)}`,
      } as FileSystemError;
    }
  }

  /**
   * Open a file or folder in the default application
   * For files, opens with the default application
   * For folders, opens in the file explorer
   */
  static async openPath(path: string): Promise<void> {
    try {
      if (!path || path.trim().length === 0) {
        throw new Error('Path cannot be empty');
      }

      await safeShellOpen(path);
    } catch (error) {
      // safeShellOpen already handles most failures gracefully
      console.warn('Open path warning:', error);
      return;
    }
  }

  /**
   * Open a file with the default application
   */
  static async openFile(filePath: string): Promise<void> {
    return this.openPath(filePath);
  }

  /**
   * Open a folder in the file explorer
   */
  static async openFolder(folderPath: string): Promise<void> {
    return this.openPath(folderPath);
  }

  /**
   * Validate if a path is valid and accessible
   */
  static async isValidPath(path: string): Promise<boolean> {
    try {
      if (!path || path.trim().length === 0) {
        return false;
      }

      // Windows drive letter validation: allow ":" only in position 1 (e.g., "C:")
      // Reject other invalid characters: < > | ? *
      // ":" is allowed only for Windows paths like C:\Users\...
      const isWindowsDrive = /^[A-Za-z]:/.test(path);
      const invalidChars = /[<>"|?*]/;

      // Check for colons outside of drive letter position
      if (!isWindowsDrive && path.includes(':')) {
        return false;
      }

      if (invalidChars.test(path)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract filename from a full path
   */
  static getFileName(path: string): string {
    if (!path) return '';
    return path.split(/[\\/]/).pop() || '';
  }

  /**
   * Extract file extension from a path
   */
  static getFileExtension(path: string): string {
    if (!path) return '';
    const fileName = this.getFileName(path);
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.substring(dotIndex + 1).toLowerCase() : '';
  }

  /**
   * Check if a file type is supported for indexing
   */
  static isSupportedFileType(path: string): boolean {
    const supportedTypes = [
      'txt',
      'md',
      'json',
      'csv',
      'xml',
      'yaml',
      'yml',
      'toml',
      'py',
      'js',
      'ts',
      'tsx',
      'jsx',
      'rs',
      'go',
      'java',
      'c',
      'cpp',
      'h',
      'rb',
      'php',
      'sh',
      'bat',
      'pdf',
      'docx',
      'doc',
    ];

    const ext = this.getFileExtension(path);
    return supportedTypes.includes(ext);
  }

  /**
   * Get a user-friendly file type label
   */
  static getFileTypeLabel(path: string): string {
    const ext = this.getFileExtension(path);

    const labels: Record<string, string> = {
      pdf: 'PDF Document',
      docx: 'Word Document',
      doc: 'Word Document',
      txt: 'Text File',
      py: 'Python',
      js: 'JavaScript',
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      jsx: 'JavaScript React',
      rs: 'Rust',
      go: 'Go',
      java: 'Java',
      c: 'C',
      cpp: 'C++',
      h: 'C Header',
      rb: 'Ruby',
      php: 'PHP',
      sh: 'Shell Script',
      bat: 'Batch Script',
      json: 'JSON',
      csv: 'CSV',
      xml: 'XML',
      yaml: 'YAML',
      yml: 'YAML',
      toml: 'TOML',
      md: 'Markdown',
    };

    return labels[ext] || `${ext.toUpperCase()} File`;
  }

  /**
   * Get icon emoji for file type
   */
  static getFileIcon(path: string): string {
    const ext = this.getFileExtension(path);

    const icons: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      doc: '📝',
      txt: '📄',
      py: '🐍',
      js: '⚡',
      ts: '🔷',
      tsx: '⚛️',
      jsx: '⚛️',
      rs: '🦀',
      go: '🐹',
      java: '☕',
      c: '©️',
      cpp: '⚙️',
      rb: '💎',
      php: '🐘',
      sh: '💻',
      bat: '💻',
      json: '📋',
      csv: '📊',
      xml: '📋',
      yaml: '⚙️',
      yml: '⚙️',
      toml: '⚙️',
      md: '📖',
    };

    return icons[ext] || '📄';
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return (
          'Today at ' +
          date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      } else if (date.toDateString() === yesterday.toDateString()) {
        return (
          'Yesterday at ' +
          date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }
    } catch {
      return dateString;
    }
  }

  static deduplicatePaths(paths: string[]): string[] {
    return Array.from(new Set(paths));
  }

  static filterNestedPaths(paths: string[]): string[] {
    return paths.filter((path1) => {
      return !paths.some((path2) => {
        if (path1 === path2) return false;
        const normalized1 = path1.replace(/\\/g, '/').toLowerCase();
        const normalized2 = path2.replace(/\\/g, '/').toLowerCase();
        return normalized1.startsWith(normalized2 + '/');
      });
    });
  }

  static validateFolderPath(path: string): { valid: boolean; error?: string } {
    if (!path || path.trim().length === 0) {
      return { valid: false, error: 'Path cannot be empty' };
    }

    // Windows drive letter validation: allow ":" only in position 1 (e.g., "C:")
    // Reject other invalid characters: < > | ? *
    const isWindowsDrive = /^[A-Za-z]:/.test(path);
    const invalidChars = /[<>"|?*]/;

    // Check for colons outside of drive letter position
    if (!isWindowsDrive && path.includes(':')) {
      return { valid: false, error: 'Path contains invalid characters' };
    }

    if (invalidChars.test(path)) {
      return { valid: false, error: 'Path contains invalid characters' };
    }

    if (/[\\/]{2,}/.test(path)) {
      return { valid: false, error: 'Path contains consecutive slashes' };
    }

    return { valid: true };
  }

  static getSupportedExtensions(): string[] {
    return [
      'txt',
      'md',
      'json',
      'csv',
      'xml',
      'yaml',
      'yml',
      'toml',
      'py',
      'js',
      'ts',
      'tsx',
      'jsx',
      'rs',
      'go',
      'java',
      'c',
      'cpp',
      'h',
      'rb',
      'php',
      'sh',
      'bat',
      'pdf',
      'docx',
      'doc',
    ];
  }

  static getSupportedFileTypesByCategory(): Record<string, string[]> {
    return {
      Documents: ['pdf', 'docx', 'doc', 'txt'],
      Code: [
        'py',
        'js',
        'ts',
        'tsx',
        'jsx',
        'rs',
        'go',
        'java',
        'c',
        'cpp',
        'h',
        'rb',
        'php',
        'sh',
        'bat',
      ],
      Data: ['json', 'csv', 'xml', 'yaml', 'yml', 'toml'],
      Markup: ['md'],
    };
  }

  /**
   * Initialize Tauri bridge
   * Now capability-based, not global-based.
   */
  static async initializeTauri(): Promise<boolean> {
    // best effort
    try {
      const selected = await safeDialogOpen({ directory: true, multiple: false });
      // If user cancels, still counts as available
      return selected !== undefined;
    } catch {
      return false;
    }
  }
}

export default FileSystemService;
