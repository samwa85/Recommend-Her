// ============================================================================
// SPONSORS PAGE - Detailed Sponsor Management
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  FileX,
  Mail,
  Phone,
  Building2,
  Globe,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  RefreshCw,
  Search,
  Briefcase,
  X,
  ExternalLink,
  Archive,
  DollarSign,
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
import { useSponsorList, useSponsorDetail } from '../hooks/useAdminData';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { SponsorStatus, SPONSOR_STATUS_LABELS } from '@/lib/types/enums';
import type { SponsorProfile } from '@/lib/types/db';
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

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SponsorsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    industry: '',
    company_size: '',
    is_recruiter: '',
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
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'archive' | 'delete'>('activate');

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
    industry: filters.industry || undefined,
    company_size: filters.company_size || undefined,
    is_recruiter: filters.is_recruiter === 'true' ? true : 
                  filters.is_recruiter === 'false' ? false : undefined,
  }), [filters.status, filters.search, filters.industry, filters.company_size, filters.is_recruiter]);
  
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
  } = useSponsorList({
    filters: memoizedFilters,
    pagination: memoizedPagination,
    autoRefresh: false,
  });

  const { 
    data: selectedSponsor,
    updateStatus,
    remove,
  } = useSponsorDetail(selectedSponsorId);

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
      company_size: '',
      is_recruiter: '',
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
      setSelectedRows(new Set(data.data.map(s => s.id)));
    }
    setSelectAll(!selectAll);
  }, [selectAll, data.data]);

  const handleViewDetail = useCallback((sponsor: SponsorProfile) => {
    setSelectedSponsorId(sponsor.id);
    setDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (sponsor: SponsorProfile, status: SponsorStatus) => {
    toast.promise(
      async () => {
        const result = await updateStatus(status);
        if (result.success) {
          refresh();
          return `Sponsor ${status}`;
        }
        throw new Error('Failed to update status');
      },
      {
        loading: 'Updating...',
        success: `Sponsor marked as ${status}`,
        error: 'Failed to update sponsor',
      }
    );
  }, [updateStatus, refresh]);

  const handleDelete = useCallback(async () => {
    if (!selectedSponsorId) return;
    
    toast.promise(
      async () => {
        const result = await remove();
        if (result.success) {
          setDeleteDialogOpen(false);
          setDetailOpen(false);
          setSelectedSponsorId(null);
          refresh();
          return 'Sponsor deleted';
        }
        throw new Error('Failed to delete');
      },
      {
        loading: 'Deleting...',
        success: 'Sponsor deleted successfully',
        error: 'Failed to delete sponsor',
      }
    );
  }, [selectedSponsorId, remove, refresh]);

  const handleBulkAction = useCallback(async () => {
    const ids = Array.from(selectedRows);
    
    toast.promise(
      async () => {
        // In real implementation, you'd batch these
        setSelectedRows(new Set());
        setSelectAll(false);
        setBulkActionDialogOpen(false);
        refresh();
        return `${ids.length} sponsors updated`;
      },
      {
        loading: 'Processing...',
        success: `Updated ${ids.length} sponsors`,
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
      title="Sponsors"
      subtitle={`${data.count} total sponsors`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/sponsors/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Sponsor
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
              placeholder="Search by name, email, company..."
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
                onClick={() => { setBulkAction('activate'); setBulkActionDialogOpen(true); }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate
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
                  {Object.entries(SPONSOR_STATUS_LABELS).map(([value, label]) => (
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

              <Select value={filters.company_size || 'all'} onValueChange={(v) => handleFilterChange('company_size', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {COMPANY_SIZES.map(size => (
                    <SelectItem key={size} value={size}>{size} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.is_recruiter || 'all'} onValueChange={(v) => handleFilterChange('is_recruiter', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="true">Recruiter</SelectItem>
                  <SelectItem value="false">Direct Hire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
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
        <SkeletonTable columns={7} rows={5} />
      ) : data.data.length === 0 ? (
        <div className="text-center py-16">
          <FileX className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No sponsors found</h3>
          <p className="text-muted-foreground mt-1">
            {activeFilterCount > 0 
              ? 'Try adjusting your filters' 
              : 'No sponsor profiles have been submitted yet'}
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
                      Contact
                      {getSortIcon('full_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('company_name')}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      {getSortIcon('company_name')}
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
                    onClick={() => handleSort('company_size')}
                  >
                    <div className="flex items-center gap-1">
                      Size
                      {getSortIcon('company_size')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('is_recruiter')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {getSortIcon('is_recruiter')}
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
                      Joined
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((sponsor) => (
                  <TableRow
                    key={sponsor.id}
                    className={cn(
                      'group cursor-pointer',
                      selectedRows.has(sponsor.id) && 'bg-muted'
                    )}
                    onClick={() => handleViewDetail(sponsor)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(sponsor.id)}
                        onCheckedChange={() => handleRowSelect(sponsor.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {sponsor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{sponsor.full_name}</p>
                          <p className="text-xs text-muted-foreground">{sponsor.job_title || 'No title'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sponsor.company_name}</p>
                        {sponsor.company_website && (
                          <a 
                            href={sponsor.company_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sponsor.industry ? (
                        <Badge variant="outline">{sponsor.industry}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sponsor.company_size ? (
                        <span className="text-sm">{sponsor.company_size} employees</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sponsor.is_recruiter ? (
                        <Badge variant="secondary">Recruiter</Badge>
                      ) : (
                        <Badge variant="outline">Direct</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sponsor.status} type="sponsor" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(sponsor.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(sponsor.created_at)}
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
                          <DropdownMenuItem onClick={() => handleViewDetail(sponsor)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {sponsor.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(sponsor, SponsorStatus.ACTIVE)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          
                          {sponsor.status !== 'inactive' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(sponsor, SponsorStatus.INACTIVE)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          
                          {sponsor.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(sponsor, SponsorStatus.ARCHIVED)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedSponsorId(sponsor.id);
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
          {selectedSponsor && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-medium">
                    {selectedSponsor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedSponsor.full_name}</SheetTitle>
                    <SheetDescription className="text-base">
                      {selectedSponsor.job_title}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedSponsor.status} type="sponsor" />
                      {selectedSponsor.is_recruiter && (
                        <Badge variant="outline" className="gap-1">
                          <Briefcase className="w-3 h-3" />
                          Recruiter
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedSponsor.status !== 'active' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedSponsor, SponsorStatus.ACTIVE)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${selectedSponsor.email}`)}
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
                        <a href={`mailto:${selectedSponsor.email}`} className="text-primary hover:underline">
                          {selectedSponsor.email}
                        </a>
                      </div>
                      {selectedSponsor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${selectedSponsor.phone}`} className="hover:underline">
                            {selectedSponsor.phone}
                          </a>
                        </div>
                      )}
                      {selectedSponsor.linkedin_url && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <a href={selectedSponsor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            LinkedIn
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Company Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{selectedSponsor.company_name}</span>
                      </div>
                      {selectedSponsor.company_website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <a href={selectedSponsor.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            {selectedSponsor.company_website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="font-medium">{selectedSponsor.industry || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Company Size</p>
                          <p className="font-medium">{selectedSponsor.company_size || '-'}</p>
                        </div>
                      </div>
                      {selectedSponsor.company_description && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Description</p>
                          <p className="text-sm text-muted-foreground">{selectedSponsor.company_description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Focus Areas */}
                  {selectedSponsor.focus_areas && selectedSponsor.focus_areas.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Focus Areas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedSponsor.focus_areas.map((area, i) => (
                            <Badge key={i} variant="secondary">{area}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Role Types */}
                  {selectedSponsor.role_types && selectedSponsor.role_types.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Role Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedSponsor.role_types.map((role, i) => (
                            <Badge key={i} variant="outline">{role}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sponsorship */}
                  {selectedSponsor.sponsorship_amount && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Sponsorship Interest</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedSponsor.sponsorship_amount}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message */}
                  {selectedSponsor.message && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Message</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedSponsor.message}
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
                        <span className="text-muted-foreground">Joined</span>
                        <span>{formatDate(selectedSponsor.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{formatDate(selectedSponsor.updated_at)}</span>
                      </div>
                      {selectedSponsor.source && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source</span>
                          <span>{selectedSponsor.source}</span>
                        </div>
                      )}
                      {selectedSponsor.referral_code && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Referral Code</span>
                          <span>{selectedSponsor.referral_code}</span>
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
            <DialogTitle>Delete Sponsor Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSponsor?.full_name}'s profile? 
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
            <DialogTitle className="capitalize">{bulkAction} Sponsors</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedRows.size} selected sponsor profiles?
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
              {bulkAction === 'activate' && <CheckCircle className="w-4 h-4 mr-2" />}
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
