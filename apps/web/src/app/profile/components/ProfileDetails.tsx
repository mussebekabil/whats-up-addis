'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import type { User } from '@whats-up-addis/shared';

interface ProfileDetailsProps {
  user: User;
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-lg p-8">
      <div className="flex items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-ember flex items-center justify-center text-ember-foreground text-3xl font-bold">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </div>
        <div className="ml-6">
          <h1 className="text-3xl font-bold text-card-foreground">
            {user.name}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Full Name
            </label>
            <p className="mt-1 text-card-foreground">{user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <p className="mt-1 text-card-foreground">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Role
            </label>
            <p className="mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-ember/15 text-ember">
                {user.role}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Member Since
            </label>
            <p className="mt-1 text-card-foreground">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6 mt-6">
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-ember text-ember-foreground rounded-lg hover:bg-ember/90 transition-colors font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
