// ============================================================================
// ADMIN COMPONENTS - Barrel exports
// ============================================================================

export { AdminLayout } from './AdminLayout';
export { StatusBadge, getStatusLabel, getStatusColor } from './StatusBadge';
export { DataTable, type Column, type TableAction } from './DataTable';
export { FilterBar, type FilterOption } from './FilterBar';
export { DetailDrawer } from './DetailDrawer';
export { KPICard, KPIGrid } from './KPICard';
export {
  SkeletonPage,
  SkeletonKPICard,
  SkeletonCard,
  SkeletonTable,
  SkeletonActivity,
} from './LoadingSkeleton';

// Re-export from existing components
export { ChartCard, ChartGrid } from './ChartCard';
export { ConfirmDialog } from './ConfirmDialog';
export { EmptyState } from './EmptyState';
