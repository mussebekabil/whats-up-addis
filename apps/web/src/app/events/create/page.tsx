'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import { User, Category, Roles } from '@whats-up-addis/shared';

const INPUT_CLASS =
  'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';
const LABEL_CLASS = 'mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground';

function CreateEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    venue: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    videoUrl: '',
    sourceUrl: '',
    price: '',
    categoryId: '',
    tags: '',
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        const [userData, categoriesData] = await Promise.all([
          authService.getMe(),
          categoryService.getCategories(),
        ]);

        if (userData.role !== Roles.Admin) {
          setError('You do not have permission to create events. Admin access required.');
          setIsLoading(false);
          return;
        }

        setUser(userData);
        setCategories(categoriesData);

        if (duplicateId) {
          const eventToDuplicate = await eventService.getEventById(duplicateId);
          setFormData({
            title: `${eventToDuplicate.title} (Copy)`,
            description: eventToDuplicate.description,
            location: eventToDuplicate.location || '',
            venue: eventToDuplicate.venue || '',
            startDate: '',
            endDate: '',
            imageUrl: eventToDuplicate.imageUrl || '',
            videoUrl: eventToDuplicate.videoUrl || '',
            sourceUrl: eventToDuplicate.sourceUrl || '',
            price:
              eventToDuplicate.price !== null && eventToDuplicate.price !== undefined
                ? String(eventToDuplicate.price)
                : '',
            categoryId: eventToDuplicate.categoryId,
            tags: eventToDuplicate.tags?.map((t) => t.tag).join(', ') || '',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        if (err.message?.includes('Unauthorized') || err.message?.includes('token')) {
          authService.logout();
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router, duplicateId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        venue: formData.venue || null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
        sourceUrl: formData.sourceUrl || null,
        price: formData.price ? parseFloat(formData.price) : null,
        categoryId: formData.categoryId,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      const createdEvent = await eventService.createEvent(eventData);
      router.push(`/events/${createdEvent.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex flex-1 items-center justify-center pb-20 md:pb-0">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ember" />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Loading…
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 px-6 py-16 pb-20 md:pb-16">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-5">
              <h2 className="font-display text-xl text-destructive">Access Denied</h2>
              <p className="mt-2 text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Back + header */}
          <Link
            href="/events"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Events
          </Link>
          <div className="mt-6 mb-8">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
              {duplicateId ? 'Duplicate' : 'New Event'}
            </span>
            <h1 className="mt-1 font-display text-4xl">
              {duplicateId ? 'Duplicate Event' : 'Create Event'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {duplicateId
                ? 'The form has been pre-filled with data from the original event'
                : 'Fill in the details below to create a new event'}
            </p>
          </div>

          {/* Inline error */}
          {error && user && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div>
              <label htmlFor="title" className={LABEL_CLASS}>Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="Enter event title"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="description" className={LABEL_CLASS}>Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={10}
                rows={5}
                placeholder="Describe the event"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className={LABEL_CLASS}>Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={255}
                  placeholder="e.g., Addis Ababa"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="venue" className={LABEL_CLASS}>Venue</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={255}
                  placeholder="e.g., Sheraton Hotel"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className={LABEL_CLASS}>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="endDate" className={LABEL_CLASS}>End Date & Time</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label htmlFor="categoryId" className={LABEL_CLASS}>Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className={INPUT_CLASS}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className={LABEL_CLASS}>Price (ETB)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Leave empty for free events"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <span className={LABEL_CLASS}>Event Media</span>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload an image or video for your event (optional)
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageUploaded={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  onImageRemoved={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                />
                <VideoUpload
                  currentVideoUrl={formData.videoUrl}
                  onVideoUploaded={(url) => setFormData((prev) => ({ ...prev, videoUrl: url }))}
                  onVideoRemoved={() => setFormData((prev) => ({ ...prev, videoUrl: '' }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sourceUrl" className={LABEL_CLASS}>Source URL</label>
              <input
                type="url"
                id="sourceUrl"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleChange}
                placeholder="https://example.com/event-page"
                className={INPUT_CLASS}
              />
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                Original event page URL (if applicable)
              </p>
            </div>

            <div>
              <label htmlFor="tags" className={LABEL_CLASS}>Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="music, live, concert (comma-separated)"
                className={INPUT_CLASS}
              />
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-full bg-ember font-mono text-[11px] uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating…' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-11 items-center rounded-full border border-border px-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex flex-1 items-center justify-center pb-20 md:pb-0">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ember" />
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Loading…
              </p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <CreateEventForm />
    </Suspense>
  );
}
