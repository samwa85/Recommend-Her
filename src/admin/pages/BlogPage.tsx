// ============================================================================
// BLOG PAGE - Admin blog management
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  FileText,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { SkeletonTable } from '../components/LoadingSkeleton';
import BlogEditor from '../components/BlogEditor';
import {
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  archiveBlogPost,
  type ListBlogOptions,
} from '@/lib/queries';
import type { BlogPost, BlogPostInput } from '@/lib/types/db';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BlogPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'created_at',
    direction: 'desc',
  });

  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Bulk action dialog
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'publish' | 'unpublish' | 'archive' | 'delete'>('publish');

  const perPage = 10;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      const options: ListBlogOptions = {
        filters: {
          ...(statusFilter && { status: statusFilter as 'draft' | 'published' | 'archived' }),
          ...(categoryFilter && { category: categoryFilter }),
          ...(search && { search }),
        },
        pagination: { page, perPage },
        sort: { 
          by: sortConfig.key as 'title' | 'author_name' | 'status' | 'created_at',
          order: sortConfig.direction 
        },
      };

      const result = await listBlogPosts(options);
      
      if (result.error) {
        console.error('[BlogPage] Query error:', result.error);
        throw result.error;
      }
      
      setPosts(result.data);
      setTotalCount(result.count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog posts';
      setFetchError(errorMessage);
      toast.error(`Failed to fetch blog posts: ${errorMessage}`);
      console.error('[BlogPage] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sortConfig, statusFilter, categoryFilter, search, page]);

  // Fetch on mount and when filters change
  useMemo(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateNew = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleSave = async (data: BlogPostInput & { id?: string }) => {
    try {
      if (data.id) {
        // Update existing
        const result = await updateBlogPost(data.id, data);
        if (result.error) {
          console.error('[BlogPage] Update error:', result.error);
          throw new Error(result.error.message || 'Failed to update post');
        }
      } else {
        // Create new
        const result = await createBlogPost(data);
        if (result.error) {
          console.error('[BlogPage] Create error:', result.error);
          throw new Error(result.error.message || 'Failed to create post');
        }
      }
      
      setShowEditor(false);
      setEditingPost(null);
      fetchPosts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save post';
      toast.error(`Failed to save post: ${message}`);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    
    try {
      const result = await deleteBlogPost(postToDelete);
      if (result.error) throw result.error;
      
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to delete post');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleStatusChange = async (post: BlogPost, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      let result;
      switch (newStatus) {
        case 'published':
          result = await publishBlogPost(post.id);
          break;
        case 'draft':
          result = await unpublishBlogPost(post.id);
          break;
        case 'archived':
          result = await archiveBlogPost(post.id);
          break;
      }
      
      if (result?.error) throw result.error;
      
      toast.success(`Post ${newStatus === 'published' ? 'published' : newStatus === 'draft' ? 'unpublished' : 'archived'}`);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  const handleViewPost = (post: BlogPost) => {
    window.open(`/blog/${post.slug}`, '_blank');
  };

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleRowSelect = useCallback((id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(posts.map(p => p.id)));
    }
    setSelectAll(!selectAll);
  }, [selectAll, posts]);

  const handleBulkAction = useCallback(async () => {
    const ids = Array.from(selectedRows);
    
    toast.promise(
      async () => {
        const results = await Promise.allSettled(
          ids.map((id) => {
            if (bulkAction === 'delete') return deleteBlogPost(id);
            if (bulkAction === 'publish') return publishBlogPost(id);
            if (bulkAction === 'unpublish') return unpublishBlogPost(id);
            return archiveBlogPost(id);
          })
        );

        const successCount = results.filter((result) => {
          if (result.status === 'rejected') return false;
          const value = result.value as { success?: boolean; error?: Error | null };
          if ('success' in value) return value.success === true;
          return value.error == null;
        }).length;

        if (successCount === 0) {
          throw new Error('No posts were updated');
        }

        setSelectedRows(new Set());
        setSelectAll(false);
        setBulkActionDialogOpen(false);
        fetchPosts();
        return `${successCount} posts updated`;
      },
      {
        loading: 'Processing...',
        success: 'Bulk action completed',
        error: 'Bulk action failed',
      }
    );
  }, [selectedRows, bulkAction, fetchPosts]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge>;
      case 'draft':
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'archived':
        return <Badge variant="outline"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  const totalPages = Math.ceil(totalCount / perPage);
  const hasSelectedRows = selectedRows.size > 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (showEditor) {
    return (
      <AdminLayout
        title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
        subtitle={editingPost ? `Editing: ${editingPost.title}` : 'Write a new blog post'}
        actions={
          <Button variant="outline" onClick={() => setShowEditor(false)}>
            Back to Posts
          </Button>
        }
      >
        <BlogEditor
          post={editingPost}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Blog"
      subtitle={`${totalCount} total posts`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPosts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Leadership">Leadership</SelectItem>
              <SelectItem value="Success Stories">Success Stories</SelectItem>
              <SelectItem value="Diversity & Inclusion">Diversity & Inclusion</SelectItem>
              <SelectItem value="Career Growth">Career Growth</SelectItem>
              <SelectItem value="News">News</SelectItem>
            </SelectContent>
          </Select>

          {hasSelectedRows && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkAction('publish'); setBulkActionDialogOpen(true); }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkAction('unpublish'); setBulkActionDialogOpen(true); }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Unpublish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkAction('archive'); setBulkActionDialogOpen(true); }}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => { setBulkAction('delete'); setBulkActionDialogOpen(true); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Posts Table */}
      {isLoading ? (
        <SkeletonTable columns={6} rows={5} />
      ) : fetchError ? (
        <div className="text-center py-16">
          <XCircle className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Failed to load blog posts</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            {fetchError.includes('blog_posts') && fetchError.includes('exist')
              ? 'The blog posts table does not exist. Please run the database migrations.'
              : fetchError}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" onClick={fetchPosts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No blog posts found</h3>
          <p className="text-muted-foreground mt-1">
            {search || statusFilter || categoryFilter
              ? 'Try adjusting your filters'
              : 'Get started by creating your first blog post'}
          </p>
          {!search && !statusFilter && !categoryFilter && (
            <Button className="mt-4" onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Post
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('author_name')}
                  >
                    <div className="flex items-center gap-1">
                      Author
                      {getSortIcon('author_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Category
                      {getSortIcon('category')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow
                    key={post.id}
                    className={`group cursor-pointer ${selectedRows.has(post.id) ? 'bg-muted' : ''}`}
                    onClick={() => handleEdit(post)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(post.id)}
                        onCheckedChange={() => handleRowSelect(post.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {post.excerpt}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{post.author_name}</p>
                        <p className="text-xs text-muted-foreground">{post.author_title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {post.status === 'published' && post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPost(post)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View on Site
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleEdit(post)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {post.status !== 'published' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(post, 'published')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          
                          {post.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(post, 'draft')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          
                          {post.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(post, 'archived')}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setPostToDelete(post.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * perPage) + 1} to{' '}
              {Math.min(page * perPage, totalCount)} of {totalCount} posts
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedRows.size} post{selectedRows.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
            >
              {bulkAction === 'delete' ? <Trash2 className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
