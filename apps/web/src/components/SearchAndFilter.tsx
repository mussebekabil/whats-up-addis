'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchAndFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  showTagFilter?: boolean;
  availableTags?: string[];
}

export interface FilterState {
  search: string;
  dateFilter: 'all' | 'today' | 'thisWeek' | 'custom';
  startDate?: string;
  endDate?: string;
  tags: string[];
}

export default function SearchAndFilter({
  onFilterChange,
  showTagFilter = true,
  availableTags = []
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [dateFilter, setDateFilter] = useState<FilterState['dateFilter']>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Apply search
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    // Apply date filters
    params.delete('startDate');
    params.delete('endDate');
    params.delete('endDateGte');

    const now = new Date();

    switch (dateFilter) {
      case 'today':
        const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        params.set('startDate', todayStart);
        params.set('endDate', todayEnd);
        break;
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        params.set('startDate', weekStart.toISOString());
        params.set('endDate', weekEnd.toISOString());
        break;
      case 'custom':
        if (startDate) params.set('startDate', new Date(startDate).toISOString());
        if (endDate) params.set('endDate', new Date(endDate).toISOString());
        break;
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }

    // Reset to first page when filters change
    params.set('page', '1');

    // Update URL
    router.push(`?${params.toString()}`);

    // Call callback if provided
    if (onFilterChange) {
      onFilterChange({
        search,
        dateFilter,
        startDate,
        endDate,
        tags: selectedTags
      });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);

    const params = new URLSearchParams();
    router.push(`?${params.toString()}`);

    if (onFilterChange) {
      onFilterChange({
        search: '',
        dateFilter: 'all',
        tags: []
      });
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const hasActiveFilters = search || dateFilter !== 'all' || selectedTags.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search events by title, description, location, or venue..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Filters:</span>

          {/* Date Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDateFilter('all');
                setShowDatePicker(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => {
                setDateFilter('today');
                setShowDatePicker(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                setDateFilter('thisWeek');
                setShowDatePicker(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === 'thisWeek'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => {
                setDateFilter('custom');
                setShowDatePicker(!showDatePicker);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Date
            </button>
          </div>

          {/* Tag Filter */}
          {showTagFilter && availableTags.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedTags.length > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                <span className={`transform transition-transform ${showTagDropdown ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showTagDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {availableTags.map(tag => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Custom Date Picker */}
        {showDatePicker && dateFilter === 'custom' && (
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {dateFilter === 'today' && 'Today'}
                {dateFilter === 'thisWeek' && 'This Week'}
                {dateFilter === 'custom' && `${startDate || 'Start'} - ${endDate || 'End'}`}
                <button onClick={() => setDateFilter('all')} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-blue-900">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
