/**
 * Tauri API Service
 * Phase 5: Frontend-backend communication via Tauri commands
 */

import {
  SearchResult,
  AppStatus,
  ConnectGmailResponse,
  IndexFilesResponse,
  DisconnectGmailResponse,
  IndexGmailResponse,
  DeleteIndexResponse,
} from '../types';
import { detectTauri, safeInvoke, getMockData } from '../utils/tauri';

/**
 * API Service for communicating with Tauri backend
 */
export class ApiService {
  /**
   * Health check - verify backend is running
   */
  static async healthCheck(): Promise<{ status: string; version: string }> {
    const result = await safeInvoke<any>('health_check');
    if (result === null) {
      console.warn('[Browser Mode] Health check not available');
      return { status: 'browser_mode', version: '1.0.0-dev' };
    }
    return result;
  }

  // ============= Search Commands =============

  /**
   * Search across all indexed content
   */
  static async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const results = await safeInvoke<SearchResult[]>('search_command', {
      query: query.trim(),
    });

    if (results === null) {
      console.warn('[Browser Mode] Returning mock search results');
      const mockData = getMockData();
      return mockData.searchResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.snippet.toLowerCase().includes(query.toLowerCase())
      );
    }

    return results.sort((a, b) => {
      // Sort by date descending
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  /**
   * Search with filters
   */
  static async searchWithFilters(
    query: string,
    sourceType?: 'gmail' | 'file' | 'all'
  ): Promise<SearchResult[]> {
    const results = await this.search(query);

    if (sourceType && sourceType !== 'all') {
      return results.filter((r) => r.source_type === sourceType);
    }

    return results;
  }

  // ============= Gmail Commands =============

  /**
   * Initiate Gmail OAuth connection
   */
  static async connectGmail(): Promise<ConnectGmailResponse> {
    const response = await safeInvoke<ConnectGmailResponse>('connect_gmail_command');
    if (response === null) {
      throw new Error('Gmail connection not available in browser mode');
    }
    return response;
  }

  /**
   * Disconnect from Gmail and remove cached data
   */
  static async disconnectGmail(): Promise<DisconnectGmailResponse> {
    const response = await safeInvoke<DisconnectGmailResponse>('disconnect_gmail_command');
    if (response === null) {
      throw new Error('Gmail disconnect not available in browser mode');
    }
    return response;
  }

  /**
   * Sync Gmail messages
   */
  static async syncGmail(): Promise<IndexGmailResponse> {
    const response = await safeInvoke<IndexGmailResponse>('sync_gmail_command');
    if (response === null) {
      throw new Error('Gmail sync not available in browser mode');
    }
    return response;
  }

  // ============= File Indexing Commands =============

  /**
   * Index files from specified folders
   */
  static async indexFiles(folders: string[]): Promise<IndexFilesResponse> {
    console.log('[ApiService] indexFiles called with:', folders);
    console.log('[ApiService] Number of paths:', folders.length);
    console.log('[ApiService] Paths are:', JSON.stringify(folders, null, 2));

    if (!folders || folders.length === 0) {
      console.warn('[ApiService] No folders provided to indexFiles');
      throw new Error('At least one folder must be specified');
    }

    const invokePayload = { folders };
    console.log('[ApiService] Invoking index_files_command with payload:', invokePayload);

    const response = await safeInvoke<IndexFilesResponse>('index_files_command', invokePayload);

    console.log('[ApiService] Backend response:', response);

    if (response === null) {
      console.error('[ApiService] indexFiles returned null - backend not available');
      throw new Error('File indexing not available in browser mode');
    }

    console.log('[ApiService] Successfully indexed:', response.indexed_count, 'files');
    return response;
  }

  /**
   * Index a single folder
   */
  static async indexFolder(folderPath: string): Promise<IndexFilesResponse> {
    return this.indexFiles([folderPath]);
  }

  // ============= Status Commands =============

  /**
   * Get application status and statistics
   */
  static async getStatus(): Promise<AppStatus> {
    const response = await safeInvoke<AppStatus>('get_status_command');
    if (response === null) {
      console.warn('[Browser Mode] Returning mock status');
      return getMockData().status;
    }
    return response;
  }

  /**
   * Delete all indexed data
   * WARNING: This cannot be undone
   */
  static async deleteIndex(): Promise<DeleteIndexResponse> {
    const confirmed = confirm(
      'Are you sure you want to delete all indexed data? This cannot be undone.'
    );

    if (!confirmed) {
      throw new Error('Delete cancelled by user');
    }

    const response = await safeInvoke<DeleteIndexResponse>('delete_index_command');
    if (response === null) {
      throw new Error('Index deletion not available in browser mode');
    }

    return response;
  }

  // ============= Polling Methods =============

  /**
   * Poll status until operation completes
   */
  static async pollStatus(
    condition: (status: AppStatus) => boolean,
    maxWaitMs: number = 30000,
    intervalMs: number = 1000
  ): Promise<AppStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getStatus();

      if (condition(status)) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Operation timeout');
  }

  /**
   * Wait for Gmail sync to complete
   */
  static async waitForGmailSync(maxWaitMs: number = 60000): Promise<AppStatus> {
    return this.pollStatus((status) => !status.gmail_last_error, maxWaitMs, 2000);
  }

  /**
   * Wait for file sync to complete
   */
  static async waitForFileSync(maxWaitMs: number = 60000): Promise<AppStatus> {
    return this.pollStatus((status) => !status.file_last_error, maxWaitMs, 2000);
  }
}

/**
 * Error handling utility
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Success notification helper
 */
export function formatSuccess(message: string, count?: number): string {
  if (count !== undefined) {
    return `${message}: ${count} item${count === 1 ? '' : 's'}`;
  }
  return message;
}
