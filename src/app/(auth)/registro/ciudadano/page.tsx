'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { ciudadanoRegistroSchema, type CiudadanoRegistroInput } from '@/lib/validations/ciudadano'
import { createClient } from '@/lib/supabase/client'

/**
 * Página de registro para Ciudadanos
 */
export default function RegistroCiudadanoPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CiudadanoRegistroInput>({
    resolver: zodResolver(ciudadanoRegistroSchema),
  })

  const onSubmit = async (data: CiudadanoRegistroInput) => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await signUp(data.email, data.password, {
        nombres: data.nombres,
        apellidos: data.apellidos,
      })

      if (authError || !authData) {
        setError((authError as { message?: string })?.message || 'Error al crear la cuenta')
        setIsLoading(false)
        return
      }

      const typedAuthData = authData as { user: { id: string } | null }

      if (!typedAuthData.user) {
        setError('Error al crear el usuario')
        setIsLoading(false)
        return
      }

      // 2. Crear registro en tabla usuarios con rol CIUDADANO
      const supabase = createClient()
      const { error: dbError } = await supabase.from('usuarios').insert({
        id: typedAuthData.user.id,
        email: data.email,
        nombres: data.nombres,
        apellidos: data.apellidos,
        ci: data.ci,
        telefono: data.telefono,
        domicilio: data.domicilio,
        rol: 'CIUDADANO',
      })

      if (dbError) {
        console.error('Error al crear usuario en BD:', dbError)
        setError('Error al completar el registro. Por favor contacta a soporte.')
        setIsLoading(false)
        return
      }

      // 3. Redirigir a confirmación de email
      router.push('/registro/confirmacion?email=' + encodeURIComponent(data.email))
    } catch (err) {
      console.error('Error en registro:', err)
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Link
            href="/registro"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a selección
          </Link>
          <CardTitle className="text-3xl">Registro de Ciudadano</CardTitle>
          <CardDescription>
            Completa el formulario para crear tu cuenta en el Sistema Integral de Gestión Procesal
            Judicial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error general */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* CI */}
            <div className="space-y-2">
              <Label htmlFor="ci">
                Cédula de Identidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ci"
                placeholder="12345678-LP"
                {...register('ci')}
                disabled={isLoading}
              />
              {errors.ci && <p className="text-sm text-destructive">{errors.ci.message}</p>}
              <p className="text-xs text-muted-foreground">
                Formato: 12345678-LP (número-departamento)
              </p>
            </div>

            {/* Nombres */}
            <div className="space-y-2">
              <Label htmlFor="nombres">
                Nombres <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombres"
                placeholder="Juan Carlos"
                {...register('nombres')}
                disabled={isLoading}
              />
              {errors.nombres && (
                <p className="text-sm text-destructive">{errors.nombres.message}</p>
              )}
            </div>

            {/* Apellidos */}
            <div className="space-y-2">
              <Label htmlFor="apellidos">
                Apellidos <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apellidos"
                placeholder="Pérez García"
                {...register('apellidos')}
                disabled={isLoading}
              />
              {errors.apellidos && (
                <p className="text-sm text-destructive">{errors.apellidos.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <Input
                id="telefono"
                placeholder="+59170123456"
                {...register('telefono')}
                disabled={isLoading}
              />
              {errors.telefono && (
                <p className="text-sm text-destructive">{errors.telefono.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: +591 seguido de 8 dígitos
              </p>
            </div>

            {/* Domicilio */}
            <div className="space-y-2">
              <Label htmlFor="domicilio">
                Domicilio <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="domicilio"
                placeholder="Av. Principal #123, Zona Centro, La Paz"
                rows={3}
                {...register('domicilio')}
                disabled={isLoading}
              />
              {errors.domicilio && (
                <p className="text-sm text-destructive">{errors.domicilio.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
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
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Botón de submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>

            {/* Link a login */}
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
