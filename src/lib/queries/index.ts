// ============================================================================
// QUERIES - Barrel Export
// Centralized data access layer for Supabase
// ============================================================================

// Re-export query modules
export * from './talent';
export * from './sponsors';
export * from './requests';
export * from './messages';
export * from './files';
export * from './overview';
export * from './blog';

// Re-export shared types from utils
export type {
  QueryResult,
  ListResult,
  PaginationParams,
  PaginatedResult,
} from '../utils/errors';
