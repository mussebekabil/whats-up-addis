import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

const BLOGS_DIR = path.join(process.cwd(), 'content/blogs');

export interface BlogFrontmatter {
  title: string;
  slug: string;
  date: string; // ISO date string e.g. "2026-08-27"
  author: string;
  category: string;
  excerpt: string;
  coverImage?: string;
  youtubeUrl?: string;
}

export interface BlogContent extends BlogFrontmatter {
  contentHtml: string;
}

export async function getBlogContent(
  slug: string
): Promise<BlogContent | null> {
  // Guard against path traversal attacks
  if (
    !slug ||
    slug.includes('..') ||
    slug.includes('/') ||
    path.isAbsolute(slug)
  ) {
    return null;
  }

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    title: data.title ?? '',
    slug: data.slug ?? slug,
    date: data.date ?? '',
    author: data.author ?? '',
    category: data.category ?? '',
    excerpt: data.excerpt ?? '',
    coverImage: data.coverImage ?? undefined,
    youtubeUrl: data.youtubeUrl ?? undefined,
    contentHtml,
  };
}

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(BLOGS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOGS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllBlogs(): BlogFrontmatter[] {
  const slugs = getAllBlogSlugs();

  if (slugs.length === 0) {
    return [];
  }

  const blogs: BlogFrontmatter[] = slugs
    .map((slug) => {
      const filePath = path.join(BLOGS_DIR, `${slug}.md`);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      return {
        title: data.title ?? '',
        slug: slug,
        date: data.date ?? '',
        author: data.author ?? '',
        category: data.category ?? '',
        excerpt: data.excerpt ?? '',
        coverImage: data.coverImage ?? undefined,
        youtubeUrl: data.youtubeUrl ?? undefined,
      };
    })
    .sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return blogs;
}
