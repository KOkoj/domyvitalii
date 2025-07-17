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
      const response = await api.get<ApiResponse<any>>('/dashboard/stats')
      const backendData = response.data.data
      
      // Transform backend data structure to match frontend DashboardStats type
      const transformedData: DashboardStats = {
        inquiries: {
          today: backendData.stats?.inquiries?.new || 0,
          lastWeek: backendData.stats?.inquiries?.total || 0,
          trend: backendData.stats?.inquiries?.trend || 0,
        },
        properties: {
          active: backendData.stats?.properties?.published || 0,
          trend: backendData.stats?.properties?.trend || 0,
        },
        blogPosts: {
          draft: backendData.stats?.blogPosts?.draft || 0,
          trend: backendData.stats?.blogPosts?.trend || 0,
        },
        pageViews: {
          thisWeek: backendData.stats?.pageViews?.thisWeek || 0,
          trend: backendData.stats?.pageViews?.trend || 0,
        }
      }
      
      return transformedData
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.recentActivity, limit],
    queryFn: async (): Promise<ActivityItem[]> => {
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
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.status) searchParams.append('status', params.status)
      
      const response = await api.get<ApiResponse<PaginatedResponse<BlogPost>>>(
        `/blog?${searchParams.toString()}`
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.status) searchParams.append('status', params.status)
      
      const response = await api.get<ApiResponse<PaginatedResponse<Inquiry>>>(
        `/inquiries?${searchParams.toString()}`
      )
      return response.data.data
    },
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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