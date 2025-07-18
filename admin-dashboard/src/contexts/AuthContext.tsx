import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toastService from '@/lib/toast'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          await refreshUser()
        } catch (error) {
          logout()
        }
      }
      setIsLoading(false)
    }
    
    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password
      })
      
      const { token, refreshToken, user: userData } = response.data.data
      
      // Save tokens
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Update API default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Set user data
      setUser(userData)
      
      toastService.success(`Vítejte zpět, ${userData.name}!`)
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Neplatné přihlašovací údaje'
      toastService.handleApiError(error, 'Přihlášení se nezdařilo')
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear tokens and user data
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    
    toastService.success('Byli jste úspěšně odhlášeni')
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data)
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 