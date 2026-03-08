// ============================================================================
// TESTIMONIALS SECTION - Fetches from database
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveTestimonials } from '@/lib/api/testimonials';
import type { ActiveTestimonial } from '@/lib/database.types';

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Database state
  const [testimonials, setTestimonials] = useState<ActiveTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const data = await getActiveTestimonials();
        setTestimonials(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // GSAP animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const animateTransition = useCallback((newIndex: number) => {
    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIndex(newIndex);
        setIsAnimating(false);
      },
    });

    tl.to(cardRef.current, {
      opacity: 0,
      x: -50,
      duration: 0.3,
      ease: 'power2.in',
    }).set(cardRef.current, { x: 50 }).to(cardRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, []);

  const goToNext = useCallback(() => {
    if (isAnimating || testimonials.length <= 1) return;
    setIsAnimating(true);
    const nextIndex = (activeIndex + 1) % testimonials.length;
    animateTransition(nextIndex);
  }, [activeIndex, isAnimating, animateTransition, testimonials.length]);

  const goToPrev = () => {
    if (isAnimating || testimonials.length <= 1) return;
    setIsAnimating(true);
    const prevIndex =
      (activeIndex - 1 + testimonials.length) % testimonials.length;
    animateTransition(prevIndex);
  };

  const goToIndex = (index: number) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    animateTransition(index);
  };

  // Auto-rotate
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isAnimating) {
        goToNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeIndex, isAnimating, goToNext, testimonials.length]);

  // Loading state
  if (isLoading) {
    return (
      <section 
        ref={sectionRef} 
        className="py-24 lg:py-32"
        style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-white/20 rounded mx-auto mb-4"></div>
            <div className="h-10 w-64 bg-white/20 rounded mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section 
        ref={sectionRef} 
        className="py-24 lg:py-32"
        style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/80">
          <p>Unable to load testimonials</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (testimonials.length === 0) {
    return null; // Hide section if no testimonials
  }

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section 
      ref={sectionRef} 
      className="py-24 lg:py-32"
      style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-12">
          <p 
            className="font-sans text-sm uppercase tracking-[4px] mb-4 font-semibold"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            Testimonials
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: '#ffffff' }}>
            What Our Community Says
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <div
            ref={cardRef}
            className="rounded-3xl p-8 sm:p-12 relative"
            style={{ 
              backgroundColor: 'var(--card)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Quote Icon */}
            <div 
              className="absolute -top-6 left-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Quote size={22} className="text-white" fill="currentColor" />
            </div>

            {/* Content */}
            <div className="pt-4">
              <p 
                className="font-sans text-lg sm:text-xl leading-relaxed mb-8 font-normal"
                style={{ color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.75' }}
              >
                "{currentTestimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={currentTestimonial.image_url || '/images/testimonial-1.jpg'}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4"
                  style={{ borderColor: 'var(--primary)' }}
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = '/images/testimonial-1.jpg';
                  }}
                />
                <div>
                  <h4 
                    className="font-sans text-base sm:text-lg font-semibold"
                    style={{ color: '#ffffff' }}
                  >
                    {currentTestimonial.name}
                  </h4>
                  <p 
                    className="font-sans text-sm sm:text-base font-normal"
                    style={{ color: 'rgba(255, 255, 255, 0.75)' }}
                  >
                    {currentTestimonial.title}
                    {currentTestimonial.company && ` at ${currentTestimonial.company}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={goToPrev}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center
                         text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8'
                        : 'w-3 bg-white/30 hover:bg-white/50'
                    }`}
                    style={{ backgroundColor: index === activeIndex ? 'var(--primary)' : undefined }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center
                         text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
