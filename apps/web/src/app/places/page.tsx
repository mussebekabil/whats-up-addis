import Link from 'next/link';
import type { Metadata } from 'next';
import { placeService } from '@/lib/places';
import { categoryService } from '@/lib/categories';
import PlaceCard from '@/components/PlaceCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import type {
  Category,
  Place,
  PaginatedResponse,
  PlaceFiltersInput,
} from '@whats-up-addis/shared';

interface PlacesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

function buildPlacesUrl(params: {
  page?: number;
  search?: string;
  category?: string;
}): string {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  const queryString = query.toString();
  return queryString ? `/places?${queryString}` : '/places';
}

export const metadata: Metadata = {
  title: 'Places in Addis Ababa',
  description:
    'Discover restaurants, cafes, entertainment venues, and other places in Addis Ababa, Ethiopia.',
  openGraph: {
    title: 'Places in Addis Ababa',
    description:
      'Discover restaurants, cafes, entertainment venues, and other places in Addis Ababa, Ethiopia.',
    url: 'https://whatsupaddis.io/places',
  },
};

export default async function PlacesPage({ searchParams }: PlacesPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const search = params.search?.trim() || undefined;
  const categorySlug = params.category || undefined;

  let places: Place[] = [];
  let pagination: PaginatedResponse<Place>['pagination'] | null = null;
  let categories: Category[] = [];
  let error = null;

  try {
    const queryParams: PlaceFiltersInput = {
      page: currentPage,
      limit: 12,
    };

    if (search) queryParams.search = search;

    const allCategories = await categoryService.getCategories();
    // Only show categories that apply to places
    categories = allCategories.filter(
      (c) => c.applies === 'PLACE' || c.applies === 'BOTH' || !c.applies
    );

    if (categorySlug) {
      const match = allCategories.find((c) => c.slug === categorySlug);
      if (match) queryParams.categoryId = match.id;
    }

    const response = await placeService.getPlaces(queryParams);
    places = response.data;
    pagination = response.pagination;
  } catch (err) {
    error =
      'Failed to load places. Please make sure the API server is running.';
    console.error('Error fetching places:', err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Page header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <span className="font-mono text-xs uppercase tracking-widest text-ember">
              Explore
            </span>
            <h1 className="mt-2 font-display text-5xl md:text-6xl">Places</h1>
            <p className="mt-3 text-muted-foreground">
              Discover venues, restaurants, and spots in Addis Ababa
            </p>
            <div className="mt-6">
              <SearchBar
                defaultValue={search}
                action="/places"
                placeholder="Search places…"
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
                  href={buildPlacesUrl({ category: categorySlug })}
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline transition-colors hover:text-foreground"
                >
                  Clear search
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="border-b border-border">
            <div className="mx-auto flex max-w-7xl flex-wrap gap-2 overflow-x-auto px-6 py-5">
              <Link
                href={buildPlacesUrl({ search })}
                className={[
                  'shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all',
                  !categorySlug
                    ? 'border bg-ember text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                ].join(' ')}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildPlacesUrl({ search, category: cat.slug })}
                  className={[
                    'shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all',
                    categorySlug === cat.slug
                      ? 'border bg-ember text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                  ].join(' ')}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-6 py-12">
          {error && (
            <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {places.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2 items-center">
                  {currentPage > 1 && (
                    <Link
                      href={buildPlacesUrl({
                        page: currentPage - 1,
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
                      const pageUrl = buildPlacesUrl({
                        page,
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
                      href={buildPlacesUrl({
                        page: currentPage + 1,
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
                <p className="font-display text-2xl">No places yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check back soon for exciting places in Addis Ababa.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
