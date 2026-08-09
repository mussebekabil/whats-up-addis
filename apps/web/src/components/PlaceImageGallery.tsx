'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PlaceImageGalleryProps {
  imageUrls: string[];
  placeName: string;
}

export default function PlaceImageGallery({
  imageUrls,
  placeName,
}: PlaceImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (imageUrls.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-ember/20 via-primary/10 to-background">
        <Image
          src={imageUrls[activeIndex]}
          alt={placeName}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 896px) 100vw, 896px"
          priority={activeIndex === 0}
          key={imageUrls[activeIndex]}
        />
      </div>

      {/* Thumbnail strip — only when there are multiple images */}
      {imageUrls.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imageUrls.map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1} of ${imageUrls.length}`}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-card transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
                idx === activeIndex
                  ? 'border-ember ring-1 ring-ember'
                  : 'border-border hover:border-foreground/30'
              }`}
            >
              <Image
                src={url}
                alt={`${placeName} — image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 25vw, 224px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
