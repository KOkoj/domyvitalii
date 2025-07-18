import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Potvrdit',
  cancelText = 'Zrušit',
  type = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
      case 'info':
        return <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
    }
  }

  const getConfirmVariant = () => {
    switch (type) {
      case 'danger':
        return 'destructive' as const
      case 'warning':
        return 'default' as const
      case 'info':
        return 'default' as const
      default:
        return 'destructive' as const
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    {getIcon()}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    variant={getConfirmVariant()}
                    onClick={onConfirm}
                    loading={loading}
                    loadingText="Zpracování..."
                    className="w-full sm:ml-3 sm:w-auto"
                  >
                    {confirmText}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    {cancelText}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// Hook for easier confirmation dialog usage
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info'
  } | null>(null)

  const confirm = (options: {
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info'
  }) => {
    setConfig(options)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setConfig(null)
  }

  const handleConfirm = () => {
    if (config) {
      config.onConfirm()
      close()
    }
  }

  const ConfirmDialogComponent = config ? (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={close}
      onConfirm={handleConfirm}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      type={config.type}
    />
  ) : null

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  }
}

export default ConfirmDialog 