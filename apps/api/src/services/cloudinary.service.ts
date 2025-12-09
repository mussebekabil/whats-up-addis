import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {
  init() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload an image to Cloudinary
   * @param file - Buffer or file path
   * @param folder - Folder name in Cloudinary (e.g., 'events')
   * @returns Cloudinary upload result with secure_url
   */
  async uploadImage(
    file: Buffer | string,
    folder: string = 'events'
  ): Promise<{ url: string; publicId: string }> {
    try {
      this.init(); // Initialize Cloudinary
      const result = await cloudinary.uploader.upload(
        Buffer.isBuffer(file)
          ? `data:image/jpeg;base64,${file.toString('base64')}`
          : file,
        {
          folder: `whats-up-addis/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Limit max dimensions
            { quality: 'auto' }, // Auto quality optimization
            { fetch_format: 'auto' }, // Auto format (WebP when supported)
          ],
        }
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      if (error instanceof Error) {
        throw new Error(`Cloudinary error: ${error.message}`);
      }
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  /**
   * Generate a thumbnail URL from an existing image
   * @param imageUrl - Original image URL
   * @param width - Thumbnail width
   * @param height - Thumbnail height
   */
  generateThumbnail(
    imageUrl: string,
    width: number = 300,
    height: number = 200
  ): string {
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');

    if (uploadIndex === -1) return imageUrl;

    // Insert transformation parameters
    urlParts.splice(uploadIndex + 1, 0, `w_${width},h_${height},c_fill`);

    return urlParts.join('/');
  }
}

export const cloudinaryService = new CloudinaryService();
