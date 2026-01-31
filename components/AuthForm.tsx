'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (email: string, password: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const handleFormSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onSubmit(data.email, data.password)
      if (result.error) {
        setError(result.error.message)
      } else if (result.needsConfirmation) {
        setNeedsConfirmation(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-soft mb-4">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Check your email</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          We've sent you a confirmation link. Please check your email to verify your account.
        </p>
        <Link href="/login" className="text-wardrobe-600 dark:text-wardrobe-400 hover:text-wardrobe-700 dark:hover:text-wardrobe-300 font-medium transition-colors">
          Return to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm shadow-soft">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="input-field"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            {...register('password')}
            className="input-field pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary flex items-center justify-center min-h-[44px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {mode === 'login' ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          mode === 'login' ? 'Sign in' : 'Create account'
        )}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <Link href="/signup" className="text-wardrobe-600 dark:text-wardrobe-400 hover:text-wardrobe-700 dark:hover:text-wardrobe-300 font-medium transition-colors">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-wardrobe-600 dark:text-wardrobe-400 hover:text-wardrobe-700 dark:hover:text-wardrobe-300 font-medium transition-colors">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
