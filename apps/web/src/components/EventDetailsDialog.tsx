'use client';

import { Event } from '@/lib/admin';
import { EventStatus } from '@whats-up-addis/shared';

interface EventDetailsDialogProps {
  event: Event;
  onClose: () => void;
  onStatusUpdate: (eventId: string, status: EventStatus) => void;
  updating: boolean;
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
        return 'bg-yellow-100 text-yellow-800';
      case EventStatus.Accepted:
        return 'bg-green-100 text-green-800';
      case EventStatus.Rejected:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Event Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {(event.imageUrl || event.videoUrl) && (
            <div className="mb-6">
              {event.videoUrl ? (
                <video
                  src={event.videoUrl}
                  controls
                  autoPlay
                  muted
                  className="w-full h-auto max-h-96 rounded-lg"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              ) : event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : null}
            </div>
          )}

          <div className="mb-4">
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeClass(
                event.status
              )}`}
            >
              {event.status}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Category
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {event.category.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Price
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {event.price ? `$${event.price}` : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Start Date
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {new Date(event.startDate).toLocaleString()}
              </p>
            </div>
            {event.endDate && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  End Date
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(event.endDate).toLocaleString()}
                </p>
              </div>
            )}
            {event.location && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {event.location}
                </p>
              </div>
            )}
            {event.venue && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Venue
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {event.venue}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Source
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {event.source}
              </p>
            </div>
            {event.creator && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created By
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {event.creator.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {event.creator.email}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Description
            </p>
            <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag.tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.sourceUrl && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Source URL
              </p>
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline break-all"
              >
                {event.sourceUrl}
              </a>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Actions
            </p>
            <div className="flex flex-wrap gap-3">
              {event.status !== EventStatus.Accepted && (
                <button
                  onClick={() => onStatusUpdate(event.id, EventStatus.Accepted)}
                  disabled={updating}
                  className="flex-1 min-w-[120px] px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {updating ? 'Accepting...' : 'Accept Event'}
                </button>
              )}
              {event.status !== EventStatus.Rejected && (
                <button
                  onClick={() => onStatusUpdate(event.id, EventStatus.Rejected)}
                  disabled={updating}
                  className="flex-1 min-w-[120px] px-6 py-3 border border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {updating ? 'Rejecting...' : 'Reject Event'}
                </button>
              )}
              {event.status !== EventStatus.Pending && (
                <button
                  onClick={() => onStatusUpdate(event.id, EventStatus.Pending)}
                  disabled={updating}
                  className="flex-1 min-w-[120px] px-6 py-3 border border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {updating ? 'Resetting...' : 'Reset to Pending'}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 min-w-[120px] px-6 py-3 border border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
