'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  Upload,
  Download,
  Bell,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/auth-context'
import MiAbogadoWidget from '@/components/shared/mi-abogado-widget'

/**
 * Dashboard principal del Ciudadano
 * Muestra resumen de procesos, notificaciones y acciones rápidas
 */
export default function CiudadanoDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Aquí se cargarían los datos reales
    setLoading(false)
  }, [user])

  // Datos de ejemplo (en producción vendrían de la BD)
  const procesosActivos = [
    {
      id: '1',
      nurej: 'LP-001-2024-CV',
      tipo: 'Civil',
      estado: 'ADMITIDO',
      rol: 'Actor',
      fechaProxima: '2024-12-15',
      diasRestantes: 13,
      progreso: 30,
    },
    {
      id: '2',
      nurej: 'LP-045-2024-FM',
      tipo: 'Familiar',
      estado: 'CONTESTACION_PENDIENTE',
      rol: 'Demandado',
      fechaProxima: '2024-12-10',
      diasRestantes: 8,
      progreso: 50,
    },
  ]

  const notificacionesRecientes = [
    {
      id: '1',
      tipo: 'CITACION',
      titulo: 'Nueva citación recibida',
      mensaje: 'Has sido citado para el proceso LP-045-2024-FM',
      fecha: '2024-12-01',
      leido: false,
    },
    {
      id: '2',
      tipo: 'RESOLUCION',
      titulo: 'Resolución emitida',
      mensaje: 'Se ha emitido una resolución en tu proceso LP-001-2024-CV',
      fecha: '2024-11-28',
      leido: false,
    },
    {
      id: '3',
      tipo: 'AUDIENCIA',
      titulo: 'Audiencia programada',
      mensaje: 'Audiencia preliminar el 15 de diciembre',
      fecha: '2024-11-25',
      leido: true,
    },
  ]

  const accionesRapidas = [
    {
      title: 'Subir Documento',
      description: 'Agrega documentos a tus procesos',
      icon: Upload,
      href: '/ciudadano/documentos/subir',
    },
    {
      title: 'Ver Calendario',
      description: 'Revisa tus audiencias programadas',
      icon: Calendar,
      href: '/ciudadano/calendario',
    },
    {
      title: 'Descargar Expediente',
      description: 'Obtén copias de tus documentos',
      icon: Download,
      href: '/ciudadano/expedientes',
    },
  ]

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      ADMITIDO: { variant: 'default', label: 'Admitido' },
      CONTESTACION_PENDIENTE: { variant: 'secondary', label: 'Contestación Pendiente' },
      SENTENCIADO: { variant: 'destructive', label: 'Sentenciado' },
    }
    return variants[estado] || { variant: 'default', label: estado }
  }

  const getRolColor = (rol: string) => {
    return rol === 'Actor' ? 'text-blue-600' : 'text-orange-600'
  }

  const getDiasColor = (dias: number) => {
    if (dias <= 3) return 'text-red-600'
    if (dias <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bienvenido, {user?.email?.split('@')[0]}</h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tus procesos judiciales y actividad reciente
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Procesos Activos</p>
                <p className="text-2xl font-bold">{procesosActivos.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximas Audiencias</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notificaciones</p>
                <p className="text-2xl font-bold">
                  {notificacionesRecientes.filter((n) => !n.leido).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plazos Críticos</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Mis Procesos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mis Procesos</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ciudadano/procesos">Ver Todos</Link>
                </Button>
              </div>
              <CardDescription>Estado actual de tus procesos judiciales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {procesosActivos.map((proceso) => (
                <Card key={proceso.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{proceso.nurej}</p>
                        <p className="text-sm text-muted-foreground">{proceso.tipo}</p>
                      </div>
                      <Badge
                        variant={getEstadoBadge(proceso.estado).variant}
                      >
                        {getEstadoBadge(proceso.estado).label}
                      </Badge>
                    </div>

                    <div className="mb-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tu rol:</span>
                        <span className={`font-medium ${getRolColor(proceso.rol)}`}>
                          {proceso.rol}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Próxima fecha:</span>
                        <span className="font-medium">{proceso.fechaProxima}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Días restantes:</span>
                        <span className={`font-bold ${getDiasColor(proceso.diasRestantes)}`}>
                          {proceso.diasRestantes} días
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso del proceso</span>
                        <span className="font-medium">{proceso.progreso}%</span>
                      </div>
                      <Progress value={proceso.progreso} className="h-2" />
                    </div>

                    {proceso.diasRestantes <= 7 && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-800">
                        <Clock className="h-4 w-4" />
                        <span>Acción requerida pronto</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notificaciones Recientes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/ciudadano/notificaciones">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificacionesRecientes.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    !notif.leido ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mt-1">
                    {notif.leido ? (
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Bell className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.titulo}</p>
                    <p className="text-xs text-muted-foreground">{notif.mensaje}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{notif.fecha}</p>
                  </div>
                  {!notif.leido && (
                    <Badge variant="default" className="text-xs">
                      Nuevo
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Mi Abogado */}
          <MiAbogadoWidget />

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Accesos directos a funciones comunes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {accionesRapidas.map((accion) => (
                <Button
                  key={accion.title}
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={accion.href}>
                    <accion.icon className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">{accion.title}</p>
                      <p className="text-xs text-muted-foreground">{accion.description}</p>
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
