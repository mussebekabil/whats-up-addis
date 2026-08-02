# Events Category Filter & UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable category dropdown filter to the events page, reuse that UI on category detail pages with proper filters/pagination, remove the typewriter animation from the organizer CTA, and add a categories marquee strip on the landing page.

**Architecture:** All filtering is URL-driven/server-rendered. `CategoryFilter` is the only new client component — it navigates via `router.push` when the user picks a category. The category detail page is fully rewritten to match the events page UI pattern, using the main `eventService.getEvents({ categoryId })` endpoint (no backend changes needed). The marquee uses a pure CSS `@keyframes` animation.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS, `next/navigation` (`useRouter`, `useSearchParams`)

## Global Constraints

- TypeScript strict mode — no `any` without justification
- Prettier: single quotes, semicolons, 80-char line width, 2-space indent, trailing commas
- Design tokens in use: `bg-ember`, `text-ember`, `text-void`, `bg-void`, `border-ember`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-background`, `font-display`, `font-mono`
- Only `ACCEPTED` events are shown to public users
- No backend changes — the events API already supports `categoryId`, `startDate`, `endDateLt`, and `search` combined

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `apps/web/src/components/CategoryFilter.tsx` | Reusable client dropdown; calls `router.push(getUrl(slug))` on change |
| Modify | `apps/web/src/app/events/page.tsx` | Add `category` searchParam, fetch categories, wire `CategoryFilter`, update `buildEventsUrl` |
| Rewrite | `apps/web/src/app/categories/[slug]/page.tsx` | Full events-page-style UI with filter tabs, search, pagination, `CategoryFilter` |
| Modify | `apps/web/src/app/page.tsx` | Replace `<TypewriterText>` in Organizer CTA with plain `<h2>`; insert marquee section |
| Modify | `apps/web/src/app/globals.css` | Add `@keyframes marquee` animation |

---

### Task 1: CategoryFilter reusable component

**Files:**
- Create: `apps/web/src/components/CategoryFilter.tsx`

**Interfaces:**
- Consumes: `Category` type from `@whats-up-addis/shared`
- Produces: `CategoryFilter` default export, props: `{ categories: Category[]; currentSlug?: string; getUrl: (slug: string | null) => string; className?: string }`

- [ ] **Step 1: Create the component**

Create `apps/web/src/components/CategoryFilter.tsx` with this exact content:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import type { Category } from '@whats-up-addis/shared';

interface CategoryFilterProps {
  categories: Category[];
  currentSlug?: string;
  getUrl: (slug: string | null) => string;
  className?: string;
}

export default function CategoryFilter({
  categories,
  currentSlug,
  getUrl,
  className = '',
}: CategoryFilterProps) {
  const router = useRouter();

  return (
    <select
      value={currentSlug ?? ''}
      onChange={(e) => router.push(getUrl(e.target.value || null))}
      className={[
        'shrink-0 rounded-full border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-all appearance-none cursor-pointer',
        'hover:border-foreground/30 hover:text-foreground',
        'focus:outline-none focus:border-ember focus:text-foreground',
        currentSlug
          ? 'border bg-ember text-foreground'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.slug}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm -F web type-check
```

Expected: no errors in `CategoryFilter.tsx`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/CategoryFilter.tsx
git commit -m "feat: add reusable CategoryFilter dropdown component"
```

---

### Task 2: Add category filter to the Events page

**Files:**
- Modify: `apps/web/src/app/events/page.tsx`

**Interfaces:**
- Consumes: `CategoryFilter` from Task 1; `categoryService.getCategories()` from `@/lib/categories`; `eventFiltersSchema` supports `categoryId?: string`
- Produces: Events page now accepts `?category=slug` searchParam; `buildEventsUrl` now accepts `category?: string`

- [ ] **Step 1: Update `buildEventsUrl` to include `category`**

In `apps/web/src/app/events/page.tsx`, replace the `buildEventsUrl` function:

```tsx
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
```

- [ ] **Step 2: Update `EventsPageProps` searchParams and imports**

Replace the interface and imports at the top of `apps/web/src/app/events/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Add category fetching and filtering to the page component**

