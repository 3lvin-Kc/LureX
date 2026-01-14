import React from 'react';
import { SearchResult } from '../types';

interface PreviewModalProps {
  result: SearchResult;
  onClose: () => void;
  onOpen?: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  result,
  onClose,
  onOpen,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{result.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block mb-1">Source</span>
              <span className="text-sm text-gray-900 font-medium">
                {result.source_type === 'gmail' ? '📧 Email' : '📄 File'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase block mb-1">Date</span>
              <span className="text-sm text-gray-900 font-medium">
                {new Date(result.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Content Preview</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {result.snippet || 'No preview available'}
            </p>
          </div>

          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
              <div className="space-y-2">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2 p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium text-gray-600 flex-shrink-0">{key}:</span>
                    <span className="text-gray-900 break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg
              hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {onOpen && (
            <button
              onClick={onOpen}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-lg
                hover:bg-indigo-600 transition-colors"
            >
              Open
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
