// ============================================================================
// NEW SPONSOR PAGE - Admin form to create new sponsor
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Briefcase,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { createSponsor } from '@/lib/queries';
import { INDUSTRIES } from '@/lib/database.types';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const SPONSORSHIP_AMOUNTS = [
  { value: 'under_5k', label: 'Under $5,000' },
  { value: '5k_10k', label: '$5,000 - $10,000' },
  { value: '10k_25k', label: '$10,000 - $25,000' },
  { value: '25k_50k', label: '$25,000 - $50,000' },
  { value: '50k_plus', label: '$50,000+' },
];

const FOCUS_AREAS = [
  'Mentorship',
  'Funding',
  'Networking',
  'Speaking Opportunities',
  'Board Positions',
  'Job Referrals',
  'Event Sponsorship',
  'Training & Development',
];

const ROLE_TYPES = [
  'Executive (C-Suite)',
  'VP / Director',
  'Senior Manager',
  'Manager',
  'Individual Contributor',
  'Board Member',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewSponsorPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    job_title: '',
    linkedin_url: '',
    
    // Company Information
    company_name: '',
    company_website: '',
    company_size: '',
    industry: '',
    company_description: '',
    
    // Sponsor Details
    is_recruiter: false,
    focus_areas: [] as string[],
    role_types: [] as string[],
    sponsorship_amount: '',
    message: '',
    internal_notes: '',
    
    // Meta
    status: 'pending' as const,
    gdpr_consent: true,
    source: 'admin-manual',
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area],
    }));
  };

  const toggleRoleType = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role_types: prev.role_types.includes(role)
        ? prev.role_types.filter(r => r !== role)
        : [...prev.role_types, role],
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.company_name.trim()) return 'Company name is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSponsor({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        job_title: formData.job_title.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        company_name: formData.company_name.trim(),
        company_website: formData.company_website.trim() || null,
        company_size: formData.company_size || null,
        industry: formData.industry || null,
        company_description: formData.company_description.trim() || null,
        is_recruiter: formData.is_recruiter,
        focus_areas: formData.focus_areas.length > 0 ? formData.focus_areas : null,
        role_types: formData.role_types.length > 0 ? formData.role_types : null,
        sponsorship_amount: formData.sponsorship_amount || null,
        message: formData.message.trim() || null,
        internal_notes: formData.internal_notes.trim() || null,
        status: formData.status,
        gdpr_consent: formData.gdpr_consent,
        source: formData.source,
        referral_code: null,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success('Sponsor created successfully');
      navigate('/admin/sponsors');
    } catch (err) {
      console.error('Error creating sponsor:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create sponsor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/sponsors');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AdminLayout
      title="Add New Sponsor"
      subtitle="Create a new sponsor profile manually"
      actions={
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sponsors
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  placeholder="e.g., VP of Engineering"
                  value={formData.job_title}
                  onChange={(e) => updateField('job_title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="linkedin_url"
                    placeholder="https://linkedin.com/in/profile"
                    value={formData.linkedin_url}
                    onChange={(e) => updateField('linkedin_url', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  placeholder="Enter company name"
                  value={formData.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_website">Company Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company_website"
                    placeholder="https://company.com"
                    value={formData.company_website}
                    onChange={(e) => updateField('company_website', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(v) => updateField('industry', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(v) => updateField('company_size', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company_description">Company Description</Label>
                <textarea
                  id="company_description"
                  rows={3}
                  placeholder="Brief description of the company..."
                  value={formData.company_description}
                  onChange={(e) => updateField('company_description', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Sponsor Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recruiter Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recruiter"
                checked={formData.is_recruiter}
                onCheckedChange={(checked) => updateField('is_recruiter', checked === true)}
              />
              <Label htmlFor="is_recruiter" className="cursor-pointer">
                This is a recruiter/agency
              </Label>
            </div>

            <Separator />

            {/* Sponsorship Amount */}
            <div className="space-y-2">
              <Label htmlFor="sponsorship_amount">Sponsorship Interest</Label>
              <Select
                value={formData.sponsorship_amount}
                onValueChange={(v) => updateField('sponsorship_amount', v)}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select sponsorship level" />
                </SelectTrigger>
                <SelectContent>
                  {SPONSORSHIP_AMOUNTS.map((amount) => (
                    <SelectItem key={amount.value} value={amount.value}>
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocusArea(area)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      formData.focus_areas.includes(area)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Types */}
            <div className="space-y-2">
              <Label>Role Types of Interest</Label>
              <div className="flex flex-wrap gap-2">
                {ROLE_TYPES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRoleType(role)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      formData.role_types.includes(role)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message / Notes from Sponsor</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Any additional information or message from the sponsor..."
                value={formData.message}
                onChange={(e) => updateField('message', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Admin Notes</Label>
              <textarea
                id="internal_notes"
                rows={3}
                placeholder="Private notes for admin use only..."
                value={formData.internal_notes}
                onChange={(e) => updateField('internal_notes', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Initial Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.status}
              onValueChange={(v) => updateField('status', v)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Create Sponsor
              </span>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
