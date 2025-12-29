import Link from 'next/link';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';
import EventCard from '@/components/EventCard';
import CategoryCard from '@/components/CategoryCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Make the page dynamic to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let upcomingEvents: any[] = [];
  let featuredEvents: any[] = [];
  let categories: any[] = [];
  let error = null;

  try {
    const now = new Date().toISOString();

    const [upcomingResponse, allEventsResponse, categoriesResponse] =
      await Promise.all([
        eventService.getEvents({ page: 1, limit: 6, endDateGte: now }),
        eventService.getEvents({ page: 1, limit: 50 }),
        categoryService.getCategories(),
      ]);

    upcomingEvents = upcomingResponse.data;
    // Filter events to only show those with video content, limit to 3
    featuredEvents = allEventsResponse.data
      .filter((event) => event.videoUrl && event.videoUrl.trim() !== '')
      .slice(0, 3);
    categories = categoriesResponse;
  } catch (err) {
    error = 'Failed to load data. Please make sure the API server is running.';
    console.error('Error fetching data:', err);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Discover Events in Addis Ababa
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find concerts, conferences, workshops, and more happening in your
            city
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/events"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-lg transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/events/create"
              className="px-8 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-lg transition-colors"
            >
              Create Event
            </Link>
          </div>
        </section>

        {error && (
          <div className="container mx-auto px-4 mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <section className="bg-white dark:bg-gray-950 py-12">
            <div className="container mx-auto px-4">
              <div className="relative mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-left">
                  Upcoming Events
                </h2>
                <Link
                  href="/events?filter=upcoming"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {featuredEvents.length > 0 && (
          <section className="bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 py-12">
            <div className="container mx-auto px-4">
              <div className="relative mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-left">
                  Featured Events
                </h2>
                <Link
                  href="/events"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {categories.length > 0 ? (
          <section className="bg-primary-50 dark:bg-gray-900/50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          !error && (
            <section className="bg-primary-50 dark:bg-gray-900/50 py-16">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No categories available yet. Check back soon!
                </p>
              </div>
            </section>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
