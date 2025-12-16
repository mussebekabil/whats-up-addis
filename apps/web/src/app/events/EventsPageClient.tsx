'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EventCard from '@/components/EventCard';
import SearchBox from '@/components/SearchBox';
import EventFilters from '@/components/EventFilters';
import { eventService } from '@/lib/events';
import type { Event } from '@whats-up-addis/shared';

interface EventsPageClientProps {
  initialEvents: Event[];
  initialPagination: any;
  initialError: string | null;
  availableTags: string[];
}

export default function EventsPageClient({
  initialEvents,
  initialPagination,
  initialError,
  availableTags,
}: EventsPageClientProps) {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState(initialEvents);
  const [pagination, setPagination] = useState(initialPagination);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const filter = searchParams.get('filter');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date().toISOString();
        const queryParams: any = { page: currentPage, limit: 12 };

        // Apply search param
        const search = searchParams.get('search');
        if (search) queryParams.search = search;

        // Apply date filter based on the filter parameter
        if (filter === 'upcoming') {
          queryParams.endDateGte = now;
        } else if (filter === 'past') {
          queryParams.endDateLt = now;
        }

        // Apply date filters from search params
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate) queryParams.startDate = startDate;
        if (endDate) queryParams.endDate = endDate;

        // Apply tag filters
        const tags = searchParams.get('tags');
        if (tags) {
          queryParams.tags = tags.split(',');
        }

        const response = await eventService.getEvents(queryParams);
        setEvents(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError('Failed to load events. Please make sure the API server is running.');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchParams, currentPage, filter]);

  // Determine page title based on filter
  const pageTitle =
    filter === 'upcoming'
      ? 'Upcoming Events'
      : filter === 'past'
        ? 'Past Events'
        : 'All Events';

  const pageDescription =
    filter === 'upcoming'
      ? 'Events happening soon in Addis Ababa'
      : filter === 'past'
        ? 'Past events in Addis Ababa'
        : "Discover what's happening in Addis Ababa";

  return (
    <main className="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{pageDescription}</p>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <SearchBox />
      </div>

      {/* Integrated Filters (All/Upcoming/Past + Date + Tags) */}
      <EventFilters availableTags={availableTags} />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(page));
                const pageUrl = `/events?${params.toString()}`;

                return (
                  <Link
                    key={page}
                    href={pageUrl}
                    className={`px-4 py-2 rounded transition-colors ${
                      page === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        !error && (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No events found. Try adjusting your filters or be the first to create one!
            </p>
            <Link
              href="/events/create"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Event
            </Link>
          </div>
        )
      )}
    </main>
  );
}
