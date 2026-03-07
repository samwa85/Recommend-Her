// ============================================================================
// FOR SPONSORS PAGE - Showcase sponsors and inspire new ones
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Award, 
  Users, 
  Building2, 
  Linkedin,
  BookOpen,
  Download,
  Star,
  ArrowRight,
  Loader2
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
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
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

  return (
    <section ref={sectionRef} className="pt-32 pb-24 lg:pb-32 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-serif text-sm uppercase tracking-[4px] text-primary mb-4">
            For Sponsors
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6 text-foreground">
            Meet Our Sponsors
          </h1>
          <p className="font-sans text-lg max-w-2xl mx-auto text-muted-foreground">
            Leaders who are actively championing women's advancement into leadership positions.
          </p>
        </div>

        {/* Sponsor Showcase */}
        <div ref={sponsorsRef} className="mb-20">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-2xl">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Sponsors coming soon</h3>
              <p className="text-muted-foreground">Check back to meet our amazing sponsors</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={`bg-white rounded-2xl p-8 shadow-brand border border-navy/5
                           transition-all duration-300 hover:-translate-y-2 hover:shadow-brand-lg
                           ${sponsor.featured ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {sponsor.featured && (
                    <div className="flex items-center gap-2 text-yellow-600 mb-4">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-sm font-medium">Featured Sponsor</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      {sponsor.image_url ? (
                        <img 
                          src={sponsor.image_url} 
                          alt={sponsor.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Award className="w-10 h-10 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                        {sponsor.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {sponsor.title}
                        {sponsor.company && ` at ${sponsor.company}`}
                      </p>
                      
                      {sponsor.linkedin_url && (
                        <a 
                          href={sponsor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-4"
                        >
                          <Linkedin className="w-4 h-4" />
                          Connect on LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <blockquote className="mt-6 text-foreground leading-relaxed italic">
                    "{sponsor.bio}"
                  </blockquote>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Playbook Section */}
        <div 
          ref={playbookRef}
          className="bg-primary rounded-2xl p-8 sm:p-12 mb-16 text-primary-foreground"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
              The Sponsor's Playbook
            </h2>
            <p className="text-lg mb-8 opacity-90 leading-relaxed">
              You've received this playbook because you've taken the first step toward something
              powerful: becoming an active sponsor for women's leadership.
            </p>
            <p className="mb-8 opacity-90 leading-relaxed">
              Perhaps you've already mentored brilliant women. You've given advice, shared
              insights, and watched them grow. But you've also noticed something: even the
              most talented women often wait too long to be invited, while others—less qualified
              but more visible—step into opportunities they deserve.
            </p>
            <a
              href="/downloads/THE%20SPONSOR'S%20PLAYBOOK.pdf"
              download
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-primary 
                       font-serif font-semibold hover:bg-gray-100 transition-all duration-300
                       hover:shadow-lg"
            >
              <Download size={20} />
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
              className="bg-white rounded-2xl p-8 shadow-brand border border-navy/5
                       text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-brand-lg"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-foreground">
                {benefit.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-muted rounded-2xl p-8 sm:p-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            Ready to Become a Sponsor?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join our network of leaders committed to actively sponsoring talented women 
            into leadership positions. Together, we can change the landscape of leadership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                       bg-primary text-primary-foreground font-serif font-semibold
                       hover:opacity-90 transition-all duration-300"
            >
              Get in Touch
              <ArrowRight size={18} />
            </a>
            <a
              href="/talent-pool"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                       border-2 border-primary text-primary font-serif font-semibold
                       hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              View Talent Pool
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSponsors;
