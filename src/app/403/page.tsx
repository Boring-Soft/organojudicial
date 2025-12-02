'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { RolUsuario } from '@prisma/client'

/**
 * Página 403 - Acceso Denegado
 * Se muestra cuando un usuario intenta acceder a una ruta sin los permisos necesarios
 */
export default function AccessDeniedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, getUserRole } = useAuth()
  const [userRole, setUserRole] = useState<RolUsuario | null>(null)

  const fromPath = searchParams?.get('from') || ''

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
  }, [getUserRole])

  const getDashboardPath = () => {
    if (!userRole) return '/login'

    const dashboardPaths: Record<RolUsuario, string> = {
      CIUDADANO: '/ciudadano/dashboard',
      ABOGADO: '/abogado/dashboard',
      SECRETARIO: '/secretario/dashboard',
      JUEZ: '/juez/dashboard',
    }

    return dashboardPaths[userRole] || '/login'
  }

  const getRoleName = (rol: RolUsuario) => {
    const roleNames: Record<RolUsuario, string> = {
      CIUDADANO: 'Ciudadano',
      ABOGADO: 'Abogado',
      SECRETARIO: 'Secretario',
      JUEZ: 'Juez',
    }

    return roleNames[rol] || rol
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del intento de acceso */}
          {fromPath && (
            <div className="rounded-lg bg-muted p-4 text-left text-sm">
              <p className="font-semibold text-foreground">
                Intentaste acceder a:
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
                {fromPath}
              </p>
            </div>
          )}

          {/* Información del usuario */}
          {user && userRole && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left text-sm">
              <p className="font-semibold text-yellow-800">Tu rol actual:</p>
              <p className="mt-1 text-yellow-700">
                <span className="font-medium">{getRoleName(userRole)}</span>
              </p>
              <p className="mt-2 text-xs text-yellow-600">
                Esta página está restringida para tu nivel de acceso.
              </p>
            </div>
          )}

          {/* Razones comunes */}
          <div className="rounded-lg bg-muted p-4 text-left text-sm">
            <p className="font-semibold text-foreground">Razones comunes:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
              <li>La página requiere un rol diferente al tuyo</li>
              <li>Necesitas permisos especiales para esta acción</li>
              <li>El enlace puede estar desactualizado o ser incorrecto</li>
              <li>Puede haber un error en la configuración de permisos</li>
            </ul>
          </div>

          {/* Acciones disponibles */}
          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href={getDashboardPath()}>
                <Home className="mr-2 h-4 w-4" />
                Ir a Mi Dashboard
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver Atrás
            </Button>
          </div>

          {/* Información de contacto */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              Si crees que deberías tener acceso a esta página,{' '}
              <Link href="/soporte" className="text-primary hover:underline">
                contacta al soporte técnico
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
