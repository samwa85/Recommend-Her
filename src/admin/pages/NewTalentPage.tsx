// ============================================================================
// NEW TALENT PAGE - Admin form to create new talent profile
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  MapPin,
  Linkedin,
  Globe,
  Award,
  Check,
  Loader2,
  X,
  Plus,
  FileText,
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
import { createTalent } from '@/lib/queries';
import { INDUSTRIES } from '@/lib/database.types';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const SENIORITY_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'C-Level',
];

const ROLE_CATEGORIES = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Data',
  'Research',
  'Customer Success',
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const EDUCATION_LEVELS = [
  'High School',
  "Bachelor's Degree",
  "Master's Degree",
  'MBA',
  'PhD',
  'Other',
];

const COMMON_SKILLS = [
  'Leadership', 'Strategy', 'Product Management', 'Project Management',
  'Data Analysis', 'Marketing', 'Sales', 'Operations', 'Finance',
  'Engineering', 'Design', 'Communication', 'Team Management',
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese',
  'Portuguese', 'Arabic', 'Russian', 'Italian', 'Dutch', 'Korean',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewTalentPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tag inputs
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [seekingRoleInput, setSeekingRoleInput] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    
    // Professional Information
    headline: '',
    bio: '',
    current_role_title: '',
    years_experience: '',
    industry: '',
    role_category: '',
    seniority_level: '',
    education_level: '',
    
    // Skills & Languages
    skills: [] as string[],
    languages: [] as string[],
    seeking_roles: [] as string[],
    
    // Links
    linkedin_url: '',
    portfolio_url: '',
    website_url: '',
    
    // Preferences
    work_mode_preference: '',
    salary_range: '',
    
    // Admin
    internal_notes: '',
    status: 'pending' as const,
    visibility: 'private' as const,
    source: 'admin-manual',
    gdpr_consent: true,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang),
    }));
  };

  const addSeekingRole = () => {
    if (seekingRoleInput.trim() && !formData.seeking_roles.includes(seekingRoleInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seeking_roles: [...prev.seeking_roles, seekingRoleInput.trim()],
      }));
      setSeekingRoleInput('');
    }
  };

  const removeSeekingRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      seeking_roles: prev.seeking_roles.filter(r => r !== role),
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
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
      const result = await createTalent({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        country: formData.country.trim() || null,
        city: formData.city.trim() || null,
        headline: formData.headline.trim() || null,
        bio: formData.bio.trim() || null,
        current_role_title: formData.current_role_title.trim() || null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        industry: formData.industry || null,
        role_category: formData.role_category || null,
        seniority_level: formData.seniority_level || null,
        education_level: formData.education_level || null,
        skills: formData.skills.length > 0 ? formData.skills : null,
        languages: formData.languages.length > 0 ? formData.languages : null,
        seeking_roles: formData.seeking_roles.length > 0 ? formData.seeking_roles : null,
        linkedin_url: formData.linkedin_url.trim() || null,
        portfolio_url: formData.portfolio_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        work_mode_preference: formData.work_mode_preference || null,
        salary_range: formData.salary_range || null,
        internal_notes: formData.internal_notes.trim() || null,
        status: formData.status,
        visibility: formData.visibility,
        source: formData.source,
        gdpr_consent: formData.gdpr_consent,
        referral_code: null,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success('Talent profile created successfully');
      navigate('/admin/talent');
    } catch (err) {
      console.error('Error creating talent:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create talent profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/talent');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AdminLayout
      title="Add New Talent"
      subtitle="Create a new talent profile manually"
      actions={
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Talent
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
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g., Senior Product Manager with 10 years experience"
                  value={formData.headline}
                  onChange={(e) => updateField('headline', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_role_title">Current Title</Label>
                <Input
                  id="current_role_title"
                  placeholder="e.g., Product Manager"
                  value={formData.current_role_title}
                  onChange={(e) => updateField('current_role_title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.years_experience}
                  onChange={(e) => updateField('years_experience', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seniority_level">Seniority Level</Label>
                <Select
                  value={formData.seniority_level}
                  onValueChange={(v) => updateField('seniority_level', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="role_category">Role Category</Label>
                <Select
                  value={formData.role_category}
                  onValueChange={(v) => updateField('role_category', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_level">Education Level</Label>
                <Select
                  value={formData.education_level}
                  onValueChange={(v) => updateField('education_level', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((edu) => (
                      <SelectItem key={edu} value={edu}>
                        {edu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio / Summary</Label>
                <textarea
                  id="bio"
                  rows={4}
                  placeholder="Brief professional summary..."
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  placeholder="https://portfolio.com"
                  value={formData.portfolio_url}
                  onChange={(e) => updateField('portfolio_url', e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website_url">Personal Website</Label>
                <Input
                  id="website_url"
                  placeholder="https://personal-website.com"
                  value={formData.website_url}
                  onChange={(e) => updateField('website_url', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skills Input */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Quick add:</span>
                {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 6).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }))}
                    className="text-xs text-primary hover:underline"
                  >
                    +{skill}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Languages Input */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a language..."
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addLanguage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="hover:text-secondary-foreground/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Quick add:</span>
                {COMMON_LANGUAGES.filter(l => !formData.languages.includes(l)).slice(0, 5).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }))}
                    className="text-xs text-primary hover:underline"
                  >
                    +{lang}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Seeking Roles */}
            <div className="space-y-2">
              <Label>Roles They're Seeking</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a role..."
                  value={seekingRoleInput}
                  onChange={(e) => setSeekingRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSeekingRole();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSeekingRole}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.seeking_roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => removeSeekingRole(role)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work_mode_preference">Work Mode Preference</Label>
                <Select
                  value={formData.work_mode_preference}
                  onValueChange={(v) => updateField('work_mode_preference', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range Expectation</Label>
                <Input
                  id="salary_range"
                  placeholder="e.g., $80k - $120k"
                  value={formData.salary_range}
                  onChange={(e) => updateField('salary_range', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Admin Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <textarea
                id="internal_notes"
                rows={3}
                placeholder="Private notes for admin use only..."
                value={formData.internal_notes}
                onChange={(e) => updateField('internal_notes', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => updateField('status', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(v) => updateField('visibility', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                Create Talent
              </span>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
