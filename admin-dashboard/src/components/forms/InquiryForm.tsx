import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useUpdateInquiry, useInquiry, useUsers, useProperties } from '@/hooks/useApi'
import { inquirySchema, InquiryFormData } from '@/lib/validations'
import type { Inquiry } from '@/types'
import { cn } from '@/lib/utils'

interface InquiryFormProps {
  inquiryId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  inquiryId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(inquiryId)

  // API hooks
  const { data: inquiry, isLoading: isLoadingInquiry } = useInquiry(inquiryId || '')
  const { data: usersData } = useUsers({ limit: 100 })
  const { data: propertiesData } = useProperties({ limit: 100 })
  const updateInquiryMutation = useUpdateInquiry()

  // Form
  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      status: 'new',
      priority: 'medium',
    },
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form

  // Load inquiry data when editing
  useEffect(() => {
    if (inquiry && isEditing) {
      reset({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone || '',
        subject: `${inquiry.type} inquiry`,
        message: inquiry.message,
        propertyId: inquiry.propertyId || '',
        status: inquiry.status.toLowerCase() as any,
        priority: 'medium',
        assignedTo: '',
        notes: '',
      })
    }
  }, [inquiry, isEditing, reset])

  const onSubmit = async (data: InquiryFormData) => {
    if (!isEditing || !inquiryId) return

    setIsSubmitting(true)
    try {
      await updateInquiryMutation.mutateAsync({ id: inquiryId, data })
      onSuccess?.()
    } catch (error) {
      console.error('Inquiry form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions: SelectOption[] = [
    { value: 'new', label: 'Nová' },
    { value: 'in_progress', label: 'Zpracovává se' },
    { value: 'resolved', label: 'Vyřešená' },
    { value: 'spam', label: 'Spam' },
  ]

  const priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Nízká' },
    { value: 'medium', label: 'Střední' },
    { value: 'high', label: 'Vysoká' },
    { value: 'urgent', label: 'Urgentní' },
  ]

  const userOptions: SelectOption[] = [
    { value: '', label: 'Nepřiřazeno' },
    ...(usersData?.data || []).map(user => ({
      value: user.id,
      label: user.name,
    })),
  ]

  const propertyOptions: SelectOption[] = [
    { value: '', label: 'Obecná poptávka' },
    ...(propertiesData?.data || []).map(property => ({
      value: property.id,
      label: property.title,
    })),
  ]

  if (isLoadingInquiry) {
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
            {isEditing ? 'Upravit poptávku' : 'Zobrazit poptávku'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? `Úprava poptávky #${inquiryId}` : 'Detail poptávky'}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Zpět
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Informace o zákazníkovi</h3>
            
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Jméno *"
                {...register('name')}
                error={errors.name?.message}
                disabled={!isEditing}
                placeholder="Jan Novák"
              />

              <Input
                label="Email *"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                disabled={!isEditing}
                placeholder="jan.novak@email.cz"
              />

              <Input
                label="Telefon"
                {...register('phone')}
                error={errors.phone?.message}
                disabled={!isEditing}
                placeholder="+420 123 456 789"
              />

              <Controller
                name="propertyId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Nemovitost"
                    options={propertyOptions}
                    placeholder="Vyberte nemovitost"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!isEditing}
                  />
                )}
              />
            </div>

            <div>
              <Input
                label="Předmět *"
                {...register('subject')}
                error={errors.subject?.message}
                disabled={!isEditing}
                placeholder="Dotaz na pronájem nemovitosti"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zpráva *
              </label>
              <textarea
                {...register('message')}
                rows={6}
                disabled={!isEditing}
                className={cn(
                  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                  errors.message
                    ? "ring-red-300 focus:ring-red-500"
                    : "ring-gray-300 focus:ring-blue-600",
                  !isEditing && "bg-gray-50"
                )}
                placeholder="Dobrý den, mám zájem o..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status and Assignment */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Správa poptávky</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Priorita"
                    options={priorityOptions}
                    placeholder="Vyberte prioritu"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.priority?.message}
                  />
                )}
              />

              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Přiřazeno"
                    options={userOptions}
                    placeholder="Vyberte uživatele"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.assignedTo?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interní poznámky
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className={cn(
                  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                  errors.notes
                    ? "ring-red-300 focus:ring-red-500"
                    : "ring-gray-300 focus:ring-blue-600"
                )}
                placeholder="Poznámky pro interní použití..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        {isEditing && (
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
                  Ukládání...
                </div>
              ) : (
                'Uložit změny'
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
} 