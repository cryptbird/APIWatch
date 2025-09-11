import React, { useState, useCallback, useRef, useEffect } from 'react';

interface GraphSearchProps {
  onSearch: (query: string) => void;
  resultCount?: number;
  onNavigateFirst?: () => void;
}

/**
 * Search bar above graph: API name or path, debounce 300ms, Enter → navigate, Escape → clear (6.10).
 */
export function GraphSearch({ onSearch, resultCount = 0, onNavigateFirst }: GraphSearchProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && onNavigateFirst) onNavigateFirst();
      if (e.key === 'Escape') {
        setQuery('');
        onSearch('');
      }
    },
    [onNavigateFirst, onSearch]
  );

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search API name or path..."
        className="flex-1 max-w-md px-3 py-2 rounded bg-background border border-white/20 text-white placeholder-white/40 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      {resultCount > 0 && (
        <span className="text-white/60 text-sm font-mono">{resultCount} result(s)</span>
      )}
    </div>
  );
}
