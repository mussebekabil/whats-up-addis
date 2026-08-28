import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllBlogs } from '@/lib/blog-content';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    "Stories, recaps, and features from Addis Ababa's events and culture scene.",
  alternates: {
    canonical: 'https://whatsupaddis.io/blogs',
  },
  openGraph: {
    title: "Blog | What's Up Addis",
    description:
      "Stories, recaps, and features from Addis Ababa's events and culture scene.",
    url: 'https://whatsupaddis.io/blogs',
  },
};

export default function BlogsPage() {
  const blogs = getAllBlogs();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Stories, recaps, and features from Addis Ababa.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {blogs.map((blog, index) => (
              <Link
                key={blog.slug}
                href={`/blogs/${blog.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-ember/20 via-primary/10 to-background">
                  {blog.coverImage ? (
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      fill
                      priority={index < 2}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-4xl text-foreground/20">
                      {blog.category}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember">
                    {blog.category}
                  </p>
                  <h2 className="font-display text-xl">{blog.title}</h2>
                  <p className="font-mono text-xs text-muted-foreground">
                    {new Date(blog.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {blog.excerpt}
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
