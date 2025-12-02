'use client'

import { useState, useEffect } from 'react'
import { Calendar, UserCheck, UserX, Clock, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Vinculacion {
  id: string
  abogado_id: string
  abogado: {
    nombres: string
    apellidos: string
    email: string
    numero_registro: string
  }
  estado: 'PENDIENTE' | 'ACTIVA' | 'RECHAZADA' | 'FINALIZADA'
  fecha_solicitud: string
  fecha_respuesta: string | null
  fecha_vinculacion: string | null
  fecha_fin: string | null
  motivo_rechazo: string | null
  motivo_desvinculacion: string | null
  mensaje_solicitud: string | null
  tipo_caso: string | null
  activo: boolean
}

export default function HistorialVinculacionesCiudadanoPage() {
  const { user } = useAuth()
  const [vinculaciones, setVinculaciones] = useState<Vinculacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVinculaciones()
  }, [user])

  const fetchVinculaciones = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .select(
          `
          id,
          abogado_id,
          estado,
          fecha_solicitud,
          fecha_respuesta,
          fecha_vinculacion,
          fecha_fin,
          motivo_rechazo,
          motivo_desvinculacion,
          mensaje_solicitud,
          tipo_caso,
          activo,
          abogado:usuarios!vinculaciones_abogado_ciudadano_abogado_id_fkey (
            nombres,
            apellidos,
            email,
            numero_registro
          )
        `
        )
        .eq('ciudadano_id', user.id)
        .order('fecha_solicitud', { ascending: false })

      if (error) throw error

      setVinculaciones(data || [])
    } catch (error) {
      console.error('Error al cargar vinculaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return <Badge variant="default">Activa</Badge>
      case 'PENDIENTE':
        return <Badge variant="secondary">Pendiente</Badge>
      case 'RECHAZADA':
        return <Badge variant="destructive">Rechazada</Badge>
      case 'FINALIZADA':
        return <Badge variant="outline">Finalizada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getDuracion = (inicio: string, fin: string | null) => {
    const fechaInicio = new Date(inicio)
    const fechaFin = fin ? new Date(fin) : new Date()
    const dias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))

    if (dias < 30) return `${dias} días`
    if (dias < 365) return `${Math.floor(dias / 30)} meses`
    return `${Math.floor(dias / 365)} años`
  }

  const pendientes = vinculaciones.filter((v) => v.estado === 'PENDIENTE')
  const activa = vinculaciones.find((v) => v.estado === 'ACTIVA' && v.activo)
  const finalizadas = vinculaciones.filter(
    (v) => v.estado === 'FINALIZADA' || (v.estado === 'ACTIVA' && !v.activo)
  )
  const rechazadas = vinculaciones.filter((v) => v.estado === 'RECHAZADA')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Historial de Vinculaciones</h1>
        <p className="text-muted-foreground">
          Registro de todas tus solicitudes y relaciones con abogados
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Solicitudes</p>
                <p className="text-2xl font-bold">{vinculaciones.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendientes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activa</p>
                <p className="text-2xl font-bold">{activa ? 1 : 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold">{rechazadas.length}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas ({vinculaciones.length})</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes ({pendientes.length})</TabsTrigger>
          <TabsTrigger value="activa">Activa ({activa ? 1 : 0})</TabsTrigger>
          <TabsTrigger value="finalizadas">Finalizadas ({finalizadas.length})</TabsTrigger>
          <TabsTrigger value="rechazadas">Rechazadas ({rechazadas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Solicitudes</CardTitle>
              <CardDescription>Historial completo de tus solicitudes de representación</CardDescription>
            </CardHeader>
            <CardContent>
              {vinculaciones.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No has realizado solicitudes de representación</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Abogado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tipo de Caso</TableHead>
                      <TableHead>Fecha Solicitud</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vinculaciones.map((vinculacion) => (
                      <TableRow key={vinculacion.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.abogado.nombres,
                                  vinculacion.abogado.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.abogado.nombres} {vinculacion.abogado.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Reg: {vinculacion.abogado.numero_registro}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(vinculacion.estado)}</TableCell>
                        <TableCell>
                          {vinculacion.tipo_caso || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(vinculacion.fecha_solicitud), 'dd MMM yyyy', {
                              locale: es,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vinculacion.fecha_vinculacion ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {getDuracion(vinculacion.fecha_vinculacion, vinculacion.fecha_fin)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vinculacion.motivo_desvinculacion && (
                            <p className="text-sm text-muted-foreground">
                              {vinculacion.motivo_desvinculacion}
                            </p>
                          )}
                          {vinculacion.motivo_rechazo && (
                            <p className="text-sm text-destructive">{vinculacion.motivo_rechazo}</p>
                          )}
                          {!vinculacion.motivo_desvinculacion && !vinculacion.motivo_rechazo && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendientes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <CardDescription>Esperando respuesta del abogado</CardDescription>
            </CardHeader>
            <CardContent>
              {pendientes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tienes solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendientes.map((vinculacion) => (
                    <Card key={vinculacion.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.abogado.nombres,
                                  vinculacion.abogado.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {vinculacion.abogado.nombres} {vinculacion.abogado.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {vinculacion.abogado.email}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">{vinculacion.tipo_caso || 'General'}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  Solicitado{' '}
                                  {format(new Date(vinculacion.fecha_solicitud), 'dd MMM yyyy', {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">Pendiente</Badge>
                        </div>
                        {vinculacion.mensaje_solicitud && (
                          <div className="mt-3 rounded-md bg-muted p-3">
                            <p className="text-sm">{vinculacion.mensaje_solicitud}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activa">
          <Card>
            <CardHeader>
              <CardTitle>Vinculación Activa</CardTitle>
              <CardDescription>Tu abogado actual</CardDescription>
            </CardHeader>
            <CardContent>
              {!activa ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tienes un abogado vinculado actualmente</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {getInitials(activa.abogado.nombres, activa.abogado.apellidos)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              {activa.abogado.nombres} {activa.abogado.apellidos}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Registro: {activa.abogado.numero_registro}
                            </p>
                            <p className="text-sm text-muted-foreground">{activa.abogado.email}</p>
                          </div>
                          <Badge variant="default">Activa</Badge>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Vinculado desde{' '}
                              {format(new Date(activa.fecha_vinculacion!), 'dd MMM yyyy', {
                                locale: es,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Duración: {getDuracion(activa.fecha_vinculacion!, null)}</span>
                          </div>
                          {activa.tipo_caso && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Tipo de caso: {activa.tipo_caso}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finalizadas">
          <Card>
            <CardHeader>
              <CardTitle>Vinculaciones Finalizadas</CardTitle>
              <CardDescription>Relaciones con abogados que han concluido</CardDescription>
            </CardHeader>
            <CardContent>
              {finalizadas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay vinculaciones finalizadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {finalizadas.map((vinculacion) => (
                    <Card key={vinculacion.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.abogado.nombres,
                                  vinculacion.abogado.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.abogado.nombres} {vinculacion.abogado.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {vinculacion.fecha_vinculacion &&
                                  format(new Date(vinculacion.fecha_vinculacion), 'dd MMM yyyy', {
                                    locale: es,
                                  })}{' '}
                                -{' '}
                                {vinculacion.fecha_fin &&
                                  format(new Date(vinculacion.fecha_fin), 'dd MMM yyyy', {
                                    locale: es,
                                  })}
                              </p>
                              {vinculacion.motivo_desvinculacion && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {vinculacion.motivo_desvinculacion}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline">Finalizada</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rechazadas">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Rechazadas</CardTitle>
              <CardDescription>Solicitudes que no fueron aceptadas</CardDescription>
            </CardHeader>
            <CardContent>
              {rechazadas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tienes solicitudes rechazadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rechazadas.map((vinculacion) => (
                    <Card key={vinculacion.id} className="border-l-4 border-l-destructive">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.abogado.nombres,
                                  vinculacion.abogado.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.abogado.nombres} {vinculacion.abogado.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Rechazada el{' '}
                                {vinculacion.fecha_respuesta &&
                                  format(new Date(vinculacion.fecha_respuesta), 'dd MMM yyyy', {
                                    locale: es,
                                  })}
                              </p>
                              {vinculacion.motivo_rechazo && (
                                <div className="mt-2 rounded-md bg-destructive/10 p-2">
                                  <p className="text-xs text-destructive">
                                    <strong>Motivo:</strong> {vinculacion.motivo_rechazo}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="destructive">Rechazada</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
