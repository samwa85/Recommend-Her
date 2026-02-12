// ============================================================================
// FILE QUERIES - Single Source of Truth for File Operations
// ============================================================================

import {
  supabase,
  uploadFile,
  getSignedUrl,
  deleteFile as deleteStorageFile,
} from '../supabase/client';
import type { FileRecord, FileInput, FileUpdate } from '../types/db';
import type { QueryResult, ListResult } from '../utils/errors';
import { FileOwnerType, StorageBucket } from '../types/enums';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// FILE RECORD QUERIES
// ============================================================================

/**
 * Get file by ID
 * @param id - File ID
 * @returns File record or null
 */
export async function getFileById(
  id: string
): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

/**
 * Get files by owner
 * @param ownerType - Type of owner
 * @param ownerId - Owner ID
 * @returns List of files
 */
export async function getFilesByOwner(
  ownerType: FileOwnerType,
  ownerId: string
): Promise<ListResult<FileRecord>> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('owner_type', ownerType)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: (data as FileRecord[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<FileRecord[]>(error);
  }
}

/**
 * Get primary file for owner
 * @param ownerType - Type of owner
 * @param ownerId - Owner ID
 * @returns Primary file or null
 */
export async function getPrimaryFile(
  ownerType: FileOwnerType,
  ownerId: string
): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('owner_type', ownerType)
      .eq('owner_id', ownerId)
      .eq('is_primary', true)
      .single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

// ============================================================================
// FILE RECORD MUTATIONS
// ============================================================================

/**
 * Create file record
 * @param input - File metadata
 * @returns Created file record
 */
