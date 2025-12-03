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
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Proceso {
  id: string
  nurej: string
  estado: string
  partes: Array<{
    ciudadanoId: string
    tipo: string
    nombres: string
    apellidos: string
  }>
  plazos?: Array<{
    tipo: string
    fechaVencimiento: string
    vencido: boolean
  }>
}

interface Audiencia {
  id: string
  tipo: string
  fecha: string
  hora: string
  estado: string
  proceso: {
    nurej: string
  }
}

interface CasoActivo {
  id: string
  nurej: string
  cliente: string
  urgencia: 'ALTA' | 'MEDIA' | 'BAJA'
  proximoVencimiento: string
  diasRestantes: number
}

export default function AbogadoDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [casosActivos, setCasosActivos] = useState<CasoActivo[]>([])
  const [proximasAudiencias, setProximasAudiencias] = useState<Audiencia[]>([])
  const [clientesActivos, setClientesActivos] = useState(0)
  const [tasaExito, setTasaExito] = useState(0)
  const [plazosCriticos, setPlazosCriticos] = useState(0)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)

  useEffect(() => {
    cargarDatos()
  }, [user])

  const cargarDatos = async () => {
    if (!user) return

    try {
      const supabase = createClient()

      // Cargar datos en paralelo
      const [procesosRes, audienciasRes, vinculacionesData, solicitudesData] = await Promise.all([
        fetch('/api/procesos?limit=100'),
        fetch('/api/audiencias'),
        supabase
          .from('vinculaciones_abogado_ciudadano')
          .select('id')
          .eq('abogado_id', user.id)
          .eq('estado', 'ACTIVA')
          .eq('activo', true),
        supabase
          .from('vinculaciones_abogado_ciudadano')
          .select('id')
          .eq('abogado_id', user.id)
          .eq('estado', 'PENDIENTE'),
      ])

      // Procesar procesos
      let procesos: Proceso[] = []
      if (procesosRes.ok) {
        const data = await procesosRes.json()
        procesos = data.procesos || []
      }

      // Procesar audiencias
      let audiencias: Audiencia[] = []
      if (audienciasRes.ok) {
        const data = await audienciasRes.json()
        audiencias = data || []
      }

      // Calcular clientes activos
      setClientesActivos(vinculacionesData.data?.length || 0)

      // Calcular solicitudes pendientes
      setSolicitudesPendientes(solicitudesData.data?.length || 0)

      // Calcular tasa de éxito (casos finalizados ganados / total finalizados)
      const procesosFinalizados = procesos.filter(
        (p) => p.estado === 'FINALIZADO' || p.estado === 'SENTENCIA'
      )
      const procesosGanados = procesosFinalizados.filter((p) => p.estado === 'SENTENCIA')
      const tasa = procesosFinalizados.length > 0
        ? Math.round((procesosGanados.length / procesosFinalizados.length) * 100)
        : 0
      setTasaExito(tasa)

      // Filtrar procesos activos
      const activos = procesos.filter(
        (p) => p.estado !== 'FINALIZADO' && p.estado !== 'RECHAZADO' && p.estado !== 'SENTENCIA'
      )

      // Calcular casos activos con urgencia basada en plazos
      const casosConUrgencia: CasoActivo[] = activos.map((proceso) => {
        // Obtener el cliente (demandante o demandado)
        const parte = proceso.partes?.find((p) => p.tipo === 'DEMANDANTE') || proceso.partes?.[0]
        const clienteNombre = parte
          ? `${parte.nombres} ${parte.apellidos}`
          : 'Sin cliente'

        // Calcular el plazo más próximo
        let diasRestantes = 999
        let proximoVencimiento = ''

        if (proceso.plazos && proceso.plazos.length > 0) {
          const plazosActivos = proceso.plazos
            .filter((plazo) => !plazo.vencido)
            .sort((a, b) =>
              new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
            )

          if (plazosActivos.length > 0) {
            const plazoProximo = plazosActivos[0]
            proximoVencimiento = plazoProximo.fechaVencimiento
            diasRestantes = Math.ceil(
              (new Date(plazoProximo.fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          }
        }

        // Determinar urgencia
        let urgencia: 'ALTA' | 'MEDIA' | 'BAJA' = 'BAJA'
        if (diasRestantes <= 3) {
          urgencia = 'ALTA'
        } else if (diasRestantes <= 10) {
          urgencia = 'MEDIA'
        }

        return {
          id: proceso.id,
          nurej: proceso.nurej,
          cliente: clienteNombre,
          urgencia,
          proximoVencimiento,
          diasRestantes,
        }
      })

      setCasosActivos(casosConUrgencia)

      // Contar plazos críticos (≤ 3 días)
      const criticos = casosConUrgencia.filter((c) => c.diasRestantes <= 3).length
      setPlazosCriticos(criticos)

      // Filtrar próximas audiencias (futuras y programadas)
      const ahora = new Date()
      const audienciasFuturas = audiencias
        .filter((a) => {
          const fechaAudiencia = new Date(a.fecha)
          return fechaAudiencia >= ahora && a.estado === 'PROGRAMADA'
        })
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        .slice(0, 5)

      setProximasAudiencias(audienciasFuturas)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getUrgenciaBadge = (urgencia: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      ALTA: { variant: 'destructive', label: 'Urgente' },
      MEDIA: { variant: 'default', label: 'Media' },
      BAJA: { variant: 'secondary', label: 'Baja' },
    }
    return variants[urgencia] || variants.MEDIA
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
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
                <p className="text-2xl font-bold">{clientesActivos}</p>
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
                <p className="text-2xl font-bold">{tasaExito}%</p>
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
                <p className="text-2xl font-bold">{plazosCriticos}</p>
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
              {proximasAudiencias.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No hay audiencias programadas</p>
                </div>
              ) : (
                proximasAudiencias.map((audiencia) => (
                  <div
                    key={audiencia.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Calendar className="mt-1 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{audiencia.proceso.nurej}</p>
                      <p className="text-xs text-muted-foreground">{audiencia.tipo}</p>
                      <p className="mt-1 text-xs font-medium">
                        {format(new Date(audiencia.fecha), "d 'de' MMMM", { locale: es })} • {audiencia.hora}
                      </p>
                    </div>
                  </div>
                ))
              )}
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
                <p className="text-2xl font-bold">{solicitudesPendientes}</p>
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
