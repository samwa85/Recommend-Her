import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([taglineRef.current, headlineRef.current, subheadlineRef.current, ctaRef.current], {
        opacity: 0,
        y: 30,
      });
      gsap.set(bgImageRef.current, {
        opacity: 0,
        scale: 1.1,
      });

      const tl = gsap.timeline({ delay: 0.2 });

      tl.to(bgImageRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power2.out',
      })
        .to(taglineRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=1')
        .to(headlineRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.4')
        .to(subheadlineRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.3')
        .to(ctaRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.2');

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(headlineRef.current, { y: progress * -50 });
          gsap.set(subheadlineRef.current, { y: progress * -80 });
          gsap.set(bgImageRef.current, { y: progress * 30, scale: 1 + progress * 0.1 });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        ref={bgImageRef}
        className="absolute inset-0 z-0"
      >
        <img
          src="/images/hero-woman-hijab.jpg"
          alt="Professional woman in hijab networking"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        {/* Dark overlay for text readability */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, oklch(0.18 0.08 340 / 0.85) 0%, oklch(0.18 0.08 340 / 0.65) 50%, oklch(0.35 0.15 340 / 0.75) 100%)'
          }}
        />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--background)] to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float opacity-20"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full blur-2xl animate-float-slow opacity-15"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-3xl">
          {/* Tagline */}
          <p
            ref={taglineRef}
            className="font-sans text-sm uppercase tracking-[4px] font-semibold mb-6"
            style={{ color: 'var(--accent)' }}
          >
            #RecommendHerMovement
          </p>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-8"
          >
            When women{' '}
            <span style={{ color: 'var(--accent)' }}>recommend women,</span>{' '}
            incredible things happen.
          </h1>

          {/* Subheadline */}
          <p
            ref={subheadlineRef}
            className="font-sans text-lg sm:text-xl lg:text-2xl text-white/90 max-w-2xl leading-relaxed mb-10"
          >
            Join a movement of leaders actively sponsoring talented women into
            leadership. Together, we're building a more equitable future.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <Link
              to="/for-talent"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-semibold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)',
                boxShadow: '0 4px 14px oklch(0.55 0.20 20 / 0.4)'
              }}
            >
              Submit Your CV
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/for-sponsors"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-semibold text-lg transition-all duration-300 border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 backdrop-blur-sm"
            >
              Become a Sponsor
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">500+</p>
              <p className="font-sans text-sm text-white/70">Talents in Network</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">150+</p>
              <p className="font-sans text-sm text-white/70">Active Sponsors</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">200+</p>
              <p className="font-sans text-sm text-white/70">Successful Matches</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
