import { useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Upload, 
  Check, 
  Shield, 
  Linkedin,
  Loader2,
  AlertCircle,
  FileText,
  X,
  Globe,
  Award,
  User,
  Mail,
  Briefcase,
  Sparkles,
  ChevronDown,
  Eye,
  File,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Dialog components available for future use
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { db, uploadFileAuto } from '@/lib/insforge/client';
import { BUCKETS, formatFileSize, getAcceptedFileTypes, validateFile } from '@/lib/storage';
import { INDUSTRIES, SENIORITY_LEVELS, FUNCTIONS } from '@/lib/database.types';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = 'talentFormDraft';

interface FormData {
  full_name: string;
  email: string;
  headline: string;
  bio: string;
  years_experience: number;
  industry: string;
  seniority_level: string;
  functions: string[];
  skills: string[];
  languages: string[];
  linkedin_url: string;
  portfolio_url: string;
}

const INITIAL_FORM_DATA: FormData = {
  full_name: '',
  email: '',
  headline: '',
  bio: '',
  years_experience: 0,
  industry: '',
  seniority_level: '',
  functions: [],
  skills: [],
  languages: [],
  linkedin_url: '',
  portfolio_url: '',
};

// Field configuration with limits
const FIELD_LIMITS = {
  headline: { min: 10, max: 120 },
  bio: { min: 0, max: 500 },
  skills: { max: 10 },
  languages: { max: 5 },
};

const ForTalent = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    full_name: false, email: false, headline: false, bio: false,
    years_experience: false, industry: false, seniority_level: false,
    functions: false, skills: false, languages: false,
    linkedin_url: false, portfolio_url: false
  });
  const [fieldErrors, setFieldErrors] = useState<Record<keyof FormData, string>>({
    full_name: '', email: '', headline: '', bio: '',
    years_experience: '', industry: '', seniority_level: '',
    functions: '', skills: '', languages: '',
    linkedin_url: '', portfolio_url: ''
  });
  
  // Tag input states
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.form-container',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.form-container',
            start: 'top 85%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Field validation
  const validateField = useCallback((field: keyof FormData, value: unknown): string => {
    const strValue = typeof value === 'string' ? value : '';
    switch (field) {
      case 'full_name':
        if (!strValue.trim()) return 'Full name is required';
        if (strValue.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!strValue.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) return 'Please enter a valid email';
        return '';
      case 'headline':
        if (!strValue.trim()) return 'Headline is required';
        if (strValue.length < FIELD_LIMITS.headline.min) return `Headline must be at least ${FIELD_LIMITS.headline.min} characters`;
        if (strValue.length > FIELD_LIMITS.headline.max) return `Headline must be less than ${FIELD_LIMITS.headline.max} characters`;
        return '';
      case 'bio':
        if (strValue.length > FIELD_LIMITS.bio.max) return `Bio must be less than ${FIELD_LIMITS.bio.max} characters`;
        return '';
      case 'industry':
        if (!value) return 'Industry is required';
        return '';
      case 'seniority_level':
        if (!value) return 'Seniority level is required';
        return '';
      default:
        return '';
    }
  }, []);

  const updateField = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
    if (error) setError(null);
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const toggleFunction = (func: string) => {
    setFormData(prev => ({
      ...prev,
      functions: prev.functions.includes(func)
        ? prev.functions.filter(f => f !== func)
        : [...prev.functions, func]
    }));
    if (error) setError(null);
  };

  // Tag input handlers
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    if (formData.skills.length >= FIELD_LIMITS.skills.max) {
      setFieldErrors(prev => ({ ...prev, skills: `Maximum ${FIELD_LIMITS.skills.max} skills allowed` }));
      return;
    }
    setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput('');
    setFieldErrors(prev => ({ ...prev, skills: '' }));
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addLanguage = () => {
    const trimmed = languageInput.trim();
    if (!trimmed) return;
    if (formData.languages.includes(trimmed)) {
      setLanguageInput('');
      return;
    }
    if (formData.languages.length >= FIELD_LIMITS.languages.max) {
      setFieldErrors(prev => ({ ...prev, languages: `Maximum ${FIELD_LIMITS.languages.max} languages allowed` }));
      return;
    }
    setFormData(prev => ({ ...prev, languages: [...prev.languages, trimmed] }));
    setLanguageInput('');
    setFieldErrors(prev => ({ ...prev, languages: '' }));
  };

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const validation = validateFile(file, BUCKETS.TALENT_CV);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    setError(null);
    setCvFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const getFileIcon = () => {
    if (!cvFile) return null;
    const ext = cvFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="mb-3 text-red-500 h-10 w-10" />;
    if (ext === 'doc' || ext === 'docx') return <File className="mb-3 text-blue-500 h-10 w-10" />;
    return <FileText className="mb-3 text-green-500 h-10 w-10" />;
  };

  const validateForm = (): string | null => {
    const errors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors as Record<keyof FormData, string>);
      const touchedUpdates = Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>);
      setTouched({
        full_name: false, email: false, headline: false, bio: false,
        years_experience: false, industry: false, seniority_level: false,
        functions: false, skills: false, languages: false,
        linkedin_url: false, portfolio_url: false,
        ...touchedUpdates
      } as Record<keyof FormData, boolean>);
      return 'Please fix the errors above';
    }
    return null;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowReview(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('📝 [ForTalent] Starting InsForge submission...', {
        full_name: formData.full_name,
        email: formData.email,
        hasCvFile: !!cvFile
      });

      let cvFilePath: string | undefined;

      // Upload CV to InsForge Storage if provided
      if (cvFile) {
        console.log('📁 [ForTalent] Uploading CV to InsForge Storage...');

        try {
          const result = await uploadFileAuto(BUCKETS.TALENT_CV, cvFile);

          if (result.error) {
            console.error('❌ [ForTalent] CV upload failed:', result.error);
            console.warn('⚠️ [ForTalent] Continuing without CV upload');
          } else {
            console.log('✅ [ForTalent] CV uploaded successfully:', result.key);
            cvFilePath = result.key;
          }
        } catch (uploadErr) {
          console.warn('⚠️ [ForTalent] CV upload error (continuing without):', uploadErr);
        }
      }

      console.log('🚀 [ForTalent] Submitting talent profile to InsForge...');

      // Insert into talent_profiles table using InsForge
      // Using NEW column names added by migration
      const { data: talentData, error: talentError } = await db
        .from('talent_profiles')
        .insert({
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          headline: formData.headline.trim() || null,
          bio: formData.bio.trim() || null,
          // Use NEW column names (added by migration)
          years_of_experience: String(formData.years_experience || 0),
          industry: formData.industry || null,
          current_role_title: formData.seniority_level || null,
          role_category: formData.functions?.[0] || null,
          seeking_roles: formData.functions || [],
          skills: formData.skills || [],
          languages: formData.languages || [],
          linkedin_url: formData.linkedin_url.trim() || null,
          website_url: formData.portfolio_url.trim() || null,
          cv_file_id: cvFilePath || null,
          // Required fields for InsForge schema
          status: 'pending',
          source: 'for-talent-page',
          gdpr_consent: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (talentError) {
        console.error('❌ [ForTalent] Talent profile insert failed:', talentError);
        throw new Error(`Failed to submit profile: ${talentError.message}`);
      }

      console.log('✅ [ForTalent] Submission successful! Talent ID:', talentData?.id);

      setSubmittedEmail(formData.email);
      setIsSubmitted(true);
      setFormData(INITIAL_FORM_DATA);
      setCvFile(null);
      localStorage.removeItem(STORAGE_KEY);
      setShowReview(false);
    } catch (err) {
      console.error('❌ [ForTalent] Submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit profile. Please try again.';
      setError(errorMessage);
      setShowReview(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData(INITIAL_FORM_DATA);
    setCvFile(null);
    setError(null);
    setShowAllIndustries(false);
    setTouched({
      full_name: false, email: false, headline: false, bio: false,
      years_experience: false, industry: false, seniority_level: false,
      functions: false, skills: false, languages: false,
      linkedin_url: false, portfolio_url: false
    });
    setFieldErrors({
      full_name: '', email: '', headline: '', bio: '',
      years_experience: '', industry: '', seniority_level: '',
      functions: '', skills: '', languages: '',
      linkedin_url: '', portfolio_url: ''
    });
    setSkillInput('');
    setLanguageInput('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const displayedIndustries = showAllIndustries ? INDUSTRIES : INDUSTRIES.slice(0, 8);

  return (
    <section className="min-h-screen bg-background py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
            <Sparkles className="h-4 w-4" />
            Join Our Talent Pool
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Submit Your Profile
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Connect with sponsors looking for talented women leaders. 
            No registration required.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Draft Saved Indicator */}
        <div className="mb-4 flex justify-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3" />
            Auto-saved to draft
          </span>
        </div>

        {/* Form Card */}
        <div className="form-container bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Form Header */}
          <div className="bg-primary/5 border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Talent Profile</h2>
                <p className="text-sm text-muted-foreground">All fields marked with * are required</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleReview} className="p-6 md:p-8 space-y-8">
            {/* SECTION 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">1</span>
                Personal Information
              </h3>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-base font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      onBlur={() => handleBlur('full_name')}
                      placeholder="e.g., Jane Smith"
                      className={cn("h-12 pl-10", fieldErrors.full_name && touched.full_name && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </div>
                  {fieldErrors.full_name && touched.full_name && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="your@email.com"
                      className={cn("h-12 pl-10", fieldErrors.email && touched.email && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </div>
                  {fieldErrors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">2</span>
                Professional Details
              </h3>
              <Separator />

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="headline" className="text-base font-medium">
                    Professional Headline <span className="text-red-500">*</span>
                  </Label>
                  <span className={cn(
                    "text-xs",
                    formData.headline.length > FIELD_LIMITS.headline.max ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {formData.headline.length}/{FIELD_LIMITS.headline.max}
                  </span>
                </div>
                <div className="relative mt-2">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => updateField('headline', e.target.value)}
                    onBlur={() => handleBlur('headline')}
                    placeholder="e.g., Senior Product Manager | Fintech | 8 years experience"
                    className={cn("h-12 pl-10", fieldErrors.headline && touched.headline && "border-red-500 focus-visible:ring-red-500")}
                  />
                </div>
                {fieldErrors.headline && touched.headline && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.headline}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="bio" className="text-base font-medium">
                    Bio / Professional Summary
                  </Label>
                  <span className={cn(
                    "text-xs",
                    formData.bio.length > FIELD_LIMITS.bio.max ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {formData.bio.length}/{FIELD_LIMITS.bio.max}
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  onBlur={() => handleBlur('bio')}
                  placeholder="Tell us about your background, achievements, and what you're looking for..."
                  rows={4}
                  className={cn("mt-2 resize-none", fieldErrors.bio && touched.bio && "border-red-500 focus-visible:ring-red-500")}
                />
                {fieldErrors.bio && touched.bio && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.bio}</p>
                )}
              </div>

              {/* Industry Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Industry <span className="text-red-500">*</span>
                  {fieldErrors.industry && touched.industry && (
                    <span className="text-red-500 text-xs ml-2">{fieldErrors.industry}</span>
                  )}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {displayedIndustries.map((industry) => {
                    const isSelected = formData.industry === industry;
                    return (
                      <label
                        key={industry}
                        className={cn(
                          "group cursor-pointer px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all duration-200 select-none inline-flex items-center gap-3 active:scale-[0.98] touch-manipulation",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
                        )}
                      >
                        <input
                          type="radio"
                          name="industry"
                          value={industry}
                          checked={isSelected}
                          onChange={(e) => updateField('industry', e.target.value)}
                          onBlur={() => handleBlur('industry')}
                          className="sr-only"
                        />
                        <span className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors shrink-0",
                          isSelected 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}>
                          {isSelected && <Check className="h-3.5 w-3.5 text-red-500 stroke-[3]" />}
                        </span>
                        <span className="leading-tight">{industry}</span>
                      </label>
                    );
                  })}
                </div>
                {!showAllIndustries && INDUSTRIES.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllIndustries(true)}
                    className="mt-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    Show all {INDUSTRIES.length} industries
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Seniority Level */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Seniority Level <span className="text-red-500">*</span>
                  {fieldErrors.seniority_level && touched.seniority_level && (
                    <span className="text-red-500 text-xs ml-2">{fieldErrors.seniority_level}</span>
                  )}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {SENIORITY_LEVELS.map((level) => {
                    const isSelected = formData.seniority_level === level;
                    return (
                      <label
                        key={level}
                        className={cn(
                          "group cursor-pointer px-3 py-3 rounded-lg text-sm font-medium border-2 transition-all duration-200 select-none inline-flex items-center gap-2 active:scale-[0.98] touch-manipulation",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
                        )}
                      >
                        <input
                          type="radio"
                          name="seniority_level"
                          value={level}
                          checked={isSelected}
                          onChange={(e) => updateField('seniority_level', e.target.value)}
                          onBlur={() => handleBlur('seniority_level')}
                          className="sr-only"
                        />
                        <span className={cn(
                          "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors shrink-0",
                          isSelected 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-red-500 stroke-[3]" />}
                        </span>
                        <span className="text-xs sm:text-sm leading-tight">{level}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="years_experience" className="text-base font-medium">
                    Years of Experience
                  </Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.years_experience}
                    onChange={(e) => updateField('years_experience', parseInt(e.target.value) || 0)}
                    className="h-12 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url" className="text-base font-medium">
                    LinkedIn Profile
                  </Label>
                  <div className="relative mt-2">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => updateField('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="portfolio_url" className="text-base font-medium">
                    Portfolio / Website
                  </Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="portfolio_url"
                      type="url"
                      value={formData.portfolio_url}
                      onChange={(e) => updateField('portfolio_url', e.target.value)}
                      placeholder="https://..."
                      className="h-12 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Skills & Expertise */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">3</span>
                Skills & Expertise
              </h3>
              <Separator />

              <div>
                <Label className="text-base font-medium mb-3 block">
                  Functions / Areas of Expertise
                  {formData.functions.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {formData.functions.length} selected
                    </Badge>
                  )}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FUNCTIONS.map((func) => {
                    const isSelected = formData.functions.includes(func);
                    return (
                      <label
                        key={func}
                        className={cn(
                          "group cursor-pointer px-3 py-3 rounded-lg text-sm font-medium border-2 transition-all duration-200 select-none flex items-center gap-2 active:scale-[0.98] touch-manipulation",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFunction(func)}
                          className="sr-only"
                        />
                        <span className={cn(
                          "flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0",
                          isSelected 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}>
                          {isSelected && <Check className="h-3.5 w-3.5 text-red-500 stroke-[3]" />}
                        </span>
                        <span className="text-xs sm:text-sm leading-tight">{func}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Skills Tag Input */}
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Key Skills
                    <span className="text-muted-foreground text-xs ml-2">
                      ({formData.skills.length}/{FIELD_LIMITS.skills.max})
                    </span>
                  </Label>
                  {fieldErrors.skills && (
                    <span className="text-red-500 text-xs">{fieldErrors.skills}</span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-2 py-1 text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type skill and press Enter"
                      className="flex-1"
                      disabled={formData.skills.length >= FIELD_LIMITS.skills.max}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                      disabled={!skillInput.trim() || formData.skills.length >= FIELD_LIMITS.skills.max}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Languages Tag Input */}
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Languages
                    <span className="text-muted-foreground text-xs ml-2">
                      ({formData.languages.length}/{FIELD_LIMITS.languages.max})
                    </span>
                  </Label>
                  {fieldErrors.languages && (
                    <span className="text-red-500 text-xs">{fieldErrors.languages}</span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="px-2 py-1 text-sm">
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
                      placeholder="Type language and press Enter"
                      className="flex-1"
                      disabled={formData.languages.length >= FIELD_LIMITS.languages.max}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLanguage}
                      disabled={!languageInput.trim() || formData.languages.length >= FIELD_LIMITS.languages.max}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: CV Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">4</span>
                CV / Resume
              </h3>
              <Separator />

              <div>
                <Label className="text-base font-medium mb-3 block">
                  Upload your CV (PDF or DOC, max 3MB)
                </Label>
                <div className="relative">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 transition-all duration-200",
                      isDragging && "border-primary bg-primary/10 scale-[1.02]",
                      cvFile && !isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      {cvFile ? (
                        <>
                          {getFileIcon()}
                          <p className="font-medium text-foreground">{cvFile.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatFileSize(cvFile.size)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCvFile(null)}
                            className="mt-3 text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
                          >
                            <X className="h-4 w-4" />
                            Remove file
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className={cn("mb-3 h-10 w-10 transition-colors", isDragging ? "text-primary" : "text-primary/60")} />
                          <p className="font-medium text-foreground">
                            {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            PDF or Word document, max 3MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept={getAcceptedFileTypes(BUCKETS.TALENT_CV)}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Consent */}
            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-start gap-3">
                <Shield className="flex-shrink-0 mt-0.5 text-primary h-5 w-5" />
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground leading-relaxed">
                      I agree to have my profile shared with verified sponsors in the 
                      Recommend Her network. I understand my information will be handled 
                      securely and confidentially. <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Review Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
              >
                <Eye className="mr-2 h-5 w-5" />
                Review Profile
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                No registration required. We'll email you about your application status.
              </p>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Secure & Confidential</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>No Registration Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span>Vetted Network</span>
          </div>
        </div>
      </div>

      {/* Review Dialog - Fixed Overlay */}
      {showReview && (
        <div className="fixed inset-0 z-[100]" onClick={(e) => {
          if (e.target === e.currentTarget) setShowReview(false);
        }}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl pointer-events-auto flex flex-col border border-border">
              <div className="p-6">
                <button
                  onClick={() => setShowReview(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="text-center mb-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Eye className="text-primary h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-serif font-semibold">Review Your Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please verify your information before submitting
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 space-y-3 mb-6 bg-muted/30">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Name</span>
                    <span className="text-sm font-medium text-right">{formData.full_name}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Email</span>
                    <span className="text-sm font-medium text-right break-all">{formData.email}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Headline</span>
                    <span className="text-sm font-medium text-right">{formData.headline}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Industry</span>
                    <span className="text-sm font-medium text-right">{formData.industry}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Seniority</span>
                    <span className="text-sm font-medium text-right">{formData.seniority_level}</span>
                  </div>
                  {formData.years_experience > 0 && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-muted-foreground shrink-0">Experience</span>
                      <span className="text-sm font-medium text-right">{formData.years_experience} years</span>
                    </div>
                  )}
                  {formData.functions.length > 0 && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-muted-foreground shrink-0">Functions</span>
                      <span className="text-sm font-medium text-right">{formData.functions.length} selected</span>
                    </div>
                  )}
                  {formData.skills.length > 0 && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-muted-foreground shrink-0">Skills</span>
                      <span className="text-sm font-medium text-right">{formData.skills.length} added</span>
                    </div>
                  )}
                  {cvFile && (
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-sm text-muted-foreground shrink-0">CV</span>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {cvFile.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReview(false)}
                    className="flex-1 h-11"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Confirm & Submit'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog - Fixed Overlay */}
      {isSubmitted && (
        <div className="fixed inset-0 z-[100]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-lg shadow-2xl pointer-events-auto p-8 text-center border border-border">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
                <Check className="text-white h-8 w-8" />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-2">Profile Submitted!</h2>
              <p className="text-base text-muted-foreground mb-6">
                Thank you! Your profile is now in review. We'll notify you at{' '}
                <strong className="text-foreground">{submittedEmail}</strong> once it's been vetted by our team.
              </p>
              <Button onClick={resetForm} className="w-full h-12 bg-primary hover:bg-primary/90">
                Submit Another Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ForTalent;
