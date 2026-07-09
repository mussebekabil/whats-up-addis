import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Event } from '@whats-up-addis/shared';
import RoundTextPrimary from './ui-nuggets/RoundTextPrimary';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const hasMedia = event.imageUrl || event.videoUrl;
  const day = format(new Date(event.startDate), 'd');
  const month = format(new Date(event.startDate), 'MMM').toUpperCase();
  const year = format(new Date(event.startDate), 'yyyy');
  const time = format(new Date(event.startDate), 'h:mm a');
  const price =
    event.price != null && Number(event.price) > 0
      ? `${Number(event.price).toLocaleString()} ETB`
      : 'Free';

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      {/* Media */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[var(--ember)]/20 via-[var(--primary)]/10 to-[var(--background)]">
        {event.videoUrl ? (
          <video
            src={event.videoUrl}
            poster={event.imageUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl text-foreground/30">
            {event.category?.name ?? 'Event'}
          </div>
        )}

        {/* Date badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-card px-3 py-2">
          <span className="font-display text-3xl leading-none">{day}</span>
          <div className="flex h-6 flex-col justify-between">
            <span className="font-mono text-[10px] uppercase leading-none tracking-widest text-muted-foreground">{month}</span>
            <span className="font-mono text-[10px] uppercase leading-none tracking-widest text-muted-foreground">{year}</span>
          </div>
        </div>
        {/* Video badge */}
        {hasMedia && event.videoUrl && (
          <span className="absolute right-3 top-3 rounded-full bg-ember px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-ember-foreground">
            ▶ Video
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
            {event.category?.name ?? 'Event'}
          </span>
          <h3 className="mt-1.5 line-clamp-2 font-display text-xl leading-tight text-foreground">
            {event.title}
          </h3>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>

        <div className="mt-auto flex items-end justify-between border-t border-dashed border-border pt-3">
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="text-foreground">{event.venue}</span>
            <span className="text-muted-foreground">{time}</span>
          </div>
          <span className="font-mono text-sm font-semibold text-foreground">
            {price}
          </span>
        </div>
      </div>
    </Link>
  );
}
