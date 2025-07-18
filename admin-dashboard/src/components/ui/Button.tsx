import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import LoadingSpinner from './LoadingSpinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-md active:scale-95',
        destructive: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md active:scale-95',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 active:scale-95',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-sm active:scale-95',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 active:scale-95',
        link: 'text-brand-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  href?: string
  external?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, loadingText, href, external = false, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading
    const classes = cn(buttonVariants({ variant, size }), className)
    
    // If it's a link
    if (href) {
      if (external || href.startsWith('http')) {
        return (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={classes}
            {...(props as any)}
          >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {loading && loadingText ? loadingText : children}
          </a>
        )
      }
      
      return (
        <Link
          to={href}
          className={classes}
          {...(props as any)}
        >
          {loading && <LoadingSpinner size="sm" className="mr-2" />}
          {loading && loadingText ? loadingText : children}
        </Link>
      )
    }
    
    // Regular button
    return (
      <button
        className={classes}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {loading && loadingText ? loadingText : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants } 