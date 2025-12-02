'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@prisma/client'

interface AuthUser extends User {
  rol?: RolUsuario
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: unknown; data: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: unknown; data: unknown }>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<AuthUser | null>
  getUserRole: () => RolUsuario | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de autenticación para la aplicación
 * Maneja el estado del usuario y proporciona funciones de auth
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const userWithRole = await fetchUserRole(session.user)
          setUser(userWithRole)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userWithRole = await fetchUserRole(session.user)
        setUser(userWithRole)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Obtener el rol del usuario desde la base de datos
   */
  const fetchUserRole = async (user: User): Promise<AuthUser> => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      return { ...user, rol: data?.rol }
    } catch (error) {
      console.error('Error fetching user role:', error)
      return user
    }
  }

  /**
   * Registro de nuevo usuario
   */
  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Inicio de sesión
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  /**
   * Obtener usuario actual
   */
  const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return await fetchUserRole(user)
      }

      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Obtener rol del usuario actual
   */
  const getUserRole = (): RolUsuario | null => {
    return user?.rol || null
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
