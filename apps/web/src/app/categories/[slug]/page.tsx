import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { categoryService } from '@/lib/categories';
import { eventService } from '@/lib/events';
import { placeService } from '@/lib/places';
import EventCard from '@/components/EventCard';
import PlaceCard from '@/components/PlaceCard';
import CategoryFilter from '@/components/CategoryFilter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoundTextPrimary from '@/components/ui-nuggets/RoundTextPrimary';
import SearchBar from '@/components/SearchBar';
import type { Category, Place } from '@whats-up-addis/shared';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    filter?: string;
    search?: string;
    tab?: string;
  }>;
}

function buildCategoryUrl(
  slug: string,
  params: { page?: number; filter?: string; search?: string; tab?: string }
): string {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set('page', String(params.page));
  if (params.filter) query.set('filter', params.filter);
  if (params.search) query.set('search', params.search);
  if (params.tab) query.set('tab', params.tab);
  const qs = query.toString();
  return qs ? `/categories/${slug}?${qs}` : `/categories/${slug}`;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await categoryService.getCategoryBySlug(slug);
    return {
      title: `${category.name} Events in Addis Ababa`,
      description:
        category.description ??
        `Browse upcoming ${category.name} events in Addis Ababa, Ethiopia.`,
    };
  } catch {
    return { title: 'Category Not Found' };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || '1', 10);
  // 'upcoming' is the default; 'all' explicitly disables date filtering
  const filter = sp.filter ?? 'upcoming';
  const search = sp.search?.trim() || undefined;
  const tab = sp.tab;
  const activeTab = tab === 'places' ? 'places' : 'events';

  let category: Category | null = null;
  let events: any[] = [];
  let places: Place[] = [];
  let pagination: any = null;
  let allCategories: Category[] = [];

  try {
    const now = new Date().toISOString();
    const queryParams: any = { page: currentPage, limit: 12 };

    if (filter === 'upcoming') {
      queryParams.startDate = now;
    } else if (filter === 'past') {
      queryParams.endDateLt = now;
    }
    // filter === 'all': no date filtering — shows every event in this category
    if (search) queryParams.search = search;

    const [categoryData, categoriesData] = await Promise.all([
      categoryService.getCategoryBySlug(slug),
      categoryService.getCategories(),
    ]);

    category = categoryData;
    allCategories = categoriesData;
    queryParams.categoryId = category.id;

    const response = await eventService.getEvents(queryParams);
    events = response.data;
    pagination = response.pagination;

    if (activeTab === 'places' && category.applies !== 'EVENT') {
      const placesResponse = await placeService.getPlaces({
        categoryId: category.id,
      });
      places = placesResponse.data;
    }
  } catch (err) {
    console.error('Error fetching category data:', err);
    notFound();
  }

  if (!category) notFound();

  const tabs = [
    {
      label: 'All',
      href: buildCategoryUrl(slug, { filter: 'all', search }),
      active: filter === 'all',
    },
    {
      label: 'Upcoming',
      href: buildCategoryUrl(slug, { filter: 'upcoming', search }),
      active: filter === 'upcoming',
    },
    {
      label: 'Past',
      href: buildCategoryUrl(slug, { filter: 'past', search }),
      active: filter === 'past',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Page header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <Link
              href="/categories"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Categories
            </Link>
            <div className="mt-4">
              <RoundTextPrimary>{category.name}</RoundTextPrimary>
            </div>
            <h1 className="mt-2 font-display text-5xl md:text-6xl">
              {category.name} Events
            </h1>
            {category.description && (
              <p className="mt-3 text-muted-foreground">
                {category.description}
              </p>
            )}
            <div className="mt-6">
              <SearchBar
                defaultValue={search}
                filter={filter}
                buttonLabel="Search"
                action={`/categories/${slug}`}
              />
            </div>
            {search && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-foreground">
                  Results for &ldquo;{search}&rdquo;
                </span>
                <Link
                  href={buildCategoryUrl(slug, { filter })}
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline transition-colors hover:text-foreground"
                >
                  Clear search
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs + category switcher — only shown on events tab */}
        {(category.applies === 'EVENT' || activeTab === 'events') && (
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
              {allCategories.length > 0 && (
                <CategoryFilter
                  categories={allCategories}
                  currentSlug={slug}
                  mode="category-page"
                  filter={filter}
                  search={search}
                />
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Events / Places tab switcher — only for PLACE or BOTH categories */}
          {(category.applies === 'PLACE' || category.applies === 'BOTH') && (
            <div className="mb-8 flex gap-4 border-b border-border">
              <Link
                href={buildCategoryUrl(slug, { tab: 'events' })}
                className={`pb-2 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
                  activeTab === 'events'
                    ? 'border-ember text-ember'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Events
              </Link>
              <Link
                href={buildCategoryUrl(slug, { tab: 'places' })}
                className={`pb-2 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
                  activeTab === 'places'
                    ? 'border-ember text-ember'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Places
              </Link>
            </div>
          )}

          {/* Events tab content */}
          {activeTab === 'events' && (
            <>
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
                          href={buildCategoryUrl(slug, {
                            page: currentPage - 1,
                            filter,
                            search,
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
                          (p) =>
                            p === 1 ||
                            p === pagination.totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1)
                        )
                        .map((p, idx, arr) => {
                          const pageUrl = buildCategoryUrl(slug, {
                            page: p,
                            filter,
                            search,
                          });
                          const showEllipsisBefore =
                            idx > 0 && p - arr[idx - 1] > 1;
                          return (
                            <span key={p} className="flex items-center gap-2">
                              {showEllipsisBefore && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  …
                                </span>
                              )}
                              <Link
                                href={pageUrl}
                                className={[
                                  'inline-flex h-9 w-9 items-center justify-center rounded-full border font-mono text-sm transition-all',
                                  p === currentPage
                                    ? 'border bg-ember text-foreground'
                                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                                ].join(' ')}
                              >
                                {p}
                              </Link>
                            </span>
                          );
                        })}

                      {currentPage < pagination.totalPages && (
                        <Link
                          href={buildCategoryUrl(slug, {
                            page: currentPage + 1,
                            filter,
                            search,
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
                <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
                  <p className="font-display text-2xl">Nothing here yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No{' '}
                    {filter === 'upcoming'
                      ? 'upcoming '
                      : filter === 'past'
                        ? 'past '
                        : ''}
                    events in this category
                    {filter === 'all' ? ' yet' : ''}.
                  </p>
                  <Link
                    href="/events"
                    className="mt-6 inline-flex h-10 items-center rounded-full bg-ember px-6 font-mono text-xs uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
                  >
                    Browse All Events
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Places tab content */}
          {activeTab === 'places' && (
            <>
              {places.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
                  <p className="font-display text-2xl">Nothing here yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No places in this category yet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
