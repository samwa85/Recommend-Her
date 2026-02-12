// ============================================================================
// STATUS BADGE - Unified status badge using shared enums
// ============================================================================

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StatusVariants, getStatusLabel } from '@/lib/types/enums';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type StatusType = 'talent' | 'sponsor' | 'request' | 'message' | 'file';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

// ============================================================================
// STATUS STYLE CONFIGURATIONS
// ============================================================================

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
  secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
  destructive: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
  outline: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StatusBadge({ status, type: _type, className }: StatusBadgeProps) {
  const label = getStatusLabel(status);
  const variant = StatusVariants[status] || 'outline';
  const styleClass = VARIANT_STYLES[variant] || VARIANT_STYLES['outline'];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize whitespace-nowrap text-xs px-2 py-0.5',
        styleClass,
        className
      )}
    >
      {label}
    </Badge>
  );
}

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { getStatusLabel };

export function getStatusColor(status: string): string {
  const variant = StatusVariants[status];
  switch (variant) {
    case 'default':
      return 'green';
    case 'destructive':
      return 'red';
    case 'secondary':
      return 'blue';
    case 'outline':
    default:
      return 'gray';
  }
}

export default StatusBadge;
