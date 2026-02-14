// ============================================================================
// MESSAGES PAGE - Detailed Message Management
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Eye,
  CheckCircle,
  Send,
  Archive,
  Trash2,
  Reply,
  Mail,
  Phone,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  RefreshCw,
  Search,
  X,
  Inbox,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminLayout } from '../components/AdminLayout';
import { SkeletonTable } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { useMessageList, useMessageDetail } from '../hooks/useAdminData';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { MessageStatus, MESSAGE_STATUS_LABELS } from '@/lib/types/enums';
import type { Message } from '@/lib/types/db';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    date_from: '',
    date_to: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'created_at',
    direction: 'desc',
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 25,
  });
  
  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // Action dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  // ============================================================================
  // DATA FETCHING - Memoized to prevent infinite loops
  // ============================================================================
  
  // Memoize filters to prevent unnecessary re-fetches
  const memoizedFilters = useMemo(() => ({
    status: filters.status || undefined,
    search: filters.search || undefined,
  }), [filters.status, filters.search]);
  
  // Memoize pagination to prevent unnecessary re-fetches
  const memoizedPagination = useMemo(() => ({
    page: pagination.page,
    perPage: pagination.perPage,
  }), [pagination.page, pagination.perPage]);
  
  const { 
    data, 
    isLoading, 
    error, 
    refresh 
  } = useMessageList({
    filters: memoizedFilters,
    pagination: memoizedPagination,
    autoRefresh: true,
  });

  const { 
    data: selectedMessage,
    replies: messageReplies,
    updateStatus,
    addReply,
  } = useMessageDetail(selectedMessageId);

  // ============================================================================
  // COMPUTED
  // ============================================================================
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  
  const unreadCount = data.data.filter(m => m.status === MessageStatus.UNREAD).length;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries({ ...filters, [key]: value }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleViewDetail = useCallback(async (message: Message) => {
    setSelectedMessageId(message.id);
    setIsReplying(false);
    setReplyText('');
    
    // Auto-mark as read
    if (message.status === MessageStatus.UNREAD) {
      await updateStatus(MessageStatus.READ);
      refresh();
    }
    
    setDetailOpen(true);
  }, [updateStatus, refresh]);

  const handleStatusChange = useCallback(async (status: MessageStatus) => {
    toast.promise(
      async () => {
        const result = await updateStatus(status);
        if (result.success) {
          refresh();
          return `Message ${status}`;
        }
        throw new Error('Failed to update status');
      },
      {
        loading: 'Updating...',
        success: `Message marked as ${status}`,
        error: 'Failed to update message',
      }
    );
  }, [updateStatus, refresh]);

  const handleReply = useCallback(async () => {
    if (!replyText.trim()) return;
    
    toast.promise(
      async () => {
        // Save reply to database
        const result = await addReply(replyText.trim());
        if (!result.success) throw result.error;
        
        setIsReplying(false);
        setReplyText('');
        refresh();
        return 'Reply saved';
      },
      {
        loading: 'Saving reply...',
        success: 'Reply saved successfully',
        error: (err) => `Failed to save reply: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }
    );
  }, [replyText, addReply, refresh]);

  const handleDelete = useCallback(async () => {
    setDeleteDialogOpen(false);
    setDetailOpen(false);
    setSelectedMessageId(null);
    toast.success('Message deleted');
    refresh();
  }, [refresh]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <AdminLayout
      title="Messages"
      subtitle={`${data.count} total messages • ${unreadCount} unread`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
          <Button variant="link" onClick={refresh} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        {/* Search & Main Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-muted')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <div className="flex-1" />
          
          <Select
            value={pagination.perPage.toString()}
            onValueChange={(v) => setPagination(prev => ({ ...prev, perPage: parseInt(v), page: 1 }))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt.toString()}>{opt} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(MESSAGE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-[140px]"
                />
              </div>

              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(filters)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleFilterChange(key, '')}
                >
                  {key}: {value}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
          </div>
        )}
      </div>

      {/* Data Table */}
      {isLoading ? (
        <SkeletonTable columns={5} rows={5} />
      ) : data.data.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No messages found</h3>
          <p className="text-muted-foreground mt-1">
            {activeFilterCount > 0 
              ? 'Try adjusting your filters' 
              : 'Your inbox is empty'}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('sender_name')}
                  >
                    <div className="flex items-center gap-1">
                      From
                      {getSortIcon('sender_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('subject')}
                  >
                    <div className="flex items-center gap-1">
                      Subject
                      {getSortIcon('subject')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Received
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((message) => (
                  <TableRow
                    key={message.id}
                    className={cn(
                      'group cursor-pointer',
                      message.status === MessageStatus.UNREAD && 'bg-blue-50/50'
                    )}
                    onClick={() => handleViewDetail(message)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                          ${message.status === MessageStatus.UNREAD 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'}
                        `}>
                          {message.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-medium ${message.status === MessageStatus.UNREAD ? 'text-foreground' : ''}`}>
                            {message.sender_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{message.sender_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={`truncate max-w-[300px] ${message.status === MessageStatus.UNREAD ? 'font-semibold' : ''}`}>
                          {message.subject || '(No Subject)'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {message.message.substring(0, 60)}{message.message.length > 60 ? '...' : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={message.status} type="message" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(message.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(message.created_at)}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(message)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          
                          {message.status === MessageStatus.UNREAD && (
                            <DropdownMenuItem onClick={() => handleStatusChange(MessageStatus.READ)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => { handleViewDetail(message); setIsReplying(true); }}>
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          
                          {message.status !== MessageStatus.ARCHIVED && (
                            <DropdownMenuItem onClick={() => handleStatusChange(MessageStatus.ARCHIVED)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedMessageId(message.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
              {Math.min(pagination.page * pagination.perPage, data.count)} of{' '}
              {data.count} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {Math.ceil(data.count / pagination.perPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(data.count / pagination.perPage)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Sheet */}
      <Sheet 
        open={detailOpen} 
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setIsReplying(false);
            setReplyText('');
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-hidden">
          {selectedMessage && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-medium">
                    {selectedMessage.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedMessage.subject || 'No Subject'}</SheetTitle>
                    <SheetDescription className="text-base">
                      {selectedMessage.sender_name}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedMessage.status} type="message" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedMessage.status !== MessageStatus.REPLIED && (
                    <Button
                      size="sm"
                      onClick={() => setIsReplying(true)}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${selectedMessage.sender_email}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-280px)] mt-6 pr-4">
                <div className="space-y-6">
                  {/* Sender Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Sender Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${selectedMessage.sender_email}`} className="text-primary hover:underline">
                          {selectedMessage.sender_email}
                        </a>
                      </div>
                      {selectedMessage.sender_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${selectedMessage.sender_phone}`} className="hover:underline">
                            {selectedMessage.sender_phone}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Message */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                    </CardContent>
                  </Card>

                  {/* Reply History */}
                  {messageReplies.length > 0 && (
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Your Replies ({messageReplies.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {messageReplies.map((reply, index) => (
                          <div key={reply.id} className="bg-white rounded-lg p-4 border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-green-600">
                                Reply #{index + 1}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{reply.reply_text}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Reply Section */}
                  {isReplying && (
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Reply className="w-4 h-4" />
                          New Reply
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="min-h-[150px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setIsReplying(false); setReplyText(''); }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleReply}
                            disabled={!replyText.trim()}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Save Reply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received</span>
                        <span>{formatDate(selectedMessage.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{formatDate(selectedMessage.updated_at)}</span>
                      </div>
                      {selectedMessage.replied_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Replied</span>
                          <span>{formatDate(selectedMessage.replied_at)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message from {selectedMessage?.sender_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
