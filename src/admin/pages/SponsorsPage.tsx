// ============================================================================
// SPONSORS PAGE - Detailed Sponsor Management
// ============================================================================

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  Pencil,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  FileX,
  Mail,
  Phone,
  Building2,
  Globe,
  Linkedin,
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
  User,
  Loader2,
  Undo,
  Redo,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox as FormCheckbox } from '@/components/ui/checkbox';
import { AdminLayout } from '../components/AdminLayout';
import { SkeletonTable } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { SponsorCard } from '../components/SponsorCard';
import { useSponsorList, useSponsorDetail } from '../hooks/useAdminData';
import { updateSponsorStatus as updateSponsorStatusQuery, deleteSponsor as deleteSponsorQuery, updateSponsor as updateSponsorQuery, getSponsorById } from '@/lib/queries';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { SponsorStatus, SPONSOR_STATUS_LABELS } from '@/lib/types/enums';
import type { SponsorProfile } from '@/lib/types/db';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const SPONSORSHIP_AMOUNTS = [
  { value: 'under_5k', label: 'Under $5,000' },
  { value: '5k_10k', label: '$5,000 - $10,000' },
  { value: '10k_25k', label: '$10,000 - $25,000' },
  { value: '25k_50k', label: '$25,000 - $50,000' },
  { value: '50k_plus', label: '$50,000+' },
];

const FOCUS_AREAS = [
  'Mentorship',
  'Funding',
  'Networking',
  'Speaking Opportunities',
  'Board Positions',
  'Job Referrals',
  'Event Sponsorship',
  'Training & Development',
];

