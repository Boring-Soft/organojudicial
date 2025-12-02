'use client'

import Link from 'next/link'
import { UserCircle, Scale } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Página de selección de tipo de usuario para registro
 */
export default function RegistroPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Registro SIGPJ</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Selecciona el tipo de cuenta que deseas crear
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Ciudadano */}
          <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <UserCircle className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Ciudadano</CardTitle>
              <CardDescription className="text-base">
                Para personas que necesitan iniciar un proceso judicial o han sido demandadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Seguimiento de tus procesos judiciales</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Vinculación con abogados certificados</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Notificaciones en tiempo real</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Acceso a documentos del expediente</span>
                </li>
              </ul>
              <Button asChild className="w-full" size="lg">
                <Link href="/registro/ciudadano">Registrarse como Ciudadano</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card Abogado */}
          <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Scale className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Abogado</CardTitle>
              <CardDescription className="text-base">
                Para profesionales del derecho con matrícula profesional vigente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gestión de casos y clientes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Presentación digital de demandas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Calendario de audiencias y plazos</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Chat directo con clientes</span>
                </li>
              </ul>
              <Button asChild className="w-full" size="lg">
                <Link href="/registro/abogado">Registrarse como Abogado</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Nota para Secretarios y Jueces */}
        <div className="mt-8 rounded-lg border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>¿Eres Secretario o Juez?</strong>
            <br />
            Los usuarios con roles administrativos deben ser creados por un administrador del sistema.
            <br />
            Contacta al departamento de TI de tu juzgado para obtener acceso.
          </p>
        </div>

        {/* Link a Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
