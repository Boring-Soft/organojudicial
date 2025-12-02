'use client'

import Link from 'next/link'
import {
  BellIcon,
  Calendar,
  FileCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SecretarioDashboardPage() {
  const citacionesPendientes = [
    {
      id: '1',
      proceso: 'LP-001-2024-CV',
      demandado: 'Pedro Ramírez',
      tipo: 'Personal',
      intentos: 0,
      prioridad: 'ALTA',
    },
    {
      id: '2',
      proceso: 'LP-045-2024-FM',
      demandado: 'Ana García',
      tipo: 'Cédula',
      intentos: 1,
      prioridad: 'MEDIA',
    },
  ]

  const audienciasProximas = [
    {
      id: '1',
      proceso: 'LP-023-2024-CV',
      tipo: 'Preliminar',
      fecha: '2024-12-10',
      hora: '09:00',
      juez: 'Dra. María Flores',
    },
    {
      id: '2',
      proceso: 'LP-034-2024-LB',
      tipo: 'Complementaria',
      fecha: '2024-12-12',
      hora: '14:30',
      juez: 'Dr. Juan Pérez',
    },
  ]

  const demandasNuevas = [
    {
      id: '1',
      nurej: 'LP-099-2024-CV',
      actor: 'Carlos Morales',
      tipo: 'Civil',
      fecha: '2024-12-01',
      estado: 'PENDIENTE_VALIDACION',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard de Secretario</h1>
        <p className="text-muted-foreground">Gestión administrativa del juzgado</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Citaciones Pendientes</p>
                <p className="text-2xl font-bold">{citacionesPendientes.length}</p>
              </div>
              <BellIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audiencias del Mes</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Procesos Activos</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demandas Nuevas</p>
                <p className="text-2xl font-bold">{demandasNuevas.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Citaciones Pendientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Citaciones Pendientes</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/secretario/citaciones">Ver Todas</Link>
              </Button>
            </div>
            <CardDescription>Requieren atención prioritaria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {citacionesPendientes.map((citacion) => (
              <Card key={citacion.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{citacion.proceso}</p>
                      <p className="text-sm text-muted-foreground">{citacion.demandado}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{citacion.tipo}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {citacion.intentos} intentos
                        </span>
                      </div>
                    </div>
                    {citacion.prioridad === 'ALTA' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <Button size="sm" className="mt-3 w-full">
                    Registrar Citación
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Audiencias Próximas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audiencias Próximas</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/secretario/audiencias">Calendario</Link>
              </Button>
            </div>
            <CardDescription>Audiencias programadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {audienciasProximas.map((audiencia) => (
              <Card key={audiencia.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">{audiencia.proceso}</p>
                      <p className="text-sm text-muted-foreground">{audiencia.tipo}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {audiencia.fecha} • {audiencia.hora}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{audiencia.juez}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Demandas por Validar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Demandas por Validar</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/secretario/demandas">Ver Todas</Link>
              </Button>
            </div>
            <CardDescription>Requieren revisión inicial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demandasNuevas.map((demanda) => (
              <Card key={demanda.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{demanda.nurej}</p>
                      <p className="text-sm text-muted-foreground">Actor: {demanda.actor}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{demanda.tipo}</Badge>
                        <span className="text-xs text-muted-foreground">{demanda.fecha}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">Nuevo</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1">
                      Validar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Observar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Estadísticas del Juzgado */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Juzgado</CardTitle>
            <CardDescription>Resumen del mes actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Citaciones Realizadas</span>
              <span className="font-semibold">28</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Audiencias Realizadas</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Demandas Admitidas</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Demandas Observadas</span>
              <span className="font-semibold">3</span>
            </div>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/secretario/reportes">Ver Reporte Completo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
