import React, { useState, useCallback } from 'react';
import SearchBox from '../components/SearchBox';
import { SearchResult } from '../types';
import FileSystemService from '../services/fileSystem';

interface SearchPageProps {
  addNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ addNotification }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleResults = useCallback((newResults: SearchResult[]) => {
    setResults(newResults);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    setSelectedResult(result);
    setPreviewOpen(true);
  }, []);

  const handleOpenFile = useCallback(
    async (result: SearchResult) => {
      try {
        if (result.source_type === 'file') {
          const filePath = result.id || result.metadata?.file_path;
          if (filePath) {
            const isValid = await FileSystemService.isValidPath(filePath);
            if (!isValid) {
              addNotification?.('error', 'Invalid file path');
              return;
            }
            await FileSystemService.openFile(filePath);
            addNotification?.('success', `Opened ${result.title}`);
          } else {
            addNotification?.('error', 'File path not available');
          }
        } else if (result.source_type === 'gmail') {
          addNotification?.('info', `Email message: ${result.title}`);
        }
      } catch (error) {
        console.error('Failed to open file:', error);
        addNotification?.('error', `Failed to open ${result.title}`);
      }
    },
    [addNotification]
  );

  const handleCopySnippet = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      addNotification?.('success', 'Snippet copied to clipboard');
    },
    [addNotification]
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Search</h1>
        <p className="text-sm text-gray-500">
          Search across all your Gmail messages and indexed files
        </p>
      </div>

      <SearchBox onResults={handleResults} autoFocus={true} />

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Results ({results.length})
            </h2>
            <button
              onClick={() => setResults([])}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg
                hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer
                  hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5
                  transition-all duration-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">
                    {result.source_type === 'gmail' ? '📧' : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                      {result.title}
                    </h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                      {result.source_type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-3">
                  {result.snippet}
                </p>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>
                    {new Date(result.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: new Date(result.created_at).getFullYear() !== new Date().getFullYear()
                        ? 'numeric'
                        : undefined,
                    })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySnippet(result.snippet);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy snippet"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile(result);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Open"
                    >
                      🔗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results yet</h3>
          <p className="text-sm">Try searching for something to get started</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && selectedResult && (
        <ResultPreviewModal
          result={selectedResult}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedResult(null);
          }}
          onOpen={() => handleOpenFile(selectedResult)}
        />
      )}
    </div>
  );
};

interface ResultPreviewModalProps {
  result: SearchResult;
  onClose: () => void;
  onOpen: () => void;
}

const ResultPreviewModal: React.FC<ResultPreviewModalProps> = ({ result, onClose, onOpen }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{result.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
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
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Preview</h3>
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

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg
              hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onOpen}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-lg
              hover:bg-indigo-600 transition-colors"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