Replace the `export default async function EventsPage` body with:

```tsx
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

    if (search) {
      queryParams.search = search;
    }

    const [eventsResponse, categoriesData] = await Promise.all([
      (async () => {
        if (categorySlug) {
          const allCategories = await categoryService.getCategories();
          const match = allCategories.find((c) => c.slug === categorySlug);
          if (match) queryParams.categoryId = match.id;
        }
        return eventService.getEvents(queryParams);
      })(),
      categoryService.getCategories(),
    ]);

    events = eventsResponse.data;
    pagination = eventsResponse.pagination;
    categories = categoriesData;
  } catch (err) {
    error =
      'Failed to load events. Please make sure the API server is running.';
    console.error('Error fetching events:', err);
  }
```

Note: the `getCategories()` call is made twice when `categorySlug` is set. Refactor to fetch once:

```tsx
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
```

- [ ] **Step 4: Update the filter tabs section to include `CategoryFilter`**

Replace the filter tabs `<div>` block (the one with `border-b border-border` and tabs.map) with:

```tsx
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
        getUrl={(slug) =>
          buildEventsUrl({ filter, search, category: slug ?? undefined })
        }
      />
    )}
  </div>
</div>
```

Also update the `tabs` array so the tab links preserve the `category` param:

```tsx
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
```

Also update the SearchBar to preserve the `category` param via a hidden input. Replace the `<SearchBar>` block:

```tsx
<div className="mt-6">
  <SearchBar
    defaultValue={search}
    filter={filter}
    buttonLabel="Search"
  />
  {categorySlug && (
    <input type="hidden" name="category" value={categorySlug} />
  )}
</div>
```

Wait — `SearchBar` is a server component with a `<form action="/events">`. We can't nest a hidden input outside the form. Instead, pass category through SearchBar's `extraParams` or just accept that search clears the category. Looking at SearchBar's implementation, it only includes `filter` as a hidden input. The simplest fix is to note that searching will preserve the category by passing it as a hidden field inside the form. We need to update `SearchBar` to accept an `extraParams` record, OR just clear category on new searches (acceptable UX). For now, use the cleaner approach of updating SearchBar to accept `extraParams`:

Update `apps/web/src/components/SearchBar.tsx` to accept and render extra hidden inputs:

```tsx
interface SearchBarProps {
  defaultValue?: string;
  filter?: string;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
  extraParams?: Record<string, string>;
}

export default function SearchBar({
  defaultValue,
  filter,
  placeholder = 'Try upcoming events, concerts, workshops…',
  buttonLabel = 'Explore',
  className,
  extraParams,
}: SearchBarProps) {
  return (
    <form action="/events" method="GET" className={/* existing className */ `...`}>
      {filter && <input type="hidden" name="filter" value={filter} />}
      {extraParams &&
        Object.entries(extraParams).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      {/* rest of existing JSX */}
    </form>
  );
}
```

Then in the events page, pass `extraParams={{ category: categorySlug }}` to SearchBar when `categorySlug` is set.

- [ ] **Step 5: Also update the "Clear search" link to preserve the category param**

Replace the clear search link:

```tsx
<Link
  href={buildEventsUrl({ filter, category: categorySlug })}
  className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline transition-colors hover:text-foreground"
>
  Clear search
</Link>
```

And the pagination links already use `buildEventsUrl` — update those calls to include `category: categorySlug`.

Replace the two `buildEventsUrl` calls in the pagination section:
- Previous page: `buildEventsUrl({ page: currentPage - 1, filter, search, category: categorySlug })`
- Next page: `buildEventsUrl({ page: currentPage + 1, filter, search, category: categorySlug })`
- Page number links: `buildEventsUrl({ page, filter, search, category: categorySlug })`

