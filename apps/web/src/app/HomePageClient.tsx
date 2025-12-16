'use client';

import Link from 'next/link';
import SearchBox from '@/components/SearchBox';

export default function HomePageClient() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4">
          Discover Events in Addis Ababa
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find concerts, conferences, workshops, and more happening in your city
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-3xl mx-auto mb-8">
        <SearchBox />
      </div>

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
  );
}
