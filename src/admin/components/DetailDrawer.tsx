// ============================================================================
// DETAIL DRAWER - Slide-out drawer for viewing record details
// ============================================================================

import { X, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/format/date';

// ============================================================================
// TYPES
// ============================================================================

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'link' | 'email' | 'phone' | 'date' | 'badge' | 'list' | 'boolean';
  value?: unknown;
  render?: () => React.ReactNode;
}

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status?: {
    value: string;
    type: 'talent' | 'sponsor' | 'request' | 'message';
  };
  fields: Field[];
  actions?: {
    primary?: {
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: 'default' | 'destructive';
    };
    secondary?: {
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
    }[];
  };
  children?: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  status,
  fields,
  actions,
  children,
}: DetailDrawerProps) {
  const renderFieldValue = (field: Field) => {
    if (field.render) {
      return field.render();
    }

    const value = field.value;

    switch (field.type) {
      case 'link':
        return value ? (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            {String(value)}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'email':
        return value ? (
          <a
            href={`mailto:${String(value)}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Mail className="w-4 h-4" />
            {String(value)}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'phone':
        return value ? (
          <a
            href={`tel:${String(value)}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Phone className="w-4 h-4" />
            {String(value)}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'date':
        return value ? (
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {formatDate(String(value))}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'badge':
        return value ? (
          <Badge variant="outline">{String(value)}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'list':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {String(item)}
                </Badge>
              ))}
            </div>
          );
        }
        return <span className="text-muted-foreground">-</span>;

      case 'boolean':
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );

      default:
        return value ? (
          <span>{String(value)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
    }
  };

  // Group fields into sections
  const mainFields = fields.slice(0, 6);
  const additionalFields = fields.slice(6);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">{title}</SheetTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {status && (
            <div className="flex items-center gap-3">
              <StatusBadge status={status.value} type={status.type} />
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-2 pt-2">
              {actions.primary && (
                <Button
                  variant={actions.primary.variant || 'default'}
                  size="sm"
                  className="gap-2"
                  onClick={actions.primary.onClick}
                >
                  {actions.primary.icon}
                  {actions.primary.label}
                </Button>
              )}
              {actions.secondary?.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-6 space-y-6">
            {/* Main Fields Grid */}
            <div className="grid grid-cols-2 gap-4">
              {mainFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {field.label}
                  </label>
                  <div className="text-sm">{renderFieldValue(field)}</div>
                </div>
              ))}
            </div>

            {/* Additional Fields */}
            {additionalFields.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  {additionalFields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {field.label}
                      </label>
                      <div className="text-sm">{renderFieldValue(field)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Custom Content */}
            {children && (
              <>
                <Separator />
                {children}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default DetailDrawer;
