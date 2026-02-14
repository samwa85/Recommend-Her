import { supabase } from './supabase';

// ============================================================================
// STORAGE BUCKET CONFIGURATION
// ============================================================================

export const BUCKETS = {
  TALENT_CV: 'talent-cvs',        // For talent CV uploads
  UPLOADS: 'uploads',             // General file uploads
  TALENT_IMAGES: 'talent-images', // Talent profile pictures
  SPONSOR_DOCUMENTS: 'sponsor-documents', // Private sponsor docs
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

// Maximum file sizes (in bytes) - 3MB for all buckets per user requirement
export const MAX_FILE_SIZES: Record<BucketName, number> = {
  [BUCKETS.TALENT_CV]: 3 * 1024 * 1024,        // 3MB
  [BUCKETS.UPLOADS]: 3 * 1024 * 1024,          // 3MB
  [BUCKETS.TALENT_IMAGES]: 3 * 1024 * 1024,    // 3MB
  [BUCKETS.SPONSOR_DOCUMENTS]: 3 * 1024 * 1024, // 3MB
};

// Allowed MIME types per bucket
export const ALLOWED_MIME_TYPES: Record<BucketName, string[]> = {
  [BUCKETS.TALENT_CV]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [BUCKETS.UPLOADS]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
  [BUCKETS.TALENT_IMAGES]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  [BUCKETS.SPONSOR_DOCUMENTS]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export interface UploadResult {
  url: string | null;
  error: Error | null;
  path: string | null;
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload a file to a storage bucket
 * @param bucket - The bucket to upload to
 * @param file - The file to upload
 * @param userId - The user ID for path organization
 * @param customFilename - Optional custom filename
 * @returns UploadResult with url, error, and path
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  userId: string,
  customFilename?: string
): Promise<UploadResult> {
  try {
    // Validate file size
    const maxSize = MAX_FILE_SIZES[bucket];
    if (file.size > maxSize) {
      throw new Error(
        `File size ${formatFileSize(file.size)} exceeds maximum allowed (${formatFileSize(maxSize)})`
      );
    }

    // Validate MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[bucket];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File type "${file.type}" is not allowed. Allowed: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
      );
    }

    // Generate file path: bucket/userId/timestamp-filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = customFilename || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      error: null,
      path: filePath,
    };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err : new Error('Unknown error during upload'),
      path: null,
    };
  }
}

/**
 * Upload a talent CV
 * @param file - The CV file
 * @param userId - The talent's user ID
 * @returns UploadResult
 */
export async function uploadTalentCV(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(BUCKETS.TALENT_CV, file, userId);
}

/**
 * Delete a file from storage
 * @param bucket - The bucket containing the file
 * @param path - The path to the file (relative to bucket)
 * @returns Error if deletion failed, null otherwise
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<Error | null> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(error.message);
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err : new Error('Unknown error during deletion');
  }
}

/**
 * Get a temporary signed URL for a private file
 * @param bucket - The bucket containing the file
 * @param path - The path to the file
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Signed URL or null if error
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(error.message);
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * List files in a bucket
 * @param bucket - The bucket to list
 * @param prefix - Optional path prefix to filter (e.g., userId/)
 * @param limit - Maximum number of files to return (default: 100)
 */
export async function listFiles(
  bucket: BucketName,
  prefix?: string,
  limit: number = 100
): Promise<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> }[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).filter(item => item.id); // Filter out folders
  } catch {
    return [];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "3.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file type is allowed for a bucket
 * @param bucket - The bucket to check
 * @param mimeType - The MIME type to validate
 * @returns True if allowed
 */
export function isFileTypeAllowed(bucket: BucketName, mimeType: string): boolean {
  return ALLOWED_MIME_TYPES[bucket].includes(mimeType);
}

/**
 * Get accepted file types string for input accept attribute
 * @param bucket - The bucket
 * @returns Comma-separated list of MIME types
 */
export function getAcceptedFileTypes(bucket: BucketName): string {
  return ALLOWED_MIME_TYPES[bucket].join(',');
}

/**
 * Get file extension from MIME type
 * @param mimeType - The MIME type
 * @returns The file extension
 */
export function getFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'text/plain': 'txt',
    'text/csv': 'csv',
  };
  return map[mimeType] || 'file';
}

/**
 * Validate a file before upload
 * @param file - The file to validate
 * @param bucket - The target bucket
 * @returns Object with valid flag and error message
 */
export function validateFile(
  file: File,
  bucket: BucketName
): { valid: boolean; error?: string } {
  // Check size
  if (file.size > MAX_FILE_SIZES[bucket]) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZES[bucket])}.`,
    };
  }

  // Check type
  if (!ALLOWED_MIME_TYPES[bucket].includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES[bucket].map(t => t.split('/')[1].toUpperCase()).join(', ')}.`,
    };
  }

  return { valid: true };
}
