// ============================================================================
// SPONSOR CARD - Comprehensive Display Card for Sponsor Profiles
// ============================================================================

import {
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  ExternalLink,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { SPONSOR_STATUS_CONFIG } from '@/admin/lib/types';
import type { SponsorProfile } from '@/lib/types/db';
import { SponsorStatus } from '@/lib/types/enums';

// ============================================================================
// TYPES
// ============================================================================

interface SponsorCardProps {
  sponsor: SponsorProfile;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (sponsor: SponsorProfile) => void;
  onDelete?: (sponsor: SponsorProfile) => void;
  onStatusChange?: (sponsor: SponsorProfile, status: SponsorStatus) => void;
  onClick?: (sponsor: SponsorProfile) => void;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'inactive':
      return <XCircle className="w-4 h-4" />;
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'archived':
      return <Archive className="w-4 h-4" />;
    default:
      return null;
  }
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactCard({
  sponsor,
  onClick,
  className,
}: Omit<SponsorCardProps, 'variant' | 'showActions'>) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/20',
        className
      )}
      onClick={() => onClick?.(sponsor)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
            {getInitials(sponsor.full_name)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{sponsor.full_name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {sponsor.job_title || 'No title'}
                </p>
              </div>
              <StatusBadge status={sponsor.status} type="sponsor" />
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{sponsor.company_name}</span>
            </div>

            {sponsor.industry && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {sponsor.industry}
                </Badge>
                {sponsor.is_recruiter && (
                  <Badge variant="secondary" className="text-xs">
                    Recruiter
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DEFAULT VARIANT
// ============================================================================

function DefaultCard({
  sponsor,
  showActions,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
  className,
}: Omit<SponsorCardProps, 'variant'>) {
  const statusConfig = SPONSOR_STATUS_CONFIG[sponsor.status as keyof typeof SPONSOR_STATUS_CONFIG];

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/20',
        className
      )}
      onClick={() => onClick?.(sponsor)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium shrink-0">
              {getInitials(sponsor.full_name)}
            </div>

            {/* Basic Info */}
            <div>
              <CardTitle className="text-lg font-semibold">{sponsor.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {sponsor.job_title || 'No title specified'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={sponsor.status} type="sponsor" />
                {sponsor.is_recruiter && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Briefcase className="w-3 h-3" />
                    Recruiter
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(sponsor); }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {sponsor.status !== 'active' && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(sponsor, SponsorStatus.ACTIVE); }}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}
                {sponsor.status !== 'archived' && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(sponsor, SponsorStatus.ARCHIVED); }}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => { e.stopPropagation(); onDelete?.(sponsor); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <a
              href={`mailto:${sponsor.email}`}
              className="text-primary hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {sponsor.email}
            </a>
          </div>

          {sponsor.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                href={`tel:${sponsor.phone}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {sponsor.phone}
              </a>
            </div>
          )}

          {sponsor.linkedin_url && (
            <div className="flex items-center gap-2 text-sm">
              <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                href={sponsor.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <Separator />

        {/* Company Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{sponsor.company_name}</span>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            {sponsor.industry && (
              <Badge variant="outline">{sponsor.industry}</Badge>
            )}
            {sponsor.company_size && (
              <Badge variant="outline">{sponsor.company_size} employees</Badge>
            )}
            {sponsor.company_website && (
              <a
                href={sponsor.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-3 h-3" />
                Website
              </a>
            )}
          </div>
        </div>

        {/* Focus Areas & Role Types */}
        {(sponsor.focus_areas?.length || sponsor.role_types?.length) ? (
          <>
            <Separator />
            <div className="space-y-2">
              {sponsor.focus_areas && sponsor.focus_areas.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Focus Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {sponsor.focus_areas.map((area, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {sponsor.role_types && sponsor.role_types.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Role Types</p>
                  <div className="flex flex-wrap gap-1">
                    {sponsor.role_types.map((role, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Sponsorship */}
        {sponsor.sponsorship_amount && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Sponsorship Interest:</span>
              <Badge variant="default" className="font-medium">
                {sponsor.sponsorship_amount}
              </Badge>
            </div>
          </>
        )}

        {/* Message Preview */}
        {sponsor.message && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Message</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {sponsor.message}
              </p>
            </div>
          </>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {formatDate(sponsor.created_at)}
          </span>
          {sponsor.source && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {sponsor.source}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// DETAILED VARIANT
// ============================================================================

function DetailedCard({
  sponsor,
  showActions,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
  className,
}: Omit<SponsorCardProps, 'variant'>) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30">
              {getInitials(sponsor.full_name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{sponsor.full_name}</h2>
              <p className="text-white/80">{sponsor.job_title || 'No title specified'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0">
                  {SPONSOR_STATUS_CONFIG[sponsor.status as keyof typeof SPONSOR_STATUS_CONFIG]?.label || sponsor.status}
                </Badge>
                {sponsor.is_recruiter && (
                  <Badge className="bg-white/20 text-white border-0">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Recruiter
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-0"
                onClick={() => onEdit?.(sponsor)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-red-500/80 border-0"
                onClick={() => onDelete?.(sponsor)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${sponsor.email}`} className="text-sm font-medium hover:text-primary">
                      {sponsor.email}
                    </a>
                  </div>
                </div>

                {sponsor.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${sponsor.phone}`} className="text-sm font-medium">
                        {sponsor.phone}
                      </a>
                    </div>
                  </div>
                )}

                {sponsor.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LinkedIn</p>
                      <a
                        href={sponsor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Company Information */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Company Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{sponsor.company_name}</p>
                  </div>
                </div>

                {sponsor.company_website && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a
                        href={sponsor.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        {sponsor.company_website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pl-11">
                  {sponsor.industry && (
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <Badge variant="outline" className="mt-0.5">{sponsor.industry}</Badge>
                    </div>
                  )}
                  {sponsor.company_size && (
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <Badge variant="outline" className="mt-0.5">{sponsor.company_size}</Badge>
                    </div>
                  )}
                </div>

                {sponsor.company_description && (
                  <div className="pl-11">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {sponsor.company_description}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Sponsor Details */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Sponsor Details
              </h3>
              <div className="space-y-3">
                {sponsor.sponsorship_amount && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sponsorship Interest</p>
                      <Badge className="mt-0.5">{sponsor.sponsorship_amount}</Badge>
                    </div>
                  </div>
                )}

                {sponsor.focus_areas && sponsor.focus_areas.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {sponsor.focus_areas.map((area, i) => (
                        <Badge key={i} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {sponsor.role_types && sponsor.role_types.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Role Types</p>
                    <div className="flex flex-wrap gap-1">
                      {sponsor.role_types.map((role, i) => (
                        <Badge key={i} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Message */}
            {sponsor.message && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Message
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{sponsor.message}</p>
                </div>
              </section>
            )}

            {/* Internal Notes */}
            {sponsor.internal_notes && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Internal Notes
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">{sponsor.internal_notes}</p>
                </div>
              </section>
            )}

            {/* Metadata */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(sponsor.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(sponsor.updated_at)}</p>
                </div>
                {sponsor.source && (
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="font-medium">{sponsor.source}</p>
                  </div>
                )}
                {sponsor.referral_code && (
                  <div>
                    <p className="text-xs text-muted-foreground">Referral Code</p>
                    <p className="font-medium">{sponsor.referral_code}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SponsorCard({
  sponsor,
  variant = 'default',
  showActions = true,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
  className,
}: SponsorCardProps) {
  if (variant === 'compact') {
    return (
      <CompactCard
        sponsor={sponsor}
        onClick={onClick}
        className={className}
      />
    );
  }

  if (variant === 'detailed') {
    return (
      <DetailedCard
        sponsor={sponsor}
        showActions={showActions}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <DefaultCard
      sponsor={sponsor}
      showActions={showActions}
      onEdit={onEdit}
      onDelete={onDelete}
      onStatusChange={onStatusChange}
      onClick={onClick}
      className={className}
    />
  );
}

export default SponsorCard;
