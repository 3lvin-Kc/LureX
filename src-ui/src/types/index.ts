// Type definitions for RecallDesk frontend

/**
 * Search result from backend
 */
export interface SearchResult {
  id: string;
  source_type: 'gmail' | 'file';
  title: string;
  snippet: string;
  created_at: string;
  metadata: Record<string, any>;
}

/**
 * Application status and statistics
 */
export interface AppStatus {
  gmail_connected: boolean;
  gmail_message_count: number;
  gmail_last_sync: string | null;
  gmail_last_error: string | null;
  file_count: number;
  file_last_sync: string | null;
  file_last_error: string | null;
  total_indexed: number;
  database_size_mb: number;
}

/**
 * Gmail connection response
 */
export interface ConnectGmailResponse {
  oauth_url: string;
  message: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Index Gmail response
 */
export interface IndexGmailResponse {
  success: boolean;
  synced_count: number;
  total_messages: number;
  message: string;
}

/**
 * Index files response
 */
export interface IndexFilesResponse {
  success: boolean;
  indexed_count: number;
  total_files: number;
  message: string;
}

/**
 * Disconnect Gmail response
 */
export interface DisconnectGmailResponse {
  success: boolean;
  message: string;
}

/**
 * Delete index response
 */
export interface DeleteIndexResponse {
  success: boolean;
  message: string;
}

/**
 * Sync status for UI updates
 */
export interface SyncStatus {
  is_syncing: boolean;
  progress_percent: number;
  current_operation: string;
  last_error: string | null;
}

/**
 * Search filters
 */
export interface SearchFilters {
  source?: 'gmail' | 'file' | 'all';
  start_date?: string;
  end_date?: string;
  limit?: number;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Paginated search results
 */
export interface PaginatedSearchResults {
  items: SearchResult[];
  pagination: PaginationInfo;
}

/**
 * Gmail message details
 */
export interface GmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  labels: string[];
}

/**
 * Local file details
 */
export interface LocalFileInfo {
  path: string;
  name: string;
  size: number;
  modified_at: string;
  file_type: string;
}

/**
 * Application configuration (frontend)
 */
export interface AppConfig {
  google_client_id: string;
  oauth_port: number;
  max_extract_size: number;
  supported_extensions: string[];
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  auto_sync_gmail: boolean;
  auto_sync_interval: number; // seconds
  auto_index_folders: string[];
  results_per_page: number;
}

/**
 * Notification for UI
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // milliseconds
}

/**
 * Command execution result
 */
export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Search state
 */
export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  total_results: number;
}

/**
 * Gmail state
 */
export interface GmailState {
  connected: boolean;
  syncing: boolean;
  message_count: number;
  last_sync: string | null;
  error: string | null;
}

/**
 * File indexing state
 */
export interface FilesState {
  selected_folders: string[];
  indexing: boolean;
  file_count: number;
  last_sync: string | null;
  error: string | null;
}

/**
 * Global app state
 */
export interface GlobalAppState {
  status: AppStatus | null;
  search: SearchState;
  gmail: GmailState;
  files: FilesState;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}
