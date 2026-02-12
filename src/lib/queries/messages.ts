// ============================================================================
// MESSAGE QUERIES - Single Source of Truth for Message Operations
// ============================================================================

import { supabase } from '../supabase/client';
import type { Message, MessageInput, MessageUpdate, MessageFilters } from '../types/db';
import type { PaginatedResult, PaginationParams, QueryResult, ListResult } from '../utils/errors';
import { MessageStatus } from '../types/enums';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// LIST QUERIES
// ============================================================================

export interface ListMessagesOptions {
  filters?: MessageFilters;
  pagination?: PaginationParams;
}

/**
 * List messages with filtering, sorting, and pagination
 * @param options - Query options
 * @returns Paginated list of messages
 * 
 * @example
 * ```typescript
 * const { data, count, error } = await listMessages({
 *   filters: { status: 'unread' },
 *   pagination: { page: 1, perPage: 25 }
 * });
 * ```
 */
export async function listMessages(
  options: ListMessagesOptions = {}
): Promise<PaginatedResult<Message> & { error: Error | null }> {
  const { filters = {}, pagination = {} } = options;
  const page = pagination.page ?? 1;
  const perPage = pagination.perPage ?? 25;
  const sortBy = pagination.sortBy ?? 'created_at';
  const sortOrder = pagination.sortOrder ?? 'desc';
  
  try {
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.sender_email) {
      query = query.eq('sender_email', filters.sender_email);
    }
    
    if (filters.handled_by_admin_id) {
      query = query.eq('handled_by_admin_id', filters.handled_by_admin_id);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    // Search across multiple fields
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `sender_name.ilike.${searchTerm},` +
        `sender_email.ilike.${searchTerm},` +
        `subject.ilike.${searchTerm},` +
        `message.ilike.${searchTerm}`
      );
    }
    
    // Apply sorting (unread first, then by date)
    if (sortBy === 'status') {
      query = query.order('status', { ascending: false });
    }
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: (data as Message[]) || [],
      count: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      count: 0,
      page: pagination.page ?? 1,
      perPage: pagination.perPage ?? 25,
      totalPages: 0,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get all messages (without pagination)
 * @param filters - Optional filters
 * @returns List of all matching messages
 */
export async function getAllMessages(
  filters?: Omit<MessageFilters, 'search'>
): Promise<ListResult<Message>> {
  try {
    let query = supabase.from('messages').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.sender_email) {
      query = query.eq('sender_email', filters.sender_email);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: (data as Message[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Message[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

/**
 * Get message by ID
 * @param id - Message ID
 * @returns Message or null
 */
export async function getMessageById(
  id: string
): Promise<QueryResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as Message, error: null };
  } catch (error) {
    return handleSingleQueryError<Message>(error);
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Create new message (contact form submission)
 * @param input - Message data
 * @returns Created message
 */
export async function createMessage(
  input: MessageInput
): Promise<QueryResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Message, error: null };
  } catch (error) {
    return handleSingleQueryError<Message>(error);
  }
}

/**
 * Update message
 * @param id - Message ID
 * @param updates - Fields to update
 * @returns Updated message
 */
export async function updateMessage(
  id: string,
  updates: MessageUpdate
): Promise<QueryResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Message, error: null };
  } catch (error) {
    return handleSingleQueryError<Message>(error);
  }
}

/**
 * Update message status
 * @param id - Message ID
 * @param status - New status
 * @param handledByAdminId - Optional admin ID
 * @returns Updated message
 */
export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
  handledByAdminId?: string
): Promise<QueryResult<Message>> {
  const updates: MessageUpdate = { status };
  
  if (handledByAdminId !== undefined) {
    updates.handled_by_admin_id = handledByAdminId;
  }
  
  if (status === MessageStatus.REPLIED) {
    updates.replied_at = new Date().toISOString();
  }
  
  return updateMessage(id, updates);
}

/**
 * Mark message as read
 * @param id - Message ID
 * @param adminId - Admin who read it
 * @returns Updated message
 */
export async function markMessageAsRead(
  id: string,
  adminId?: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.READ, adminId);
}

/**
 * Mark message as replied
 * @param id - Message ID
 * @param adminId - Admin who replied
 * @returns Updated message
 */
export async function markMessageAsReplied(
  id: string,
  adminId?: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.REPLIED, adminId);
}

/**
 * Archive message
 * @param id - Message ID
 * @returns Updated message
 */
export async function archiveMessage(
  id: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.ARCHIVED);
}

/**
 * Mark message as spam
 * @param id - Message ID
 * @returns Updated message
 */
export async function markMessageAsSpam(
  id: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.SPAM);
}

/**
 * Delete message
 * @param id - Message ID
 * @returns True if deleted
 */
export async function deleteMessage(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('messages')
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
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk update message status
 * @param ids - Array of message IDs
 * @param status - New status
 * @returns Number of updated records
 */
export async function bulkUpdateMessageStatus(
  ids: string[],
  status: MessageStatus
): Promise<{ count: number; error: Error | null }> {
  try {
    const updates: MessageUpdate = { status };
    
    if (status === MessageStatus.REPLIED) {
      updates.replied_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .in('id', ids)
      .select('id');

    if (error) throw error;

    return { count: data?.length || 0, error: null };
  } catch (error) {
    return {
      count: 0,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get message status counts for dashboard
 * @returns Counts by status
 */
export async function getMessageStatusCounts(): Promise<
  QueryResult<Array<{ status: string; count: number }>>
> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('status');

    if (error) throw error;

    // Count by status
    const counts: Record<string, number> = {};
    data?.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });

    const result = Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));

    return { data: result, error: null };
  } catch (error) {
    return handleSingleQueryError<Array<{ status: string; count: number }>>(error);
  }
}

/**
 * Get unread messages count
 * @returns Number of unread messages
 */
export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', MessageStatus.UNREAD);

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get recent messages
 * @param limit - Number of records
 * @returns Recent messages
 */
export async function getRecentMessages(
  limit: number = 10
): Promise<ListResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: (data as Message[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Message[]>(error);
  }
}

/**
 * Get messages by sender email
 * @param email - Sender email
 * @returns Messages from this sender
 */
export async function getMessagesBySender(
  email: string
): Promise<ListResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: (data as Message[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Message[]>(error);
  }
}

/**
 * Get thread/conversation by sender email
 * Groups messages from same sender
 * @param email - Sender email
 * @returns Thread of messages
 */
export async function getMessageThread(
  email: string
): Promise<{
  sender: { name: string; email: string; phone: string | null };
  messages: Message[];
  count: number;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_email', email)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const messages = (data as Message[]) || [];
    const firstMessage = messages[0];

    return {
      sender: {
        name: firstMessage?.sender_name || 'Unknown',
        email: firstMessage?.sender_email || email,
        phone: firstMessage?.sender_phone || null,
      },
      messages,
      count: messages.length,
      error: null,
    };
  } catch (error) {
    return {
      sender: { name: '', email, phone: null },
      messages: [],
      count: 0,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  listMessages,
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  updateMessageStatus,
  markMessageAsRead,
  markMessageAsReplied,
  archiveMessage,
  markMessageAsSpam,
  deleteMessage,
  bulkUpdateMessageStatus,
  getMessageStatusCounts,
  getUnreadMessagesCount,
  getRecentMessages,
  getMessagesBySender,
  getMessageThread,
};
