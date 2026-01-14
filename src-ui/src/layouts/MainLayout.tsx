import React, { ReactNode, useState } from 'react';

interface MainLayoutProps {
  currentView: 'search' | 'status' | 'settings' | 'debug';
  onViewChange: (view: 'search' | 'status' | 'settings' | 'debug') => void;
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  onRemoveNotification: (id: string) => void;
  children: ReactNode;
}

const navItems = [
  { key: 'search', icon: '🔍', label: 'Search' },
  { key: 'status', icon: '📊', label: 'Status' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
  { key: 'debug', icon: '🔧', label: 'Debug' },
] as const;

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentView,
  onViewChange,
  notifications,
  onRemoveNotification,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
          bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700
          shadow-xl border-r border-white/10 backdrop-blur-md
          ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className="p-5 pb-4 flex justify-between items-center bg-black/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 bg-[length:200%_200%] animate-gradient" />
          
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              {sidebarCollapsed ? '🔍' : '🔍 RD'}
            </h2>
            {!sidebarCollapsed && (
              <p className="text-xs font-medium text-white/80 mt-1">RecallDesk</p>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-white/15 text-white border border-white/20
              hover:bg-white/25 hover:-translate-y-0.5 hover:scale-105
              transition-all duration-200 backdrop-blur-sm shadow-md"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                title={item.label}
                className={`flex items-center w-full p-3 rounded-xl cursor-pointer
                  transition-all duration-200 relative overflow-hidden gap-3
                  ${isActive
                    ? 'bg-white text-indigo-600 font-semibold shadow-md'
                    : 'bg-white/10 text-white/90 border border-white/5 hover:bg-white/15 hover:translate-x-1'
                  }
                  ${sidebarCollapsed ? 'justify-center !p-3' : ''}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out p-6
          ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        <div className="max-w-6xl mx-auto w-full pb-16">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        RecallDesk v1.0.0 • Smart local and Gmail search
      </footer>

      {/* Notifications */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[9999] max-w-sm">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm shadow-lg animate-slide-in-right
              ${notif.type === 'success' ? 'bg-green-500' : ''}
              ${notif.type === 'error' ? 'bg-red-500' : ''}
              ${notif.type === 'info' ? 'bg-blue-500' : ''}`}
          >
            <span className="flex-1">{notif.message}</span>
            <button
              onClick={() => onRemoveNotification(notif.id)}
              className="text-white/80 hover:text-white text-lg leading-none"
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
