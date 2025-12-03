'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserCheck, UserX, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Solicitud {
  id: string
  ciudadano_id: string
  estado: string
  mensaje_solicitud: string
  tipo_caso: string
  urgencia: string
  fecha_solicitud: string
  fecha_respuesta: string | null
  motivo_rechazo: string | null
  ciudadano: {
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    ci: string | null
  }
}

/**
 * Página de gestión de solicitudes para abogados
 * Muestra solicitudes pendientes, aceptadas y rechazadas
 */
export default function SolicitudesAbogadoPage() {
  const router = useRouter()
  const { user, getUserRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [showAceptarModal, setShowAceptarModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      const rol = getUserRole()
      if (rol !== 'ABOGADO') {
        router.push('/403')
        return
      }
      await fetchSolicitudes()
      setLoading(false)
    }

    checkAccess()
  }, [getUserRole, router, user])

  const fetchSolicitudes = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .select(
          `
          *,
          ciudadano:usuarios!vinculaciones_abogado_ciudadano_ciudadano_id_fkey (
            nombres,
            apellidos,
            email,
            telefono,
            ci
          )
        `
        )
        .eq('abogado_id', user.id)
        .order('fecha_solicitud', { ascending: false })

      if (error) {
        console.error('Error fetching solicitudes:', error)
        return
      }

      setSolicitudes(data as unknown as Solicitud[])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAceptar = async () => {
    if (!selectedSolicitud) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .update({
          estado: 'ACTIVA',
          fecha_respuesta: new Date().toISOString(),
          activo: true,
        })
        .eq('id', selectedSolicitud.id)

      if (error) {
        console.error('Error updating solicitud:', error)
        alert('Error al aceptar la solicitud.')
        return
      }

      alert('¡Solicitud aceptada! El ciudadano será notificado.')
      setShowAceptarModal(false)
      setSelectedSolicitud(null)
      await fetchSolicitudes()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRechazar = async () => {
    if (!selectedSolicitud || !motivoRechazo) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .update({
          estado: 'RECHAZADA',
          fecha_respuesta: new Date().toISOString(),
          motivo_rechazo: motivoRechazo,
          activo: false,
        })
        .eq('id', selectedSolicitud.id)

      if (error) {
        console.error('Error updating solicitud:', error)
        alert('Error al rechazar la solicitud.')
        return
      }

      alert('Solicitud rechazada. El ciudadano será notificado.')
      setShowRechazarModal(false)
      setSelectedSolicitud(null)
      setMotivoRechazo('')
      await fetchSolicitudes()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getUrgenciaBadge = (urgencia: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      ALTA: { variant: 'destructive', label: 'Alta' },
      MEDIA: { variant: 'default', label: 'Media' },
      BAJA: { variant: 'secondary', label: 'Baja' },
    }
    const config = variants[urgencia] || variants.MEDIA
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const renderSolicitud = (solicitud: Solicitud) => (
    <Card key={solicitud.id} className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {solicitud.ciudadano.nombres} {solicitud.ciudadano.apellidos}
            </CardTitle>
            <CardDescription>
              {solicitud.ciudadano.email}
              {solicitud.ciudadano.telefono && ` • ${solicitud.ciudadano.telefono}`}
            </CardDescription>
          </div>
          {getUrgenciaBadge(solicitud.urgencia)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Tipo de caso:</span>
            <Badge variant="outline">{solicitud.tipo_caso}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">CI:</span>
            <span className="text-muted-foreground">{solicitud.ciudadano.ci || 'No proporcionado'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(new Date(solicitud.fecha_solicitud), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </span>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">Mensaje:</p>
            <p className="mt-1 text-sm text-muted-foreground">{solicitud.mensaje_solicitud}</p>
          </div>

          {solicitud.estado === 'PENDIENTE' && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedSolicitud(solicitud)
                  setShowAceptarModal(true)
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Aceptar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedSolicitud(solicitud)
                  setShowRechazarModal(true)
                }}
              >
                <UserX className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
            </div>
          )}

          {solicitud.estado === 'RECHAZADA' && solicitud.motivo_rechazo && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">Motivo del rechazo:</p>
              <p className="mt-1 text-sm text-destructive/80">{solicitud.motivo_rechazo}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE')
  const activas = solicitudes.filter((s) => s.estado === 'ACTIVA')
  const rechazadas = solicitudes.filter((s) => s.estado === 'RECHAZADA')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Solicitudes de Representación</h1>
        <p className="text-muted-foreground">
          Gestiona las solicitudes de ciudadanos que desean tu representación legal
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendientes.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
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
              <CheckCircle2 className="h-8 w-8 text-green-500" />
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
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con solicitudes */}
      <Tabs defaultValue="pendientes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pendientes">
            Pendientes
            {pendientes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendientes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activas">Activas ({activas.length})</TabsTrigger>
          <TabsTrigger value="rechazadas">Rechazadas ({rechazadas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes">
          {pendientes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No hay solicitudes pendientes</p>
                <p className="text-sm text-muted-foreground">
                  Las nuevas solicitudes aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendientes.map(renderSolicitud)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activas">
          {activas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No hay vinculaciones activas</p>
                <p className="text-sm text-muted-foreground">
                  Las solicitudes aceptadas aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activas.map(renderSolicitud)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rechazadas">
          {rechazadas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No hay solicitudes rechazadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rechazadas.map(renderSolicitud)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Aceptar */}
      <Dialog open={showAceptarModal} onOpenChange={setShowAceptarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceptar Solicitud de Representación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de aceptar esta solicitud? El ciudadano será notificado y podrás
              comenzar a representarlo.
            </DialogDescription>
          </DialogHeader>

          {selectedSolicitud && (
            <div className="space-y-3 rounded-lg bg-muted p-4">
              <p className="font-medium">
                Cliente: {selectedSolicitud.ciudadano.nombres}{' '}
                {selectedSolicitud.ciudadano.apellidos}
              </p>
              <p className="text-sm text-muted-foreground">
                Tipo de caso: {selectedSolicitud.tipo_caso}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAceptarModal(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleAceptar} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? 'Aceptando...' : 'Confirmar Aceptación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Rechazar */}
      <Dialog open={showRechazarModal} onOpenChange={setShowRechazarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo. Esto ayudará al ciudadano a entender tu
              decisión.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">
                Motivo del Rechazo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Ej: No tengo disponibilidad en este momento, Mi especialidad no corresponde al caso, etc."
                rows={4}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRechazarModal(false)
                  setMotivoRechazo('')
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRechazar}
                disabled={!motivoRechazo || submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Rechazando...' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
