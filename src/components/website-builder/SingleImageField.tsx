// Single Image Field Component
// A simple image uploader for website builder custom blocks
// Supports drag & drop, click to upload, and URL preview

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2, Images, Search, Trash2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { websiteUploadService, WebsiteAssetUploadResponse } from '../../services/website-upload.service';
import { WebsiteAssetCategory, WebsiteAssetRef } from '../../modules/website/types';
import { ApiException } from '../../types/api';

export interface SingleImageFieldProps {
  /** Current image URL */
  value?: string;
  /** Current asset ref */
  asset?: WebsiteAssetRef;
  /** Callback when image changes */
  onChange: (url: string | undefined) => void;
  /** Callback when uploaded asset ref changes */
  onAssetChange?: (asset: WebsiteAssetRef | undefined) => void;
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
  category?: WebsiteAssetCategory;
  /** Optional alt text to finalize with asset */
  altText?: string;
  /** Optional file picker accept value */
  accept?: string;
  /** Optional MIME types to allow before upload */
  acceptedMimeTypes?: string[];
  /** Optional display hint for supported formats */
  typeHint?: string;
  /** Optional explicit opener for a shared asset library modal */
  onOpenAssetLibrary?: (request: AssetLibraryRequestDetail) => void;
}

const ASPECT_CLASSES: Record<string, string> = {
  square: 'aspect-square',
  landscape: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: 'min-h-32',
};

export interface AssetLibraryRequestDetail {
  eventId: string;
  category: WebsiteAssetCategory;
  onSelect: (asset: WebsiteAssetUploadResponse) => void;
}

let openAssetLibraryImpl: ((request: AssetLibraryRequestDetail) => void) | null = null;

export function openAssetLibrary(request: AssetLibraryRequestDetail) {
  openAssetLibraryImpl?.(request);
}

interface AssetPickerModalProps {
  eventId: string;
  category: WebsiteAssetCategory;
  onSelect: (asset: WebsiteAssetUploadResponse) => void;
  onClose: () => void;
}

