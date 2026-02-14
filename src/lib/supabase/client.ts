// ============================================================================
// DATABASE CLIENT - Using InsForge Backend
// ============================================================================

// Re-export InsForge client as supabase for backwards compatibility
// The InsForge SDK provides the same query API as Supabase
export { insforge as supabase, db, getInsforgeClient, uploadFile, uploadFileAuto, deleteFile, downloadFile, getPublicUrl } from '../insforge/client';
export type { UploadFileOptions, UploadResult } from '../insforge/client';

// Type for the database client
import type { InsForgeClient } from '@insforge/sdk';
export type SupabaseClient = InsForgeClient;