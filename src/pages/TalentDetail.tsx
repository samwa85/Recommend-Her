import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  Building2, 
  Award, 
  Star, 
  CheckCircle2,
  ArrowUpRight,
  User,
  Mail,
  Globe,
  FileText,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getTalentById } from '@/lib/queries';
import type { TalentProfile } from '@/lib/types/db';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

const TalentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch talent from database
  useEffect(() => {
    const fetchTalent = async () => {
      if (!id) {
        setError('No talent ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getTalentById(id);
        
        if (result.error) {
          console.error('Error fetching talent:', result.error);
          setError('Failed to load talent profile');
          toast.error('Failed to load talent profile');
        } else if (!result.data) {
          setError('Talent profile not found');
        } else {
          // Only show approved talent on public pages
          if (result.data.status !== 'approved') {
            setError('Talent profile not available');
          } else {
            setTalent(result.data);
          }
        }
      } catch (err) {
        console.error('Error fetching talent:', err);
        setError('Failed to load talent profile');
        toast.error('Failed to load talent profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalent();
  }, [id]);

  useEffect(() => {
    if (!talent || isLoading) return;
    
    window.scrollTo(0, 0);
    
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.talent-header',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }
      );
      
      // Content sections stagger
      gsap.fromTo(
        '.content-section',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [talent, isLoading]);

  // Helper to get display title for talent (anonymized)
  const getTalentDisplayTitle = (talent: TalentProfile): string => {
    if (talent.headline) return talent.headline;
    if (talent.role_category && talent.years_of_experience) {
      return `${talent.role_category} | ${talent.years_of_experience}`;
    }
    if (talent.current_role_title) return talent.current_role_title;
    return 'Professional Profile';
  };

  // Helper to get tags for talent
  const getTalentTags = (talent: TalentProfile): string[] => {
    const tags: string[] = [];
    if (talent.industry) tags.push(talent.industry);
    if (talent.role_category) tags.push(talent.role_category);
    if (talent.seniority_level) tags.push(talent.seniority_level);
    if (talent.functions) tags.push(...talent.functions.slice(0, 2));
    return tags.slice(0, 4);
  };

  // Helper to get skills
  const getTalentSkills = (talent: TalentProfile): string[] => {
    return talent.skills || [];
  };

  // Helper to get highlights/achievements
  const getTalentHighlights = (talent: TalentProfile): string[] => {
    if (talent.seeking_roles && talent.seeking_roles.length > 0) {
      return talent.seeking_roles.slice(0, 3);
    }
    if (talent.functions && talent.functions.length > 0) {
      return talent.functions.slice(0, 3);
    }
    return ['Experienced professional', 'Available for opportunities', 'Verified by Recommend Her'];
  };

  // Helper to format experience
  const getExperienceDisplay = (talent: TalentProfile): string => {
    return talent.years_of_experience || talent.years_experience?.toString() || 'Experienced';
  };

  // Helper to get location
  const getLocation = (talent: TalentProfile): string => {
    if (talent.city && talent.country) return `${talent.city}, ${talent.country}`;
    if (talent.city) return talent.city;
    if (talent.country) return talent.country;
    return 'Location flexible';
  };

  // Helper to get languages
  const getLanguages = (talent: TalentProfile): string[] => {
    return talent.languages || ['English'];
  };

  // Helper to get availability
  const getAvailability = (talent: TalentProfile): string => {
    return talent.work_mode_preference || 'Open to opportunities';
  };

  if (isLoading) {
    return (
      <section ref={pageRef} className="pt-32 pb-24 min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'hsl(var(--primary))' }} />
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Loading talent profile...</p>
        </div>
      </section>
    );
  }

  if (error || !talent) {
    return (
      <section ref={pageRef} className="pt-32 pb-24 min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            Talent Not Found
          </h1>
          <p className="font-sans mb-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {error || "The talent profile you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/talent-pool')} style={{ backgroundColor: 'hsl(var(--primary))' }}>
            Back to Talent Pool
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section ref={pageRef} className="pt-24 pb-24 min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="talent-header mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-sans text-sm transition-colors duration-300 hover:opacity-70"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <ArrowLeft size={18} />
            Back to Talent Pool
          </button>
        </div>

        {/* Hero Section */}
        <div 
          ref={contentRef}
          className="content-section rounded-3xl overflow-hidden mb-8"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'var(--shadow)'
          }}
        >
          {/* Header with gradient */}
          <div 
            className="relative h-48 sm:h-64 px-8 sm:px-12 flex items-end pb-8"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(346 60% 42%))' }}
          >
            <div className="absolute top-6 right-6 flex gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Star size={12} className="mr-1" />
                Verified
              </Badge>
            </div>
            <div className="flex items-end gap-6">
              <div 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <User size={48} />
              </div>
              <div className="pb-2">
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-2">
                  {getTalentDisplayTitle(talent)}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 font-sans text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {talent.industry || 'Industry not specified'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {getExperienceDisplay(talent)} experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {getAvailability(talent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-8 sm:px-12 py-6 flex flex-wrap items-center justify-between gap-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            <div className="flex flex-wrap gap-2">
              {getTalentTags(talent).map((tag) => (
                <Badge 
                  key={tag}
                  style={{ 
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))'
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => setRequestDialogOpen(true)}
              style={{ backgroundColor: 'hsl(var(--primary))' }}
              className="text-white hover:opacity-90"
            >
              Request Introduction
              <ArrowUpRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div 
              className="content-section rounded-2xl p-6 sm:p-8"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                <FileText size={20} style={{ color: 'hsl(var(--primary))' }} />
                About
              </h2>
              <p className="font-sans leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {talent.bio || 'No bio available for this candidate.'}
              </p>
            </div>

            {/* Skills Section */}
            {getTalentSkills(talent).length > 0 && (
              <div 
                className="content-section rounded-2xl p-6 sm:p-8"
                style={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                  <Award size={20} style={{ color: 'hsl(var(--primary))' }} />
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {getTalentSkills(talent).map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline"
                      style={{ 
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }}
                      className="px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Key Achievements / Highlights */}
            <div 
              className="content-section rounded-2xl p-6 sm:p-8"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                <CheckCircle2 size={20} style={{ color: 'hsl(var(--primary))' }} />
                Career Highlights
              </h2>
              <ul className="space-y-3">
                {getTalentHighlights(talent).map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                    >
                      <span className="text-xs font-bold">{i + 1}</span>
                    </span>
                    <span className="font-sans" style={{ color: 'hsl(var(--foreground))' }}>
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Education */}
            {talent.education_level && (
              <div 
                className="content-section rounded-2xl p-6 sm:p-8"
                style={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                  <Calendar size={20} style={{ color: 'hsl(var(--primary))' }} />
                  Education
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-sans font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                        {talent.education_level}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div 
              className="content-section rounded-2xl p-6"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                At a Glance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPinIcon />
                  <div>
                    <p className="font-sans text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Location</p>
                    <p className="font-sans font-medium" style={{ color: 'hsl(var(--foreground))' }}>{getLocation(talent)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LanguagesIcon />
                  <div>
                    <p className="font-sans text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Languages</p>
                    <p className="font-sans font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                      {getLanguages(talent).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AvailabilityIcon />
                  <div>
                    <p className="font-sans text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Work Preference</p>
                    <p className="font-sans font-medium" style={{ color: 'hsl(var(--foreground))' }}>{getAvailability(talent)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Roles */}
            {talent.seeking_roles && talent.seeking_roles.length > 0 && (
              <div 
                className="content-section rounded-2xl p-6"
                style={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                  Target Roles
                </h3>
                <div className="space-y-2">
                  {talent.seeking_roles.map((role) => (
                    <div 
                      key={role}
                      className="font-sans text-sm py-2 px-3 rounded-lg"
                      style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Salary Range */}
            {talent.salary_range && (
              <div 
                className="content-section rounded-2xl p-6"
                style={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                  Salary Expectation
                </h3>
                <p className="font-sans" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {talent.salary_range}
                </p>
              </div>
            )}

            {/* External Links */}
            {(talent.portfolio_url || talent.linkedin_url || talent.website_url) && (
              <div 
                className="content-section rounded-2xl p-6"
                style={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                  Links
                </h3>
                <div className="space-y-3">
                  {talent.portfolio_url && (
                    <a 
                      href={talent.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-sans text-sm transition-colors hover:opacity-70"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      <Globe size={16} />
                      Portfolio
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                  {talent.website_url && (
                    <a 
                      href={talent.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-sans text-sm transition-colors hover:opacity-70"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      <Globe size={16} />
                      Website
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                  {talent.linkedin_url && (
                    <a 
                      href={talent.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-sans text-sm transition-colors hover:opacity-70"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      <Mail size={16} />
                      LinkedIn
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="content-section mt-12 rounded-2xl p-8 text-center"
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(346 60% 42%))',
          }}
        >
          <h2 className="font-serif text-2xl font-bold text-white mb-3">
            Interested in this candidate?
          </h2>
          <p className="font-sans text-white/80 mb-6 max-w-xl mx-auto">
            Request an introduction to discuss how this talented professional can contribute to your organization.
          </p>
          <Button
            onClick={() => setRequestDialogOpen(true)}
            variant="secondary"
            size="lg"
            className="bg-white text-[#2d1b2e] hover:bg-white/90"
          >
            Request Introduction
            <ArrowUpRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Request Introduction Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl" style={{ backgroundColor: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              Request Introduction
            </DialogTitle>
            <DialogDescription className="font-sans" style={{ color: 'hsl(var(--muted-foreground))' }}>
              We'll connect you with this talent to discuss potential opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div 
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                <User size={24} style={{ color: 'hsl(var(--primary-foreground))' }} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  {getTalentDisplayTitle(talent)}
                </h4>
                <p className="font-sans text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {talent.industry} • {getExperienceDisplay(talent)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setRequestDialogOpen(false);
                toast.success('Introduction request sent! Our team will be in touch.');
              }}
              className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

// Helper icons
const MapPinIcon = () => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--accent))' }}>
    <Globe size={18} style={{ color: 'hsl(var(--primary))' }} />
  </div>
);

const LanguagesIcon = () => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--accent))' }}>
    <span style={{ color: 'hsl(var(--primary))' }} className="font-bold text-sm">Aa</span>
  </div>
);

const AvailabilityIcon = () => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--accent))' }}>
    <Clock size={18} style={{ color: 'hsl(var(--primary))' }} />
  </div>
);

export default TalentDetail;
