'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface EventFiltersProps {
  availableTags: string[];
}

export default function EventFilters({ availableTags }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const customDateRef = useRef<HTMLDivElement>(null);

  const filter = searchParams.get('filter');
  const dateFilterParam = searchParams.get('dateFilter');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (customDateRef.current && !customDateRef.current.contains(event.target as Node)) {
        setShowCustomDate(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyDateFilter = (type: 'all' | 'today' | 'thisWeek' | 'custom') => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing date params
    params.delete('startDate');
    params.delete('endDate');
    params.delete('dateFilter');

    const now = new Date();

    switch (type) {
      case 'today':
        const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        params.set('startDate', todayStart);
        params.set('endDate', todayEnd);
        params.set('dateFilter', 'today');
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
        params.set('dateFilter', 'thisWeek');
        break;
      case 'custom':
        if (startDate) params.set('startDate', new Date(startDate).toISOString());
        if (endDate) params.set('endDate', new Date(endDate).toISOString());
        if (startDate || endDate) {
          params.set('dateFilter', 'custom');
        }
        setShowCustomDate(false);
        break;
    }

    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);

    const params = new URLSearchParams(searchParams.toString());
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);

    const params = new URLSearchParams();
    if (filter) {
      params.set('filter', filter);
    }
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = dateFilterParam || selectedTags.length > 0;

  return (
    <div className="mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* All/Upcoming/Past Tabs */}
        <Link
          href="/events"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !filter
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Events
        </Link>
        <Link
          href="/events?filter=upcoming"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Upcoming
        </Link>
        <Link
          href="/events?filter=past"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'past'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Past
        </Link>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Date Filter Buttons */}
        <button
          onClick={() => applyDateFilter('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dateFilterParam === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => applyDateFilter('thisWeek')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dateFilterParam === 'thisWeek'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          This Week
        </button>

        {/* Custom Date Dropdown */}
        <div className="relative" ref={customDateRef}>
          <button
            onClick={() => setShowCustomDate(!showCustomDate)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              dateFilterParam === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Custom Date
            <span className={`transform transition-transform ${showCustomDate ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showCustomDate && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-10 min-w-[250px]">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Select Date Range</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm mb-2 dark:bg-gray-700"
                placeholder="Start date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm mb-3 dark:bg-gray-700"
                placeholder="End date"
              />
              <button
                onClick={() => applyDateFilter('custom')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Tag Filter Dropdown */}
        {availableTags.length > 0 && (
          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedTags.length > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              <span className={`transform transition-transform ${showTagDropdown ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showTagDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                {availableTags.map(tag => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {dateFilterParam === 'today' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              Today
              <button onClick={() => applyDateFilter('all')} className="hover:text-blue-900 dark:hover:text-blue-200">✕</button>
            </span>
          )}
          {dateFilterParam === 'thisWeek' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              This Week
              <button onClick={() => applyDateFilter('all')} className="hover:text-blue-900 dark:hover:text-blue-200">✕</button>
            </span>
          )}
          {dateFilterParam === 'custom' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              {startDate || 'Start'} - {endDate || 'End'}
              <button onClick={() => applyDateFilter('all')} className="hover:text-blue-900 dark:hover:text-blue-200">✕</button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              {tag}
              <button onClick={() => toggleTag(tag)} className="hover:text-blue-900 dark:hover:text-blue-200">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
