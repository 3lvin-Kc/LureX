import React, { useState, useCallback, useEffect } from 'react';
import { useSearch } from '../hooks/useApi';
import { SearchResult } from '../types';


interface SearchBoxProps {
  onResults?: (results: SearchResult[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * SearchBox Component - Main search interface
 * Features:
 * - Debounced search input (300ms)
 * - Real-time result display
 * - Error handling with retry
 * - Loading states
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  onResults,
  placeholder = 'Search emails, files, documents...',
  autoFocus = true,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { results, loading, error, search, clearResults } = useSearch();

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
    } else {
      clearResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Notify parent of results
  useEffect(() => {
    if (onResults) {
      onResults(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const handleClear = useCallback(() => {
    setQuery('');
    clearResults();
  }, [clearResults]);

  return (
    <div className="w-full max-w-2xl mx-auto my-5">
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-xl bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          aria-label="Search"
        />

        {query && (
          <button
            className="absolute right-3 bg-none border-none cursor-pointer text-xl text-gray-500 p-0 w-7 h-7 flex items-center justify-center transition-colors duration-150 hover:text-gray-900"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            ✕
          </button>
        )}

        {loading && (
          <div className="absolute right-3 w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {error && <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500">Error: {error}</div>}

      {results.length > 0 && (
        <div className="mt-5">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Found {results.length} result{results.length === 1 ? '' : 's'}
          </div>
          <div className="grid gap-3 max-h-[600px] overflow-y-auto">
            {results.map((result) => (
              <SearchResultItem key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchResultItemProps {
  result: SearchResult;
}

/**
 * SearchResultItem - Single search result card
 */
const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const sourceLabel = result.source_type === 'gmail' ? '📧' : '📄';
  const date = new Date(result.created_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div className="p-3.5 bg-white border border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl flex-shrink-0">{sourceLabel}</span>
        <h3 className="m-0 text-sm font-semibold text-gray-900 flex-1 break-words">{result.title}</h3>
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold bg-gray-100 px-1.5 py-0.5 rounded-sm">{result.source_type}</span>
      </div>
      <p className="my-2 text-xs text-gray-600 leading-relaxed line-clamp-2">{result.snippet}</p>
      <div className="flex gap-2 text-xs text-gray-500 mt-2">
        <span className="flex-1">{formattedDate}</span>
      </div>
    </div>
  );
};

export default SearchBox;
