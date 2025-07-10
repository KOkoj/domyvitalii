import { useState } from 'react'
import {
  CheckCircleIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: 'default' | 'danger' | 'warning'
  description?: string
}

interface PropertyBulkActionsProps {
  selectedCount: number
  onBulkAction: (action: string) => void
}

const bulkActions: BulkAction[] = [
  {
    id: 'publish',
    label: 'Publikovat',
    icon: EyeIcon,
    color: 'default',
    description: 'Zveřejnit vybrané nemovitosti'
  },
  {
    id: 'unpublish',
    label: 'Skrýt',
    icon: EyeSlashIcon,
    color: 'warning',
    description: 'Skrýt vybrané nemovitosti'
  },
  {
    id: 'duplicate',
    label: 'Duplikovat',
    icon: DocumentDuplicateIcon,
    color: 'default',
    description: 'Vytvořit kopie vybraných nemovitostí'
  },
  {
    id: 'archive',
    label: 'Archivovat',
    icon: ArchiveBoxIcon,
    color: 'warning',
    description: 'Přesunout do archivu'
  },
  {
    id: 'delete',
    label: 'Smazat',
    icon: TrashIcon,
    color: 'danger',
    description: 'Trvale smazat vybrané nemovitosti'
  },
]

export function PropertyBulkActions({ selectedCount, onBulkAction }: PropertyBulkActionsProps) {
  const [isConfirming, setIsConfirming] = useState<string | null>(null)

  const handleAction = (actionId: string) => {
    // For dangerous actions, show confirmation
    if (actionId === 'delete' || actionId === 'archive') {
      setIsConfirming(actionId)
    } else {
      onBulkAction(actionId)
    }
  }

  const confirmAction = (actionId: string) => {
    onBulkAction(actionId)
    setIsConfirming(null)
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-5 w-5 text-brand-600" />
          <span className="text-sm font-medium text-gray-900">
            {selectedCount} {selectedCount === 1 ? 'nemovitost vybrána' : 'nemovitosti vybrány'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('publish')}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Publikovat
          </Button>

          {/* More Actions Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button as={Button} variant="outline" size="sm">
              Další akce
            </Menu.Button>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {bulkActions.map((action) => (
                  <Menu.Item key={action.id}>
                    {({ active }) => (
                      <button
                        onClick={() => handleAction(action.id)}
                        className={cn(
                          'flex w-full items-center px-4 py-2 text-sm',
                          active ? 'bg-gray-100' : '',
                          action.color === 'danger' 
                            ? 'text-red-700' 
                            : action.color === 'warning'
                            ? 'text-yellow-700'
                            : 'text-gray-700'
                        )}
                      >
                        <action.icon className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{action.label}</div>
                          {action.description && (
                            <div className="text-xs text-gray-500">{action.description}</div>
                          )}
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction('clear')}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirming && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {isConfirming === 'delete' ? (
                <TrashIcon className="h-5 w-5 text-red-500" />
              ) : (
                <ArchiveBoxIcon className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {isConfirming === 'delete' ? 'Smazat nemovitosti?' : 'Archivovat nemovitosti?'}
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                {isConfirming === 'delete'
                  ? `Opravdu chcete trvale smazat ${selectedCount} vybraných nemovitostí? Tato akce je nevratná.`
                  : `Opravdu chcete archivovat ${selectedCount} vybraných nemovitostí?`
                }
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant={isConfirming === 'delete' ? 'destructive' : 'default'}
                  onClick={() => confirmAction(isConfirming)}
                >
                  {isConfirming === 'delete' ? 'Smazat' : 'Archivovat'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConfirming(null)}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 