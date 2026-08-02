'use client';

import { useRouter } from 'next/navigation';
import type { Category } from '@whats-up-addis/shared';

interface CategoryFilterProps {
  categories: Category[];
  currentSlug?: string;
  // 'events-page': selecting a category navigates to /events?category=slug
  // 'category-page': selecting a category navigates to /categories/slug
  mode: 'events-page' | 'category-page';
  filter?: string;
  search?: string;
  className?: string;
}

function buildUrl(
  mode: 'events-page' | 'category-page',
  slug: string | null,
  filter?: string,
  search?: string
): string {
  const query = new URLSearchParams();
  if (filter) query.set('filter', filter);
  if (search) query.set('search', search);
  const qs = query.toString();

  if (mode === 'events-page') {
    if (slug) query.set('category', slug);
    const fullQs = query.toString();
    return fullQs ? `/events?${fullQs}` : '/events';
  }

  // category-page: clearing goes to /events, switching goes to /categories/newSlug
  if (!slug) return '/events';
  return qs ? `/categories/${slug}?${qs}` : `/categories/${slug}`;
}

export default function CategoryFilter({
  categories,
  currentSlug,
  mode,
  filter,
  search,
  className = '',
}: CategoryFilterProps) {
  const router = useRouter();

  return (
    <select
      value={currentSlug ?? ''}
      onChange={(e) =>
        router.push(buildUrl(mode, e.target.value || null, filter, search))
      }
      className={[
        'shrink-0 cursor-pointer appearance-none rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all',
        'focus:outline-none',
        currentSlug
          ? 'border-ember bg-ember text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
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
