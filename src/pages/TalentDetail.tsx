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
  Calendar
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

gsap.registerPlugin(ScrollTrigger);

// Extended talent data with more detailed information
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
    bio: 'Results-driven Product Manager with 8+ years of experience in building and scaling B2B SaaS products. Proven track record of leading cross-functional teams and delivering products that drive revenue growth. Passionate about user-centered design and data-driven decision making.',
    skills: ['Product Strategy', 'Agile/Scrum', 'User Research', 'Data Analysis', 'Roadmap Planning', 'Stakeholder Management', 'A/B Testing', 'Jira'],
    education: [
      { degree: 'MBA, Technology Management', school: 'Stanford Graduate School of Business', year: '2018' },
      { degree: 'BS Computer Science', school: 'Howard University', year: '2014' },
    ],
    certifications: ['Certified Scrum Product Owner (CSPO)', 'Google Analytics Certified'],
    languages: ['English', 'Spanish'],
    location: 'San Francisco, CA',
    availability: 'Immediately available',
    preferredRoles: ['VP of Product', 'Director of Product', 'Senior PM'],
    portfolioUrl: 'https://portfolio.example.com',
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Strategic Marketing Director with 12+ years of experience building brands and driving growth. Expert in developing comprehensive marketing strategies across digital and traditional channels. Strong track record of building and mentoring high-performing marketing teams.',
    skills: ['Brand Strategy', 'Digital Marketing', 'Content Marketing', 'SEO/SEM', 'Marketing Automation', 'Team Leadership', 'Budget Management', 'Analytics'],
    education: [
      { degree: 'MBA, Marketing', school: 'Wharton School of Business', year: '2014' },
      { degree: 'BA Communications', school: 'Spelman College', year: '2010' },
    ],
    certifications: ['Google Ads Certified', 'HubSpot Inbound Marketing Certified'],
    languages: ['English'],
    location: 'New York, NY',
    availability: '2 weeks notice',
    preferredRoles: ['CMO', 'VP of Marketing', 'Head of Growth'],
    portfolioUrl: 'https://portfolio.example.com',
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Data Science Lead with 7+ years of experience in developing and deploying machine learning models at scale. Expert in translating complex data into actionable business insights. Strong background in statistical modeling and predictive analytics.',
    skills: ['Machine Learning', 'Python', 'SQL', 'TensorFlow', 'PyTorch', 'Big Data', 'Data Visualization', 'Statistical Modeling'],
    education: [
      { degree: 'MS Data Science', school: 'Carnegie Mellon University', year: '2019' },
      { degree: 'BS Mathematics', school: 'MIT', year: '2016' },
    ],
    certifications: ['AWS Machine Learning Specialty', 'Google Cloud Professional Data Engineer'],
    languages: ['English', 'French'],
    location: 'Seattle, WA',
    availability: '1 month notice',
    preferredRoles: ['Director of Data Science', 'Principal Data Scientist', 'ML Engineering Lead'],
    portfolioUrl: 'https://portfolio.example.com',
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Strategic HR Director with 10+ years of experience in talent management and organizational development. Passionate about creating inclusive workplaces and developing people-first policies. Proven ability to scale HR functions in high-growth environments.',
    skills: ['Talent Acquisition', 'Organizational Development', 'DEI Strategy', 'Performance Management', 'Compensation & Benefits', 'Employee Relations', 'HR Technology', 'Change Management'],
    education: [
      { degree: 'MS Human Resources Management', school: 'Cornell University', year: '2016' },
      { degree: 'BA Psychology', school: 'Hampton University', year: '2012' },
    ],
    certifications: ['SHRM-SCP', 'Certified Diversity Professional (CDP)'],
    languages: ['English'],
    location: 'Chicago, IL',
    availability: 'Immediately available',
    preferredRoles: ['VP of People', 'Chief People Officer', 'Head of Talent'],
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Technical leader with 15+ years of experience building and scaling engineering organizations. Expert in cloud architecture, distributed systems, and agile engineering practices. Proven track record of delivering complex technical projects on time and within budget.',
    skills: ['Engineering Leadership', 'Cloud Architecture', 'Distributed Systems', 'Microservices', 'DevOps', 'Team Building', 'Technical Strategy', 'Agile Development'],
    education: [
      { degree: 'MS Computer Engineering', school: 'Georgia Tech', year: '2012' },
      { degree: 'BS Computer Science', school: 'NC State University', year: '2008' },
    ],
    certifications: ['AWS Certified Solutions Architect', 'Kubernetes Administrator (CKA)'],
    languages: ['English'],
    location: 'Austin, TX',
    availability: '3 months notice',
    preferredRoles: ['CTO', 'SVP of Engineering', 'Head of Engineering'],
    portfolioUrl: 'https://portfolio.example.com',
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Operations leader with 14+ years of experience driving operational excellence in manufacturing and supply chain environments. Expert in process optimization, cost reduction, and scaling operations. Strong financial acumen with experience managing large P&Ls.',
    skills: ['Operations Management', 'Supply Chain', 'Process Improvement', 'Lean Manufacturing', 'P&L Management', 'Strategic Planning', 'M&A Integration', 'Six Sigma'],
    education: [
      { degree: 'MBA, Operations Management', school: 'Kellogg School of Management', year: '2014' },
      { degree: 'BS Industrial Engineering', school: 'Purdue University', year: '2009' },
    ],
    certifications: ['Six Sigma Black Belt', 'APICS CSCP'],
    languages: ['English', 'Mandarin'],
    location: 'Detroit, MI',
    availability: '1 month notice',
    preferredRoles: ['VP of Operations', 'COO', 'SVP of Supply Chain'],
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Strategic CFO with 18+ years of experience in financial leadership across public and private companies. Expert in financial planning, capital markets, and M&A. Strong track record of supporting companies through periods of rapid growth and transformation.',
    skills: ['Financial Strategy', 'M&A', 'Capital Markets', 'Investor Relations', 'FP&A', 'Risk Management', 'Compliance', 'Board Governance'],
    education: [
      { degree: 'MBA, Finance', school: 'Harvard Business School', year: '2010' },
      { degree: 'BS Accounting', school: 'University of Pennsylvania', year: '2006' },
    ],
    certifications: ['CPA', 'CFA Level III'],
    languages: ['English', 'German'],
    location: 'New York, NY',
    availability: 'Immediately available',
    preferredRoles: ['CFO', 'President', 'Board Member'],
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/example',
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
    bio: 'Experienced Legal Counsel with 9+ years of expertise in corporate law and regulatory compliance. Skilled in contract negotiation, risk management, and building effective legal frameworks. Strong business acumen with ability to balance legal protection with business objectives.',
    skills: ['Corporate Law', 'Contract Negotiation', 'Regulatory Compliance', 'Risk Management', 'IP Law', 'M&A Legal', 'Employment Law', 'Data Privacy'],
    education: [
      { degree: 'JD', school: 'Columbia Law School', year: '2015' },
      { degree: 'BA Political Science', school: 'Yale University', year: '2012' },
    ],
    certifications: ['Member, NY State Bar', 'CIPP/US Privacy Certification'],
    languages: ['English', 'Portuguese'],
    location: 'Boston, MA',
    availability: '2 weeks notice',
    preferredRoles: ['General Counsel', 'VP Legal', 'Chief Compliance Officer'],
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/example',
  },
];

const TalentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  
  const talent = allTalents.find(t => t.id === Number(id));

  useEffect(() => {
    if (!talent) return;
    
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
  }, [talent]);

  if (!talent) {
    return (
      <section ref={pageRef} className="pt-32 pb-24 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Talent Not Found
          </h1>
          <p className="font-sans mb-8" style={{ color: 'var(--muted-foreground)' }}>
            The talent profile you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/talent-pool')} style={{ backgroundColor: 'var(--primary)' }}>
            Back to Talent Pool
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section ref={pageRef} className="pt-24 pb-24 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="talent-header mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-sans text-sm transition-colors duration-300 hover:opacity-70"
            style={{ color: 'var(--muted-foreground)' }}
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
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)'
          }}
        >
          {/* Header with gradient */}
          <div 
            className="relative h-48 sm:h-64 px-8 sm:px-12 flex items-end pb-8"
            style={{ background: 'linear-gradient(135deg, oklch(0.35 0.15 340), oklch(0.45 0.18 345))' }}
          >
            <div className="absolute top-6 right-6 flex gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Star size={12} className="mr-1" />
                Featured
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
                  {talent.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 font-sans text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {talent.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {talent.experience}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {talent.availability}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-8 sm:px-12 py-6 flex flex-wrap items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-wrap gap-2">
              {talent.tags.map((tag) => (
                <Badge 
                  key={tag}
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => setRequestDialogOpen(true)}
              style={{ backgroundColor: 'var(--primary)' }}
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
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                About
              </h2>
              <p className="font-sans leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {talent.bio}
              </p>
            </div>

            {/* Skills Section */}
            <div 
              className="content-section rounded-2xl p-6 sm:p-8"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Award size={20} style={{ color: 'var(--primary)' }} />
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline"
                    style={{ 
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    className="px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Key Achievements */}
            <div 
              className="content-section rounded-2xl p-6 sm:p-8"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
                Key Achievements
              </h2>
              <ul className="space-y-3">
                {talent.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      <span className="text-xs font-bold">{i + 1}</span>
                    </span>
                    <span className="font-sans" style={{ color: 'var(--foreground)' }}>
                      {achievement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Education */}
            <div 
              className="content-section rounded-2xl p-6 sm:p-8"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Calendar size={20} style={{ color: 'var(--primary)' }} />
                Education
              </h2>
              <div className="space-y-4">
                {talent.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-sans font-semibold" style={{ color: 'var(--foreground)' }}>
                        {edu.degree}
                      </h3>
                      <p className="font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {edu.school}
                      </p>
                    </div>
                    <span className="font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {edu.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div 
              className="content-section rounded-2xl p-6"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                At a Glance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPinIcon />
                  <div>
                    <p className="font-sans text-xs" style={{ color: 'var(--muted-foreground)' }}>Location</p>
                    <p className="font-sans font-medium" style={{ color: 'var(--foreground)' }}>{talent.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LanguagesIcon />
                  <div>
                    <p className="font-sans text-xs" style={{ color: 'var(--muted-foreground)' }}>Languages</p>
                    <p className="font-sans font-medium" style={{ color: 'var(--foreground)' }}>
                      {talent.languages.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AvailabilityIcon />
                  <div>
                    <p className="font-sans text-xs" style={{ color: 'var(--muted-foreground)' }}>Availability</p>
                    <p className="font-sans font-medium" style={{ color: 'var(--foreground)' }}>{talent.availability}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Roles */}
            <div 
              className="content-section rounded-2xl p-6"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Target Roles
              </h3>
              <div className="space-y-2">
                {talent.preferredRoles.map((role) => (
                  <div 
                    key={role}
                    className="font-sans text-sm py-2 px-3 rounded-lg"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div 
              className="content-section rounded-2xl p-6"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Certifications
              </h3>
              <ul className="space-y-2">
                {talent.certifications.map((cert, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Award size={16} style={{ color: 'var(--primary)' }} className="flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-sm" style={{ color: 'var(--foreground)' }}>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* External Links */}
            {(talent.portfolioUrl || talent.linkedinUrl) && (
              <div 
                className="content-section rounded-2xl p-6"
                style={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  Links
                </h3>
                <div className="space-y-3">
                  {talent.portfolioUrl && (
                    <a 
                      href={talent.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-sans text-sm transition-colors hover:opacity-70"
                      style={{ color: 'var(--primary)' }}
                    >
                      <Globe size={16} />
                      Portfolio
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                  {talent.linkedinUrl && (
                    <a 
                      href={talent.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-sans text-sm transition-colors hover:opacity-70"
                      style={{ color: 'var(--primary)' }}
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
            background: 'linear-gradient(135deg, oklch(0.35 0.15 340), oklch(0.45 0.18 345))',
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
        <DialogContent className="sm:max-w-md rounded-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Request Introduction
            </DialogTitle>
            <DialogDescription className="font-sans" style={{ color: 'var(--muted-foreground)' }}>
              We'll connect you with this talent to discuss potential opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div 
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <User size={24} style={{ color: 'var(--primary-foreground)' }} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {talent.title}
                </h4>
                <p className="font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {talent.industry} • {talent.experience}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setRequestDialogOpen(false);
                alert('Introduction request sent! Our team will be in touch.');
              }}
              className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-300"
              style={{ backgroundColor: 'var(--primary)' }}
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
  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
    <Globe size={18} style={{ color: 'var(--primary)' }} />
  </div>
);

const LanguagesIcon = () => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
    <span style={{ color: 'var(--primary)' }} className="font-bold text-sm">Aa</span>
  </div>
);

const AvailabilityIcon = () => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
    <Clock size={18} style={{ color: 'var(--primary)' }} />
  </div>
);

export default TalentDetail;
