/**
 * Status Component
 * Displays application statistics, sync status, and health
 * Phase 5: React component for status display
 */

import React, { useEffect } from 'react';
import { useStatus } from '../hooks/useApi';
import type { AppStatus } from '../types/index';

interface StatusProps {
  refreshInterval?: number;
}

/**
 * Status Component - Shows app statistics and health
 */
export const Status: React.FC<StatusProps> = ({ refreshInterval = 5000 }) => {
  const { status, loading, error, fetchStatus } = useStatus();

  useEffect(() => {
    // Fetch initial status
    fetchStatus();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchStatus();
    }, refreshInterval);

    // Cleanup interval on unmount or dependency change
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  if (loading && !status) {
    return <div className="p-5 text-center text-gray-600 text-sm">Loading status...</div>;
  }

  if (error && !status) {
    return <div className="p-5 text-center text-gray-600 text-sm bg-red-50 text-red-600 rounded-lg">Failed to load status: {error}</div>;
  }

  if (!status) {
    return <div className="p-5 text-center text-gray-600 text-sm">No status available</div>;
  }

  return (
    <div className="p-5 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2>Application Status</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white border-none rounded-lg cursor-pointer text-sm transition-all duration-200 hover:bg-blue-600 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => fetchStatus()}
          disabled={loading}
          title="Refresh status"
        >
          {loading ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gmail Status */}
        <div className="border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-500 hover:shadow-md">
          <div className="flex items-center gap-3 p-3 bg-gray-100 border-b border-gray-300">
            <span className="text-xl">📧</span>
            <h3>Gmail</h3>
          </div>
          <div className="p-3">
            <div className="flex justify-between py-2 text-xs border-b border-gray-200">
              <span className="font-medium text-gray-600">Connected:</span>
              <span className={`text-right text-gray-900 font-semibold ${status.gmail_connected ? 'text-green-500' : 'text-red-600'}`}>
                {status.gmail_connected ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex justify-between py-2 text-xs border-b border-gray-200">
              <span className="font-medium text-gray-600">Messages:</span>
              <span className="text-right text-gray-900 font-semibold">{status.gmail_message_count}</span>
            </div>
            {status.gmail_last_sync && (
              <div className="flex justify-between py-2 text-xs border-b border-gray-200">
                <span className="font-medium text-gray-600">Last Sync:</span>
                <span className="text-right text-gray-900 font-semibold">{formatDate(status.gmail_last_sync)}</span>
              </div>
            )}
            {status.gmail_last_error && (
              <div className="flex justify-between py-2 text-xs border-b border-gray-200 text-red-600">
                <span className="font-medium text-gray-600">Error:</span>
                <span className="text-right text-gray-900 font-semibold">{status.gmail_last_error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Files Status */}
        <div className="border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-500 hover:shadow-md">
          <div className="flex items-center gap-3 p-3 bg-gray-100 border-b border-gray-300">
            <span className="text-xl">📁</span>
            <h3>Files</h3>
          </div>
          <div className="p-3">
            <div className="flex justify-between py-2 text-xs border-b border-gray-200">
              <span className="font-medium text-gray-600">Indexed:</span>
              <span className="text-right text-gray-900 font-semibold">{status.file_count}</span>
            </div>
            {status.file_last_sync && (
              <div className="flex justify-between py-2 text-xs border-b border-gray-200">
                <span className="font-medium text-gray-600">Last Sync:</span>
                <span className="text-right text-gray-900 font-semibold">{formatDate(status.file_last_sync)}</span>
              </div>
            )}
            {!status.file_last_sync && (
              <div className="flex justify-between py-2 text-xs border-b border-gray-200">
                <span className="font-medium text-gray-600">Last Sync:</span>
                <span className="text-right text-gray-900 font-semibold">Never</span>
              </div>
            )}
            {status.file_last_error && (
              <div className="flex justify-between py-2 text-xs border-b border-gray-200 text-red-600">
                <span className="font-medium text-gray-600">Error:</span>
                <span className="text-right text-gray-900 font-semibold">{status.file_last_error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-500 hover:shadow-md">
          <div className="flex items-center gap-3 p-3 bg-gray-100 border-b border-gray-300">
            <span className="text-xl">📊</span>
            <h3>Overall</h3>
          </div>
          <div className="p-3">
            <div className="flex justify-between py-2 text-xs border-b border-gray-200">
              <span className="font-medium text-gray-600">Total Indexed:</span>
              <span className="text-right text-gray-900 font-semibold">{status.total_indexed}</span>
            </div>
            <div className="flex justify-between py-2 text-xs border-b border-gray-200">
              <span className="font-medium text-gray-600">Database Size:</span>
              <span className="text-right text-gray-900 font-semibold">{status.database_size_mb.toFixed(2)} MB</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-lg text-xs border-l-4 border-red-500">{error}</div>}
    </div>
  );
};

/**
 * Format date string for display
 */
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
