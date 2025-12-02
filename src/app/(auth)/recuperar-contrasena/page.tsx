'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordRequestSchema, type ResetPasswordRequestInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

/**
 * Página para solicitar recuperación de contraseña
 */
export default function RecuperarContrasenaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  })

  const onSubmit = async (data: ResetPasswordRequestInput) => {
    setIsLoading(true)
    setError(null)
    setEmail(data.email)

    try {
      const supabase = createClient()

      // Enviar email de recuperación
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        console.error('Error sending reset email:', resetError)
        // No revelar si el email existe o no por seguridad
        setError(
          'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña'
        )
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error('Error en recuperación:', err)
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-2xl">Revisa tu correo</CardTitle>
            <CardDescription>
              Hemos enviado instrucciones de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="font-medium text-primary">{email}</p>

            <div className="rounded-lg bg-muted p-4 text-left text-sm">
              <p className="mb-2 font-semibold">Próximos pasos:</p>
              <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
                <li>Revisa tu bandeja de entrada</li>
                <li>Busca el correo de SIGPJ Bolivia</li>
                <li>Haz clic en el enlace de recuperación</li>
                <li>Crea una nueva contraseña</li>
              </ol>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left text-sm">
              <p className="font-semibold text-yellow-800">No encuentras el email?</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-yellow-700">
                <li>Revisa tu carpeta de spam</li>
                <li>El email puede tardar unos minutos</li>
                <li>El enlace expira en 1 hora</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Iniciar Sesión
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                Intentar con otro email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vista de formulario
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link
            href="/login"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                {...register('email')}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ingresa el email que usaste para registrarte
              </p>
            </div>

            {/* Botón de submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
            </Button>

            {/* Info adicional */}
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Importante:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li>El enlace de recuperación expira en 1 hora</li>
                <li>Solo puedes solicitar un reset cada 60 segundos</li>
                <li>Si no tienes acceso a tu email, contacta a soporte</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
