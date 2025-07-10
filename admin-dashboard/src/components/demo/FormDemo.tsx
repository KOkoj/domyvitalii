import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { BlogForm } from '@/components/forms/BlogForm'
import { InquiryForm } from '@/components/forms/InquiryForm'
import { SimpleUserForm } from '@/components/forms/SimpleUserForm'

type FormType = 'property' | 'blog' | 'inquiry' | 'user' | null

export const FormDemo: React.FC = () => {
  const [activeForm, setActiveForm] = useState<FormType>(null)

  const handleSuccess = () => {
    alert('Form submitted successfully!')
    setActiveForm(null)
  }

  const handleCancel = () => {
    setActiveForm(null)
  }

  if (activeForm) {
    switch (activeForm) {
      case 'property':
        return <PropertyForm onSuccess={handleSuccess} onCancel={handleCancel} />
      case 'blog':
        return <BlogForm onSuccess={handleSuccess} onCancel={handleCancel} />
      case 'inquiry':
        return <InquiryForm onSuccess={handleSuccess} onCancel={handleCancel} />
      case 'user':
        return <SimpleUserForm onSuccess={handleSuccess} onCancel={handleCancel} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">CRUD Forms Demo</h1>
        <p className="mt-2 text-gray-600">
          Click on any button below to test the fully functional forms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Property Form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Property Form
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Multi-step wizard with basic info, details, media upload, and SEO
            </p>
            <Button
              onClick={() => setActiveForm('property')}
              className="w-full"
            >
              Create Property
            </Button>
          </div>
        </div>

        {/* Blog Form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Blog Form
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Rich content editor with SEO preview and auto-slug generation
            </p>
            <Button
              onClick={() => setActiveForm('blog')}
              className="w-full"
            >
              Create Article
            </Button>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inquiry Form
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Customer inquiry management with status and assignment
            </p>
            <Button
              onClick={() => setActiveForm('inquiry')}
              className="w-full"
            >
              View Inquiry
            </Button>
          </div>
        </div>

        {/* User Form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Form
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              User account management with roles and permissions
            </p>
            <Button
              onClick={() => setActiveForm('user')}
              className="w-full"
            >
              Create User
            </Button>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ✅ Implemented Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Form Infrastructure</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React Hook Form + Zod validation</li>
              <li>• Reusable UI components (Input, Select, FileUploader)</li>
              <li>• Multi-step FormWizard component</li>
              <li>• Error handling & success toasts</li>
              <li>• Loading states & form submission</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Advanced Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Image upload with drag & drop</li>
              <li>• SEO preview for content</li>
              <li>• Auto-slug generation</li>
              <li>• Responsive design</li>
              <li>• Czech localization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 