export async function createFileRecord(
  input: FileInput
): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await supabase
      .from('files')
      .insert({
        ...input,
        bucket: input.bucket || StorageBucket.FILES,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

/**
 * Update file record
 * @param id - File ID
 * @param updates - Fields to update
 * @returns Updated file record
 */
export async function updateFileRecord(
  id: string,
  updates: FileUpdate
): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

/**
 * Set file as primary
 * @param id - File ID to set as primary
 * @param ownerType - Owner type
 * @param ownerId - Owner ID
 * @returns Updated file
 */
export async function setFileAsPrimary(
  id: string,
  ownerType: FileOwnerType,
  ownerId: string
): Promise<QueryResult<FileRecord>> {
  try {
    // First, unset any existing primary files for this owner
    await supabase
      .from('files')
      .update({ is_primary: false })
      .eq('owner_type', ownerType)
      .eq('owner_id', ownerId)
      .eq('is_primary', true);

    // Then set this file as primary
    const { data, error } = await supabase
      .from('files')
      .update({ is_primary: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

/**
 * Delete file record
 * @param id - File ID
 * @returns True if deleted
 */
export async function deleteFileRecord(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.from('files').delete().eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

export interface UploadFileOptions {
  file: globalThis.File;
  ownerType: FileOwnerType;
  ownerId: string;
  folder?: string;
  setAsPrimary?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadFileResult {
  fileRecord: FileRecord | null;
  path: string;
  publicUrl: string | null;
  error: Error | null;
}

/**
 * Upload file and create metadata record
 * @param options - Upload options
 * @returns Upload result with file record
 *
 * @example
 * ```typescript
 * const result = await uploadAndCreateFile({
 *   file: cvFile,
 *   ownerType: 'talent',
 *   ownerId: talentId,
 *   folder: 'cv',
 *   setAsPrimary: true
 * });
 * ```
 */
export async function uploadAndCreateFile(
  options: UploadFileOptions
): Promise<UploadFileResult> {
  const {
    file,
    ownerType,
    ownerId,
    folder = 'attachments',
    setAsPrimary = false,
    metadata,
  } = options;

  try {
    // Generate path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${ownerType}/${ownerId}/${folder}/${timestamp}_${sanitizedFileName}`;

    // Upload to storage
    const uploadResult = await uploadFile({
      bucket: StorageBucket.FILES,
      path,
      file,
      metadata,
    });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    // If setting as primary, unset existing primary first
    if (setAsPrimary) {
      await supabase
        .from('files')
        .update({ is_primary: false })
        .eq('owner_type', ownerType)
        .eq('owner_id', ownerId)
        .eq('is_primary', true);
    }

    // Create file record
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        owner_type: ownerType,
        owner_id: ownerId,
        bucket: StorageBucket.FILES,
        path: uploadResult.path,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        public_url: uploadResult.publicUrl,
        is_primary: setAsPrimary,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      fileRecord: fileRecord as FileRecord,
      path: uploadResult.path,
      publicUrl: uploadResult.publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      fileRecord: null,
      path: '',
      publicUrl: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get download URL for file
 * Returns public URL if available, otherwise signed URL
 * @param fileId - File ID
 * @returns URL string or null
 */
export async function getFileDownloadUrl(
  fileId: string
): Promise<string | null> {
  try {
    // Get file record
    const { data: fileRecord, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error || !fileRecord) return null;

    const file = fileRecord as FileRecord;

    // If public URL exists, return it
    if (file.public_url) {
      return file.public_url;
    }

    // Otherwise get signed URL
    return await getSignedUrl(file.path, file.bucket);
  } catch (error) {
    console.error('Error getting file download URL:', error);
    return null;
  }
}

/**
 * Delete file (both storage and record)
 * @param fileId - File ID
 * @returns True if deleted
 */
export async function deleteFile(
  fileId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get file record
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;
    if (!fileRecord) throw new Error('File not found');

    const file = fileRecord as FileRecord;

    // Delete from storage
    const storageDeleted = await deleteStorageFile(file.path, file.bucket);
    if (!storageDeleted) {
      console.warn(
        'Failed to delete file from storage, but continuing to delete record'
      );
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// CV-SPECIFIC OPERATIONS
// ============================================================================

export interface UploadCVOptions {
  file: globalThis.File;
  talentId: string;
  replaceExisting?: boolean;
}

export interface UploadCVResult {
  fileId: string | null;
  path: string;
  publicUrl: string | null;
  error: Error | null;
}

/**
 * Upload CV for talent
 * Handles: upload to storage, create file record, update talent profile
 * @param options - Upload options
 * @returns Upload result
 *
 * @example
 * ```typescript
 * const result = await uploadTalentCV({
 *   file: cvFile,
 *   talentId: 'uuid-here',
 *   replaceExisting: true
 * });
 * ```
 */
export async function uploadTalentCV(
  options: UploadCVOptions
): Promise<UploadCVResult> {
  const { file, talentId, replaceExisting = true } = options;

  try {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Invalid file type. Only PDF and Word documents are allowed.'
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    // If replacing, delete existing CV
    if (replaceExisting) {
      const { data: existingFiles } = await supabase
        .from('files')
        .select('*')
        .eq('owner_type', FileOwnerType.TALENT)
        .eq('owner_id', talentId)
        .eq('is_primary', true);

      if (existingFiles && existingFiles.length > 0) {
        for (const existingFile of existingFiles) {
          await deleteFile(existingFile.id);
        }
      }
    }

    // Upload new file
    const uploadResult = await uploadAndCreateFile({
      file,
      ownerType: FileOwnerType.TALENT,
      ownerId: talentId,
      folder: 'cv',
      setAsPrimary: true,
    });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    if (!uploadResult.fileRecord) {
      throw new Error('Failed to create file record');
    }

    // Update talent profile with CV file ID
    const { error: updateError } = await supabase
      .from('talent_profiles')
      .update({ cv_file_id: uploadResult.fileRecord.id })
      .eq('id', talentId);

    if (updateError) throw updateError;

    return {
      fileId: uploadResult.fileRecord.id,
      path: uploadResult.path,
      publicUrl: uploadResult.publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      fileId: null,
      path: '',
      publicUrl: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get CV download URL for talent
 * @param talentId - Talent profile ID
 * @returns Download URL or null
 */
export async function getTalentCVUrl(talentId: string): Promise<string | null> {
  try {
    // Get talent with CV file
    const { data: talent, error } = await supabase
      .from('talent_profiles')
      .select('cv_file_id')
      .eq('id', talentId)
      .single();

    if (error || !talent?.cv_file_id) return null;

    // Get download URL
    return await getFileDownloadUrl(talent.cv_file_id);
  } catch (error) {
    console.error('Error getting CV URL:', error);
    return null;
  }
}

/**
 * Remove CV from talent profile
 * @param talentId - Talent profile ID
 * @returns True if removed
 */
export async function removeTalentCV(
  talentId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get current CV file ID
    const { data: talent, error: fetchError } = await supabase
      .from('talent_profiles')
      .select('cv_file_id')
      .eq('id', talentId)
      .single();

    if (fetchError) throw fetchError;

    if (talent?.cv_file_id) {
      // Delete file (storage + record)
      await deleteFile(talent.cv_file_id);
    }

    // Update talent profile to remove CV reference
    const { error: updateError } = await supabase
      .from('talent_profiles')
      .update({ cv_file_id: null })
      .eq('id', talentId);

    if (updateError) throw updateError;

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  // File records
  getFileById,
  getFilesByOwner,
  getPrimaryFile,
  createFileRecord,
  updateFileRecord,
  setFileAsPrimary,
  deleteFileRecord,

  // Storage operations
  uploadAndCreateFile,
  getFileDownloadUrl,
  deleteFile,

  // CV operations
  uploadTalentCV,
  getTalentCVUrl,
  removeTalentCV,
};
