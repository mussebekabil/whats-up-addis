import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { eventService } from '@/lib/events';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventEngagement from '@/components/EventEngagement';
import EventAdminActions from './EventAdminActions';
import { Event } from '@whats-up-addis/shared';
import RoundTextMuted from '@/components/ui-nuggets/RoundTextMuted';
import { generateEventSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
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

export async function generateMetadata({
  params,
}: EventDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const event: Event = await eventService.getEventById(id);
    const description = event.description?.slice(0, 160) ?? '';
    return {
      title: event.title,
      description,
      alternates: {
        canonical: `https://whatsupaddis.io/events/${id}`,
      },
      openGraph: {
        title: event.title,
        description,
        url: `https://whatsupaddis.io/events/${id}`,
        type: 'article',
        images: event.imageUrl
          ? [{ url: event.imageUrl, width: 1200, height: 630, alt: event.title }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description,
        images: event.imageUrl ? [event.imageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = await params;

  let event: Event;
  try {
    event = await eventService.getEventById(id);
  } catch {
    notFound();
  }

  const price =
    event.price !== null && event.price !== undefined
      ? Number(event.price) === 0
        ? 'Free'
        : `${Number(event.price).toLocaleString()} ETB`
      : 'Free';

  const telegramSourceUrl =
    event.source === 'telegram' ? (event.sourceUrl ?? null) : null;

  const eventSchema = generateEventSchema(event);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Events', url: '/events' },
    { name: event.title, url: `/events/${id}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        <article className="mx-auto max-w-4xl px-6 py-12">
          {/* Top bar: back + admin actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/events"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Events
            </Link>
            <EventAdminActions
              eventId={id}
              eventTitle={event.title}
              telegramSourceUrl={telegramSourceUrl}
            />
          </div>

          {/* Hero media */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-ember/20 via-primary/10 to-background">
            {event.videoUrl ? (
              <video
                src={event.videoUrl}
                poster={event.imageUrl ?? undefined}
                controls
                autoPlay
                muted
                className="h-full w-full object-cover"
              />
            ) : event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-6xl text-foreground/20">
                {event.category?.name ?? 'Event'}
              </div>
            )}
          </div>

          {/* Category + date row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {event.category && (
              <span className="rounded-full bg-ember px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground">
                {event.category.name}
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {format(new Date(event.startDate), 'MMMM d, yyyy · h:mm a')}
              {event.endDate && (
                <> → {format(new Date(event.endDate), 'h:mm a')}</>
              )}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {event.title}
          </h1>

          {/* Body: description + aside */}
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_260px]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
                About
              </span>
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                {event.description}
              </p>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-8">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tags
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <RoundTextMuted key={tag.id}>#{tag.tag}</RoundTextMuted>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info aside */}
            <aside className="self-start space-y-5 rounded-2xl border border-border bg-card p-5">
              <Field label="Venue" value={event.venue ?? 'TBA'} />
              <Field label="Location" value={event.location ?? 'Addis Ababa'} />
              <Field label="Price" value={price} />
              {event.startDate && (
                <Field
                  label="Start Date"
                  value={format(
                    new Date(event.startDate),
                    'MMMM d, yyyy · h:mm a'
                  )}
                />
              )}
              {event.endDate && (
                <Field
                  label="End Date"
                  value={format(new Date(event.endDate), 'MMMM d, yyyy · h:mm a')}
                />
              )}
              {/* View Source for non-telegram events (public) */}
              {event.sourceUrl && event.source !== 'telegram' && (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl bg-ember px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
                >
                  View Source ↗
                </a>
              )}
            </aside>
          </div>
        </article>

        {/* Ratings and Comments */}
        <div className="mx-auto max-w-4xl px-6">
          <EventEngagement eventId={id} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
