// Website Upload Service
// Handles image uploads for the website builder (custom blocks, logos, etc.)
// Uses signed direct-to-storage uploads

import { apiClient } from '../lib/api-client';
import { WebsiteAssetCategory, WebsiteAssetRef } from '../modules/website/types';

export interface WebsiteAssetUploadResponse {
  id: string;
  eventId: string;
  ownerId: string;
  category: WebsiteAssetCategory;
  storageProvider: string;
  bucket: string;
  objectKey: string;
  url: string;
  mimeType: string;
  originalFilename: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText?: string;
  status: 'PENDING' | 'READY' | 'FAILED' | 'DELETED';
  checksum?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string | null;
  deletedAt?: string | null;
}

export interface SignedUploadResponse {
  assetId: string;
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  headers?: Record<string, string>;
  expiresInSeconds?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

type UploadableWebsiteAssetCategory = WebsiteAssetCategory;

const CATEGORY_RULES: Record<WebsiteAssetCategory, { maxSize: number; validTypes: string[] }> = {
  hero: { maxSize: 10 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] },
  section: { maxSize: 8 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'] },
  logo: { maxSize: 4 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'] },
  gallery: { maxSize: 12 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] },
  seo: { maxSize: 5 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] },
  'custom-block': { maxSize: 8 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'] },
};

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

function getImageMimeType(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'jpg') return 'image/jpg';
  if (extension && MIME_TYPE_BY_EXTENSION[extension]) return MIME_TYPE_BY_EXTENSION[extension];

  const normalizedType = file.type === 'image/jpg' || file.type === 'image/pjpeg'
    ? 'image/jpeg'
    : file.type;

  if (normalizedType) return normalizedType;

  return '';
}

function shouldRetryLogoUploadAsSection(error: unknown, category: WebsiteAssetCategory, mimeType: string): boolean {
  if (category !== 'logo') return false;
  if (mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') return false;
  return error instanceof Error && error.message.toLowerCase().includes('unsupported file type');
}

function toAssetRef(asset: WebsiteAssetUploadResponse): WebsiteAssetRef {
  return {
    assetId: asset.id,
    url: asset.url,
    altText: asset.altText,
    width: asset.width,
    height: asset.height,
  };
}

function stripUrlSearch(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

async function canLoadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(false), 4000);

    img.onload = () => {
      window.clearTimeout(timer);
      resolve(true);
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };

    img.src = url;
  });
}

