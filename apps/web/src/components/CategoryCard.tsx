import Link from 'next/link';
import type { Category } from '@whats-up-addis/shared';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.2)]"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
        Category
      </span>
      <h3 className="font-display text-2xl text-foreground transition-colors group-hover:text-ember">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-sm text-muted-foreground">{category.description}</p>
      )}
      <span className="mt-auto font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        Browse →
      </span>
    </Link>
  );
}
