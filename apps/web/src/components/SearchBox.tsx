'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBoxProps {
  placeholder?: string;
}

export default function SearchBox({
  placeholder = "Search events by title, description, location, or venue..."
}: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Debounced search with useCallback to avoid recreating on every render
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());

          if (value) {
            params.set('search', value);
          } else {
            params.delete('search');
          }

          // Reset to first page when search changes
          params.set('page', '1');

          router.push(`?${params.toString()}`);
        }, 500); // 500ms debounce delay
      };
    })(),
    [searchParams, router]
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
