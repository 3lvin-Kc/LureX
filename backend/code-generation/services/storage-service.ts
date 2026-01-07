/**
 * Storage Service
 *
 * Handles file uploads to Supabase Storage bucket for generated Flutter code.
 *
 * Features:
 * - Upload individual files
 * - Batch upload multiple files atomically
 * - Download file content
 * - Delete files
 * - Generate signed URLs for file access
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ParsedFile, generateStoragePath } from '../models/generated-artifact';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://imxrdomaamdcmhtxztcj.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHJkb21hYW1kY21odHh6dGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODk2NDQsImV4cCI6MjA4MTk2NTY0NH0.pn9EZmPwB29Mf2jJwrBxZaMwvegehSzENgKRrcNSOFI';

const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const BUCKET_NAME = 'generated-projects';

// ============================================================================
// Types
// ============================================================================

export interface UploadResult {
  success: boolean;
  storagePath: string;
  filePath: string;
  fileSize: number;
  error?: string;
}

export interface BatchUploadResult {
  success: boolean;
  totalFiles: number;
  uploadedFiles: number;
  failedFiles: number;
  results: UploadResult[];
  errors: string[];
}

export interface FileContent {
  content: string;
  size: number;
  mimeType: string;
}

// ============================================================================
// Storage Service Class
// ============================================================================

export class StorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(bucketName: string = BUCKET_NAME) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    this.bucketName = bucketName;
  }

  // ==========================================================================
  // Upload Operations
  // ==========================================================================

  /**
   * Uploads a single file to storage
   */
  async uploadFile(
    projectStateId: string,
    filePath: string,
    content: string
  ): Promise<UploadResult> {
    const storagePath = generateStoragePath(projectStateId, filePath);
    const contentBuffer = Buffer.from(content, 'utf-8');
    const mimeType = this.getMimeType(filePath);

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(storagePath, contentBuffer, {
          contentType: mimeType,
          upsert: true, // Overwrite if exists
        });

      if (error) {
        return {
          success: false,
          storagePath,
          filePath,
          fileSize: 0,
          error: error.message,
        };
      }

      return {
        success: true,
        storagePath: data.path,
        filePath,
        fileSize: contentBuffer.length,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        storagePath,
        filePath,
        fileSize: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Uploads multiple files atomically
   * If any file fails, attempts to rollback all uploads
   */
  async uploadFiles(
    projectStateId: string,
    files: ParsedFile[]
  ): Promise<BatchUploadResult> {
    const results: UploadResult[] = [];
    const errors: string[] = [];
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const result = await this.uploadFile(projectStateId, file.path, file.content);
      results.push(result);

      if (result.success) {
        uploadedPaths.push(result.storagePath);
      } else {
        errors.push(`Failed to upload ${file.path}: ${result.error}`);
      }
    }

    const uploadedFiles = results.filter((r) => r.success).length;
    const failedFiles = results.filter((r) => !r.success).length;

    // If any files failed, rollback all uploads
    if (failedFiles > 0 && uploadedPaths.length > 0) {
      console.warn(`Rolling back ${uploadedPaths.length} uploaded files due to failures`);
      await this.deleteFiles(uploadedPaths);

      return {
        success: false,
        totalFiles: files.length,
        uploadedFiles: 0, // All rolled back
        failedFiles: files.length,
        results,
        errors: [...errors, 'All uploads rolled back due to partial failure'],
      };
    }

    return {
      success: failedFiles === 0,
      totalFiles: files.length,
      uploadedFiles,
      failedFiles,
      results,
      errors,
    };
  }

  /**
   * Uploads files with retry logic
   */
  async uploadFilesWithRetry(
    projectStateId: string,
    files: ParsedFile[],
    maxRetries: number = 2
  ): Promise<BatchUploadResult> {
    let lastResult: BatchUploadResult | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      lastResult = await this.uploadFiles(projectStateId, files);

      if (lastResult.success) {
        return lastResult;
      }

      if (attempt <= maxRetries) {
        console.log(`Upload attempt ${attempt} failed, retrying...`);
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt - 1) * 1000);
      }
    }

    return lastResult!;
  }

  // ==========================================================================
  // Download Operations
  // ==========================================================================

  /**
   * Downloads a file's content from storage
   */
  async downloadFile(storagePath: string): Promise<FileContent | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(storagePath);

      if (error) {
        console.error(`Failed to download ${storagePath}:`, error.message);
        return null;
      }

      const content = await data.text();
      return {
        content,
        size: data.size,
        mimeType: data.type,
      };
    } catch (err) {
      console.error(`Error downloading ${storagePath}:`, err);
      return null;
    }
  }

  /**
   * Downloads multiple files
   */
  async downloadFiles(
    storagePaths: string[]
  ): Promise<Map<string, FileContent | null>> {
    const results = new Map<string, FileContent | null>();

    for (const path of storagePaths) {
      const content = await this.downloadFile(path);
      results.set(path, content);
    }

    return results;
  }

  /**
   * Downloads all files for a project
   */
  async downloadProjectFiles(
    projectStateId: string
  ): Promise<Map<string, FileContent | null>> {
    const projectPath = `projects/${projectStateId}`;

    try {
      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(projectPath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error(`Failed to list files for project ${projectStateId}:`, error.message);
        return new Map();
      }

      const storagePaths = files
        .filter((f) => f.name && !f.name.endsWith('/'))
        .map((f) => `${projectPath}/${f.name}`);

      return this.downloadFiles(storagePaths);
    } catch (err) {
      console.error(`Error listing project files:`, err);
      return new Map();
    }
  }

  // ==========================================================================
  // Delete Operations
  // ==========================================================================

  /**
   * Deletes a single file from storage
   */
  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

      if (error) {
        console.error(`Failed to delete ${storagePath}:`, error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`Error deleting ${storagePath}:`, err);
      return false;
    }
  }

  /**
   * Deletes multiple files from storage
   */
  async deleteFiles(storagePaths: string[]): Promise<number> {
    if (storagePaths.length === 0) {
      return 0;
    }

    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove(storagePaths);

      if (error) {
        console.error(`Failed to delete files:`, error.message);
        return 0;
      }

      return storagePaths.length;
    } catch (err) {
      console.error(`Error deleting files:`, err);
      return 0;
    }
  }

  /**
   * Deletes all files for a project
   */
  async deleteProjectFiles(projectStateId: string): Promise<number> {
    const projectPath = `projects/${projectStateId}`;

    try {
      // List all files in the project folder
      const { data: files, error: listError } = await this.supabase.storage
        .from(this.bucketName)
        .list(projectPath, {
          limit: 1000,
        });

      if (listError) {
        console.error(`Failed to list files for deletion:`, listError.message);
        return 0;
      }

      if (!files || files.length === 0) {
        return 0;
      }

      // Build full paths for all files
      const storagePaths = files
        .filter((f) => f.name && !f.name.endsWith('/'))
        .map((f) => `${projectPath}/${f.name}`);

      return this.deleteFiles(storagePaths);
    } catch (err) {
      console.error(`Error deleting project files:`, err);
      return 0;
    }
  }

  // ==========================================================================
  // URL Operations
  // ==========================================================================

  /**
   * Generates a signed URL for file access
   */
  async getSignedUrl(
    storagePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(storagePath, expiresInSeconds);

      if (error) {
        console.error(`Failed to create signed URL:`, error.message);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error(`Error creating signed URL:`, err);
      return null;
    }
  }

  /**
   * Generates public URL for a file (if bucket is public)
   */
  getPublicUrl(storagePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }

  // ==========================================================================
  // Utility Operations
  // ==========================================================================

  /**
   * Checks if a file exists in storage
   */
  async fileExists(storagePath: string): Promise<boolean> {
    try {
      // Try to get file metadata by downloading with range header
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(storagePath);

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Lists all files in a project folder
   */
  async listProjectFiles(projectStateId: string): Promise<string[]> {
    const projectPath = `projects/${projectStateId}`;

    try {
      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(projectPath, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error(`Failed to list project files:`, error.message);
        return [];
      }

      return files
        .filter((f) => f.name && !f.name.endsWith('/'))
        .map((f) => `${projectPath}/${f.name}`);
    } catch (err) {
      console.error(`Error listing project files:`, err);
      return [];
    }
  }

  /**
   * Gets the bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Determines MIME type from file path
   */
  private getMimeType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'dart':
        return 'text/x-dart';
      case 'yaml':
      case 'yml':
        return 'application/x-yaml';
      case 'json':
        return 'application/json';
      case 'md':
        return 'text/markdown';
      default:
        return 'text/plain';
    }
  }

  /**
   * Sleep utility for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultService: StorageService | null = null;

/**
 * Get the default StorageService instance
 */
export function getStorageService(): StorageService {
  if (!defaultService) {
    defaultService = new StorageService();
  }
  return defaultService;
}

/**
 * Create a new StorageService instance with custom bucket
 */
export function createStorageService(bucketName?: string): StorageService {
  return new StorageService(bucketName);
}
