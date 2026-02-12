import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline word-by-word reveal
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.fromTo(
          words,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Subheadline
      gsap.fromTo(
        subheadlineRef.current,
        { opacity: 0, filter: 'blur(10px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: subheadlineRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // CTA buttons
      gsap.fromTo(
        ctaRef.current?.children || [],
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const headlineWords = ['Ready', 'to', 'change', 'the', 'face', 'of', 'leadership?'];

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full blur-2xl animate-float"
          style={{ backgroundColor: 'var(--primary)', opacity: 0.2 }}
        />
        <div 
          className="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl animate-float-slow"
          style={{ backgroundColor: 'var(--accent)', opacity: 0.15 }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6"
        >
          {headlineWords.map((word, index) => (
            <span key={index} className="word inline-block mr-3">
              {word}
            </span>
          ))}
        </h2>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="font-sans text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Whether you're seeking sponsorship or ready to sponsor others, your
          journey starts here. Join the movement today.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
          <Link
            to="/for-talent"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold transition-all duration-300 hover:-translate-y-1 animate-pulse-glow"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'var(--primary-foreground)',
              boxShadow: 'var(--shadow)'
            }}
          >
            Submit Your CV
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/for-sponsors"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold transition-all duration-300 border-2"
            style={{ 
              borderColor: 'var(--accent)', 
              color: 'white'
            }}
          >
            Become a Sponsor
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

export default CTASection;
