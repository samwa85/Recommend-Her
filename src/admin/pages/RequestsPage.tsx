// ============================================================================
// REQUESTS PAGE - Detailed Request Management
// ============================================================================

import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  FileX,
  AlertCircle,
  User,
  Building2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  RefreshCw,
  Search,
  X,
  Archive,
  Clock,
  UserCheck,
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from '../components/AdminLayout';
import { SkeletonTable } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { useRequestList, useRequestDetail } from '../hooks/useAdminData';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { RequestStatus, RequestPriority, REQUEST_STATUS_LABELS, REQUEST_PRIORITY_LABELS } from '@/lib/types/enums';
import type { Request } from '@/lib/types/db';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const REQUEST_TYPES = [
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'sponsorship_intro', label: 'Sponsorship Intro' },
  { value: 'talent_match', label: 'Talent Match' },
  { value: 'general', label: 'General Inquiry' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case RequestPriority.URGENT:
      return 'bg-red-100 text-red-700 border-red-200';
    case RequestPriority.HIGH:
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case RequestPriority.NORMAL:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case RequestPriority.LOW:
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case RequestPriority.URGENT:
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case RequestPriority.HIGH:
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return null;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RequestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    priority: '',
    request_type: '',
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
  
  // Action dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  const { 
    data, 
    isLoading, 
    error, 
    refresh 
  } = useRequestList({
    filters: {
      status: filters.status || undefined,
      search: filters.search || undefined,
      priority: filters.priority || undefined,
      request_type: filters.request_type || undefined,
    },
    pagination: {
      page: pagination.page,
      perPage: pagination.perPage,
    },
    autoRefresh: false,
  });

  const { 
    data: selectedRequest,
    updateStatus,
  } = useRequestDetail(selectedRequestId);

  // ============================================================================
  // COMPUTED
  // ============================================================================
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  
  const hasSelectedRows = selectedRows.size > 0;

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
      priority: '',
      request_type: '',
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

  const handleRowSelect = useCallback((id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.data.map(r => r.id)));
    }
    setSelectAll(!selectAll);
  }, [selectAll, data.data]);

  const handleViewDetail = useCallback((request: Request) => {
    setSelectedRequestId(request.id);
    setAdminNotes(request.admin_notes || '');
    setDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (request: Request, status: RequestStatus) => {
    toast.promise(
      async () => {
        const result = await updateStatus(status);
        if (result.success) {
          refresh();
          return `Request ${status}`;
        }
        throw new Error('Failed to update status');
      },
      {
        loading: 'Updating...',
        success: `Request marked as ${status}`,
        error: 'Failed to update request',
      }
    );
  }, [updateStatus, refresh]);

  const handleDelete = useCallback(async () => {
    // Delete functionality would be implemented here
    setDeleteDialogOpen(false);
    setDetailOpen(false);
    setSelectedRequestId(null);
    toast.success('Request deleted');
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

  const getRequesterInfo = (request: any) => {
    const talent = request.talent;
    const sponsor = request.sponsor;
    
    if (talent) {
      return {
        name: talent.full_name,
        email: talent.email,
        type: 'Talent',
        icon: <User className="w-4 h-4 text-blue-500" />,
      };
    }
    if (sponsor) {
      return {
        name: sponsor.full_name,
        email: sponsor.email,
        company: sponsor.company_name,
        type: 'Sponsor',
        icon: <Building2 className="w-4 h-4 text-green-500" />,
      };
    }
    return {
      name: 'Unknown',
      type: 'Unknown',
      icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
    };
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <AdminLayout
      title="Requests"
      subtitle={`${data.count} total requests`}
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
              placeholder="Search requests..."
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
              <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  {Object.entries(REQUEST_PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.request_type} onValueChange={(v) => handleFilterChange('request_type', v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {REQUEST_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
              .filter(([_, value]) => value)
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
        <SkeletonTable columns={7} rows={5} />
      ) : data.data.length === 0 ? (
        <div className="text-center py-16">
          <FileX className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No requests found</h3>
          <p className="text-muted-foreground mt-1">
            {activeFilterCount > 0 
              ? 'Try adjusting your filters' 
              : 'No requests have been submitted yet'}
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
                    onClick={() => handleSort('request_type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {getSortIcon('request_type')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('requester')}
                  >
                    <div className="flex items-center gap-1">
                      Requester
                      {getSortIcon('requester')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {getSortIcon('description')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      Priority
                      {getSortIcon('priority')}
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
                      Submitted
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((request) => {
                  const requester = getRequesterInfo(request);
                  return (
                    <TableRow
                      key={request.id}
                      className="group cursor-pointer"
                      onClick={() => handleViewDetail(request)}
                    >
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {request.request_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {requester.icon}
                          <div>
                            <p className="font-medium">{requester.name}</p>
                            <p className="text-xs text-muted-foreground">{requester.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[250px]">
                          {request.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(request.priority || '')}
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(request.priority || '')}
                          >
                            {request.priority || 'Normal'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} type="request" />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(request.created_at)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(request.created_at)}
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
                            <DropdownMenuItem onClick={() => handleViewDetail(request)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {request.status !== 'approved' && request.status !== 'closed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(request, RequestStatus.APPROVED)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            
                            {request.status !== 'closed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(request, RequestStatus.CLOSED)}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Close
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRequestId(request.id);
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
                  );
                })}
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
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden">
          {selectedRequest && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xl font-medium">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">Request Details</SheetTitle>
                    <SheetDescription className="text-base capitalize">
                      {selectedRequest.request_type.replace('_', ' ')}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedRequest.status} type="request" />
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(selectedRequest.priority || '')}
                      >
                        {selectedRequest.priority || 'Normal'} Priority
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedRequest.status !== 'approved' && selectedRequest.status !== 'closed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedRequest, RequestStatus.APPROVED)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {selectedRequest.status !== 'closed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(selectedRequest, RequestStatus.CLOSED)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  )}
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
                  {/* Requester Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Requester Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        const info = getRequesterInfo(selectedRequest);
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              {info.icon}
                              <span className="font-medium">{info.name}</span>
                              <Badge variant="outline">{info.type}</Badge>
                            </div>
                            {info.email && (
                              <div className="flex items-center gap-2 pl-6">
                                <span className="text-sm text-muted-foreground">{info.email}</span>
                              </div>
                            )}
                            {info.company && (
                              <div className="flex items-center gap-2 pl-6">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{info.company}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Request Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Request Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <Badge variant="outline" className="capitalize">
                          {selectedRequest.request_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                        <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Admin Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this request..."
                        className="min-h-[100px]"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast.success('Notes saved');
                        }}
                      >
                        Save Notes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted</span>
                        <span>{formatDate(selectedRequest.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{formatDate(selectedRequest.updated_at)}</span>
                      </div>
                      {selectedRequest.resolved_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolved</span>
                          <span>{formatDate(selectedRequest.resolved_at)}</span>
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
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this request? This action cannot be undone.
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
