import * as React from 'react';
import { cn } from './utils';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from './button';

export interface ImageUploaderProps {
  value?: string;
  onChange: (imageData: string | undefined) => void;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  maxSizeMB?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  className,
  aspectRatio = 'square',
  maxSizeMB = 5,
  placeholder = 'Click to upload or drag and drop',
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
  };

  const handleFile = React.useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onChange(result);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  }, [maxSizeMB, onChange]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
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

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setError(null);
  };

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
          aspectRatioClasses[aspectRatio],
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
          disabled && 'opacity-50 cursor-not-allowed',
          value && 'border-solid border-slate-200 dark:border-slate-700'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {value ? (
          <>
            <img
              src={value}
              alt="Uploaded"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Change
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-3',
              isDragging
                ? 'bg-indigo-100 dark:bg-indigo-900/50'
                : 'bg-slate-100 dark:bg-slate-800'
            )}>
              <ImageIcon className={cn(
                'w-6 h-6',
                isDragging
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              )} />
            </div>
            <p className={cn(
              'text-sm font-medium mb-1',
              isDragging
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400'
            )}>
              {isDragging ? 'Drop image here' : placeholder}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              PNG, JPG up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
