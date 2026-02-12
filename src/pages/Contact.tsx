import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send, Building2, User, MessageSquare, Check, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const inquiryTypes = [
  'General Inquiry',
  'Partnership Opportunity',
  'Media Request',
  'Speaking Engagement',
  'Other',
];

// Form validation schema
const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
  organization: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      inquiryType: '',
      organization: '',
      message: '',
    },
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('📝 [Contact] Starting submission...', {
        full_name: data.fullName,
        email: data.email,
        inquiry_type: data.inquiryType
      });

      const { data: submitData, error: submitError } = await supabase.rpc('submit_contact_form', {
        p_full_name: data.fullName.trim(),
        p_email: data.email.trim().toLowerCase(),
        p_inquiry_type: data.inquiryType,
        p_organization: data.organization?.trim() || '',
        p_message: data.message.trim(),
      });

      console.log('📊 [Contact] Submission result:', { data: submitData, error: submitError });

      if (submitError) {
        console.error('❌ [Contact] Submission error:', submitError);
        throw new Error(submitError.message);
      }

      console.log('✅ [Contact] Submission successful! Submission ID:', submitData);

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      form.reset();
    } catch (err) {
      console.error('❌ [Contact] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    form.reset();
    setError(null);
  };

  return (
    <section 
      ref={sectionRef} 
      className="pt-32 pb-24 lg:pb-32 min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p 
            className="font-sans text-sm uppercase tracking-[4px] mb-4"
            style={{ color: 'var(--primary)' }}
          >
            Get in Touch
          </p>
          <h1 
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: 'var(--foreground)' }}
          >
            Contact Us
          </h1>
          <p 
            className="font-sans text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Have questions about Recommend Her? Interested in partnership opportunities? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-brand border border-navy/5">
              <h3 style={{ color: "var(--foreground)" }} className="font-serif text-lg font-bold mb-6">
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div style={{ backgroundColor: "var(--primary)" }} className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail style={{ color: "white" }} size={20} />
                  </div>
                  <div>
                    <p style={{ color: "var(--foreground)" }} className="font-serif text-sm font-semibold">Email</p>
                    <p style={{ color: "var(--muted-foreground)" }} className="font-sans text-sm">hello@recommendher.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div style={{ backgroundColor: "var(--primary)" }} className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone style={{ color: "white" }} size={20} />
                  </div>
                  <div>
                    <p style={{ color: "var(--foreground)" }} className="font-serif text-sm font-semibold">Phone</p>
                    <p style={{ color: "var(--muted-foreground)" }} className="font-sans text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div style={{ backgroundColor: "var(--primary)" }} className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin style={{ color: "white" }} size={20} />
                  </div>
                  <div>
                    <p style={{ color: "var(--foreground)" }} className="font-serif text-sm font-semibold">Location</p>
                    <p style={{ color: "var(--muted-foreground)" }} className="font-sans text-sm">New York, NY</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership CTA */}
            <div style={{ backgroundColor: "oklch(0.35 0.15 340)" }} className="rounded-2xl p-6">
              <div style={{ backgroundColor: "rgba(255,255,255,0.1)" }} className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building2 style={{ color: "white" }} size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Partnership Opportunities
              </h3>
              <p className="font-sans text-sm text-white/70 mb-4">
                Interested in corporate talent pipeline access? Let's talk.
              </p>
              <a
                href="mailto:partnerships@recommendher.org"
                className="inline-flex items-center gap-2 text-white font-serif text-sm font-semibold
                         hover:opacity-80 transition-colors"
              >
                partnerships@recommendher.org
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                ref={formRef}
                onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white rounded-2xl p-8 sm:p-12 shadow-brand-lg border border-navy/5"
              >
                <h2 style={{ color: "var(--foreground)" }} className="font-serif text-2xl font-bold mb-8">
                  Send us a Message
                </h2>

                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel style={{ color: "var(--foreground)" }} className="font-serif text-sm font-medium">
                          Full Name *
                        </FormLabel>
                        <div className="relative">
                          <User style={{ color: "var(--primary)" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20 rounded-lg font-sans"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel style={{ color: "var(--foreground)" }} className="font-serif text-sm font-medium">
                          Email Address *
                        </FormLabel>
                        <div className="relative">
                          <Mail style={{ color: "var(--primary)" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20 rounded-lg font-sans"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Inquiry Type */}
                  <FormField
                    control={form.control}
                    name="inquiryType"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:col-span-2 relative z-30">
                        <FormLabel style={{ color: "var(--foreground)" }} className="font-serif text-sm font-medium">
                          Inquiry Type *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-navy/20 focus:border-coral focus:ring-coral/20 rounded-lg font-sans">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-50">
                            {inquiryTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Organization */}
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:col-span-2">
                        <FormLabel style={{ color: "var(--foreground)" }} className="font-serif text-sm font-medium">
                          Organization (Optional)
                        </FormLabel>
                        <div className="relative">
                          <Building2 style={{ color: "var(--primary)" }} className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                          <FormControl>
                            <Input
                              placeholder="Your company or organization"
                              className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20 rounded-lg font-sans"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:col-span-2">
                        <FormLabel style={{ color: "var(--foreground)" }} className="font-serif text-sm font-medium">
                          Message *
                        </FormLabel>
                        <div className="relative">
                          <MessageSquare style={{ color: "var(--primary)" }} className="absolute left-4 top-4" size={18} />
                          <FormControl>
                            <Textarea
                              placeholder="How can we help you?"
                              rows={5}
                              className="pl-12 border-navy/20 focus:border-coral focus:ring-coral/20 rounded-lg font-sans resize-none"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "var(--primary)" }} 
                  className="w-full h-14 hover:opacity-90 text-white font-serif font-semibold
                           rounded-lg transition-all duration-300 hover:shadow-coral
                           disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={isSubmitted} onOpenChange={setIsSubmitted}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader className="text-center">
            <div style={{ backgroundColor: "var(--primary)" }} className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Check style={{ color: "white" }} size={32} />
            </div>
            <DialogTitle style={{ color: "var(--foreground)" }} className="font-serif text-2xl font-bold">
              Message Sent!
            </DialogTitle>
            <DialogDescription style={{ color: "var(--muted-foreground)" }} className="font-sans">
              Thank you for reaching out. We've received your message at <strong>{submittedEmail}</strong> and will 
              get back to you within 24-48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              onClick={resetForm}
              style={{ backgroundColor: "var(--primary)" }} 
              className="w-full h-12 hover:opacity-90 text-white font-serif font-semibold
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

export default Contact;
