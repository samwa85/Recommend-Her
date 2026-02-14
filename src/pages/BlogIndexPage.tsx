// ============================================================================
// BLOG INDEX PAGE - List all blog posts from database with fallback to static
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, Calendar, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublishedBlogPosts, getBlogCategories } from '@/lib/queries';
import { blogPosts as staticBlogPosts, getAllCategories as getStaticCategories } from '@/lib/data/blog';
import type { BlogPost } from '@/lib/types/db';
import { toast } from 'sonner';

// Helper to convert static blog format to database format
function convertStaticToDbFormat(staticPosts: typeof staticBlogPosts): BlogPost[] {
  return staticPosts.map(post => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    featured_image: post.author?.image || null,
    video_url: null,
    author_name: post.author?.name || 'Recommend Her Team',
    author_title: post.author?.title || null,
    author_image: post.author?.image || null,
    category: post.category,
    tags: post.tags || [],
    read_time: post.readTime,
    status: 'published' as const,
    published_at: new Date(post.date).toISOString(),
    meta_title: null,
    meta_description: null,
    created_at: new Date(post.date).toISOString(),
    updated_at: new Date(post.date).toISOString(),
    created_by: null,
  }));
}

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BlogIndexPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    let useStaticData = false;
    
    try {
      const [postsResult, categoriesResult] = await Promise.all([
        getPublishedBlogPosts(selectedCategory ? { category: selectedCategory } : {}),
        getBlogCategories(),
      ]);
      
      if (postsResult.error) {
        console.warn('[Blog] Database fetch failed, using static fallback:', postsResult.error);
        useStaticData = true;
      } else if (!postsResult.data || postsResult.data.length === 0) {
        console.log('[Blog] No posts in database, using static fallback');
        useStaticData = true;
      }
      
      if (useStaticData) {
        // Use static data as fallback
        const staticPosts = convertStaticToDbFormat(staticBlogPosts);
        const filteredPosts = selectedCategory 
          ? staticPosts.filter(p => p.category === selectedCategory)
          : staticPosts;
        setPosts(selectedCategory ? filteredPosts : filteredPosts.slice(1));
        setFeaturedPost(selectedCategory ? null : filteredPosts[0] || null);
        setCategories(getStaticCategories());
      } else {
        const allPosts = postsResult.data || [];
        setPosts(selectedCategory ? allPosts : allPosts.slice(1));
        setFeaturedPost(selectedCategory ? null : allPosts[0] || null);
        setCategories(categoriesResult.length > 0 ? categoriesResult : getStaticCategories());
      }
    } catch (err) {
      console.error('[Blog] Error fetching posts, using static fallback:', err);
      // Fallback to static data on any error
      const staticPosts = convertStaticToDbFormat(staticBlogPosts);
      const filteredPosts = selectedCategory 
        ? staticPosts.filter(p => p.category === selectedCategory)
        : staticPosts;
      setPosts(selectedCategory ? filteredPosts : filteredPosts.slice(1));
      setFeaturedPost(selectedCategory ? null : filteredPosts[0] || null);
      setCategories(getStaticCategories());
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (isLoading) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );

      if (postsRef.current) {
        gsap.fromTo(
          postsRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: postsRef.current,
              start: 'top 80%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [isLoading, posts]);

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  return (
    <div style={{ backgroundColor: 'hsl(var(--background))' }} className="min-h-screen">
      {/* Header Section */}
      <section 
        className="pt-32 pb-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
      >
        <div ref={headerRef} className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
            <span>/</span>
            <span className="text-white">Blog</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Blog
          </h1>
          <p className="font-sans text-lg sm:text-xl text-white/80 max-w-2xl">
            Insights, success stories, and thought leadership to help you on your sponsorship journey.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Filter by:
          </span>
          <Button 
            variant={selectedCategory === '' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button 
              key={category} 
              variant={selectedCategory === category ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading articles...</p>
        </section>
      )}

      {/* Featured Post */}
      {!isLoading && featuredPost && !selectedCategory && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: 'hsl(var(--foreground))' }}>
              Featured Article
            </h2>
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group block relative rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
            >
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <Badge 
                    className="mb-4 w-fit"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                  >
                    {featuredPost.category}
                  </Badge>
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-pink-200 transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-white/80 mb-6 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-white/70 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        {featuredPost.author_name?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{featuredPost.author_name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredPost.published_at || featuredPost.created_at)}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.read_time}
                    </div>
                  </div>
                  <Button className="w-fit bg-white text-indigo-900 hover:bg-white/90 group-hover:translate-x-1 transition-transform">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="hidden lg:flex items-center justify-center p-12">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-pink-400/30 to-purple-500/30 flex items-center justify-center">
                    <span className="font-serif text-8xl text-white/20">&ldquo;</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* All Posts */}
      {!isLoading && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-8" style={{ color: 'hsl(var(--foreground))' }}>
              {selectedCategory || 'All Articles'}
            </h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No articles found in this category.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSelectedCategory('')}>
                  View All Articles
                </Button>
              </div>
            ) : (
              <div ref={postsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group flex flex-col rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))'
                    }}
                  >
                    <Link to={`/blog/${post.slug}`} className="flex flex-col flex-grow">
                      {/* Image Placeholder */}
                      <div 
                        className="h-48 flex items-center justify-center"
                        style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
                      >
                        {post.featured_image ? (
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-6xl text-white/20">&ldquo;</span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary">{post.category}</Badge>
                        </div>
                        
                        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
                          {post.title}
                        </h3>
                        
                        <p className="text-sm line-clamp-3 mb-4 flex-grow" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs pt-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                          <div className="flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.published_at || post.created_at)}
                          </div>
                          <div className="flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <Clock className="w-3 h-3" />
                            {post.read_time}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}>
            <Tag className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            Stay Updated
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Get the latest articles, success stories, and insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border"
              style={{ 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))'
              }}
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
