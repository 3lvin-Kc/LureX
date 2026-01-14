import React from 'react';
import Status from '../components/Status';

interface StatusPageProps {
  addNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const infoCards = [
  { icon: '📧', title: 'Gmail', desc: 'Shows your Gmail connection status and the number of messages indexed from your email account.' },
  { icon: '📁', title: 'Files', desc: 'Displays the number of local files currently indexed from your selected folders.' },
  { icon: '📊', title: 'Overall', desc: 'Shows the total number of indexed items across all sources and your database size.' },
  { icon: '🕐', title: 'Last Sync', desc: 'Indicates when your content was last synchronized with the search index.' },
  { icon: '❌', title: 'Errors', desc: 'If shown, indicates there was an issue during the last sync operation.' },
  { icon: '💾', title: 'Database Size', desc: 'The total size of your local search database in megabytes.' },
];

export const StatusPage: React.FC<StatusPageProps> = () => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Application Status</h1>
        <p className="text-sm text-gray-500">
          Monitor your Gmail connection, file indexing status, and overall search index health
        </p>
      </div>

      <Status refreshInterval={5000} />

      {/* Info Section */}
      <div className="mt-8 p-5 bg-white rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What do these stats mean?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {infoCards.map((card) => (
            <div key={card.title} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {card.icon} {card.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
