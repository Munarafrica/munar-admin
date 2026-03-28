// Single Image Field Component
// A simple image uploader for website builder custom blocks
// Supports drag & drop, click to upload, and URL preview

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { websiteUploadService } from '../../services/website-upload.service';

export interface SingleImageFieldProps {
  /** Current image URL */
  value?: string;
  /** Callback when image changes */
  onChange: (url: string | undefined) => void;
  /** Event ID for upload (optional - if not provided, uses base64) */
  eventId?: string;
  /** Aspect ratio preset */
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the uploader */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Upload category for backend */
  category?: 'block' | 'logo' | 'gallery' | 'seo';
}

const ASPECT_CLASSES: Record<string, string> = {
  square: 'aspect-square',
  landscape: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: 'min-h-32',
};

export function SingleImageField({
  value,
  onChange,
  eventId,
  aspectRatio = 'landscape',
  maxSizeMB = 5,
  placeholder = 'Click or drag to upload image',
  disabled = false,
  className,
  category = 'block',
}: SingleImageFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setPreviewUrl(null);

      // Validate file
      const validationError = websiteUploadService.validateImage(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview
      const preview = websiteUploadService.createPreviewUrl(file);
      setPreviewUrl(preview);

      // If we have an eventId, upload to backend
      if (eventId) {
        setIsUploading(true);
        try {
          const result = await websiteUploadService.uploadImage(eventId, file, category);
          onChange(result.url);
          setPreviewUrl(null);
          websiteUploadService.revokePreviewUrl(preview);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed');
          setPreviewUrl(null);
          websiteUploadService.revokePreviewUrl(preview);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Fallback: convert to base64 for local storage
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
          setPreviewUrl(null);
          websiteUploadService.revokePreviewUrl(preview);
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setPreviewUrl(null);
          websiteUploadService.revokePreviewUrl(preview);
        };
        reader.readAsDataURL(file);
      }
    },
    [eventId, onChange, category]
  );

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Click handler
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    e.target.value = '';
  };

  // Remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setError(null);
    setPreviewUrl(null);
  };

  const displayUrl = previewUrl || value;

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
          ASPECT_CLASSES[aspectRatio],
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
          disabled && 'opacity-50 cursor-not-allowed',
          displayUrl && 'border-solid border-slate-200 dark:border-slate-700',
          isUploading && 'pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt="Uploaded"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Uploading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-medium">Uploading...</span>
                </div>
              </div>
            )}
            {/* Hover overlay */}
            {!isUploading && !disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClick}
                  className="px-3 py-2 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold hover:bg-white transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-9 h-9 rounded-lg bg-red-500/90 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-indigo-500 mb-2 animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Uploading...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                  {placeholder}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Max {maxSizeMB}MB · JPG, PNG, WebP
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Multi-image field for image grids
export interface MultiImageFieldProps {
  /** Current image URLs */
  values: string[];
  /** Callback when images change */
  onChange: (urls: string[]) => void;
  /** Event ID for upload */
  eventId?: string;
  /** Max number of images */
  maxImages?: number;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Disable the uploader */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function MultiImageField({
  values = [],
  onChange,
  eventId,
  maxImages = 6,
  maxSizeMB = 5,
  disabled = false,
  className,
}: MultiImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle files selection
  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      
      const remainingSlots = maxImages - values.length;
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      
      // Validate all files
      for (const file of filesToUpload) {
        const validationError = websiteUploadService.validateImage(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      if (eventId) {
        setIsUploading(true);
        try {
          const results = await websiteUploadService.uploadMultipleImages(eventId, filesToUpload);
          onChange([...values, ...results.map(r => r.url)]);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
          setIsUploading(false);
        }
      } else {
        // Fallback: convert to base64
        const newUrls: string[] = [];
        for (const file of filesToUpload) {
          const url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          newUrls.push(url);
        }
        onChange([...values, ...newUrls]);
      }
    },
    [eventId, values, onChange, maxImages]
  );

  const handleRemove = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Image grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {values.length < maxImages && !disabled && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add Images ({values.length}/{maxImages})
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
