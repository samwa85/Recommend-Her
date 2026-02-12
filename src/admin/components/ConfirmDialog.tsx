// ============================================================================
// CONFIRM DIALOG - Reusable confirmation dialog
// ============================================================================

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Trash2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

// ============================================================================
// VARIANT CONFIGURATIONS
// ============================================================================

const variantConfig: Record<ConfirmVariant, { icon: LucideIcon; iconColor: string; buttonVariant: 'default' | 'destructive' }> = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-600',
    buttonVariant: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    buttonVariant: 'default',
  },
  info: {
    icon: AlertTriangle,
    iconColor: 'text-blue-600',
    buttonVariant: 'default',
  },
};

// ============================================================================
// CONFIRM DIALOG COMPONENT
// ============================================================================

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  isLoading,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full bg-muted', config.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// PRESET CONFIRM DIALOGS
// ============================================================================

interface DeleteConfirmDialogProps extends Omit<ConfirmDialogProps, 'variant' | 'title' | 'description' | 'confirmLabel'> {
  itemName: string;
  itemType?: string;
}

export function DeleteConfirmDialog({
  itemName,
  itemType = 'item',
  ...props
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      variant="danger"
      title={`Delete ${itemType}?`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
    />
  );
}

interface ArchiveConfirmDialogProps extends Omit<ConfirmDialogProps, 'variant' | 'title' | 'description' | 'confirmLabel'> {
  itemName: string;
}

export function ArchiveConfirmDialog({
  itemName,
  ...props
}: ArchiveConfirmDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      variant="warning"
      title="Archive item?"
      description={`Are you sure you want to archive "${itemName}"? You can restore it later.`}
      confirmLabel="Archive"
    />
  );
}
