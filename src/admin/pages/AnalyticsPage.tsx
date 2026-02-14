// ============================================================================
// ANALYTICS PAGE - Analytics Dashboard with Live Supabase Data
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminLayout } from '../components/AdminLayout';
import { ChartCard, ChartGrid } from '../components/ChartCard';
import { KPICard, KPIGrid } from '../components/KPICard';
import { SkeletonCard } from '../components/LoadingSkeleton';
import { useDashboardMetrics, useAnalytics, useStatusCounts } from '../hooks/useAdminData';
import { formatDate } from '@/lib/format/date';
import { cn } from '@/lib/utils';

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
  teal: '#14b8a6',
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.teal];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  
  // Data fetching
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics({ autoRefresh: false });
  const { trend, isLoading: trendLoading } = useAnalytics({ days: parseInt(dateRange) });
  const { counts: talentStatusCounts, isLoading: talentCountsLoading } = useStatusCounts('talent');
  const { counts: sponsorStatusCounts, isLoading: sponsorCountsLoading } = useStatusCounts('sponsor');
  const { counts: messageStatusCounts, isLoading: messageCountsLoading } = useStatusCounts('message');

  // Prepare trend data
  const trendData = useMemo(() => {
    return trend?.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      talent: item.talent_count,
      sponsors: item.sponsor_count,
    })) || [];
  }, [trend]);

  // Prepare status distribution data
  const talentStatusData = useMemo(() => {
    return talentStatusCounts.map((item) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
    }));
  }, [talentStatusCounts]);

  const sponsorStatusData = useMemo(() => {
    return sponsorStatusCounts.map((item) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
    }));
  }, [sponsorStatusCounts]);

  const messageStatusData = useMemo(() => {
    return messageStatusCounts.map((item) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
    }));
  }, [messageStatusCounts]);

  // Export data handler
  const handleExport = () => {
    const data = {
      metrics,
      trend,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Detailed insights and statistics"
      actions={
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      }
    >
      {/* Date Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as '7' | '30' | '90')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Data updated: {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* KPI Cards */}
      {metricsLoading ? (
        <KPIGrid className="mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </KPIGrid>
      ) : (
        <KPIGrid className="mb-8">
          <KPICard
            title="Total Submissions"
            value={(metrics?.talent?.newThisMonth || 0) + (metrics?.sponsors?.newThisMonth || 0)}
            trend={metrics?.talent?.newThisWeek}
            trendLabel="this week"
            icon={TrendingUp}
            color="blue"
          />
          <KPICard
            title="Talent Conversion"
            value={metrics?.talent?.total ? Math.round((metrics.talent.approved / metrics.talent.total) * 100) : 0}
            subtitle="% approved"
            icon={Users}
            color="green"
          />
          <KPICard
            title="Active Sponsors"
            value={metrics?.sponsors?.active || 0}
            subtitle={`of ${metrics?.sponsors?.total || 0} total`}
            icon={Building2}
            color="purple"
          />
          <KPICard
            title="Message Response Rate"
            value={metrics?.messages?.total ? Math.round((metrics.messages.replied / metrics.messages.total) * 100) : 0}
            subtitle="% replied"
            icon={Mail}
            color="yellow"
          />
        </KPIGrid>
      )}

      {/* Charts Row 1 */}
      <ChartGrid className="mb-8">
        <ChartCard
          title="Submissions Over Time"
          description={`New talent and sponsors (${dateRange} days)`}
          isLoading={trendLoading}
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="talent"
                name="Talent"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sponsors"
                name="Sponsors"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Talent Status Distribution"
          description="Current breakdown by status"
          isLoading={talentCountsLoading}
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={talentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {talentStatusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {talentStatusData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </ChartGrid>

      {/* Charts Row 2 */}
      <ChartGrid className="mb-8">
        <ChartCard
          title="Sponsor Status"
          description="Breakdown by status"
          isLoading={sponsorCountsLoading}
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sponsorStatusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Count" fill={COLORS.secondary} radius={[0, 4, 4, 0]}>
                {sponsorStatusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Message Status"
          description="Breakdown by status"
          isLoading={messageCountsLoading}
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={messageStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Count" fill={COLORS.warning} radius={[4, 4, 0, 0]}>
                {messageStatusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Talent Pipeline"
          items={[
            { label: 'Pending Review', value: metrics?.talent?.pending || 0, color: 'bg-yellow-500' },
            { label: 'Approved', value: metrics?.talent?.approved || 0, color: 'bg-green-500' },
            { label: 'Total', value: metrics?.talent?.total || 0, color: 'bg-blue-500' },
          ]}
        />
        <SummaryCard
          title="Request Overview"
          items={[
            { label: 'Open', value: metrics?.requests?.open || 0, color: 'bg-blue-500' },
            { label: 'In Review', value: metrics?.requests?.inReview || 0, color: 'bg-yellow-500' },
            { label: 'Urgent', value: metrics?.requests?.urgent || 0, color: 'bg-red-500' },
          ]}
        />
        <SummaryCard
          title="Message Activity"
          items={[
            { label: 'Unread', value: metrics?.messages?.unread || 0, color: 'bg-red-500' },
            { label: 'Replied', value: metrics?.messages?.replied || 0, color: 'bg-green-500' },
            { label: 'Total', value: metrics?.messages?.total || 0, color: 'bg-blue-500' },
          ]}
        />
      </div>
    </AdminLayout>
  );
}

// ============================================================================
// SUMMARY CARD COMPONENT
// ============================================================================

interface SummaryCardProps {
  title: string;
  items: {
    label: string;
    value: number;
    color: string;
  }[];
}

function SummaryCard({ title, items }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', item.color)} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


