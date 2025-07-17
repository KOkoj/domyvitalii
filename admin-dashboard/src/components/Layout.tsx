import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition, Dialog } from '@headlessui/react'
import { Fragment } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import ProductionTestingWidget from './ProductionTestingWidget'
import type { NavItem } from '@/types'

// Navigation items
const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Nemovitosti', href: '/properties', icon: BuildingOfficeIcon },
  { name: 'Blog', href: '/blog', icon: DocumentTextIcon },
  { name: 'Poptávky', href: '/inquiries', icon: EnvelopeIcon, badge: 3 },
  { name: 'Uživatelé', href: '/users', icon: UsersIcon },
  { name: 'Nastavení', href: '/settings', icon: Cog6ToothIcon },
]

// Theme hook
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = stored || (prefersDark ? 'dark' : 'light')
    
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return { theme, toggleTheme }
}

// Breadcrumbs component
function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    properties: 'Nemovitosti',
    blog: 'Blog',
    inquiries: 'Poptávky',
    users: 'Uživatelé',
    settings: 'Nastavení',
    new: 'Nový',
    edit: 'Upravit',
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-500">
            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1
          const to = `/${pathnames.slice(0, index + 1).join('/')}`

          return (
            <li key={to}>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                {last ? (
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    {breadcrumbNameMap[value] || value}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {breadcrumbNameMap[value] || value}
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Global search component
function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (url: string) => {
    setOpen(false)
    setQuery('')
    navigate(url)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-gray-500 sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
        Hledat...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          ⌘K
        </kbd>
      </Button>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Hledat nemovitosti, články, uživatele..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                  
                  {query && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-gray-500 px-2">Výsledky</div>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleSelect('/properties')}
                          className="w-full text-left px-2 py-2 rounded hover:bg-gray-100"
                        >
                          <div className="font-medium">Nemovitosti</div>
                          <div className="text-sm text-gray-500">Spravovat nemovitosti</div>
                        </button>
                        <button
                          onClick={() => handleSelect('/blog')}
                          className="w-full text-left px-2 py-2 rounded hover:bg-gray-100"
                        >
                          <div className="font-medium">Blog</div>
                          <div className="text-sm text-gray-500">Spravovat články</div>
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

// Main Layout component
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Update navigation current state
  const currentNavigation = navigation.map((item) => ({
    ...item,
    current: location.pathname.startsWith(item.href),
  }))

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                {/* Mobile Navigation */}
                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img className="h-8 w-auto" src="/logo.svg" alt="Domy v Italii" />
                  </div>
                  <nav className="mt-5 space-y-1 px-2">
                    {currentNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          item.current
                            ? 'bg-brand-100 text-brand-900 dark:bg-brand-900 dark:text-brand-100'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={cn(
                            item.current
                              ? 'text-brand-500 dark:text-brand-400'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                            'mr-4 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-1 flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img className="h-8 w-auto" src="/logo.svg" alt="Domy v Italii" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Admin
              </span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {currentNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    item.current
                      ? 'bg-brand-100 text-brand-900 dark:bg-brand-900 dark:text-brand-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <item.icon
                    className={cn(
                      item.current
                        ? 'text-brand-500 dark:text-brand-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="border-r border-gray-200 pr-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Breadcrumbs */}
              <div className="hidden md:block ml-4">
                <Breadcrumbs />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Global search */}
              <GlobalSearch />

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden sm:inline-flex"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <BellIcon className="h-5 w-5" />
              </Button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                  {user?.avatar ? (
                    <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={cn(
                            active ? 'bg-gray-100 dark:bg-gray-700' : '',
                            'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                          )}
                        >
                          Nastavení
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={cn(
                            active ? 'bg-gray-100 dark:bg-gray-700' : '',
                            'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                          )}
                        >
                          Odhlásit se
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Production Testing Widget */}
      <ProductionTestingWidget />
    </div>
  )
} 