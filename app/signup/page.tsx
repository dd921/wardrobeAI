'use client'

import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/AuthForm'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignupPage() {
  const { user, loading, signUp } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wardrobe-600"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-wardrobe-600 to-wardrobe-500 bg-clip-text text-transparent">
            Wardrobe AI
          </h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Start organizing your wardrobe today
          </p>
        </div>

        <div className="card">
          <AuthForm
            mode="signup"
            onSubmit={signUp}
          />
        </div>
      </div>
    </div>
  )
}