const ROLE_TYPES = [
  'Executive (C-Suite)',
  'VP / Director',
  'Senior Manager',
  'Manager',
  'Individual Contributor',
  'Board Member',
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'archive' | 'delete'>('activate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    job_title: '',
    linkedin_url: '',
    
    // Company Information
    company_name: '',
    company_website: '',
    company_size: '',
    industry: '',
    company_description: '',
    
    // Sponsor Details
    is_recruiter: false,
    focus_areas: [] as string[],
    role_types: [] as string[],
    sponsorship_amount: '',
    message: '',
    internal_notes: '',
    
    // Status
    status: 'pending' as SponsorStatus,
  });
  const [activeTab, setActiveTab] = useState('personal');

  // ============================================================================
  // ROBUSTNESS STATE
  // ============================================================================
  
  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  // Optimistic update state
  const [originalSponsor, setOriginalSponsor] = useState<SponsorProfile | null>(null);
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);
  
  // Conflict detection
  const [lastModified, setLastModified] = useState<string>('');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictSponsor, setConflictSponsor] = useState<SponsorProfile | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<typeof editForm[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistorySize = 50;
  
  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false);
  const initialFormRef = useRef<typeof editForm | null>(null);
  
  // Auto-save
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

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

  // ============================================================================
  // ROBUSTNESS HELPER FUNCTIONS (defined before handlers that use them)
  // ============================================================================
  
  // Map error codes to user-friendly messages
  const getErrorMessage = (error: Error | unknown): string => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('23505')) return 'A sponsor with this email already exists';
    if (message.includes('23503')) return 'Invalid reference - check related data';
    if (message.includes('42501') || message.includes('insufficient_privilege')) return 'Permission denied - contact administrator';
    if (message.includes('Network') || message.includes('fetch') || message.includes('connection')) return 'Connection lost. Changes will be saved when connection is restored.';
    if (message.includes('timeout')) return 'Request timed out. Please try again.';
    return message;
  };
  
  // Real-time field validation
  const validateField = useCallback((field: string, value: unknown): string | null => {
    switch (field) {
      case 'email':
        if (!value || typeof value !== 'string') return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;
      case 'full_name':
        if (!value || typeof value !== 'string' || value.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
      case 'company_name':
        if (!value || typeof value !== 'string' || value.trim().length < 2) return 'Company name is required';
        return null;
      case 'company_website':
        if (value && typeof value === 'string' && value.trim() && !/^https?:\/\/.+/.test(value)) {
          return 'Must start with http:// or https://';
        }
        return null;
      case 'linkedin_url':
        if (value && typeof value === 'string' && value.trim() && !value.includes('linkedin.com')) {
          return 'Must be a valid LinkedIn URL';
        }
        return null;
      default:
        return null;
    }
  }, []);
  
  // Track field touch
  const markFieldTouched = useCallback((field: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
  }, []);
  
  // Check if form is dirty
  const checkDirty = useCallback((current: typeof editForm, initial: typeof editForm | null): boolean => {
    if (!initial) return false;
    return JSON.stringify(current) !== JSON.stringify(initial);
  }, []);
  
  // Clear draft
  const clearDraft = useCallback((sponsorId: string) => {
    localStorage.removeItem(`sponsor_draft_${sponsorId}`);
    setHasDraft(false);
  }, []);
  
  // Load draft from localStorage
  const loadDraft = useCallback((sponsorId: string): boolean => {
    const draft = localStorage.getItem(`sponsor_draft_${sponsorId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const draftTime = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && parsed.originalId === sponsorId) {
          return true;
        } else {
          localStorage.removeItem(`sponsor_draft_${sponsorId}`);
        }
      } catch {
        localStorage.removeItem(`sponsor_draft_${sponsorId}`);
      }
    }
    return false;
  }, []);
  
  // Validate all required fields
  const validateAllFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const fields = ['full_name', 'email', 'company_name'];
    
    fields.forEach(field => {
      const error = validateField(field, editForm[field as keyof typeof editForm]);
      if (error) errors[field] = error;
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editForm, validateField]);
  
  // Add to history for undo/redo
  const addToHistory = useCallback((newState: typeof editForm) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...newState });
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [historyIndex]);
  
  // Undo action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditForm(history[newIndex]);
      toast.info('Undo successful');
    }
  }, [history, historyIndex]);
  
  // Redo action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditForm(history[newIndex]);
      toast.info('Redo successful');
    }
  }, [history, historyIndex]);
  
  // Get only changed fields for partial update
  const getChangedFields = useCallback((original: SponsorProfile | null, current: typeof editForm): Partial<SponsorProfile> => {
    if (!original) return {};
    const changes: Partial<SponsorProfile> = {};
    
    const compareFields: (keyof typeof current)[] = [
      'full_name', 'email', 'phone', 'job_title', 'linkedin_url',
      'company_name', 'company_website', 'company_size', 'industry', 'company_description',
      'is_recruiter', 'focus_areas', 'role_types', 'sponsorship_amount', 'message', 'internal_notes', 'status'
    ];
    
    compareFields.forEach(field => {
      const originalValue = original[field as keyof SponsorProfile];
      const currentValue = current[field];
      
      if (Array.isArray(currentValue)) {
        const originalArray = (originalValue as unknown as string[]) || [];
        if (JSON.stringify(originalArray.sort()) !== JSON.stringify([...currentValue].sort())) {
          (changes as Record<string, unknown>)[field] = currentValue.length > 0 ? currentValue : null;
        }
      } else if (originalValue !== currentValue && !(originalValue === null && !currentValue)) {
        (changes as Record<string, unknown>)[field] = currentValue || null;
      }
    });
    
    return changes;
  }, []);
  
  // Auto-save draft to localStorage
  const saveDraft = useCallback(() => {
    if (selectedSponsorId && isDirty) {
      localStorage.setItem(`sponsor_draft_${selectedSponsorId}`, JSON.stringify({
        form: editForm,
        timestamp: new Date().toISOString(),
        originalId: selectedSponsorId
      }));
      setLastAutoSaved(new Date());
      setHasDraft(true);
    }
  }, [selectedSponsorId, editForm, isDirty]);
  
  // Check for conflicts before saving
  const checkForConflicts = useCallback(async (): Promise<boolean> => {
    if (!selectedSponsorId || !lastModified) return false;
    
    const current = await getSponsorById(selectedSponsorId);
    if (current.data?.updated_at !== lastModified) {
      setConflictSponsor(current.data || null);
      setShowConflictDialog(true);
      return true;
    }
    return false;
  }, [selectedSponsorId, lastModified]);
  
  // Cancel edit with confirmation if dirty
  const handleCancelEdit = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Discard them?');
      if (!confirm) return;
    }
    setEditDialogOpen(false);
    setFieldErrors({});
    setTouchedFields(new Set());
  }, [isDirty]);

  const handleOpenEdit = useCallback((sponsor: SponsorProfile) => {
    setSelectedSponsorId(sponsor.id);
    setLastModified(sponsor.updated_at);
    setOriginalSponsor(sponsor);
    setFieldErrors({});
    setTouchedFields(new Set());
    setHistory([]);
    setHistoryIndex(-1);
    setHasDraft(false);
    
    const formData = {
      // Personal Information
      full_name: sponsor.full_name || '',
      email: sponsor.email || '',
      phone: sponsor.phone || '',
      job_title: sponsor.job_title || '',
      linkedin_url: sponsor.linkedin_url || '',
      
      // Company Information
      company_name: sponsor.company_name || '',
      company_website: sponsor.company_website || '',
      company_size: sponsor.company_size || '',
      industry: sponsor.industry || '',
      company_description: sponsor.company_description || '',
      
      // Sponsor Details
      is_recruiter: sponsor.is_recruiter || false,
      focus_areas: sponsor.focus_areas || [],
      role_types: sponsor.role_types || [],
      sponsorship_amount: sponsor.sponsorship_amount || '',
      message: sponsor.message || '',
      internal_notes: sponsor.internal_notes || '',
      
      // Status
      status: (sponsor.status as SponsorStatus) || 'pending',
    };
    
    // Check for draft
    if (loadDraft(sponsor.id)) {
      const draft = JSON.parse(localStorage.getItem(`sponsor_draft_${sponsor.id}`) || '{}');
      setEditForm(draft.form);
      initialFormRef.current = draft.form;
      setHasDraft(true);
      toast.info('Restored unsaved changes from draft', {
        action: {
          label: 'Discard',
          onClick: () => {
            setEditForm(formData);
            initialFormRef.current = formData;
            clearDraft(sponsor.id);
            setHasDraft(false);
          }
        }
      });
    } else {
      setEditForm(formData);
      initialFormRef.current = formData;
    }
    
    // Add initial state to history
    setHistory([formData]);
    setHistoryIndex(0);
    
    setActiveTab('personal');
    setEditDialogOpen(true);
  }, [loadDraft, clearDraft]);

  const handleSaveEdit = useCallback(async (forceSave = false) => {
    if (!selectedSponsorId || !originalSponsor) return;
    
    // Validate all fields
    if (!validateAllFields()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    // Check for conflicts (unless force save)
    if (!forceSave) {
      const hasConflict = await checkForConflicts();
      if (hasConflict) return;
    }

    setIsSubmitting(true);
    setIsOptimisticUpdating(true);

    // Optimistically update the UI
    const optimisticSponsor = { ...originalSponsor, ...editForm };
    
    try {
      // Get only changed fields for partial update
      const changes = getChangedFields(originalSponsor, editForm);
      
      // If nothing changed, just close the dialog
      if (Object.keys(changes).length === 0) {
        toast.info('No changes to save');
        setEditDialogOpen(false);
        return;
      }
      
      // Add metadata
      changes.updated_at = new Date().toISOString();
      
      const result = await updateSponsorQuery(selectedSponsorId, changes);
      
      if (result.error) throw result.error;
      
      // Clear draft on successful save
      clearDraft(selectedSponsorId);
      setHasDraft(false);
      setIsDirty(false);
      
      toast.success('Sponsor updated successfully', {
        description: Object.keys(changes).length > 1 
          ? `${Object.keys(changes).length - 1} fields updated` 
          : undefined
      });
      
      setEditDialogOpen(false);
      refresh();
    } catch (err) {
      console.error('Error updating sponsor:', err);
      const errorMessage = getErrorMessage(err);
      toast.error('Failed to update sponsor', {
        description: errorMessage,
        action: errorMessage.includes('Connection') ? {
          label: 'Retry',
          onClick: () => handleSaveEdit()
        } : undefined
      });
    } finally {
      setIsSubmitting(false);
      setIsOptimisticUpdating(false);
    }
  }, [selectedSponsorId, originalSponsor, editForm, validateAllFields, checkForConflicts, getChangedFields, clearDraft, refresh]);

  // Generic field update with history tracking
  const updateField = useCallback((field: keyof typeof editForm, value: unknown) => {
    setEditForm(prev => {
      const newState = { ...prev, [field]: value };
      addToHistory(newState);
      return newState;
    });
    
    // Validate on change
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error || '' }));
  }, [addToHistory, validateField]);
  
  const toggleFocusArea = (area: string) => {
    setEditForm(prev => {
      const newAreas = prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area];
      const newState = { ...prev, focus_areas: newAreas };
      addToHistory(newState);
      return newState;
    });
  };

  const toggleRoleType = (role: string) => {
    setEditForm(prev => {
      const newRoles = prev.role_types.includes(role)
        ? prev.role_types.filter(r => r !== role)
        : [...prev.role_types, role];
      const newState = { ...prev, role_types: newRoles };
      addToHistory(newState);
      return newState;
    });
  };
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editDialogOpen) return;
      
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveEdit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editDialogOpen, undo, redo, handleSaveEdit]);
  
  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && editDialogOpen) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, editDialogOpen]);
  
  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (isDirty && editDialogOpen) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 5000); // Auto-save after 5 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editForm, isDirty, editDialogOpen, saveDraft]);
  
  // Track dirty state
  useEffect(() => {
    if (initialFormRef.current) {
      setIsDirty(checkDirty(editForm, initialFormRef.current));
    }
  }, [editForm, checkDirty]);
  
  const handleBulkAction = useCallback(async () => {
    const ids = Array.from(selectedRows);
    
    toast.promise(
      async () => {
        const results = await Promise.allSettled(
          ids.map((id) => {
            if (bulkAction === 'delete') return deleteSponsorQuery(id);
            if (bulkAction === 'activate') return updateSponsorStatusQuery(id, SponsorStatus.ACTIVE);
            if (bulkAction === 'deactivate') return updateSponsorStatusQuery(id, SponsorStatus.INACTIVE);
            return updateSponsorStatusQuery(id, SponsorStatus.ARCHIVED);
          })
        );

        // Count successes and failures
        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            failureCount++;
            errors.push(`Item ${index + 1}: ${result.reason}`);
          } else {
            const value = result.value as { success?: boolean; error?: Error | null };
            const isSuccess = 'success' in value 
              ? value.success === true 
              : value.error == null;
            
            if (isSuccess) {
              successCount++;
            } else {
              failureCount++;
              if (value.error?.message) {
                errors.push(`Item ${index + 1}: ${value.error.message}`);
              }
            }
          }
        });

        // If all failed, throw error with details
        if (successCount === 0) {
          const errorMsg = failureCount > 0 
            ? `All ${failureCount} operations failed. ${errors[0] || 'Check RLS policies or permissions.'}`
            : 'No sponsor records were updated';
          throw new Error(errorMsg);
        }

        // If partial success, show warning
        if (failureCount > 0) {
          toast.warning(`${successCount} succeeded, ${failureCount} failed. Some items may have been skipped due to permissions.`);
        }

        setSelectedRows(new Set());
        setSelectAll(false);
        setBulkActionDialogOpen(false);
        refresh();
        return `${successCount} sponsor(s) ${bulkAction === 'delete' ? 'deleted' : 'updated'}`;
      },
      {
        loading: `Processing ${ids.length} sponsor(s)...`,
        success: (message) => message,
        error: (err) => err instanceof Error ? err.message : 'Bulk action failed',
      }
    );
  }, [selectedRows, bulkAction, refresh]);

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
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(sponsor)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
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
                    onClick={() => handleOpenEdit(selectedSponsor)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
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

      {/* Edit Sponsor Dialog - Robust Form */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) handleCancelEdit();
        else setEditDialogOpen(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>Edit Sponsor</DialogTitle>
                <DialogDescription>
                  Update sponsor profile details. All fields marked with * are required.
                  {isDirty && <span className="text-amber-600 ml-2">• Unsaved changes</span>}
                </DialogDescription>
              </div>
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                {/* Undo/Redo */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>
                {/* Draft indicator */}
                {hasDraft && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    <Save className="w-3 h-3 mr-1" />
                    Draft
                  </Badge>
                )}
                {/* Auto-save indicator */}
                {lastAutoSaved && (
                  <span className="text-xs text-muted-foreground">
                    Auto-saved {lastAutoSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {/* Validation Summary */}
          {Object.keys(fieldErrors).length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix {Object.keys(fieldErrors).length} error(s) before saving
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4 shrink-0">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="sponsor">Sponsor Details</TabsTrigger>
              <TabsTrigger value="notes">Notes & Status</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4 mt-0 focus-visible:outline-none">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-full_name">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-full_name"
                          value={editForm.full_name}
                          onChange={(e) => updateField('full_name', e.target.value)}
                          onBlur={() => markFieldTouched('full_name')}
                          placeholder="Enter full name"
                          className={cn(fieldErrors["full_name"] && touchedFields.has("full_name") && 'border-red-500')}
                        />
                        {fieldErrors["full_name"] && touchedFields.has("full_name") && (
                          <p className="text-xs text-red-500">{fieldErrors["full_name"]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-job_title">Job Title</Label>
                        <Input
                          id="edit-job_title"
                          value={editForm.job_title}
                          onChange={(e) => updateField('job_title', e.target.value)}
                          placeholder="e.g., VP of Engineering"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="edit-email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            onBlur={() => markFieldTouched('email')}
                            placeholder="email@company.com"
                            className={cn('pl-9', fieldErrors["email"] && touchedFields.has("email") && 'border-red-500')}
                          />
                        </div>
                        {fieldErrors["email"] && touchedFields.has("email") && (
                          <p className="text-xs text-red-500">{fieldErrors["email"]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="edit-phone"
                            value={editForm.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="edit-linkedin_url">LinkedIn URL</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="edit-linkedin_url"
                            value={editForm.linkedin_url}
                            onChange={(e) => updateField('linkedin_url', e.target.value)}
                            onBlur={() => markFieldTouched('linkedin_url')}
                            placeholder="https://linkedin.com/in/profile"
                            className={cn('pl-9', fieldErrors["linkedin_url"] && touchedFields.has("linkedin_url") && 'border-red-500')}
                          />
                        </div>
                        {fieldErrors["linkedin_url"] && touchedFields.has("linkedin_url") && (
                          <p className="text-xs text-red-500">{fieldErrors["linkedin_url"]}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Company Information Tab */}
              <TabsContent value="company" className="space-y-4 mt-0 focus-visible:outline-none">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-company_name">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-company_name"
                          value={editForm.company_name}
                          onChange={(e) => updateField('company_name', e.target.value)}
                          onBlur={() => markFieldTouched('company_name')}
                          placeholder="Enter company name"
                          className={cn(fieldErrors["company_name"] && touchedFields.has("company_name") && 'border-red-500')}
                        />
                        {fieldErrors["company_name"] && touchedFields.has("company_name") && (
                          <p className="text-xs text-red-500">{fieldErrors["company_name"]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-company_website">Company Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="edit-company_website"
                            value={editForm.company_website}
                            onChange={(e) => updateField('company_website', e.target.value)}
                            onBlur={() => markFieldTouched('company_website')}
                            placeholder="https://company.com"
                            className={cn('pl-9', fieldErrors["company_website"] && touchedFields.has("company_website") && 'border-red-500')}
                          />
                        </div>
                        {fieldErrors["company_website"] && touchedFields.has("company_website") && (
                          <p className="text-xs text-red-500">{fieldErrors["company_website"]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-industry">Industry</Label>
                        <Select
                          value={editForm.industry}
                          onValueChange={(v) => updateField('industry', v)}
                        >
                          <SelectTrigger id="edit-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-company_size">Company Size</Label>
                        <Select
                          value={editForm.company_size}
                          onValueChange={(v) => updateField('company_size', v)}
                        >
                          <SelectTrigger id="edit-company_size">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZES.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="edit-company_description">Company Description</Label>
                        <Textarea
                          id="edit-company_description"
                          value={editForm.company_description}
                          onChange={(e) => updateField('company_description', e.target.value)}
                          placeholder="Brief description of the company..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sponsor Details Tab */}
              <TabsContent value="sponsor" className="space-y-4 mt-0 focus-visible:outline-none">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Sponsor Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Recruiter Toggle */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-is_recruiter"
                        checked={editForm.is_recruiter}
                        onCheckedChange={(checked) => 
                          updateField('is_recruiter', checked === true)
                        }
                      />
                      <Label htmlFor="edit-is_recruiter" className="cursor-pointer">
                        This is a recruiter/agency
                      </Label>
                    </div>

                    <Separator />

                    {/* Sponsorship Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-sponsorship_amount">Sponsorship Interest</Label>
                      <Select
                        value={editForm.sponsorship_amount}
                        onValueChange={(v) => updateField('sponsorship_amount', v)}
                      >
                        <SelectTrigger id="edit-sponsorship_amount" className="w-full sm:w-[300px]">
                          <SelectValue placeholder="Select sponsorship level" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPONSORSHIP_AMOUNTS.map((amount) => (
                            <SelectItem key={amount.value} value={amount.value}>
                              {amount.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Focus Areas */}
                    <div className="space-y-2">
                      <Label>Focus Areas</Label>
                      <div className="flex flex-wrap gap-2">
                        {FOCUS_AREAS.map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleFocusArea(area)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                              editForm.focus_areas.includes(area)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            )}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Role Types */}
                    <div className="space-y-2">
                      <Label>Role Types of Interest</Label>
                      <div className="flex flex-wrap gap-2">
                        {ROLE_TYPES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleRoleType(role)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                              editForm.role_types.includes(role)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            )}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-message">Message / Notes from Sponsor</Label>
                      <Textarea
                        id="edit-message"
                        value={editForm.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        placeholder="Any additional information or message from the sponsor..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes & Status Tab */}
              <TabsContent value="notes" className="space-y-4 mt-0 focus-visible:outline-none">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={editForm.status}
                      onValueChange={(v) => updateField('status', v as SponsorStatus)}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Internal Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={editForm.internal_notes}
                      onChange={(e) => updateField('internal_notes', e.target.value)}
                      placeholder="Private notes for admin use only..."
                      rows={6}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSaveEdit()} 
              disabled={isSubmitting || !isDirty} 
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Conflict Detected
            </DialogTitle>
            <DialogDescription>
              This sponsor was modified by another user since you started editing.
              
              <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Last modified: {conflictSponsor ? formatRelativeTime(conflictSponsor.updated_at) : 'Unknown'}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>What would you like to do?</p>
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowConflictDialog(false);
                  if (conflictSponsor) {
                    handleOpenEdit(conflictSponsor);
                    toast.info('Refreshed with latest data');
                  }
                }}
              >
                Reload Latest Data
              </Button>
              <Button 
                onClick={() => {
                  setShowConflictDialog(false);
                  handleSaveEdit(true); // Force save
                }}
              >
                Overwrite Their Changes
              </Button>
            </div>
          </div>
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
