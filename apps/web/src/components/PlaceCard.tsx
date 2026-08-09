import Link from 'next/link';
import Image from 'next/image';
import type { Place } from '@whats-up-addis/shared';

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Link
      href={`/places/${place.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
    >
      {/* Media */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[var(--ember)]/20 via-[var(--primary)]/10 to-[var(--background)]">
        {place.imageUrl ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl text-foreground/30">
            {place.category?.name ?? 'Place'}
          </div>
        )}

        {place.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-ember px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-ember-foreground">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
            {place.category?.name ?? 'Place'}
          </span>
          <h3 className="mt-1.5 line-clamp-2 font-display text-xl leading-tight text-foreground">
            {place.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