async function resolveDisplayUrl(candidates: Array<string | undefined | null>): Promise<string | undefined> {
  const normalized = Array.from(
    new Set(
      candidates
        .filter((value): value is string => Boolean(value))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  for (const candidate of normalized) {
    // eslint-disable-next-line no-await-in-loop
    const loadable = await canLoadImage(candidate);
    if (loadable) return candidate;
  }

  return normalized[0];
}

/**
 * Website Upload Service
 * Provides image upload functionality for the website builder
 */
export const websiteUploadService = {
  toAssetRef,
  /**
   * Upload a single image for website content (custom blocks, logos, etc.)
   * @param eventId - The event ID
   * @param file - The image file to upload
   * @param category - The category of the upload (e.g., 'block', 'logo', 'gallery')
   * @returns The upload response with the image URL
   */
  async uploadImage(
    eventId: string,
    file: File,
    category: WebsiteAssetCategory = 'custom-block',
    altText?: string,
  ): Promise<WebsiteAssetUploadResponse> {
    const mimeType = getImageMimeType(file);
    const validationError = this.validateImage(file, category);
    if (validationError) {
      throw new Error(validationError);
    }

    const { width, height } = await this.getImageDimensions(file).catch(() => ({ width: undefined, height: undefined }));

    let uploadCategory: UploadableWebsiteAssetCategory = category;
    let signed: SignedUploadResponse;

    try {
      signed = await apiClient.post<SignedUploadResponse>(
        `/events/${eventId}/website/assets/sign`,
        {
          filename: file.name,
          mimeType,
          sizeBytes: file.size,
          category: uploadCategory,
        }
      );
    } catch (error) {
      if (!shouldRetryLogoUploadAsSection(error, category, mimeType)) {
        throw error;
      }

      uploadCategory = 'section';
      signed = await apiClient.post<SignedUploadResponse>(
        `/events/${eventId}/website/assets/sign`,
        {
          filename: file.name,
          mimeType,
          sizeBytes: file.size,
          category: uploadCategory,
        }
      );
    }

    const uploadResponse = await fetch(signed.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        ...(signed.headers || {}),
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Storage upload failed with status ${uploadResponse.status}`);
    }

    const finalized = await apiClient.post<WebsiteAssetUploadResponse>(
      `/events/${eventId}/website/assets`,
      {
        assetId: signed.assetId,
        category: uploadCategory,
        url: signed.publicUrl,
        mimeType,
        sizeBytes: file.size,
        width,
        height,
        altText,
      }
    );

    const displayUrl = await resolveDisplayUrl([
      finalized.url,
      signed.publicUrl,
      stripUrlSearch(signed.uploadUrl),
    ]);

    return {
      ...finalized,
      url: displayUrl || finalized.url,
    };
  },

  /**
   * Upload multiple images (for image grid blocks)
   * @param eventId - The event ID
   * @param files - Array of image files
   * @param category - The category of the uploads
   * @returns Array of upload responses
   */
  async uploadMultipleImages(
    eventId: string,
    files: File[],
    category: WebsiteAssetCategory = 'gallery'
  ): Promise<WebsiteAssetUploadResponse[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(eventId, file, category)
    );
    return Promise.all(uploadPromises);
  },

  /**
   * Delete an uploaded image
   * @param eventId - The event ID
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(eventId: string, assetId: string, force = false): Promise<void> {
    const query = force ? '?force=true' : '';
    await apiClient.delete(`/events/${eventId}/website/assets/${assetId}${query}`);
  },

  async listAssets(
    eventId: string,
    params: Partial<{ category: WebsiteAssetCategory; status: 'PENDING' | 'READY' | 'FAILED' | 'DELETED'; cursor: string; limit: number; search: string }> = {},
  ): Promise<{ data: WebsiteAssetUploadResponse[]; nextCursor: string | null }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await apiClient.get<
      | { data: WebsiteAssetUploadResponse[]; nextCursor: string | null }
      | { data: { data: WebsiteAssetUploadResponse[]; nextCursor: string | null } }
    >(`/events/${eventId}/website/assets${suffix}`);

    const inner = Array.isArray((response as { data?: WebsiteAssetUploadResponse[] }).data)
      ? response as { data: WebsiteAssetUploadResponse[]; nextCursor: string | null }
      : (response as { data?: { data?: WebsiteAssetUploadResponse[]; nextCursor?: string | null } }).data;

    if (inner && Array.isArray((inner as { data?: WebsiteAssetUploadResponse[] }).data)) {
      return {
        data: (inner as { data: WebsiteAssetUploadResponse[] }).data,
        nextCursor: (inner as { nextCursor?: string | null }).nextCursor ?? null,
      };
    }

    return {
      data: Array.isArray((response as { data?: WebsiteAssetUploadResponse[] }).data)
        ? (response as { data: WebsiteAssetUploadResponse[] }).data
        : [],
      nextCursor: (response as { nextCursor?: string | null }).nextCursor ?? null,
    };
  },

  /**
   * Generate a preview URL for a local file (before upload)
   * Returns a temporary blob URL for preview purposes
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  },

  /**
   * Revoke a preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Validate an image file before upload
   * @returns An error message if invalid, or null if valid
   */
  validateImage(file: File, category: WebsiteAssetCategory = 'custom-block', validTypes = CATEGORY_RULES[category].validTypes): string | null {
    const rules = CATEGORY_RULES[category];
    const mimeType = getImageMimeType(file);
    if (!validTypes.includes(mimeType)) {
      return `Invalid file type for ${category} images.`;
    }

    if (file.size > rules.maxSize) {
      return `File size exceeds maximum allowed size for ${category} uploads.`;
    }

    if (file.size <= 0) return 'Selected file is empty.';

    return null;
  },

  /**
   * Get image dimensions from a file
   */
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = this.createPreviewUrl(file);
      
      img.onload = () => {
        this.revokePreviewUrl(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        this.revokePreviewUrl(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  },
};
