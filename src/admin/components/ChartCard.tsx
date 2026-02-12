// ============================================================================
// CHART CARD - Reusable chart container with loading states
// ============================================================================

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  height?: number | string;
  className?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

// ============================================================================
// CHART CARD COMPONENT
// ============================================================================

export function ChartCard({
  title,
  description,
  children,
  isLoading,
  height = 300,
  className,
  action,
  footer,
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" style={{ height }}>
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
        {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHART GRID - Layout component for multiple charts
// ============================================================================

interface ChartGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function ChartGrid({ children, columns = 2, className }: ChartGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {children}
    </div>
  );
}
