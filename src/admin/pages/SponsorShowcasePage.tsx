// ============================================================================
// SPONSOR SHOWCASE ADMIN PAGE - Manage sponsors displayed on /for-sponsors
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star,
  Linkedin,
  Image as ImageIcon,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import {
  listSponsorShowcase,
  createSponsorShowcase,
  updateSponsorShowcase,
  deleteSponsorShowcase,
  reorderSponsorShowcase,
  toggleSponsorShowcaseActive,
  toggleSponsorShowcaseFeatured,
  getSponsorShowcaseStats,
} from '@/lib/queries/sponsorShowcase';
import { uploadFile } from '@/lib/queries/storage';
import type { SponsorShowcase } from '@/lib/types/db';

export default function SponsorShowcasePage() {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState<SponsorShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, featured: 0 });
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorShowcase | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    bio: '',
    linkedin_url: '',
    image: null as File | null,
    is_active: true,
    featured: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load sponsors
  const loadSponsors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listSponsorShowcase();
    if (error) {
      toast.error('Failed to load sponsors');
    } else {
      setSponsors(data);
    }
    
    // Load stats
    const { total, active, inactive, featured, error: statsError } = await getSponsorShowcaseStats();
    if (!statsError) {
      setStats({ total, active, inactive, featured });
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSponsors();
  }, [loadSponsors]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      company: '',
      bio: '',
      linkedin_url: '',
      image: null,
      is_active: true,
      featured: false,
    });
    setImagePreview(null);
    setSelectedSponsor(null);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle add
  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.title.trim() || !formData.bio.trim()) {
      toast.error('Name, title, and bio are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let image_url = '';
      let image_path = '';
      
      // Upload image if provided
      if (formData.image) {
        const path = `sponsors/${Date.now()}_${formData.image.name}`;
        const { data: uploadData, error: uploadError } = await uploadFile(
          'sponsor-images',
          path,
          formData.image
        );
        if (uploadError) throw uploadError;
        image_url = uploadData?.publicUrl || '';
        image_path = path;
      }

      const { error } = await createSponsorShowcase({
        name: formData.name.trim(),
        title: formData.title.trim(),
        company: formData.company.trim() || null,
        bio: formData.bio.trim(),
        linkedin_url: formData.linkedin_url.trim() || null,
        image_path,
        image_url,
        is_active: formData.is_active,
        featured: formData.featured,
        display_order: sponsors.length,
      });

      if (error) throw error;
      
      toast.success('Sponsor added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      loadSponsors();
    } catch (error) {
      console.error('Error adding sponsor:', error);
      toast.error('Failed to add sponsor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedSponsor) return;
    if (!formData.name.trim() || !formData.title.trim() || !formData.bio.trim()) {
      toast.error('Name, title, and bio are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let image_url = selectedSponsor.image_url;
      let image_path = selectedSponsor.image_path;
      
      // Upload new image if provided
      if (formData.image) {
        const path = `sponsors/${Date.now()}_${formData.image.name}`;
        const { data: uploadData, error: uploadError } = await uploadFile(
          'sponsor-images',
          path,
          formData.image
        );
        if (uploadError) throw uploadError;
        image_url = uploadData?.publicUrl || '';
        image_path = path;
      }

      const { error } = await updateSponsorShowcase(selectedSponsor.id, {
        name: formData.name.trim(),
        title: formData.title.trim(),
        company: formData.company.trim() || null,
        bio: formData.bio.trim(),
        linkedin_url: formData.linkedin_url.trim() || null,
        image_path,
        image_url,
        is_active: formData.is_active,
        featured: formData.featured,
      });

      if (error) throw error;
      
      toast.success('Sponsor updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      loadSponsors();
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast.error('Failed to update sponsor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSponsor) return;
    
    const { success, error } = await deleteSponsorShowcase(selectedSponsor.id);
    if (success) {
      toast.success('Sponsor deleted successfully');
      setIsDeleteDialogOpen(false);
      resetForm();
      loadSponsors();
    } else {
      toast.error('Failed to delete sponsor');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (sponsor: SponsorShowcase) => {
    const { success } = await toggleSponsorShowcaseActive(sponsor.id, !sponsor.is_active);
    if (success) {
      toast.success(sponsor.is_active ? 'Sponsor hidden' : 'Sponsor shown');
      loadSponsors();
    } else {
      toast.error('Failed to update sponsor');
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (sponsor: SponsorShowcase) => {
    const { success } = await toggleSponsorShowcaseFeatured(sponsor.id, !sponsor.featured);
    if (success) {
      toast.success(sponsor.featured ? 'Removed from featured' : 'Marked as featured');
      loadSponsors();
    } else {
      toast.error('Failed to update sponsor');
    }
  };

  // Handle reorder
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sponsors.length - 1) return;

    const newSponsors = [...sponsors];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSponsors[index], newSponsors[swapIndex]] = [newSponsors[swapIndex], newSponsors[index]];

    // Update order
    const { success } = await reorderSponsorShowcase(newSponsors.map(s => s.id));
    if (success) {
      setSponsors(newSponsors);
      toast.success('Order updated');
    } else {
      toast.error('Failed to reorder');
    }
  };

  // Open edit dialog
  const openEditDialog = (sponsor: SponsorShowcase) => {
    setSelectedSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      title: sponsor.title,
      company: sponsor.company || '',
      bio: sponsor.bio,
      linkedin_url: sponsor.linkedin_url || '',
      image: null,
      is_active: sponsor.is_active,
      featured: sponsor.featured,
    });
    setImagePreview(sponsor.image_url);
    setIsEditDialogOpen(true);
  };

  // Sponsor Form Component
  const SponsorForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Sponsor name"
          />
        </div>
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Job title"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Company</Label>
        <Input
          value={formData.company}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          placeholder="Company name"
        />
      </div>

      <div className="space-y-2">
        <Label>Bio *</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Sponsor biography..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>LinkedIn URL</Label>
        <Input
          value={formData.linkedin_url}
          onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div className="space-y-2">
        <Label>Photo</Label>
        <Input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-full mt-2" />
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label>Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
          />
          <Label>Featured</Label>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout
      title="Sponsor Showcase"
      subtitle={`Manage sponsors displayed on the /for-sponsors page (${stats.active} active)`}
      actions={
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Sponsor
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-500">{stats.inactive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.featured}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No sponsors yet</h3>
          <p className="text-muted-foreground">Add sponsors to showcase on the /for-sponsors page</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sponsors.map((sponsor, index) => (
            <Card key={sponsor.id} className={!sponsor.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0}
                      onClick={() => handleReorder(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === sponsors.length - 1}
                      onClick={() => handleReorder(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image */}
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sponsor.image_url ? (
                      <img src={sponsor.image_url} alt={sponsor.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                      {sponsor.featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      {!sponsor.is_active && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sponsor.title} {sponsor.company && `at ${sponsor.company}`}
                    </p>
                    <p className="text-sm mt-2 line-clamp-2">{sponsor.bio}</p>
                    {sponsor.linkedin_url && (
                      <a 
                        href={sponsor.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(sponsor)}
                      title={sponsor.is_active ? 'Hide' : 'Show'}
                    >
                      {sponsor.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFeatured(sponsor)}
                      title={sponsor.featured ? 'Unfeature' : 'Feature'}
                      className={sponsor.featured ? 'text-yellow-600' : ''}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(sponsor)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSelectedSponsor(sponsor); setIsDeleteDialogOpen(true); }}
                      title="Delete"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Sponsor</DialogTitle>
            <DialogDescription>
              Add a sponsor to showcase on the /for-sponsors page
            </DialogDescription>
          </DialogHeader>
          <SponsorForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Sponsor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
            <DialogDescription>
              Update sponsor information
            </DialogDescription>
          </DialogHeader>
          <SponsorForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Sponsor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sponsor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSponsor?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
