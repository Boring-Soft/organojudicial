'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/providers/auth-provider'

export default function AbogadoDashboardPage() {
  const { user } = useAuth()

  // Datos de ejemplo
  const casosActivos = [
    {
      id: '1',
      nurej: 'LP-001-2024-CV',
      cliente: 'Juan Pérez',
      urgencia: 'ALTA',
      proximoVencimiento: '2024-12-05',
      diasRestantes: 3,
    },
    {
      id: '2',
      nurej: 'LP-045-2024-FM',
      cliente: 'María López',
      urgencia: 'MEDIA',
      proximoVencimiento: '2024-12-15',
      diasRestantes: 13,
    },
    {
      id: '3',
      nurej: 'LP-089-2024-LB',
      cliente: 'Pedro García',
      urgencia: 'BAJA',
      proximoVencimiento: '2024-12-25',
      diasRestantes: 23,
    },
  ]

  const proximasAudiencias = [
    {
      id: '1',
      caso: 'LP-001-2024-CV',
      tipo: 'Preliminar',
      fecha: '2024-12-10',
      hora: '09:00',
    },
    {
      id: '2',
      caso: 'LP-045-2024-FM',
      tipo: 'Complementaria',
      fecha: '2024-12-15',
      hora: '14:30',
    },
  ]

  const getUrgenciaBadge = (urgencia: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      ALTA: { variant: 'destructive', label: 'Urgente' },
      MEDIA: { variant: 'default', label: 'Media' },
      BAJA: { variant: 'secondary', label: 'Baja' },
    }
    return variants[urgencia] || variants.MEDIA
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard de Abogado</h1>
        <p className="text-muted-foreground">Gestiona tus casos y clientes de manera eficiente</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Casos Activos</p>
                <p className="text-2xl font-bold">{casosActivos.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Activos</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
                <p className="text-2xl font-bold">78%</p>
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
                <p className="text-2xl font-bold">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Casos por Urgencia (Kanban-style) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Casos por Urgencia</CardTitle>
              <CardDescription>Vista organizada de tus casos activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Urgente */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <h3 className="font-semibold">Urgente</h3>
                    <Badge variant="destructive">
                      {casosActivos.filter((c) => c.urgencia === 'ALTA').length}
                    </Badge>
                  </div>
                  {casosActivos
                    .filter((c) => c.urgencia === 'ALTA')
                    .map((caso) => (
                      <Card key={caso.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{caso.nurej}</p>
                          <p className="text-xs text-muted-foreground">{caso.cliente}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                            <Clock className="h-3 w-3" />
                            {caso.diasRestantes} días
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Por Vencer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <h3 className="font-semibold">Por Vencer</h3>
                    <Badge variant="default">
                      {casosActivos.filter((c) => c.urgencia === 'MEDIA').length}
                    </Badge>
                  </div>
                  {casosActivos
                    .filter((c) => c.urgencia === 'MEDIA')
                    .map((caso) => (
                      <Card key={caso.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{caso.nurej}</p>
                          <p className="text-xs text-muted-foreground">{caso.cliente}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                            <Clock className="h-3 w-3" />
                            {caso.diasRestantes} días
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Al Día */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <h3 className="font-semibold">Al Día</h3>
                    <Badge variant="secondary">
                      {casosActivos.filter((c) => c.urgencia === 'BAJA').length}
                    </Badge>
                  </div>
                  {casosActivos
                    .filter((c) => c.urgencia === 'BAJA')
                    .map((caso) => (
                      <Card key={caso.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{caso.nurej}</p>
                          <p className="text-xs text-muted-foreground">{caso.cliente}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {caso.diasRestantes} días
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Próximas Audiencias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Audiencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proximasAudiencias.map((audiencia) => (
                <div
                  key={audiencia.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <Calendar className="mt-1 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{audiencia.caso}</p>
                    <p className="text-xs text-muted-foreground">{audiencia.tipo}</p>
                    <p className="mt-1 text-xs font-medium">
                      {audiencia.fecha} • {audiencia.hora}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Solicitudes Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Solicitudes Pendientes</CardTitle>
              <CardDescription>Nuevos clientes esperando respuesta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Solicitudes nuevas</p>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/abogado/solicitudes">Revisar Solicitudes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
