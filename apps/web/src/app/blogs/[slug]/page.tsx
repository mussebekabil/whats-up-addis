import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { getBlogContent, getAllBlogSlugs } from '@/lib/blog-content';
import { getPlaceContent, PlaceContent } from '@/lib/place-content';
import { eventService } from '@/lib/events';
import { Event } from '@whats-up-addis/shared';

interface Props {
  params: Promise<{ slug: string }>;
}

function BlogPlaceCard({ place }: { place: PlaceContent }) {
  return (
    <Link
      href={`/places/${place.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-ember/20 via-primary/10 to-background">
        {place.imageUrls[0] ? (
          <Image
            src={place.imageUrls[0]}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl text-foreground/30">
            {place.categorySlug.replace(/-/g, ' ')}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
          {place.categorySlug.replace(/-/g, ' ')}
        </span>
        <h3 className="font-display text-xl leading-tight text-foreground">
          {place.name}
        </h3>
        {place.address && (
          <p className="text-sm text-muted-foreground">{place.address}</p>
        )}
      </div>
    </Link>
  );
}

function YoutubeEmbed({ url }: { url: string }) {
  let videoId: string | null = null;
  try {
    videoId = new URL(url).searchParams.get('v');
  } catch {
    return null;
  }
  if (!videoId) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl mt-10">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogContent(slug);
  if (!blog) return {};
  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: { canonical: `https://whatsupaddis.io/blogs/${slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: `https://whatsupaddis.io/blogs/${slug}`,
      type: 'article',
      ...(blog.coverImage ? { images: [{ url: blog.coverImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogContent(slug);
  if (!blog) notFound();

  const places: PlaceContent[] = blog.relatedPlaceSlugs
    ? (
        await Promise.all(
          blog.relatedPlaceSlugs.map((s) => getPlaceContent(s))
        )
      ).filter((p): p is PlaceContent => p !== null)
    : [];

  let upcomingEvents: Event[] = [];
  let pastEvents: Event[] = [];
  if (blog.relatedEventKeywords && blog.relatedEventKeywords.length > 0) {
    const keyword = blog.relatedEventKeywords[0];
    const now = new Date().toISOString();
    try {
      const [upcomingResult, pastResult] = await Promise.allSettled([
        eventService.getEvents({ page: 1, limit: 6, search: keyword, endDateGte: now }),
        eventService.getEvents({ page: 1, limit: 6, search: keyword, endDateLt: now }),
      ]);
      upcomingEvents = upcomingResult.status === 'fulfilled' ? (upcomingResult.value.data ?? []) : [];
      pastEvents = pastResult.status === 'fulfilled' ? (pastResult.value.data ?? []) : [];
    } catch {
      // events sections simply won't render
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-6">
            <Link
              href="/blogs"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All Blogs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
              {blog.category}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {new Date(blog.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {blog.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            By {blog.author}
          </p>

          {blog.coverImage && (
            <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          <div
            className="mt-10 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-a:text-ember"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />

          {blog.youtubeUrl && <YoutubeEmbed url={blog.youtubeUrl} />}

          {places.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl">Related Places</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {places.map((place) => (
                  <BlogPlaceCard key={place.slug} place={place} />
                ))}
              </div>
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl">Upcoming Related Events</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl">Past Related Events</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
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
