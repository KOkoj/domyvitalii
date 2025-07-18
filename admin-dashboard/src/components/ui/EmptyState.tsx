import React from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  children?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-md mx-auto">
        {Icon && (
          <div className="flex justify-center mb-4">
            <Icon className="h-24 w-24 text-gray-300" />
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>

        {action && (
          <div className="flex justify-center">
            {action.href ? (
              <Button href={action.href}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ) : (
              <Button onClick={action.onClick}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            )}
          </div>
        )}
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-configured empty states for common use cases
export const EmptyStates = {
  Properties: () => (
    <EmptyState
      title="Zatím žádné nemovitosti"
      description="Začněte přidáním první nemovitosti do vašeho portfolia."
      action={{
        label: 'Přidat nemovitost',
        href: '/properties/new',
      }}
    />
  ),

  BlogPosts: () => (
    <EmptyState
      title="Zatím žádné články"
      description="Sdílejte své znalosti a zkušenosti s kupováním nemovitostí v Itálii."
      action={{
        label: 'Napsat článek',
        href: '/blog/new',
      }}
    />
  ),

  Inquiries: () => (
    <EmptyState
      title="Žádné nové poptávky"
      description="Když zákazníci pošlou poptávku, zobrazí se zde."
    />
  ),

  Users: () => (
    <EmptyState
      title="Zatím žádní uživatelé"
      description="Pozvěte kolegy do administračního panelu."
      action={{
        label: 'Pozvat uživatele',
        href: '/users/new',
      }}
    />
  ),

  SearchResults: ({ query }: { query: string }) => (
    <EmptyState
      title="Žádné výsledky"
      description={`Nenašli jsme žádné výsledky pro "${query}". Zkuste jiný vyhledávací výraz.`}
    />
  ),

  ErrorState: ({ onRetry }: { onRetry?: () => void }) => (
    <EmptyState
      title="Nepodařilo se načíst data"
      description="Došlo k chybě při načítání. Zkuste to prosím znovu."
      action={onRetry ? {
        label: 'Zkusit znovu',
        onClick: onRetry,
      } : undefined}
    />
  ),
}

export default EmptyState 