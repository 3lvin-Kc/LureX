/**
 * Tauri Bridge Diagnostic Test
 * This file contains comprehensive diagnostics for Tauri environment detection
 */

import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "../utils/tauri";

// Extend Window interface to include Tauri properties
declare global {
  interface Window {
    __TAURI__: any;
    __TAURI_IPC__: any;
  }
}

/**
 * Print all tauri detection signals for debugging
 */
export const printTauriDiagnostics = () => {
  console.group("🔍 Tauri Environment Diagnostics");
  
  // Location and environment info
  console.log("window.location.href:", typeof window !== "undefined" ? window.location.href : "N/A");
  console.log("navigator.userAgent:", typeof window !== "undefined" ? window.navigator.userAgent : "N/A");
  console.log('"__TAURI__" in window:', typeof window !== "undefined" ? "__TAURI__" in window : false);
  console.log("window.__TAURI__ value:", typeof window !== "undefined" ? window.__TAURI__ : undefined);
  console.log("window.__TAURI_IPC__ in window:", typeof window !== "undefined" ? "__TAURI_IPC__" in window : false);
  console.log("window.__TAURI_IPC__ value:", typeof window !== "undefined" ? window.__TAURI_IPC__ : undefined);
  
  // isTauri function result
  const tauriResult = isTauri();
  console.log("isTauri() result:", tauriResult);
  
  console.groupEnd();
};

/**
 * Test backend bridge connectivity
 */
export const testBackendConnectivity = async () => {
  console.group("📡 Tauri Backend Connectivity Test");
  
  try {
    console.log("Attempting to run invoke('health_check')...");
    const result = await invoke("health_check");
    console.log("✅ Health check successful:", result);
    return { success: true, result };
  } catch (error) {
    console.log("❌ Health check failed:", error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
};

/**
 * Run comprehensive tauri bridge test
 */
export const runTauriBridgeTest = async () => {
  console.group("🚀 Comprehensive Tauri Bridge Test");
  
  // Print diagnostics first
  printTauriDiagnostics();
  
  // Test backend connectivity
  const connectivityResult = await testBackendConnectivity();
  
  console.log("Tauri Bridge Test Summary:");
  console.log("- Tauri Environment Detected:", isTauri());
  console.log("- Backend Connectivity:", connectivityResult.success ? "✅ Working" : "❌ Failed");
  
  console.groupEnd();
  
  return {
    environmentDetected: isTauri(),
    connectivity: connectivityResult
  };
};