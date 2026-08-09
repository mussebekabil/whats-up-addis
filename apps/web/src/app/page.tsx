import Link from 'next/link';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';
import { placeService } from '@/lib/places';
import EventCard from '@/components/EventCard';
import CategoryCard from '@/components/CategoryCard';
import PlaceCard from '@/components/PlaceCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import SearchBar from '@/components/SearchBar';
import type { Place } from '@whats-up-addis/shared';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateEventListSchema,
} from '@/lib/seo';

import type { Metadata } from 'next';
import RoundTextPrimary from '@/components/ui-nuggets/RoundTextPrimary';
import TypewriterText from '@/components/TypewriterText';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover concerts, conferences, workshops, cultural events and entertainment happening in Addis Ababa, Ethiopia.',
  openGraph: {
    title: "What's Up Addis - Events in Addis Ababa, Ethiopia",
    description:
      'Your ultimate guide to concerts, conferences, workshops and entertainment in Addis Ababa.',
    url: 'https://whatsupaddis.io',
  },
};

export default async function Home() {
  let allUpcomingEvents: any[] = [];
  let upcomingEvents: any[] = [];
  let featuredEvents: any[] = [];
  let categories: any[] = [];
  let featuredPlaces: Place[] = [];
  let error = null;

  try {
    const now = new Date().toISOString();

    const [
      upcomingResponse,
      allUpcomingEventsResponse,
      categoriesResponse,
      featuredPlacesResponse,
    ] = await Promise.all([
      eventService.getEvents({ page: 1, limit: 6, startDate: now }),
      eventService.getEvents({ page: 1, limit: 50, startDate: now }),
      categoryService.getCategories(),
      placeService.getPlaces({ featured: true, limit: 6 }),
    ]);

    upcomingEvents = upcomingResponse.data;
    allUpcomingEvents = allUpcomingEventsResponse.data;
    const upcomingEventIds = new Set(upcomingEvents.map((e) => e.id));
    const eventsWithVideo = allUpcomingEvents.filter(
      (e) => e.videoUrl && e.videoUrl.trim() !== ''
    );

    if (eventsWithVideo.length >= 3) {
      featuredEvents = eventsWithVideo.slice(0, 3);
    } else {
      featuredEvents = [...eventsWithVideo];
      const remainingSlots = 3 - eventsWithVideo.length;
      if (remainingSlots > 0) {
        featuredEvents = [
          ...featuredEvents,
          ...allUpcomingEvents
            .filter((e) => !upcomingEventIds.has(e.id))
            .filter((e) => !eventsWithVideo.some((f) => f.id === e.id))
            .slice(0, remainingSlots),
        ];
      }
    }

    categories = categoriesResponse;
    featuredPlaces = featuredPlacesResponse.data.slice(0, 6);
  } catch (err) {
    error = 'Failed to load data. Please make sure the API server is running.';
    console.error('Error fetching data:', err);
  }

  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const allEvents = [...upcomingEvents, ...featuredEvents];
  const eventListSchema =
    allEvents.length > 0 ? generateEventListSchema(allEvents) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      {eventListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema) }}
        />
      )}

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src="/hero-addis.jpg"
            alt="Addis Ababa skyline at golden hour"
            className="h-full w-full object-cover opacity-60 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-28 pt-20 md:pb-36 md:pt-28">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live · {Math.ceil(allUpcomingEvents.length / 10) * 10}+ upcoming
              event{allUpcomingEvents.length === 1 ? '' : 's'}
            </span>
          </div>

          <TypewriterText
            tag="h1"
            immediate
            startDelay={300}
            speed={100}
            className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
            segments={[
              { text: 'Everything ' },
              { text: 'happening', em: true },
              { text: '\nin Addis!' },
            ]}
          />

          <p className="max-w-xl text-lg text-muted-foreground">
            A handpicked agenda of music, food, art and community across the
            city. No noise — just what&apos;s actually worth showing up to.
          </p>

          <SearchBar />
        </div>
      </section>

      <main className="pb-20 md:pb-0">
        {error && (
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-ember">
                  What&apos;s next
                </span>
                <h2 className="mt-2 font-display text-4xl md:text-5xl">
                  Upcoming Events
                </h2>
              </div>
              <Link
                href="/events?filter=upcoming"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, i) => (
                <FadeIn key={event.id} delay={i * 80}>
                  <EventCard event={event} />
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="border-y border-border bg-muted/40 py-16">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-ember">
                    Editor&apos;s pick
                  </span>
                  <h2 className="mt-2 font-display text-4xl md:text-5xl">
                    Featured Events
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredEvents.map((event, i) => (
                  <FadeIn key={event.id} delay={i * 80}>
                    <EventCard event={event} />
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Explore Places */}
        {featuredPlaces.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-ember">
                  Explore
                </span>
                <h2 className="mt-1 font-display text-3xl">Places to Visit</h2>
              </div>
              <Link
                href="/places"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                All Places →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 ? (
          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-ember">
                  By interest
                </span>
                <h2 className="mt-2 font-display text-4xl md:text-5xl">
                  Browse by Category
                </h2>
              </div>
              <Link
                href="/categories"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category, i) => (
                <FadeIn key={category.id} delay={i * 70}>
                  <CategoryCard category={category} />
                </FadeIn>
              ))}
            </div>
          </section>
        ) : (
          !error && (
            <section className="mx-auto max-w-7xl px-6 py-16">
              <p className="text-center text-muted-foreground">
                No categories available yet. Check back soon!
              </p>
            </section>
          )
        )}

        {/* Categories Marquee */}
        {categories.length > 0 && (
          <div className="border-t border-ember bg-void py-3">
            <div className="mx-auto max-w-7xl overflow-hidden px-6">
              <div
                className="flex gap-10 whitespace-nowrap"
                style={{ animation: 'marquee 10s linear infinite' }}
              >
                {[...categories, ...categories].map((cat, i) => (
                  <span
                    key={`${cat.id}-${i}`}
                    className="shrink-0 font-mono text-sm text-ember"
                  >
                    • {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Organizer CTA */}
        <section className="bg-ember text-void">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <FadeIn>
                <span className="font-mono text-xs uppercase tracking-widest text-primary-foreground">
                  For organizers
                </span>
                <h2 className="mt-4 whitespace-pre-line font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
                  {'List your event.\nSell it out.'}
                </h2>
                <p className="mt-6 max-w-md text-lg text-void/80">
                  From small gatherings to sold-out shows — publish in minutes
                  and reach everyone who&apos;s looking for something to do in
                  Addis.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/events/create"
                    className="inline-flex h-11 items-center rounded-full bg-void px-6 font-mono text-xs uppercase tracking-widest text-bone transition-transform hover:-translate-y-0.5"
                  >
                    Create an event
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex h-11 items-center rounded-full border border-void/30 bg-bone/10 px-6 font-mono text-xs uppercase tracking-widest text-void transition-colors hover:border-void"
                  >
                    Sign up free
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex h-11 items-center rounded-full border border-void/30 bg-bone/10 px-6 font-mono text-xs uppercase tracking-widest text-void transition-colors hover:border-void"
                  >
                    Contact us
                  </Link>
                </div>
              </FadeIn>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: categories.length || '8', label: 'Categories' },
                  { value: '0', label: 'ETB to list' },
                  { value: '24h', label: 'Approval' },
                  { value: '∞', label: 'Good vibes' },
                ].map(({ value, label }, i) => (
                  <FadeIn key={label} delay={i * 80}>
                    <div className="rounded-2xl border border-void/10 bg-bone/10 p-6 backdrop-blur-sm">
                      <span className="font-display text-4xl">{value}</span>
                      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-void/60">
                        {label}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
