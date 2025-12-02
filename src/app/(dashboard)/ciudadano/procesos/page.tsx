'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'

interface Proceso {
  id: string
  nurej: string
  tipo: string
  materia: string
  estado: string
  rol: 'ACTOR' | 'DEMANDADO'
  fecha_inicio: string
  juzgado: string
  juez: string
  contraparte: string
  objeto_demanda: string
  cuantia: number | null
  proxima_accion: string
  dias_restantes: number | null
  progreso: number
}

export default function MisProcesosPage() {
  const { user } = useAuth()
  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [filteredProcesos, setFilteredProcesos] = useState<Proceso[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('todos')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [loading, setLoading] = useState(true)

  // Mock data - en producción vendría de Supabase
  useEffect(() => {
    fetchProcesos()
  }, [user])

  useEffect(() => {
    let filtered = procesos

    if (searchTerm) {
      filtered = filtered.filter(
        (proceso) =>
          proceso.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proceso.contraparte.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (estadoFilter !== 'todos') {
      filtered = filtered.filter((proceso) => proceso.estado === estadoFilter)
    }

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter((proceso) => proceso.tipo === tipoFilter)
    }

    setFilteredProcesos(filtered)
  }, [searchTerm, estadoFilter, tipoFilter, procesos])

  const fetchProcesos = async () => {
    // Mock data
    const mockProcesos: Proceso[] = [
      {
        id: '1',
        nurej: 'LP-001-2024-CV',
        tipo: 'Civil',
        materia: 'Cobro de bolivianos',
        estado: 'ADMITIDO',
        rol: 'ACTOR',
        fecha_inicio: '2024-10-15',
        juzgado: 'Juzgado 5to de Partido Civil',
        juez: 'Dra. María González',
        contraparte: 'Juan Pérez Mamani',
        objeto_demanda: 'Cobro de Bs. 50,000 por incumplimiento de contrato',
        cuantia: 50000,
        proxima_accion: 'Esperar citación del demandado',
        dias_restantes: 13,
        progreso: 30,
      },
      {
        id: '2',
        nurej: 'LP-045-2024-FM',
        tipo: 'Familia',
        materia: 'Asistencia familiar',
        estado: 'EN_AUDIENCIA_PRELIMINAR',
        rol: 'ACTOR',
        fecha_inicio: '2024-09-20',
        juzgado: 'Juzgado 2do de Familia',
        juez: 'Dr. Carlos Quispe',
        contraparte: 'Pedro García López',
        objeto_demanda: 'Solicitud de pensión alimenticia',
        cuantia: null,
        proxima_accion: 'Audiencia preliminar - 2024-12-05 09:00',
        dias_restantes: 3,
        progreso: 50,
      },
      {
        id: '3',
        nurej: 'LP-089-2024-LB',
        tipo: 'Laboral',
        materia: 'Beneficios sociales',
        estado: 'EN_PRUEBA',
        rol: 'DEMANDADO',
        fecha_inicio: '2024-08-10',
        juzgado: 'Juzgado 1ro de Trabajo',
        juez: 'Dra. Ana Flores',
        contraparte: 'Empresa XYZ S.A.',
        objeto_demanda: 'Reclamo de pago de desahucio e indemnización',
        cuantia: 80000,
        proxima_accion: 'Presentar prueba documental',
        dias_restantes: 7,
        progreso: 65,
      },
      {
        id: '4',
        nurej: 'LP-112-2023-CV',
        tipo: 'Civil',
        materia: 'Resolución de contrato',
        estado: 'SENTENCIADO',
        rol: 'ACTOR',
        fecha_inicio: '2023-11-05',
        juzgado: 'Juzgado 3ro de Partido Civil',
        juez: 'Dr. Luis Mamani',
        contraparte: 'María Condori Quispe',
        objeto_demanda: 'Resolución de contrato de compraventa',
        cuantia: 120000,
        proxima_accion: 'Ejecutoria de sentencia',
        dias_restantes: null,
        progreso: 100,
      },
    ]

    setProcesos(mockProcesos)
    setFilteredProcesos(mockProcesos)
    setLoading(false)
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ADMITIDO: { label: 'Admitido', variant: 'default' },
      EN_AUDIENCIA_PRELIMINAR: { label: 'En Audiencia', variant: 'secondary' },
      EN_PRUEBA: { label: 'En Prueba', variant: 'secondary' },
      SENTENCIADO: { label: 'Sentenciado', variant: 'outline' },
      APELADO: { label: 'Apelado', variant: 'destructive' },
    }

    const estado_data = estados[estado] || { label: estado, variant: 'outline' as const }
    return <Badge variant={estado_data.variant}>{estado_data.label}</Badge>
  }

  const getRolBadge = (rol: string) => {
    return rol === 'ACTOR' ? (
      <Badge variant="default">Actor</Badge>
    ) : (
      <Badge variant="secondary">Demandado</Badge>
    )
  }

  const getDiasColor = (dias: number | null) => {
    if (!dias) return 'text-muted-foreground'
    if (dias <= 3) return 'text-red-600'
    if (dias <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando procesos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Procesos</h1>
        <p className="text-muted-foreground">Seguimiento detallado de tus procesos judiciales</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Procesos Activos</p>
                <p className="text-2xl font-bold">
                  {procesos.filter((p) => p.estado !== 'SENTENCIADO').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Como Actor</p>
                <p className="text-2xl font-bold">
                  {procesos.filter((p) => p.rol === 'ACTOR').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Como Demandado</p>
                <p className="text-2xl font-bold">
                  {procesos.filter((p) => p.rol === 'DEMANDADO').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizados</p>
                <p className="text-2xl font-bold">
                  {procesos.filter((p) => p.estado === 'SENTENCIADO').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por NUREJ o contraparte..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="ADMITIDO">Admitido</SelectItem>
                <SelectItem value="EN_AUDIENCIA_PRELIMINAR">En Audiencia</SelectItem>
                <SelectItem value="EN_PRUEBA">En Prueba</SelectItem>
                <SelectItem value="SENTENCIADO">Sentenciado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Familia">Familia</SelectItem>
                <SelectItem value="Laboral">Laboral</SelectItem>
                <SelectItem value="Penal">Penal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de procesos */}
      {filteredProcesos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {searchTerm || estadoFilter !== 'todos' || tipoFilter !== 'todos'
                ? 'No se encontraron procesos con los filtros aplicados'
                : 'No tienes procesos registrados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProcesos.map((proceso) => (
            <Card key={proceso.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{proceso.nurej}</CardTitle>
                      {getEstadoBadge(proceso.estado)}
                      {getRolBadge(proceso.rol)}
                    </div>
                    <CardDescription className="mt-1">
                      {proceso.tipo} - {proceso.materia}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ciudadano/procesos/${proceso.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Información básica */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Juzgado</p>
                      <p className="text-sm text-muted-foreground">{proceso.juzgado}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Juez</p>
                      <p className="text-sm text-muted-foreground">{proceso.juez}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contraparte</p>
                      <p className="text-sm text-muted-foreground">{proceso.contraparte}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cuantía</p>
                      <p className="text-sm text-muted-foreground">
                        {proceso.cuantia
                          ? `Bs. ${proceso.cuantia.toLocaleString()}`
                          : 'Sin cuantía'}
                      </p>
                    </div>
                  </div>

                  {/* Objeto de la demanda */}
                  <div>
                    <p className="text-sm font-medium">Objeto de la demanda</p>
                    <p className="text-sm text-muted-foreground">{proceso.objeto_demanda}</p>
                  </div>

                  {/* Progreso */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">Progreso</p>
                      <span className="text-sm text-muted-foreground">{proceso.progreso}%</span>
                    </div>
                    <Progress value={proceso.progreso} className="h-2" />
                  </div>

                  {/* Próxima acción */}
                  <div className="flex items-start justify-between rounded-lg bg-muted p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Próxima Acción</p>
                        <p className="text-sm text-muted-foreground">{proceso.proxima_accion}</p>
                      </div>
                    </div>
                    {proceso.dias_restantes && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className={`text-sm font-bold ${getDiasColor(proceso.dias_restantes)}`}>
                          {proceso.dias_restantes} días
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
