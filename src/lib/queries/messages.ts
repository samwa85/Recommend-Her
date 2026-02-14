// ============================================================================
// MESSAGE QUERIES - Maps contact_submissions to Message interface with replies
// ============================================================================

import { db } from '../insforge/client';
import type { Message, MessageInput, MessageUpdate, MessageFilters } from '../types/db';
import type { PaginatedResult, PaginationParams, QueryResult, ListResult } from '../utils/errors';
import { MessageStatus } from '../types/enums';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// TYPE MAPPING HELPERS
// ============================================================================

interface ContactSubmissionRow {
  id: string;
  full_name: string;
  email: string;
  inquiry_type: string;
  organization: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

function mapContactToMessage(row: ContactSubmissionRow): Message {
  return {
    id: row.id,
    sender_name: row.full_name,
    sender_email: row.email,
    sender_phone: null,
    subject: row.inquiry_type,
    message: row.message,
    status: row.status === 'new' ? MessageStatus.UNREAD : row.status as MessageStatus,
    admin_reply: null,
    handled_by_admin_id: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    replied_at: null,
  };
}

// ============================================================================
// LIST QUERIES
// ============================================================================

export interface ListMessagesOptions {
  filters?: MessageFilters;
  pagination?: PaginationParams;
}

export async function listMessages(
  options: ListMessagesOptions = {}
): Promise<PaginatedResult<Message> & { error: Error | null }> {
  const { filters = {}, pagination = {} } = options;
  const page = pagination.page ?? 1;
  const perPage = pagination.perPage ?? 25;
  const sortBy = pagination.sortBy ?? 'created_at';
  const sortOrder = pagination.sortOrder ?? 'desc';
  
  try {
    let query = db
      .from('contact_submissions')
      .select('*', { count: 'exact' });
    
    // Apply status filter
    if (filters.status) {
      // Map message status to contact_submissions status
      const mappedStatus = filters.status === MessageStatus.UNREAD ? 'new' : filters.status;
      query = query.eq('status', mappedStatus);
    }
    
    if (filters.sender_email) {
      query = query.eq('email', filters.sender_email);
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
        `full_name.ilike.${searchTerm},` +
        `email.ilike.${searchTerm},` +
        `inquiry_type.ilike.${searchTerm},` +
        `message.ilike.${searchTerm}`
      );
    }
    
    // Apply sorting
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Map to Message type
    const mappedData = (data as ContactSubmissionRow[] || []).map(mapContactToMessage);
    
    return {
      data: mappedData,
      count: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
      error: null,
    };
  } catch (error) {
    console.error('[Messages] listMessages error:', error);
    return {
      data: [],
      count: 0,
      page,
      perPage,
      totalPages: 0,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function getAllMessages(
  filters?: Omit<MessageFilters, 'search'>
): Promise<ListResult<Message>> {
  try {
    let query = db.from('contact_submissions').select('*');
    
    if (filters?.status) {
      const mappedStatus = filters.status === MessageStatus.UNREAD ? 'new' : filters.status;
      query = query.eq('status', mappedStatus);
    }
    
    if (filters?.sender_email) {
      query = query.eq('email', filters.sender_email);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedData = (data as ContactSubmissionRow[] || []).map(mapContactToMessage);
    
    return { data: mappedData, count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Message[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

export async function getMessageById(
  id: string
): Promise<QueryResult<Message>> {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: mapContactToMessage(data as ContactSubmissionRow), error: null };
  } catch (error) {
    return handleSingleQueryError<Message>(error);
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

export async function createMessage(
  input: MessageInput
): Promise<QueryResult<Message>> {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .insert({
        full_name: input.sender_name,
        email: input.sender_email,
        inquiry_type: input.subject || 'General Inquiry',
        organization: null,
        message: input.message,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;

    return { data: mapContactToMessage(data as ContactSubmissionRow), error: null };
  } catch (error) {
    return handleSingleQueryError<Message>(error);
  }
}

export async function updateMessage(
  id: string,
  updates: MessageUpdate
): Promise<QueryResult<Message>> {
  try {
    const dbUpdates: Partial<ContactSubmissionRow> = {};
    
    if (updates.status) {
      // Map MessageStatus to contact_submissions status
      dbUpdates.status = updates.status === MessageStatus.UNREAD ? 'new' : updates.status as ContactSubmissionRow['status'];
    }
    
    const { data, error } = await db
      .from('contact_submissions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: mapContactToMessage(data as ContactSubmissionRow), error: null };
  } catch (error) {
    return handleSingleQueryError<Message>(error);
  }
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
  _handledByAdminId?: string
): Promise<QueryResult<Message>> {
  const mappedStatus = status === MessageStatus.UNREAD ? 'new' : status as ContactSubmissionRow['status'];
  return updateMessage(id, { status: mappedStatus as MessageStatus });
}

export async function markMessageAsRead(
  id: string,
  _adminId?: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.READ);
}

export async function markMessageAsReplied(
  id: string,
  _adminId?: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.REPLIED);
}

export async function archiveMessage(
  id: string
): Promise<QueryResult<Message>> {
  return updateMessageStatus(id, MessageStatus.ARCHIVED);
}

export async function markMessageAsSpam(
  id: string
): Promise<QueryResult<Message>> {
  // For contact_submissions, we'll just archive spam
  return updateMessageStatus(id, MessageStatus.ARCHIVED);
}

export async function deleteMessage(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('contact_submissions')
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

export async function bulkUpdateMessageStatus(
  ids: string[],
  status: MessageStatus
): Promise<{ count: number; error: Error | null }> {
  try {
    const mappedStatus = status === MessageStatus.UNREAD ? 'new' : status as ContactSubmissionRow['status'];
    
    const { data, error } = await db
      .from('contact_submissions')
      .update({ status: mappedStatus })
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

export async function getMessageStatusCounts(): Promise<
  QueryResult<Array<{ status: string; count: number }>>
> {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .select('status');

    if (error) throw error;

    // Count by status
    const counts: Record<string, number> = {};
    data?.forEach((item: { status: string }) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });

    // Map contact_submissions statuses to MessageStatus
    const result = Object.entries(counts).map(([status, count]) => ({
      status: status === 'new' ? MessageStatus.UNREAD : status,
      count,
    }));

    return { data: result, error: null };
  } catch (error) {
    return handleSingleQueryError<Array<{ status: string; count: number }>>(error);
  }
}

export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const { count, error } = await db
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

export async function getRecentMessages(
  limit: number = 10
): Promise<ListResult<Message>> {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const mappedData = (data as ContactSubmissionRow[] || []).map(mapContactToMessage);

    return { data: mappedData, count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Message[]>(error);
  }
}

export async function getMessagesBySender(
  email: string
): Promise<ListResult<Message>> {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedData = (data as ContactSubmissionRow[] || []).map(mapContactToMessage);

    return { data: mappedData, count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Message[]>(error);
  }
}

export async function getMessageThread(
  email: string
): Promise<{
  sender: { name: string; email: string; phone: string | null };
  messages: Message[];
  count: number;
  error: Error | null;
}> {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const messages = (data as ContactSubmissionRow[] || []).map(mapContactToMessage);
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
// REPLY OPERATIONS
// ============================================================================

export interface Reply {
  id: string;
  submission_id: string;
  admin_id: string | null;
  admin_name: string | null;
  admin_email: string | null;
  reply_text: string;
  created_at: string;
}

/**
 * Add a reply to a contact submission
 * Saves reply to database and updates submission status
 */
export async function addMessageReply(
  submissionId: string,
  replyText: string,
  _adminId?: string
): Promise<{ success: boolean; data?: Reply; error: Error | null }> {
  try {
    // Insert reply
    const { data: replyData, error: replyError } = await db
      .from('contact_replies')
      .insert({
        submission_id: submissionId,
        reply_text: replyText,
      })
      .select('id, submission_id, admin_id, reply_text, created_at')
      .single();

    if (replyError) throw replyError;

    // Update submission status
    const { error: updateError } = await db
      .from('contact_submissions')
      .update({
        status: 'replied',
        admin_reply: replyText,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    return { 
      success: true, 
      data: replyData as Reply,
      error: null 
    };
  } catch (error) {
    console.error('[Messages] addMessageReply error:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get all replies for a submission
 */
export async function getMessageReplies(
  submissionId: string
): Promise<{ data: Reply[]; error: Error | null }> {
  try {
    const { data, error } = await db
      .from('contact_replies')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data: (data as Reply[]) || [], error: null };
  } catch (error) {
    return {
      data: [],
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
  addMessageReply,
  getMessageReplies,
};