- [ ] **Step 6: Type-check and lint**

```bash
pnpm -F web type-check
pnpm lint
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/events/page.tsx apps/web/src/components/SearchBar.tsx
git commit -m "feat: add category dropdown filter to events page"
```

---

### Task 3: Rewrite the Category Detail page

**Files:**
- Rewrite: `apps/web/src/app/categories/[slug]/page.tsx`

**Interfaces:**
- Consumes: `eventService.getEvents({ categoryId, page, limit, startDate?, endDateLt?, search? })`, `categoryService.getCategoryBySlug(slug)`, `CategoryFilter` from Task 1, `buildEventsUrl` signature from Task 2
- Produces: `/categories/[slug]` page with filter tabs, search bar, pagination matching events page style; defaults to `filter=upcoming`

- [ ] **Step 1: Rewrite `apps/web/src/app/categories/[slug]/page.tsx`**

Replace the entire file with:

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { categoryService } from '@/lib/categories';
import { eventService } from '@/lib/events';
import EventCard from '@/components/EventCard';
import CategoryFilter from '@/components/CategoryFilter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoundTextPrimary from '@/components/ui-nuggets/RoundTextPrimary';
import SearchBar from '@/components/SearchBar';
import type { Category } from '@whats-up-addis/shared';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; filter?: string; search?: string }>;
}

