/**
 * Custom React hooks for API operations
 * Phase 5: Hooks for search, Gmail sync, file indexing
 */

import { useState, useCallback, useEffect } from 'react';
import { ApiService, formatError } from '../services/api';
import { SearchResult, AppStatus, IndexFilesResponse } from '../types';

/**
 * Hook for searching across indexed content
 */
export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ApiService.search(query);
      setResults(data);
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('Search error:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

/**
 * Hook for application status
 */
export function useStatus() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ApiService.getStatus();
      setStatus(data);
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('Status fetch error:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const pollStatus = useCallback(async (intervalMs: number = 5000) => {
    const interval = setInterval(async () => {
      try {
        const data = await ApiService.getStatus();
        setStatus(data);
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    loading,
    error,
    fetchStatus,
    pollStatus,
  };
}

/**
 * Hook for Gmail operations
 */
export function useGmail() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);

    try {
      const response = await ApiService.connectGmail();
      console.log('Gmail connection URL:', response.oauth_url);
      // In a real app, you'd open the OAuth URL in a browser
      window.open(response.oauth_url, '_blank');
      setConnected(true);
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('Gmail connect error:', message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setError(null);

    try {
      await ApiService.disconnectGmail();
      setConnected(false);
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('Gmail disconnect error:', message);
    }
  }, []);

  const sync = useCallback(async () => {
    setError(null);
    setSyncing(true);

    try {
      const response = await ApiService.syncGmail();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('Gmail sync error:', message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    connected,
    syncing,
    error,
    connect,
    disconnect,
    sync,
  };
}

/**
 * Hook for file indexing operations
 */
export function useFileIndexing() {
  const [indexing, setIndexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<IndexFilesResponse | null>(null);

  const indexFolders = useCallback(async (folders: string[]) => {
    if (!folders || folders.length === 0) {
      setError('No folders specified');
      return;
    }

    setError(null);
    setIndexing(true);

    try {
      const response = await ApiService.indexFiles(folders);
      setLastResult(response);
      return response;
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('File indexing error:', message);
      throw err;
    } finally {
      setIndexing(false);
    }
  }, []);

  const indexFolder = useCallback(
    async (folderPath: string) => {
      return indexFolders([folderPath]);
    },
    [indexFolders]
  );

  return {
    indexing,
    error,
    lastResult,
    indexFolders,
    indexFolder,
  };
}

/**
 * Hook for index management
 */
export function useIndexManagement() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteIndex = useCallback(async () => {
    setError(null);
    setDeleting(true);

    try {
      const response = await ApiService.deleteIndex();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    } catch (err) {
      const message = formatError(err);
      setError(message);
      console.error('Delete index error:', message);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    deleting,
    error,
    deleteIndex,
  };
}

/**
 * Hook for auto-polling status
 */
export function useStatusPolling(intervalMs: number = 5000) {
  const { status, fetchStatus } = useStatus();

  useEffect(() => {
    // Fetch initial status
    fetchStatus();

    // Set up polling
    const interval = setInterval(fetchStatus, intervalMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return status;
}

/**
 * Hook for combined app operations
 */
export function useAppOperations() {
  const search = useSearch();
  const status = useStatus();
  const gmail = useGmail();
  const fileIndexing = useFileIndexing();
  const indexManagement = useIndexManagement();

  return {
    search,
    status,
    gmail,
    fileIndexing,
    indexManagement,
  };
}
