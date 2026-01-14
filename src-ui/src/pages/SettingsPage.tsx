import React from 'react';
import Settings from '../components/Settings';

interface SettingsPageProps {
  addNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ addNotification }) => {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500">
          Configure Gmail, file indexing, and application preferences
        </p>
      </div>

      <Settings onSettingsChange={() => addNotification?.('success', 'Settings updated')} />
    </div>
  );
};

export default SettingsPage;
