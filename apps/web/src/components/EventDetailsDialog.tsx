'use client';

import { Event } from '@/lib/admin';
import { EventStatus } from '@whats-up-addis/shared';

interface EventDetailsDialogProps {
  event: Event;
  onClose: () => void;
  onStatusUpdate: (eventId: string, status: EventStatus) => void;
  updating: boolean;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

export default function EventDetailsDialog({
  event,
  onClose,
  onStatusUpdate,
  updating,
}: EventDetailsDialogProps) {
  const getStatusBadgeClass = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Pending:
        return 'bg-yellow-400/15 text-yellow-600 dark:text-yellow-400';
      case EventStatus.Accepted:
        return 'bg-primary/15 text-primary';
      case EventStatus.Rejected:
        return 'bg-destructive/15 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-card px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
              Admin Review
            </span>
            <h2 className="mt-0.5 font-display text-2xl">Event Details</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Media */}
          {(event.imageUrl || event.videoUrl) && (
            <div className="overflow-hidden rounded-2xl border border-border">
              {event.videoUrl ? (
                <video
                  src={event.videoUrl}
                  controls
                  autoPlay
                  muted
                  className="w-full max-h-80 object-cover"
                  preload="metadata"
                />
              ) : event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-56 w-full object-cover"
                />
              ) : null}
            </div>
          )}

          {/* Status badge + title */}
          <div>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${getStatusBadgeClass(event.status)}`}
            >
              {event.status}
            </span>
            <h3 className="mt-3 font-display text-3xl leading-tight">
              {event.title}
            </h3>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-background p-5">
            <Field label="Category" value={event.category.name} />
            <Field label="Price" value={event.price ? `${event.price} ETB` : 'Free'} />
            <Field label="Start Date" value={new Date(event.startDate).toLocaleString()} />
            {event.endDate && (
              <Field label="End Date" value={new Date(event.endDate).toLocaleString()} />
            )}
            {event.location && <Field label="Location" value={event.location} />}
            {event.venue && <Field label="Venue" value={event.venue} />}
            <Field label="Source" value={event.source} />
            {event.creator && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Created By
                </div>
                <div className="mt-1 text-sm text-foreground">{event.creator.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {event.creator.email}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
              About
            </span>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tags
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    #{tag.tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source URL */}
          {event.sourceUrl && (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Source URL
              </span>
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block rounded-xl bg-ember px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
              >
                View Source ↗
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div className="border-t border-border pt-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Actions
            </span>
            <div className="mt-3 flex flex-wrap gap-3">
              {event.status !== EventStatus.Accepted && (
                <button
                  onClick={() => onStatusUpdate(event.id, EventStatus.Accepted)}
                  disabled={updating}
                  className="flex-1 min-w-[120px] inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 font-mono text-[11px] uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? 'Accepting…' : 'Accept Event'}
                </button>
              )}
              {event.status !== EventStatus.Rejected && (
                <button
                  onClick={() => onStatusUpdate(event.id, EventStatus.Rejected)}
                  disabled={updating}
                  className="flex-1 min-w-[120px] inline-flex h-10 items-center justify-center rounded-full border border-destructive/40 px-5 font-mono text-[11px] uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? 'Rejecting…' : 'Reject Event'}
                </button>
              )}
              {event.status !== EventStatus.Pending && (
                <button
                  onClick={() => onStatusUpdate(event.id, EventStatus.Pending)}
                  disabled={updating}
                  className="flex-1 min-w-[120px] inline-flex h-10 items-center justify-center rounded-full border border-border px-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? 'Resetting…' : 'Reset to Pending'}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 min-w-[120px] inline-flex h-10 items-center justify-center rounded-full border border-border px-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
