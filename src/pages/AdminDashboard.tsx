import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, Download, Search, Filter, Mail, Linkedin, 
  Building2, Briefcase, Trash2, Eye, Loader2, LayoutDashboard,
  Database, RefreshCw, CheckCircle, XCircle, AlertCircle,
  UserCheck, Clock, ChevronLeft, ChevronRight, User,
  TrendingUp, TrendingDown, MoreHorizontal, Calendar,
  MessageSquare, Activity, BarChart3, 
  Edit3, FileSpreadsheet, Printer, Shield, UserPlus, Building, Target,
  Grid, List, SearchX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { 
  getAdminMetrics, getPendingTalentReviews, getPendingSponsorApprovals,
  getAllTalent, getAllSponsors, getAuditLogs, getMyRequests, getContactSubmissions,
  adminReviewTalent, adminReviewSponsor, deleteTalentProfile, updateContactSubmissionStatus,
  getCurrentProfile, getTalentProfileDebug, testDatabaseRecording
} from '@/lib/supabase';
import { deleteFile, BUCKETS } from '@/lib/storage';
import type { 
  AdminDashboardMetrics, PendingTalentReview, PendingSponsorApproval,
  TalentProfile, SponsorProfile, AuditLog, VettingDecision, SponsorStatus,
  RecommendationRequestDetail, ContactSubmission
} from '@/lib/database.types';
import { 
  TALENT_STATUS_LABELS, SPONSOR_STATUS_LABELS, SPONSOR_TYPES,
  INDUSTRIES, REQUEST_STATUS_LABELS
} from '@/lib/database.types';

// ============================================================================
// TYPES
// ============================================================================

interface TimeRange {
  label: string;
  days: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGES: TimeRange[] = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'All Time', days: 365 * 10 },
];

