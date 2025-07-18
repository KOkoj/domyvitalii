import { toast } from 'react-hot-toast'

export interface ToastOptions {
  duration?: number
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
}

class ToastService {
  success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
      },
    })
  }

  error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || 6000,
      position: options?.position || 'top-right', 
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
      },
    })
  }

  warning(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
      },
    })
  }

  info(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
      },
    })
  }

  loading(message: string) {
    return toast.loading(message, {
      style: {
        background: '#6b7280',
        color: '#fff',
        fontWeight: '500',
      },
    })
  }

  // Enhanced error handling for API responses
  handleApiError(error: any, customMessage?: string) {
    let message = customMessage || 'Došlo k neočekávané chybě'

    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    } else if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          message = 'Neplatný požadavek'
          break
        case 401:
          message = 'Nemate oprávnění'
          break
        case 403:
          message = 'Přístup zamítnut'
          break
        case 404:
          message = 'Zdroj nenalezen'
          break
        case 422:
          message = 'Validační chyba'
          break
        case 500:
          message = 'Chyba serveru'
          break
        default:
          message = `Chyba ${error.response.status}`
      }
    }

    return this.error(message)
  }

  // Promise-based toasts for async operations
  async promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ): Promise<T> {
    return toast.promise(
      promise,
      {
        loading,
        success: typeof success === 'function' ? success : () => success,
        error: typeof error === 'function' ? error : () => error,
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }
    )
  }

  dismiss(toastId?: string) {
    toast.dismiss(toastId)
  }

  // Form-specific helpers
  form = {
    saving: () => this.loading('Ukládání...'),
    saved: (itemType = 'položka') => this.success(`${itemType} byla úspěšně uložena`),
    saveError: (error: any) => this.handleApiError(error, 'Nepodařilo se uložit'),
    
    deleting: () => this.loading('Mazání...'),
    deleted: (itemType = 'položka') => this.success(`${itemType} byla úspěšně smazána`),
    deleteError: (error: any) => this.handleApiError(error, 'Nepodařilo se smazat'),
    
    loading: () => this.loading('Načítání...'),
    loadError: (error: any) => this.handleApiError(error, 'Nepodařilo se načíst data'),
  }
}

export const toastService = new ToastService()
export default toastService 