'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, FileText, Users, Bell, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/providers/auth-provider'

/**
 * Página de onboarding post-registro
 * Se muestra después de que el usuario confirma su email y hace login por primera vez
 */
export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Bienvenido al SIGPJ',
      description: 'Sistema Integral de Gestión Procesal Judicial de Bolivia',
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Gracias por registrarte en el Sistema Integral de Gestión Procesal Judicial.
            Estamos aquí para hacer tus trámites judiciales más fáciles y transparentes.
          </p>
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="font-semibold text-primary">¿Qué puedes hacer en SIGPJ?</p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-sm text-muted-foreground">
              <li>Consultar el estado de tus procesos judiciales en tiempo real</li>
              <li>Conectar con abogados verificados</li>
              <li>Recibir notificaciones sobre tus casos</li>
              <li>Acceder a documentos de manera digital</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Tus Procesos Judiciales',
      description: 'Seguimiento en tiempo real',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Dashboard de Procesos</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza todos tus casos activos, próximas audiencias y plazos importantes.
                Recibe alertas automáticas para no perder ningún vencimiento.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold">Información siempre disponible:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
              <li>Estado actual de cada proceso</li>
              <li>Próximas fechas importantes</li>
              <li>Documentos del expediente</li>
              <li>Historial de actuaciones</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Vinculación con Abogados',
      description: 'Conecta con profesionales verificados',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Búsqueda de Abogados</h3>
              <p className="text-sm text-muted-foreground">
                Encuentra y contacta abogados verificados por especialidad, experiencia y ubicación.
                Solicita representación legal directamente desde la plataforma.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Comunicación Directa</h3>
              <p className="text-sm text-muted-foreground">
                Chat en tiempo real con tu abogado para resolver dudas y recibir asesoría
                sobre tus casos.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Notificaciones',
      description: 'Mantente informado',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Sistema de Alertas</h3>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones por email y en la plataforma sobre eventos importantes
                en tus procesos judiciales.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold">Te notificaremos sobre:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
              <li>Nuevas resoluciones o sentencias</li>
              <li>Próximas audiencias</li>
              <li>Plazos a vencer</li>
              <li>Mensajes de tu abogado</li>
              <li>Citaciones y notificaciones oficiales</li>
            </ul>
          </div>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const StepIcon = currentStepData.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Último paso, redirigir al dashboard
      handleComplete()
    }
  }

  const handleComplete = () => {
    // En el futuro, aquí se marcaría el onboarding como completado en la BD
    router.push('/ciudadano/dashboard')
  }

  const handleSkip = () => {
    router.push('/ciudadano/dashboard')
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StepIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {steps.length}
            </span>
          </div>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contenido del paso actual */}
          {currentStepData.content}

          {/* Indicadores de progreso */}
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Botones de navegación */}
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={handleSkip}>
              Saltar introducción
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    Comenzar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info del usuario */}
          {user && (
            <div className="rounded-lg border-t pt-4 text-center text-sm text-muted-foreground">
              Conectado como: <span className="font-medium">{user.email}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
