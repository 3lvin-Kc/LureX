import React from 'react';
import Status from '../components/Status';


interface StatusPageProps {
  addNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const StatusPage: React.FC<StatusPageProps> = () => {
  return (
    <div className="status-page">
      <div className="page-header">
        <h1>Application Status</h1>
        <p className="page-description">
          Monitor your Gmail connection, file indexing status, and overall search index health
        </p>
      </div>

      <Status refreshInterval={5000} />

      <div className="status-info-section">
        <h2>What do these stats mean?</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>📧 Gmail</h3>
            <p>
              Shows your Gmail connection status and the number of messages indexed from your email
              account.
            </p>
          </div>

          <div className="info-card">
            <h3>📁 Files</h3>
            <p>Displays the number of local files currently indexed from your selected folders.</p>
          </div>

          <div className="info-card">
            <h3>📊 Overall</h3>
            <p>
              Shows the total number of indexed items across all sources and your database size.
            </p>
          </div>

          <div className="info-card">
            <h3>🕐 Last Sync</h3>
            <p>Indicates when your content was last synchronized with the search index.</p>
          </div>

          <div className="info-card">
            <h3>❌ Errors</h3>
            <p>If shown, indicates there was an issue during the last sync operation.</p>
          </div>

          <div className="info-card">
            <h3>💾 Database Size</h3>
            <p>The total size of your local search database in megabytes.</p>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default StatusPage;
