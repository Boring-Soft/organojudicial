'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/providers/auth-provider'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

interface Evento {
  id: string
  tipo: 'AUDIENCIA' | 'VENCIMIENTO' | 'REUNION' | 'OTRO'
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  duracion: number
  caso_nurej: string | null
  ubicacion: string | null
  participantes: string[]
  virtual: boolean
  url_videollamada: string | null
}

export default function CalendarioPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventos, setEventos] = useState<Evento[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)
  const [vistaCalendario, setVistaCalendario] = useState<'mes' | 'semana' | 'dia'>('mes')

  useEffect(() => {
    fetchEventos()
  }, [user, currentDate])

  const fetchEventos = async () => {
    // Mock data
    const mockEventos: Evento[] = [
      {
        id: '1',
        tipo: 'AUDIENCIA',
        titulo: 'Audiencia Preliminar',
        descripcion: 'Audiencia preliminar del caso LP-045-2024-FM',
        fecha: '2024-12-05',
        hora: '09:00',
        duracion: 120,
        caso_nurej: 'LP-045-2024-FM',
        ubicacion: 'Juzgado 2do de Familia - Sala 3',
        participantes: ['Cliente: María López', 'Contraparte: Pedro García', 'Juez: Dr. Carlos Quispe'],
        virtual: false,
        url_videollamada: null,
      },
      {
        id: '2',
        tipo: 'VENCIMIENTO',
        titulo: 'Presentar prueba documental',
        descripcion: 'Plazo para presentar pruebas en el caso LP-089-2024-LB',
        fecha: '2024-12-09',
        hora: '23:59',
        duracion: 0,
        caso_nurej: 'LP-089-2024-LB',
        ubicacion: null,
        participantes: [],
        virtual: false,
        url_videollamada: null,
      },
      {
        id: '3',
        tipo: 'REUNION',
        titulo: 'Reunión con cliente',
        descripcion: 'Revisión de estrategia legal para el caso LP-001-2024-CV',
        fecha: '2024-12-10',
        hora: '15:00',
        duracion: 60,
        caso_nurej: 'LP-001-2024-CV',
        ubicacion: 'Oficina',
        participantes: ['Cliente: Carlos Morales'],
        virtual: false,
        url_videollamada: null,
      },
      {
        id: '4',
        tipo: 'AUDIENCIA',
        titulo: 'Audiencia Complementaria',
        descripcion: 'Audiencia complementaria virtual',
        fecha: '2024-12-12',
        hora: '14:30',
        duracion: 90,
        caso_nurej: 'LP-034-2024-LB',
        ubicacion: 'Virtual',
        participantes: ['Cliente: Roberto Sánchez', 'Contraparte: Empresa ABC'],
        virtual: true,
        url_videollamada: 'https://meet.google.com/abc-defg-hij',
      },
      {
        id: '5',
        tipo: 'VENCIMIENTO',
        titulo: 'Presentar alegatos finales',
        descripcion: 'Plazo para presentar alegatos en LP-001-2024-CV',
        fecha: '2024-12-15',
        hora: '18:00',
        duracion: 0,
        caso_nurej: 'LP-001-2024-CV',
        ubicacion: null,
        participantes: [],
        virtual: false,
        url_videollamada: null,
      },
    ]

    setEventos(mockEventos)
    setLoading(false)
  }

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const getEventosForDate = (date: Date) => {
    return eventos.filter((evento) => isSameDay(new Date(evento.fecha), date))
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'AUDIENCIA':
        return 'bg-blue-500 text-white'
      case 'VENCIMIENTO':
        return 'bg-red-500 text-white'
      case 'REUNION':
        return 'bg-green-500 text-white'
      case 'OTRO':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'AUDIENCIA':
        return <Badge className="bg-blue-500">Audiencia</Badge>
      case 'VENCIMIENTO':
        return <Badge variant="destructive">Vencimiento</Badge>
      case 'REUNION':
        return <Badge className="bg-green-500">Reunión</Badge>
      case 'OTRO':
        return <Badge variant="outline">Otro</Badge>
      default:
        return <Badge>{tipo}</Badge>
    }
  }

  const days = getDaysInMonth()
  const eventosHoy = getEventosForDate(new Date())
  const proximosEventos = eventos
    .filter((e) => new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha + ' ' + a.hora).getTime() - new Date(b.fecha + ' ' + b.hora).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando calendario...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendario</h1>
        <p className="text-muted-foreground">Gestión de audiencias, plazos y reuniones</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos Hoy</p>
                <p className="text-2xl font-bold">{eventosHoy.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audiencias del Mes</p>
                <p className="text-2xl font-bold">
                  {eventos.filter((e) => e.tipo === 'AUDIENCIA').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencimientos Próximos</p>
                <p className="text-2xl font-bold">
                  {eventos.filter((e) => e.tipo === 'VENCIMIENTO' && new Date(e.fecha) >= new Date()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reuniones</p>
                <p className="text-2xl font-bold">
                  {eventos.filter((e) => e.tipo === 'REUNION').length}
                </p>
              </div>
              <Video className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(currentDate, 'MMMM yyyy', { locale: es }).charAt(0).toUpperCase() +
                    format(currentDate, 'MMMM yyyy', { locale: es }).slice(1)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Hoy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Encabezados de días */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const eventosDelDia = getEventosForDate(day)
                  const esHoy = isSameDay(day, new Date())
                  const esMesActual = isSameMonth(day, currentDate)

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-24 rounded-lg border p-2 cursor-pointer transition-colors ${
                        esHoy ? 'border-primary bg-primary/5' : ''
                      } ${esMesActual ? '' : 'opacity-40'} hover:bg-muted`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {eventosDelDia.slice(0, 2).map((evento) => (
                          <div
                            key={evento.id}
                            className={`text-xs rounded px-1 py-0.5 truncate ${getTipoColor(
                              evento.tipo
                            )}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvento(evento)
                            }}
                          >
                            {evento.hora} {evento.titulo}
                          </div>
                        ))}
                        {eventosDelDia.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{eventosDelDia.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Próximos eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              <CardDescription>Tus próximas actividades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {proximosEventos.map((evento) => (
                <Card
                  key={evento.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedEvento(evento)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="mt-1 h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-sm">{evento.titulo}</p>
                          {getTipoBadge(evento.tipo)}
                        </div>
                        {evento.caso_nurej && (
                          <p className="text-xs text-muted-foreground">{evento.caso_nurej}</p>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(evento.fecha), 'dd MMM', { locale: es })} • {evento.hora}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Leyenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leyenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-500" />
                <span className="text-sm">Audiencias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-500" />
                <span className="text-sm">Vencimientos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <span className="text-sm">Reuniones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-500" />
                <span className="text-sm">Otros</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de detalle de evento */}
      <Dialog open={!!selectedEvento} onOpenChange={() => setSelectedEvento(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle>{selectedEvento?.titulo}</DialogTitle>
              {selectedEvento && getTipoBadge(selectedEvento.tipo)}
            </div>
            <DialogDescription>{selectedEvento?.descripcion}</DialogDescription>
          </DialogHeader>
          {selectedEvento && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(selectedEvento.fecha), 'EEEE, dd MMMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {selectedEvento.hora} ({selectedEvento.duracion} minutos)
                </span>
              </div>
              {selectedEvento.ubicacion && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{selectedEvento.ubicacion}</span>
                </div>
              )}
              {selectedEvento.caso_nurej && (
                <div>
                  <p className="text-sm font-medium">Caso</p>
                  <p className="text-sm text-muted-foreground">{selectedEvento.caso_nurej}</p>
                </div>
              )}
              {selectedEvento.participantes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Participantes</p>
                  {selectedEvento.participantes.map((p, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      • {p}
                    </p>
                  ))}
                </div>
              )}
              {selectedEvento.virtual && selectedEvento.url_videollamada && (
                <div>
                  <Button className="w-full" asChild>
                    <a href={selectedEvento.url_videollamada} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Unirse a videollamada
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de día seleccionado */}
      <Dialog open={!!selectedDate && !selectedEvento} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && getEventosForDate(selectedDate).length} evento(s) programado(s)
            </DialogDescription>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-3">
              {getEventosForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay eventos programados para este día</p>
              ) : (
                getEventosForDate(selectedDate).map((evento) => (
                  <Card
                    key={evento.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setSelectedDate(null)
                      setSelectedEvento(evento)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{evento.titulo}</p>
                          <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {evento.hora}
                          </div>
                        </div>
                        {getTipoBadge(evento.tipo)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
