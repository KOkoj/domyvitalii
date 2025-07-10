// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Property types
export interface Property {
  id: string
  title: string
  slug: string
  description: string
  price: number
  currency: string
  type: string
  status: 'AVAILABLE' | 'SOLD' | 'RENTED' | 'DRAFT'
  bedrooms?: number
  bathrooms?: number
  area?: number
  lotSize?: number
  yearBuilt?: number
  features?: string[]
  address: string
  city: string
  region: string
  postalCode?: string
  country: string
  latitude?: number
  longitude?: number
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  images: PropertyImage[]
  author: User
  authorId: string
}

export interface PropertyImage {
  id: string
  url: string
  publicId: string
  alt?: string
  caption?: string
  isPrimary: boolean
  order: number
  createdAt: string
}

// Blog types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  coverImagePublicId?: string
  family: string
  topic: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
  publishedAt?: string
  readTime?: number
  views: number
  createdAt: string
  updatedAt: string
  author: User
  authorId: string
}

// Inquiry types
export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  type: 'PROPERTY' | 'GENERAL'
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED'
  source?: string
  property?: Property
  propertyId?: string
  createdAt: string
  updatedAt: string
}

// Settings types
export interface Setting {
  id: string
  key: string
  value: string
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
  createdAt: string
  updatedAt: string
}

// Dashboard types
export interface DashboardStats {
  inquiries: {
    today: number
    lastWeek: number
    trend: number
  }
  properties: {
    active: number
    trend: number
  }
  blogPosts: {
    draft: number
    trend: number
  }
  pageViews: {
    thisWeek: number
    trend: number
  }
}

export interface ActivityItem {
  id: string
  type: 'PROPERTY_CREATED' | 'BLOG_PUBLISHED' | 'INQUIRY_RECEIVED' | 'USER_REGISTERED'
  title: string
  description: string
  userId: string
  user: Pick<User, 'name' | 'avatar'>
  createdAt: string
}

// Table types
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  className?: string
}

export interface TableState {
  sorting: Array<{ id: string; desc: boolean }>
  columnFilters: Array<{ id: string; value: unknown }>
  globalFilter: string
  pagination: { pageIndex: number; pageSize: number }
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'multiselect' | 'file' | 'checkbox' | 'radio'
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: Record<string, any>
}

// Theme types
export type Theme = 'light' | 'dark'

// Navigation types
export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
  children?: NavItem[]
  badge?: number
}

// Search types
export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'property' | 'blog' | 'inquiry' | 'user'
  url: string
  image?: string
}

// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
} 