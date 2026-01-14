import React, { useState } from 'react';
import { runTauriRuntimeTest, testPathValidation } from '../../debug/tauriRuntimeTest';
import type { TauriRuntimeTest } from '../../debug/tauriRuntimeTest';

interface TestResult {
  tauriTest: TauriRuntimeTest | null;
  loading: boolean;
  error: string | null;
}

export const TauriTestPanel: React.FC = () => {
  const [result, setResult] = useState<TestResult>({
    tauriTest: null,
    loading: false,
    error: null,
  });

  const handleRunTest = async () => {
    setResult({ tauriTest: null, loading: true, error: null });
    try {
      const testResult = await runTauriRuntimeTest();
      setResult({ tauriTest: testResult, loading: false, error: null });
    } catch (err) {
      setResult({
        tauriTest: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleTestPaths = () => {
    console.clear();
    testPathValidation();
    alert('Path validation test logged to console. Check DevTools.');
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <h2 style={{ marginTop: 0, color: '#0066cc' }}>🔍 Tauri Runtime Diagnostics</h2>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={handleRunTest}
          disabled={result.loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: result.loading ? 'not-allowed' : 'pointer',
            opacity: result.loading ? 0.6 : 1,
          }}
        >
          {result.loading ? '⏳ Running Test...' : '▶️ Run Tauri Test'}
        </button>

        <button
          onClick={handleTestPaths}
          style={{
            padding: '8px 16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🛣️ Test Path Validation
        </button>
      </div>

      {result.error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '4px',
            color: '#c62828',
            marginBottom: '16px',
          }}
        >
          <strong>❌ Error:</strong> {result.error}
        </div>
      )}

      {result.tauriTest && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #999',
            borderRadius: '4px',
            overflowX: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#333' }}>Test Results</h3>

          {/* Environment */}
          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              📍 Environment Context
            </summary>
            <div style={{ marginLeft: '16px', marginBottom: '12px' }}>
              <div>
                <strong>URL:</strong> {result.tauriTest.environment.href}
              </div>
              <div>
                <strong>User Agent:</strong> {result.tauriTest.environment.userAgent}
              </div>
              <div>
                <strong>Dev Mode:</strong> {result.tauriTest.environment.isDev ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </details>

          {/* Globals */}
          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              🔗 Global Objects (⚠️ May be unreliable)
            </summary>
            <div style={{ marginLeft: '16px', marginBottom: '12px' }}>
              <div>
                <strong>window.__TAURI__:</strong>{' '}
                {result.tauriTest.globals.hasTauriGlobal ? '✅ Present' : '❌ Missing'}
              </div>
              <div>
                <strong>window.__TAURI_IPC__:</strong>{' '}
                {result.tauriTest.globals.hasIpcGlobal ? '✅ Present' : '❌ Missing'}
              </div>
              <div>
                <strong>window.__TAURI_INVOKE__:</strong>{' '}
                {result.tauriTest.globals.hasInvoke ? '✅ Present' : '❌ Missing'}
              </div>
            </div>
          </details>

          {/* Capability Test */}
          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              ✅ Capability Test (Most Reliable)
            </summary>
            <div style={{ marginLeft: '16px', marginBottom: '12px' }}>
              <div>
                <strong>invoke("health_check"):</strong>{' '}
                {result.tauriTest.capabilityTest.healthCheckResult === 'success' ? (
                  <span style={{ color: 'green' }}>✅ Success</span>
                ) : (
                  <span style={{ color: 'red' }}>❌ Failed</span>
                )}
              </div>
              {result.tauriTest.capabilityTest.errorMessage && (
                <div style={{ marginTop: '8px', color: '#d32f2f' }}>
                  <strong>Error:</strong> {result.tauriTest.capabilityTest.errorMessage}
                </div>
              )}
            </div>
          </details>

          {/* Conclusion */}
          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              🎯 Conclusion
            </summary>
            <div style={{ marginLeft: '16px', marginBottom: '12px' }}>
              <div>
                <strong>Tauri Detected:</strong>{' '}
                {result.tauriTest.conclusion.tauriDetected ? (
                  <span style={{ color: 'green' }}>✅ YES</span>
                ) : (
                  <span style={{ color: 'red' }}>❌ NO</span>
                )}
              </div>
              <div>
                <strong>Backend Reachable:</strong>{' '}
                {result.tauriTest.conclusion.backendReachable ? (
                  <span style={{ color: 'green' }}>✅ YES</span>
                ) : (
                  <span style={{ color: 'red' }}>❌ NO</span>
                )}
              </div>
              <div>
                <strong>Recommended Mode:</strong> <code>{result.tauriTest.conclusion.recommendedMode}</code>
              </div>
              <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                <strong>Explanation:</strong>
                <div style={{ marginTop: '4px' }}>{result.tauriTest.conclusion.explanation}</div>
              </div>
              <div style={{ marginTop: '8px', color: '#999' }}>
                <small>Timestamp: {result.tauriTest.timestamp}</small>
              </div>
            </div>
          </details>

          {/* JSON Export */}
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' }}>
              📋 Full JSON Result
            </summary>
            <pre
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
              }}
            >
              {JSON.stringify(result.tauriTest, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
        <strong>💡 Usage:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>
            Click <strong>"Run Tauri Test"</strong> to check if the app correctly detects Tauri runtime
          </li>
          <li>
            If <strong>globals are missing</strong> but <strong>invoke succeeds</strong>, your app is correctly using
            capability-based detection
          </li>
          <li>
            Click <strong>"Test Path Validation"</strong> to verify Windows paths (with colons) are accepted
          </li>
          <li>Check browser console for detailed logging output</li>
        </ul>
      </div>
    </div>
  );
};

export default TauriTestPanel;
