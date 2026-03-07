import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Search, Filter, ArrowUpRight, Eye, EyeOff, User, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TalentCardSkeleton } from '@/components/TalentCardSkeleton';
import { listTalent } from '@/lib/queries';
import type { TalentProfile } from '@/lib/types/db';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

const industries = ['All', 'Technology', 'Finance', 'Marketing', 'Human Resources', 'Manufacturing', 'Legal'];

const TalentPool = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  const CORRECT_PASSWORD = 'sponsor2024';

  // Fetch approved talent from database
  const fetchTalents = async () => {
    setIsDataLoading(true);
    setError(null);
    setDebugInfo('');
    
    try {
      console.log('[TalentPool] Fetching approved talent...');
      const result = await listTalent({
        filters: { status: 'approved' },
        pagination: { page: 1, perPage: 100 }
      });
      
      console.log('[TalentPool] Result:', result);
      
      if (result.error) {
        console.error('Error fetching talents:', result.error);
        setError(`Failed to load talent profiles: ${result.error.message}`);
        setDebugInfo(`Error: ${result.error.message}`);
        toast.error('Failed to load talent profiles');
      } else {
        const data = result.data || [];
        setTalents(data);
        setDebugInfo(`Found ${data.length} approved talent profiles`);
        
        if (data.length === 0) {
          setError('No approved talent profiles found in the database.');
        }
      }
    } catch (err) {
      console.error('Error fetching talents:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load talent profiles: ${errMsg}`);
      setDebugInfo(`Exception: ${errMsg}`);
      toast.error('Failed to load talent profiles');
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTalents();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.08,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isAuthenticated, talents]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsLoading(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setPasswordError('');
        setIsLoading(false);
      }, 1000);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  // Filter talents based on search and industry
  const filteredTalents = talents.filter((talent) => {
    const matchesSearch =
      (talent.headline?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (talent.bio?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (talent.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (talent.role_category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || talent.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleRequestIntroduction = (talent: TalentProfile) => {
    setSelectedTalent(talent);
    setRequestDialogOpen(true);
  };

  // Helper to get display title for talent (anonymized)
  const getTalentDisplayTitle = (talent: TalentProfile): string => {
    if (talent.headline) return talent.headline;
    if (talent.role_category && talent.years_of_experience) {
      return `${talent.role_category} | ${talent.years_of_experience}`;
    }
    return 'Professional Profile';
  };

  // Helper to get tags for talent
  const getTalentTags = (talent: TalentProfile): string[] => {
    const tags: string[] = [];
    if (talent.industry) tags.push(talent.industry);
    if (talent.role_category) tags.push(talent.role_category);
    if (talent.seniority_level) tags.push(talent.seniority_level);
    return tags.slice(0, 3);
  };

  // Helper to get expertise description
  const getTalentExpertise = (talent: TalentProfile): string => {
    if (talent.bio) {
      return talent.bio.length > 100 ? talent.bio.substring(0, 100) + '...' : talent.bio;
    }
    if (talent.skills && talent.skills.length > 0) {
      return talent.skills.slice(0, 5).join(', ');
    }
    return 'Experienced professional seeking new opportunities';
  };

  // Helper to get achievements
  const getTalentAchievements = (talent: TalentProfile): string[] => {
    // Try to parse bio for achievements or use skills as fallback
    if (talent.seeking_roles && talent.seeking_roles.length > 0) {
      return talent.seeking_roles.slice(0, 3);
    }
    if (talent.skills && talent.skills.length > 0) {
      return talent.skills.slice(0, 3);
    }
    return ['Experienced professional', 'Available for opportunities', 'Verified by Recommend Her'];
  };

  if (!isAuthenticated) {
    return (
      <section ref={sectionRef} style={{ backgroundColor: "hsl(var(--background))" }} className="pt-32 pb-24 lg:pb-32  min-h-screen">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div style={{ backgroundColor: "hsl(var(--primary))" }} className="w-20 h-20 /10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock style={{ color: "hsl(var(--foreground))" }} className="" size={32} />
            </div>
            <h1 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-3xl font-bold  mb-4">
              Talent Pool Access
            </h1>
            <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans ">
              This area is password-protected and reserved for verified sponsors.
              Please enter the access code to view our talent directory.
            </p>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white rounded-2xl p-8 shadow-brand-lg border border-navy/5"
          >
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  className="h-14 pr-12 border-navy/20 focus:border-coral focus:ring-coral/20
                           rounded-lg font-sans text-lg text-center tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: "hsl(var(--foreground))" }} className="absolute right-4 top-1/2 -translate-y-1/2  hover:
                           transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {passwordError && (
                <p className="font-sans text-sm text-red-500 text-center">
                  {passwordError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "hsl(var(--primary))" }} className="w-full h-14 bg-navy hover:/90 text-white font-serif font-semibold
                         rounded-lg transition-all duration-300 hover:shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Authenticating...' : 'Access Talent Pool'}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-navy/10 text-center">
              <p style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm /60">
                Don't have access?{' '}
                <Link
                  to="/for-sponsors"
                  style={{ color: "hsl(var(--foreground))" }} className=" hover: transition-colors duration-200"
                >
                  Apply to become a sponsor
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ backgroundColor: "hsl(var(--background))" }} className="pt-32 pb-24 lg:pb-32  min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <p style={{ color: "hsl(var(--primary))" }} className="font-serif text-sm uppercase tracking-[4px]  mb-4">
              Verified Sponsors Only
            </p>
            <h1 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-4xl sm:text-5xl font-bold  mb-4">
              Talent Directory
            </h1>
            <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans text-lg  max-w-xl">
              Browse our curated pool of exceptional women ready for their next
              leadership opportunity. Profiles are anonymized to prevent bias.
            </p>
          </div>
          <div className="mt-6 lg:mt-0 flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTalents}
              disabled={isDataLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isDataLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span style={{ backgroundColor: "hsl(var(--primary))" }} className="inline-flex items-center gap-2 px-4 py-2 /10 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span style={{ color: "hsl(var(--foreground))" }} className="font-serif text-sm ">
                {filteredTalents.length} talents available
              </span>
            </span>
          </div>
        </div>

        {/* Debug Info (visible during development) */}
        {(debugInfo || error) && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> {debugInfo || error}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search style={{ color: "hsl(var(--primary))" }} className="absolute left-4 top-1/2 -translate-y-1/2 " size={20} />
            <Input
              type="text"
              placeholder="Search by role, expertise, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                       rounded-lg font-sans"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter style={{ color: "hsl(var(--primary))" }} className=" flex-shrink-0" size={20} />
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-lg font-serif text-sm font-medium whitespace-nowrap
                         transition-all duration-200 ${
                           selectedIndustry === industry
                             ? 'bg-navy text-white'
                             : 'bg-white text-navy hover:bg-coral/10 border border-navy/10'
                         }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isDataLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 8 }).map((_, index) => (
              <TalentCardSkeleton key={index} />
            ))
          ) : filteredTalents.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p style={{ color: "hsl(var(--foreground))" }} className="font-sans text-lg /60 mb-4">
                {error || 'No talents found matching your criteria.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustry('All');
                }}
                style={{ color: "hsl(var(--foreground))" }} className="mt-4  hover: font-serif font-semibold
                       transition-colors duration-200"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredTalents.map((talent, index) => (
            <div
              key={talent.id}
              ref={(el) => { cardsRef.current[index] = el; }}
              onClick={() => navigate(`/talent/${talent.id}`)}
              className="group bg-white rounded-2xl overflow-hidden shadow-brand 
                        transition-all duration-500 hover:-translate-y-3 hover:shadow-brand-lg
                        border border-navy/5 hover:border-coral/20 cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative h-32 bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <User size={40} className="text-white/60" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-serif text-sm font-bold text-white truncate">
                    {getTalentDisplayTitle(talent)}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getTalentTags(talent).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      style={{ color: "hsl(var(--primary))" }} className="px-3 py-1 /10  text-xs font-serif 
                               font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {getTalentTags(talent).length > 2 && (
                    <span style={{ color: "hsl(var(--foreground))" }} className="px-3 py-1 /10  text-xs font-serif 
                                   font-medium rounded-full">
                      +{getTalentTags(talent).length - 2}
                    </span>
                  )}
                </div>

                {/* Expertise */}
                <p style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm /60 line-clamp-2 mb-4">
                  {getTalentExpertise(talent)}
                </p>

                {/* Key Achievements */}
                <div className="mb-4">
                  <p style={{ color: "hsl(var(--foreground))" }} className="font-serif text-xs font-semibold  mb-2">Highlights:</p>
                  <ul className="space-y-1">
                    {getTalentAchievements(talent).slice(0, 2).map((achievement, i) => (
                      <li key={i} style={{ color: "hsl(var(--foreground))" }} className="font-sans text-xs /50 line-clamp-1">
                        • {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: "hsl(var(--foreground))" }} className="font-serif text-xs /40">
                    {talent.years_of_experience || talent.years_experience ? `${talent.years_of_experience || talent.years_experience} exp` : 'Experienced'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestIntroduction(talent);
                    }}
                    style={{ color: "hsl(var(--foreground))" }} className="inline-flex items-center gap-1  font-serif text-sm font-semibold
                             transition-all duration-300 group-hover:"
                  >
                    Request Intro
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 
                               group-hover:-translate-y-0.5"
                    />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Request Introduction Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--foreground))" }} className="font-serif text-2xl font-bold ">
              Request Introduction
            </DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans ">
              We'll connect you with this talent to discuss potential opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div style={{ backgroundColor: "hsl(var(--background))" }} className="flex items-center gap-4 p-4  rounded-xl">
              <div style={{ backgroundColor: "hsl(var(--primary))" }} className="w-16 h-16 /10 rounded-full flex items-center justify-center">
                <User size={24} style={{ color: "hsl(var(--foreground))" }} className="/40" />
              </div>
              <div>
                <h4 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-lg font-bold ">
                  {selectedTalent ? getTalentDisplayTitle(selectedTalent) : 'Talent Profile'}
                </h4>
                <p style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm /60">
                  {selectedTalent?.industry} • {selectedTalent?.years_of_experience || selectedTalent?.years_experience}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setRequestDialogOpen(false);
                alert('Introduction request sent! Our team will be in touch.');
              }}
              style={{ backgroundColor: "hsl(var(--primary))" }} className="w-full h-12  hover:bg-[#e55a5a] text-white font-serif font-semibold
                       rounded-lg transition-all duration-300"
            >
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TalentPool;
