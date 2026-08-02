'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const navItems = [
  { label: 'Profile', tab: 'profile' },
  { label: 'Notifications', tab: 'notifications' },
];

export function ProfileSidebar() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  return (
    <nav className="w-full md:w-56 flex-shrink-0">
      {/* Horizontal on mobile, vertical on desktop */}
      <ul className="flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-4 md:pb-0 md:pr-4">
        {navItems.map(({ label, tab }) => (
          <li key={tab}>
            <Link
              href={`/profile?tab=${tab}`}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
