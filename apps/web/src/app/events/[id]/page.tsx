'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { eventService } from '@/lib/events';
import { authService } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventEngagement from '@/components/EventEngagement';
import { Event, User, Roles } from '@whats-up-addis/shared';
import RoundTextMuted from '@/components/ui-nuggets/RoundTextMuted';

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

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>('');
  const [event, setEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        setEventId(resolvedParams.id);

        const eventData = await eventService.getEventById(resolvedParams.id);
        setEvent(eventData);

        if (authService.isAuthenticated()) {
          try {
            const userData = await authService.getMe();
            setUser(userData);
          } catch (err) {
            console.error('Error fetching user:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (!eventId) return;
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(eventId);
      router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ember" />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Loading…
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const price =
    event.price !== null && event.price !== undefined
      ? Number(event.price) === 0
        ? 'Free'
        : `${Number(event.price).toLocaleString()} ETB`
      : 'Free';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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

            {user?.role === Roles.Admin && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/events/${eventId}/edit`}
                  className="inline-flex h-8 items-center rounded-full border border-border px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  Edit
                </Link>
                <Link
                  href={`/events/create?duplicate=${eventId}`}
                  className="inline-flex h-8 items-center rounded-full border border-border px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  Duplicate
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex h-8 items-center rounded-full border border-destructive/40 px-3 font-mono text-[10px] uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
            )}
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
              {event.endDate && (
                <Field
                  label="End Date"
                  value={format(new Date(event.endDate), 'MMMM d, yyyy · h:mm a')}
                />
              )}

              {event.sourceUrl &&
                (event.source !== 'telegram' || user?.role === Roles.Admin) && (
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
          <EventEngagement eventId={eventId} />
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                <svg
                  className="h-5 w-5 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl">Delete Event</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <strong className="text-foreground">{event?.title}</strong>? This
              will permanently remove the event and all associated data including
              ratings and comments.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="inline-flex h-9 items-center rounded-full border border-border px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-9 items-center rounded-full bg-destructive px-4 font-mono text-[11px] uppercase tracking-widest text-destructive-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
