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
          // Extract file path from result metadata or id
          const filePath = result.id || result.metadata?.file_path;
          if (filePath) {
            // Validate path before opening
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
          // Gmail messages can't be opened directly from file system
          // Instead, we show the preview modal
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="m-0 mb-2 text-3xl text-gray-900">Search</h1>
        <p className="m-0 text-sm text-gray-600">Search across all your Gmail messages and indexed files</p>
      </div>

      <SearchBox onResults={handleResults} autoFocus={true} />

      {results.length > 0 && (
        <div className="mt-7">
          <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-300">
            <h2 className="m-0 text-xl text-gray-900">Results ({results.length})</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer text-xs font-medium transition-all duration-150 hover:bg-gray-300 hover:text-blue-500" onClick={() => setResults([])} title="Clear results">
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 bg-white border border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {result.source_type === 'gmail' ? '📧' : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="m-0 mb-1 text-sm font-semibold text-gray-900 break-words">{result.title}</h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold bg-gray-100 px-1.5 py-0.5 rounded-sm inline-block">{result.source_type}</span>
                  </div>
                </div>

                <p className="my-3 text-xs text-gray-600 leading-relaxed line-clamp-3">{result.snippet}</p>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <span className="text-xs">
                    {new Date(result.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year:
                        new Date(result.created_at).getFullYear() !== new Date().getFullYear()
                          ? 'numeric'
                          : undefined,
                    })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      className="bg-none border-none cursor-pointer p-0.5 text-sm transition-all duration-150 rounded-sm hover:bg-gray-100 hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySnippet(result.snippet);
                      }}
                      title="Copy snippet"
                    >
                      📋
                    </button>
                    <button
                      className="bg-none border-none cursor-pointer p-0.5 text-sm transition-all duration-150 rounded-sm hover:bg-gray-100 hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile(result);
                      }}
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

      {results.length === 0 && (
        <div className="text-center p-15 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="m-0 mb-2 text-lg text-gray-900">No results yet</h3>
          <p className="m-0 text-sm">Try searching for something to get started</p>
        </div>
      )}

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-11/12 max-h-80vh overflow-y-auto shadow-2xl animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-300">
          <h2 className="m-0 text-xl text-gray-900">{result.title}</h2>
          <button className="bg-none border-none text-xl text-gray-500 cursor-pointer p-0 w-8 h-8 flex items-center justify-center transition-colors duration-150 hover:text-gray-900" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-gray-100 rounded-lg">
            <div className="metadata-item">
              <span className="text-xs text-gray-500 font-medium uppercase">Source:</span>
              <span className="text-xs text-gray-900 font-semibold break-words">
                {result.source_type === 'gmail' ? 'Email' : 'File'}
              </span>
            </div>
            <div className="metadata-item">
              <span className="text-xs text-gray-500 font-medium uppercase">Date:</span>
              <span className="text-xs text-gray-900 font-semibold break-words">{new Date(result.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900">Preview</h3>
            <p className="m-0 text-xs leading-relaxed text-gray-600">{result.snippet || 'No preview available'}</p>
          </div>

          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="mb-5">
              <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900">Details</h3>
              <div className="grid gap-2">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2 p-2 bg-gray-100 rounded-sm text-xs">
                    <span className="font-semibold text-gray-600 flex-shrink-0">{key}:</span>
                    <span className="text-gray-900 break-words flex-1">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-300 bg-gray-100">
          <button className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 flex-1" onClick={onClose}>
            Close
          </button>
          <button className="px-4 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 flex-1" onClick={onOpen}>
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
