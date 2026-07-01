'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { adminApi, Event } from '@/lib/admin';
import EventDetailsDialog from '@/components/EventDetailsDialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EventStatus } from '@whats-up-addis/shared';

type SortField = 'title' | 'category' | 'date' | 'creator';
type SortOrder = 'asc' | 'desc';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatus>(
    EventStatus.Pending
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getMe();
        if (user.role !== 'ADMIN') {
          router.push('/');
        }
      } catch {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const response = await adminApi.getEvents(token, page, 20, statusFilter);
      setEvents(response.data);
      setTotalPages(response.pagination.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (eventId: string, newStatus: EventStatus) => {
    try {
      setUpdating(eventId);
      const token = authService.getToken();
      if (!token) return;
      await adminApi.updateEventStatus(eventId, newStatus, token);
      await fetchEvents();
      setSelectedEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setUpdating(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedEvents = () => {
    return [...events].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category.name.toLowerCase();
          bValue = b.category.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'creator':
          aValue = (a.creator?.name || 'Unknown').toLowerCase();
          bValue = (b.creator?.name || 'Unknown').toLowerCase();
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="ml-1 h-3 w-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex flex-1 items-center justify-center pb-16 md:pb-0">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ember" />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Loading…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
              Admin
            </span>
            <h1 className="mt-1 font-display text-4xl">Event Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review and manage submitted events
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}{' '}
              <button onClick={() => setError('')} className="ml-2 underline-offset-2 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Status filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {([EventStatus.Pending, EventStatus.Accepted, EventStatus.Rejected] as EventStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`inline-flex h-8 items-center rounded-full px-4 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  statusFilter === s
                    ? 'border bg-ember text-foreground'
                    : 'border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {events.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  No {statusFilter.toLowerCase()} events found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {(
                        [
                          { label: 'Event', field: 'title' },
                          { label: 'Category', field: 'category' },
                          { label: 'Date', field: 'date' },
                          { label: 'Creator', field: 'creator' },
                        ] as { label: string; field: SortField }[]
                      ).map(({ label, field }) => (
                        <th
                          key={field}
                          onClick={() => handleSort(field)}
                          className="px-6 py-3 text-left cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {label}
                            <SortIcon field={field} />
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Status
                        </span>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {getSortedEvents().map((event) => (
                      <tr
                        key={event.id}
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">
                            {event.title}
                          </div>
                          <div className="mt-0.5 truncate max-w-xs font-mono text-[10px] text-muted-foreground">
                            {event.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {event.category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {event.creator?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${getStatusBadgeClass(event.status)}`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {event.status !== EventStatus.Accepted && (
                              <button
                                onClick={() => handleStatusUpdate(event.id, EventStatus.Accepted)}
                                disabled={updating === event.id}
                                className="inline-flex h-7 items-center rounded-full bg-primary px-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updating === event.id ? '…' : 'Accept'}
                              </button>
                            )}
                            {event.status !== EventStatus.Rejected && (
                              <button
                                onClick={() => handleStatusUpdate(event.id, EventStatus.Rejected)}
                                disabled={updating === event.id}
                                className="inline-flex h-7 items-center rounded-full border border-destructive/40 px-3 font-mono text-[10px] uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updating === event.id ? '…' : 'Reject'}
                              </button>
                            )}
                            {event.status !== EventStatus.Pending && (
                              <button
                                onClick={() => handleStatusUpdate(event.id, EventStatus.Pending)}
                                disabled={updating === event.id}
                                className="inline-flex h-7 items-center rounded-full border border-border px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updating === event.id ? '…' : 'Reset'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-9 items-center rounded-full border border-border px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="font-mono text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex h-9 items-center rounded-full border border-border px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onStatusUpdate={handleStatusUpdate}
          updating={updating === selectedEvent.id}
        />
      )}
    </div>
  );
}
