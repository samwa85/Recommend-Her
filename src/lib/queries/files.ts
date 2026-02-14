// ============================================================================
// FILES QUERIES - File management using InsForge Storage
// ============================================================================

import { db, uploadFile as insforgeUpload, deleteFile as insforgeDelete, downloadFile as insforgeDownload, getPublicUrl } from '../insforge/client';
import type { QueryResult, ListResult } from '../utils/errors';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// TYPES
// ============================================================================

export interface FileRecord {
  id: string;
  owner_type: 'talent' | 'sponsor' | 'request' | 'message';
  owner_id: string;
  bucket: string;
  path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  public_url: string | null;
  is_primary: boolean;
  created_at: string;
}

// ============================================================================
// LIST QUERIES
// ============================================================================

export interface ListFilesOptions {
  ownerType?: 'talent' | 'sponsor' | 'request' | 'message';
  ownerId?: string;
  limit?: number;
}

export async function listFiles(options: ListFilesOptions = {}): Promise<ListResult<FileRecord>> {
  const { ownerType, ownerId, limit = 100 } = options;

  try {
    let query = db.from('files').select('*', { count: 'exact' });

    if (ownerType) {
      query = query.eq('owner_type', ownerType);
    }

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data, error, count } = await query;

    if (error) throw error;

    return { data: (data as FileRecord[]) || [], count: count || 0, error: null };
  } catch (error) {
    return handleQueryError<FileRecord[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

export async function getFileById(id: string): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await db.from('files').select('*').eq('id', id).single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

export async function getPrimaryFile(ownerType: string, ownerId: string): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await db
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
// MUTATION QUERIES
// ============================================================================

export interface CreateFileInput {
  owner_type: 'talent' | 'sponsor' | 'request' | 'message';
  owner_id: string;
  bucket?: string;
  path: string;
  file_name: string;
  mime_type?: string;
  file_size?: number;
  public_url?: string;
  is_primary?: boolean;
}

export async function createFileRecord(input: CreateFileInput): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await db
      .from('files')
      .insert([{
        ...input,
        bucket: input.bucket || 'recommendher-files',
        is_primary: input.is_primary || false,
      }])
      .select()
      .single();

    if (error) throw error;

    return { data: data as FileRecord, error: null };
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

export async function updateFileRecord(id: string, updates: Partial<FileRecord>): Promise<QueryResult<FileRecord>> {
  try {
    const { data, error } = await db
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

export async function deleteFileRecord(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // First get the file record to get the storage path
    const { data: fileRecord, error: fetchError } = await db
      .from('files')
      .select('bucket, path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage if we have the path
    if (fileRecord?.path && fileRecord?.bucket) {
      await insforgeDelete(fileRecord.path, fileRecord.bucket);
    }

    // Delete the database record
    const { error } = await db.from('files').delete().eq('id', id);

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
// UPLOAD HELPERS
// ============================================================================

export interface UploadCVOptions {
  file: globalThis.File;
  talentId: string;
  isPrimary?: boolean;
}

export async function uploadTalentCV(options: UploadCVOptions): Promise<QueryResult<FileRecord>> {
  const { file, talentId, isPrimary = true } = options;

  try {
    // Generate path
    const timestamp = Date.now();
    const path = `talent/${talentId}/cv/${timestamp}_${file.name}`;

    // Upload to storage
    const uploadResult = await insforgeUpload({
      bucket: 'recommendher-files',
      path,
      file,
    });

    if (uploadResult.error) throw uploadResult.error;

    // Create database record
    const fileRecord = await createFileRecord({
      owner_type: 'talent',
      owner_id: talentId,
      bucket: 'recommendher-files',
      path: uploadResult.key,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      public_url: uploadResult.url,
      is_primary: isPrimary,
    });

    return fileRecord;
  } catch (error) {
    return handleSingleQueryError<FileRecord>(error);
  }
}

export async function downloadFileRecord(fileId: string): Promise<{ data: Blob | null; error: Error | null }> {
  try {
    // Get file record
    const { data: fileRecord, error: fetchError } = await getFileById(fileId);

    if (fetchError || !fileRecord) {
      throw fetchError || new Error('File not found');
    }

    // Download from storage
    const blob = await insforgeDownload(fileRecord.path, fileRecord.bucket);

    return { data: blob, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function getFileUrl(fileId: string): Promise<{ url: string | null; error: Error | null }> {
  try {
    const { data: fileRecord, error: fetchError } = await getFileById(fileId);

    if (fetchError || !fileRecord) {
      throw fetchError || new Error('File not found');
    }

    // Return public URL or generate one
    const url = fileRecord.public_url || getPublicUrl(fileRecord.bucket, fileRecord.path);

    return { url, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get CV URL for a talent profile
 * @param talentId - Talent profile ID
 * @returns CV URL or null
 */
export async function getTalentCVUrl(talentId: string): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Get the primary CV file for this talent
    const { data: fileRecord, error: fetchError } = await getPrimaryFile('talent', talentId);

    if (fetchError || !fileRecord) {
      return { url: null, error: null }; // No CV found, but not an error
    }

    const url = fileRecord.public_url || getPublicUrl(fileRecord.bucket, fileRecord.path);

    return { url, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  listFiles,
  getFileById,
  getPrimaryFile,
  createFileRecord,
  updateFileRecord,
  deleteFileRecord,
  uploadTalentCV,
  downloadFileRecord,
  getFileUrl,
};