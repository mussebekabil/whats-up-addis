import { categoryService } from '@/lib/categories';
import CategoryCard from '@/components/CategoryCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Category } from '@whats-up-addis/shared';

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let error = null;

  try {
    categories = await categoryService.getCategories();
  } catch (err) {
    error =
      'Failed to load categories. Please make sure the API server is running.';
    console.error('Error fetching categories:', err);
  }

  const eventCategories = categories.filter(
    (c) => c.applies === 'EVENT' || c.applies === 'BOTH'
  );
  const placeCategories = categories.filter(
    (c) => c.applies === 'PLACE' || c.applies === 'BOTH'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <span className="font-mono text-xs uppercase tracking-widest text-ember">
              Browse
            </span>
            <h1 className="mt-2 font-display text-5xl md:text-6xl">
              Categories
            </h1>
            <p className="mt-3 text-muted-foreground">
              Find events and places by what you love
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12">
          {error && (
            <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!error && categories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-display text-2xl">No categories yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back soon!
              </p>
            </div>
          )}

          {eventCategories.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-ember">
                Events
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eventCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}

          {placeCategories.length > 0 && (
            <section>
              <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-ember">
                Places
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {placeCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
