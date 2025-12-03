'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { abogadoRegistroSchema, type AbogadoRegistroInput } from '@/lib/validations/abogado'
import { createClient } from '@/lib/supabase/client'

/**
 * Página de registro para Abogados
 */
export default function RegistroAbogadoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AbogadoRegistroInput>({
    resolver: zodResolver(abogadoRegistroSchema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValue('certificado', e.target.files, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: AbogadoRegistroInput) => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Crear usuario en Supabase Auth
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError || !authData?.user) {
        setError(authError?.message || 'Error al crear la cuenta')
        setIsLoading(false)
        return
      }

      // 2. Subir certificado de vigencia a Supabase Storage
      if (selectedFile) {
        const fileName = `${authData.user.id}_${Date.now()}.pdf`
        const { error: uploadError } = await supabase.storage
          .from('certificados')
          .upload(`abogados/${fileName}`, selectedFile)

        if (uploadError) {
          console.error('Error al subir certificado:', uploadError)
          setError('Error al subir el certificado. Por favor intenta nuevamente.')
          setIsLoading(false)
          return
        }
      }

      // 3. Crear registro en tabla usuarios con rol ABOGADO
      const { error: dbError } = await supabase.from('usuarios').insert({
        userId: authData.user.id,
        email: data.email,
        nombres: data.nombres,
        apellidos: data.apellidos,
        ci: data.ci,
        telefono: data.telefono,
        registro_abogado: data.numeroRegistro,
        rol: 'ABOGADO',
      })

      if (dbError) {
        console.error('Error al crear usuario en BD:', dbError)
        setError(dbError.message || 'Error al completar el registro. Por favor contacta a soporte.')
        setIsLoading(false)
        return
      }

      // 4. Redirigir a página de confirmación
      router.push('/registro/pendiente-verificacion?email=' + encodeURIComponent(data.email))
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
          <CardTitle className="text-3xl">Registro de Abogado</CardTitle>
          <CardDescription>
            Completa el formulario y sube tu certificado de vigencia profesional. Tu cuenta será
            verificada antes de ser activada.
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

            {/* Número de Registro Profesional */}
            <div className="space-y-2">
              <Label htmlFor="numeroRegistro">
                Número de Registro Profesional <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numeroRegistro"
                placeholder="LP-12345"
                {...register('numeroRegistro')}
                disabled={isLoading}
              />
              {errors.numeroRegistro && (
                <p className="text-sm text-destructive">{errors.numeroRegistro.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: Departamento-Número (Ej: LP-12345, SC-98765)
              </p>
            </div>

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

            <div className="grid gap-6 md:grid-cols-2">
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
            </div>

            {/* Email Profesional */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Profesional <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="abogado@estudio.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {/* Teléfono de Oficina */}
            <div className="space-y-2">
              <Label htmlFor="telefono">
                Teléfono de Oficina <span className="text-destructive">*</span>
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

            {/* Upload de Certificado */}
            <div className="space-y-2">
              <Label htmlFor="certificado">
                Certificado de Vigencia Profesional <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="certificado"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <Label
                  htmlFor="certificado"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary"
                >
                  {selectedFile ? (
                    <>
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-sm">
                        Click para subir certificado (PDF, máx 5MB)
                      </span>
                    </>
                  )}
                </Label>
              </div>
              {errors.certificado && (
                <p className="text-sm text-destructive">{errors.certificado.message?.toString()}</p>
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
              {isLoading ? 'Registrando...' : 'Crear Cuenta de Abogado'}
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
