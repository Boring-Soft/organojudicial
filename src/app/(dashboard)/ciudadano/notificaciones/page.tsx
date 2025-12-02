'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, CheckCheck, Filter, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notificacion {
  id: string
  tipo: 'CITACION' | 'AUDIENCIA' | 'RESOLUCION' | 'SENTENCIA' | 'PLAZO' | 'MENSAJE' | 'SISTEMA'
  titulo: string
  descripcion: string
  proceso_id: string | null
  proceso_nurej: string | null
  fecha: string
  leida: boolean
  importante: boolean
}

export default function NotificacionesPage() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [filteredNotificaciones, setFilteredNotificaciones] = useState<Notificacion[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotificaciones()
  }, [user])

  useEffect(() => {
    let filtered = notificaciones

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter((n) => n.tipo === tipoFilter)
    }

    setFilteredNotificaciones(filtered)
  }, [tipoFilter, notificaciones])

  const fetchNotificaciones = async () => {
    // Mock data - en producción vendría de Supabase
    const mockNotificaciones: Notificacion[] = [
      {
        id: '1',
        tipo: 'CITACION',
        titulo: 'Nueva citación registrada',
        descripcion:
          'Se ha registrado tu citación para el proceso LP-001-2024-CV. Tienes 30 días para contestar la demanda.',
        proceso_id: '1',
        proceso_nurej: 'LP-001-2024-CV',
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        leida: false,
        importante: true,
      },
      {
        id: '2',
        tipo: 'AUDIENCIA',
        titulo: 'Audiencia programada',
        descripcion:
          'Se ha programado audiencia preliminar para el 05 de diciembre a las 09:00 en el Juzgado 2do de Familia.',
        proceso_id: '2',
        proceso_nurej: 'LP-045-2024-FM',
        fecha: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        leida: false,
        importante: true,
      },
      {
        id: '3',
        tipo: 'PLAZO',
        titulo: 'Plazo próximo a vencer',
        descripcion:
          'Quedan 3 días para presentar prueba documental en el proceso LP-089-2024-LB.',
        proceso_id: '3',
        proceso_nurej: 'LP-089-2024-LB',
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        leida: false,
        importante: true,
      },
      {
        id: '4',
        tipo: 'MENSAJE',
        titulo: 'Mensaje de tu abogado',
        descripcion:
          'El abogado Juan Pérez te ha enviado un mensaje sobre tu caso. Revisa el chat para más detalles.',
        proceso_id: null,
        proceso_nurej: null,
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        leida: true,
        importante: false,
      },
      {
        id: '5',
        tipo: 'RESOLUCION',
        titulo: 'Nueva resolución',
        descripcion:
          'El juez ha emitido una resolución en tu proceso LP-001-2024-CV. Descárgala para revisarla.',
        proceso_id: '1',
        proceso_nurej: 'LP-001-2024-CV',
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        leida: true,
        importante: false,
      },
      {
        id: '6',
        tipo: 'SENTENCIA',
        titulo: 'Sentencia disponible',
        descripcion:
          'La sentencia del proceso LP-112-2023-CV está disponible. Tienes 15 días para apelar si lo deseas.',
        proceso_id: '4',
        proceso_nurej: 'LP-112-2023-CV',
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        leida: true,
        importante: true,
      },
      {
        id: '7',
        tipo: 'SISTEMA',
        titulo: 'Actualización del sistema',
        descripcion:
          'El sistema SIGPJ ha sido actualizado con nuevas funcionalidades. Revisa las novedades.',
        proceso_id: null,
        proceso_nurej: null,
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        leida: true,
        importante: false,
      },
    ]

    setNotificaciones(mockNotificaciones)
    setFilteredNotificaciones(mockNotificaciones)
    setLoading(false)
  }

  const marcarComoLeida = async (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }

  const marcarTodasComoLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const eliminarNotificacion = async (id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
  }

  const eliminarSeleccionadas = async () => {
    setNotificaciones((prev) => prev.filter((n) => !selectedIds.includes(n.id)))
    setSelectedIds([])
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotificaciones.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotificaciones.map((n) => n.id))
    }
  }

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, React.ReactNode> = {
      CITACION: <Bell className="h-4 w-4" />,
      AUDIENCIA: <Bell className="h-4 w-4" />,
      RESOLUCION: <Bell className="h-4 w-4" />,
      SENTENCIA: <Bell className="h-4 w-4" />,
      PLAZO: <Bell className="h-4 w-4" />,
      MENSAJE: <Bell className="h-4 w-4" />,
      SISTEMA: <BellOff className="h-4 w-4" />,
    }
    return icons[tipo] || <Bell className="h-4 w-4" />
  }

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      CITACION: { label: 'Citación', variant: 'destructive' },
      AUDIENCIA: { label: 'Audiencia', variant: 'default' },
      RESOLUCION: { label: 'Resolución', variant: 'secondary' },
      SENTENCIA: { label: 'Sentencia', variant: 'default' },
      PLAZO: { label: 'Plazo', variant: 'destructive' },
      MENSAJE: { label: 'Mensaje', variant: 'outline' },
      SISTEMA: { label: 'Sistema', variant: 'secondary' },
    }
    const tipo_data = tipos[tipo] || { label: tipo, variant: 'outline' as const }
    return <Badge variant={tipo_data.variant}>{tipo_data.label}</Badge>
  }

  const getTiempoRelativo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const minutos = Math.floor(diff / (1000 * 60))
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutos < 60) return `Hace ${minutos} minutos`
    if (horas < 24) return `Hace ${horas} horas`
    if (dias < 7) return `Hace ${dias} días`
    return format(new Date(fecha), 'dd MMM yyyy', { locale: es })
  }

  const noLeidas = notificaciones.filter((n) => !n.leida)
  const leidas = notificaciones.filter((n) => n.leida)
  const importantes = notificaciones.filter((n) => n.importante)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando notificaciones...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <p className="text-muted-foreground">
          Mantente al día con todas las actualizaciones de tus procesos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notificaciones.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Leídas</p>
                <p className="text-2xl font-bold">{noLeidas.length}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leídas</p>
                <p className="text-2xl font-bold">{leidas.length}</p>
              </div>
              <CheckCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Importantes</p>
                <p className="text-2xl font-bold">{importantes.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedIds.length === filteredNotificaciones.length &&
                  filteredNotificaciones.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm">
                {selectedIds.length > 0
                  ? `${selectedIds.length} seleccionada(s)`
                  : 'Seleccionar todas'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="CITACION">Citaciones</SelectItem>
                  <SelectItem value="AUDIENCIA">Audiencias</SelectItem>
                  <SelectItem value="RESOLUCION">Resoluciones</SelectItem>
                  <SelectItem value="SENTENCIA">Sentencias</SelectItem>
                  <SelectItem value="PLAZO">Plazos</SelectItem>
                  <SelectItem value="MENSAJE">Mensajes</SelectItem>
                </SelectContent>
              </Select>
              {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={eliminarSeleccionadas}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
              {noLeidas.length > 0 && (
                <Button variant="outline" size="sm" onClick={marcarTodasComoLeidas}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas ({notificaciones.length})</TabsTrigger>
          <TabsTrigger value="no-leidas">No Leídas ({noLeidas.length})</TabsTrigger>
          <TabsTrigger value="importantes">Importantes ({importantes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          {filteredNotificaciones.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No hay notificaciones</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotificaciones.map((notificacion) => (
                <Card
                  key={notificacion.id}
                  className={`${
                    !notificacion.leida ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.includes(notificacion.id)}
                        onCheckedChange={() => toggleSelection(notificacion.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getTipoIcon(notificacion.tipo)}
                              <p className="font-semibold">{notificacion.titulo}</p>
                              {!notificacion.leida && (
                                <Badge variant="destructive" className="text-xs">
                                  Nueva
                                </Badge>
                              )}
                              {notificacion.importante && (
                                <Badge variant="outline" className="text-xs">
                                  Importante
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {notificacion.descripcion}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {getTipoBadge(notificacion.tipo)}
                              {notificacion.proceso_nurej && (
                                <Badge variant="outline">{notificacion.proceso_nurej}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {getTiempoRelativo(notificacion.fecha)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notificacion.leida && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => marcarComoLeida(notificacion.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarNotificacion(notificacion.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="no-leidas">
          {noLeidas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  ¡Excelente! No tienes notificaciones sin leer
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {noLeidas.map((notificacion) => (
                <Card
                  key={notificacion.id}
                  className="border-l-4 border-l-primary bg-primary/5"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getTipoIcon(notificacion.tipo)}
                              <p className="font-semibold">{notificacion.titulo}</p>
                              <Badge variant="destructive" className="text-xs">
                                Nueva
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {notificacion.descripcion}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {getTipoBadge(notificacion.tipo)}
                              {notificacion.proceso_nurej && (
                                <Badge variant="outline">{notificacion.proceso_nurej}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {getTiempoRelativo(notificacion.fecha)}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoLeida(notificacion.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Marcar como leída
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="importantes">
          {importantes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No hay notificaciones importantes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {importantes.map((notificacion) => (
                <Card key={notificacion.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getTipoIcon(notificacion.tipo)}
                              <p className="font-semibold">{notificacion.titulo}</p>
                              <Badge variant="outline" className="text-xs">
                                Importante
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {notificacion.descripcion}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {getTipoBadge(notificacion.tipo)}
                              {notificacion.proceso_nurej && (
                                <Badge variant="outline">{notificacion.proceso_nurej}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {getTiempoRelativo(notificacion.fecha)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
