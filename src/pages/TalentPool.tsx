import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Search, Filter, ArrowUpRight, Eye, EyeOff, User } from 'lucide-react';
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

gsap.registerPlugin(ScrollTrigger);

const allTalents = [
  {
    id: 1,
    title: 'Senior Product Manager | 8+ Years',
    tags: ['Tech', 'Product', 'Strategy'],
    expertise: 'Product strategy, team leadership, agile methodologies, roadmap planning',
    experience: '8 years',
    industry: 'Technology',
    achievements: [
      'Led product launch generating $2M ARR',
      'Managed cross-functional team of 15',
      'Scaled product from 0 to 100K users',
    ],
  },
  {
    id: 2,
    title: 'Marketing Director | 12+ Years',
    tags: ['Marketing', 'Strategy', 'Brand'],
    expertise: 'Brand development, digital marketing, growth strategy, team management',
    experience: '12 years',
    industry: 'Marketing',
    achievements: [
      'Increased brand awareness by 300%',
      'Built marketing team from scratch',
      'Managed $5M annual budget',
    ],
  },
  {
    id: 3,
    title: 'Data Science Lead | 7+ Years',
    tags: ['Data', 'AI/ML', 'Analytics'],
    expertise: 'Machine learning, data analytics, business intelligence, Python, SQL',
    experience: '7 years',
    industry: 'Technology',
    achievements: [
      'Built ML models improving efficiency by 40%',
      'Led data transformation initiative',
      'Published 3 research papers',
    ],
  },
  {
    id: 4,
    title: 'HR Director | 10+ Years',
    tags: ['HR', 'Leadership', 'DEI'],
    expertise: 'Talent acquisition, organizational development, DEI initiatives',
    experience: '10 years',
    industry: 'Human Resources',
    achievements: [
      'Reduced turnover by 35%',
      'Implemented DEI program reaching 500+ employees',
      'Built leadership development pipeline',
    ],
  },
  {
    id: 5,
    title: 'VP of Engineering | 15+ Years',
    tags: ['Tech', 'Engineering', 'Leadership'],
    expertise: 'Software engineering, team scaling, technical strategy, cloud architecture',
    experience: '15 years',
    industry: 'Technology',
    achievements: [
      'Scaled engineering team from 10 to 100',
      'Led cloud migration saving $1M annually',
      'Built high-performance engineering culture',
    ],
  },
  {
    id: 6,
    title: 'Director of Operations | 14+ Years',
    tags: ['Operations', 'Strategy', 'Leadership'],
    expertise: 'Operational excellence, process optimization, supply chain, P&L management',
    experience: '14 years',
    industry: 'Manufacturing',
    achievements: [
      'Improved operational efficiency by 25%',
      'Managed $50M P&L',
      'Led 3 successful M&A integrations',
    ],
  },
  {
    id: 7,
    title: 'Chief Financial Officer | 18+ Years',
    tags: ['Finance', 'Leadership', 'Strategy'],
    expertise: 'Financial planning, M&A, investor relations, strategic planning',
    experience: '18 years',
    industry: 'Finance',
    achievements: [
      'Led 2 successful IPOs',
      'Managed $500M portfolio',
      'Reduced operating costs by 20%',
    ],
  },
  {
    id: 8,
    title: 'Legal Counsel | 9+ Years',
    tags: ['Legal', 'Compliance', 'Strategy'],
    expertise: 'Corporate law, regulatory compliance, contract negotiation, risk management',
    experience: '9 years',
    industry: 'Legal',
    achievements: [
      'Negotiated $100M+ in contracts',
      'Built compliance framework',
      'Led successful litigation defense',
    ],
  },
];

const industries = ['All', 'Technology', 'Finance', 'Marketing', 'Human Resources', 'Manufacturing', 'Legal'];

