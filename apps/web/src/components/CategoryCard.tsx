import Link from 'next/link';
import type { Category } from '@whats-up-addis/shared';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-lg">{category.name}</h3>
      {category.description && (
        <p className="text-sm text-gray-600 mt-2">{category.description}</p>
      )}
    </Link>
  );
}
