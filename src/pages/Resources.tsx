import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, FileText, CheckCircle, BookOpen, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/lib/data/blog';

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
    <section ref={sectionRef} style={{ backgroundColor: "hsl(var(--background))" }} className="pt-32 pb-24 lg:pb-32  min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p style={{ color: "hsl(var(--primary))" }} className="font-serif text-sm uppercase tracking-[4px]  mb-4">
            Resources & Blog
          </p>
          <h1 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-4xl sm:text-5xl font-bold  mb-6">
            Knowledge Hub
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans text-lg  max-w-2xl mx-auto">
            Downloadable guides, success stories, and thought leadership to help you 
            on your sponsorship journey.
          </p>
        </div>

        {/* Downloadable Resources */}
        <div className="mb-20">
          <h2 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-2xl font-bold  mb-8">
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
                <span style={{ color: "hsl(var(--foreground))" }} className="inline-block px-3 py-1 /5 rounded-full font-serif text-xs  mb-3">
                  {resource.type}
                </span>
                <h3 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-lg font-bold  mb-2 group-hover: transition-colors">
                  {resource.title}
                </h3>
                <p style={{ color: "hsl(var(--foreground))" }} className="font-sans text-sm /60 mb-4">
                  {resource.description}
                </p>
                <button style={{ color: "hsl(var(--foreground))" }} className="inline-flex items-center gap-2  font-serif text-sm font-semibold
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
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-2xl font-bold">
              Latest from the Blog
            </h2>
            <Button variant="outline" asChild>
              <Link to="/blog">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div ref={blogRef} className="grid md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-2xl p-6 shadow-brand border border-navy/5
                         transition-all duration-300 hover:-translate-y-2 hover:shadow-brand-lg
                         group cursor-pointer block"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ color: "hsl(var(--primary))" }} className="px-3 py-1 /10 rounded-full font-serif text-xs ">
                    {post.category}
                  </span>
                  <span style={{ color: "hsl(var(--foreground))" }} className="font-sans text-xs /40">
                    {post.date}
                  </span>
                </div>
                <h3 style={{ color: "hsl(var(--foreground))" }} className="font-serif text-lg font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p style={{ color: "hsl(var(--muted-foreground))" }} className="font-sans text-sm mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Read Article
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
