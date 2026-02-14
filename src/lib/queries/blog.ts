// ============================================================================
// BLOG QUERIES - CRUD operations for blog posts
// ============================================================================

import { db } from '../insforge/client';
import { uploadFileAuto } from '../insforge/client';
import type { BlogPost, BlogPostInput, BlogPostUpdate, BlogFilters } from '../types/db';
import type { PaginatedResult, PaginationParams, QueryResult, ListResult } from '../utils/errors';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// TYPES
// ============================================================================

export interface ListBlogOptions {
  filters?: BlogFilters;
  pagination?: PaginationParams;
}

// ============================================================================
// LIST QUERIES
// ============================================================================

/**
 * List blog posts with filtering and pagination
 */
export async function listBlogPosts(
  options: ListBlogOptions = {}
): Promise<PaginatedResult<BlogPost> & { error: Error | null }> {
  const { filters = {}, pagination = {} } = options;
  const page = pagination.page ?? 1;
  const perPage = pagination.perPage ?? 10;
  
  try {
    let query = db
      .from('blog_posts')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.author) {
      query = query.eq('author_name', filters.author);
    }
    
    if (filters.tag) {
      query = query.contains('tags', [filters.tag]);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }
    
    // Apply sorting
    if (filters.status === 'published') {
      query = query.order('published_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[Blog] listBlogPosts database error:', error);
      throw error;
    }
    
    return {
      data: (data as BlogPost[]) || [],
      count: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
      error: null,
    };
  } catch (error) {
    // Better error handling - convert object errors to readable messages
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle PostgREST/Supabase error objects
      const errObj = error as { message?: string; error?: string; details?: string; code?: string };
      errorMessage = errObj.message || errObj.error || JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }
    
    return {
      data: [],
      count: 0,
      page,
      perPage,
      totalPages: 0,
      error: new Error(errorMessage),
    };
  }
}

/**
 * Get all published blog posts (for public site)
 */
export async function getPublishedBlogPosts(
  options: { category?: string; limit?: number } = {}
): Promise<ListResult<BlogPost>> {
  try {
    let query = db
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data: (data as BlogPost[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<BlogPost[]>(error);
  }
}

/**
 * Get featured blog posts
 */
export async function getFeaturedBlogPosts(limit: number = 3): Promise<ListResult<BlogPost>> {
  try {
    const { data, error } = await db
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return { data: (data as BlogPost[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<BlogPost[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

/**
 * Get blog post by ID
 */
export async function getBlogPostById(id: string): Promise<QueryResult<BlogPost>> {
  try {
    const { data, error } = await db
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data: data as BlogPost, error: null };
  } catch (error) {
    return handleSingleQueryError<BlogPost>(error);
  }
}

/**
 * Get blog post by slug (for public pages)
 */
export async function getBlogPostBySlug(slug: string): Promise<QueryResult<BlogPost>> {
  try {
    const { data, error } = await db
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    return { data: data as BlogPost, error: null };
  } catch (error) {
    return handleSingleQueryError<BlogPost>(error);
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Create blog post
 */
export async function createBlogPost(input: BlogPostInput): Promise<QueryResult<BlogPost>> {
  try {
    // Generate slug if not provided
    if (!input.slug) {
      input.slug = generateSlug(input.title);
    }
    
    console.log('[Blog] Creating post:', { title: input.title, slug: input.slug, status: input.status });
    
    const { data, error } = await db
      .from('blog_posts')
      .insert(input)
      .select()
      .single();
    
    if (error) {
      console.error('[Blog] Create error:', error);
      throw error;
    }
    
    console.log('[Blog] Post created:', data?.id);
    return { data: data as BlogPost, error: null };
  } catch (error) {
    console.error('[Blog] Create exception:', error);
    return handleSingleQueryError<BlogPost>(error);
  }
}

/**
 * Update blog post
 */
export async function updateBlogPost(
  id: string, 
  updates: BlogPostUpdate
): Promise<QueryResult<BlogPost>> {
  try {
    // Update slug if title changed and slug not explicitly provided
    if (updates.title && !updates.slug) {
      updates.slug = generateSlug(updates.title);
    }
    
    const { data, error } = await db
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as BlogPost, error: null };
  } catch (error) {
    return handleSingleQueryError<BlogPost>(error);
  }
}

/**
 * Publish blog post
 */
export async function publishBlogPost(id: string): Promise<QueryResult<BlogPost>> {
  return updateBlogPost(id, { status: 'published' });
}

/**
 * Unpublish blog post (set to draft)
 */
export async function unpublishBlogPost(id: string): Promise<QueryResult<BlogPost>> {
  return updateBlogPost(id, { status: 'draft' });
}

/**
 * Archive blog post
 */
export async function archiveBlogPost(id: string): Promise<QueryResult<BlogPost>> {
  return updateBlogPost(id, { status: 'archived' });
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
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
// IMAGE UPLOAD
// ============================================================================

/**
 * Upload blog image
 */
export async function uploadBlogImage(file: File): Promise<{ url: string | null; error: Error | null }> {
  try {
    const result = await uploadFileAuto('blog-images', file);
    
    if (result.error) {
      throw result.error;
    }
    
    return { url: result.url, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

/**
 * Calculate read time from content
 */
export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Get all unique categories
 */
export async function getBlogCategories(): Promise<string[]> {
  try {
    const { data, error } = await db
      .from('blog_posts')
      .select('category');
    
    if (error) throw error;
    
    const categories = [...new Set((data || []).map((post: { category: string }) => post.category))];
    return categories;
  } catch {
    return ['Leadership', 'Success Stories', 'Diversity & Inclusion', 'Career Growth'];
  }
}

/**
 * Get all unique tags
 */
export async function getBlogTags(): Promise<string[]> {
  try {
    const { data, error } = await db
      .from('blog_posts')
      .select('tags');
    
    if (error) throw error;
    
    const allTags = (data || []).flatMap((post: { tags: string[] }) => post.tags || []);
    return [...new Set(allTags)];
  } catch {
    return [];
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  listBlogPosts,
  getPublishedBlogPosts,
  getFeaturedBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  archiveBlogPost,
  deleteBlogPost,
  uploadBlogImage,
  generateSlug,
  calculateReadTime,
  getBlogCategories,
  getBlogTags,
};
