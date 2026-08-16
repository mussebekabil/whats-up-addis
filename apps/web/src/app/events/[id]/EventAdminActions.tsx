'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { eventService } from '@/lib/events';
import { User, Roles } from '@whats-up-addis/shared';

interface EventAdminActionsProps {
  eventId: string;
  eventTitle: string;
  telegramSourceUrl: string | null;
}

export default function EventAdminActions({
  eventId,
  eventTitle,
  telegramSourceUrl,
}: EventAdminActionsProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService
        .getMe()
        .then(setUser)
        .catch(() => {});
    }
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(eventId);
      router.push('/events');
    } catch {
      alert('Failed to delete event. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!user || user.role !== Roles.Admin) return null;

  return (
    <>
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
        {telegramSourceUrl && (
          <a
            href={telegramSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-ember px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
          >
            View Source ↗
          </a>
        )}
      </div>

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
              <strong className="text-foreground">{eventTitle}</strong>? This
              will permanently remove the event and all associated data
              including ratings and comments.
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
    </>
  );
}
