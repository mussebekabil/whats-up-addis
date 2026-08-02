'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '@/lib/subscriptions';
import { api } from '@/lib/api';
import { CategorySubscriptionGrid } from './CategorySubscriptionGrid';
import type {
  Category,
  UserSubscription,
  NotificationSettings as NotificationSettingsType,
  DigestFrequency,
} from '@whats-up-addis/shared';

export function NotificationSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [settings, setSettings] = useState<NotificationSettingsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [savingFrequency, setSavingFrequency] = useState(false);
  const [savingGeneric, setSavingGeneric] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cats, subs, notifSettings] = await Promise.all([
        api.get<Category[]>('/api/categories'),
        subscriptionService.getSubscriptions(),
        subscriptionService.getNotificationSettings(),
      ]);
      setCategories(cats);
      setSubscriptions(subs);
      setSettings(notifSettings);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load notification settings'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (category: Category, isSubscribed: boolean) => {
    setToggling(category.id);
    const prev = subscriptions;
    // Optimistic update
    if (isSubscribed) {
      setSubscriptions((s) => s.filter((sub) => sub.categoryId !== category.id));
    } else {
      setSubscriptions((s) => [
        ...s,
        {
          id: 'optimistic',
          categoryId: category.id,
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? null,
          },
          createdAt: new Date(),
        },
      ]);
    }
    try {
      if (isSubscribed) {
        await subscriptionService.removeSubscription(category.id);
      } else {
        const newSub = await subscriptionService.addSubscription(category.id);
        setSubscriptions((s) =>
          s.map((sub) => (sub.id === 'optimistic' ? newSub : sub))
        );
      }
    } catch {
      setSubscriptions(prev); // rollback
    } finally {
      setToggling(null);
    }
  };

  const handleFrequencyChange = async (freq: DigestFrequency) => {
    setSavingFrequency(true);
    try {
      const updated = await subscriptionService.updateNotificationSettings({
        digestFrequency: freq,
      });
      setSettings(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save frequency');
    } finally {
      setSavingFrequency(false);
    }
  };

  const handleGenericOptOutChange = async (optOut: boolean) => {
    setSavingGeneric(true);
    try {
      const updated = await subscriptionService.updateNotificationSettings({
        genericEmailOptOut: optOut,
      });
      setSettings(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save setting');
    } finally {
      setSavingGeneric(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ember" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const hasSubscriptions = subscriptions.length > 0;

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-card-foreground mb-1">
          Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose which event categories to follow and how often to receive
          emails.
        </p>
      </div>

      {/* Category subscriptions */}
      <section>
        <h3 className="text-base font-medium text-card-foreground mb-3">
          Category Subscriptions
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Toggle categories to subscribe or unsubscribe from event digest
          emails.
        </p>
        <CategorySubscriptionGrid
          categories={categories}
          subscriptions={subscriptions}
          onToggle={handleToggle}
          disabled={toggling !== null}
        />
      </section>

      {/* Frequency (only when subscribed) */}
      {hasSubscriptions && settings && (
        <section className="border-t border-border pt-6">
          <h3 className="text-base font-medium text-card-foreground mb-3">
            Email Frequency
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            How often should we send you upcoming event digests?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {(
              [
                { value: 'EVERY_3_DAYS', label: 'Every 3 days' },
                { value: 'WEEKLY', label: 'Weekly' },
              ] as const
            ).map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  settings.digestFrequency === value
                    ? 'border-ember/50 bg-ember/5'
                    : 'border-border hover:border-ember/30'
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={value}
                  checked={settings.digestFrequency === value}
                  disabled={savingFrequency}
                  onChange={() => handleFrequencyChange(value)}
                  className="accent-ember focus:ring-ember"
                />
                <span className="text-sm font-medium text-card-foreground">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Generic email opt-out */}
      {settings && (
        <section className="border-t border-border pt-6">
          <h3 className="text-base font-medium text-card-foreground mb-3">
            General Event Highlights
          </h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!settings.genericEmailOptOut}
              disabled={savingGeneric}
              onChange={(e) => handleGenericOptOutChange(!e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-ember focus:ring-ember border-border"
            />
            <div>
              <span className="text-sm font-medium text-card-foreground">
                Receive weekly event highlights
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                When you have no category subscriptions, we&apos;ll send a
                weekly digest of top upcoming events.
              </p>
            </div>
          </label>
        </section>
      )}
    </div>
  );
}
