import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Curated local guides to the best of Addis Ababa — coffee, culture, nightlife, museums, and more.',
  alternates: {
    canonical: 'https://whatsupaddis.io/guides',
  },
  openGraph: {
    title: "Guides | What's Up Addis",
    description:
      'Curated local guides to the best of Addis Ababa — coffee, culture, nightlife, museums, and more.',
    url: 'https://whatsupaddis.io/guides',
  },
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Guides
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Curated local guides to the best of Addis Ababa.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <h2 className="font-display text-xl">{guide.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {guide.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
