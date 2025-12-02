'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Página de confirmación de email después del registro
 */
export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifica tu email</CardTitle>
          <CardDescription>
            Hemos enviado un correo de verificación a
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="font-medium text-primary">{email}</p>
          
          <div className="rounded-lg bg-muted p-4 text-left text-sm">
            <p className="mb-2 font-semibold">Próximos pasos:</p>
            <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
              <li>Revisa tu bandeja de entrada</li>
              <li>Busca el correo de SIGPJ Bolivia</li>
              <li>Haz clic en el enlace de verificación</li>
              <li>Una vez verificado, podrás iniciar sesión</li>
            </ol>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left text-sm">
            <p className="font-semibold text-yellow-800">No encuentras el email?</p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-yellow-700">
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que la dirección de email sea correcta</li>
              <li>El email puede tardar unos minutos en llegar</li>
            </ul>
          </div>

          <Button asChild className="w-full">
            <Link href="/login">
              Ir a Iniciar Sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
