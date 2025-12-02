'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@prisma/client'

/**
 * Página de login unificado para todos los roles
 */
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  /**
   * Obtener el email del usuario a partir del CI
   */
  const getEmailFromCI = async (ci: string): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('usuarios')
        .select('email')
        .eq('ci', ci)
        .single()

      if (error || !data) {
        return null
      }

      return data.email
    } catch (error) {
      console.error('Error getting email from CI:', error)
      return null
    }
  }

  /**
   * Obtener el rol del usuario
   */
  const getUserRole = async (userId: string): Promise<RolUsuario | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return data.rol as RolUsuario
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  /**
   * Redirigir según el rol del usuario
   */
  const redirectByRole = (rol: RolUsuario) => {
    const roleRoutes: Record<RolUsuario, string> = {
      CIUDADANO: '/ciudadano/dashboard',
      ABOGADO: '/abogado/dashboard',
      SECRETARIO: '/secretario/dashboard',
      JUEZ: '/juez/dashboard',
    }

    const route = roleRoutes[rol] || '/dashboard'

    // Si hay un redirect en los query params, usar ese en su lugar
    const redirectTo = searchParams?.get('redirect')
    if (redirectTo && !redirectTo.startsWith('/login')) {
      router.push(redirectTo)
    } else {
      router.push(route)
    }
  }

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      let email = data.email

      // Si el input parece un CI, buscar el email correspondiente
      const isCI = /^\d{7,8}(-[A-Z]{2,3})?$/.test(data.email)
      if (isCI) {
        const emailFromCI = await getEmailFromCI(data.email)
        if (!emailFromCI) {
          setError('No se encontró una cuenta con ese CI')
          setIsLoading(false)
          return
        }
        email = emailFromCI
      }

      // Intentar iniciar sesión
      const { data: authData, error: authError } = await signIn(email, data.password)

      if (authError) {
        const errorMessage = (authError as { message?: string })?.message
        if (errorMessage?.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos')
        } else if (errorMessage?.includes('Email not confirmed')) {
          setError('Debes confirmar tu email antes de iniciar sesión')
        } else {
          setError('Error al iniciar sesión. Intenta nuevamente.')
        }
        setIsLoading(false)
        return
      }

      const typedAuthData = authData as { user: { id: string } | null }

      if (!typedAuthData.user) {
        setError('Error al iniciar sesión')
        setIsLoading(false)
        return
      }

      // Obtener el rol del usuario
      const rol = await getUserRole(typedAuthData.user.id)

      if (!rol) {
        setError('Error al obtener información del usuario')
        setIsLoading(false)
        return
      }

      // Redirigir según el rol
      redirectByRole(rol)
    } catch (err) {
      console.error('Error en login:', err)
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Sistema Integral de Gestión Procesal Judicial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error general */}
            {error && (
              <div className="flex items-start space-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Mensaje de confirmación exitosa */}
            {searchParams?.get('confirmed') === 'true' && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                ✓ Email confirmado exitosamente. Ya puedes iniciar sesión.
              </div>
            )}

            {/* Email o CI */}
            <div className="space-y-2">
              <Label htmlFor="email">Email o Cédula de Identidad</Label>
              <Input
                id="email"
                placeholder="ejemplo@correo.com o 12345678-LP"
                {...register('email')}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/recuperar-contrasena"
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mantener sesión iniciada
              </Label>
            </div>

            {/* Botón de submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>

            {/* Link a registro */}
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full" disabled={isLoading}>
                <Link href="/registro">Registrarse como Ciudadano o Abogado</Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Si eres Secretario o Juez, contacta al administrador del sistema
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
