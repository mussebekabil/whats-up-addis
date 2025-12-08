import Link from 'next/link';
import { eventService } from '@/lib/events';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function EventsPage() {
  let events: any[] = [];
  let pagination: any = null;
  let error = null;
  try {
    const response = await eventService.getEvents({ page: 1, limit: 12 });
    events = response.data;
    pagination = response.pagination;
  } catch (err) {
    error =
      'Failed to load events. Please make sure the API server is running.';
    console.error('Error fetching events:', err);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Events</h1>
          <p className="text-gray-600">
            Discover what&apos;s happening in Addis Ababa
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
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
                ).map((page) => (
                  <Link
                    key={page}
                    href={`/events?page=${page}`}
                    className={`px-4 py-2 rounded ${
                      page === pagination.page
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          !error && (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">
                No events found. Be the first to create one!
              </p>
              <Link
                href="/events/create"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
