import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Check, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Award, 
  Users, 
  Linkedin, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/insforge/client';
import { INDUSTRIES } from '@/lib/database.types';

gsap.registerPlugin(ScrollTrigger);

const sponsorTypes = [
  { value: 'mentor', label: 'Mentor' },
  { value: 'connector', label: 'Connector' },
  { value: 'hiring', label: 'Hiring Manager' },
  { value: 'board', label: 'Board Member' },
  { value: 'investor', label: 'Investor' },
];

const benefits = [
  {
    icon: Users,
    title: 'Access to Vetted Talent',
    description: 'Browse profiles of exceptional women ready for leadership roles.',
  },
  {
    icon: Award,
    title: 'Make Real Impact',
    description: 'Be part of the solution for gender equity in leadership.',
  },
  {
    icon: Building2,
    title: 'Enhance Your Brand',
    description: 'Demonstrate your commitment to diversity and inclusion.',
  },
];

interface FormData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  company: string;
  linkedin: string;
  industry: string;
  sponsorType: string;
  commitmentNote: string;
  wantsTalentPool: boolean;
  wantsOnboarding: boolean;
  agreedToPledge: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  company: '',
  linkedin: '',
  industry: '',
  sponsorType: 'connector',
  commitmentNote: '',
  wantsTalentPool: false,
  wantsOnboarding: false,
  agreedToPledge: false,
};

