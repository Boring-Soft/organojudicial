'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

/**
 * Página para establecer nueva contraseña después de solicitar reset
 * El usuario llega aquí desde el enlace en el email
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // Verificar que hay una sesión válida de reset
    const verifyResetToken = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setTokenValid(true)
        } else {
          setError('El enlace de recuperación ha expirado o no es válido')
          setTokenValid(false)
        }
      } catch (err) {
        console.error('Error verifying token:', err)
        setError('Error al verificar el enlace de recuperación')
        setTokenValid(false)
      } finally {
        setValidatingToken(false)
      }
    }

    verifyResetToken()
  }, [])

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        console.error('Error updating password:', updateError)
        setError('Error al actualizar la contraseña. Por favor intenta nuevamente.')
        setIsLoading(false)
        return
      }

      setSuccess(true)

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 3000)
    } catch (err) {
      console.error('Error en reset:', err)
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Validando token
  if (validatingToken) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verificando enlace de recuperación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Enlace inválido</CardTitle>
            <CardDescription>
              El enlace de recuperación ha expirado o no es válido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm text-left">
              <p className="font-semibold">Posibles razones:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
                <li>El enlace ha expirado (válido por 1 hora)</li>
                <li>Ya usaste este enlace anteriormente</li>
                <li>El enlace está incompleto o mal formado</li>
              </ul>
            </div>

            <Button asChild className="w-full">
              <Link href="/recuperar-contrasena">
                Solicitar nuevo enlace de recuperación
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Volver a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vista de éxito
  if (success) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Contraseña actualizada</CardTitle>
            <CardDescription>
              Tu contraseña ha sido cambiada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="text-muted-foreground">
                Serás redirigido a la página de inicio de sesión en unos segundos...
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href="/login">Ir a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulario de nueva contraseña
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error general */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Nueva Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, una mayúscula, una minúscula y un número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Info de seguridad */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold">Requisitos de contraseña:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos un número</li>
              </ul>
            </div>

            {/* Botón de submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