const COLORS = {
  primary: '#f97066',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  gray: '#6b7280',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const NavTab = ({ value, icon: Icon, label, badge }: { value: string, icon: React.ElementType, label: string, badge?: number }) => (
  <TabsTrigger 
    value={value} 
    className="gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-[hsl(var(--primary))] border-transparent transition-all"
  >
    <Icon size={18} />
    <span className="font-semibold">{label}</span>
    {badge ? (
      <Badge variant="destructive" className="ml-1 px-1.5 h-5 min-w-5 flex items-center justify-center">
        {badge}
      </Badge>
    ) : null}
  </TabsTrigger>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminDashboard = () => {
  useNavigate(); // kept for future use
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devPassword, setDevPassword] = useState('');
  const DEV_PASSWORD = 'admin123';
  
  // Data states
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [pendingTalent, setPendingTalent] = useState<PendingTalentReview[]>([]);
  const [pendingSponsors, setPendingSponsors] = useState<PendingSponsorApproval[]>([]);
  const [allTalent, setAllTalent] = useState<TalentProfile[]>([]);
  const [allSponsors, setAllSponsors] = useState<SponsorProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [requests] = useState<RecommendationRequestDetail[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  
  // Sync error handling early
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);
  
  // UI states
  const [selectedTalent, setSelectedTalent] = useState<PendingTalentReview | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<PendingSponsorApproval | null>(null);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<TalentProfile | null>(null);
  const [reviewDecision, setReviewDecision] = useState<VettingDecision>('approved');
  const [feedbackToTalent, setFeedbackToTalent] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGES[1]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Admin creation state - reserved for future use
  
  // Stat card listing dialog
  const [statListingOpen, setStatListingOpen] = useState(false);
  const [statListingType, setStatListingType] = useState<'pending_reviews' | 'pending_sponsors' | 'approved_talent' | 'active_sponsors' | null>(null);
  const [statListingLoading, setStatListingLoading] = useState(false);
  const [statListingData, setStatListingData] = useState<{
    pendingTalent: PendingTalentReview[];
    pendingSponsors: PendingSponsorApproval[];
    approvedTalent: TalentProfile[];
    activeSponsors: SponsorProfile[];
  }>({
    pendingTalent: [],
    pendingSponsors: [],
    approvedTalent: [],
    activeSponsors: []
  });
  
  // Data health check
  const [dataHealth, setDataHealth] = useState<{
    rawTalentCount: number;
    statusBreakdown: Record<string, number>;
    lastCheck: Date | null;
  }>({
    rawTalentCount: 0,
    statusBreakdown: {},
    lastCheck: null
  });
  
  // Database recording test
  const [dbTestResult, setDbTestResult] = useState<{
    running: boolean;
    result: { success?: boolean; beforeCount?: number; afterCount?: number; error?: string } | null;
  }>({ running: false, result: null });
  
  const runDbRecordingTest = async () => {
    setDbTestResult({ running: true, result: null });
    try {
      const testResult = await testDatabaseRecording();
      setDbTestResult({ 
        running: false, 
        result: {
          success: testResult.success,
          beforeCount: testResult.beforeCount || 0,
          afterCount: testResult.afterCount || 0,
          error: testResult.insertError?.message
        }
      });
    } catch (err) {
      setDbTestResult({ 
        running: false, 
        result: { 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      });
    }
  };
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Check authentication
  const checkAuth = useCallback(async () => {
    try {
      const profile = await getCurrentProfile();
      console.log('Auth check - profile:', profile?.id, 'role:', profile?.role);
      if (profile?.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runDataHealthCheck = useCallback(async () => {
    try {
      console.log('=== Running data health check ===');
      const debug = await getTalentProfileDebug();
      
      // Calculate breakdown from aggregated RPC results if available
      // otherwise fallback to raw sample breakdown
      let statusBreakdown: Record<string, number> = {};
      let totalRawCount = 0;

      if (debug.statusCounts && Array.isArray(debug.statusCounts)) {
        debug.statusCounts.forEach((item: {status: string, count: number}) => {
          statusBreakdown[item.status] = item.count;
          totalRawCount += item.count;
        });
      } else if (debug.rawTalent) {
        statusBreakdown = debug.rawTalent.reduce((acc: Record<string, number>, t: TalentProfile) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {});
        totalRawCount = debug.rawTalent.length;
      }
      
      setDataHealth({
        rawTalentCount: totalRawCount,
        statusBreakdown,
        lastCheck: new Date()
      });
      
      console.log('Data health check updated:', {
        totalRawCount,
        statusBreakdown
      });
    } catch (err) {
      console.error('Data health check failed:', err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=== Loading all dashboard data ===');
      
      // Run data health check in parallel
      runDataHealthCheck();
      
      // Fetch all data in parallel with error tracking for each
      const [metricsResult, pendingTalentResult, pendingSponsorsResult, allTalentResult, allSponsorsResult, auditLogsResult, requestsResult, contactResult] = await Promise.allSettled([
        getAdminMetrics(),
        getPendingTalentReviews(),
        getPendingSponsorApprovals(),
        getAllTalent({ limit: 500 }),
        getAllSponsors({ limit: 500 }),
        getAuditLogs({ limit: 50 }),
        getMyRequests(),
        getContactSubmissions({ limit: 100 })
      ]);

      // Process metrics
      if (metricsResult.status === 'fulfilled') {
        console.log('✓ Metrics:', metricsResult.value);
        setMetrics(metricsResult.value);
      } else {
        console.error('✗ Metrics error:', metricsResult.reason);
      }

      // Process pending talent
      if (pendingTalentResult.status === 'fulfilled') {
        console.log('✓ Pending talent:', pendingTalentResult.value?.length);
        setPendingTalent(pendingTalentResult.value);
      } else {
        console.error('✗ Pending talent error:', pendingTalentResult.reason);
      }

      // Process pending sponsors
      if (pendingSponsorsResult.status === 'fulfilled') {
        console.log('✓ Pending sponsors:', pendingSponsorsResult.value?.length);
        setPendingSponsors(pendingSponsorsResult.value);
      } else {
        console.error('✗ Pending sponsors error:', pendingSponsorsResult.reason);
      }

      // Process all talent - with detailed logging
      if (allTalentResult.status === 'fulfilled') {
        const { data, error, count } = allTalentResult.value;
        console.log('✓ All talent:', { count, dataLength: data?.length, error });
        if (error) {
          console.error('All talent Supabase error:', error);
          // We'll collect this below
        }
        if (data && data.length > 0) {
          const firstTalent = data[0];
          console.log('  Sample talent:', { 
            id: firstTalent.id, 
            status: firstTalent.status,
            profile: (firstTalent as { profiles?: { full_name: string; email: string } }).profiles 
          });
          // Count by status
          const statusCounts = data.reduce((acc: Record<string, number>, t: TalentProfile) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {});
          console.log('  Status breakdown:', statusCounts);
        }
        setAllTalent(data || []);
      } else {
        console.error('✗ All talent promise rejected:', allTalentResult.reason);
      }

      // Process all sponsors
      if (allSponsorsResult.status === 'fulfilled') {
        const { data, error } = allSponsorsResult.value;
        console.log('✓ All sponsors:', data?.length, error);
        setAllSponsors(data || []);
      } else {
        console.error('✗ All sponsors error:', allSponsorsResult.reason);
      }

      // Process audit logs
      if (auditLogsResult.status === 'fulfilled') {
        console.log('✓ Audit logs:', auditLogsResult.value?.data?.length);
        setAuditLogs(auditLogsResult.value.data || []);
      } else {
        console.error('✗ Audit logs error:', auditLogsResult.reason);
      }

      // Process contact submissions
      if (contactResult.status === 'fulfilled') {
        console.log('✓ Contact submissions:', contactResult.value?.data?.length);
        setContactSubmissions(contactResult.value.data || []);
      } else {
        console.error('✗ Contact submissions error:', contactResult.reason);
      }

      // Check for any errors
      const promiseRejections = [metricsResult, pendingTalentResult, pendingSponsorsResult, allTalentResult, allSponsorsResult, auditLogsResult, requestsResult, contactResult]
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason);

      const supabaseErrors = [allTalentResult, allSponsorsResult, auditLogsResult, contactResult]
        .filter((r: PromiseSettledResult<unknown>) => r.status === 'fulfilled' && r.value && typeof r.value === 'object' && 'error' in r.value && r.value.error)
        .map((r: PromiseSettledResult<unknown>) => {
          const fulfilled = r as PromiseFulfilledResult<{ error?: { message?: string } }>;
          return fulfilled.value.error?.message;
        }).filter((msg): msg is string => !!msg);
      
      const allErrors = [...promiseRejections, ...supabaseErrors];
      
      if (allErrors.length > 0) {
        console.error('Data loading errors:', allErrors);
        setError(`Failed to load some data: ${allErrors.join(', ')}`);
      }
      
    } catch (err) {
      console.error('Critical error loading data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [runDataHealthCheck]);

  // Effects
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData, timeRange]);

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  const filteredTalent = useMemo(() => {
    return allTalent.filter(t => {
      const matchesSearch = !searchQuery || 
        t.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.industry?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || t.industry === industryFilter;
      
      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [allTalent, searchQuery, statusFilter, industryFilter]);

  const paginatedTalent = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTalent.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTalent, currentPage]);

  const totalPages = Math.ceil(filteredTalent.length / ITEMS_PER_PAGE);

  // Chart data
  const talentStatusData: ChartData[] = useMemo(() => {
    const counts: Record<string, number> = {};
    allTalent.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: TALENT_STATUS_LABELS[status as keyof typeof TALENT_STATUS_LABELS] || status,
      value: count,
      status
    }));
  }, [allTalent]);

  const talentByIndustry: ChartData[] = useMemo(() => {
    const counts: Record<string, number> = {};
    allTalent.filter(t => t.status === 'approved').forEach(t => {
      counts[t.industry || 'Unknown'] = (counts[t.industry || 'Unknown'] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([industry, count]) => ({ name: industry, value: count }));
  }, [allTalent]);

  const submissionsOverTime: ChartData[] = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), timeRange.days),
      end: new Date()
    });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = allTalent.filter(t => 
        t.created_at && t.created_at.startsWith(dayStr)
      ).length;
      return {
        name: format(day, 'MMM dd'),
        value: count,
        fullDate: dayStr
      };
    });
  }, [allTalent, timeRange]);

  // Fetch fresh data for stat listing dialog
  useEffect(() => {
    if (!statListingOpen || !statListingType) return;
    
    const fetchStatListingData = async () => {
      setStatListingLoading(true);
      try {
        if (statListingType === 'pending_reviews') {
          const data = await getPendingTalentReviews();
          setStatListingData(prev => ({ ...prev, pendingTalent: data }));
        } else if (statListingType === 'pending_sponsors') {
          const data = await getPendingSponsorApprovals();
          setStatListingData(prev => ({ ...prev, pendingSponsors: data }));
        } else if (statListingType === 'approved_talent') {
          // Use already loaded allTalent data (filtered by approved status)
          const approvedTalent = allTalent.filter(t => t.status === 'approved');
          console.log('Approved talent from cache:', approvedTalent.length, 'items');
          
          // If no approved talent in cache but metrics shows count, refresh data
          if (approvedTalent.length === 0 && (metrics?.approved_talent || 0) > 0) {
            console.log('Cache miss for approved talent, fetching fresh data...');
            const { data } = await getAllTalent({ status: 'approved', limit: 500 });
            setStatListingData(prev => ({ ...prev, approvedTalent: data || [] }));
            // Also update the main allTalent state to keep it in sync
            if (data && data.length > 0) {
              setAllTalent(prev => {
                // Remove any existing approved talent from cache
                const nonApproved = prev.filter(t => t.status !== 'approved');
                // Add the fresh approved talent data
                return [...nonApproved, ...data];
              });
              console.log('Updated allTalent state with fresh approved talent:', data.length, 'items');
            }
          } else {
            setStatListingData(prev => ({ ...prev, approvedTalent }));
          }
        } else if (statListingType === 'active_sponsors') {
          // Use already loaded allSponsors data (filtered by approved status)
          const approvedSponsors = allSponsors.filter(s => s.status === 'approved');
          console.log('Approved sponsors from cache:', approvedSponsors.length, 'items');
          
          // If no approved sponsors in cache but metrics shows count, refresh data
          if (approvedSponsors.length === 0 && (metrics?.approved_sponsors || 0) > 0) {
            console.log('Cache miss for approved sponsors, fetching fresh data...');
            const { data } = await getAllSponsors({ status: 'approved', limit: 500 });
            setStatListingData(prev => ({ ...prev, activeSponsors: data || [] }));
            // Also update the main allSponsors state to keep it in sync
            if (data && data.length > 0) {
              setAllSponsors(prev => {
                // Remove any existing approved sponsors from cache
                const nonApproved = prev.filter(s => s.status !== 'approved');
                // Add the fresh approved sponsors data
                return [...nonApproved, ...data];
              });
              console.log('Updated allSponsors state with fresh approved sponsors:', data.length, 'items');
            }
          } else {
            setStatListingData(prev => ({ ...prev, activeSponsors: approvedSponsors }));
          }
        }
      } catch (err) {
        console.error('Error fetching stat listing data:', err);
      } finally {
        setStatListingLoading(false);
      }
    };
    
    fetchStatListingData();
  }, [statListingOpen, statListingType, allTalent, allSponsors, metrics]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTalentReview = async () => {
    if (!selectedTalent) return;
    setIsLoading(true);
    
    try {
      const { error } = await adminReviewTalent(selectedTalent.id, {
        decision: reviewDecision,
        feedback_to_talent: feedbackToTalent || undefined,
        internal_notes: internalNotes || undefined
      });

      if (error) throw error;

      await loadAllData();
      setSelectedTalent(null);
      setFeedbackToTalent('');
      setInternalNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorReview = async (decision: SponsorStatus) => {
    if (!selectedSponsor) return;
    setIsLoading(true);
    
    try {
      const { error } = await adminReviewSponsor(selectedSponsor.id, decision);
      if (error) throw error;

      await loadAllData();
      setSelectedSponsor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review sponsor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTalent = async () => {
    if (!deleteConfirm) return;
    setIsLoading(true);
    
    try {
      const talent = allTalent.find(t => t.id === deleteConfirm.id);
      if (talent?.cv_file_path) {
        await deleteFile(BUCKETS.TALENT_CV, talent.cv_file_path);
      }

      const { error } = await deleteTalentProfile(deleteConfirm.id);
      if (error) throw error;

      await loadAllData();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = (type: 'talent' | 'sponsors' | 'audit') => {
    let csvContent = '';
    let filename = '';

    if (type === 'talent') {
      const headers = ['ID', 'Name', 'Email', 'Headline', 'Industry', 'Seniority', 'Experience', 'Status', 'Submitted At', 'LinkedIn'];
      csvContent = [
        headers.join(','),
        ...filteredTalent.map(t => [
          t.id, `"${t.profiles?.full_name || ''}"`, `"${t.profiles?.email || ''}"`,
          `"${t.headline || ''}"`, `"${t.industry || ''}"`, `"${t.seniority_level || ''}"`,
          t.years_experience, t.status, t.submitted_at, `"${t.linkedin_url || ''}"`
        ].join(','))
      ].join('\n');
      filename = `talent-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk approve function - commented out for future use
  // const bulkApprove = async (ids: string[]) => {
  //   setIsLoading(true);
  //   try {
  //     for (const id of ids) {
  //       await adminReviewTalent(id, { decision: 'approved' });
  //     }
  //     await loadAllData();
  //   } catch (err) {
  //     setError('Failed to bulk approve');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} style={{ color: 'hsl(var(--primary))' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
              <Shield className="text-white" size={32} />
            </div>
            <CardTitle className="font-serif text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter password to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (devPassword === DEV_PASSWORD) {
                setIsAuthenticated(true);
              } else {
                setError('Incorrect password');
              }
            }} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                className="h-12"
              />
              <Button type="submit" className="w-full h-12" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                Login
              </Button>
            </form>
            {error && <p className="text-center mt-4 text-sm text-red-500">{error}</p>}
            <p className="text-center mt-4 text-xs text-gray-500">
              Default: <code>admin123</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-[112px]" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Unified Sticky Header */}
      <div className="sticky top-24 sm:top-[112px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          {/* Row 1: Title and Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
                  Admin Dashboard
                </h1>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-60" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  RecommendHer Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange.label} onValueChange={(v) => {
                const range = TIME_RANGES.find(r => r.label === v);
                if (range) setTimeRange(range);
              }}>
                <SelectTrigger className="w-40 bg-white/50 border-gray-200">
                  <Calendar size={16} className="mr-2 opacity-50" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map(r => (
                    <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={loadAllData}
                className="bg-white/50 border-gray-200"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>

          {/* Row 2: Navigation Tabs (Inside the sticky header) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-1 border-none justify-start">
              <NavTab value="overview" icon={LayoutDashboard} label="Overview" />
              <NavTab 
                value="talent" 
                icon={UserCheck} 
                label="Talent" 
                badge={metrics?.pending_talent_reviews} 
              />
              <NavTab 
                value="sponsors" 
                icon={Building2} 
                label="Sponsors" 
                badge={metrics?.pending_sponsor_approvals} 
              />
              <NavTab value="requests" icon={MessageSquare} label="Requests" />
              <NavTab 
                value="messages" 
                icon={Mail} 
                label="Messages" 
                badge={contactSubmissions.filter(c => c.status === 'new').length || undefined} 
              />
              <NavTab value="analytics" icon={BarChart3} label="Analytics" />
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* We use a separate Tabs root for content, synced via activeTab */}
        <Tabs value={activeTab} className="space-y-6 mt-4">

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={Clock} 
                label="Pending Reviews" 
                value={metrics?.pending_talent_reviews || 0}
                trend={metrics && (metrics.pending_talent_reviews ?? 0) > 5 ? 'up' : 'neutral'}
                color="orange"
                onClick={() => {
                  setStatListingType('pending_reviews');
                  setStatListingOpen(true);
                }}
              />
              <StatCard 
                icon={UserCheck} 
                label="Pending Sponsors" 
                value={metrics?.pending_sponsor_approvals || 0}
                trend="neutral"
                color="blue"
                onClick={() => {
                  setStatListingType('pending_sponsors');
                  setStatListingOpen(true);
                }}
              />
              <StatCard 
                icon={Users} 
                label="Approved Talent" 
                value={metrics?.approved_talent || 0}
                trend="up"
                color="green"
                onClick={() => {
                  setStatListingType('approved_talent');
                  setStatListingOpen(true);
                }}
              />
              <StatCard 
                icon={Briefcase} 
                label="Active Sponsors" 
                value={metrics?.approved_sponsors || 0}
                trend="up"
                color="purple"
                onClick={() => {
                  setStatListingType('active_sponsors');
                  setStatListingOpen(true);
                }}
              />
            </div>

            {/* Data Consistency Warning */}
            {dataHealth.lastCheck && (
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Data Health Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-amber-700 space-y-2">
                    <div className="flex justify-between">
                      <span>Total talent profiles (raw):</span>
                      <span className="font-medium">{dataHealth.rawTalentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status breakdown:</span>
                      <span className="font-medium">
                        {Object.entries(dataHealth.statusBreakdown)
                          .map(([status, count]) => `${status}: ${count}`)
                          .join(', ') || 'None'}
                      </span>
                    </div>
                    {(metrics?.approved_talent || 0) !== (dataHealth.statusBreakdown['approved'] || 0) && (
                      <div className="text-red-600 font-medium mt-2">
                        ⚠️ Inconsistency detected: Metrics shows {metrics?.approved_talent} approved, 
                        but raw data shows {dataHealth.statusBreakdown['approved'] || 0} approved
                      </div>
                    )}
                    <div className="text-xs text-amber-600 mt-2">
                      Last checked: {dataHealth.lastCheck.toLocaleTimeString()}
                    </div>
                    
                    {/* Database Recording Test */}
                    <div className="pt-4 border-t border-amber-200 mt-4">
                      <p className="font-medium mb-2">Database Recording Test:</p>
                      {dbTestResult.result ? (
                        <div className="space-y-1">
                          {dbTestResult.result.success ? (
                            <div className="text-green-600">
                              ✅ Test PASSED: Database is recording data<br/>
                              Count: {dbTestResult.result.beforeCount} → {dbTestResult.result.afterCount}
                            </div>
                          ) : (
                            <div className="text-red-600">
                              ❌ Test FAILED: {dbTestResult.result.error || 'Unknown error'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-amber-600 text-xs">Click button to test if database records data</p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={runDbRecordingTest}
                        disabled={dbTestResult.running}
                      >
                        {dbTestResult.running ? (
                          <><Loader2 size={14} className="mr-2 animate-spin" /> Testing...</>
                        ) : (
                          <><Database size={14} className="mr-2" /> Test DB Recording</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pending Reviews */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">Pending Reviews</CardTitle>
                    <CardDescription>Talent awaiting approval</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('talent')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {pendingTalent.slice(0, 10).map((talent) => (
                        <div 
                          key={talent.id} 
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                              <span className="text-white font-medium">
                                {talent.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{talent.full_name}</p>
                              <p className="text-sm text-gray-500">{talent.headline || 'No headline'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{talent.industry}</Badge>
                                <span className="text-xs text-gray-400">
                                  {talent.submitted_at && format(parseISO(talent.submitted_at), 'MMM dd')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => setSelectedTalent(talent)}>
                            Review
                          </Button>
                        </div>
                      ))}
                      {pendingTalent.length === 0 && (
                        <div className="text-center py-12">
                          <CheckCircle className="mx-auto mb-4" size={48} style={{ color: 'hsl(var(--muted-foreground))' }} />
                          <p style={{ color: 'hsl(var(--muted-foreground))' }}>No pending reviews</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {auditLogs.slice(0, 15).map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                          <div className="mt-1">
                            {log.action.includes('APPROVE') ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : log.action.includes('REJECT') ? (
                              <XCircle size={16} className="text-red-500" />
                            ) : (
                              <Activity size={16} className="text-blue-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-500">{log.entity_type}</p>
                            <p className="text-xs text-gray-400">
                              {format(parseISO(log.created_at), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickStatCard 
                icon={UserPlus}
                label="New This Week"
                value={metrics?.talent_last_7_days || 0}
              />
              <QuickStatCard 
                icon={MessageSquare}
                label="Requests (30d)"
                value={metrics?.requests_last_30_days || 0}
              />
              <QuickStatCard 
                icon={Target}
                label="Pending Requests"
                value={metrics?.pending_requests || 0}
              />
            </div>
          </TabsContent>

          {/* TALENT TAB */}
          <TabsContent value="talent" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search by name, email, headline..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(TALENT_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-40">
                      <Building size={16} className="mr-2" />
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download size={16} className="mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportToCSV('talent')}>
                        <FileSpreadsheet size={16} className="mr-2" />
                        Export to CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Printer size={16} className="mr-2" />
                        Print
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex border rounded-lg overflow-hidden">
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      <List size={16} />
                    </Button>
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none"
                    >
                      <Grid size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {allTalent.length === 0 ? (
                  'No talent data loaded'
                ) : (
                  `Showing ${paginatedTalent.length} of ${filteredTalent.length} results`
                )}
              </p>
              {(searchQuery || statusFilter !== 'all' || industryFilter !== 'all') && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setIndustryFilter('all');
                }}>
                  <XCircle size={16} className="mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Talent List/Grid */}
            {viewMode === 'list' ? (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="text-left p-4 font-medium text-sm">Talent</th>
                        <th className="text-left p-4 font-medium text-sm">Headline</th>
                        <th className="text-left p-4 font-medium text-sm">Industry</th>
                        <th className="text-left p-4 font-medium text-sm">Seniority</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Submitted</th>
                        <th className="text-right p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTalent.map((talent) => (
                        <tr key={talent.id} className="border-b hover:bg-gray-50/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400 text-white font-medium">
                                {(talent.profiles?.full_name || talent.headline)?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium">{talent.profiles?.full_name || talent.headline || 'Anonymous'}</p>
                                <p className="text-sm text-gray-500">{talent.profiles?.email || 'No email'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs truncate">{talent.headline || '-'}</td>
                          <td className="p-4">
                            <Badge variant="outline">{talent.industry || '-'}</Badge>
                          </td>
                          <td className="p-4">{talent.seniority_level || '-'}</td>
                          <td className="p-4">
                            <StatusBadge status={talent.status} type="talent" />
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {talent.submitted_at ? format(parseISO(talent.submitted_at), 'MMM dd, yyyy') : '-'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProfileDetail(talent)}
                              >
                                <Eye size={16} />
                              </Button>
                              {talent.status === 'submitted' && (
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    const pt = pendingTalent.find(p => p.id === talent.id);
                                    if (pt) setSelectedTalent(pt);
                                  }}
                                >
                                  Review
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedProfileDetail(talent)}>
                                    <Eye size={16} className="mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {talent.cv_file_path && (
                                    <DropdownMenuItem asChild>
                                      <a 
                                        href={`${import.meta.env['VITE_SUPABASE_URL']}/storage/v1/object/public/talent-cvs/${talent.cv_file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download size={16} className="mr-2" />
                                        Download CV
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setDeleteConfirm({
                                      id: talent.id,
                                      name: talent.profiles?.full_name || 'Unknown'
                                    })}
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {paginatedTalent.length === 0 && (
                  <div className="p-12 text-center">
                    <SearchX size={48} className="mx-auto mb-4 text-gray-300" />
                    {allTalent.length === 0 ? (
                      <>
                        <p className="text-gray-500 mb-2">No talent data available</p>
                        <p className="text-sm text-gray-400">Check database connection or RLS policies</p>
                      </>
                    ) : filteredTalent.length === 0 ? (
                      <>
                        <p className="text-gray-500 mb-2">No talent found matching your criteria</p>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setIndustryFilter('all');
                        }}>
                          Clear Filters
                        </Button>
                      </>
                    ) : null}
                  </div>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTalent.map((talent) => (
                  <TalentCard 
                    key={talent.id} 
                    talent={talent} 
                    onView={() => setSelectedProfileDetail(talent)}
                    onReview={() => {
                      const pt = pendingTalent.find(p => p.id === talent.id);
                      if (pt) setSelectedTalent(pt);
                    }}
                    onDelete={() => setDeleteConfirm({
                      id: talent.id,
                      name: talent.profiles?.full_name || 'Unknown'
                    })}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* SPONSORS TAB */}
          <TabsContent value="sponsors" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Sponsors */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Clock size={20} className="text-orange-500" />
                    Pending Approvals
                    {pendingSponsors.length > 0 && (
                      <Badge variant="destructive">{pendingSponsors.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingSponsors.map((sponsor) => (
                      <div 
                        key={sponsor.id}
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                        style={{ borderColor: 'hsl(var(--border))' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
                              {(sponsor.full_name ?? '').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{sponsor.full_name}</p>
                              <p className="text-sm text-gray-500">{sponsor.email}</p>
                              <p className="text-sm">
                                {sponsor.title} at {sponsor.org_name}
                              </p>
                              {sponsor.sponsor_type && (
                                <Badge variant="secondary" className="mt-1">
                                  {SPONSOR_TYPES.find(t => t.value === sponsor.sponsor_type)?.label}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSponsorReview('rejected')}
                            >
                              <XCircle size={16} className="mr-1" />
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSponsorReview('approved')}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                        {sponsor.commitment_note && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm italic">
                            "{sponsor.commitment_note}"
                          </div>
                        )}
                      </div>
                    ))}
                    {pendingSponsors.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                        <p className="text-gray-500">No pending sponsor approvals</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* All Sponsors */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">All Sponsors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {allSponsors.map((sponsor) => (
                        <div 
                          key={sponsor.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >
                          <div>
                            <p className="font-medium">{sponsor.profiles?.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {sponsor.org_name} • {sponsor.title}
                            </p>
                          </div>
                          <StatusBadge status={sponsor.status} type="sponsor" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REQUESTS TAB */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Recommendation Requests</CardTitle>
                <CardDescription>Track sponsor requests to talent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div 
                      key={req.id}
                      className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                      style={{ borderColor: 'hsl(var(--border))' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                              <Briefcase size={18} className="text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-500">{req.sponsor_name?.split(' ')[0]}</p>
                          </div>
                          <ArrowRight className="text-gray-300" />
                          <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-1">
                              <UserCheck size={18} className="text-pink-600" />
                            </div>
                            <p className="text-xs text-gray-500">{req.talent_name?.split(' ')[0]}</p>
                          </div>
                        </div>
                        <StatusBadge status={req.status} type="request" />
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm italic">"{req.message}"</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{format(parseISO(req.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        <span>{req.sponsor_org}</span>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
                      <p className="text-gray-500">No recommendation requests yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Mail size={20} />
                  Contact Submissions
                  {contactSubmissions.filter(c => c.status === 'new').length > 0 && (
                    <Badge variant="destructive">{contactSubmissions.filter(c => c.status === 'new').length} new</Badge>
                  )}
                </CardTitle>
                <CardDescription>Messages from the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="mx-auto mb-4 text-gray-300" size={48} />
                      <p className="text-gray-500">No contact submissions yet</p>
                    </div>
                  ) : (
                    contactSubmissions.map((submission) => (
                      <div 
                        key={submission.id}
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                        style={{ borderColor: 'hsl(var(--border))' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-400 text-white font-bold">
                              {(submission.full_name ?? '').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{submission.full_name}</p>
                              <p className="text-sm text-gray-500">{submission.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{submission.inquiry_type}</Badge>
                                {submission.organization && (
                                  <span className="text-xs text-gray-400">@ {submission.organization}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={submission.status} type="contact" />
                            {submission.status === 'new' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={async () => {
                                  await updateContactSubmissionStatus(submission.id, 'read');
                                  await loadAllData();
                                }}
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>Received {format(parseISO(submission.created_at), 'MMM dd, yyyy HH:mm')}</span>
                          <a 
                            href={`mailto:${submission.email}?subject=Re: ${submission.inquiry_type}`}
                            className="text-blue-600 hover:underline"
                          >
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Submissions Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Submissions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={submissionsOverTime}>
                        <defs>
                          <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <RechartsTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={COLORS.primary} 
                          fillOpacity={1} 
                          fill="url(#colorSubmissions)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Talent by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Talent by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={talentStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {talentStatusData.map((_item, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {talentStatusData.map((stat, idx) => (
                      <div key={stat.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="text-sm">{stat.name}: {stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Talent by Industry */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Approved Talent by Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={talentByIndustry} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis type="number" tick={{fontSize: 12}} />
                        <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* DIALOGS */}
      
      {/* Talent Review Dialog */}
      <Dialog open={!!selectedTalent} onOpenChange={() => setSelectedTalent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Review Talent Profile</DialogTitle>
            <DialogDescription>
              Review and approve or reject this talent submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedTalent && (
            <div className="space-y-6 py-4">
              {/* Profile Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-pink-500 to-orange-400">
                    {selectedTalent.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedTalent.full_name}</h3>
                    <p className="text-gray-500">{selectedTalent.email}</p>
                    <p className="mt-2 text-lg">{selectedTalent.headline}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge>{selectedTalent.industry}</Badge>
                      <Badge variant="outline">{selectedTalent.seniority_level}</Badge>
                      <Badge variant="secondary">{selectedTalent.years_experience} years exp</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-3">
                {selectedTalent.linkedin_url && (
                  <Button variant="outline" asChild>
                    <a href={selectedTalent.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin size={18} className="mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {selectedTalent.cv_file_path && (
                  <Button variant="outline" asChild>
                    <a 
                      href={`${import.meta.env['VITE_SUPABASE_URL']}/storage/v1/object/public/talent-cvs/${selectedTalent.cv_file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={18} className="mr-2" />
                      View CV
                    </a>
                  </Button>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Decision</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {(['approved', 'needs_changes', 'rejected'] as VettingDecision[]).map((decision) => (
                      <button
                        key={decision}
                        type="button"
                        onClick={() => setReviewDecision(decision)}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          reviewDecision === decision 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {decision === 'approved' && <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />}
                        {decision === 'needs_changes' && <Edit3 className="mx-auto mb-2 text-orange-500" size={24} />}
                        {decision === 'rejected' && <XCircle className="mx-auto mb-2 text-red-500" size={24} />}
                        <span className="font-medium capitalize">{decision.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback">Feedback to Talent</Label>
                  <Textarea
                    id="feedback"
                    value={feedbackToTalent}
                    onChange={(e) => setFeedbackToTalent(e.target.value)}
                    placeholder="This will be visible to the talent..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="internal">Internal Notes (Admin Only)</Label>
                  <Textarea
                    id="internal"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Private notes for admin team..."
                    rows={2}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTalent(null)}>
              Cancel
            </Button>
            <Button onClick={handleTalentReview} style={{ backgroundColor: 'hsl(var(--primary))' }}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedProfileDetail} onOpenChange={() => setSelectedProfileDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Talent Profile Details</DialogTitle>
          </DialogHeader>
          
          {selectedProfileDetail && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl bg-gradient-to-br from-pink-500 to-orange-400">
                  {selectedProfileDetail.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedProfileDetail.profiles?.full_name}</h3>
                  <p className="text-lg text-gray-600">{selectedProfileDetail.headline}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={selectedProfileDetail.status} type="talent" />
                    <Badge variant="outline">{selectedProfileDetail.industry}</Badge>
                    <Badge variant="secondary">{selectedProfileDetail.seniority_level}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User size={18} /> Contact
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Email:</span> {selectedProfileDetail.profiles?.email}</p>
                    <p><span className="text-gray-500">LinkedIn:</span> <a href={selectedProfileDetail.linkedin_url ?? undefined} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a></p>
                    {selectedProfileDetail.portfolio_url && (
                      <p><span className="text-gray-500">Portfolio:</span> <a href={selectedProfileDetail.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase size={18} /> Experience
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Years:</span> {selectedProfileDetail.years_experience}</p>
                    <p><span className="text-gray-500">Industry:</span> {selectedProfileDetail.industry}</p>
                    <p><span className="text-gray-500">Seniority:</span> {selectedProfileDetail.seniority_level}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedProfileDetail.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProfileDetail.bio}</p>
                </div>
              )}

              {/* Skills & Functions */}
              <div className="grid md:grid-cols-2 gap-6">
                {selectedProfileDetail.functions && selectedProfileDetail.functions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Functions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfileDetail.functions.map(func => (
                        <Badge key={func} variant="outline">{func}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProfileDetail.skills && selectedProfileDetail.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfileDetail.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CV */}
              {selectedProfileDetail.cv_file_path && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-gray-400" />
                    <div>
                      <p className="font-medium">CV/Resume</p>
                      <p className="text-sm text-gray-500">Uploaded</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`${import.meta.env['VITE_SUPABASE_URL']}/storage/v1/object/public/talent-cvs/${selectedProfileDetail.cv_file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={16} className="mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-red-600 flex items-center gap-2">
              <AlertCircle size={24} />
              Delete Profile?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteConfirm?.name}</strong>'s profile and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTalent}>
              <Trash2 size={16} className="mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stat Card Listing Dialog */}
      <Dialog open={statListingOpen} onOpenChange={setStatListingOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {statListingType === 'pending_reviews' && 'Pending Reviews'}
              {statListingType === 'pending_sponsors' && 'Pending Sponsors'}
              {statListingType === 'approved_talent' && 'Approved Talent'}
              {statListingType === 'active_sponsors' && 'Active Sponsors'}
            </DialogTitle>
            <DialogDescription>
              {statListingLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading data...
                </span>
              ) : (
                <>
                  {statListingType === 'pending_reviews' && (
                    <span>{statListingData.pendingTalent.length} talent awaiting approval</span>
                  )}
                  {statListingType === 'pending_sponsors' && (
                    <span>{statListingData.pendingSponsors.length} sponsors awaiting approval</span>
                  )}
                  {statListingType === 'approved_talent' && (
                    <span>{statListingData.approvedTalent.length} approved talent profiles</span>
                  )}
                  {statListingType === 'active_sponsors' && (
                    <span>{statListingData.activeSponsors.length} active sponsor profiles</span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {statListingLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Pending Reviews List */}
                {statListingType === 'pending_reviews' && (
                  statListingData.pendingTalent.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending reviews</p>
                  ) : (
                    statListingData.pendingTalent.map((talent) => (
                      <div key={talent.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center font-medium">
                            {talent.full_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{talent.full_name}</p>
                            <p className="text-sm text-gray-500">{talent.email}</p>
                            <p className="text-xs text-gray-400 truncate max-w-md">{talent.headline}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => {
                          setSelectedTalent(talent);
                          setStatListingOpen(false);
                        }}>
                          Review
                        </Button>
                      </div>
                    ))
                  )
                )}
                
                {/* Pending Sponsors List */}
                {statListingType === 'pending_sponsors' && (
                  statListingData.pendingSponsors.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending sponsors</p>
                  ) : (
                    statListingData.pendingSponsors.map((sponsor) => (
                      <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 text-white flex items-center justify-center font-medium">
                            {sponsor.company_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{sponsor.company_name}</p>
                            <p className="text-sm text-gray-500">{sponsor.contact_email}</p>
                            <p className="text-xs text-gray-400">{sponsor.industry}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => {
                          setSelectedSponsor(sponsor);
                          setStatListingOpen(false);
                        }}>
                          Review
                        </Button>
                      </div>
                    ))
                  )
                )}
                
                {/* Approved Talent List */}
                {statListingType === 'approved_talent' && (
                  statListingData.approvedTalent.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-gray-500">No approved talent found</p>
                      {(metrics?.approved_talent || 0) > 0 && (
                        <>
                          <p className="text-sm text-amber-600">
                            Note: Metrics show {metrics?.approved_talent} approved talent, but none loaded.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              loadAllData();
                              // Refetch dialog data
                              getAllTalent({ status: 'approved', limit: 500 }).then(({ data }) => {
                                setStatListingData(prev => ({ ...prev, approvedTalent: data || [] }));
                              });
                            }}
                          >
                            <Loader2 size={14} className="mr-2" />
                            Refresh Data
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    statListingData.approvedTalent.map((talent) => (
                      <div key={talent.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-400 text-white flex items-center justify-center font-medium">
                            {talent.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{talent.profiles?.full_name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-md">{talent.headline}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{talent.industry}</Badge>
                              <Badge variant="secondary" className="text-xs">{talent.seniority_level}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedProfileDetail(talent);
                          setStatListingOpen(false);
                        }}>
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </div>
                    ))
                  )
                )}
                
                {/* Active Sponsors List */}
                {statListingType === 'active_sponsors' && (
                  statListingData.activeSponsors.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-gray-500">No active sponsors found</p>
                      {(metrics?.approved_sponsors || 0) > 0 && (
                        <>
                          <p className="text-sm text-amber-600">
                            Note: Metrics show {metrics?.approved_sponsors} approved sponsors, but none loaded.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              loadAllData();
                              // Refetch dialog data
                              getAllSponsors({ status: 'approved', limit: 500 }).then(({ data }) => {
                                setStatListingData(prev => ({ ...prev, activeSponsors: data || [] }));
                              });
                            }}
                          >
                            <Loader2 size={14} className="mr-2" />
                            Refresh Data
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    statListingData.activeSponsors.map((sponsor) => (
                      <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 text-white flex items-center justify-center font-medium">
                            {sponsor.company_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{sponsor.company_name}</p>
                            <p className="text-sm text-gray-500">{sponsor.contact_email}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{sponsor.industry}</Badge>
                              <Badge variant="secondary" className="text-xs">{sponsor.company_size}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('sponsors')}>
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </div>
                    ))
                  )
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatListingOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (statListingType === 'pending_reviews' || statListingType === 'approved_talent') {
                setActiveTab('talent');
              } else {
                setActiveTab('sponsors');
              }
              setStatListingOpen(false);
            }}>
              View Full Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

import { ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  color: 'orange' | 'blue' | 'green' | 'purple';
  onClick?: () => void;
}

const StatCard = ({ icon: Icon, label, value, trend, color, onClick }: StatCardProps) => {
  const colorMap = {
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-500' },
  };

  const colors = colorMap[color];

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/50 transition-all' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={colors.icon} size={24} />
          </div>
          {trend !== 'neutral' && (
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickStatCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: number }) => (
  <Card className="flex items-center gap-4 p-4">
    <div className="p-3 rounded-lg bg-gray-100">
      <Icon className="text-gray-600" size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Card>
);

const StatusBadge = ({ status }: { status: string; type?: string }) => {
  const variantMap: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    // Talent statuses
    approved: 'default',
    rejected: 'destructive',
    submitted: 'secondary',
    vetted: 'outline',
    draft: 'outline',
    // Sponsor statuses
    pending: 'outline',
    // Request statuses
    requested: 'secondary',
    accepted: 'default',
    declined: 'destructive',
    intro_sent: 'secondary',
    closed: 'outline',
    // Contact statuses
    new: 'destructive',
    read: 'secondary',
    replied: 'default',
    archived: 'outline',
  };

  const classNameMap: Record<string, string> = {
    approved: 'bg-green-100 text-green-700 hover:bg-green-100',
    submitted: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
    vetted: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    requested: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    accepted: 'bg-green-100 text-green-700 hover:bg-green-100',
    intro_sent: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    read: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    replied: 'bg-green-100 text-green-700 hover:bg-green-100',
  };

  const variant = variantMap[status] || 'outline';
  const className = classNameMap[status] || '';
  
  const labels: Record<string, string> = {
    ...TALENT_STATUS_LABELS,
    ...SPONSOR_STATUS_LABELS,
    ...REQUEST_STATUS_LABELS,
    new: 'New',
    read: 'Read',
    replied: 'Replied',
    archived: 'Archived',
  };

  return (
    <Badge variant={variant} className={className}>
      {labels[status] || status}
    </Badge>
  );
};



const TalentCard = ({ 
  talent, 
  onView, 
  onReview, 
  onDelete 
}: { 
  talent: TalentProfile; 
  onView: () => void;
  onReview: () => void;
  onDelete: () => void;
}) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-pink-500 to-orange-400">
            {(talent.profiles?.full_name || talent.headline)?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold">{talent.profiles?.full_name || talent.headline || 'Anonymous'}</p>
            <p className="text-sm text-gray-500">{talent.profiles?.email || 'No email'}</p>
          </div>
        </div>
        <StatusBadge status={talent.status} type="talent" />
      </div>
      
      <div className="mt-4">
        <p className="text-sm line-clamp-2">{talent.headline || 'No headline'}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {talent.industry && <Badge variant="outline">{talent.industry}</Badge>}
          {talent.seniority_level && <Badge variant="secondary">{talent.seniority_level}</Badge>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-xs text-gray-500">
          {talent.submitted_at ? format(parseISO(talent.submitted_at), 'MMM dd, yyyy') : 'Not submitted'}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye size={16} />
          </Button>
          {talent.status === 'submitted' && (
            <Button size="sm" onClick={onReview}>Review</Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  </Card>
);

export default AdminDashboard;
