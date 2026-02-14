import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 500, suffix: '+', label: 'Talents in Pool' },
  { value: 150, suffix: '+', label: 'Active Sponsors' },
  { value: 200, suffix: '+', label: 'Successful Matches' },
];

const ForSponsorsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image slide in
      gsap.fromTo(
        imageRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content slide in
      gsap.fromTo(
        contentRef.current,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats counter animation
      ScrollTrigger.create({
        trigger: statsRef.current[0],
        start: 'top 85%',
        onEnter: () => {
          stats.forEach((stat, index) => {
            gsap.to(
              { value: 0 },
              {
                value: stat.value,
                duration: 1.5,
                ease: 'expo.out',
                // eslint-disable-next-line react-hooks/unsupported-syntax
                onUpdate: function (this: { targets: () => Array<{ value: number }> }) {
                  setCounters((prev) => {
                    const newCounters = [...prev];
                    newCounters[index] = Math.round(this.targets()[0].value);
                    return newCounters;
                  });
                },
              }
            );
          });
        },
        once: true,
      });

      // Parallax on scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(imageRef.current, { y: progress * -60 });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
          {/* Image */}
          <div className="relative lg:h-[600px] overflow-hidden rounded-2xl lg:rounded-r-none order-2 lg:order-1">
            <div ref={imageRef} className="absolute inset-0">
              <img
                src="/images/sponsors-hero.jpg"
                alt="Women in business meeting"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div 
                className="absolute inset-0 lg:block hidden"
                style={{ background: 'linear-gradient(to left, oklch(0.35 0.15 340 / 0.5), transparent, transparent)' }}
              />
            </div>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="relative z-10 lg:pl-0 order-1 lg:order-2"
          >
            <div 
              className="rounded-2xl p-8 lg:p-12 lg:ml-[-10%] backdrop-blur-sm border border-white/10"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <p 
                className="font-sans text-sm uppercase tracking-[4px] mb-4"
                style={{ color: 'var(--accent)' }}
              >
                For Sponsors
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Be the leader who opens doors.
              </h2>

              <p className="font-sans text-lg text-white/80 mb-8 leading-relaxed">
                Join a network of executives and allies committed to active
                sponsorship. Access vetted talent, make meaningful connections,
                and drive real change in leadership diversity.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    ref={(el) => { statsRef.current[index] = el; }}
                    className="text-center"
                  >
                    <div 
                      className="font-serif text-3xl sm:text-4xl font-bold mb-1"
                      style={{ color: 'var(--accent)' }}
                    >
                      {counters[index]}
                      {stat.suffix}
                    </div>
                    <div className="font-sans text-sm text-white/70 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/for-sponsors"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'var(--primary-foreground)',
                  boxShadow: 'var(--shadow)'
                }}
              >
                Join as a Sponsor
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSponsorsSection;
