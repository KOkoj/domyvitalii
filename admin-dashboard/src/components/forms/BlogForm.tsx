import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { FileUploader } from '@/components/ui/FileUploader'
import { Button } from '@/components/ui/Button'
import { useCreateBlogPost, useUpdateBlogPost, useBlogPost } from '@/hooks/useApi'
import { blogPostSchema, BlogPostFormData } from '@/lib/validations'
// import type { BlogPost } from '@/types'
import { cn } from '@/lib/utils'

interface BlogFormProps {
  blogPostId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const BlogForm: React.FC<BlogFormProps> = ({
  blogPostId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(blogPostId)

  // API hooks
  const { data: blogPost, isLoading: isLoadingBlogPost } = useBlogPost(blogPostId || '')
  const createBlogPostMutation = useCreateBlogPost()
  const updateBlogPostMutation = useUpdateBlogPost()

  // Form
  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      status: 'draft',
      tags: [],
      readingTime: 5,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form

  // Load blog post data when editing
  useEffect(() => {
    if (blogPost && isEditing) {
      reset({
        title: blogPost.title,
        slug: blogPost.slug,
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        status: blogPost.isPublished ? 'published' : 'draft',
        category: blogPost.family,
        tags: blogPost.tags,
        seoTitle: blogPost.metaTitle || '',
        seoDescription: blogPost.metaDescription || '',
        readingTime: blogPost.readTime || 5,
        featuredImage: blogPost.coverImage ? {
          id: Math.random().toString(36),
          url: blogPost.coverImage,
          name: 'featured-image',
          type: 'image/jpeg',
        } : undefined,
      })
    }
  }, [blogPost, isEditing, reset])

  const onSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
      }

      if (isEditing && blogPostId) {
        await updateBlogPostMutation.mutateAsync({ id: blogPostId, data: submitData })
      } else {
        await createBlogPostMutation.mutateAsync(submitData)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Blog form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-generate slug from title
  const title = watch('title') || ''
  const slug = watch('slug') || ''
  
  useEffect(() => {
    if (title && !isEditing) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      if (generatedSlug !== slug) {
        setValue('slug', generatedSlug)
      }
    }
  }, [title, slug, setValue, isEditing])

  const statusOptions: SelectOption[] = [
    { value: 'draft', label: 'Koncept' },
    { value: 'published', label: 'Publikováno' },
    { value: 'archived', label: 'Archivováno' },
  ]

  const categoryOptions: SelectOption[] = [
    { value: 'travel', label: 'Cestování' },
    { value: 'culture', label: 'Kultura' },
    { value: 'food', label: 'Jídlo' },
    { value: 'tips', label: 'Tipy' },
    { value: 'guides', label: 'Průvodci' },
  ]

  // Watch values for SEO preview
  const seoTitle = watch('seoTitle') || ''
  const seoDescription = watch('seoDescription') || ''
  const excerpt = watch('excerpt') || ''

  if (isLoadingBlogPost) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {isEditing ? 'Upravit článek' : 'Nový článek'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? `Úprava článku ${blogPostId}` : 'Vytvořit nový blog článek'}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Zrušit
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Titulek *"
                  {...register('title')}
                  error={errors.title?.message}
                  placeholder="např. Objevte krásy Toskánska"
                />
              </div>

              <Input
                label="URL Slug *"
                {...register('slug')}
                error={errors.slug?.message}
                placeholder="objevte-krasy-toskanska"
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Stav *"
                    options={statusOptions}
                    placeholder="Vyberte stav"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.status?.message}
                  />
                )}
              />

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Kategorie *"
                    options={categoryOptions}
                    placeholder="Vyberte kategorii"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.category?.message}
                  />
                )}
              />

              <Input
                label="Doba čtení (min)"
                type="number"
                min="1"
                {...register('readingTime', { valueAsNumber: true })}
                error={errors.readingTime?.message}
                placeholder="5"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perex *
                </label>
                <textarea
                  {...register('excerpt')}
                  rows={3}
                  maxLength={300}
                  className={cn(
                    "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                    errors.excerpt
                      ? "ring-red-300 focus:ring-red-500"
                      : "ring-gray-300 focus:ring-blue-600"
                  )}
                  placeholder="Krátký popis článku pro náhled..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(excerpt || '').length}/300 znaků
                </p>
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <Controller
                name="featuredImage"
                control={control}
                render={({ field }) => (
                  <FileUploader
                    label="Hlavní obrázek"
                    value={field.value ? [field.value] : []}
                    onChange={(files) => setValue('featuredImage', files[0])}
                    maxFiles={1}
                    error={errors.featuredImage?.message}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                  />
                )}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obsah *
              </label>
              <textarea
                {...register('content')}
                rows={15}
                className={cn(
                  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                  errors.content
                    ? "ring-red-300 focus:ring-red-500"
                    : "ring-gray-300 focus:ring-blue-600"
                )}
                placeholder="Napište obsah článku..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tip: Pro lepší vzhled použijte Markdown syntaxi
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Štítky
              </label>
              <Input
                placeholder="cestování, toskánsko, itálie (oddělte čárkou)"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  setValue('tags', tags)
                }}
                value={watch('tags')?.join(', ') || ''}
              />
              <p className="mt-1 text-xs text-gray-500">
                Štítky oddělte čárkou
              </p>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">SEO Optimalizace</h3>

            {/* SEO Preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Náhled ve vyhledávání</h4>
              <div className="space-y-1">
                <div className="text-blue-700 text-lg font-medium truncate">
                  {seoTitle || title || 'Titulek článku'}
                </div>
                <div className="text-green-700 text-sm">
                  domy-v-italii.cz/blog/{slug || 'url-slug'}
                </div>
                <div className="text-gray-700 text-sm line-clamp-2">
                  {seoDescription || excerpt || 'Popis článku...'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <Input
                  label="SEO Titulek (volitelné)"
                  {...register('seoTitle')}
                  error={errors.seoTitle?.message}
                  placeholder="Optimalizovaný titulek pro vyhledávače"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(seoTitle || '').length}/60 znaků
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Popis (volitelné)
                </label>
                <textarea
                  {...register('seoDescription')}
                  rows={3}
                  maxLength={160}
                  className={cn(
                    "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                    errors.seoDescription
                      ? "ring-red-300 focus:ring-red-500"
                      : "ring-gray-300 focus:ring-blue-600"
                  )}
                  placeholder="Stručný popis pro vyhledávače a sociální sítě"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(seoDescription || '').length}/160 znaků
                </p>
                {errors.seoDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.seoDescription.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Zrušit
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Ukládání...' : 'Vytváření...'}
              </div>
            ) : (
              isEditing ? 'Uložit změny' : 'Vytvořit článek'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 