const TalentPool = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedTalent, setSelectedTalent] = useState<typeof allTalents[0] | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  const CORRECT_PASSWORD = 'sponsor2024';

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
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsAuthenticated(true);
        setPasswordError('');
        setIsLoading(false);
      }, 1000);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const filteredTalents = allTalents.filter((talent) => {
    const matchesSearch =
      talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.achievements.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || talent.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleRequestIntroduction = (talent: typeof allTalents[0]) => {
    setSelectedTalent(talent);
    setRequestDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <section ref={sectionRef} style={{ backgroundColor: "var(--background)" }} className="pt-32 pb-24 lg:pb-32  min-h-screen">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div style={{ backgroundColor: "oklch(0.35 0.15 340)" }} className="w-20 h-20 /10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock style={{ color: "var(--foreground)" }} className="" size={32} />
            </div>
            <h1 style={{ color: "var(--foreground)" }} className="font-serif text-3xl font-bold  mb-4">
              Talent Pool Access
            </h1>
            <p style={{ color: "var(--muted-foreground)" }} className="font-sans ">
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
                  style={{ color: "var(--foreground)" }} className="absolute right-4 top-1/2 -translate-y-1/2  hover:
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
                style={{ backgroundColor: "oklch(0.35 0.15 340)" }} className="w-full h-14 bg-navy hover:/90 text-white font-serif font-semibold
                         rounded-lg transition-all duration-300 hover:shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Authenticating...' : 'Access Talent Pool'}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-navy/10 text-center">
              <p style={{ color: "var(--foreground)" }} className="font-sans text-sm /60">
                Don't have access?{' '}
                <Link
                  to="/for-sponsors"
                  style={{ color: "var(--foreground)" }} className=" hover: transition-colors duration-200"
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
    <section ref={sectionRef} style={{ backgroundColor: "var(--background)" }} className="pt-32 pb-24 lg:pb-32  min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <p style={{ color: "var(--primary)" }} className="font-serif text-sm uppercase tracking-[4px]  mb-4">
              Verified Sponsors Only
            </p>
            <h1 style={{ color: "var(--foreground)" }} className="font-serif text-4xl sm:text-5xl font-bold  mb-4">
              Talent Directory
            </h1>
            <p style={{ color: "var(--muted-foreground)" }} className="font-sans text-lg  max-w-xl">
              Browse our curated pool of exceptional women ready for their next
              leadership opportunity. Profiles are anonymized to prevent bias.
            </p>
          </div>
          <div className="mt-6 lg:mt-0">
            <span style={{ backgroundColor: "var(--primary)" }} className="inline-flex items-center gap-2 px-4 py-2 /10 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span style={{ color: "var(--foreground)" }} className="font-serif text-sm ">
                {allTalents.length} talents available
              </span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search style={{ color: "var(--primary)" }} className="absolute left-4 top-1/2 -translate-y-1/2 " size={20} />
            <Input
              type="text"
              placeholder="Search by title, expertise, or achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-navy/20 focus:border-coral focus:ring-coral/20
                       rounded-lg font-sans"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter style={{ color: "var(--primary)" }} className=" flex-shrink-0" size={20} />
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
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 8 }).map((_, index) => (
              <TalentCardSkeleton key={index} />
            ))
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
                  <p className="font-serif text-sm font-bold text-white">
                    {talent.title}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      style={{ color: "var(--primary)" }} className="px-3 py-1 /10  text-xs font-serif 
                               font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {talent.tags.length > 2 && (
                    <span style={{ color: "var(--foreground)" }} className="px-3 py-1 /10  text-xs font-serif 
                                   font-medium rounded-full">
                      +{talent.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Expertise */}
                <p style={{ color: "var(--foreground)" }} className="font-sans text-sm /60 line-clamp-2 mb-4">
                  {talent.expertise}
                </p>

                {/* Key Achievements */}
                <div className="mb-4">
                  <p style={{ color: "var(--foreground)" }} className="font-serif text-xs font-semibold  mb-2">Key Achievements:</p>
                  <ul className="space-y-1">
                    {talent.achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} style={{ color: "var(--foreground)" }} className="font-sans text-xs /50 line-clamp-1">
                        • {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--foreground)" }} className="font-serif text-xs /40">
                    {talent.experience} exp
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestIntroduction(talent);
                    }}
                    style={{ color: "var(--foreground)" }} className="inline-flex items-center gap-1  font-serif text-sm font-semibold
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

        {/* Empty State */}
        {filteredTalents.length === 0 && (
          <div className="text-center py-16">
            <p style={{ color: "var(--foreground)" }} className="font-sans text-lg /60">
              No talents found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
              }}
              style={{ color: "var(--foreground)" }} className="mt-4  hover: font-serif font-semibold
                       transition-colors duration-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Request Introduction Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--foreground)" }} className="font-serif text-2xl font-bold ">
              Request Introduction
            </DialogTitle>
            <DialogDescription style={{ color: "var(--muted-foreground)" }} className="font-sans ">
              We'll connect you with this talent to discuss potential opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div style={{ backgroundColor: "var(--background)" }} className="flex items-center gap-4 p-4  rounded-xl">
              <div style={{ backgroundColor: "oklch(0.35 0.15 340)" }} className="w-16 h-16 /10 rounded-full flex items-center justify-center">
                <User size={24} style={{ color: "var(--foreground)" }} className="/40" />
              </div>
              <div>
                <h4 style={{ color: "var(--foreground)" }} className="font-serif text-lg font-bold ">
                  {selectedTalent?.title}
                </h4>
                <p style={{ color: "var(--foreground)" }} className="font-sans text-sm /60">
                  {selectedTalent?.industry} • {selectedTalent?.experience}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setRequestDialogOpen(false);
                alert('Introduction request sent! Our team will be in touch.');
              }}
              style={{ backgroundColor: "var(--primary)" }} className="w-full h-12  hover:bg-[#e55a5a] text-white font-serif font-semibold
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
