'use client';

import { useState, useRef } from 'react';
import { uploadService } from '@/lib/upload';

const INPUT_CLASS =
  'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';
const LABEL_CLASS =
  'mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground';

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
      <div>
        <span className={LABEL_CLASS}>Video</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ember px-5 font-mono text-[11px] uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {isUploading ? 'Uploading…' : 'Upload Video'}
        </button>
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
          Max 50MB · MP4, MOV, WebM
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {isUploading && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-ember transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            or URL
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="videoUrlInput" className={LABEL_CLASS}>
          Video URL
        </label>
        <input
          type="url"
          id="videoUrlInput"
          value={videoUrl}
          onChange={handleUrlChange}
          disabled={isUploading}
          className={INPUT_CLASS}
          placeholder="https://example.com/video.mp4"
        />
      </div>

      {videoUrl && !isUploading && (
        <div className="space-y-2">
          <span className={LABEL_CLASS}>Preview</span>
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <video
              src={videoUrl}
              controls
              className="w-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <button
            type="button"
            onClick={handleRemoveVideo}
            className="font-mono text-[10px] uppercase tracking-widest text-destructive transition-opacity hover:opacity-70"
          >
            Remove Video
          </button>
        </div>
      )}
    </div>
  );
}
