// ============================================================================
// BLOG EDITOR - Rich text editor for blog posts with image upload
// ============================================================================

import { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Video,
  Eye,
  Save,
  Loader2,
  Upload,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { uploadBlogImage, calculateReadTime, generateSlug } from '@/lib/queries/blog';
import type { BlogPost, BlogPostInput } from '@/lib/types/db';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: (data: BlogPostInput & { id?: string }) => Promise<void>;
  onCancel: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const isEditing = !!post;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState<Partial<BlogPostInput>>({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featured_image: post?.featured_image || '',
    video_url: post?.video_url || '',
    author_name: post?.author_name || 'Recommend Her Team',
    author_title: post?.author_title || '',
    author_image: post?.author_image || '',
    category: post?.category || 'General',
    tags: post?.tags || [],
    read_time: post?.read_time || '',
    status: post?.status || 'draft',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const updateField = (field: keyof BlogPostInput, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && !isEditing) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value as string) }));
    }
    
    // Auto-calculate read time from content
    if (field === 'content') {
      setFormData(prev => ({ ...prev, read_time: calculateReadTime(value as string) }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const { url, error } = await uploadBlogImage(file);
      
      if (error) throw error;
      if (url) {
        updateField('featured_image', url);
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error('Failed to upload image');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || '';
    const selected = text.substring(start, end);
    
    const newContent = text.substring(0, start) + before + selected + after + text.substring(end);
    updateField('content', newContent);
    
    // Restore focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave: BlogPostInput & { id?: string } = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
        content: formData.content,
        featured_image: formData.featured_image || null,
        video_url: formData.video_url || null,
        author_name: formData.author_name || 'Recommend Her Team',
        author_title: formData.author_title || null,
        author_image: formData.author_image || null,
        category: formData.category || 'General',
        tags: formData.tags || [],
        read_time: formData.read_time || calculateReadTime(formData.content),
        status: publish ? 'published' : (formData.status as 'draft' | 'published' | 'archived') || 'draft',
        meta_title: formData.meta_title || formData.title || null,
        meta_description: formData.meta_description || formData.excerpt?.substring(0, 160) || null,
      };

      if (post?.id) {
        dataToSave.id = post.id;
      }

      await onSave(dataToSave);
      toast.success(publish ? 'Post published!' : 'Draft saved!');
    } catch (err) {
      toast.error('Failed to save post');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**')}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('*', '*')}>
            <Italic className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('# ')}>
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('## ')}>
            <Heading2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('- ')}>
            <List className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('1. ')}>
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('> ')}>
            <Quote className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown('[', '](url)')}>
            <Link className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Main Form */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter post title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              placeholder="url-friendly-slug"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary of the post..."
              value={formData.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            {showPreview ? (
              <div className="min-h-[400px] p-4 border rounded-lg prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: (formData.content || '').replace(/\n/g, '<br/>') 
                }} />
              </div>
            ) : (
              <Textarea
                id="content"
                placeholder="Write your post content in Markdown..."
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
            )}
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-4">
          {/* Status */}
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Status</h4>
            <Select
              value={formData.status}
              onValueChange={(v) => updateField('status', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Draft
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Publish
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Featured Image</h4>
            
            {formData.featured_image ? (
              <div className="relative">
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => updateField('featured_image', '')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                  </>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Video URL */}
          <div className="p-4 border rounded-lg space-y-2">
            <Label htmlFor="video_url" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video URL
            </Label>
            <Input
              id="video_url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.video_url || ''}
              onChange={(e) => updateField('video_url', e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="p-4 border rounded-lg space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => updateField('category', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Success Stories">Success Stories</SelectItem>
                <SelectItem value="Diversity & Inclusion">Diversity & Inclusion</SelectItem>
                <SelectItem value="Career Growth">Career Growth</SelectItem>
                <SelectItem value="News">News</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="p-4 border rounded-lg space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Author</h4>
            <div className="space-y-2">
              <Label htmlFor="author_name">Name</Label>
              <Input
                id="author_name"
                value={formData.author_name}
                onChange={(e) => updateField('author_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author_title">Title</Label>
              <Input
                id="author_title"
                value={formData.author_title || ''}
                onChange={(e) => updateField('author_title', e.target.value)}
              />
            </div>
          </div>

          {/* SEO */}
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">SEO</h4>
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title || ''}
                onChange={(e) => updateField('meta_title', e.target.value)}
                placeholder={formData.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description || ''}
                onChange={(e) => updateField('meta_description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
          {isEditing ? 'Update & Publish' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
