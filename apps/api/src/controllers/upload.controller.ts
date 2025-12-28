import { Request, Response } from 'express';
import { cloudinaryService } from '../services/cloudinary.service.js';

export class UploadController {
  /**
   * Upload a single image
   * POST /api/upload/image
   */
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('File details:', {
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      });

      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error:
            'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large. Maximum size is 5MB.',
        });
      }

      console.log('Uploading to Cloudinary...');
      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(
        req.file.buffer,
        'events'
      );
      console.log('Upload successful:', result.url);

      res.status(200).json({
        message: 'Image uploaded successfully',
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload image';
      res.status(500).json({
        error: 'Failed to upload image',
        details: errorMessage,
      });
    }
  }

  /**
   * Delete an image
   * DELETE /api/upload/image/:publicId
   */
  async deleteImage(req: Request, res: Response) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({ error: 'Public ID is required' });
      }

      // Decode the public ID (it might be URL encoded)
      const decodedPublicId = decodeURIComponent(publicId);

      await cloudinaryService.deleteImage(decodedPublicId);

      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }

  /**
   * Upload a single video
   * POST /api/upload/video
   */
  async uploadVideo(req: Request, res: Response) {
    try {
      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('File details:', {
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      });

      // Validate file type
      const allowedMimeTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error:
            'Invalid file type. Only MP4, MPEG, MOV, AVI, and WebM videos are allowed.',
        });
      }

      // Validate file size (max 50MB for videos)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large. Maximum size is 50MB.',
        });
      }

      console.log('Uploading video to Cloudinary...');
      // Upload to Cloudinary
      const result = await cloudinaryService.uploadVideo(
        req.file.buffer,
        'events'
      );
      console.log('Upload successful:', result.url);

      res.status(200).json({
        message: 'Video uploaded successfully',
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload video';
      res.status(500).json({
        error: 'Failed to upload video',
        details: errorMessage,
      });
    }
  }

  /**
   * Delete a video
   * DELETE /api/upload/video/:publicId
   */
  async deleteVideo(req: Request, res: Response) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({ error: 'Public ID is required' });
      }

      // Decode the public ID (it might be URL encoded)
      const decodedPublicId = decodeURIComponent(publicId);

      await cloudinaryService.deleteVideo(decodedPublicId);

      res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  }
}

export const uploadController = new UploadController();
