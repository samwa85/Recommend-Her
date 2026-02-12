// ============================================================================
// LOADING SKELETONS - Skeleton loaders for admin pages
// ============================================================================

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// PAGE SKELETON - Full page loading state
// ============================================================================

interface SkeletonPageProps {
  className?: string;
}

export function SkeletonPage({ className }: SkeletonPageProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2" />
        <SkeletonCard />
      </div>
    </div>
  );
}

// ============================================================================
// KPI CARD SKELETON
// ============================================================================

interface SkeletonKPICardProps {
  className?: string;
}

export function SkeletonKPICard({ className }: SkeletonKPICardProps) {
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

// ============================================================================
// CARD SKELETON
// ============================================================================

interface SkeletonCardProps {
  className?: string;
  rows?: number;
}

export function SkeletonCard({ className, rows = 3 }: SkeletonCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function SkeletonTable({
  className,
  rows = 5,
  columns = 5,
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-64" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn('h-4', i === 0 ? 'w-32' : 'w-24')}
              />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton
                  key={j}
                  className={cn('h-4', j === 0 ? 'w-32' : 'w-24')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY SKELETON
// ============================================================================

interface SkeletonActivityProps {
  className?: string;
  count?: number;
}

export function SkeletonActivity({
  className,
  count = 5,
}: SkeletonActivityProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  SkeletonPage,
  SkeletonKPICard,
  SkeletonCard,
  SkeletonTable,
  SkeletonActivity,
};
