import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
            {GUIDES.map((guide, index) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-ember/20 via-primary/10 to-background">
                  {guide.imageUrl ? (
                    <Image
                      src={guide.imageUrl}
                      alt={guide.title}
                      fill
                      priority={index < 2}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-4xl text-foreground/20">
                      {guide.categorySlug.replace(/-/g, ' ')}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-display text-xl">{guide.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {guide.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
