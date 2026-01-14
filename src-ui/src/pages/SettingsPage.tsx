import React from 'react'
import Settings from '../components/Settings'


interface SettingsPageProps {
  addNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ addNotification }) => {
  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h1>Settings</h1>
        <p className="page-description">Configure Gmail, file indexing, and application preferences</p>
      </div>

      <Settings onSettingsChange={() => addNotification?.('success', 'Settings updated')} />
    </div>
  )
}

export default SettingsPage
