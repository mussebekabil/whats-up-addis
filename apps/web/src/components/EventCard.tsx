import Link from 'next/link';
import { format } from 'date-fns';
import type { Event } from '@whats-up-addis/shared';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
    >
      {event.imageUrl && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {event.category && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
              {event.category.name}
            </span>
          )}
          {event.price !== null && event.price !== undefined ? (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              ${Number(event.price).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Free
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {event.description}
        </p>
        <div className="text-sm text-gray-500 space-y-1">
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
            <span>{format(new Date(event.startDate), 'MMM dd, yyyy · h:mm a')}</span>
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
