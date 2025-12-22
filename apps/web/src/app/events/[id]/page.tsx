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

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
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

        // Check if user is logged in and is an admin
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading event...
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/events"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Events
          </Link>

          {user?.role === Roles.Admin && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href={`/events/${eventId}/edit`}
                className="inline-flex items-center px-3 py-2 md:px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Link>
              <Link
                href={`/events/create?duplicate=${eventId}`}
                className="inline-flex items-center px-3 py-2 md:px-4 border border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Duplicate
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-3 py-2 md:px-4 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:items-start">
          {/* Event Image - Shows on top for mobile */}
          {event.imageUrl && (
            <div className="relative w-full bg-black dark:bg-black rounded-lg shadow-lg overflow-hidden lg:sticky lg:top-24">
              <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[calc(100vh-8rem)]">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          )}

          {/* Event Details - Shows below image on mobile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {event.category && (
                <span className="text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-medium">
                  {event.category.name}
                </span>
              )}
              {event.price !== null && event.price !== undefined ? (
                <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                  ${Number(event.price).toFixed(2)}
                </span>
              ) : (
                <span className="text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-medium">
                  Free
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">Start Date</div>
                  <div>
                    {format(
                      new Date(event.startDate),
                      'MMMM dd, yyyy · h:mm a'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">End Date</div>
                  <div>
                    {format(new Date(event.endDate), 'MMMM dd, yyyy · h:mm a')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">Venue</div>
                  <div>{event.venue}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">Location</div>
                  <div>{event.location}</div>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="border-t dark:border-gray-700 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.sourceUrl && (
              <div className="border-t dark:border-gray-700 pt-6 mt-6">
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  View Original Source
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Ratings and Comments Section */}
        <EventEngagement eventId={eventId} />
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Event
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{event?.title}</strong>?
              This will permanently remove the event and all associated data
              including ratings and comments.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
