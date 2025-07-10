import React, { createContext, useContext, useEffect, useState } from 'react'

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

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    role: 'ADMIN' as const
  },
  {
    id: '2',
    email: 'manager@example.com',
    password: 'password',
    name: 'Property Manager',
    role: 'MANAGER' as const
  },
  {
    id: '3',
    email: 'employee@example.com',
    password: 'password',
    name: 'Content Creator',
    role: 'EMPLOYEE' as const
  }
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Find user in mock data
      const mockUser = MOCK_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      
      if (!mockUser) {
        throw new Error('Invalid credentials')
      }
      
      const userData: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      }
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear user data
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = async () => {
    // For mock implementation, just check localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        logout()
      }
    }
    setIsLoading(false)
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