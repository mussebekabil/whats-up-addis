'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadService } from '@/lib/upload';

const INPUT_CLASS =
  'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';
const LABEL_CLASS =
  'mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
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
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadService.uploadImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setImageUrl(result.url);
      onImageUploaded(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setError('');
    if (onImageRemoved) {
      onImageRemoved();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    onImageUploaded(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={LABEL_CLASS}>Image</span>
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {isUploading ? 'Uploading…' : 'Upload Image'}
        </button>
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
          Max 5MB · JPEG, PNG, WebP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
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
        <label htmlFor="imageUrlInput" className={LABEL_CLASS}>
          Image URL
        </label>
        <input
          type="url"
          id="imageUrlInput"
          value={imageUrl}
          onChange={handleUrlChange}
          disabled={isUploading}
          className={INPUT_CLASS}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {imageUrl && !isUploading && (
        <div className="space-y-2">
          <span className={LABEL_CLASS}>Preview</span>
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="font-mono text-[10px] uppercase tracking-widest text-destructive transition-opacity hover:opacity-70"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}
