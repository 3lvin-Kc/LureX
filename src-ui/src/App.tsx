import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import MainLayout from './layouts/MainLayout';
import SearchPage from './pages/SearchPage';
import StatusPage from './pages/StatusPage';
import SettingsPage from './pages/SettingsPage';
import { isBrowser, isTauri, detectTauri } from './utils/tauri';
import { runTauriBridgeTest } from './debug/tauriBridgeTest';
import { runTauriRuntimeTest } from './debug/tauriRuntimeTest';
import TauriTestPanel from './components/Debug/TauriTestPanel';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './index.css';

type AppView = 'search' | 'status' | 'settings' | 'debug';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

/**
 * Main App Component
 * Manages routing and global notification state
 */
export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('search');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const notificationIdCounter = useRef(0);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // CRITICAL: Initialize Tauri detection FIRST, before anything else
      // This ensures cachedTauriDetection is set before any API calls
      console.log('[App Init] Starting Tauri detection...');
      try {
        const isTauriRuntime = await detectTauri();
        console.log('[App Init] ✅ Tauri detection complete:', isTauriRuntime);
      } catch (error) {
        console.error('[App Init] ❌ Tauri detection error:', error);
      }

      // Startup diagnostics
      console.log('window.location.href:', window.location.href);
      console.log('navigator.userAgent:', window.navigator.userAgent);
      console.log('"__TAURI__" in window:', '__TAURI__' in window);
      console.log('window.__TAURI__ value:', (window as any).__TAURI__);

      // Call the imported isTauri function
      console.log('isTauri() result:', isTauri());

      // Use the imported invoke function to test basic functionality
      if (isTauri()) {
        // Just reference the invoke function to satisfy TypeScript
        console.log('invoke function available:', typeof invoke);
      }

      // Run comprehensive tauri runtime test
      try {
        const runtimeTest = await runTauriRuntimeTest();
        setTestResults(runtimeTest);
        console.log('✅ Tauri Runtime Test completed');
      } catch (error) {
        console.error('❌ Runtime test failed:', error);
      }

      // Run comprehensive tauri bridge test
      runTauriBridgeTest().catch((error) => {
        setInitError(`Diagnostic test failed: ${error.message || 'Unknown error'}`);
      });

      // Set app as ready immediately - backend commands will handle errors
      setAppReady(true);
    };

    initializeApp();
  }, []);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    notificationIdCounter.current += 1;
    const id = `notification-${notificationIdCounter.current}`;
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!appReady) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">⟳</div>
        <h2>Initializing RecallDesk...</h2>
        {initError && <div className="error-message">{initError}</div>}
      </div>
    );
  }

  return (
    <>
      {isBrowser() && (
        <div className="bg-yellow-100 text-yellow-800 py-3 px-5 text-center border-b-2 border-yellow-400 font-medium">
          ⚠️ Browser Mode - Running with mock data. Backend features disabled.
        </div>
      )}
      <MainLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        notifications={notifications}
        onRemoveNotification={removeNotification}
      >
        {currentView === 'search' && <SearchPage addNotification={addNotification} />}
        {currentView === 'status' && <StatusPage addNotification={addNotification} />}
        {currentView === 'settings' && <SettingsPage addNotification={addNotification} />}
        {currentView === 'debug' && <TauriTestPanel />}
      </MainLayout>
    </>
  );
};

export default App;
