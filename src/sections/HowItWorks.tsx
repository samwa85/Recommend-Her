import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserPlus, Handshake, Rocket, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Submit Your Profile',
    description: 'Talent submits a curated profile to our vetted network.',
    color: 'bg-[hsl(var(--primary))]',
  },
  {
    number: '02',
    icon: Handshake,
    title: 'Sponsors Pledge',
    description: 'Sponsors pledge to recommend actively from our talent pool.',
    color: 'bg-[hsl(var(--accent))]',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Create Opportunities',
    description: 'Matches create career-defining opportunities for women leaders.',
    color: 'bg-[hsl(var(--primary))]',
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Steps animation
      stepsRef.current.forEach((step, index) => {
        if (!step) return;

        gsap.fromTo(
          step,
          { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.2,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 lg:py-32"
      style={{ backgroundColor: 'hsl(var(--card))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p 
            className="font-sans text-sm uppercase tracking-[4px] mb-4"
            style={{ color: 'hsl(var(--primary))' }}
          >
            How It Works
          </p>
          <h2 
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Three Steps to Change
          </h2>
          <p 
            className="font-sans text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Our simple process connects talented women with leaders ready to advocate for them.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              ref={(el) => { stepsRef.current[index] = el; }}
              className="relative group"
            >
              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-16 left-[60%] w-full h-0.5"
                  style={{ backgroundColor: 'hsl(var(--border))' }}
                >
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  />
                </div>
              )}

              <div 
                className="rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2"
                style={{ 
                  backgroundColor: 'hsl(var(--background))',
                  boxShadow: 'var(--shadow)'
                }}
              >
                {/* Number Badge */}
                <div className={`inline-flex items-center justify-center w-12 h-12 ${step.color} rounded-xl mb-6`}>
                  <step.icon size={24} className="text-white" />
                </div>

                {/* Number */}
                <span 
                  className="font-serif text-5xl font-bold block mb-4"
                  style={{ color: 'hsl(var(--border))' }}
                >
                  {step.number}
                </span>

                {/* Content */}
                <h3 
                  className="font-serif text-xl sm:text-2xl font-bold mb-3"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {step.title}
                </h3>
                <p 
                  className="font-sans text-base leading-relaxed"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/mission"
            className="group inline-flex items-center gap-2 font-sans font-semibold transition-colors duration-300"
            style={{ color: 'hsl(var(--primary))' }}
          >
            See Success Stories
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
