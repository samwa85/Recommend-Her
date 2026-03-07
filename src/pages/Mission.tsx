import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: '27%', label: 'Women in C-Suite', description: 'Despite being 50% of workforce' },
  { number: '1 in 5', label: 'Fortune 500 CEOs', description: 'Are women in 2024' },
  { number: '85%', label: 'Jobs Filled', description: 'Through networking & referrals' },
];

const Mission = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        statsRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="pt-32 pb-24 lg:pb-32 min-h-screen"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p 
            className="font-sans text-sm uppercase tracking-[4px] mb-4"
            style={{ color: 'hsl(var(--primary))' }}
          >
            About Us
          </p>
          <h1 
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            The Mission
          </h1>
          <p 
            className="font-sans text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Creating tangible gender equity in corporate leadership through intentional sponsorship.
          </p>
        </div>

        {/* Founder's Story */}
        <div 
          ref={contentRef} 
          className="rounded-2xl p-8 lg:p-12 mb-16"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <div 
                className="rounded-2xl overflow-hidden p-4"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
              >
                <img 
                  src="https://aku8v88g.us-east.insforge.app/api/storage/buckets/profile-images/objects/founders%2Fwahida.jpeg"
                  alt="Wahda Mbaraka - Founder"
                  className="w-full h-auto rounded-xl"
                />
              </div>
              <div className="text-center mt-4">
                <p 
                  className="font-serif font-semibold text-lg"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  Wahida Mbaraka
                </p>
                <p 
                  className="font-sans text-base"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Founder
                </p>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 
                className="font-serif text-2xl sm:text-3xl font-bold mb-4"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                A Letter from Wahda Mbaraka, Founder of Recommend Her
              </h2>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <strong>For 15 years, I sat at tables where too few women were seated.</strong>
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                I watched brilliant women perfect their CVs in silence while others—less qualified but more bold—stepped forward to claim opportunities. I witnessed the "quiet problem" firsthand: talented women waiting to be invited, while doors opened for those who simply raised their hands.
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Then one day, a question stopped me cold:
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4 italic"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                "Do you know someone great for this role?"
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                My mind raced. I knew exceptional women. I had mentored them, coached them, watched them shine. But their names didn't come instantly because their CVs weren't in my hand. Their readiness wasn't visible. Their courage hadn't been activated.
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                That moment changed everything.
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                I realized that opportunity doesn't flow through merit alone. It flows through networks. Through recommendations. Through someone speaking your name in a room you aren't in.
              </p>
              <p 
                className="font-sans text-base leading-relaxed mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                So I asked myself: <em>What if we built a new kind of network? One built on intentional sponsorship. One where women don't have to wait to be seen—because we actively choose to see them.</em>
              </p>
              <p 
                className="font-sans text-base leading-relaxed font-semibold"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                And so, Recommend Her was born.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <h2 
            className="font-serif text-2xl sm:text-3xl font-bold text-center mb-8"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Why This Matters
          </h2>
          <div ref={statsRef} className="grid md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  backgroundColor: 'hsl(var(--card))',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <p 
                  className="font-serif text-4xl font-bold mb-2"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  {stat.number}
                </p>
                <p 
                  className="font-serif font-semibold text-lg mb-1"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {stat.label}
                </p>
                <p 
                  className="font-sans text-base"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div 
          className="rounded-2xl p-8 lg:p-12 text-center"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          <h2 
            className="font-serif text-xl sm:text-2xl font-bold mb-6"
            style={{ color: 'hsl(var(--accent))' }}
          >
            Our Mission Statement
          </h2>
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            "To activate intentional sponsorship networks that create tangible 
            gender equity in corporate leadership."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Mission;
