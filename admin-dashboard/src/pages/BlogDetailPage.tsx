import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { useBlogPost, useDeleteBlogPost, useUpdateBlogPost } from '../hooks/useApi';
import { formatDate, cn } from '../lib/utils';
import type { BlogPost } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data: blogPost, isLoading: loading, error } = useBlogPost(id!);
  const deleteBlogPost = useDeleteBlogPost();

  const handleDelete = async () => {
    if (!blogPost) return;
    
    try {
      await deleteBlogPost.mutateAsync(blogPost.id);
      navigate('/blog');
    } catch (error) {
      // Error is already handled by the mutation hook
    }
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? 'Publikováno' : 'Koncept';
  };

  const getCategoryText = (family: string) => {
    const categoryMap: Record<string, string> = {
      travel: 'Cestování',
      culture: 'Kultura',
      food: 'Jídlo',
      tips: 'Tipy',
      guides: 'Průvodci',
    };
    return categoryMap[family] || family;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Nepodařilo se načíst článek. <Link to="/blog" className="underline">Zpět na blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/blog"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zpět na blog
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {blogPost.title}
            </h1>
            <p className="text-sm text-gray-500">
              <UserIcon className="h-4 w-4 inline mr-1" />
              {blogPost.author.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(blogPost.isPublished)
          )}>
            {getStatusText(blogPost.isPublished)}
          </span>
          
          <Button variant="outline" size="sm">
            <ShareIcon className="h-4 w-4 mr-2" />
            Sdílet
          </Button>
          
          <Button asChild variant="outline" size="sm">
            <Link to={`/blog/${blogPost.id}/edit`}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Upravit
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            disabled={deleteBlogPost.isPending}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Smazat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {blogPost.coverImage && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Hlavní obrázek</h2>
              <img
                src={blogPost.coverImage}
                alt={blogPost.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Excerpt */}
          {blogPost.excerpt && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Perex</h2>
              <p className="text-gray-700 leading-relaxed">
                {blogPost.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Obsah</h2>
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {blogPost.content}
              </div>
            </div>
          </div>

          {/* Tags */}
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Štítky
              </h2>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informace o článku</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                <p className="text-sm text-gray-900">{getCategoryText(blogPost.family)}</p>
              </div>
              
              {blogPost.topic && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téma</label>
                  <p className="text-sm text-gray-900">{blogPost.topic}</p>
                </div>
              )}
              
              {blogPost.readTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doba čtení</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {blogPost.readTime} min
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Zobrazení</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {blogPost.views.toLocaleString('cs-CZ')}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Information */}
          {(blogPost.metaTitle || blogPost.metaDescription) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO</h3>
              
              <div className="space-y-3">
                {blogPost.metaTitle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta titulek</label>
                    <p className="text-sm text-gray-600">{blogPost.metaTitle}</p>
                  </div>
                )}
                
                {blogPost.metaDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta popis</label>
                    <p className="text-sm text-gray-600">{blogPost.metaDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="text-sm text-gray-500">{blogPost.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                <p className="text-sm text-gray-500">{blogPost.slug}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Autor</label>
                <p className="text-sm text-gray-500">{blogPost.author.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Vytvořeno</label>
                <p className="text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  {formatDate(blogPost.createdAt)}
                </p>
              </div>
              
              {blogPost.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aktualizováno</label>
                  <p className="text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    {formatDate(blogPost.updatedAt)}
                  </p>
                </div>
              )}
              
              {blogPost.publishedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Publikováno</label>
                  <p className="text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    {formatDate(blogPost.publishedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rychlé akce</h3>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to={`/blog/${blogPost.id}/edit`}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Upravit článek
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <ShareIcon className="h-4 w-4 mr-2" />
                Kopírovat odkaz
              </Button>
              
              <Button variant="outline" className="w-full">
                <EyeIcon className="h-4 w-4 mr-2" />
                Náhled na webu
              </Button>
              
              {!blogPost.isPublished && (
                <Button variant="outline" className="w-full">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Publikovat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete button */}
      <Button
        variant="destructive"
        onClick={() => setShowDeleteDialog(true)}
        disabled={deleteBlogPost.isPending}
      >
        {deleteBlogPost.isPending ? 'Mazání...' : 'Smazat článek'}
      </Button>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Smazat článek"
        description="Opravdu chcete smazat tento článek? Tato akce je nevratná."
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BlogDetailPage; 