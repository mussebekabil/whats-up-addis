import { v2 as cloudinary } from 'cloudinary';

export class ImageUploadService {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration is missing');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    resourceType: 'image' | 'video' | 'auto' = 'auto'
  ): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: this.generateFolder('telegram'),
            public_id: filename,
            resource_type: resourceType,
            transformation:
              resourceType === 'video'
                ? [
                    { width: 1920, height: 1080, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                  ]
                : [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                  ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload failed with no result'));
            }
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error('Failed to upload image from buffer:', error);
      throw error;
    }
  }

  async uploadFromUrl(url: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: this.generateFolder('telegram'),
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });

      return result.secure_url;
    } catch (error) {
      console.error('Failed to upload image from URL:', error);
      throw error;
    }
  }

  private generateFolder(source: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `whats-up-addis/events/${source}/${year}/${month}`;
  }
}
