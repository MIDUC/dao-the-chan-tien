/**
 * Upload service interface
 * This interface allows switching between different upload providers
 * (Cloudinary, S3, Local Storage, etc.) without changing other modules
 */
export interface IUploadService {
  /**
   * Upload a file and return the URL
   * @param file File to upload
   * @param options Optional upload options (folder, transformations, etc.)
   * @returns Upload result with URL and metadata
   */
  uploadFile(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
    options?: UploadOptions,
  ): Promise<UploadResult>;
}

/**
 * Upload options
 */
export interface UploadOptions {
  folder?: string; // Folder path in storage
  publicId?: string; // Custom public ID for the file
  overwrite?: boolean; // Whether to overwrite existing file
  transformation?: Record<string, any>; // Image transformations (resize, crop, etc.)
}

/**
 * Upload result
 */
export interface UploadResult {
  url: string; // Public URL to access the file
  secureUrl?: string; // HTTPS URL (if different from url)
  publicId?: string; // Public ID for the file (used for deletion/updates)
  width?: number; // Image width (if applicable)
  height?: number; // Image height (if applicable)
  format?: string; // File format (jpg, png, etc.)
  bytes?: number; // File size in bytes
}

