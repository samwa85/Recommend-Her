import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, FileText, CheckCircle, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const resources = [
  {
    icon: FileText,
    title: 'How to Optimize Your CV for Sponsorship',
    description: 'A comprehensive guide to crafting a CV that gets noticed by sponsors.',
    type: 'PDF Guide',
    color: 'bg-coral/10',
    iconColor: 'text-coral',
  },
  {
    icon: BookOpen,
    title: "The Sponsor's Playbook",
    description: 'A guide to effective recommendation and active sponsorship.',
    type: 'PDF Guide',
    color: 'bg-navy/10',
    iconColor: 'text-navy',
  },
  {
    icon: CheckCircle,
    title: 'Preparing for Your Next Career Leap',
    description: 'A checklist to help you prepare for your next leadership opportunity.',
    type: 'Checklist',
    color: 'bg-gold/20',
    iconColor: 'text-gold',
  },
];

const blogPosts = [
  {
    title: 'The Power of Sponsorship vs. Mentorship',
    excerpt: 'Understanding the difference and why sponsorship matters more for career advancement.',
    date: 'Jan 15, 2026',
    category: 'Leadership',
  },
  {
    title: 'Success Story: How Sarah Landed Her Dream Role',
    excerpt: 'A Recommend Her talent shares her journey from submission to promotion.',
    date: 'Jan 10, 2026',
    category: 'Success Stories',
  },
  {
    title: 'Building an Inclusive Leadership Pipeline',
    excerpt: 'How organizations can create pathways for diverse talent to reach the top.',
    date: 'Jan 5, 2026',
    category: 'Diversity & Inclusion',
  },
];

const Resources = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

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
        resourcesRef.current?.children || [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: resourcesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        blogRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: blogRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ backgroundColor: "var(--background)" }} className="pt-32 pb-24 lg:pb-32  min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p style={{ color: "var(--primary)" }} className="font-serif text-sm uppercase tracking-[4px]  mb-4">
            Resources & Blog
          </p>
          <h1 style={{ color: "var(--foreground)" }} className="font-serif text-4xl sm:text-5xl font-bold  mb-6">
            Knowledge Hub
          </h1>
          <p style={{ color: "var(--muted-foreground)" }} className="font-sans text-lg  max-w-2xl mx-auto">
            Downloadable guides, success stories, and thought leadership to help you 
            on your sponsorship journey.
          </p>
        </div>

        {/* Downloadable Resources */}
        <div className="mb-20">
          <h2 style={{ color: "var(--foreground)" }} className="font-serif text-2xl font-bold  mb-8">
            Downloadable Guides
          </h2>
          <div ref={resourcesRef} className="grid md:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.title}
                className="bg-white rounded-2xl p-6 shadow-brand border border-navy/5
                         transition-all duration-300 hover:-translate-y-2 hover:shadow-brand-lg
                         group cursor-pointer"
              >
                <div className={`w-14 h-14 ${resource.color} rounded-xl flex items-center justify-center mb-4`}>
                  <resource.icon size={28} className={resource.iconColor} />
                </div>
                <span style={{ color: "var(--foreground)" }} className="inline-block px-3 py-1 /5 rounded-full font-serif text-xs  mb-3">
                  {resource.type}
                </span>
                <h3 style={{ color: "var(--foreground)" }} className="font-serif text-lg font-bold  mb-2 group-hover: transition-colors">
                  {resource.title}
                </h3>
                <p style={{ color: "var(--foreground)" }} className="font-sans text-sm /60 mb-4">
                  {resource.description}
                </p>
                <button style={{ color: "var(--foreground)" }} className="inline-flex items-center gap-2  font-serif text-sm font-semibold
                                 group-hover: transition-colors">
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div>
          <h2 style={{ color: "var(--foreground)" }} className="font-serif text-2xl font-bold  mb-8">
            Latest from the Blog
          </h2>
          <div ref={blogRef} className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.title}
                className="bg-white rounded-2xl p-6 shadow-brand border border-navy/5
                         transition-all duration-300 hover:-translate-y-2 hover:shadow-brand-lg
                         group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ color: "var(--primary)" }} className="px-3 py-1 /10 rounded-full font-serif text-xs ">
                    {post.category}
                  </span>
                  <span style={{ color: "var(--foreground)" }} className="font-sans text-xs /40">
                    {post.date}
                  </span>
                </div>
                <h3 style={{ color: "var(--foreground)" }} className="font-serif text-lg font-bold  mb-3 group-hover: transition-colors">
                  {post.title}
                </h3>
                <p style={{ color: "var(--foreground)" }} className="font-sans text-sm /60">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
