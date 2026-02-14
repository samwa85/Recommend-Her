import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Network, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    icon: Eye,
    title: 'Visibility',
    description: 'Get seen by leaders who actively advocate for your career growth.',
    color: 'bg-[hsl(var(--primary))]',
  },
  {
    icon: Network,
    title: 'Access',
    description: 'Tap into a curated network of intentional sponsors and allies.',
    color: 'bg-[hsl(var(--accent))]',
  },
  {
    icon: TrendingUp,
    title: 'Impact',
    description: 'Build a more equitable leadership pipeline for future generations.',
    color: 'bg-[hsl(346 50% 15%)]',
  },
];

const ValueProposition = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
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
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-14">
          <p 
            className="font-sans text-sm uppercase tracking-[4px] font-semibold mb-4"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Why Join
          </p>
          <h2 
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-5"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            The Power of Sponsorship
          </h2>
          <p 
            className="font-sans text-lg max-w-2xl mx-auto"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Not just mentorship—active advocacy that opens doors and creates lasting change.
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group relative p-8 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-default"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${value.color}`}>
                <value.icon size={28} className="text-white" />
              </div>

              {/* Content */}
              <h3 
                className="font-serif text-2xl font-bold mb-3"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {value.title}
              </h3>
              <p 
                className="font-sans text-base leading-relaxed"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
