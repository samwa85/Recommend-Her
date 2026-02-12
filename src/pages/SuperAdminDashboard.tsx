import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Building2, Download, Search, Eye, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, Filter, Mail, Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getAllTalent, getAllSponsors, adminReviewTalent, adminReviewSponsor, getCurrentProfile, supabase } from '@/lib/supabase';
import { BUCKETS, getSignedUrl } from '@/lib/storage';
import type { TalentProfile, SponsorProfile } from '@/lib/database.types';

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  inquiry_type: string;
  organization: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

interface RealtimeChange {
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  timestamp: Date;
}

export default function SuperAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [talentList, setTalentList] = useState<TalentProfile[]>([]);
  const [sponsorList, setSponsorList] = useState<SponsorProfile[]>([]);
  const [contactList, setContactList] = useState<ContactSubmission[]>([]);
  const [talentSearch, setTalentSearch] = useState('');
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [talentStatusFilter, setTalentStatusFilter] = useState<string>('all');
  const [sponsorStatusFilter, setSponsorStatusFilter] = useState<string>('all');
  const [contactStatusFilter, setContactStatusFilter] = useState<string>('all');
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorProfile | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [recentChanges, setRecentChanges] = useState<RealtimeChange[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([]);

  useEffect(() => {
    checkAuth();
    
    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    };
  }, []);

  // Handle auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadDataSilent();
      }, 30000); // 30 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!realtimeEnabled) {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
      return;
    }

    // Subscribe to talent_profiles changes
    const talentSubscription = supabase
      .channel('talent-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'talent_profiles' },
        (payload) => {
          console.log('[Realtime] Talent change:', payload);
          addRealtimeChange('talent_profiles', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          loadDataSilent();
        }
      )
      .subscribe();

    // Subscribe to sponsor_profiles changes
    const sponsorSubscription = supabase
      .channel('sponsor-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sponsor_profiles' },
        (payload) => {
          console.log('[Realtime] Sponsor change:', payload);
          addRealtimeChange('sponsor_profiles', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          loadDataSilent();
        }
      )
      .subscribe();

    // Subscribe to contact_submissions changes
    const contactSubscription = supabase
      .channel('contact-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_submissions' },
        (payload) => {
          console.log('[Realtime] Contact change:', payload);
          addRealtimeChange('contact_submissions', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          loadDataSilent();
        }
      )
      .subscribe();

    subscriptionsRef.current = [
      { unsubscribe: () => talentSubscription.unsubscribe() },
      { unsubscribe: () => sponsorSubscription.unsubscribe() },
      { unsubscribe: () => contactSubscription.unsubscribe() },
    ];

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    };
  }, [realtimeEnabled]);

  const addRealtimeChange = useCallback((table: string, type: 'INSERT' | 'UPDATE' | 'DELETE') => {
    const change: RealtimeChange = { table, type, timestamp: new Date() };
    setRecentChanges(prev => [change, ...prev].slice(0, 5)); // Keep last 5 changes
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, []);

  const checkAuth = async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile?.role === 'admin') {
        loadData();
      } else {
        setError('Access denied. Admin privileges required.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Authentication error. Please log in.');
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchAllData();
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('[SuperAdmin] Load error:', err);
      setError('Failed to load data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataSilent = async () => {
    if (isBackgroundLoading) return; // Prevent duplicate requests
    
    setIsBackgroundLoading(true);
    try {
      await fetchAllData();
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('[SuperAdmin] Silent refresh error:', err);
    } finally {
      setIsBackgroundLoading(false);
    }
  };

  const fetchAllData = async () => {
    console.log('[SuperAdmin] Fetching fresh data...');
    
    const [talentResult, sponsorResult, contactResult] = await Promise.all([
      getAllTalent({ limit: 1000 }),
      getAllSponsors({ limit: 1000 }),
      supabase
        .from('v_contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
    ]);

    if (talentResult.data) {
      setTalentList(talentResult.data);
    }
    if (sponsorResult.data) {
      setSponsorList(sponsorResult.data);
    }
    if (contactResult.data) {
      setContactList(contactResult.data);
    }

    // Log any errors
    if (talentResult.error) console.error('[SuperAdmin] Talent error:', talentResult.error);
    if (sponsorResult.error) console.error('[SuperAdmin] Sponsor error:', sponsorResult.error);
    if (contactResult.error) console.error('[SuperAdmin] Contact error:', contactResult.error);
  };
  
  const updateContactStatus = async (contactId: string, newStatus: 'read' | 'replied' | 'archived') => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', contactId);
      
      if (error) throw error;
      // Realtime subscription will trigger refresh automatically
    } catch (err) {
      console.error('Failed to update contact status:', err);
      setError('Failed to update contact status');
    }
  };

  const filteredTalent = talentList.filter(t => {
    const matchesSearch = !talentSearch || 
      t.headline?.toLowerCase().includes(talentSearch.toLowerCase()) ||
      t.industry?.toLowerCase().includes(talentSearch.toLowerCase()) ||
      t.profiles?.full_name?.toLowerCase().includes(talentSearch.toLowerCase()) ||
      t.profiles?.email?.toLowerCase().includes(talentSearch.toLowerCase());
    const matchesStatus = talentStatusFilter === 'all' || t.status === talentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSponsors = sponsorList.filter(s => {
    const matchesSearch = !sponsorSearch || 
      s.org_name?.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      s.industry?.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      s.profiles?.full_name?.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      s.profiles?.email?.toLowerCase().includes(sponsorSearch.toLowerCase());
    const matchesStatus = sponsorStatusFilter === 'all' || s.status === sponsorStatusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const filteredContacts = contactList.filter(c => {
    const matchesSearch = !contactSearch || 
      c.full_name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.inquiry_type?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.message?.toLowerCase().includes(contactSearch.toLowerCase());
    const matchesStatus = contactStatusFilter === 'all' || c.status === contactStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      submitted: 'bg-blue-100 text-blue-700',
      new: 'bg-blue-100 text-blue-700',
      read: 'bg-gray-100 text-gray-700',
      replied: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

  const handleDownloadCV = async (cvFilePath: string | null | undefined) => {
    if (!cvFilePath) return;
    try {
      const signedUrl = await getSignedUrl(BUCKETS.TALENT_CV, cvFilePath, 300);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL:', err);
      setError('Failed to generate download link');
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTableDisplayName = (table: string) => {
    const names: Record<string, string> = {
      'talent_profiles': 'Talent',
      'sponsor_profiles': 'Sponsor',
      'contact_submissions': 'Contact'
    };
    return names[table] || table;
  };

  const getChangeIcon = (type: 'INSERT' | 'UPDATE' | 'DELETE') => {
    switch (type) {
      case 'INSERT': return '+';
      case 'UPDATE': return '↻';
      case 'DELETE': return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Notification Toast */}
        {showNotification && recentChanges.length > 0 && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
            <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <BellRing className="w-5 h-5" />
              <div>
                <p className="font-medium">New data received!</p>
                <p className="text-sm text-green-100">
                  {getTableDisplayName(recentChanges[0].table)} {recentChanges[0].type.toLowerCase()}ed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-500">Manage all talent and sponsors</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                Auto-refresh (30s)
              </Label>
              {isBackgroundLoading && (
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
            
            {/* Realtime toggle */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
              <Switch
                id="realtime"
                checked={realtimeEnabled}
                onCheckedChange={setRealtimeEnabled}
              />
              <Label htmlFor="realtime" className="text-sm cursor-pointer flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Realtime
              </Label>
            </div>
            
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Last refresh time */}
        <div className="text-sm text-gray-500">
          Last updated: {lastRefreshTime.toLocaleTimeString()}
          {recentChanges.length > 0 && (
            <span className="ml-4 text-xs">
              Recent changes:
              {recentChanges.slice(0, 3).map((change, i) => (
                <span key={i} className="ml-2 inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                  <span className="font-bold">{getChangeIcon(change.type)}</span>
                  {getTableDisplayName(change.table)}
                </span>
              ))}
            </span>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Talent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{talentList.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {talentList.filter(t => t.status === 'submitted' || t.status === 'vetted').length} pending review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sponsorList.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {sponsorList.filter(s => s.status === 'pending').length} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">New Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {contactList.filter(c => c.status === 'new').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                of {contactList.length} total submissions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {talentList.filter(t => t.status === 'approved').length + 
                 sponsorList.filter(s => s.status === 'approved').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total approved profiles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="talent" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="talent" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Talent ({filteredTalent.length})
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Sponsors ({filteredSponsors.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contacts ({filteredContacts.length})
            </TabsTrigger>
          </TabsList>

          {/* Talent Tab */}
          <TabsContent value="talent" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search talent..."
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={talentStatusFilter} onValueChange={setTalentStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportToCSV(talentList, 'talent')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Name/Email</th>
                      <th className="text-left p-3 font-medium">Headline</th>
                      <th className="text-left p-3 font-medium">Industry</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTalent.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No talent profiles found
                        </td>
                      </tr>
                    ) : (
                      filteredTalent.map((talent) => (
                        <tr key={talent.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{talent.profiles?.full_name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{talent.profiles?.email || 'N/A'}</div>
                          </td>
                          <td className="p-3 text-sm">{talent.headline || '-'}</td>
                          <td className="p-3 text-sm">{talent.industry || '-'}</td>
                          <td className="p-3">
                            <Badge className={getStatusBadge(talent.status)}>
                              {talent.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {new Date(talent.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedTalent(talent)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search sponsors..."
                  value={sponsorSearch}
                  onChange={(e) => setSponsorSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sponsorStatusFilter} onValueChange={setSponsorStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportToCSV(sponsorList, 'sponsors')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Name/Email</th>
                      <th className="text-left p-3 font-medium">Organization</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSponsors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No sponsors found
                        </td>
                      </tr>
                    ) : (
                      filteredSponsors.map((sponsor) => (
                        <tr key={sponsor.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{sponsor.profiles?.full_name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{sponsor.profiles?.email || 'N/A'}</div>
                          </td>
                          <td className="p-3 text-sm">{sponsor.org_name || '-'}</td>
                          <td className="p-3 text-sm">{sponsor.sponsor_type || '-'}</td>
                          <td className="p-3">
                            <Badge className={getStatusBadge(sponsor.status)}>
                              {sponsor.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {new Date(sponsor.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedSponsor(sponsor)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={contactStatusFilter} onValueChange={setContactStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportToCSV(contactList, 'contacts')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Name/Email</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Organization</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No contact submissions found
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{contact.full_name}</div>
                            <div className="text-gray-500 text-xs">{contact.email}</div>
                          </td>
                          <td className="p-3 text-sm">{contact.inquiry_type}</td>
                          <td className="p-3 text-sm">{contact.organization || '-'}</td>
                          <td className="p-3">
                            <Badge className={getStatusBadge(contact.status)}>
                              {contact.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedContact(contact)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {contact.status === 'new' && (
                                <Button size="sm" className="bg-blue-600" onClick={() => updateContactStatus(contact.id, 'read')}>
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Talent Detail Dialog */}
        <Dialog open={!!selectedTalent} onOpenChange={() => setSelectedTalent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Talent Profile Details</DialogTitle>
            </DialogHeader>
            {selectedTalent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{selectedTalent.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedTalent.profiles?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Headline</label>
                    <p className="font-medium">{selectedTalent.headline || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Industry</label>
                    <p className="font-medium">{selectedTalent.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <Badge className={getStatusBadge(selectedTalent.status)}>
                      {selectedTalent.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Submitted</label>
                    <p className="font-medium">
                      {new Date(selectedTalent.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {selectedTalent.bio && (
                  <div>
                    <label className="text-sm text-gray-500">Bio</label>
                    <p className="mt-1 text-sm">{selectedTalent.bio}</p>
                  </div>
                )}

                {selectedTalent.cv_file_path && (
                  <div>
                    <label className="text-sm text-gray-500">CV</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1"
                      onClick={() => handleDownloadCV(selectedTalent.cv_file_path)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CV
                    </Button>
                  </div>
                )}

                {(selectedTalent.status === 'submitted' || selectedTalent.status === 'vetted') && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        await adminReviewTalent(selectedTalent.id, { decision: 'approved' });
                        setSelectedTalent(null);
                        loadData();
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        await adminReviewTalent(selectedTalent.id, { decision: 'rejected' });
                        setSelectedTalent(null);
                        loadData();
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Sponsor Detail Dialog */}
        <Dialog open={!!selectedSponsor} onOpenChange={() => setSelectedSponsor(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sponsor Details</DialogTitle>
            </DialogHeader>
            {selectedSponsor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{selectedSponsor.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedSponsor.profiles?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Organization</label>
                    <p className="font-medium">{selectedSponsor.org_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-medium">{selectedSponsor.sponsor_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <Badge className={getStatusBadge(selectedSponsor.status)}>
                      {selectedSponsor.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Submitted</label>
                    <p className="font-medium">
                      {new Date(selectedSponsor.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedSponsor.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        await adminReviewSponsor(selectedSponsor.id, 'approved' as const);
                        setSelectedSponsor(null);
                        loadData();
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        await adminReviewSponsor(selectedSponsor.id, 'rejected' as const);
                        setSelectedSponsor(null);
                        loadData();
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Contact Detail Dialog */}
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Submission</DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{selectedContact.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedContact.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-medium">{selectedContact.inquiry_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Organization</label>
                    <p className="font-medium">{selectedContact.organization || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <Badge className={getStatusBadge(selectedContact.status)}>
                      {selectedContact.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Submitted</label>
                    <p className="font-medium">
                      {new Date(selectedContact.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="bg-blue-600" 
                    onClick={() => { updateContactStatus(selectedContact.id, 'read'); setSelectedContact(null); }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button 
                    className="bg-green-600"
                    onClick={() => window.open(`mailto:${selectedContact.email}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => { updateContactStatus(selectedContact.id, 'archived'); setSelectedContact(null); }}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
