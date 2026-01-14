/**
 * Tauri Environment Guard Utility
 * Robust detection + safe wrappers
 *
 * IMPORTANT:
 * Your logs prove `window.__TAURI__` and core `isTauri()` can be false
 * even when invoke() works. So we DO NOT use window globals for detection.
 *
 * We use "capability detection":
 * - if invoke('health_check') works => we're in Tauri
 * - otherwise => browser
 */

import type { InvokeArgs } from '@tauri-apps/api/core';

let cachedTauriDetection: boolean | null = null;
let detectionPromise: Promise<boolean> | null = null;

/**
 * Capability-based Tauri detection.
 * Returns true if backend invoke works.
 */
export const detectTauri = async (): Promise<boolean> => {
  if (cachedTauriDetection !== null) return cachedTauriDetection;
  if (detectionPromise) return detectionPromise;

  detectionPromise = (async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      // health_check exists in your Rust invoke_handler, so this is ideal
      await invoke('health_check');
      cachedTauriDetection = true;
      return true;
    } catch (error) {
      console.error(`[Tauri Detection] health_check failed:`, error);
      cachedTauriDetection = false;
      return false;
    } finally {
      detectionPromise = null;
    }
  })();

  return detectionPromise;
};

/**
 * SYNC helper (best effort).
 * Returns cached value if available; otherwise defaults false.
 * Avoid using this for gating. Prefer detectTauri().
 */
export const isTauri = (): boolean => {
  return cachedTauriDetection === true;
};

/**
 * Check if running in browser.
 * NOTE: best effort.
 */
export const isBrowser = (): boolean => {
  return !isTauri();
};

/**
 * Safe invoke wrapper
 * - If tauri backend reachable: executes command
 * - Else returns null
 */
export const safeInvoke = async <T>(command: string, args?: InvokeArgs): Promise<T | null> => {
  const ok = await detectTauri();
  if (!ok) {
    console.warn(`[Browser Mode] Tauri command "${command}" not available. Returning null.`);
    return null;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`[Tauri] Command "${command}" failed:`, error);
    throw error;
  }
};

/**
 * Safe shell open wrapper
 * Uses plugin-shell (Tauri v2).
 * Returns silently if not available.
 */
export const safeShellOpen = async (path: string): Promise<void> => {
  try {
    // Do not gate by isTauri(); just attempt capability use

    const shellModule = await import('@tauri-apps/plugin-shell').catch(() => null);
    if (!shellModule) {
      console.warn(`[Shell] Plugin not available for "${path}"`);
      return;
    }
    await shellModule.open(path);
  } catch (error) {
    // If plugin not installed/registered or running in browser, this will throw
    console.warn(`[Shell] Not available for "${path}":`, error);
  }
};

/**
 * Safe dialog open wrapper
 * Uses plugin-dialog (Tauri v2).
 * Returns null if not available.
 */
export const safeDialogOpen = async (options?: {
  directory?: boolean;
  multiple?: boolean;
  defaultPath?: string;
}): Promise<string | string[] | null> => {
  try {
    // Do not gate by isTauri(); just attempt capability use
    const dialogModule = await import('@tauri-apps/plugin-dialog').catch(() => null);
    if (!dialogModule) {
      console.warn('[Dialog] Plugin not available');
      return null;
    }
    return await dialogModule.open(options);
  } catch (error) {
    console.warn('[Dialog] Not available:', error);
    return null;
  }
};

/**
 * Environment name (best effort)
 */
export const getEnvironment = (): 'tauri' | 'browser' => {
  return isTauri() ? 'tauri' : 'browser';
};

/**
 * Debug info
 */
export const getEnvironmentInfo = (): {
  tauriDetectedCached: boolean | null;
  environment: string;
  userAgent: string;
  href: string;
} => {
  return {
    tauriDetectedCached: cachedTauriDetection,
    environment: getEnvironment(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    href: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };
};

/**
 * Mock data for browser development mode
 */
export const getMockData = () => {
  return {
    searchResults: [
      {
        id: 'mock-1',
        title: 'Mock Email Result',
        snippet: 'This is a mock email result for browser development...',
        source_type: 'gmail' as const,
        created_at: new Date().toISOString(),
        metadata: {
          from: 'test@example.com',
          subject: 'Mock Email',
        },
      },
      {
        id: 'mock-2',
        title: 'Mock File Result',
        snippet: 'This is a mock file result for browser development...',
        source_type: 'file' as const,
        created_at: new Date().toISOString(),
        metadata: {
          path: '/path/to/mock/file.txt',
          size: '1.2 KB',
        },
      },
    ],
    status: {
      gmail_connected: false,
      gmail_message_count: 0,
      gmail_last_sync: null,
      gmail_last_error: null,
      file_count: 0,
      file_last_sync: null,
      file_last_error: null,
      total_indexed: 0,
      database_size_mb: 0,
    },
  };
};

/**
 * Show browser warning banner
 * NOTE: best effort - depends on cached detection.
 */
export const shouldShowBrowserWarning = (): boolean => {
  return isBrowser();
};

export default {
  detectTauri,
  isTauri,
  isBrowser,
  safeInvoke,
  safeShellOpen,
  safeDialogOpen,
  getEnvironment,
  getEnvironmentInfo,
  getMockData,
  shouldShowBrowserWarning,
};
