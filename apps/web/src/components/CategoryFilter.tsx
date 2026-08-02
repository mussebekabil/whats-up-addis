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
