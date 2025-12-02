'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { secretarioRegistroSchema, type SecretarioRegistroInput } from '@/lib/validations/secretario'
import { createClient } from '@/lib/supabase/client'

interface CrearSecretarioFormProps {
  onSuccess: () => void
}

/**
 * Formulario para crear un nuevo Secretario
 * Solo accesible por administradores
 */
export default function CrearSecretarioForm({ onSuccess }: CrearSecretarioFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SecretarioRegistroInput>({
    resolver: zodResolver(secretarioRegistroSchema),
  })

  const onSubmit = async (data: SecretarioRegistroInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nombres: data.nombres,
            apellidos: data.apellidos,
          },
        },
      })

      if (authError || !authData.user) {
        setError(authError?.message || 'Error al crear la cuenta de autenticación')
        setIsLoading(false)
        return
      }

      // 2. Crear registro en tabla usuarios con rol SECRETARIO
      const { error: dbError } = await supabase.from('usuarios').insert({
        userId: authData.user.id,
        email: data.email,
        nombres: data.nombres,
        apellidos: data.apellidos,
        ci: data.ci,
        telefono: data.telefono,
        juzgado: data.juzgado,
        rol: 'SECRETARIO',
        activo: true,
      })

      if (dbError) {
        console.error('Error al crear secretario en BD:', dbError)
        setError('Error al completar el registro del secretario')
        setIsLoading(false)
        return
      }

      // 3. Éxito
      onSuccess()
    } catch (err) {
      console.error('Error en registro de secretario:', err)
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="secretario@juzgado.gob.bo"
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
      </div>

      {/* Juzgado */}
      <div className="space-y-2">
        <Label htmlFor="juzgado">
          Juzgado Asignado <span className="text-destructive">*</span>
        </Label>
        <Input
          id="juzgado"
          placeholder="Ej: Juzgado 1° de Partido Civil y Comercial de La Paz"
          {...register('juzgado')}
          disabled={isLoading}
        />
        {errors.juzgado && (
          <p className="text-sm text-destructive">{errors.juzgado.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña Inicial <span className="text-destructive">*</span>
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
          El usuario deberá cambiar su contraseña en el primer inicio de sesión
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

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Creando...' : 'Crear Secretario'}
        </Button>
      </div>
    </form>
  )
}
