'use client'

import Link from 'next/link'
import {
  AlertCircle,
  Calendar,
  FileSignature,
  FileText,
  Gavel,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function JuezDashboardPage() {
  const plazosCriticos = [
    {
      id: '1',
      proceso: 'LP-001-2024-CV',
      tipo: 'Sentencia',
      diasRestantes: 5,
      actor: 'Juan Pérez',
      demandado: 'María López',
    },
    {
      id: '2',
      proceso: 'LP-023-2024-FM',
      tipo: 'Resolución',
      diasRestantes: 10,
      actor: 'Pedro García',
      demandado: 'Ana Martínez',
    },
  ]

  const procesosPorEtapa = [
    { etapa: 'Admitido', cantidad: 5, color: 'bg-blue-500' },
    { etapa: 'Audiencia Preliminar', cantidad: 8, color: 'bg-yellow-500' },
    { etapa: 'Prueba', cantidad: 3, color: 'bg-purple-500' },
    { etapa: 'Sentencia Pendiente', cantidad: 2, color: 'bg-red-500' },
    { etapa: 'Sentenciado', cantidad: 12, color: 'bg-green-500' },
  ]

  const audienciasHoy = [
    {
      id: '1',
      proceso: 'LP-045-2024-CV',
      tipo: 'Preliminar',
      hora: '09:00',
      partes: 'Carlos Morales vs. Luis Ramírez',
    },
    {
      id: '2',
      proceso: 'LP-067-2024-LB',
      tipo: 'Complementaria',
      hora: '14:30',
      partes: 'Empresa ABC vs. Sindicato XYZ',
    },
  ]

  const getDiasColor = (dias: number) => {
    if (dias <= 5) return 'text-red-600'
    if (dias <= 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard del Juez</h1>
        <p className="text-muted-foreground">Gestión judicial y toma de decisiones</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Procesos Activos</p>
                <p className="text-2xl font-bold">30</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sentencias Emitidas</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <FileSignature className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cumplimiento Plazos</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plazos Críticos</p>
                <p className="text-2xl font-bold">{plazosCriticos.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plazos Críticos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plazos Críticos</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/juez/procesos">Ver Todos</Link>
                </Button>
              </div>
              <CardDescription>Sentencias y resoluciones próximas a vencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plazosCriticos.map((plazo) => (
                <Card key={plazo.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{plazo.proceso}</p>
                          <Badge variant="destructive">{plazo.tipo}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {plazo.actor} vs. {plazo.demandado}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className={`text-sm font-bold ${getDiasColor(plazo.diasRestantes)}`}>
                            {plazo.diasRestantes} días restantes
                          </span>
                        </div>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1">
                        {plazo.tipo === 'Sentencia' ? 'Emitir Sentencia' : 'Emitir Resolución'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Ver Expediente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Procesos por Etapa */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Procesos por Etapa</CardTitle>
              <CardDescription>Vista Kanban de los procesos activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procesosPorEtapa.map((item) => (
                  <div key={item.etapa} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.etapa}</span>
                      </div>
                      <Badge variant="secondary">{item.cantidad}</Badge>
                    </div>
                    <Progress
                      value={(item.cantidad / 30) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href="/juez/procesos">Ver Detalle de Procesos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Audiencias del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audiencias del Día</CardTitle>
              <CardDescription>Programación de hoy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {audienciasHoy.map((audiencia) => (
                <Card key={audiencia.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-1 h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{audiencia.proceso}</p>
                        <p className="text-xs text-muted-foreground">{audiencia.tipo}</p>
                        <p className="mt-1 text-xs">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {audiencia.hora}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{audiencia.partes}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Acceder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full" variant="outline" asChild>
                <Link href="/juez/audiencias">Ver Calendario Completo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Métricas de Desempeño */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Desempeño</CardTitle>
              <CardDescription>Resumen del mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cumplimiento de plazos</span>
                  <span className="font-semibold">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sentencias emitidas</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resoluciones emitidas</span>
                  <span className="font-semibold">25</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Audiencias realizadas</span>
                  <span className="font-semibold">18</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Procesos resueltos</span>
                  <span className="font-semibold">8</span>
                </div>
              </div>

              <Button className="w-full" variant="outline" asChild>
                <Link href="/juez/reportes">Ver Reporte Completo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/juez/sentencias/nueva">
                  <FileSignature className="mr-2 h-4 w-4" />
                  Nueva Sentencia
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/juez/resoluciones/nueva">
                  <Gavel className="mr-2 h-4 w-4" />
                  Nueva Resolución
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/usuarios">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