const ForSponsors = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Benefits animation
      const benefitCards = benefitsRef.current?.children;
      if (benefitCards) {
        gsap.fromTo(
          benefitCards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: benefitsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Form animation
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.company.trim()) return 'Company name is required';
    if (!formData.industry) return 'Industry is required';
    if (!formData.agreedToPledge) return 'You must agree to the Sponsor Pledge';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('📝 [ForSponsors] Starting submission to InsForge...', {
        full_name: formData.fullName,
        email: formData.email,
        org_name: formData.company
      });

      // Insert into sponsor_profiles table using InsForge
      // Using column names that match the admin dashboard expectations
      const { data: sponsorData, error: insertError } = await db
        .from('sponsor_profiles')
        .insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          job_title: formData.title.trim() || null,
          phone: formData.phone.trim() || null,
          company_name: formData.company.trim(),
          linkedin_url: formData.linkedin.trim() || null,
          industry: formData.industry || null,
          // Map sponsor type to focus_areas
          focus_areas: formData.sponsorType ? [formData.sponsorType] : [],
          message: formData.commitmentNote.trim() || null,
          // InsForge specific fields
          status: 'pending',
          gdpr_consent: true,
          is_recruiter: false,
          source: 'for-sponsors-page',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('❌ [ForSponsors] Insert failed:', insertError);
        throw new Error(`Failed to submit: ${insertError.message}`);
      }

      console.log('✅ [ForSponsors] Submission successful! Sponsor ID:', sponsorData?.id);

      setSubmittedEmail(formData.email);
      setIsSubmitted(true);
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      console.error('❌ [ForSponsors] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData(INITIAL_FORM_DATA);
    setError(null);
  };

  return (
    <section ref={sectionRef} style={{ backgroundColor: "hsl(var(--background))" }} className="pt-32 pb-24 lg:pb-32 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p style={{ color: "hsl(var(--primary))" }} className="font-serif text-sm uppercase tracking-[4px] mb-4">
            For Sponsors
          </p>
          <h1 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-4xl sm:text-5xl font-bold mb-6">
            Join the Sponsor Network
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans text-lg max-w-2xl mx-auto">
            Become part of a community of leaders committed to actively sponsoring
            talented women into leadership positions.
          </p>
        </div>

        {/* Benefits */}
        <div
          ref={benefitsRef}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white rounded-2xl p-8 shadow-brand border border-navy/5
                       text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-brand-lg"
            >
              <div style={{ backgroundColor: "hsl(var(--primary))" }} className="w-16 h-16 /10 rounded-full flex items-center justify-center mx-auto mb-6">
                <benefit.icon style={{ color: "hsl(var(--primary))" }} className="" size={28} />
              </div>
              <h3 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-xl font-bold mb-3">
                {benefit.title}
              </h3>
              <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-brand-lg border border-navy/5 max-w-3xl mx-auto"
        >
          <h2 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-2xl font-bold mb-8 text-center">
            Sponsor Registration
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Full Name *
              </Label>
              <div className="relative">
                <User style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Your Title *
              </Label>
              <div className="relative">
                <Award style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                <Input
                  id="title"
                  placeholder="e.g., VP of Engineering"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Work Email *
              </Label>
              <div className="relative">
                <Mail style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@company.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Company Name *
              </Label>
              <div className="relative">
                <Building2 style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                <Input
                  id="company"
                  placeholder="Your company name"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                LinkedIn URL
              </Label>
              <div className="relative">
                <Linkedin style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="industry" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Industry/Area of Expertise *
              </Label>
              <Select value={formData.industry} onValueChange={(value) => updateField('industry', value)}>
                <SelectTrigger className="h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                                         rounded-lg font-sans">
                  <SelectValue placeholder="Select your industry" />
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

            {/* Sponsor Type */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sponsorType" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                How would you like to sponsor? *
              </Label>
              <Select value={formData.sponsorType} onValueChange={(value) => updateField('sponsorType', value)}>
                <SelectTrigger className="h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                                         rounded-lg font-sans">
                  <SelectValue placeholder="Select sponsor type" />
                </SelectTrigger>
                <SelectContent>
                  {sponsorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Commitment Note */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="commitmentNote" style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-medium">
                Why do you want to join? (Optional)
              </Label>
              <textarea
                id="commitmentNote"
                rows={3}
                placeholder="Tell us briefly why you want to become a sponsor..."
                value={formData.commitmentNote}
                onChange={(e) => updateField('commitmentNote', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-navy/20 focus:border-coral 
                         focus:ring-coral/20 font-sans resize-none"
              />
            </div>
          </div>

          {/* Sponsor Pledge */}
          <div style={{ backgroundColor: "hsl(var(--primary))" }} className="rounded-xl p-6 mb-8">
            <h4 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm font-semibold mb-3">
              The Sponsor Pledge
            </h4>
            <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans text-sm mb-4">
              "I pledge to actively recommend women from the Recommend Her talent pool 
              when opportunities arise in my network."
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreedToPledge}
                onChange={(e) => updateField('agreedToPledge', e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-navy/30 text-primary focus:ring-coral/20"
              />
              <span style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm">
                I pledge to be an active sponsor and advocate for women in leadership. *
              </span>
            </label>
          </div>

          {/* Talent Pool Access */}
          <div className="flex items-start gap-3 mb-8">
            <input
              type="checkbox"
              checked={formData.wantsTalentPool}
              onChange={(e) => updateField('wantsTalentPool', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-navy/30 text-primary focus:ring-coral/20"
            />
            <span style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm">
              I'd like access to the Talent Pool gallery.
            </span>
          </div>

          {/* Onboarding Call */}
          <div className="flex items-start gap-3 mb-8">
            <input
              type="checkbox"
              checked={formData.wantsOnboarding}
              onChange={(e) => updateField('wantsOnboarding', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-navy/30 text-primary focus:ring-coral/20"
            />
            <div>
              <span style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm">
                I'd like to schedule a 15-minute onboarding call.
              </span>
              {formData.wantsOnboarding && (
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "hsl(var(--primary))" }} className="flex items-center gap-2 mt-2 font-serif text-sm font-semibold
                           hover:opacity-80 transition-colors"
                >
                  <Calendar size={16} />
                  Schedule your call
                </a>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: "hsl(var(--primary))" }} 
            className="w-full h-14 bg-navy hover:opacity-90 text-white font-serif font-semibold
                     rounded-lg transition-all duration-300 hover:shadow-brand
                     disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Submitting...
              </span>
            ) : (
              'Join as a Sponsor'
            )}
          </Button>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={isSubmitted} onOpenChange={setIsSubmitted}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader className="text-center">
            <div style={{ backgroundColor: "hsl(var(--primary))" }} className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Check style={{ color: "hsl(var(--primary-foreground))" }} size={32} />
            </div>
            <DialogTitle style={{ color: "hsl(var(--foreground))" }} className="font-serif text-2xl font-bold">
              Welcome to the Network!
            </DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans">
              Thank you for joining our sponsor network. We've received your application 
              and will review it shortly. You'll hear from us at <strong>{submittedEmail}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              onClick={resetForm}
              style={{ backgroundColor: "hsl(var(--primary))" }} 
              className="w-full h-12 bg-navy hover:opacity-90 text-white font-serif font-semibold
                       rounded-lg transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ForSponsors;
