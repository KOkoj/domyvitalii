import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateUser, useUpdateUser, useUser } from '@/hooks/useApi'
import type { User } from '@/types'

interface SimpleUserFormProps {
  userId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface UserFormData {
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  password?: string
  confirmPassword?: string
}

export const SimpleUserForm: React.FC<SimpleUserFormProps> = ({
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
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      role: 'EMPLOYEE',
    },
  })

  // Load user data when editing
  useEffect(() => {
    if (user && isEditing) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
      })
    }
  }, [user, isEditing, reset])

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        name: data.name,
        email: data.email,
        role: data.role,
        ...(data.password && !isEditing ? { password: data.password } : {}),
      }

      if (isEditing && userId) {
        await updateUserMutation.mutateAsync({ id: userId, data: submitData })
      } else {
        await createUserMutation.mutateAsync(submitData)
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
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Celé jméno *"
                {...register('name', { required: 'Jméno je povinné' })}
                error={errors.name?.message}
                placeholder="Jan Novák"
              />

              <Input
                label="Email *"
                type="email"
                {...register('email', { required: 'Email je povinný' })}
                error={errors.email?.message}
                placeholder="jan.novak@example.com"
              />

              <Controller
                name="role"
                control={control}
                rules={{ required: 'Role je povinná' }}
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
            </div>

            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Heslo *"
                  type="password"
                  {...register('password', { 
                    required: !isEditing ? 'Heslo je povinné' : false,
                    minLength: { value: 8, message: 'Heslo musí mít alespoň 8 znaků' }
                  })}
                  error={errors.password?.message}
                  placeholder="Alespoň 8 znaků"
                />

                <Input
                  label="Potvrdit heslo *"
                  type="password"
                  {...register('confirmPassword', {
                    required: !isEditing ? 'Potvrzení hesla je povinné' : false,
                  })}
                  error={errors.confirmPassword?.message}
                  placeholder="Zopakujte heslo"
                />
              </div>
            )}
          </div>
        </div>

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