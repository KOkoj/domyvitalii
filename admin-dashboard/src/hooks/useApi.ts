import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  User,
  Property,
  BlogPost,
  Inquiry,
  Setting,
  DashboardStats,
  ActivityItem,
  PaginatedResponse,
  ApiResponse,
} from '@/types'
import { toast } from 'react-hot-toast'

// Query keys
export const queryKeys = {
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  recentActivity: ['dashboard', 'activity'] as const,
  
  // Properties
  properties: ['properties'] as const,
  property: (id: string) => ['properties', id] as const,
  
  // Blog
  blogPosts: ['blog'] as const,
  blogPost: (id: string) => ['blog', id] as const,
  
  // Inquiries
  inquiries: ['inquiries'] as const,
  inquiry: (id: string) => ['inquiries', id] as const,
  
  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  
  // Settings
  settings: ['settings'] as const,
  
  // Search
  search: (query: string) => ['search', query] as const,
}

// Dashboard hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const response = await api.get<ApiResponse<any>>('/dashboard/stats')
        const backendData = response.data.data
        
        // Transform backend data structure to match frontend DashboardStats type
        const transformedData: DashboardStats = {
          inquiries: {
            today: backendData.stats?.inquiries?.new || 0,
            lastWeek: backendData.stats?.inquiries?.total || 0,
            trend: Math.floor(Math.random() * 20) - 10, // Mock trend data
          },
          properties: {
            active: backendData.stats?.properties?.published || 0,
            trend: Math.floor(Math.random() * 15) - 5, // Mock trend data
          },
          blogPosts: {
            draft: backendData.stats?.blogPosts?.draft || 0,
            trend: Math.floor(Math.random() * 10) - 5, // Mock trend data
          },
          pageViews: {
            thisWeek: Math.floor(Math.random() * 1000) + 500, // Mock pageViews data
            trend: Math.floor(Math.random() * 25) - 10, // Mock trend data
          }
        }
        
        return transformedData
      } catch (error) {
        // Return mock data if API fails
        return {
          inquiries: {
            today: 5,
            lastWeek: 23,
            trend: 12,
          },
          properties: {
            active: 15,
            trend: 8,
          },
          blogPosts: {
            draft: 3,
            trend: -2,
          },
          pageViews: {
            thisWeek: 1247,
            trend: 15,
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.recentActivity, limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      try {
        const response = await api.get<ApiResponse<any>>('/dashboard/stats')
        const backendData = response.data.data
        
        // Transform recent data to ActivityItem format
        const activities: ActivityItem[] = []
        
        // Add recent properties
        if (backendData.recent?.properties) {
          backendData.recent.properties.forEach((prop: any) => {
            activities.push({
              id: `prop-${prop.id}`,
              type: 'PROPERTY_CREATED',
              title: `Nová nemovitost: ${prop.title}`,
              description: `Vytvořeno uživatelem ${prop.author?.name}`,
              userId: 'user-1',
              user: { name: prop.author?.name || 'Systém', avatar: undefined },
              createdAt: prop.createdAt,
            })
          })
        }
        
        // Add recent blog posts
        if (backendData.recent?.blogPosts) {
          backendData.recent.blogPosts.forEach((post: any) => {
            activities.push({
              id: `blog-${post.id}`,
              type: 'BLOG_PUBLISHED',
              title: `Nový článek: ${post.title}`,
              description: `Publikováno uživatelem ${post.author?.name}`,
              userId: 'user-1',
              user: { name: post.author?.name || 'Systém', avatar: undefined },
              createdAt: post.createdAt,
            })
          })
        }
        
        // Add recent inquiries
        if (backendData.recent?.inquiries) {
          backendData.recent.inquiries.forEach((inquiry: any) => {
            activities.push({
              id: `inquiry-${inquiry.id}`,
              type: 'INQUIRY_RECEIVED',
              title: `Nová poptávka od ${inquiry.name}`,
              description: `Email: ${inquiry.email}`,
              userId: 'user-1',
              user: { name: 'Systém', avatar: undefined },
              createdAt: inquiry.createdAt,
            })
          })
        }
        
        // Sort by date and limit
        return activities
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
          
      } catch (error) {
        // Return mock data if API fails
        return [
          {
            id: '1',
            type: 'INQUIRY_RECEIVED',
            title: 'Nová poptávka od Jan Novák',
            description: 'Zájem o vilu v Toskánsku',
            userId: 'user-1',
            user: { name: 'Systém', avatar: undefined },
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'PROPERTY_CREATED',
            title: 'Nová nemovitost přidána',
            description: 'Vila s bazénem v Chianti',
            userId: 'user-1',
            user: { name: 'Admin', avatar: undefined },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ]
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Properties hooks
export function useProperties(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
}) {
  return useQuery({
    queryKey: [...queryKeys.properties, params],
    queryFn: async (): Promise<PaginatedResponse<Property>> => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.search) searchParams.append('search', params.search)
        if (params?.status) searchParams.append('status', params.status)
        if (params?.type) searchParams.append('type', params.type)
        
        const response = await api.get<ApiResponse<PaginatedResponse<Property>>>(
          `/properties?${searchParams.toString()}`
        )
        return response.data.data
      } catch (error) {
        console.error('Properties API error:', error)
        // Return mock data if API fails
        return {
          data: [
            {
              id: '1',
              title: 'Luxusní vila v Toskánsku',
              slug: 'luxusni-vila-v-toskansku',
              description: 'Krásná vila s výhledem na vinice v srdci Toskánska.',
              price: 850000,
              currency: 'EUR',
              type: 'VILLA',
              status: 'AVAILABLE',
              bedrooms: 4,
              bathrooms: 3,
              area: 280.5,
              yearBuilt: 1890,
              address: 'Via del Chianti 123',
              city: 'Greve in Chianti',
              region: 'Toskánsko',
              country: 'Italy',
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              images: [],
              author: { id: '1', name: 'Admin', role: 'ADMIN', email: 'admin@domyvitalii.cz', isActive: true, createdAt: '', updatedAt: '' },
              authorId: '1',
            } as Property,
            {
              id: '2',
              title: 'Moderní apartmán v Římě',
              slug: 'moderni-apartman-v-rime',
              description: 'Stylový apartmán v centru Říma, blízko Kolosea.',
              price: 450000,
              currency: 'EUR',
              type: 'APARTMENT',
              status: 'AVAILABLE',
              bedrooms: 2,
              bathrooms: 2,
              area: 95,
              yearBuilt: 2020,
              address: 'Via dei Fori Imperiali 45',
              city: 'Roma',
              region: 'Lazio',
              country: 'Italy',
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              images: [],
              author: { id: '1', name: 'Admin', role: 'ADMIN', email: 'admin@domyvitalii.cz', isActive: true, createdAt: '', updatedAt: '' },
              authorId: '1',
            } as Property,
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        }
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: async (): Promise<Property> => {
      const response = await api.get<ApiResponse<Property>>(`/properties/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Property>): Promise<Property> => {
      const response = await api.post<ApiResponse<Property>>('/properties', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      toast.success('Nemovitost byla úspěšně vytvořena')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při vytváření nemovitosti')
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }): Promise<Property> => {
      const response = await api.put<ApiResponse<Property>>(`/properties/${id}`, data)
      return response.data.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties })
      queryClient.invalidateQueries({ queryKey: queryKeys.property(id) })
      toast.success('Nemovitost byla úspěšně aktualizována')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při aktualizaci nemovitosti')
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/properties/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      toast.success('Nemovitost byla úspěšně smazána')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při mazání nemovitosti')
    },
  })
}

// Blog hooks
export function useBlogPosts(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  return useQuery({
    queryKey: [...queryKeys.blogPosts, params],
    queryFn: async (): Promise<PaginatedResponse<BlogPost>> => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.search) searchParams.append('search', params.search)
        if (params?.status) searchParams.append('status', params.status)
        
        const response = await api.get<ApiResponse<PaginatedResponse<BlogPost>>>(
          `/blog?${searchParams.toString()}`
        )
        return response.data.data
      } catch (error) {
        console.error('Blog API error:', error)
        // Return mock data if API fails
        return {
          data: [
            {
              id: '1',
              title: 'Průvodce nákupem nemovitosti v Italii',
              slug: 'pruvodce-nakupem-nemovitosti-v-italii',
              excerpt: 'Vše, co potřebujete vědět o koupi nemovitosti v Italii.',
              content: 'Komplexní průvodce...',
              family: 'PROPERTY',
              topic: 'Právo',
              tags: ['nákup', 'právní náležitosti'],
              readTime: 8,
              views: 150,
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              author: { id: '1', name: 'Admin', role: 'ADMIN', email: 'admin@domyvitalii.cz', isActive: true, createdAt: '', updatedAt: '' },
              authorId: '1',
            } as BlogPost,
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        }
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: queryKeys.blogPost(id),
    queryFn: async (): Promise<BlogPost> => {
      const response = await api.get<ApiResponse<BlogPost>>(`/blog/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<BlogPost>): Promise<BlogPost> => {
      const response = await api.post<ApiResponse<BlogPost>>('/blog', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      toast.success('Článek byl úspěšně vytvořen')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při vytváření článku')
    },
  })
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogPost> }): Promise<BlogPost> => {
      const response = await api.put<ApiResponse<BlogPost>>(`/blog/${id}`, data)
      return response.data.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPost(id) })
      toast.success('Článek byl úspěšně aktualizován')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při aktualizaci článku')
    },
  })
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/blog/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      toast.success('Článek byl úspěšně smazán')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při mazání článku')
    },
  })
}

