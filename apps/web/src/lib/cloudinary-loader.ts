const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderParams): string {
  // If Cloudinary is not configured, return the original URL unmodified
  if (!CLOUD_NAME) return src;

  // Already a Cloudinary URL — just apply transformations
  if (src.includes('res.cloudinary.com')) {
    return src
      .replace(
        /\/upload\//,
        `/upload/w_${width},q_${quality ?? 'auto'},f_auto/`,
      )
      .replace(/\/upload\/.*?\/upload\//, '/upload/');
  }

  // External URL — proxy through Cloudinary fetch
  const encoded = encodeURIComponent(src);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_${width},q_${quality ?? 'auto'},f_auto/${encoded}`;
}
