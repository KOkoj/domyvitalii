import axios from 'axios'
import toastService from './toast'

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
            { refreshToken }
          )

          const { token } = response.data.data
          localStorage.setItem('token', token)
          
          // Update the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          originalRequest.headers.Authorization = `Bearer ${token}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        delete api.defaults.headers.common['Authorization']
        
        // Only show error if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          toastService.error('Relace vypršela, přihlaste se znovu')
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors with improved messaging
    toastService.handleApiError(error)

    return Promise.reject(error)
  }
)

export default api 