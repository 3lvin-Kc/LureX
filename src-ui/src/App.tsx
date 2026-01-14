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
import './index.css';

type AppView = 'search' | 'status' | 'settings' | 'debug';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('search');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const notificationIdCounter = useRef(0);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('[App Init] Starting Tauri detection...');
      try {
        const isTauriRuntime = await detectTauri();
        console.log('[App Init] ✅ Tauri detection complete:', isTauriRuntime);
      } catch (error) {
        console.error('[App Init] ❌ Tauri detection error:', error);
      }

      console.log('window.location.href:', window.location.href);
      console.log('navigator.userAgent:', window.navigator.userAgent);
      console.log('"__TAURI__" in window:', '__TAURI__' in window);
      console.log('window.__TAURI__ value:', (window as any).__TAURI__);
      console.log('isTauri() result:', isTauri());

      if (isTauri()) {
        console.log('invoke function available:', typeof invoke);
      }

      try {
        const runtimeTest = await runTauriRuntimeTest();
        setTestResults(runtimeTest);
        console.log('✅ Tauri Runtime Test completed');
      } catch (error) {
        console.error('❌ Runtime test failed:', error);
      }

      runTauriBridgeTest().catch((error) => {
        setInitError(`Diagnostic test failed: ${error.message || 'Unknown error'}`);
      });

      setAppReady(true);
    };

    initializeApp();
  }, []);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    notificationIdCounter.current += 1;
    const id = `notification-${notificationIdCounter.current}`;
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!appReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-4xl mb-4 animate-spin">⟳</div>
        <h2 className="text-xl font-semibold text-gray-900">Initializing RecallDesk...</h2>
        {initError && (
          <div className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
            {initError}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {isBrowser() && (
        <div className="bg-amber-100 text-amber-800 py-3 px-5 text-center border-b-2 border-amber-400 font-medium text-sm">
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