// Inquiries hooks
export function useInquiries(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  return useQuery({
    queryKey: [...queryKeys.inquiries, params],
    queryFn: async (): Promise<PaginatedResponse<Inquiry>> => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.search) searchParams.append('search', params.search)
        if (params?.status) searchParams.append('status', params.status)
        
        const response = await api.get<ApiResponse<PaginatedResponse<Inquiry>>>(
          `/inquiries?${searchParams.toString()}`
        )
        return response.data.data
      } catch (error) {
        console.error('Inquiries API error:', error)
        // Return mock data if API fails
        return {
          data: [
            {
              id: '1',
              name: 'Jan Novák',
              email: 'jan.novak@email.cz',
              phone: '+420 606 123 456',
              message: 'Zajímá mě vila v Toskánsku.',
              type: 'PROPERTY',
              status: 'NEW',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Inquiry,
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        }
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useInquiry(id: string) {
  return useQuery({
    queryKey: queryKeys.inquiry(id),
    queryFn: async (): Promise<Inquiry> => {
      const response = await api.get<ApiResponse<Inquiry>>(`/inquiries/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useUpdateInquiry() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inquiry> }): Promise<Inquiry> => {
      const response = await api.put<ApiResponse<Inquiry>>(`/inquiries/${id}`, data)
      return response.data.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiries })
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiry(id) })
      toast.success('Poptávka byla úspěšně aktualizována')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při aktualizaci poptávky')
    },
  })
}

// Users hooks
export function useUsers(params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
}) {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.role) searchParams.append('role', params.role)
      
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
        `/users?${searchParams.toString()}`
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async (): Promise<User> => {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<User>): Promise<User> => {
      const response = await api.post<ApiResponse<User>>('/users', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('Uživatel byl úspěšně vytvořen')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při vytváření uživatele')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }): Promise<User> => {
      const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
      return response.data.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
      toast.success('Uživatel byl úspěšně aktualizován')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při aktualizaci uživatele')
    },
  })
}

// Settings hooks
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async (): Promise<Setting[]> => {
      const response = await api.get<ApiResponse<Setting[]>>('/settings')
      return response.data.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: Record<string, any>): Promise<Setting[]> => {
      const response = await api.put<ApiResponse<Setting[]>>('/settings', settings)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      toast.success('Nastavení bylo úspěšně uloženo')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chyba při ukládání nastavení')
    },
  })
} 