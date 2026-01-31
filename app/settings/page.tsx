'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Sun, Moon, Monitor, Bell, Shield, Trash2, Download, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyDigest: true,
  })

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme === 'system' ? 'system default' : newTheme}`)
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Notification preferences updated')
  }

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email shortly.')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not yet implemented')
    }
  }

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
              Manage your account and application preferences.
            </p>
          </div>

          <div className="space-y-6">
            {/* Appearance Section */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-wardrobe-500 to-wardrobe-600 text-white">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customize how the app looks</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = theme === option.value
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleThemeChange(option.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-wardrobe-500 bg-wardrobe-50 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-wardrobe-600 dark:text-wardrobe-400' : ''}`} />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage how you receive updates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-wardrobe-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      notifications.email ? 'bg-wardrobe-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.email ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications on your device</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-wardrobe-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      notifications.push ? 'bg-wardrobe-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.push ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Weekly Digest</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive a weekly summary of your wardrobe activity</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('weeklyDigest')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-wardrobe-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      notifications.weeklyDigest ? 'bg-wardrobe-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account settings</p>
                </div>
              </div>

              <div className="space-y-4">
                {user && (
                  <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExportData}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export My Data
                  </button>

                  <button
                    onClick={() => signOut()}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-200 dark:border-red-900/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Danger Zone</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Irreversible actions</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="btn-danger"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
