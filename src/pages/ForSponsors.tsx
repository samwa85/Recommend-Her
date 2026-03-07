// ============================================================================
// FOR SPONSORS PAGE - Premium Sponsor Showcase
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Award, 
  Users, 
  Building2, 
  Linkedin,
  Download,
  Star,
  ArrowRight,
  Loader2,
  Briefcase,
  Calendar,
  CheckCircle2,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveSponsorShowcase } from '@/lib/queries/sponsorShowcase';
import type { SponsorShowcase } from '@/lib/types/db';

gsap.registerPlugin(ScrollTrigger);

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

// Mock stats for sponsors - in production these would come from the database
const sponsorStats = [
  { label: 'Women Sponsored', value: '50+' },
  { label: 'Years Active', value: '3+' },
  { label: 'Leadership Roles', value: '12' },
];

const ForSponsors = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const playbookRef = useRef<HTMLDivElement>(null);
  const sponsorsRef = useRef<HTMLDivElement>(null);
  
  const [sponsors, setSponsors] = useState<SponsorShowcase[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sponsors
  useEffect(() => {
    const loadSponsors = async () => {
      const { data, error } = await getActiveSponsorShowcase();
      if (!error) {
        setSponsors(data);
      }
      setLoading(false);
    };
    loadSponsors();
  }, []);

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

      // Playbook animation
      gsap.fromTo(
        playbookRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: playbookRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Sponsors animation
      const sponsorCards = sponsorsRef.current?.children;
      if (sponsorCards) {
        gsap.fromTo(
          sponsorCards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sponsorsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [sponsors]);

  // Separate featured and regular sponsors
  const featuredSponsor = sponsors.find(s => s.featured);
  const regularSponsors = sponsors.filter(s => !s.featured);

  return (
    <section ref={sectionRef} className="pt-32 pb-24 lg:pb-32 min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Our Partners</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Meet Our Sponsors
          </h1>
          <p className="font-sans text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            Industry leaders actively championing women's advancement into executive leadership positions
          </p>
        </div>

        {/* Sponsor Showcase */}
        <div ref={sponsorsRef} className="mb-20 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-muted to-muted/50 rounded-3xl border border-border">
              <Award className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium mb-2">Sponsors Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're partnering with visionary leaders. Check back soon to meet our founding sponsors.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Sponsor - Hero Card */}
              {featuredSponsor && (
                <div className="relative group">
                  {/* Featured Badge */}
                  <div className="absolute -top-4 left-8 z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full shadow-lg">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold uppercase tracking-wider">Featured Sponsor</span>
                    </div>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                    </div>
                    
                    <div className="relative grid md:grid-cols-5 gap-8 p-8 lg:p-12">
                      {/* Image Section */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl">
                            {featuredSponsor.image_url ? (
                              <img 
                                src={featuredSponsor.image_url} 
                                alt={featuredSponsor.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/20">
                                <Award className="w-20 h-20 text-white/80" />
                              </div>
                            )}
                          </div>
                          {/* Verified Badge */}
                          <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-xs">
                          {sponsorStats.map((stat) => (
                            <div key={stat.label} className="text-center">
                              <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                              <p className="text-xs text-white/70 mt-1">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="md:col-span-3 flex flex-col justify-center">
                        <h3 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
                          {featuredSponsor.name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/90 mb-4">
                          <Briefcase className="w-5 h-5" />
                          <span className="text-lg">{featuredSponsor.title}</span>
                        </div>
                        {featuredSponsor.company && (
                          <div className="flex items-center gap-2 text-white/80 mb-6">
                            <Building2 className="w-5 h-5" />
                            <span className="text-lg">{featuredSponsor.company}</span>
                          </div>
                        )}
                        
                        {/* Quote */}
                        <div className="relative mb-8">
                          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/20" />
                          <blockquote className="text-lg lg:text-xl leading-relaxed text-white/95 italic pl-6 border-l-2 border-white/30">
                            {featuredSponsor.bio}
                          </blockquote>
                        </div>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                          {featuredSponsor.linkedin_url && (
                            <a
                              href={featuredSponsor.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                              <Linkedin className="w-5 h-5" />
                              Connect on LinkedIn
                            </a>
                          )}
                          <a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                          >
                            <Calendar className="w-5 h-5" />
                            Book a Meeting
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Regular Sponsors - Grid */}
              {regularSponsors.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {regularSponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-border/50 
                               transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20"
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative flex gap-6">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                            {sponsor.image_url ? (
                              <img 
                                src={sponsor.image_url} 
                                alt={sponsor.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <Award className="w-10 h-10 text-primary/60" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-xl lg:text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {sponsor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {sponsor.title}
                          </p>
                          {sponsor.company && (
                            <p className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {sponsor.company}
                            </p>
                          )}
                          
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                            "{sponsor.bio}"
                          </p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            {sponsor.linkedin_url && (
                              <a
                                href={sponsor.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5]/10 text-[#0077b5] rounded-lg text-sm font-medium hover:bg-[#0077b5]/20 transition-colors"
                              >
                                <Linkedin className="w-4 h-4" />
                                Connect
                              </a>
                            )}
                            <a
                              href="/contact"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              Learn More
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Playbook Section */}
        <div 
          ref={playbookRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy to-navy/90 p-8 sm:p-12 lg:p-16 text-white mb-16"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
          </div>
          
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 mb-8">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              The Sponsor's Playbook
            </h2>
            <p className="text-lg sm:text-xl mb-6 text-white/90 leading-relaxed">
              You've received this playbook because you've taken the first step toward something
              powerful: becoming an active sponsor for women's leadership.
            </p>
            <p className="mb-10 text-white/70 leading-relaxed max-w-2xl mx-auto">
              Perhaps you've already mentored brilliant women. You've given advice, shared
              insights, and watched them grow. But you've also noticed something: even the
              most talented women often wait too long to be invited, while others—less qualified
              but more visible—step into opportunities they deserve.
            </p>
            <a
              href="/downloads/THE%20SPONSOR'S%20PLAYBOOK.pdf"
              download
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-navy 
                       font-serif font-semibold hover:bg-white/90 transition-all duration-300
                       hover:shadow-2xl hover:-translate-y-1 shadow-lg"
            >
              <Download size={22} />
              Download Playbook
            </a>
          </div>
        </div>

        {/* Benefits */}
        <div
          ref={benefitsRef}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group bg-white rounded-2xl p-8 shadow-lg border border-border/50
                       text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <benefit.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-foreground">
                {benefit.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted to-muted/50 p-8 sm:p-12 text-center border border-border">
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Ready to Become a Sponsor?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Join our network of leaders committed to actively sponsoring talented women 
              into leadership positions. Together, we can change the landscape of leadership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl
                         bg-primary text-primary-foreground font-serif font-semibold
                         hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Get in Touch
                <ArrowRight size={20} />
              </a>
              <a
                href="/talent-pool"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl
                         border-2 border-primary text-primary font-serif font-semibold
                         hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                View Talent Pool
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSponsors;
