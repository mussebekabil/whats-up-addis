import Link from 'next/link';
import type { Metadata } from 'next';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';
import EventCard from '@/components/EventCard';
import CategoryFilter from '@/components/CategoryFilter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateEventListSchema } from '@/lib/seo';
import RoundTextPrimary from '@/components/ui-nuggets/RoundTextPrimary';
import SearchBar from '@/components/SearchBar';
import type { Category } from '@whats-up-addis/shared';

interface EventsPageProps {
  searchParams: Promise<{
    page?: string;
    filter?: string;
    search?: string;
    category?: string;
  }>;
}

function buildEventsUrl(params: {
  page?: number;
  filter?: string;
  search?: string;
  category?: string;
}): string {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set('page', String(params.page));
  if (params.filter) query.set('filter', params.filter);
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  const queryString = query.toString();
  return queryString ? `/events?${queryString}` : '/events';
}

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filter = params.filter;

  const title =
    filter === 'upcoming'
      ? 'Upcoming Events in Addis Ababa'
      : filter === 'past'
        ? 'Past Events in Addis Ababa'
        : 'All Events in Addis Ababa';

  const description =
    filter === 'upcoming'
      ? 'Browse upcoming concerts, conferences, workshops, and entertainment events happening soon in Addis Ababa, Ethiopia.'
      : filter === 'past'
        ? 'Explore past events that took place in Addis Ababa, Ethiopia.'
        : 'Discover all events happening in Addis Ababa, Ethiopia. From concerts to conferences, workshops to cultural events.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://whatsupaddis.io/events${filter ? `?filter=${filter}` : ''}`,
    },
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const filter = params.filter;
  const search = params.search?.trim() || undefined;
  const categorySlug = params.category || undefined;

  let events: any[] = [];
  let pagination: any = null;
  let categories: Category[] = [];
  let error = null;

  try {
    const now = new Date().toISOString();
    const queryParams: any = { page: currentPage, limit: 12 };

    if (filter === 'upcoming') {
      queryParams.startDate = now;
    } else if (filter === 'past') {
      queryParams.endDateLt = now;
    }
    if (search) queryParams.search = search;

    categories = await categoryService.getCategories();

    if (categorySlug) {
      const match = categories.find((c) => c.slug === categorySlug);
      if (match) queryParams.categoryId = match.id;
    }

    const response = await eventService.getEvents(queryParams);
    events = response.data;
    pagination = response.pagination;
  } catch (err) {
    error =
      'Failed to load events. Please make sure the API server is running.';
    console.error('Error fetching events:', err);
  }

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

  const eventListSchema =
    events.length > 0 ? generateEventListSchema(events) : null;

  const tabs = [
    {
      label: 'All',
      href: buildEventsUrl({ search, category: categorySlug }),
      active: !filter,
    },
    {
      label: 'Upcoming',
      href: buildEventsUrl({ filter: 'upcoming', search, category: categorySlug }),
      active: filter === 'upcoming',
    },
    {
      label: 'Past',
      href: buildEventsUrl({ filter: 'past', search, category: categorySlug }),
      active: filter === 'past',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {eventListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema) }}
        />
      )}

      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Page header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <span className="font-mono text-xs uppercase tracking-widest text-ember">
              Discover
            </span>
            <h1 className="mt-2 font-display text-5xl md:text-6xl">
              {pageTitle}
            </h1>
            <p className="mt-3 text-muted-foreground">{pageDescription}</p>
            <div className="mt-6">
              <SearchBar
                defaultValue={search}
                filter={filter}
                buttonLabel="Search"
                extraParams={
                  categorySlug ? { category: categorySlug } : undefined
                }
              />
            </div>
            {search && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-foreground">
                  Results for &ldquo;{search}&rdquo;
                </span>
                <Link
                  href={buildEventsUrl({ filter, category: categorySlug })}
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline transition-colors hover:text-foreground"
                >
                  Clear search
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs + category dropdown */}
        <div className="border-b border-border">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2 overflow-x-auto px-6 py-5">
            {tabs.map(({ label, href, active }) => (
              <Link
                key={label}
                href={href}
                className={[
                  'shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all',
                  active
                    ? 'border bg-ember text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                currentSlug={categorySlug}
                mode="events-page"
                filter={filter}
                search={search}
              />
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12">
          {error && (
            <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2 items-center">
                  {currentPage > 1 && (
                    <Link
                      href={buildEventsUrl({
                        page: currentPage - 1,
                        filter,
                        search,
                        category: categorySlug,
                      })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border font-mono text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      ←
                    </Link>
                  )}

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, idx, arr) => {
                      const pageUrl = buildEventsUrl({
                        page,
                        filter,
                        search,
                        category: categorySlug,
                      });
                      const showEllipsisBefore =
                        idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <span key={page} className="flex items-center gap-2">
                          {showEllipsisBefore && (
                            <span className="font-mono text-xs text-muted-foreground">
                              …
                            </span>
                          )}
                          <Link
                            href={pageUrl}
                            className={[
                              'inline-flex h-9 w-9 items-center justify-center rounded-full border font-mono text-sm transition-all',
                              page === currentPage
                                ? 'border bg-ember text-foreground'
                                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                            ].join(' ')}
                          >
                            {page}
                          </Link>
                        </span>
                      );
                    })}

                  {currentPage < pagination.totalPages && (
                    <Link
                      href={buildEventsUrl({
                        page: currentPage + 1,
                        filter,
                        search,
                        category: categorySlug,
                      })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border font-mono text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            !error && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
                <p className="font-display text-2xl">Nothing here yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first — create an event and it&apos;ll appear once
                  approved.
                </p>
                <Link
                  href="/events/create"
                  className="mt-6 inline-flex h-10 items-center rounded-full bg-ember px-6 font-mono text-xs uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
                >
                  Create Event
                </Link>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
