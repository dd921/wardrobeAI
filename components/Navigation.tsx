'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Shirt,
  Tags,
  Heart,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'My Wardrobe', href: '/wardrobe', icon: Shirt },
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'Outfits', href: '/outfits', icon: Heart },
  { name: 'Statistics', href: '/stats', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-glass">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-wardrobe-600 to-wardrobe-500 bg-clip-text text-transparent">
              Wardrobe AI
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="px-4 pb-4 flex flex-col h-[calc(100%-4rem)]">
            <ul className="space-y-1 flex-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                      pathname === item.href
                        ? 'bg-gradient-to-r from-wardrobe-50 to-wardrobe-100/50 dark:from-wardrobe-900/50 dark:to-wardrobe-800/30 text-wardrobe-700 dark:text-wardrobe-300 border-l-2 border-wardrobe-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-1'
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile User Menu */}
            {user && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center px-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-wardrobe-400 to-wardrobe-600 flex items-center justify-center shadow-inner-soft">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    signOut()
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 min-h-[44px]"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 pb-4">
          <div className="flex h-16 items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-wardrobe-600 to-wardrobe-500 bg-clip-text text-transparent">
              Wardrobe AI
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                          pathname === item.href
                            ? 'bg-gradient-to-r from-wardrobe-50 to-wardrobe-100/50 dark:from-wardrobe-900/50 dark:to-wardrobe-800/30 text-wardrobe-700 dark:text-wardrobe-300 border-l-2 border-wardrobe-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-1'
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto space-y-3">
                <Link
                  href="/add-item"
                  className="flex items-center justify-center w-full px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-wardrobe-600 to-wardrobe-500 rounded-xl shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Link>

                {/* User Menu */}
                {user && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center px-3 py-2">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-wardrobe-400 to-wardrobe-600 flex items-center justify-center shadow-inner-soft">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-x-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 shadow-soft lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 bg-gradient-to-r from-wardrobe-600 to-wardrobe-500 bg-clip-text text-transparent">
          Wardrobe AI
        </div>
        <Link
          href="/add-item"
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-wardrobe-600 to-wardrobe-500 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Link>
      </div>
    </>
  )
}
