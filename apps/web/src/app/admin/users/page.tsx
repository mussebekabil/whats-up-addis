'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { User } from '@whats-up-addis/shared';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getMe();
        if (user.role !== 'ADMIN') {
          router.push('/');
          return;
        }
        fetchUsers();
      } catch {
        router.push('/auth/login');
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-destructive/15 text-destructive';
      case 'MODERATOR':
        return 'bg-primary/15 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading && users.length === 0) {
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
            <h1 className="mt-1 font-display text-4xl">Users</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {users.length} registered user{users.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}{' '}
              <button
                onClick={() => setError('')}
                className="ml-2 underline-offset-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {users.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  No users found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Name
                        </span>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Email
                        </span>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Role
                        </span>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Joined
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${getRoleBadgeClass(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
