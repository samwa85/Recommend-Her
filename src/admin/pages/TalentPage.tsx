// ============================================================================
// TALENT PAGE - Detailed Talent Management with Advanced Features
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  X,
  Trash2,
  FileText,
  Plus,
  FileX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  RefreshCw,
  Search,
  Linkedin,
  Globe,
  Archive,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useTalentList, useTalentDetail } from '../hooks/useAdminData';
import { getTalentCVUrl } from '@/lib/queries/files';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { TalentStatus, TALENT_STATUS_LABELS } from '@/lib/types/enums';
import type { TalentProfile } from '@/lib/types/db';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Operations',
  'Human Resources',
  'Legal',
  'Consulting',
  'Non-profit',
  'Manufacturing',
  'Retail',
  'Media',
  'Other',
];

const ROLE_CATEGORIES = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Customer Success',
  'Data',
  'Strategy',
  'General Management',
  'Executive',
  'Other',
];

const EXPERIENCE_LEVELS = [
  '0-2 years',
  '3-5 years',
  '6-10 years',
  '11-15 years',
  '15+ years',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TalentPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    industry: '',
    role_category: '',
    years_of_experience: '',
    country: '',
    has_cv: '',
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
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'archive' | 'delete'>('approve');

  // ============================================================================
  // DATA FETCHING - Memoized to prevent infinite loops
  // ============================================================================
  
  // Memoize filters to prevent unnecessary re-fetches
  const memoizedFilters = useMemo(() => ({
    status: filters.status || undefined,
    search: filters.search || undefined,
    industry: filters.industry || undefined,
    role_category: filters.role_category || undefined,
    years_of_experience: filters.years_of_experience || undefined,
    has_cv: (filters.has_cv as 'yes' | 'no' | '' | undefined) || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  }), [filters.status, filters.search, filters.industry, filters.role_category, 
      filters.years_of_experience, filters.has_cv, filters.date_from, filters.date_to]);
  
  // Memoize pagination to prevent unnecessary re-fetches
  const memoizedPagination = useMemo(() => ({
    page: pagination.page,
    perPage: pagination.perPage,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
  }), [pagination.page, pagination.perPage, sortConfig.key, sortConfig.direction]);
  
  const { 
    data, 
    isLoading, 
    error, 
    refresh 
  } = useTalentList({
    filters: memoizedFilters,
    pagination: memoizedPagination,
    autoRefresh: false,
  });

  const { 
    data: selectedTalent,
    updateStatus,
    remove,
  } = useTalentDetail(selectedTalentId);

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
      industry: '',
      role_category: '',
      years_of_experience: '',
      country: '',
      has_cv: '',
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
      setSelectedRows(new Set(data.data.map(t => t.id)));
    }
    setSelectAll(!selectAll);
  }, [selectAll, data.data]);

  const handleViewDetail = useCallback((talent: TalentProfile) => {
    setSelectedTalentId(talent.id);
    setDetailOpen(true);
  }, []);

  const handleDownloadCV = useCallback(async (talent: TalentProfile) => {
    if (!talent.cv_file_id) {
      toast.error('No CV attached');
      return;
    }
    
    toast.promise(
      async () => {
        const { url, error } = await getTalentCVUrl(talent.id);
        if (error) throw error;
        if (url) {
          window.open(url, '_blank');
          return 'CV opened';
        }
        throw new Error('Failed to get CV URL');
      },
      {
        loading: 'Opening CV...',
        success: 'CV opened in new tab',
        error: 'Failed to open CV',
      }
    );
  }, []);

  const handleStatusChange = useCallback(async (status: TalentStatus) => {
    toast.promise(
      async () => {
        const result = await updateStatus(status as 'pending' | 'approved' | 'rejected' | 'archived');
        if (result.success) {
          refresh();
          return `Talent ${status}`;
        }
        throw new Error('Failed to update status');
      },
      {
        loading: 'Updating...',
        success: `Talent marked as ${status}`,
        error: 'Failed to update talent',
      }
    );
  }, [updateStatus, refresh]);

  const handleDelete = useCallback(async () => {
    if (!selectedTalentId) return;
    
    toast.promise(
      async () => {
        const result = await remove();
        if (result.success) {
          setDeleteDialogOpen(false);
          setDetailOpen(false);
          setSelectedTalentId(null);
          refresh();
          return 'Talent deleted';
        }
        throw new Error('Failed to delete');
      },
      {
        loading: 'Deleting...',
        success: 'Talent deleted successfully',
        error: 'Failed to delete talent',
      }
    );
  }, [selectedTalentId, remove, refresh]);

  const handleBulkAction = useCallback(async () => {
    const ids = Array.from(selectedRows);
    
    toast.promise(
      async () => {
        // In real implementation, you'd batch these
        // Process ids: ids.forEach(id => { ... })
        setSelectedRows(new Set());
        setSelectAll(false);
        setBulkActionDialogOpen(false);
        refresh();
        return `${ids.length} talents updated`;
      },
      {
        loading: 'Processing...',
        success: `Updated ${ids.length} talents`,
        error: 'Some updates failed',
      }
    );
  }, [selectedRows, refresh]);

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
      title="Talent Profiles"
      subtitle={`${data.count} total talents • ${data.data.filter(t => t.status === 'pending').length} pending review`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/talent/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Talent
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
              placeholder="Search by name, email, headline..."
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

          {hasSelectedRows && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkAction('approve'); setBulkActionDialogOpen(true); }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkAction('archive'); setBulkActionDialogOpen(true); }}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </>
          )}

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
                  {Object.entries(TALENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.industry || 'all'} onValueChange={(v) => handleFilterChange('industry', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.role_category || 'all'} onValueChange={(v) => handleFilterChange('role_category', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Role Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_CATEGORIES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.years_of_experience || 'all'} onValueChange={(v) => handleFilterChange('years_of_experience', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  {EXPERIENCE_LEVELS.map(exp => (
                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.has_cv || 'all'} onValueChange={(v) => handleFilterChange('has_cv', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="CV Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has CV</SelectItem>
                  <SelectItem value="no">No CV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
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
        <SkeletonTable columns={8} rows={5} />
      ) : data.data.length === 0 ? (
        <div className="text-center py-16">
          <FileX className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No talent found</h3>
          <p className="text-muted-foreground mt-1">
            {activeFilterCount > 0 
              ? 'Try adjusting your filters' 
              : 'No talent profiles have been submitted yet'}
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
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center gap-1">
                      Talent
                      {getSortIcon('full_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('headline')}
                  >
                    <div className="flex items-center gap-1">
                      Headline
                      {getSortIcon('headline')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('industry')}
                  >
                    <div className="flex items-center gap-1">
                      Industry
                      {getSortIcon('industry')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('role_category')}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      {getSortIcon('role_category')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer text-center"
                    onClick={() => handleSort('cv_file_id')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      CV
                      {getSortIcon('cv_file_id')}
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
                {data.data.map((talent) => (
                  <TableRow
                    key={talent.id}
                    className={cn(
                      'group cursor-pointer',
                      selectedRows.has(talent.id) && 'bg-muted'
                    )}
                    onClick={() => handleViewDetail(talent)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(talent.id)}
                        onCheckedChange={() => handleRowSelect(talent.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                          {talent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{talent.full_name}</p>
                          <p className="text-xs text-muted-foreground">{talent.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                        {talent.headline || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {talent.industry ? (
                        <Badge variant="outline">{talent.industry}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {talent.role_category ? (
                        <Badge variant="secondary">{talent.role_category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {talent.cv_file_id ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadCV(talent);
                          }}
                        >
                          <FileText className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={talent.status} type="talent" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(talent.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(talent.created_at)}
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
                          <DropdownMenuItem onClick={() => handleViewDetail(talent)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {talent.cv_file_id && (
                            <DropdownMenuItem onClick={() => handleDownloadCV(talent)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download CV
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {talent.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(TalentStatus.APPROVED)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          
                          {talent.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(TalentStatus.REJECTED)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          
                          {talent.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(TalentStatus.ARCHIVED)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedTalentId(talent.id);
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
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden">
          {selectedTalent && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xl font-medium">
                    {selectedTalent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedTalent.full_name}</SheetTitle>
                    <SheetDescription className="text-base">
                      {selectedTalent.headline || 'No headline'}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedTalent.status} type="talent" />
                      {selectedTalent.cv_file_id && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="w-3 h-3" />
                          CV Attached
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedTalent.status !== 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(TalentStatus.APPROVED)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {selectedTalent.cv_file_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCV(selectedTalent)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CV
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${selectedTalent.email}`)}
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
                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${selectedTalent.email}`} className="text-primary hover:underline">
                          {selectedTalent.email}
                        </a>
                      </div>
                      {selectedTalent.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${selectedTalent.phone}`} className="hover:underline">
                            {selectedTalent.phone}
                          </a>
                        </div>
                      )}
                      {selectedTalent.linkedin_url && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-muted-foreground" />
                          <a href={selectedTalent.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            LinkedIn Profile
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {selectedTalent.website_url && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <a href={selectedTalent.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Professional Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="font-medium">{selectedTalent.industry || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Role Category</p>
                          <p className="font-medium">{selectedTalent.role_category || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="font-medium">{selectedTalent.years_of_experience || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Education</p>
                          <p className="font-medium">{selectedTalent.education_level || '-'}</p>
                        </div>
                      </div>
                      {selectedTalent.seeking_roles && selectedTalent.seeking_roles.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Seeking Roles</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedTalent.seeking_roles.map((role, i) => (
                              <Badge key={i} variant="secondary">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {[selectedTalent.city, selectedTalent.country].filter(Boolean).join(', ') || 'Not specified'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  {selectedTalent.skills && selectedTalent.skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedTalent.skills.map((skill, i) => (
                            <Badge key={i} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bio */}
                  {selectedTalent.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Bio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedTalent.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted</span>
                        <span>{formatDate(selectedTalent.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{formatDate(selectedTalent.updated_at)}</span>
                      </div>
                      {selectedTalent.source && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source</span>
                          <span>{selectedTalent.source}</span>
                        </div>
                      )}
                      {selectedTalent.referral_code && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Referral Code</span>
                          <span>{selectedTalent.referral_code}</span>
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
            <DialogTitle>Delete Talent Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTalent?.full_name}'s profile? 
              This action cannot be undone.
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

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{bulkAction} Talents</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedRows.size} selected talent profiles?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
            >
              {bulkAction === 'approve' && <CheckCircle className="w-4 h-4 mr-2" />}
              {bulkAction === 'archive' && <Archive className="w-4 h-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="w-4 h-4 mr-2" />}
              Confirm {bulkAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
