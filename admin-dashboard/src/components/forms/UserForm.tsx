import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { FileUploader, FileItem } from '@/components/ui/FileUploader'
import { Button } from '@/components/ui/Button'
import { useCreateUser, useUpdateUser, useUser } from '@/hooks/useApi'
import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormData,
  UpdateUserFormData,
} from '@/lib/validations'
import type { User } from '@/types'
import { cn } from '@/lib/utils'

interface UserFormProps {
  userId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const UserForm: React.FC<UserFormProps> = ({
  userId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(userId)

  // API hooks
  const { data: user, isLoading: isLoadingUser } = useUser(userId || '')
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  // Form
  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      role: 'EMPLOYEE',
      status: 'active',
      permissions: [],
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

  // Load user data when editing
  useEffect(() => {
    if (user && isEditing) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: '',
        status: user.isActive ? 'active' : 'inactive',
        bio: '',
        permissions: [],
        avatar: user.avatar ? {
          id: Math.random().toString(36),
          url: user.avatar,
          name: 'avatar',
          type: 'image/jpeg',
        } : undefined,
      })
    }
  }, [user, isEditing, reset])

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true)
    try {
      if (isEditing && userId) {
        await updateUserMutation.mutateAsync({ id: userId, data: data as UpdateUserFormData })
      } else {
        await createUserMutation.mutateAsync(data as CreateUserFormData)
      }
      onSuccess?.()
    } catch (error) {
      console.error('User form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleOptions: SelectOption[] = [
    { value: 'ADMIN', label: 'Administrátor' },
    { value: 'MANAGER', label: 'Manažer' },
    { value: 'EMPLOYEE', label: 'Zaměstnanec' },
  ]

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Aktivní' },
    { value: 'inactive', label: 'Neaktivní' },
    { value: 'suspended', label: 'Pozastavený' },
  ]

  if (isLoadingUser) {
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
            {isEditing ? 'Upravit uživatele' : 'Nový uživatel'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? `Úprava uživatele ${userId}` : 'Vytvořit nový uživatelský účet'}
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
            <h3 className="text-lg font-medium text-gray-900">Základní informace</h3>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Celé jméno *"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Jan Novák"
              />

              <Input
                label="Email *"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="jan.novak@domy-v-italii.cz"
              />

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Role *"
                    options={roleOptions}
                    placeholder="Vyberte roli"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.role?.message}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Stav"
                    options={statusOptions}
                    placeholder="Vyberte stav"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.status?.message}
                  />
                )}
              />

              <div className="md:col-span-2">
                <Input
                  label="Telefon"
                  {...register('phone')}
                  error={errors.phone?.message}
                  placeholder="+420 123 456 789"
                />
              </div>
            </div>

            {/* Avatar */}
            <div>
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => (
                  <FileUploader
                    label="Profilová fotka"
                    value={field.value ? [field.value] : []}
                    onChange={(files) => setValue('avatar', files[0])}
                    maxFiles={1}
                    error={errors.avatar?.message}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                  />
                )}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (volitelné)
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                maxLength={200}
                className={cn(
                  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                  errors.bio
                    ? "ring-red-300 focus:ring-red-500"
                    : "ring-gray-300 focus:ring-blue-600"
                )}
                placeholder="Krátký popis uživatele..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {(watch('bio') || '').length}/200 znaků
              </p>
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Změna hesla (volitelné)' : 'Heslo'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={isEditing ? 'Nové heslo' : 'Heslo *'}
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="Alespoň 8 znaků"
              />

              <Input
                label={isEditing ? 'Potvrdit nové heslo' : 'Potvrdit heslo *'}
                type="password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="Zopakujte heslo"
              />
            </div>

            {!isEditing && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Požadavky na heslo:</h4>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Alespoň 8 znaků</li>
                  <li>Obsahuje velké písmeno</li>
                  <li>Obsahuje malé písmeno</li>
                  <li>Obsahuje číslo</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Oprávnění</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Oprávnění jsou přiřazována automaticky na základě role uživatele.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Role a jejich oprávnění:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Administrátor:</span> Úplné oprávnění k celému systému
                  </div>
                  <div>
                    <span className="font-medium">Manažer:</span> Správa nemovitostí, blogů a poptávek
                  </div>
                  <div>
                    <span className="font-medium">Zaměstnanec:</span> Zobrazení a základní úpravy
                  </div>
                </div>
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
              isEditing ? 'Uložit změny' : 'Vytvořit uživatele'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 