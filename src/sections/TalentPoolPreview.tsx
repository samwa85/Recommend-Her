import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const talents = [
  {
    id: 1,
    title: 'Senior Product Manager | 8+ Years',
    tags: ['Tech', 'Product'],
    expertise: 'Product strategy, team leadership, agile methodologies',
    image: '/images/talent-1.jpg',
    alt: 'Professional Black woman in business attire',
  },
  {
    id: 2,
    title: 'Marketing Director | 12+ Years',
    tags: ['Marketing', 'Strategy'],
    expertise: 'Brand development, digital marketing, growth strategy',
    image: '/images/talent-2.jpg',
    alt: 'Black American woman marketing professional',
  },
  {
    id: 3,
    title: 'Data Science Lead | 7+ Years',
    tags: ['Data', 'AI/ML'],
    expertise: 'Machine learning, data analytics, business intelligence',
    image: '/images/talent-3.jpg',
    alt: 'Black woman data scientist working',
  },
  {
    id: 4,
    title: 'HR Director | 10+ Years',
    tags: ['HR', 'Leadership'],
    expertise: 'Talent acquisition, organizational development, DEI',
    image: '/images/talent-4.jpg',
    alt: 'Black American woman HR professional',
  },
];

const TalentPoolPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards stagger animation
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { x: 100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <p 
              className="font-sans text-sm uppercase tracking-[4px] mb-4"
              style={{ color: 'hsl(var(--primary))' }}
            >
              Talent Pool
            </p>
            <h2 
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Meet Our Community
            </h2>
            <p 
              className="font-sans text-lg max-w-xl leading-relaxed"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              A glimpse of the exceptional women in our network, ready for their
              next leadership opportunity.
            </p>
          </div>
          <Link
            to="/talent-pool"
            className="group inline-flex items-center gap-2 mt-6 md:mt-0 font-sans font-semibold transition-colors duration-300"
            style={{ color: 'hsl(var(--primary))' }}
          >
            View Full Directory
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Talent Cards */}
        <div
          ref={cardsContainerRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {talents.map((talent, index) => (
            <div
              key={talent.id}
              ref={(el) => { cardsRef.current[index] = el; }}
              onClick={() => navigate(`/talent/${talent.id}`)}
              className="group rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-4 cursor-pointer"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                boxShadow: 'var(--shadow)',
                border: '1px solid hsl(var(--border))'
              }}
            >
              {/* Avatar with Image */}
              <div
                className="relative h-40 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(346 60% 42%))' }}
              >
                <img
                  src={talent.image}
                  alt={talent.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient for better text readability */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)'
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 
                  className="font-serif text-lg sm:text-xl font-bold mb-2"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {talent.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full font-sans text-sm font-medium"
                      style={{ 
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p 
                  className="font-sans text-base line-clamp-2 mb-4 leading-relaxed"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {talent.expertise}
                </p>

                {/* CTA */}
                <span
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold transition-all duration-300"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  View Profile
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TalentPoolPreview;
