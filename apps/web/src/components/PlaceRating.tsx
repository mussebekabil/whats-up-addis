'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { placeRatingService } from '@/lib/place-ratings';
import type { PlaceRatingStats, User } from '@whats-up-addis/shared';

interface PlaceRatingProps {
  placeId: string;
}

interface StarRatingProps {
  rating: number;
  onRate?: (r: number) => void;
  readonly?: boolean;
  user: User | null;
}

function StarRating({
  rating,
  onRate,
  readonly = false,
  user,
}: StarRatingProps) {
  const renderStar = (position: number) => {
    const isFullStar = position <= rating;
    const isHalfStar = position === Math.ceil(rating) && rating % 1 !== 0;

    if (readonly && isHalfStar) {
      const percentage = ((rating % 1) * 100).toFixed(0);
      return (
        <div key={position} className="relative inline-block text-2xl">
          <span className="text-muted-foreground/30">★</span>
          <span
            className="absolute top-0 left-0 overflow-hidden text-ember"
            style={{ width: `${percentage}%` }}
          >
            ★
          </span>
        </div>
      );
    }

    return (
      <button
        key={position}
        type="button"
        disabled={readonly || !user}
        onClick={() => onRate?.(position)}
        className={`text-2xl transition-transform ${
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        } ${isFullStar ? 'text-ember' : 'text-muted-foreground/30'}`}
      >
        ★
      </button>
    );
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
    </div>
  );
}

export default function PlaceRating({ placeId }: PlaceRatingProps) {
  const [user, setUser] = useState<User | null>(null);
  const [ratingStats, setRatingStats] = useState<PlaceRatingStats | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    try {
      const stats = await placeRatingService.getRatingStats(placeId);
      setRatingStats(stats);
      if (stats.userRating) {
        setSelectedRating(stats.userRating);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    const initialize = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      }

      fetchRatings();
    };

    initialize();
  }, [fetchRatings]);

  const handleRating = async (rating: number) => {
    if (!user) return;
    try {
      setError(null);
      const stats = await placeRatingService.createOrUpdateRating(placeId, {
        rating,
      });
      setSelectedRating(rating);
      setRatingStats(stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
        Ratings
      </span>
      <h2 className="mt-1 font-display text-2xl">Rate This Place</h2>

      {error && (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-display text-4xl">
              {ratingStats?.averageRating.toFixed(1) ?? '0.0'}
            </span>
            <div>
              <StarRating
                rating={ratingStats?.averageRating ?? 0}
                readonly
                user={user}
              />
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {ratingStats?.totalRatings ?? 0} ratings
              </p>
            </div>
          </div>

          {user ? (
            <div className="border-t border-border pt-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Your rating
              </p>
              <StarRating
                rating={selectedRating}
                onRate={handleRating}
                user={user}
              />
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">
              <Link
                href="/auth/login"
                className="text-ember underline-offset-2 hover:underline"
              >
                Sign in
              </Link>{' '}
              to rate this place
            </p>
          )}
        </div>
      )}
    </div>
  );
}
