import React, { useState, useCallback, useEffect } from 'react';
import { useSearch } from '../hooks/useApi';
import { SearchResult } from '../types';

interface SearchBoxProps {
  onResults?: (results: SearchResult[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onResults,
  placeholder = 'Search emails, files, documents...',
  autoFocus = true,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { results, loading, error, search, clearResults } = useSearch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (onResults) {
      onResults(results);
    }
  }, [results]);

  const handleClear = useCallback(() => {
    setQuery('');
    clearResults();
  }, [clearResults]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Search"
          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-white text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
            transition-all duration-200"
        />

        {/* Clear Button */}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center
              text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500">
          Error: {error}
        </div>
      )}

      {/* Results Count & List */}
      {results.length > 0 && (
        <div className="mt-5">
          <div className="text-sm text-gray-500 mb-3 font-medium">
            Found {results.length} result{results.length === 1 ? '' : 's'}
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
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

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const date = new Date(result.created_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer
      hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5
      transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl flex-shrink-0">
          {result.source_type === 'gmail' ? '📧' : '📄'}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 flex-1 truncate">
          {result.title}
        </h3>
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium bg-gray-100 px-1.5 py-0.5 rounded">
          {result.source_type}
        </span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
        {result.snippet}
      </p>
      <div className="text-xs text-gray-400">
        {formattedDate}
      </div>
    </div>
  );
};

export default SearchBox;
