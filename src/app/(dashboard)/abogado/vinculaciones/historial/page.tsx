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
  ciudadano_id: string
  ciudadano: {
    nombres: string
    apellidos: string
    ci: string
    email: string
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

export default function HistorialVinculacionesPage() {
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
          ciudadano_id,
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
          ciudadano:usuarios!vinculaciones_abogado_ciudadano_ciudadano_id_fkey (
            nombres,
            apellidos,
            ci,
            email
          )
        `
        )
        .eq('abogado_id', user.id)
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

  const activas = vinculaciones.filter((v) => v.estado === 'ACTIVA' && v.activo)
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
        <p className="text-muted-foreground">Registro completo de relaciones con clientes</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vinculaciones</p>
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
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">{activas.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
                <p className="text-2xl font-bold">{finalizadas.length}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-500" />
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
          <TabsTrigger value="activas">Activas ({activas.length})</TabsTrigger>
          <TabsTrigger value="finalizadas">Finalizadas ({finalizadas.length})</TabsTrigger>
          <TabsTrigger value="rechazadas">Rechazadas ({rechazadas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Vinculaciones</CardTitle>
              <CardDescription>Registro completo de solicitudes y vinculaciones</CardDescription>
            </CardHeader>
            <CardContent>
              {vinculaciones.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay vinculaciones registradas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
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
                                  vinculacion.ciudadano.nombres,
                                  vinculacion.ciudadano.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.ciudadano.nombres} {vinculacion.ciudadano.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                CI: {vinculacion.ciudadano.ci}
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

        <TabsContent value="activas">
          <Card>
            <CardHeader>
              <CardTitle>Vinculaciones Activas</CardTitle>
              <CardDescription>Clientes con los que actualmente trabajas</CardDescription>
            </CardHeader>
            <CardContent>
              {activas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay vinculaciones activas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo de Caso</TableHead>
                      <TableHead>Desde</TableHead>
                      <TableHead>Duración</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activas.map((vinculacion) => (
                      <TableRow key={vinculacion.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.ciudadano.nombres,
                                  vinculacion.ciudadano.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.ciudadano.nombres} {vinculacion.ciudadano.apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {vinculacion.ciudadano.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vinculacion.tipo_caso || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(vinculacion.fecha_vinculacion!), 'dd MMM yyyy', {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDuracion(vinculacion.fecha_vinculacion!, null)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finalizadas">
          <Card>
            <CardHeader>
              <CardTitle>Vinculaciones Finalizadas</CardTitle>
              <CardDescription>Relaciones que han concluido</CardDescription>
            </CardHeader>
            <CardContent>
              {finalizadas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay vinculaciones finalizadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finalizadas.map((vinculacion) => (
                      <TableRow key={vinculacion.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.ciudadano.nombres,
                                  vinculacion.ciudadano.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.ciudadano.nombres} {vinculacion.ciudadano.apellidos}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vinculacion.fecha_vinculacion &&
                            format(new Date(vinculacion.fecha_vinculacion), 'dd MMM yyyy', {
                              locale: es,
                            })}
                        </TableCell>
                        <TableCell>
                          {vinculacion.fecha_fin &&
                            format(new Date(vinculacion.fecha_fin), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          {vinculacion.fecha_vinculacion &&
                            getDuracion(vinculacion.fecha_vinculacion, vinculacion.fecha_fin)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {vinculacion.motivo_desvinculacion || 'No especificado'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rechazadas">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Rechazadas</CardTitle>
              <CardDescription>Solicitudes que fueron rechazadas</CardDescription>
            </CardHeader>
            <CardContent>
              {rechazadas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay solicitudes rechazadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo de Caso</TableHead>
                      <TableHead>Fecha Solicitud</TableHead>
                      <TableHead>Fecha Rechazo</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rechazadas.map((vinculacion) => (
                      <TableRow key={vinculacion.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(
                                  vinculacion.ciudadano.nombres,
                                  vinculacion.ciudadano.apellidos
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {vinculacion.ciudadano.nombres} {vinculacion.ciudadano.apellidos}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vinculacion.tipo_caso || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(vinculacion.fecha_solicitud), 'dd MMM yyyy', {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          {vinculacion.fecha_respuesta &&
                            format(new Date(vinculacion.fecha_respuesta), 'dd MMM yyyy', {
                              locale: es,
                            })}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {vinculacion.motivo_rechazo || 'No especificado'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
