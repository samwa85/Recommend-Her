import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  'Access to senior leaders',
  'No cost to join',
  'Confidential and secure',
];

const ForTalentSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image parallax
      gsap.fromTo(
        imageRef.current,
        { scale: 1.1, y: 50 },
        {
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content box slide in
      gsap.fromTo(
        contentBoxRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Parallax on scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(imageRef.current, { y: progress * -80 });
          gsap.set(contentBoxRef.current, { y: progress * -40 });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
          {/* Content */}
          <div ref={contentRef} className="relative z-10 lg:pr-0">
            <div
              ref={contentBoxRef}
              className="rounded-2xl p-8 lg:p-12 lg:mr-[-10%]"
              style={{ 
                backgroundColor: 'var(--card)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <p 
                className="font-sans text-sm uppercase tracking-[4px] mb-4"
                style={{ color: 'var(--primary)' }}
              >
                For Talent
              </p>

              <h2 
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                style={{ color: 'var(--foreground)' }}
              >
                Ready to be recommended?
              </h2>

              <p 
                className="font-sans text-lg mb-8 leading-relaxed"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Submit your profile to our vetted talent pool. When sponsors are
                looking for candidates, you'll be on their radar. Your next
                opportunity could be one recommendation away.
              </p>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 font-sans text-base"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Check size={14} className="text-white" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/for-talent"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'var(--primary-foreground)',
                  boxShadow: 'var(--shadow)'
                }}
              >
                Submit Your Profile
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative lg:h-[600px] overflow-hidden rounded-2xl lg:rounded-l-none">
            <div ref={imageRef} className="absolute inset-0">
              <img
                src="/images/talent-hero.jpg"
                alt="Professional woman working"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div 
                className="absolute inset-0 lg:block hidden"
                style={{ background: 'linear-gradient(to right, var(--background)/50, transparent, transparent)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForTalentSection;
