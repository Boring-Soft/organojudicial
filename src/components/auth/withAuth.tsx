'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { RolUsuario } from '@prisma/client'

interface WithAuthOptions {
  requiredRole?: RolUsuario | RolUsuario[]
  redirectTo?: string
}

/**
 * HOC para proteger páginas que requieren autenticación
 * @param Component - Componente a proteger
 * @param options - Opciones de configuración (rol requerido, redirección)
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, getUserRole } = useAuth()
    const router = useRouter()
    const { requiredRole, redirectTo = '/login' } = options

    useEffect(() => {
      if (!loading) {
        // Si no hay usuario, redirigir al login
        if (!user) {
          router.push(redirectTo)
          return
        }

        // Si se requiere un rol específico
        if (requiredRole) {
          const currentRole = getUserRole()
          const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

          if (!currentRole || !requiredRoles.includes(currentRole)) {
            // Redirigir al dashboard del rol del usuario
            const dashboardRoutes: Record<RolUsuario, string> = {
              CIUDADANO: '/ciudadano',
              ABOGADO: '/abogado',
              SECRETARIO: '/secretario',
              JUEZ: '/juez',
            }

            const userDashboard = currentRole ? dashboardRoutes[currentRole] : '/login'
            router.push(userDashboard)
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, router])

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      )
    }

    // Si no hay usuario, no renderizar nada (se está redirigiendo)
    if (!user) {
      return null
    }

    // Si se requiere un rol y no coincide, no renderizar
    if (requiredRole) {
      const currentRole = getUserRole()
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

      if (!currentRole || !requiredRoles.includes(currentRole)) {
        return null
      }
    }

    // Renderizar el componente protegido
    return <Component {...props} />
  }
}
