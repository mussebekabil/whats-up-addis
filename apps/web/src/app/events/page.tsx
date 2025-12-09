import Link from 'next/link';
import { eventService } from '@/lib/events';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface EventsPageProps {
  searchParams: Promise<{ page?: string; filter?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const filter = params.filter; // 'upcoming', 'past', or undefined

  let events: any[] = [];
  let pagination: any = null;
  let error = null;

  try {
    const now = new Date().toISOString();
    const queryParams: any = { page: currentPage, limit: 12 };

    // Apply date filter based on the filter parameter
    if (filter === 'upcoming') {
      queryParams.endDateGte = now;
    } else if (filter === 'past') {
      queryParams.endDateLt = now;
    }

    const response = await eventService.getEvents(queryParams);
    events = response.data;
    pagination = response.pagination;
  } catch (err) {
    error =
      'Failed to load events. Please make sure the API server is running.';
    console.error('Error fetching events:', err);
  }

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{pageDescription}</p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
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
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {events.length > 0 ? (
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
                  const pageUrl = filter
                    ? `/events?page=${page}&filter=${filter}`
                    : `/events?page=${page}`;
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
                No events found. Be the first to create one!
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

      <Footer />
    </div>
  );
}
