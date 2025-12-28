import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Event } from '@whats-up-addis/shared';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const hasMedia = event.imageUrl || event.videoUrl;

  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
    >
      {hasMedia && (
        <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
          {event.videoUrl ? (
            <video
              src={event.videoUrl}
              className="w-full h-full object-cover"
              preload="metadata"
              autoPlay
              muted
              loop
            />
          ) : event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : null}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {event.category && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
              {event.category.name}
            </span>
          )}
          {event.price !== null && event.price !== undefined ? (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              ${Number(event.price).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Free
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
          {event.description}
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
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
            <span>
              {format(new Date(event.startDate), 'MMM dd, yyyy · h:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
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
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
