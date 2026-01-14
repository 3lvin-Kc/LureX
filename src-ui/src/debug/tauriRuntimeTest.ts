/**
 * Tauri Runtime Detection Test
 * Diagnoses why window.__TAURI__ globals may be missing while invoke() works.
 *
 * BACKGROUND:
 * In some Tauri setups, window.__TAURI__ and __TAURI_IPC__ are not set even though
 * the Tauri bridge is functional. This happens because:
 * 1. Preload script timing - globals might not be injected when code runs
 * 2. IPC bridge - Tauri's actual invoke() bridge can work independently of globals
 * 3. Dev vs Production - Different initialization in dev mode
 *
 * Solution: Use capability detection (invoke works) instead of global checks.
 */

export interface TauriRuntimeTest {
  timestamp: string;
  environment: {
    href: string;
    userAgent: string;
    isDev: boolean;
  };
  globals: {
    hasTauriGlobal: boolean;
    hasIpcGlobal: boolean;
    hasInvoke: boolean;
  };
  capabilityTest: {
    healthCheckResult: 'success' | 'failed';
    errorMessage?: string;
  };
  conclusion: {
    tauriDetected: boolean;
    backendReachable: boolean;
    recommendedMode: 'tauri' | 'browser';
    explanation: string;
  };
}

/**
 * Run comprehensive Tauri runtime detection test
 * Logs findings and returns diagnostic result
 */
export async function runTauriRuntimeTest(): Promise<TauriRuntimeTest> {
  console.group(
    '%c🔍 Tauri Runtime Detection Test',
    'font-size: 14px; font-weight: bold; color: #0066cc;'
  );

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // ============================================================================
  // STEP 1: Check environment context
  // ============================================================================
  console.group('Environment Context');
  const href = typeof window !== 'undefined' ? window.location.href : 'unknown';
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';
  const isDev = href.includes('localhost') || href.includes('127.0.0.1');

  console.log('📍 URL:', href);
  console.log('🖥️  User Agent:', userAgent);
  console.log('⚙️  Dev Mode:', isDev);
  console.groupEnd();

  // ============================================================================
  // STEP 2: Check for Tauri globals (UNRELIABLE but informative)
  // ============================================================================
  console.group('Global Object Checks (⚠️  May be false negative)');

  const hasTauriGlobal = typeof (window as any).__TAURI__ !== 'undefined';
  const hasIpcGlobal = typeof (window as any).__TAURI_IPC__ !== 'undefined';
  const hasInvoke = typeof (window as any).__TAURI_INVOKE__ !== 'undefined';

  console.log('window.__TAURI__:', hasTauriGlobal ? '✅ present' : '❌ missing');
  console.log('window.__TAURI_IPC__:', hasIpcGlobal ? '✅ present' : '❌ missing');
  console.log('window.__TAURI_INVOKE__:', hasInvoke ? '✅ present' : '❌ missing');

  if (!hasTauriGlobal && !hasIpcGlobal) {
    console.warn('⚠️  Globals missing! This can happen in dev mode or certain Tauri configs.');
    console.warn('⚠️  Proceeding to capability test...');
  }

  console.groupEnd();

  // ============================================================================
  // STEP 3: Capability test - The RELIABLE way to detect Tauri
  // ============================================================================
  console.group('Capability Test (✅ Most Reliable)');
  console.log('Attempting invoke("health_check")...');

  let healthCheckResult: 'success' | 'failed' = 'failed';
  let errorMessage: string | undefined;

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const response = await invoke('health_check');
    console.log('✅ invoke() succeeded! Response:', response);
    healthCheckResult = 'success';
  } catch (error) {
    healthCheckResult = 'failed';
    errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ invoke() failed:', errorMessage);
  }

  console.groupEnd();

  // ============================================================================
  // STEP 4: Conclusion
  // ============================================================================
  console.group('Conclusion');

  const tauriDetected = healthCheckResult === 'success';
  const backendReachable = healthCheckResult === 'success';
  const recommendedMode = tauriDetected ? ('tauri' as const) : ('browser' as const);

  let explanation = '';
  if (tauriDetected) {
    if (hasTauriGlobal && hasIpcGlobal) {
      explanation =
        '✅ App is in Tauri. All systems operational. Globals present, backend responsive.';
    } else {
      explanation =
        '✅ App is in Tauri (GLOBALS MISSING BUT INVOKE WORKS). This is a known issue. Use capability detection.';
    }
  } else {
    explanation =
      '❌ App is in Browser Mode. Backend unreachable. Use mock data / browser fallbacks.';
  }

  console.log('🎯 Tauri Detected:', tauriDetected ? '✅ YES' : '❌ NO');
  console.log('🎯 Backend Reachable:', backendReachable ? '✅ YES' : '❌ NO');
  console.log('🎯 Recommended Mode:', recommendedMode.toUpperCase());
  console.log('💬 Explanation:', explanation);
  console.log('⏱️  Test Duration:', `${Date.now() - startTime}ms`);

  console.groupEnd();

  const result: TauriRuntimeTest = {
    timestamp,
    environment: {
      href,
      userAgent,
      isDev,
    },
    globals: {
      hasTauriGlobal,
      hasIpcGlobal,
      hasInvoke,
    },
    capabilityTest: {
      healthCheckResult,
      errorMessage,
    },
    conclusion: {
      tauriDetected,
      backendReachable,
      recommendedMode,
      explanation,
    },
  };

  // Log raw JSON for copy-paste debugging
  console.log('%c📋 Full Test Result (JSON)', 'font-size: 12px; color: #666;');
  console.log(JSON.stringify(result, null, 2));

  console.groupEnd(); // closes main group

  return result;
}

/**
 * Simpler inline test for quick checks
 */
export function quickTauriCheck(): {
  globalsPresent: boolean;
  explanation: string;
} {
  const hasGlobals =
    typeof (window as any).__TAURI__ !== 'undefined' &&
    typeof (window as any).__TAURI_IPC__ !== 'undefined';

  return {
    globalsPresent: hasGlobals,
    explanation: hasGlobals
      ? '✅ Globals present - should work'
      : '⚠️  Globals missing - use capability detection via invoke()',
  };
}

/**
 * Log path validation test results
 */
export function testPathValidation(): void {
  console.group('%c🛣️  Path Validation Tests', 'font-size: 12px; color: #0066cc;');

  const testPaths = [
    'C:\\Users\\r6409\\Downloads',
    'C:\\Program Files\\App',
    '/home/user/documents',
    'C:\\Users\\test\\file with spaces.txt',
    'invalid:path:with:colons',
    'path<>with|invalid*chars',
  ];

  testPaths.forEach((path) => {
    // Correct regex: allows ":" in Windows drive letters, rejects other invalid chars
    const invalidChars = /[<>"|?*]/; // Note: ":" is NOT in this list
    const isValid = !invalidChars.test(path);

    console.log(`${isValid ? '✅' : '❌'} ${path}`);
  });

  console.groupEnd();
}

export default {
  runTauriRuntimeTest,
  quickTauriCheck,
  testPathValidation,
};
