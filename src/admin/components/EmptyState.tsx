// ============================================================================
// EMPTY STATE - Consistent empty state component
// ============================================================================

import { Search, FileX, Inbox, FolderOpen, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type EmptyStateVariant = 'search' | 'data' | 'inbox' | 'folder' | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const iconMap: Record<EmptyStateVariant, LucideIcon> = {
  search: Search,
  data: FileX,
  inbox: Inbox,
  folder: FolderOpen,
  custom: FolderOpen,
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export function EmptyState({
  variant = 'data',
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = CustomIcon || iconMap[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SPECIALIZED EMPTY STATES
// ============================================================================

export function SearchEmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={`We couldn't find any results matching "${query}". Try adjusting your search terms.`}
      actionLabel="Clear search"
      onAction={onClear}
    />
  );
}

export function NoDataEmptyState({
  entityName = 'data',
  onRefresh,
}: {
  entityName?: string;
  onRefresh?: () => void;
}) {
  return (
    <EmptyState
      variant="data"
      title={`No ${entityName} yet`}
      description={`There are no ${entityName} to display at this time.`}
      actionLabel={onRefresh ? 'Refresh' : undefined}
      onAction={onRefresh}
    />
  );
}

export function InboxEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      variant="inbox"
      title="Your inbox is empty"
      description="You're all caught up! New messages will appear here."
      actionLabel={onRefresh ? 'Refresh' : undefined}
      onAction={onRefresh}
    />
  );
}
