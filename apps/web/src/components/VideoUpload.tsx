'use client';

import { useState, useRef } from 'react';
import { uploadService } from '@/lib/upload';

interface VideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  onVideoRemoved?: () => void;
}

export default function VideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  onVideoRemoved,
}: VideoUploadProps) {
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const result = await uploadService.uploadVideo(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setVideoUrl(result.url);
      onVideoUploaded(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setError('');
    if (onVideoRemoved) {
      onVideoRemoved();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    onVideoUploaded(url);
  };

  return (
    <div className="space-y-4">
      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Video
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Max 50MB (MP4, MOV, AVI, WebM)
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or enter URL
          </span>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label
          htmlFor="videoUrlInput"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Video URL
        </label>
        <input
          type="url"
          id="videoUrlInput"
          value={videoUrl}
          onChange={handleUrlChange}
          disabled={isUploading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          placeholder="https://example.com/video.mp4"
        />
      </div>

      {/* Video Preview */}
      {videoUrl && !isUploading && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </label>
          <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto max-h-96"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <button
            type="button"
            onClick={handleRemoveVideo}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Remove Video
          </button>
        </div>
      )}
    </div>
  );
}
