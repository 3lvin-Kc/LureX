import React, { useEffect } from 'react';
import { useStatus } from '../hooks/useApi';

interface StatusProps {
  refreshInterval?: number;
}

export const Status: React.FC<StatusProps> = ({ refreshInterval = 5000 }) => {
  const { status, loading, error, fetchStatus } = useStatus();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading && !status) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading status...
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="p-8 text-center text-red-600 text-sm bg-red-50 rounded-xl">
        Failed to load status: {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        No status available
      </div>
    );
  }

  const cards = [
    {
      icon: '📧',
      title: 'Gmail',
      items: [
        { label: 'Connected', value: status.gmail_connected ? '✓ Yes' : '✗ No', isStatus: true, connected: status.gmail_connected },
        { label: 'Messages', value: status.gmail_message_count },
        status.gmail_last_sync && { label: 'Last Sync', value: formatDate(status.gmail_last_sync) },
        status.gmail_last_error && { label: 'Error', value: status.gmail_last_error, isError: true },
      ].filter(Boolean),
    },
    {
      icon: '📁',
      title: 'Files',
      items: [
        { label: 'Indexed', value: status.file_count },
        { label: 'Last Sync', value: status.file_last_sync ? formatDate(status.file_last_sync) : 'Never' },
        status.file_last_error && { label: 'Error', value: status.file_last_error, isError: true },
      ].filter(Boolean),
    },
    {
      icon: '📊',
      title: 'Overall',
      items: [
        { label: 'Total Indexed', value: status.total_indexed },
        { label: 'Database Size', value: `${status.database_size_mb.toFixed(2)} MB` },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
        <button
          onClick={() => fetchStatus()}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg
            hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed
            transition-colors"
        >
          {loading ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="border border-gray-200 rounded-lg overflow-hidden
              hover:border-indigo-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xl">{card.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
            </div>
            <div className="p-3 space-y-0">
              {card.items.map((item: any, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between py-2 text-xs border-b border-gray-100 last:border-0
                    ${item.isError ? 'text-red-600' : ''}`}
                >
                  <span className="font-medium text-gray-500">{item.label}</span>
                  <span className={`font-semibold text-right
                    ${item.isStatus ? (item.connected ? 'text-green-600' : 'text-red-600') : 'text-gray-900'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default Status;
