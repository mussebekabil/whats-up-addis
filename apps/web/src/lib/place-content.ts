import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

const PLACES_DIR = path.join(process.cwd(), 'content/places');

export interface PlaceFrontmatter {
  name: string;
  slug: string;
  categorySlug: string;
  address: string;
  openingHours: string;
  contactInfo: string;
  imageUrls: string[];
}

export interface PlaceContent extends PlaceFrontmatter {
  contentHtml: string;
}

export async function getPlaceContent(
  slug: string
): Promise<PlaceContent | null> {
  // Guard against path traversal attacks
  if (
    !slug ||
    slug.includes('..') ||
    slug.includes('/') ||
    path.isAbsolute(slug)
  ) {
    return null;
  }

  // Search all categorySlug subdirectories for a file named [slug].md
  if (!fs.existsSync(PLACES_DIR)) {
    return null;
  }

  const categoryDirs = fs
    .readdirSync(PLACES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const categorySlug of categoryDirs) {
    const filePath = path.join(PLACES_DIR, categorySlug, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(content);

      const contentHtml = processedContent.toString();

      return {
        name: data.name ?? '',
        slug: data.slug ?? slug,
        categorySlug: data.categorySlug ?? categorySlug,
        address: data.address ?? '',
        openingHours: data.openingHours ?? '',
        contactInfo: data.contactInfo ?? '',
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
        contentHtml,
      };
    }
  }

  return null;
}

export function getAllPlaceSlugs(): string[] {
  if (!fs.existsSync(PLACES_DIR)) {
    return [];
  }

  const slugs: string[] = [];

  const categoryDirs = fs
    .readdirSync(PLACES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const categorySlug of categoryDirs) {
    const categoryPath = path.join(PLACES_DIR, categorySlug);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      slugs.push(file.replace(/\.md$/, ''));
    }
  }

  return slugs;
}
