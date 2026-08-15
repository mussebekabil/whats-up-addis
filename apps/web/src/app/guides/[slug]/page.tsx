import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { GUIDES } from '@/lib/guides';
import {
  getAllPlaceSlugs,
  getPlaceContent,
  PlaceContent,
} from '@/lib/place-content';
import { eventService } from '@/lib/events';
import { Event } from '@whats-up-addis/shared';
import { generateGuideSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

function GuidePlaceCard({ place }: { place: PlaceContent }) {
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

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `https://whatsupaddis.io/guides/${slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `https://whatsupaddis.io/guides/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  // Load places matching this guide's category from markdown (no API call)
  const allSlugs = getAllPlaceSlugs();
  const allContents = await Promise.all(
    allSlugs.map((s) => getPlaceContent(s))
  );
  const places = allContents.filter(
    (c): c is PlaceContent =>
      c !== null && c.categorySlug === guide.categorySlug
  );

  // Fetch upcoming events matching this guide's keywords; degrade silently on failure
  let events: Event[] = [];
  try {
    const keyword = guide.eventKeywords[0];
    const res = await eventService.getEvents({
      page: 1,
      limit: 6,
      search: keyword,
    });
    events = res.data ?? [];
  } catch {
    // events section simply won't render
  }

  const guideSchema = generateGuideSchema(
    guide.title,
    guide.description,
    places
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${slug}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-6">
            <Link
              href="/guides"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All Guides
            </Link>
          </div>

          <h1 className="font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            {guide.description}
          </p>

          {places.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {places.map((place) => (
                <GuidePlaceCard key={place.slug} place={place} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-muted-foreground">
              No places found for this guide yet.
            </p>
          )}

          {events.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl">Upcoming Related Events</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
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
