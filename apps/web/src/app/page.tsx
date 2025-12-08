import Link from 'next/link';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';
import EventCard from '@/components/EventCard';
import CategoryCard from '@/components/CategoryCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function Home() {
  let events: any[] = [];
  let categories: any[] = [];
  let error = null;

  try {
    const [eventsResponse, categoriesResponse] = await Promise.all([
      eventService.getEvents({ page: 1, limit: 6 }),
      categoryService.getCategories(),
    ]);
    events = eventsResponse.data;
    categories = categoriesResponse;
  } catch (err) {
    error = 'Failed to load data. Please make sure the API server is running.';
    console.error('Error fetching data:', err);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Upcoming Events</h2>
              <Link
                href="/events"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {categories.length > 0 ? (
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
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
            <section className="bg-gray-50 py-16">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-600">
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
