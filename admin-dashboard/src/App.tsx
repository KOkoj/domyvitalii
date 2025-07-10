import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyFormPage from './pages/PropertyFormPage'
import BlogPage from './pages/BlogPage'
import BlogFormPage from './pages/BlogFormPage'
import InquiriesPage from './pages/InquiriesPage'
import InquiryDetailPage from './pages/InquiryDetailPage'
import UsersPage from './pages/UsersPage'
import SettingsPage from './pages/SettingsPage'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public Route wrapper (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Properties */}
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/new" element={<PropertyFormPage />} />
        <Route path="properties/:id/edit" element={<PropertyFormPage />} />
        
        {/* Blog */}
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/new" element={<BlogFormPage />} />
        <Route path="blog/:id/edit" element={<BlogFormPage />} />
        
        {/* Inquiries */}
        <Route path="inquiries" element={<InquiriesPage />} />
        <Route path="inquiries/:id" element={<InquiryDetailPage />} />
        
        {/* Users (Admin only) */}
        <Route path="users" element={<UsersPage />} />
        
        {/* Settings (Admin only) */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Catch all - redirect to dashboard if authenticated, login if not */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App 