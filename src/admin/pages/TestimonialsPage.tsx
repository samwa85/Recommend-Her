// ============================================================================
// ADMIN TESTIMONIALS PAGE - Manage homepage testimonials
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Upload,
  X,
  AlertCircle,
  Loader2,
  ImageIcon,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Testimonial, TestimonialInput } from '@/lib/database.types';
import {
  getAllTestimonials,
  upsertTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
  setTestimonialFeatured,
  uploadTestimonialImage,
  deleteTestimonialImage,
  reorderTestimonials,
} from '@/lib/api/testimonials';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TestimonialInput>({
    name: '',
    title: '',
    company: '',
    quote: '',
    is_active: true,
    display_order: 0,
    featured: false,
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    setSetupError(null);
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      if (error?.message?.includes('relation') || error?.code === '42P01') {
        setSetupError('Database table not found. Please run the migration.');
      } else if (error?.message?.includes('permission') || error?.code === '42501') {
        setSetupError('Permission denied. Check your database permissions.');
      } else {
        setSetupError(error?.message || 'Failed to load testimonials');
      }
      toast.error('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddNew = () => {
    setSelectedTestimonial(null);
    setFormData({
      name: '',
      title: '',
      company: '',
      quote: '',
      is_active: true,
      display_order: testimonials.length,
      featured: false,
    });
    setUploadedImage(null);
    setImagePreview(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      title: testimonial.title,
      company: testimonial.company || '',
      quote: testimonial.quote,
      is_active: testimonial.is_active,
      display_order: testimonial.display_order,
      featured: testimonial.featured,
    });
    setUploadedImage(null);
    setImagePreview(testimonial.image_url);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTestimonial) return;
    
    try {
      // Delete image if exists
      if (selectedTestimonial.image_path) {
        await deleteTestimonialImage(selectedTestimonial.image_path);
      }
      
      // Delete testimonial
      await deleteTestimonial(selectedTestimonial.id);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imagePath = selectedTestimonial?.image_path;
      let imageUrl = selectedTestimonial?.image_url;

      // Upload new image if selected
      if (uploadedImage) {
        console.log('📤 [Form] Uploading image...');
        const uploadResult = await uploadTestimonialImage(
          uploadedImage,
          selectedTestimonial?.id
        );
        imagePath = uploadResult.path;
        imageUrl = uploadResult.publicUrl;
        console.log('✅ [Form] Image uploaded:', imageUrl);
      }

      // Prepare input
      const input: TestimonialInput = {
        ...formData,
        image_path: imagePath || undefined,
        image_url: imageUrl || undefined,
      };

      console.log('📝 [Form] Saving testimonial:', input);
      
      // Save testimonial
      await upsertTestimonial(input, selectedTestimonial?.id);
      
      toast.success(
        selectedTestimonial 
          ? 'Testimonial updated successfully' 
          : 'Testimonial created successfully'
      );
      
      setIsEditDialogOpen(false);
      fetchTestimonials();
    } catch (error: any) {
      console.error('❌ [Form] Error saving testimonial:', error);
      const errorMessage = error?.message || 'Unknown error';
      toast.error(`Failed to save: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await toggleTestimonialStatus(testimonial.id, !testimonial.is_active);
      toast.success(
        testimonial.is_active 
          ? 'Testimonial hidden' 
          : 'Testimonial is now visible'
      );
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      await setTestimonialFeatured(testimonial.id, !testimonial.featured);
      toast.success(
        testimonial.featured 
          ? 'Removed from featured' 
          : 'Marked as featured'
      );
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_path: undefined, image_url: undefined }));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const activeCount = testimonials.filter(t => t.is_active).length;

  return (
    <AdminLayout
      title="Testimonials"
      subtitle={`Manage homepage testimonials (${activeCount} active)`}
      isLoading={isLoading}
      onRefresh={fetchTestimonials}
      lastUpdated={lastUpdated}
      actions={
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Testimonial
        </Button>
      }
    >
      {/* Setup Error */}
      {setupError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <Database className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Database Setup Required</h3>
              <p className="text-amber-800 mt-1">{setupError}</p>
              <div className="bg-white rounded p-4 mt-3 text-sm text-gray-700">
                <p className="font-semibold mb-2">Quick Fix - Run this SQL in InsForge:</p>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs">
{`CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, title TEXT NOT NULL, company TEXT,
  quote TEXT NOT NULL, image_path TEXT, image_url TEXT,
  is_active BOOLEAN DEFAULT true, display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON public.testimonials 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.testimonials TO authenticated;`}
                </pre>
                <p className="mt-2 text-xs text-gray-500">
                  Or run the full migration: <code className="bg-gray-100 px-1 rounded">migrations/016_testimonials_fix.sql</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={testimonials.length} />
        <StatCard label="Active" value={activeCount} color="green" />
        <StatCard label="Inactive" value={testimonials.length - activeCount} color="gray" />
        <StatCard label="Featured" value={testimonials.filter(t => t.featured).length} color="yellow" />
      </div>

      {/* Testimonials List */}
      {testimonials.length === 0 && !setupError ? (
        <EmptyState onAdd={handleAddNew} />
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {selectedTestimonial 
                ? 'Update the testimonial details below.' 
                : 'Create a new testimonial to display on the homepage.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              {imagePreview ? (
                <div className="relative w-32 h-32">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragging 
                      ? 'border-rose-500 bg-rose-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-rose-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., VP of Engineering"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g., Acme Corp"
              />
            </div>

            {/* Quote */}
            <div className="space-y-2">
              <Label htmlFor="quote">Testimonial Quote *</Label>
              <Textarea
                id="quote"
                value={formData.quote}
                onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                placeholder="Enter the testimonial text..."
                rows={4}
                required
              />
            </div>

            {/* Settings */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Visible on homepage
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, featured: checked }))
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured testimonial
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedTestimonial ? 'Update Testimonial' : 'Create Testimonial'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the testimonial from 
              <strong> {selectedTestimonial?.name}</strong>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  color?: 'default' | 'green' | 'gray' | 'yellow';
}

function StatCard({ label, value, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'bg-white',
    green: 'bg-green-50 border-green-200',
    gray: 'bg-gray-50 border-gray-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
  onToggleActive: (testimonial: Testimonial) => void;
  onToggleFeatured: (testimonial: Testimonial) => void;
}

function TestimonialCard({
  testimonial,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: TestimonialCardProps) {
  return (
    <div 
      className={`
        bg-white rounded-lg border p-4 transition-shadow hover:shadow-md
        ${!testimonial.is_active ? 'opacity-60' : ''}
      `}
    >
      <div className="flex gap-4">
        {/* Drag Handle */}
        <div className="flex items-center">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
        </div>

        {/* Image */}
        <div className="flex-shrink-0">
          {testimonial.image_url ? (
            <img
              src={testimonial.image_url}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-400">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{testimonial.name}</h3>
                {testimonial.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {!testimonial.is_active && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    Hidden
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {testimonial.title}
                {testimonial.company && ` at ${testimonial.company}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleActive(testimonial)}
                title={testimonial.is_active ? 'Hide' : 'Show'}
              >
                {testimonial.is_active ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFeatured(testimonial)}
                title={testimonial.featured ? 'Unfeature' : 'Feature'}
                className={testimonial.featured ? 'text-yellow-500' : ''}
              >
                <Star className={`w-4 h-4 ${testimonial.featured ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(testimonial)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(testimonial)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm mt-2 text-gray-700 line-clamp-2">
            "{testimonial.quote}"
          </p>
          
          <p className="text-xs text-muted-foreground mt-2">
            Order: {testimonial.display_order} • 
            Created: {new Date(testimonial.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onAdd: () => void;
}

function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
      <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No testimonials yet</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        Add testimonials to showcase on your homepage. They help build trust with visitors.
      </p>
      <Button onClick={onAdd} className="mt-4 gap-2">
        <Plus className="w-4 h-4" />
        Add First Testimonial
      </Button>
    </div>
  );
}
