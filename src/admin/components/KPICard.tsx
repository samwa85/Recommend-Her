// ============================================================================
// KPI CARD - Key Performance Indicator cards for dashboard
// ============================================================================

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray';
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// COLOR CONFIGURATIONS
// ============================================================================

const COLOR_CONFIGS = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-500',
    border: 'border-green-200 dark:border-green-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
    border: 'border-purple-200 dark:border-purple-800',
  },
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'text-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-500',
    border: 'border-red-200 dark:border-red-800',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    text: 'text-gray-600 dark:text-gray-400',
    icon: 'text-gray-500',
    border: 'border-gray-200 dark:border-gray-700',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs last period',
  icon: Icon,
  color = 'blue',
  onClick,
  isLoading,
  className,
}: KPICardProps) {
  const colors = COLOR_CONFIGS[color];
  const isPositiveTrend = trend && trend > 0;
  const isNegativeTrend = trend && trend < 0;

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/20',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            
            {/* Trend indicator */}
            {trend !== undefined ? (
              <div className="flex items-center gap-1 text-xs">
                {isPositiveTrend ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : isNegativeTrend ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                ) : null}
                <span
                  className={cn(
                    'font-medium',
                    isPositiveTrend && 'text-green-600',
                    isNegativeTrend && 'text-red-600',
                    !isPositiveTrend && !isNegativeTrend && 'text-muted-foreground'
                  )}
                >
                  {isPositiveTrend ? '+' : ''}
                  {trend}
                </span>
                <span className="text-muted-foreground">{trendLabel}</span>
              </div>
            ) : subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className={cn('p-2.5 rounded-lg', colors.bg)}>
            <Icon className={cn('w-5 h-5', colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// KPI GRID - Container for KPI cards
// ============================================================================

interface KPIGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function KPIGrid({ children, className, columns = 4 }: KPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

export default KPICard;
