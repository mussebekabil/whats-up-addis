const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'whats-up-addis-token';

export interface UploadResponse {
  message: string;
  url: string;
  publicId: string;
}

export const uploadService = {
  /**
   * Upload an image file
   * @param file - The image file to upload
   * @returns The uploaded image URL and public ID
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    if (typeof window === 'undefined') {
      throw new Error('Upload can only be performed in the browser');
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    return response.json();
  },

  /**
   * Delete an image
   * @param publicId - The Cloudinary public ID of the image
   */
  async deleteImage(publicId: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Delete can only be performed in the browser');
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const encodedPublicId = encodeURIComponent(publicId);

    const response = await fetch(
      `${API_URL}/api/upload/image/${encodedPublicId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }
  },

  /**
   * Upload a video file
   * @param file - The video file to upload
   * @returns The uploaded video URL and public ID
   */
  async uploadVideo(file: File): Promise<UploadResponse> {
    if (typeof window === 'undefined') {
      throw new Error('Upload can only be performed in the browser');
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Invalid file type. Only MP4, MPEG, MOV, AVI, and WebM videos are allowed.'
      );
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 50MB.');
    }

    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_URL}/api/upload/video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload video');
    }

    return response.json();
  },

  /**
   * Delete a video
   * @param publicId - The Cloudinary public ID of the video
   */
  async deleteVideo(publicId: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Delete can only be performed in the browser');
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const encodedPublicId = encodeURIComponent(publicId);

    const response = await fetch(
      `${API_URL}/api/upload/video/${encodedPublicId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete video');
    }
  },
};