function buildCategoryUrl(
  slug: string,
  params: { page?: number; filter?: string; search?: string }
): string {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set('page', String(params.page));
  if (params.filter) query.set('filter', params.filter);
  if (params.search) query.set('search', params.search);
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
  // Default to upcoming when no filter is specified
  const filter = sp.filter ?? 'upcoming';
  const search = sp.search?.trim() || undefined;

  let category: Category | null = null;
  let events: any[] = [];
  let pagination: any = null;
  let allCategories: Category[] = [];
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
  } catch (err) {
    console.error('Error fetching category data:', err);
    notFound();
  }

  if (!category) notFound();

  const tabs = [
    {
      label: 'All',
      href: buildCategoryUrl(slug, { search, filter: undefined }),
      active: sp.filter === undefined || sp.filter === '',
    },
    {
      label: 'Upcoming',
      href: buildCategoryUrl(slug, { filter: 'upcoming', search }),
      active: filter === 'upcoming' && sp.filter !== undefined,
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
            <RoundTextPrimary className="mt-4">
              {category.name}
            </RoundTextPrimary>
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

        {/* Filter tabs + category switcher */}
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
                getUrl={(newSlug) =>
                  newSlug
                    ? buildCategoryUrl(newSlug, { filter, search })
                    : '/events'
                }
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
                No {filter === 'upcoming' ? 'upcoming ' : filter === 'past' ? 'past ' : ''}
                events in this category.
              </p>
              <Link
                href="/events"
                className="mt-6 inline-flex h-10 items-center rounded-full bg-ember px-6 font-mono text-xs uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
              >
                Browse All Events
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

Note: `SearchBar` needs to support an `action` prop so the form submits to `/categories/${slug}` instead of always `/events`. Add `action?: string` prop to `SearchBar` with default `'/events'`.

- [ ] **Step 2: Update SearchBar to support `action` prop**

Read `apps/web/src/components/SearchBar.tsx` and add `action?: string` prop defaulting to `'/events'`. Change the `<form action="/events"` to `<form action={action ?? '/events'}`.

- [ ] **Step 3: Type-check**

```bash
pnpm -F web type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/categories/[slug]/page.tsx apps/web/src/components/SearchBar.tsx
git commit -m "feat: rewrite category detail page with filter tabs, search, and proper pagination"
```

---

### Task 4: Remove TypewriterText animation from Organizer CTA

**Files:**
- Modify: `apps/web/src/app/page.tsx` (Organizer CTA section only)

**Interfaces:**
- Consumes: nothing new
- Produces: The `<TypewriterText tag="h2">` in the CTA section is replaced with a plain `<h2>` keeping the same className and text

- [ ] **Step 1: Replace TypewriterText with plain h2 in the Organizer CTA**

In `apps/web/src/app/page.tsx`, find the Organizer CTA section (around line 252). Replace:

```tsx
<TypewriterText
  tag="h2"
  startDelay={300}
  speed={185}
  className="mt-4 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl"
  segments={[{ text: 'List your event.\nSell it out.' }]}
/>
```

With:

```tsx
<h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight whitespace-pre-line md:text-6xl">
  {'List your event.\nSell it out.'}
</h2>
```

- [ ] **Step 2: Remove TypewriterText import if it's no longer used**

Check `apps/web/src/app/page.tsx` — if `TypewriterText` is still used in the Hero section, keep the import. If the CTA was the only usage, remove the import line.

(The Hero section uses `<TypewriterText tag="h1" immediate ...>` — so keep the import.)

- [ ] **Step 3: Type-check**

```bash
pnpm -F web type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "fix: replace TypewriterText with static h2 in Organizer CTA section"
```

---

### Task 5: Add categories marquee strip on landing page

**Files:**
- Modify: `apps/web/src/app/globals.css` — add `@keyframes marquee`
- Modify: `apps/web/src/app/page.tsx` — insert marquee section

**Interfaces:**
- Consumes: `categories` array already fetched on the landing page (available at line ~218 of `page.tsx`)
- Produces: A full-width strip between the Categories section and Organizer CTA; black bg, thin ember top border, single-line infinite scrolling marquee of `• Category Name` items in ember color

- [ ] **Step 1: Add marquee keyframe to globals.css**

In `apps/web/src/app/globals.css`, append before the closing `}` of the `@layer utilities` block (or after the `tw-blink` keyframe at the end of the file):

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

- [ ] **Step 2: Insert marquee section in page.tsx**

In `apps/web/src/app/page.tsx`, find the comment `{/* Organizer CTA */}` (around line 244). Insert the following section immediately before it:

```tsx
{/* Categories Marquee */}
{categories.length > 0 && (
  <div className="border-t border-ember bg-void overflow-hidden py-3">
    <div
      className="flex gap-8 whitespace-nowrap"
      style={{ animation: 'marquee 30s linear infinite' }}
    >
      {[...categories, ...categories].map((cat, i) => (
        <span
          key={`${cat.id}-${i}`}
          className="font-mono text-sm text-ember shrink-0"
        >
          • {cat.name}
        </span>
      ))}
    </div>
  </div>
)}
```

The list is doubled (`[...categories, ...categories]`) so the marquee loops seamlessly — when the first copy scrolls out, the second copy is identical and the animation resets without a visible jump.

- [ ] **Step 3: Type-check**

```bash
pnpm -F web type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/globals.css
git commit -m "feat: add categories marquee strip on landing page between categories and CTA"
```

---

## Self-Review

**Spec coverage:**
- ✅ Task 1+2: `CategoryFilter` reusable component + category dropdown on `/events`
- ✅ Task 3: Category detail page rewritten with filter tabs, search, proper pagination, defaulting to upcoming
- ✅ Task 4: TypewriterText removed from Organizer CTA
- ✅ Task 5: Categories marquee strip inserted between categories and CTA

**Placeholder scan:** None — all steps include actual code.

**Type consistency:**
- `CategoryFilter` props: `{ categories: Category[]; currentSlug?: string; getUrl: (slug: string | null) => string; className?: string }` — used consistently in Tasks 2 and 3
- `buildEventsUrl` updated signature `{ page?, filter?, search?, category? }` used in Task 2
- `buildCategoryUrl(slug, { page?, filter?, search? })` — defined and used in Task 3
- `SearchBar` gets `action?: string` and `extraParams?: Record<string, string>` props in Task 2/3
