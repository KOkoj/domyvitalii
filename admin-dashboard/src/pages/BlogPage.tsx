import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useBlogPosts, useDeleteBlogPost } from '../hooks/useApi';
import type { BlogPost } from '../types';

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Use the React Query hook instead of manual API calls
  const { data: blogData, isLoading: loading, error: queryError } = useBlogPosts({
    page: 1,
    limit: 100, // Get all posts for now
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  const deleteBlogPost = useDeleteBlogPost();

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    try {
      await deleteBlogPost.mutateAsync(postToDelete.id);
    } catch (error) {
      // Error is already handled by the mutation hook
    } finally {
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const posts = blogData?.data || [];
  const error = queryError ? 'Nepodařilo se načíst články' : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publikováno';
      case 'draft':
        return 'Koncept';
      case 'archived':
        return 'Archivováno';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = (posts || []).filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (post.isPublished ? 'published' : 'draft') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Chyba</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Správa blogu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Vytvářejte a spravujte články o nemovitostech v Italii
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/blog/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nový článek
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat články..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">Všechny stavy</option>
            <option value="published">Publikováno</option>
            <option value="draft">Koncepty</option>
            <option value="archived">Archivováno</option>
          </select>
        </div>
      </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Celkem článků
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(posts || []).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Publikováno
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(posts || []).filter(p => p.isPublished).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PencilIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Koncepty
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(posts || []).filter(p => !p.isPublished).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Celkem zobrazení
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(posts || []).reduce((sum, post) => sum + (post.views || 0), 0).toLocaleString('cs-CZ')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Články ({filteredPosts.length})
          </h3>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné články</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Nebyl nalezen žádný článek odpovídající vašemu vyhledávání.' : 'Začněte psaním svého prvního článku.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    to="/blog/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nový článek
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Článek
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zobrazení
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {post.excerpt}
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{post.tags.length - 3} více
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{post.author.name}</span>
                        </div>
                      </td>
                                              <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.isPublished ? 'published' : 'draft')}`}>
                            {getStatusText(post.isPublished ? 'published' : 'draft')}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.views?.toLocaleString('cs-CZ') || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <CalendarIcon className="h-4 w-4 text-gray-400 inline mr-1" />
                          {post.isPublished && post.publishedAt 
                            ? formatDate(post.publishedAt)
                            : formatDate(post.updatedAt)
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.isPublished ? 'Publikováno' : 'Naposledy upraveno'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/blog/${post.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Zobrazit článek"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/blog/${post.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Upravit článek"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(post)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Smazat článek"
                            disabled={deleteBlogPost.isPending}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Smazat článek"
        description={`Opravdu chcete smazat článek "${postToDelete?.title}"? Tato akce je nevratná.`}
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default BlogPage; 