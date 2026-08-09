#!/usr/bin/env node

/**
 * Upload place images to Cloudinary
 * Usage: npx ts-node apps/web/scripts/upload-place-images.ts
 *        or: pnpm -F web ts-node scripts/upload-place-images.ts
 */

// Corporate SSL proxy intercepts HTTPS — bypass cert verification for this script only
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// __dirname = apps/web/scripts/, so root is three levels up
const REPO_ROOT = path.resolve(__dirname, '../../..');

// Load environment variables
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PLACES_DIR = path.resolve(__dirname, '../content/places');
const CLOUDINARY_DOMAIN = 'res.cloudinary.com';

interface PlaceFrontmatter {
  name: string;
  slug: string;
  categorySlug: string;
  address?: string;
  openingHours?: string;
  contactInfo?: string;
  imageUrls?: string[];
  [key: string]: any;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToCloudinary(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const dataUri = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'whats-up-addis/places',
    resource_type: 'image',
    public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}

function isCloudinaryUrl(url: string): boolean {
  return url.includes(CLOUDINARY_DOMAIN);
}

async function processFile(filePath: string): Promise<void> {
  console.log(`Processing: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: body } = matter(content);
  const typedFrontmatter = frontmatter as PlaceFrontmatter;

  if (!typedFrontmatter.imageUrls || typedFrontmatter.imageUrls.length === 0) {
    console.log(`  No imageUrls found, skipping`);
    return;
  }

  let modified = false;
  const updatedImageUrls: string[] = [];

  for (const imageUrl of typedFrontmatter.imageUrls) {
    if (isCloudinaryUrl(imageUrl)) {
      console.log(`  ✓ Already Cloudinary URL: ${imageUrl}`);
      updatedImageUrls.push(imageUrl);
    } else {
      try {
        console.log(`  Downloading: ${imageUrl}`);
        const imageBuffer = await downloadImage(imageUrl);

        const fileName = `${typedFrontmatter.slug}-${Date.now()}`;
        console.log(`  Uploading to Cloudinary as: ${fileName}`);
        const newUrl = await uploadToCloudinary(imageBuffer, fileName);

        console.log(`  ✓ Uploaded: ${newUrl}`);
        updatedImageUrls.push(newUrl);
        modified = true;
      } catch (error) {
        console.error(
          `  ✗ Failed to process image: ${error instanceof Error ? error.message : String(error)}`
        );
        updatedImageUrls.push(imageUrl); // Keep original on error
      }
    }
  }

  if (modified) {
    typedFrontmatter.imageUrls = updatedImageUrls;
    const updatedContent = matter.stringify(body, typedFrontmatter);
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`  Saved updated file`);
  }
}

async function findAndProcessFiles(): Promise<void> {
  async function walkDir(dir: string): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await walkDir(filePath);
      } else if (file.endsWith('.md')) {
        await processFile(filePath);
      }
    }
  }

  if (!fs.existsSync(PLACES_DIR)) {
    console.error(`Places directory not found: ${PLACES_DIR}`);
    process.exit(1);
  }

  await walkDir(PLACES_DIR);
}

async function main(): Promise<void> {
  console.log('Starting place image upload...\n');

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error(
      'Error: CLOUDINARY_CLOUD_NAME environment variable is not set'
    );
    process.exit(1);
  }

  await findAndProcessFiles();

  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
