'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signIn, signUp, signOut, getSession } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Get initial session with timeout
    const initializeAuth = async () => {
      console.log('[Auth] Starting initialization...')
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )

        console.log('[Auth] Calling getSession...')
        const sessionPromise = getSession()
        const currentSession = await Promise.race([sessionPromise, timeoutPromise])
        console.log('[Auth] Session result:', currentSession ? 'found' : 'none')

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error('[Auth] Error getting session:', error)
        // On timeout or error, assume no session
        setSession(null)
        setUser(null)
      } finally {
        console.log('[Auth] Setting loading to false')
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event)
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (!error) {
      router.push('/')
    }
    return { error: error as Error | null }
  }

  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await signUp(email, password)
    if (error) {
      return { error: error as Error, needsConfirmation: false }
    }
    // Check if email confirmation is required
    const needsConfirmation = !data.session && !!data.user
    if (!needsConfirmation && data.session) {
      router.push('/')
    }
    return { error: null, needsConfirmation }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }

  // Prevent hydration mismatch - don't render until mounted on client
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wardrobe-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
