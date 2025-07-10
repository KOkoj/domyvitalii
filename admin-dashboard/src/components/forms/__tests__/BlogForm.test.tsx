import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { BlogForm } from '../BlogForm'
import '@testing-library/jest-dom'

// Mock the API hooks
jest.mock('@/hooks/useApi', () => ({
  useBlogPost: jest.fn(() => ({ 
    data: null, 
    isLoading: false 
  })),
  useCreateBlogPost: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useUpdateBlogPost: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('BlogForm', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    expect(screen.getByLabelText(/titulek/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/url slug/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stav/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kategorie/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/perex/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/obsah/i)).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /vytvořit článek/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/titulek musí mít alespoň 5 znaků/i)).toBeInTheDocument()
      expect(screen.getByText(/url slug je příliš krátký/i)).toBeInTheDocument()
      expect(screen.getByText(/perex musí mít alespoň 20 znaků/i)).toBeInTheDocument()
      expect(screen.getByText(/obsah musí mít alespoň 100 znaků/i)).toBeInTheDocument()
    })
  })

  it('auto-generates slug from title', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    const titleInput = screen.getByLabelText(/titulek/i)
    const slugInput = screen.getByLabelText(/url slug/i)

    await user.type(titleInput, 'Objevte krásy Toskánska')

    await waitFor(() => {
      expect(slugInput).toHaveValue('objevte-krasy-toskanska')
    })
  })

  it('updates SEO preview based on form values', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    const titleInput = screen.getByLabelText(/titulek/i)
    const excerptTextarea = screen.getByLabelText(/perex/i)

    await user.type(titleInput, 'Test článek')
    await user.type(excerptTextarea, 'Toto je testovací perex článku pro SEO náhled.')

    await waitFor(() => {
      expect(screen.getByText('Test článek')).toBeInTheDocument()
      expect(screen.getByText('Toto je testovací perex článku pro SEO náhled.')).toBeInTheDocument()
    })
  })

  it('validates excerpt character limit', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    const excerptTextarea = screen.getByLabelText(/perex/i)
    const longText = 'a'.repeat(301) // Exceeds 300 character limit

    await user.type(excerptTextarea, longText)

    await waitFor(() => {
      expect(screen.getByText('301/300 znaků')).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    const cancelButton = screen.getByRole('button', { name: /zrušit/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('parses and displays tags correctly', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    const tagsInput = screen.getByPlaceholderText(/cestování, toskánsko/i)
    
    await user.type(tagsInput, 'cestování, itálie, toskánsko')

    // The tags should be processed and displayed
    await waitFor(() => {
      expect(tagsInput).toHaveValue('cestování, itálie, toskánsko')
    })
  })

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    
    const mockMutateAsync = jest.fn(() => new Promise(resolve => 
      setTimeout(resolve, 100)
    ))
    
    // Mock the mutation to return our delayed promise
    require('@/hooks/useApi').useCreateBlogPost.mockReturnValue({
      mutateAsync: mockMutateAsync,
    })
    
    render(
      <Wrapper>
        <BlogForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </Wrapper>
    )

    // Fill in required fields
    await user.type(screen.getByLabelText(/titulek/i), 'Test článek pro submission')
    await user.type(screen.getByLabelText(/perex/i), 'Toto je testovací perex článku který má dostatečně znaků.')
    await user.type(screen.getByLabelText(/obsah/i), 'Toto je obsah článku který má dostatečně znaků pro validaci a úspěšné odeslání formuláře.')
    
    // Select category
    const categorySelect = screen.getByLabelText(/kategorie/i)
    await user.selectOptions(categorySelect, 'travel')

    const submitButton = screen.getByRole('button', { name: /vytvořit článek/i })
    await user.click(submitButton)

    // Should show loading state
    expect(screen.getByText(/vytváření.../i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
}) 