import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: 'Dr. Monique Thompson',
    title: 'VP Engineering at TechCorp',
    image: '/images/testimonial-1.jpg',
    quote:
      "Recommend Her connected me with a sponsor who actively advocated for my promotion. Six months later, I landed my dream role. This platform truly changes lives.",
  },
  {
    id: 2,
    name: 'Zahra Ibrahim',
    title: 'Director of Operations',
    image: '/images/testimonial-2.jpg',
    quote:
      "As a sponsor, I've found exceptional talent through this network. It's not just recruiting—it's building the future of leadership and creating lasting impact.",
  },
  {
    id: 3,
    name: 'Patricia Daniels',
    title: 'CFO at Global Finance',
    image: '/images/testimonial-3.jpg',
    quote:
      "The quality of candidates in this pool is outstanding. Every introduction has led to meaningful conversations and successful placements. Highly recommended.",
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        goToNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeIndex, isAnimating]);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const nextIndex = (activeIndex + 1) % testimonials.length;
    animateTransition(nextIndex);
  };

  const goToPrev = () => {
    if (isAnimating) return;
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

  const animateTransition = (newIndex: number) => {
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
  };

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
            className="font-sans text-sm uppercase tracking-[4px] mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Testimonials
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
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
              className="absolute -top-6 left-8 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Quote size={24} className="text-white" />
            </div>

            {/* Content */}
            <div className="pt-4">
              <p 
                className="font-serif text-xl sm:text-2xl leading-relaxed mb-8"
                style={{ color: 'var(--foreground)', lineHeight: '1.7' }}
              >
                "{currentTestimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4"
                  style={{ borderColor: 'var(--primary)' }}
                />
                <div>
                  <h4 
                    className="font-serif text-lg sm:text-xl font-bold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {currentTestimonial.name}
                  </h4>
                  <p 
                    className="font-sans text-base"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {currentTestimonial.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
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
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