function AssetPickerModal({ eventId, category, onSelect, onClose }: AssetPickerModalProps) {
  const [assets, setAssets] = useState<WebsiteAssetUploadResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    websiteUploadService
      .listAssets(eventId, { category, status: 'READY', limit: 50 })
      .then((result) => {
        if (!isMounted) return;
        setAssets(result.data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load assets');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, category]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const filteredAssets = assets.filter((asset) =>
    !search.trim() || asset.originalFilename.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (asset: WebsiteAssetUploadResponse) => {
    const shouldDelete = window.confirm(`Delete "${asset.originalFilename}" from this event asset library?`);
    if (!shouldDelete) return;

    setDeletingAssetId(asset.id);
    setError(null);

    try {
      await websiteUploadService.deleteImage(eventId, asset.id);
      setAssets((prev) => prev.filter((item) => item.id !== asset.id));
    } catch (err) {
      if (err instanceof ApiException && err.statusCode === 409) {
        const shouldForceDelete = window.confirm(
          'This asset is still referenced in website content. Force delete it anyway?'
        );
        if (!shouldForceDelete) {
          setDeletingAssetId(null);
          return;
        }

        try {
          await websiteUploadService.deleteImage(eventId, asset.id, true);
          setAssets((prev) => prev.filter((item) => item.id !== asset.id));
        } catch (forceErr) {
          setError(forceErr instanceof Error ? forceErr.message : 'Failed to delete asset');
        } finally {
          setDeletingAssetId(null);
        }
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    } finally {
      setDeletingAssetId(null);
    }
  };

  const content = (
    <div
      className="relative isolate flex h-[78vh] min-h-[78vh] max-h-[78vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-[#233557] bg-[#091220] shadow-[0_32px_100px_rgba(2,6,23,0.8)]"
      style={{ backgroundColor: '#091220' }}
      onClick={(event) => event.stopPropagation()}
    >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(9,18,32,0)_16%),radial-gradient(circle_at_top_right,rgba(79,70,229,0.14),transparent_24%)]" />
        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-[#223250] bg-[#0e1930] px-6 py-6 sm:px-7">
          <div className="py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300/80">Media</p>
            <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Asset Library</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300/80">
              Reuse previously uploaded {category.replace('-', ' ')} images for this event.
            </p>
          </div>
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-[#293c60] bg-[#13213c] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-[#385488] hover:bg-[#172844] hover:text-white"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>

        <div className="relative shrink-0 border-b border-[#223250] bg-[#0c172b] px-6 py-4 sm:px-7">
          <label className="flex items-center gap-3 rounded-xl border border-[#273958] bg-[#101b31] px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by filename"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#091220] px-6 py-6 sm:px-7">
          {isLoading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Loading assets...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              <Images className="h-8 w-8 text-slate-600" />
              <p className="text-sm font-medium text-slate-200">No uploaded assets yet</p>
              <p className="max-w-sm text-xs text-slate-400">
                Upload an image first, then you can reuse it from the asset library.
              </p>
            </div>
          ) : (
            <div className="rounded-[20px] border border-[#18253f] bg-[#0b1424] p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group overflow-hidden rounded-[18px] border border-[#273958] bg-[#111c31] text-left transition hover:-translate-y-0.5 hover:border-indigo-400/45 hover:bg-[#14213a]"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(asset)}
                    className="block w-full overflow-hidden text-left"
                  >
                    <div className="h-32 border-b border-[#223250] bg-[#0b1528] bg-[linear-gradient(45deg,rgba(148,163,184,0.08)_25%,transparent_25%,transparent_50%,rgba(148,163,184,0.08)_50%,rgba(148,163,184,0.08)_75%,transparent_75%,transparent)] bg-[length:18px_18px] p-3">
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.originalFilename}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  </button>
                  <div className="min-w-0 px-3.5 pb-3.5 pt-3">
                    <div className="space-y-3 rounded-[14px] bg-[#0d1729] px-3 py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[13px] font-semibold text-white">{asset.originalFilename}</p>
                        <span className="shrink-0 rounded-full border border-[#2a3d5f] bg-[#16233f] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-300">
                          {category}
                        </span>
                        </div>
                        <p className="text-[10px] leading-5 text-slate-400">
                          {[asset.width && asset.height ? `${asset.width}x${asset.height}` : null, `${Math.round(asset.sizeBytes / 1024)} KB`].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {asset.altText ? (
                        <p className="line-clamp-2 rounded-xl border border-[#273958] bg-[#162238] px-2.5 py-2 text-[10px] leading-5 text-slate-300">
                          Alt: {asset.altText}
                        </p>
                      ) : (
                        <p className="rounded-xl border border-dashed border-[#273958] bg-[#0f192d] px-2.5 py-2 text-[10px] leading-5 text-slate-500">
                          No alt text yet
                        </p>
                      )}
                      <div className="pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelect(asset)}
                            className="inline-flex h-7 flex-1 items-center justify-center rounded-lg bg-indigo-500 px-2 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(99,102,241,0.22)] transition hover:bg-indigo-400"
                          >
                            Use Image
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(asset);
                            }}
                            disabled={deletingAssetId === asset.id}
                            className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-[#2a3d5f] bg-[#162238] px-2 text-[10px] font-semibold text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingAssetId === asset.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex shrink-0 items-center justify-between gap-4 border-t border-[#223250] bg-[#0e1930] px-6 py-4 sm:px-7">
          <p className="text-xs text-slate-400">
            Press <span className="font-semibold text-slate-200">Esc</span> or use the close button to exit the library.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-[#293c60] bg-[#13213c] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-[#385488] hover:bg-[#172844] hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[rgba(5,10,18,0.72)] p-3 sm:p-5 backdrop-blur-md"
      onClick={onClose}
    >
      {content}
    </div>
  );
}

export function AssetLibraryHost({
  request,
  onClose,
}: {
  request: AssetLibraryRequestDetail | null;
  onClose: () => void;
}) {
  if (!request) return null;
  return (
    <AssetPickerModal
      eventId={request.eventId}
      category={request.category}
      onClose={onClose}
      onSelect={(asset) => {
        request.onSelect(asset);
        onClose();
      }}
    />
  );
}

export function SingleImageField({
  value,
  asset,
  onChange,
  onAssetChange,
  eventId,
  aspectRatio = 'landscape',
  maxSizeMB = 5,
  placeholder = 'Click or drag to upload image',
  disabled = false,
  className,
  category = 'custom-block',
  altText,
  accept = 'image/*',
  acceptedMimeTypes,
  typeHint: typeHintProp,
  onOpenAssetLibrary,
}: SingleImageFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altTextDraft, setAltTextDraft] = useState(asset?.altText || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typeHint = typeHintProp || (category === 'logo' || category === 'section' || category === 'custom-block'
    ? 'JPG, PNG, WebP, SVG'
    : 'JPG, PNG, WebP');

  useEffect(() => {
    setAltTextDraft(asset?.altText || '');
  }, [asset?.assetId, asset?.altText]);

  // Handle file selection
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setPreviewUrl(null);

      // Validate file
      const validationError = websiteUploadService.validateImage(file, category, acceptedMimeTypes);
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
          const result = await websiteUploadService.uploadImage(eventId, file, category, altText || altTextDraft);
          onChange(result.url);
          onAssetChange?.(websiteUploadService.toAssetRef(result));
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
          onAssetChange?.(undefined);
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
    [acceptedMimeTypes, altText, altTextDraft, category, eventId, onAssetChange, onChange]
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
    onAssetChange?.(undefined);
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
          accept={accept}
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
                  Max {maxSizeMB}MB · {typeHint}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {eventId && !disabled ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!eventId) return;
            const request: AssetLibraryRequestDetail = {
              eventId,
              category,
              onSelect: (selectedAsset) => {
                onChange(selectedAsset.url);
                onAssetChange?.(websiteUploadService.toAssetRef(selectedAsset));
              },
            };
            if (onOpenAssetLibrary) {
              onOpenAssetLibrary(request);
            } else {
              openAssetLibrary(request);
            }
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
        >
          <Images className="h-3.5 w-3.5" />
          Choose From Library
        </button>
      ) : null}

      {asset?.assetId ? (
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Alt Text
          </label>
          <input
            type="text"
            value={altTextDraft}
            onChange={(event) => {
              const nextAltText = event.target.value;
              setAltTextDraft(nextAltText);
              onAssetChange?.({
                ...asset,
                altText: nextAltText || undefined,
              });
            }}
            placeholder="Describe this image"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            This updates the alt text for this website usage of the image.
          </p>
        </div>
      ) : null}

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
  /** Upload category */
  category?: WebsiteAssetCategory;
}

export function MultiImageField({
  values = [],
  onChange,
  eventId,
  maxImages = 6,
  maxSizeMB = 5,
  disabled = false,
  className,
  category = 'gallery',
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
        const validationError = websiteUploadService.validateImage(file, category);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      if (eventId) {
        setIsUploading(true);
        try {
          const results = await websiteUploadService.uploadMultipleImages(eventId, filesToUpload, category);
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
