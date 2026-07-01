'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';
import { User, Roles } from '@whats-up-addis/shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import RoundTextPrimary from './ui-nuggets/RoundTextPrimary';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user:', err);
          authService.logout();
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  const getUserInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop header */}
      <header className="sticky top-0 z-50 hidden md:block border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none">
              What&apos;s Up
            </span>
             <RoundTextPrimary>Addis</RoundTextPrimary>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/events?filter=upcoming"
              className="text-xs text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Discover
            </Link>
            <Link
              href="/categories"
              className="text-xs text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Categories
            </Link>
            <Link
              href="/contact"
              className="text-xs text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            {user?.role === Roles.Admin && (
              <Link
                href="/admin/events"
                className="font-mono text-xs uppercase tracking-widest text-ember transition-opacity hover:opacity-80"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                {user.role === Roles.Admin && (
                  <Link
                    href="/events/create"
                    className="inline-flex h-9 items-center rounded-full bg-ember px-4 font-mono text-[11px] uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
                  >
                    Create event
                  </Link>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-mono text-xs font-bold text-primary-foreground transition-opacity hover:opacity-80"
                  >
                    {getUserInitials(user.name)}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card py-2 shadow-lg">
                      <div className="border-b border-border px-4 py-2">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      {user.role === Roles.Admin && (
                        <Link
                          href="/admin/events"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          Manage Events
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex h-9 items-center rounded-full border border-border px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex h-9 items-center rounded-full bg-ember px-4 font-mono text-[11px] uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl leading-none">
              What&apos;s Up
            </span>
            <RoundTextPrimary>Addis</RoundTextPrimary>
          </Link>
          <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ember font-mono text-xs font-bold text-ember-foreground"
              >
                {getUserInitials(user.name)}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card py-2 shadow-lg">
                  <div className="border-b border-border px-4 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  {user.role === Roles.Admin && (
                    <Link
                      href="/admin/events"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Manage Events
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex h-8 items-center rounded-full bg-ember px-3 font-mono text-[10px] uppercase tracking-widest text-ember-foreground"
            >
              Sign in
            </Link>
          )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex h-16 items-center justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive('/')
                ? 'text-ember'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-widest">Home</span>
          </Link>

          <Link
            href="/events?filter=upcoming"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive('/events') || pathname?.startsWith('/events/')
                ? 'text-ember'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-widest">Events</span>
          </Link>

          <Link
            href="/categories"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive('/categories') || pathname?.startsWith('/categories/')
                ? 'text-ember'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-widest">Categories</span>
          </Link>

          <Link
            href="/contact"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive('/contact')
                ? 'text-ember'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-widest">Contact</span>
          </Link>

          {user ? (
            <Link
              href="/profile"
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive('/profile')
                  ? 'text-ember'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-ember flex items-center justify-center text-primary-foreground text-[8px] font-bold font-mono">
                {getUserInitials(user.name)}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest">Profile</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive('/auth/login') || isActive('/auth/register')
                  ? 'text-ember'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-widest">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
