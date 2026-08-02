'use client';

import type { Category, UserSubscription } from '@whats-up-addis/shared';

interface CategorySubscriptionGridProps {
  categories: Category[];
  subscriptions: UserSubscription[];
  onToggle: (category: Category, isSubscribed: boolean) => Promise<void>;
  disabled?: boolean;
}

export function CategorySubscriptionGrid({
  categories,
  subscriptions,
  onToggle,
  disabled = false,
}: CategorySubscriptionGridProps) {
  const subscribedIds = new Set(subscriptions.map((s) => s.categoryId));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((category) => {
        const isSubscribed = subscribedIds.has(category.id);
        return (
          <label
            key={category.id}
            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
              isSubscribed
                ? 'border-ember/40 bg-ember/5'
                : 'border-border bg-card hover:border-ember/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-sm font-medium text-card-foreground">
              {category.name}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isSubscribed}
              disabled={disabled}
              onClick={() => onToggle(category, isSubscribed)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 ${
                isSubscribed ? 'bg-ember' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isSubscribed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        );
      })}
    </div>
  );
}
