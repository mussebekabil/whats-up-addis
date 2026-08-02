'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileDetails } from './components/ProfileDetails';
import { NotificationSettings } from './components/NotificationSettings';
import type { User } from '@whats-up-addis/shared';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }
        const userData = await authService.getMe();
        setUser(userData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load user data';
        setError(message);
        if (
          message.includes('Unauthorized') ||
          message.includes('token')
        ) {
          authService.logout();
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 pb-20 md:pb-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ember" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading profile...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 pb-20 md:pb-16">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error || 'User data not available'}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
          <ProfileSidebar />
          <div className="flex-1 min-w-0">
            {activeTab === 'notifications' ? (
              <NotificationSettings />
            ) : (
              <ProfileDetails user={user} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
