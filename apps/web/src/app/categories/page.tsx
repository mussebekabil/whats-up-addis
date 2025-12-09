import Link from 'next/link';
import { categoryService } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function CategoriesPage() {
  let categories: any[] = [];
  let error = null;

  try {
    categories = await categoryService.getCategories();
  } catch (err) {
    error =
      'Failed to load categories. Please make sure the API server is running.';
    console.error('Error fetching categories:', err);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Event Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse events by category
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {category.description}
                  </p>
                )}
                <div className="mt-4 text-primary-600 dark:text-primary-400 font-medium">
                  View events →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400">
                No categories available yet.
              </p>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
