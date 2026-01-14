import React, { ReactNode, useState } from 'react';


interface MainLayoutProps {
  currentView: 'search' | 'status' | 'settings' | 'debug';
  onViewChange: (view: 'search' | 'status' | 'settings' | 'debug') => void;
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  onRemoveNotification: (id: string) => void;
  children: ReactNode;
}

/**
 * MainLayout Component
 * Provides consistent header, navigation, footer, and notification system
 * for all pages in the application
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  currentView,
  onViewChange,
  notifications,
  onRemoveNotification,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-row min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className={`sidebar w-72 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              {sidebarCollapsed ? '🔍' : '🔍 RD'}
            </h2>
            {!sidebarCollapsed && (
              <p className="text-sm font-medium text-white/90 mt-1">RecallDesk</p>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${currentView === 'search' ? 'active' : ''}`}
            onClick={() => onViewChange('search')}
            title="Search content"
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Search</span>
          </button>
          <button
            className={`nav-btn ${currentView === 'status' ? 'active' : ''}`}
            onClick={() => onViewChange('status')}
            title="View status"
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Status</span>
          </button>
          <button
            className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => onViewChange('settings')}
            title="Configure app"
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
          <button
            className={`nav-btn ${currentView === 'debug' ? 'active' : ''}`}
            onClick={() => onViewChange('debug')}
            title="Tauri diagnostics and runtime tests"
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">Debug</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`app-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 text-center text-sm text-gray-500">
        <p>RecallDesk v1.0.0 • Smart local and Gmail search</p>
      </footer>

      {/* Notifications Container */}
      <div className="notifications-container">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification notification-${notif.type}`}>
            <span>{notif.message}</span>
            <button
              className="notification-close"
              onClick={() => onRemoveNotification(notif.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainLayout;
