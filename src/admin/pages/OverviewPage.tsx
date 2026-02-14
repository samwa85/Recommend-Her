// ============================================================================
// OVERVIEW PAGE - Admin Dashboard Home with Live Data
// ============================================================================

import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  MessageSquare,
  Mail,
  UserCheck,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminLayout } from '../components/AdminLayout';
import { KPICard, KPIGrid } from '../components/KPICard';
import { ChartCard, ChartGrid } from '../components/ChartCard';
import { SkeletonPage } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { 
  useDashboardMetrics, 
  useActivityLogs, 
  useAnalytics,
  useStatusCounts 
} from '../hooks/useAdminData';
import { formatRelativeTime } from '@/lib/format/date';
import { cn } from '@/lib/utils';

// ============================================================================
// HELPER FUNCTIONS (moved outside component)
// ============================================================================

type IconName = 'UserCheck' | 'Building2' | 'Mail' | 'MessageSquare' | 'Activity';

const getActionIconName = (type: string): IconName => {
  if (type === 'talent') return 'UserCheck';
  if (type === 'sponsor') return 'Building2';
  if (type === 'message') return 'Mail';
  if (type === 'request') return 'MessageSquare';
  return 'Activity';
};

const getActionColor = (type: string): string => {
  if (type === 'talent') return 'text-blue-600 bg-blue-50';
  if (type === 'sponsor') return 'text-green-600 bg-green-50';
  if (type === 'message') return 'text-yellow-600 bg-yellow-50';
  if (type === 'request') return 'text-purple-600 bg-purple-50';
  return 'text-gray-600 bg-gray-50';
};

// Icon mapping object (outside component)
const ICON_MAP = {
  UserCheck,
  Building2,
  Mail,
  MessageSquare,
  Activity,
};

// ============================================================================
// COLORS
// ============================================================================

const COLORS = {
  primary: '#f43f5e',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  gray: '#6b7280',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OverviewPage() {
  const navigate = useNavigate();

  // Data hooks - Live Supabase data
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    lastUpdated, 
    refresh 
  } = useDashboardMetrics({ autoRefresh: true });
  
  const { data: activityLogs, isLoading: logsLoading } = useActivityLogs({ limit: 10 });
  const { trend: analyticsTrend, isLoading: analyticsLoading } = useAnalytics({ days: 30 });
  const { counts: talentStatusCounts, isLoading: countsLoading } = useStatusCounts('talent');

  if (metricsLoading) {
    return (
      <AdminLayout>
        <SkeletonPage />
      </AdminLayout>
    );
  }

  if (metricsError) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data.{' '}
            <Button variant="link" onClick={refresh} className="p-0 h-auto">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  // Prepare chart data
  const trendData = analyticsTrend?.slice(-7).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    talent: item.talent_count,
    sponsors: item.sponsor_count,
  })) || [];

  // Status distribution data
  const statusData = talentStatusCounts.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
  }));

  return (
    <AdminLayout
      isLoading={metricsLoading}
      onRefresh={refresh}
      lastUpdated={lastUpdated}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* KPI Cards */}
      <KPIGrid className="mb-8">
        <KPICard
          title="Total Talent"
          value={metrics?.talent?.total || 0}
          trend={metrics?.talent?.newThisWeek}
          trendLabel="this week"
          subtitle={`${metrics?.talent?.newToday || 0} new today`}
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/talent')}
        />
        <KPICard
          title="Total Sponsors"
          value={metrics?.sponsors?.total || 0}
          trend={metrics?.sponsors?.newThisMonth}
          trendLabel="this month"
          subtitle={`${metrics?.sponsors?.active || 0} active`}
          icon={Building2}
          color="green"
          onClick={() => navigate('/admin/sponsors')}
        />
        <KPICard
          title="Open Requests"
          value={metrics?.requests?.open || 0}
          trend={metrics?.requests?.inReview}
          trendLabel="in review"
          subtitle={`${metrics?.requests?.urgent || 0} urgent`}
          icon={MessageSquare}
          color="purple"
          onClick={() => navigate('/admin/requests')}
        />
        <KPICard
          title="Unread Messages"
          value={metrics?.messages?.unread || 0}
          trend={metrics?.messages?.newToday}
          trendLabel="new today"
          subtitle={`${metrics?.messages?.replied || 0} replied`}
          icon={Mail}
          color="yellow"
          onClick={() => navigate('/admin/messages')}
        />
      </KPIGrid>

      {/* Charts Row */}
      <ChartGrid className="mb-8">
        {/* Submissions Trend Chart */}
        <ChartCard
          title="Submissions Trend"
          description="New talent and sponsors over the last 7 days"
          isLoading={analyticsLoading}
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorTalent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSponsors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="talent"
                name="Talent"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorTalent)"
              />
              <Area
                type="monotone"
                dataKey="sponsors"
                name="Sponsors"
                stroke={COLORS.secondary}
                fillOpacity={1}
                fill="url(#colorSponsors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Distribution */}
        <ChartCard
          title="Talent Status Distribution"
          description="Current status breakdown"
          isLoading={countsLoading}
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </ChartGrid>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/talent?status=pending')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <QuickActionItem
                icon={UserCheck}
                title="Pending Talent Reviews"
                count={metrics?.talent?.pending || 0}
                color="blue"
                onClick={() => navigate('/admin/talent?status=pending')}
              />
              <QuickActionItem
                icon={Building2}
                title="Open Requests"
                count={metrics?.requests?.open || 0}
                color="purple"
                onClick={() => navigate('/admin/requests')}
              />
              <QuickActionItem
                icon={Mail}
                title="Unread Messages"
                count={metrics?.messages?.unread || 0}
                color="yellow"
                onClick={() => navigate('/admin/messages?status=unread')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {logsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <ActivityItem key={log.id} log={log} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface QuickActionItemProps {
  icon: React.ElementType;
  title: string;
  count: number;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  onClick: () => void;
}

function QuickActionItem({ icon: Icon, title, count, color, onClick }: QuickActionItemProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className={cn('p-2.5 rounded-lg', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {count === 0 ? 'All caught up!' : `${count} item${count === 1 ? '' : 's'} pending`}
          </p>
        </div>
      </div>
      {count > 0 && (
        <Badge variant="secondary" className="ml-4">
          {count}
        </Badge>
      )}
    </button>
  );
}

interface ActivityItemProps {
  log: {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  };
}

function ActivityItem({ log }: ActivityItemProps) {
  const iconName = getActionIconName(log.type);
  const IconComponent = ICON_MAP[iconName];
  const colorClass = getActionColor(log.type);

  return (
    <div className="flex gap-3">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', colorClass)}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{log.title}</p>
        <p className="text-xs text-muted-foreground">{log.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={log.status} type={log.type as 'talent' | 'sponsor' | 'message' | 'request' | 'user' } />
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(log.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
