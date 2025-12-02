'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Página de verificación pendiente para abogados
 */
export default function PendienteVerificacionPage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Cuenta en Verificación</CardTitle>
          <CardDescription>
            Tu solicitud de registro como abogado ha sido recibida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Hemos enviado un correo de confirmación a:
          </p>
          <p className="font-medium text-primary">{email}</p>
          
          <div className="rounded-lg bg-yellow-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-yellow-600" />
              <div className="flex-1 space-y-2 text-sm">
                <p className="font-semibold text-yellow-800">Proceso de Verificación</p>
                <ol className="ml-4 list-decimal space-y-1 text-yellow-700">
                  <li>Confirma tu email haciendo clic en el enlace enviado</li>
                  <li>Nuestro equipo revisará tu certificado de vigencia profesional</li>
                  <li>Recibirás un correo cuando tu cuenta sea activada</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 h-5 w-5 text-blue-600" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-blue-800">Tiempo estimado</p>
                <p className="mt-1 text-blue-700">
                  La verificación suele completarse en 24-48 horas hábiles.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            <p className="font-semibold">¿Necesitas ayuda?</p>
            <p className="mt-2">
              Si tienes preguntas sobre el proceso de verificación, contacta a:{' '}
              <a href="mailto:soporte@sigpj.gob.bo" className="text-primary hover:underline">
                soporte@sigpj.gob.bo
              </a>
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
