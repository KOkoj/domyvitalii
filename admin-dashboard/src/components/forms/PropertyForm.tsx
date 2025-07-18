import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormWizard, WizardStep } from '@/components/ui/FormWizard'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { FileUploader, FileItem } from '@/components/ui/FileUploader'
// import { Button } from '@/components/ui/Button'
import { useCreateProperty, useUpdateProperty, useProperty } from '@/hooks/useApi'
import {
  propertySchema,
  // propertyBasicInfoSchema,
  // propertyDetailsSchema,
  // propertyMediaSchema,
  // propertySeoSchema,
  PropertyFormData,
  // PropertyBasicInfo,
  // PropertyDetails,
  // PropertyMedia,
  PropertySeo,
} from '@/lib/validations'
import type { Property } from '@/types'
import { cn } from '@/lib/utils'

interface PropertyFormProps {
  propertyId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

// Step 1: Basic Information
const BasicInfoStep: React.FC<{ form: any }> = ({ form }) => {
  const {
    register,
    control,
    formState: { errors },
  } = form

  const typeOptions: SelectOption[] = [
    { value: 'apartment', label: 'Apartmán' },
    { value: 'house', label: 'Dům' },
    { value: 'villa', label: 'Vila' },
    { value: 'cabin', label: 'Chata' },
    { value: 'other', label: 'Ostatní' },
  ]

  const statusOptions: SelectOption[] = [
    { value: 'AVAILABLE', label: 'Dostupné' },
    { value: 'RENTED', label: 'Pronajato' },
    { value: 'SOLD', label: 'Prodáno' },
    { value: 'DRAFT', label: 'Koncept' },
  ]

  const regionOptions: SelectOption[] = [
    { value: 'toscana', label: 'Toskánsko' },
    { value: 'umbria', label: 'Umbrie' },
    { value: 'lazio', label: 'Lazio' },
    { value: 'marche', label: 'Marche' },
    { value: 'abruzzo', label: 'Abruzzo' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Název nemovitosti *"
            {...register('title')}
            error={errors.title?.message}
            placeholder="např. Útulná vila s bazénem"
          />
        </div>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Typ nemovitosti *"
              options={typeOptions}
              placeholder="Vyberte typ"
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
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
          name="region"
          control={control}
          render={({ field }) => (
            <Select
              label="Region *"
              options={regionOptions}
              placeholder="Vyberte region"
              value={field.value}
              onChange={field.onChange}
              error={errors.region?.message}
            />
          )}
        />

        <Input
          label="Město *"
          {...register('city')}
          error={errors.city?.message}
          placeholder="např. Florence"
        />

        <div className="md:col-span-2">
          <Input
            label="Adresa *"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Via Roma 123, 50100 Firenze FI, Itálie"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Popis *
          </label>
          <textarea
            {...register('description')}
            rows={6}
            className={cn(
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
              errors.description
                ? "ring-red-300 focus:ring-red-500"
                : "ring-gray-300 focus:ring-blue-600"
            )}
            placeholder="Popište nemovitost, její výhody, okolí, architekturu..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Amenity labels in Czech
const getAmenityLabel = (amenity: string): string => {
  const labels: Record<string, string> = {
    parking: 'Parkování',
    garden: 'Zahrada',
    terrace: 'Terasa',
    balcony: 'Balkon',
    pool: 'Bazén',
    air_conditioning: 'Klimatizace',
    fireplace: 'Krb',
    security_system: 'Bezpečnostní systém',
    wine_cellar: 'Vinný sklep',
    garage: 'Garáž',
    elevator: 'Výtah',
    mountain_view: 'Výhled na hory',
  }
  return labels[amenity] || amenity
}

// Step 2: Details & Pricing
const DetailsStep: React.FC<{ form: any }> = ({ form }) => {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form

  const currencyOptions: SelectOption[] = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'CZK', label: 'CZK (Kč)' },
  ]

  const amenityOptions = [
    'parking', 'garden', 'terrace', 'balcony', 'pool', 'air_conditioning',
    'fireplace', 'security_system', 'wine_cellar', 'garage', 'elevator', 'mountain_view'
  ]

  const selectedAmenities = watch('amenities') || []

  const toggleAmenity = (amenity: string) => {
    const current = selectedAmenities.includes(amenity)
    if (current) {
      setValue('amenities', selectedAmenities.filter((a: string) => a !== amenity))
    } else {
      setValue('amenities', [...selectedAmenities, amenity])
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex space-x-3">
          <Input
            label="Cena *"
            type="number"
            min="10000"
            max="5000000"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="250000"
          />
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                label="Měna"
                options={currencyOptions}
                value={field.value}
                onChange={field.onChange}
                className="w-24"
              />
            )}
          />
        </div>

        <Input
          label="Ložnice"
          type="number"
          min="0"
          max="20"
          {...register('bedrooms', { valueAsNumber: true })}
          error={errors.bedrooms?.message}
          placeholder="2"
        />

        <Input
          label="Koupelny"
          type="number"
          min="0"
          max="20"
          {...register('bathrooms', { valueAsNumber: true })}
          error={errors.bathrooms?.message}
          placeholder="1"
        />

        <Input
          label="Rok výstavby"
          type="number"
          min="1800"
          max="2024"
          {...register('yearBuilt', { valueAsNumber: true })}
          error={errors.yearBuilt?.message}
          placeholder="2010"
        />

        <Input
          label="Velikost (m²)"
          type="number"
          min="10"
          max="1000"
          {...register('size', { valueAsNumber: true })}
          error={errors.size?.message}
          placeholder="80"
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Vybavení a vlastnosti
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {amenityOptions.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {getAmenityLabel(amenity)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step 3: Media & Images
const MediaStep: React.FC<{ form: any }> = ({ form }) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form

  const images = watch('images') || []

  const handleImagesChange = (newImages: FileItem[]) => {
    setValue('images', newImages)
    if (newImages.length > 0 && !watch('mainImage')) {
      setValue('mainImage', newImages[0].url)
    }
  }

  return (
    <div className="space-y-6">
      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <FileUploader
            label="Obrázky nemovitosti *"
            value={field.value || []}
            onChange={handleImagesChange}
            maxFiles={20}
            error={errors.images?.message}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
          />
        )}
      />

      {images.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Hlavní obrázek
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image: FileItem) => (
              <label key={image.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="mainImage"
                  value={image.url}
                  checked={watch('mainImage') === image.url}
                  onChange={(e) => setValue('mainImage', e.target.value)}
                  className="sr-only"
                />
                <img
                  src={image.url}
                  alt={image.name}
                  className={cn(
                    "w-full h-24 object-cover rounded-lg border-2",
                    watch('mainImage') === image.url
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-gray-300"
                  )}
                />
                {watch('mainImage') === image.url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Hlavní
                    </span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Step 4: SEO
const SeoStep: React.FC<{ form: any }> = ({ form }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = form

  const title = watch('title') || ''
  const description = watch('description') || ''
  const seoTitle = watch('seoTitle') || ''
  const seoDescription = watch('seoDescription') || ''

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">SEO Náhled</h3>
        <div className="space-y-1">
          <div className="text-blue-700 text-lg font-medium truncate">
            {seoTitle || title || 'Název nemovitosti'}
          </div>
          <div className="text-green-700 text-sm">
            domy-v-italii.cz/nemovitosti/...
          </div>
          <div className="text-gray-700 text-sm line-clamp-2">
            {seoDescription || description.substring(0, 160) || 'Popis nemovitosti...'}
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
  )
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  propertyId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(propertyId)

  // API hooks
  const { data: property, isLoading: isLoadingProperty } = useProperty(propertyId || '')
  const createPropertyMutation = useCreateProperty()
  const updatePropertyMutation = useUpdateProperty()

  // Form
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'EUR',
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      images: [],
      seoKeywords: [],
    },
  })

  const { reset, handleSubmit } = form

  // Load property data when editing
  useEffect(() => {
    if (property && isEditing) {
      reset({
        ...property,
        images: property.images?.map((img: any) => ({
          id: img.id || Math.random().toString(36),
          url: img.url,
          name: img.name || 'image',
          type: 'image/jpeg',
        })) || [],
      })
    }
  }, [property, isEditing, reset])

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)
    try {
      if (isEditing && propertyId) {
        await updatePropertyMutation.mutateAsync({ id: propertyId, data })
      } else {
        await createPropertyMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const wizardSteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Základní údaje',
      description: 'Název, typ, lokace',
      component: () => <BasicInfoStep form={form} />,
    },
    {
      id: 'details',
      title: 'Detaily',
      description: 'Cena, vlastnosti',
      component: () => <DetailsStep form={form} />,
    },
    {
      id: 'media',
      title: 'Média',
      description: 'Obrázky a galerie',
      component: () => <MediaStep form={form} />,
    },
    {
      id: 'seo',
      title: 'SEO',
      description: 'Optimalizace',
      optional: true,
      component: () => <SeoStep form={form} />,
    },
  ]

  if (isLoadingProperty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormWizard
        steps={wizardSteps}
        onComplete={handleSubmit(onSubmit)}
        onCancel={onCancel}
      >
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-center">
                {isEditing ? 'Aktualizace nemovitosti...' : 'Vytváření nemovitosti...'}
              </p>
            </div>
          </div>
        )}
      </FormWizard>
    </form>
  )
} 