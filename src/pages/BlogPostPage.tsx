// ============================================================================
// BLOG POST PAGE - Individual blog post with full content (with static fallback)
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Twitter, Linkedin, Facebook, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/queries';
import { blogPosts as staticBlogPosts, getBlogPostBySlug as getStaticPostBySlug } from '@/lib/data/blog';
import type { BlogPost } from '@/lib/types/db';
import { marked } from 'marked';

// Helper to convert static blog format to database format
function convertStaticToDbFormat(staticPost: typeof staticBlogPosts[0]): BlogPost {
  return {
    id: staticPost.slug,
    slug: staticPost.slug,
    title: staticPost.title,
    excerpt: staticPost.excerpt,
    content: staticPost.content,
    featured_image: staticPost.author?.image || null,
    video_url: null,
    author_name: staticPost.author?.name || 'Recommend Her Team',
    author_title: staticPost.author?.title || null,
    author_image: staticPost.author?.image || null,
    category: staticPost.category,
    tags: staticPost.tags || [],
    read_time: staticPost.readTime,
    status: 'published' as const,
    published_at: new Date(staticPost.date).toISOString(),
    meta_title: null,
    meta_description: null,
    created_at: new Date(staticPost.date).toISOString(),
    updated_at: new Date(staticPost.date).toISOString(),
    created_by: null,
  };
}

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    
    setIsLoading(true);
    let useStaticData = false;
    
    try {
      const [postResult, postsResult] = await Promise.all([
        getBlogPostBySlug(slug),
        getPublishedBlogPosts({ limit: 10 }),
      ]);
      
      if (postResult.error) {
        console.warn('[Blog] Database fetch failed, using static fallback:', postResult.error);
        useStaticData = true;
      } else if (!postResult.data) {
        console.log('[Blog] Post not found in database, checking static fallback');
        useStaticData = true;
      }
      
      if (useStaticData) {
        // Use static data as fallback
        const staticPost = getStaticPostBySlug(slug);
        if (!staticPost) {
          setPost(null);
          setRelatedPosts([]);
          return;
        }
        
        const dbPost = convertStaticToDbFormat(staticPost);
        setPost(dbPost);
        
        // Get related posts from static data
        const related = staticBlogPosts
          .filter(p => p.category === staticPost.category && p.slug !== slug)
          .slice(0, 2)
          .map(convertStaticToDbFormat);
        setRelatedPosts(related);
      } else {
        setPost(postResult.data);
        
        // Get related posts from database or fallback to static
        let related = postsResult.data
          ?.filter(p => p.category === postResult.data?.category && p.slug !== slug)
          .slice(0, 2) || [];
        
        // If no related posts from DB, try static
        if (related.length === 0) {
          const staticPost = getStaticPostBySlug(slug);
          if (staticPost) {
            related = staticBlogPosts
              .filter(p => p.category === staticPost.category && p.slug !== slug)
              .slice(0, 2)
              .map(convertStaticToDbFormat);
          }
        }
        setRelatedPosts(related);
      }
    } catch (err) {
      console.error('[Blog] Error fetching post, using static fallback:', err);
      // Fallback to static data on any error
      const staticPost = getStaticPostBySlug(slug);
      if (staticPost) {
        const dbPost = convertStaticToDbFormat(staticPost);
        setPost(dbPost);
        
        const related = staticBlogPosts
          .filter(p => p.category === staticPost.category && p.slug !== slug)
          .slice(0, 2)
          .map(convertStaticToDbFormat);
        setRelatedPosts(related);
      } else {
        setPost(null);
        setRelatedPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (!post || isLoading) return;

    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.2,
          ease: 'power2.out',
        }
      );
    });

    return () => ctx.revert();
  }, [post, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  // Handle not found
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="text-center px-4">
          <h1 className="font-serif text-4xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            Article Not Found
          </h1>
          <p className="font-sans text-lg mb-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
            The blog post you're looking for doesn't exist.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/resources">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resources
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/blog">View All Articles</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Convert markdown content to HTML
  const contentHtml = marked.parse(post.content, { async: false }) as string;

  return (
    <div style={{ backgroundColor: 'hsl(var(--background))' }} className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b" style={{ 
        backgroundColor: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(10px)',
        borderColor: 'hsl(var(--border))'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/blog')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Link to="/resources" className="font-serif text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>
              Recommend Her
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header 
        ref={headerRef}
        className="pt-12 pb-8 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link to="/resources" className="text-white/70 hover:text-white transition-colors">
              Resources
            </Link>
            <ChevronRight className="w-4 h-4 text-white/50" />
            <Link to="/blog" className="text-white/70 hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-white/50" />
            <span className="text-white/50 truncate">{post.title}</span>
          </div>

          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {post.category}
          </Badge>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.published_at 
                ? new Date(post.published_at).toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                  })
                : new Date(post.created_at).toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                  })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.read_time}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {post.author_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <span>{post.author_name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div 
            ref={contentRef}
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
            style={{
              color: 'hsl(var(--foreground))',
            }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
              <span className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Share Section */}
          <div className="mt-8 pt-8 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="text-sm font-medium mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Share this article
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {post.author_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  {post.author_name}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {post.author_title}
                </p>
                <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                  Expert contributor sharing insights on leadership, career growth, and building inclusive workplaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-8" style={{ color: 'hsl(var(--foreground))' }}>
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  to={`/blog/${relatedPost.slug}`}
                  className="group block p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                  }}
                >
                  <Badge variant="secondary" className="mb-3">
                    {relatedPost.category}
                  </Badge>
                  <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    <Calendar className="w-3 h-3" />
                    {relatedPost.published_at 
                      ? new Date(relatedPost.published_at).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })
                      : new Date(relatedPost.created_at).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    {relatedPost.read_time}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'oklch(0.35 0.15 340)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Advance Your Career?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of professionals who are accelerating their careers through the power of sponsorship.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-indigo-900 hover:bg-white/90">
              <Link to="/for-talent">Submit Your Profile</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/for-sponsors">Become a Sponsor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Custom Styles for Blog Content */}
      <style>{`
        .blog-content {
          font-family: var(--font-sans);
          line-height: 1.8;
        }
        .blog-content h1 {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          margin-top: 2rem;
          color: hsl(var(--foreground));
        }
        .blog-content h2 {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 2.5rem;
          color: hsl(var(--foreground));
        }
        .blog-content h3 {
          font-family: var(--font-serif);
          font-size: 1.375rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 2rem;
          color: hsl(var(--foreground));
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          color: hsl(var(--foreground));
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }
        .blog-content ul li {
          list-style-type: disc;
        }
        .blog-content ol li {
          list-style-type: decimal;
        }
        .blog-content strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .blog-content em {
          font-style: italic;
        }
        .blog-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .blog-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-content a:hover {
          color: hsl(var(--primary) / 0.8);
        }
        .blog-content hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 2rem 0;
        }
        .blog-content code {
          background-color: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        .blog-content pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }
        .blog-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
