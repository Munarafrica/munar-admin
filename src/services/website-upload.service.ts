// Website Upload Service
// Handles image uploads for the website builder (custom blocks, logos, etc.)
// Uses real backend integration with apiClient

import { apiClient } from '../lib/api-client';

export interface UploadResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Website Upload Service
 * Provides image upload functionality for the website builder
 */
export const websiteUploadService = {
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
    category: 'block' | 'logo' | 'gallery' | 'seo' = 'block'
  ): Promise<UploadResponse> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG).');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit. Please upload a smaller image.');
    }

    // Upload to backend
    const response = await apiClient.upload<{ data: UploadResponse }>(
      `/events/${eventId}/website/upload`,
      file,
      { category }
    );

    return response.data;
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
    category: 'block' | 'gallery' = 'block'
  ): Promise<UploadResponse[]> {
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
  async deleteImage(eventId: string, publicId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/website/upload/${publicId}`);
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
  validateImage(file: File): string | null {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG).';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit.';
    }

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
