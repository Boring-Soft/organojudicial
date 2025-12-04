'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  Eye,
  Plus,
  SortAsc,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/lib/supabase/client'

interface Caso {
  id: string
  nurej: string
  tipo: string
  materia: string
  estado: string
  urgencia: 'ALTA' | 'MEDIA' | 'BAJA'
  cliente_id: string
  cliente_nombre: string
  contraparte: string
  fecha_inicio: string
  juzgado: string
  juez: string
  objeto_demanda: string
  cuantia: number | null
  proximo_vencimiento: string | null
  dias_restantes: number | null
  progreso: number
}

function MisCasosContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('cliente')

  const [casos, setCasos] = useState<Caso[]>([])
  const [filteredCasos, setFilteredCasos] = useState<Caso[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('todos')
  const [urgenciaFilter, setUrgenciaFilter] = useState<string>('todos')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<string>('fecha')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCasos()
  }, [user, clienteId])

  useEffect(() => {
    let filtered = casos

    if (clienteId) {
      filtered = filtered.filter((caso) => caso.cliente_id === clienteId)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (caso) =>
          caso.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caso.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caso.contraparte.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (estadoFilter !== 'todos') {
      filtered = filtered.filter((caso) => caso.estado === estadoFilter)
    }

    if (urgenciaFilter !== 'todos') {
      filtered = filtered.filter((caso) => caso.urgencia === urgenciaFilter)
    }

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter((caso) => caso.tipo === tipoFilter)
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
        case 'urgencia':
          const urgenciaOrder = { ALTA: 0, MEDIA: 1, BAJA: 2 }
          return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia]
        case 'plazo':
          if (!a.dias_restantes) return 1
          if (!b.dias_restantes) return -1
          return a.dias_restantes - b.dias_restantes
        default:
          return 0
      }
    })

    setFilteredCasos(filtered)
  }, [searchTerm, estadoFilter, urgenciaFilter, tipoFilter, sortBy, casos, clienteId])

  const fetchCasos = async () => {
    // Mock data
    const mockCasos: Caso[] = [
      {
        id: '1',
        nurej: 'LP-001-2024-CV',
        tipo: 'Civil',
        materia: 'Cobro de bolivianos',
        estado: 'ADMITIDO',
        urgencia: 'MEDIA',
        cliente_id: 'c1',
        cliente_nombre: 'Carlos Morales',
        contraparte: 'Juan Pérez',
        fecha_inicio: '2024-10-15',
        juzgado: 'Juzgado 5to de Partido Civil',
        juez: 'Dra. María González',
        objeto_demanda: 'Cobro de Bs. 50,000 por incumplimiento de contrato',
        cuantia: 50000,
        proximo_vencimiento: '2024-12-15',
        dias_restantes: 13,
        progreso: 30,
      },
      {
        id: '2',
        nurej: 'LP-045-2024-FM',
        tipo: 'Familia',
        materia: 'Asistencia familiar',
        estado: 'EN_AUDIENCIA_PRELIMINAR',
        urgencia: 'ALTA',
        cliente_id: 'c2',
        cliente_nombre: 'María López',
        contraparte: 'Pedro García',
        fecha_inicio: '2024-09-20',
        juzgado: 'Juzgado 2do de Familia',
        juez: 'Dr. Carlos Quispe',
        objeto_demanda: 'Solicitud de pensión alimenticia',
        cuantia: null,
        proximo_vencimiento: '2024-12-05',
        dias_restantes: 3,
        progreso: 50,
      },
      {
        id: '3',
        nurej: 'LP-089-2024-LB',
        tipo: 'Laboral',
        materia: 'Beneficios sociales',
        estado: 'EN_PRUEBA',
        urgencia: 'ALTA',
        cliente_id: 'c3',
        cliente_nombre: 'Roberto Sánchez',
        contraparte: 'Empresa XYZ S.A.',
        fecha_inicio: '2024-08-10',
        juzgado: 'Juzgado 1ro de Trabajo',
        juez: 'Dra. Ana Flores',
        objeto_demanda: 'Reclamo de beneficios sociales',
        cuantia: 80000,
        proximo_vencimiento: '2024-12-09',
        dias_restantes: 7,
        progreso: 65,
      },
      {
        id: '4',
        nurej: 'LP-112-2024-CV',
        tipo: 'Civil',
        materia: 'Resolución de contrato',
        estado: 'ADMITIDO',
        urgencia: 'BAJA',
        cliente_id: 'c1',
        cliente_nombre: 'Carlos Morales',
        contraparte: 'María Condori',
        fecha_inicio: '2024-11-05',
        juzgado: 'Juzgado 3ro de Partido Civil',
        juez: 'Dr. Luis Mamani',
        objeto_demanda: 'Resolución de contrato de compraventa',
        cuantia: 120000,
        proximo_vencimiento: '2024-12-20',
        dias_restantes: 18,
        progreso: 20,
      },
    ]

    setCasos(mockCasos)
    setFilteredCasos(mockCasos)
    setLoading(false)
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      ADMITIDO: { label: 'Admitido', variant: 'default' },
      EN_AUDIENCIA_PRELIMINAR: { label: 'En Audiencia', variant: 'secondary' },
      EN_PRUEBA: { label: 'En Prueba', variant: 'secondary' },
      SENTENCIADO: { label: 'Sentenciado', variant: 'outline' },
    }
    const estado_data = estados[estado] || { label: estado, variant: 'outline' as const }
    return <Badge variant={estado_data.variant}>{estado_data.label}</Badge>
  }

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case 'ALTA':
        return <Badge variant="destructive">Urgente</Badge>
      case 'MEDIA':
        return <Badge variant="default">Media</Badge>
      case 'BAJA':
        return <Badge variant="outline">Baja</Badge>
      default:
        return <Badge>{urgencia}</Badge>
    }
  }

  const getDiasColor = (dias: number | null) => {
    if (!dias) return 'text-muted-foreground'
    if (dias <= 3) return 'text-red-600'
    if (dias <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const casosUrgentes = casos.filter((c) => c.urgencia === 'ALTA')
  const casosActivos = casos.filter((c) => c.estado !== 'SENTENCIADO')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando casos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Casos</h1>
          <p className="text-muted-foreground">
            Gestión completa de tus casos judiciales{' '}
            {clienteId && '- Filtrado por cliente'}
          </p>
        </div>
        <Button asChild>
          <Link href="/abogado/demanda/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Demanda
          </Link>
        </Button>
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
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold">{casosUrgentes.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audiencias del Mes</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencimientos Próximos</p>
                <p className="text-2xl font-bold">
                  {casos.filter((c) => c.dias_restantes && c.dias_restantes <= 7).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por NUREJ, cliente o contraparte..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={urgenciaFilter} onValueChange={setUrgenciaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las urgencias</SelectItem>
                <SelectItem value="ALTA">Urgente</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="BAJA">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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

          <div className="mt-4 flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <Button
              size="sm"
              variant={sortBy === 'fecha' ? 'default' : 'outline'}
              onClick={() => setSortBy('fecha')}
            >
              Fecha
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'urgencia' ? 'default' : 'outline'}
              onClick={() => setSortBy('urgencia')}
            >
              Urgencia
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'plazo' ? 'default' : 'outline'}
              onClick={() => setSortBy('plazo')}
            >
              Plazo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vista de casos */}
      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Vista de Lista</TabsTrigger>
          <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-6">
          {filteredCasos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {searchTerm ||
                  estadoFilter !== 'todos' ||
                  urgenciaFilter !== 'todos' ||
                  tipoFilter !== 'todos'
                    ? 'No se encontraron casos con los filtros aplicados'
                    : 'No tienes casos registrados'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCasos.map((caso) => (
                <Card key={caso.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{caso.nurej}</CardTitle>
                          {getEstadoBadge(caso.estado)}
                          {getUrgenciaBadge(caso.urgencia)}
                        </div>
                        <CardDescription className="mt-1">
                          {caso.tipo} - {caso.materia}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/abogado/casos/${caso.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium">Cliente</p>
                          <p className="text-sm text-muted-foreground">{caso.cliente_nombre}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Contraparte</p>
                          <p className="text-sm text-muted-foreground">{caso.contraparte}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Juzgado</p>
                          <p className="text-sm text-muted-foreground">{caso.juzgado}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Cuantía</p>
                          <p className="text-sm text-muted-foreground">
                            {caso.cuantia ? `Bs. ${caso.cuantia.toLocaleString()}` : 'Sin cuantía'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-medium">Progreso</p>
                          <span className="text-sm text-muted-foreground">{caso.progreso}%</span>
                        </div>
                        <Progress value={caso.progreso} className="h-2" />
                      </div>

                      {caso.dias_restantes && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Próximo vencimiento</span>
                          </div>
                          <span
                            className={`text-sm font-bold ${getDiasColor(caso.dias_restantes)}`}
                          >
                            {caso.dias_restantes} días restantes
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Columna ALTA */}
            <Card>
              <CardHeader className="border-b border-red-200 bg-red-50">
                <CardTitle className="flex items-center justify-between text-red-700">
                  <span>Urgente</span>
                  <Badge variant="destructive">
                    {filteredCasos.filter((c) => c.urgencia === 'ALTA').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {filteredCasos
                  .filter((c) => c.urgencia === 'ALTA')
                  .map((caso) => (
                    <Card key={caso.id}>
                      <CardContent className="p-3">
                        <p className="font-semibold text-sm">{caso.nurej}</p>
                        <p className="text-xs text-muted-foreground">{caso.cliente_nombre}</p>
                        <div className="mt-2 flex items-center justify-between">
                          {getEstadoBadge(caso.estado)}
                          {caso.dias_restantes && (
                            <span className="text-xs font-bold text-red-600">
                              {caso.dias_restantes}d
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>

            {/* Columna MEDIA */}
            <Card>
              <CardHeader className="border-b border-yellow-200 bg-yellow-50">
                <CardTitle className="flex items-center justify-between text-yellow-700">
                  <span>Media</span>
                  <Badge variant="default">
                    {filteredCasos.filter((c) => c.urgencia === 'MEDIA').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {filteredCasos
                  .filter((c) => c.urgencia === 'MEDIA')
                  .map((caso) => (
                    <Card key={caso.id}>
                      <CardContent className="p-3">
                        <p className="font-semibold text-sm">{caso.nurej}</p>
                        <p className="text-xs text-muted-foreground">{caso.cliente_nombre}</p>
                        <div className="mt-2 flex items-center justify-between">
                          {getEstadoBadge(caso.estado)}
                          {caso.dias_restantes && (
                            <span className="text-xs font-bold text-yellow-600">
                              {caso.dias_restantes}d
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>

            {/* Columna BAJA */}
            <Card>
              <CardHeader className="border-b border-green-200 bg-green-50">
                <CardTitle className="flex items-center justify-between text-green-700">
                  <span>Baja</span>
                  <Badge variant="outline">
                    {filteredCasos.filter((c) => c.urgencia === 'BAJA').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {filteredCasos
                  .filter((c) => c.urgencia === 'BAJA')
                  .map((caso) => (
                    <Card key={caso.id}>
                      <CardContent className="p-3">
                        <p className="font-semibold text-sm">{caso.nurej}</p>
                        <p className="text-xs text-muted-foreground">{caso.cliente_nombre}</p>
                        <div className="mt-2 flex items-center justify-between">
                          {getEstadoBadge(caso.estado)}
                          {caso.dias_restantes && (
                            <span className="text-xs font-bold text-green-600">
                              {caso.dias_restantes}d
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function MisCasosPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <p>Cargando casos...</p>
      </div>
    }>
      <MisCasosContent />
    </Suspense>
  )
}
