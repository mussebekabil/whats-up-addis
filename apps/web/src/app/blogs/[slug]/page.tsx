import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogContent, getAllBlogSlugs } from '@/lib/blog-content';

interface Props {
  params: Promise<{ slug: string }>;
}

function YoutubeEmbed({ url }: { url: string }) {
  let videoId: string | null = null;
  try {
    videoId = new URL(url).searchParams.get('v');
  } catch {
    return null;
  }
  if (!videoId) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl mt-10">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogContent(slug);
  if (!blog) return {};
  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: { canonical: `https://whatsupaddis.io/blogs/${slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: `https://whatsupaddis.io/blogs/${slug}`,
      type: 'article',
      ...(blog.coverImage ? { images: [{ url: blog.coverImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogContent(slug);
  if (!blog) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-6">
            <Link
              href="/blogs"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All Blogs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
              {blog.category}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {new Date(blog.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {blog.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            By {blog.author}
          </p>

          {blog.coverImage && (
            <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          <div
            className="mt-10 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-a:text-ember"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />

          {blog.youtubeUrl && <YoutubeEmbed url={blog.youtubeUrl} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
