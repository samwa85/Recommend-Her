import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, FileText, CheckCircle, BookOpen, ArrowRight, Clock, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/lib/data/blog';

gsap.registerPlugin(ScrollTrigger);

const resources = [
  {
    icon: FileText,
    title: 'How to Optimize Your CV for Sponsorship',
    description: 'A comprehensive guide to crafting a CV that gets noticed by sponsors and opens doors to new opportunities.',
    type: 'PDF Guide',
    color: 'bg-rose-50',
    iconColor: 'text-rose-500',
    buttonColor: 'bg-rose-500 hover:bg-rose-600',
    downloadUrl: '/downloads/Recommend%20Her%20Sponsorship%20CV%20Optimization%20Guide.pdf',
    fileSize: '1.4 MB',
    pages: '12 pages',
  },
  {
    icon: BookOpen,
    title: "The Sponsor's Playbook",
    description: 'Learn the art of effective recommendation and become a powerful advocate for women in leadership.',
    type: 'PDF Guide',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    downloadUrl: "/downloads/THE%20SPONSOR'S%20PLAYBOOK.pdf",
    fileSize: '812 KB',
    pages: '8 pages',
  },
  {
    icon: CheckCircle,
    title: 'Preparing for Your Next Career Leap',
    description: 'Your step-by-step checklist to confidently prepare for and land your next leadership role.',
    type: 'PDF Guide',
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    downloadUrl: '/downloads/PREPARING%20FOR%20YOUR%20NEXT%20CAREER%20LEAP.pdf',
    fileSize: '1.4 MB',
    pages: '10 pages',
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
                         group flex flex-col"
              >
                {/* Icon & Type Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${resource.color} rounded-xl flex items-center justify-center
                                transition-transform duration-300 group-hover:scale-110`}>
                    <resource.icon size={28} className={resource.iconColor} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 
                                 rounded-full font-sans text-xs font-medium text-gray-600">
                    <FileDown size={12} />
                    {resource.type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-foreground mb-2 
                             group-hover:text-primary transition-colors line-clamp-2">
                  {resource.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                  {resource.description}
                </p>

                {/* File Info */}
                <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {resource.fileSize}
                  </span>
                  <span className="w-px h-3 bg-gray-300"></span>
                  <span>{resource.pages}</span>
                </div>

                {/* Download Button */}
                <a 
                  href={resource.downloadUrl}
                  download
                  className={`w-full inline-flex items-center justify-center gap-2 
                            px-4 py-3 rounded-xl font-serif text-sm font-semibold
                            text-white ${resource.buttonColor}
                            transition-all duration-300 
                            hover:shadow-lg hover:shadow-primary/25
                            active:scale-[0.98] group/btn`}
                >
                  <Download size={18} className="transition-transform duration-300 
                                                 group-hover/btn:translate-y-0.5" />
                  Download Free Guide
                </a>
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
