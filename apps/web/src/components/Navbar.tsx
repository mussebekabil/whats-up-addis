import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Whats Up Addis
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/events"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
