import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlaceContent, getAllPlaceSlugs } from '@/lib/place-content';
import { placeService } from '@/lib/places';
import PlaceImageGallery from '@/components/PlaceImageGallery';
import PlaceRating from '@/components/PlaceRating';
import PlaceComments from '@/components/PlaceComments';

interface Props {
  params: Promise<{ slug: string }>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ember">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPlaceContent(slug);
  if (!content) return {};
  return {
    title: `${content.name} | Whats Up Addis`,
    description: content.name,
  };
}

export async function generateStaticParams() {
  const slugs = getAllPlaceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PlaceDetailPage({ params }: Props) {
  const { slug } = await params;
  const content = await getPlaceContent(slug);
  if (!content) notFound();

  // Fetch DB record for ratings/comments (added in Issues 4 & 5)
  const place = await placeService.getPlaceById(slug).catch(() => null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        <article className="mx-auto max-w-4xl px-6 py-12">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/places"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Places
            </Link>
          </div>

          {/* Image gallery */}
          <PlaceImageGallery
            imageUrls={content.imageUrls}
            placeName={content.name}
          />

          {/* Category badge + place name */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ember px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground">
              {content.categorySlug.replace(/-/g, ' ')}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {content.name}
          </h1>

          {/* Body: markdown + aside */}
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_260px]">
            {/* Markdown body */}
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
                About
              </span>
              <div
                className="prose dark:prose-invert mt-3 max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-ember prose-a:no-underline hover:prose-a:underline prose-h2:mt-8 prose-h2:text-2xl prose-h3:mt-5 prose-h3:text-xl"
                dangerouslySetInnerHTML={{ __html: content.contentHtml }}
              />
            </div>

            {/* Info aside */}
            <aside className="self-start space-y-5 rounded-2xl border border-border bg-card p-5">
              {content.address && (
                <Field label="Address" value={content.address} />
              )}
              {content.openingHours && (
                <Field label="Opening Hours" value={content.openingHours} />
              )}
              {content.contactInfo && (
                <Field label="Contact" value={content.contactInfo} />
              )}
            </aside>
          </div>
        </article>

        <div className="mx-auto max-w-4xl px-6">
          {/* Ratings (Issue 4) */}
          <div className="mb-8">
            {place?.id && <PlaceRating placeId={place.id} />}
          </div>

          {/* Comments (Issue 5) */}
          <div className="mb-12">
            {place?.id && <PlaceComments placeId={place.id} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
