'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Briefcase,
  MapPin,
  Award,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  MessageSquare,
  Loader2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

interface Abogado {
  id: string
  nombres: string
  apellidos: string
  registroAbogado: string | null
  email: string
  telefono: string | null
  juzgado: string | null
  activo: boolean
  createdAt: string
}

/**
 * Página de perfil público de abogado
 * Muestra información detallada y permite solicitar representación
 */
export default function PerfilAbogadoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, getUserRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [abogado, setAbogado] = useState<Abogado | null>(null)
  const [showSolicitudModal, setShowSolicitudModal] = useState(false)
  const [solicitudData, setSolicitudData] = useState({
    mensaje: '',
    tipoCaso: '',
    urgencia: 'MEDIA',
  })
  const [submitting, setSubmitting] = useState(false)

  const abogadoId = params?.id as string

  useEffect(() => {
    const fetchAbogado = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', abogadoId)
          .eq('rol', 'ABOGADO')
          .single()

        if (error || !data) {
          console.error('Error fetching abogado:', error)
          router.push('/ciudadano/abogados/buscar')
          return
        }

        setAbogado(data as Abogado)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (abogadoId) {
      fetchAbogado()
    }
  }, [abogadoId, router])

  // Enviar solicitud
  const handleEnviarSolicitud = async () => {
    if (!abogadoId || !user) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from('vinculaciones_abogado_ciudadano').insert({
        abogado_id: abogadoId,
        ciudadano_id: user.id,
        estado: 'PENDIENTE',
        mensaje_solicitud: solicitudData.mensaje,
        tipo_caso: solicitudData.tipoCaso,
        urgencia: solicitudData.urgencia,
        fecha_solicitud: new Date().toISOString(),
      })

      if (error) {
        console.error('Error creating solicitud:', error)
        alert('Error al enviar la solicitud.')
        return
      }

      alert('¡Solicitud enviada exitosamente!')
      setShowSolicitudModal(false)
      setSolicitudData({ mensaje: '', tipoCaso: '', urgencia: 'MEDIA' })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!abogado) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">Abogado no encontrado</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = () => {
    return `${abogado.nombres.charAt(0)}${abogado.apellidos.charAt(0)}`.toUpperCase()
  }

  // Datos de ejemplo
  const experienciaAnios = Math.floor(Math.random() * 15) + 5
  const casosGanados = Math.floor(Math.random() * 50) + 10
  const casosPerdidos = Math.floor(Math.random() * 20) + 5
  const casosActivos = Math.floor(Math.random() * 15) + 3
  const tasaExito = Math.floor((casosGanados / (casosGanados + casosPerdidos)) * 100)
  const especialidades = ['Civil', 'Familiar', 'Comercial']

  const ciudad = abogado.registroAbogado?.split('-')[1] || 'Bolivia'
  const ciudadCompleta: Record<string, string> = {
    LP: 'La Paz',
    CB: 'Cochabamba',
    SC: 'Santa Cruz',
    OR: 'Oruro',
    PO: 'Potosí',
    CH: 'Chuquisaca',
    TJ: 'Tarija',
    BE: 'Beni',
    PA: 'Pando',
  }

  const añoRegistro = new Date(abogado.createdAt).getFullYear()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón volver */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a la búsqueda
      </Button>

      {/* Header con información principal */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Avatar y info básica */}
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={`${abogado.nombres} ${abogado.apellidos}`} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl font-bold">
                  {abogado.nombres} {abogado.apellidos}
                </h1>
                <p className="text-muted-foreground">
                  Registro Profesional: {abogado.registroAbogado || 'N/A'}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.5</span>
                  </div>
                  <span className="text-sm text-muted-foreground">(15 reseñas)</span>
                </div>

                <div className="mt-2">
                  {abogado.activo ? (
                    <Badge variant="default">Disponible</Badge>
                  ) : (
                    <Badge variant="secondary">No disponible</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Acción principal */}
            <div className="ml-auto flex flex-col gap-2">
              <Button
                size="lg"
                onClick={() => setShowSolicitudModal(true)}
                disabled={!abogado.activo}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Solicitar Representación
              </Button>
              <Button variant="outline" size="lg">
                <Mail className="mr-2 h-4 w-4" />
                Enviar Mensaje
              </Button>
            </div>
          </div>

          {/* Datos de contacto */}
          <Separator className="my-6" />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{abogado.email}</span>
            </div>
            {abogado.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{abogado.telefono}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{ciudadCompleta[ciudad] || ciudad}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con información detallada */}
      <Tabs defaultValue="resumen" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
          <TabsTrigger value="reseñas">Reseñas</TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Especialidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {especialidades.map((esp) => (
                    <Badge key={esp} variant="secondary">
                      {esp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Experiencia</span>
                  <span className="font-semibold">{experienciaAnios} años</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Casos activos</span>
                  <span className="font-semibold">{casosActivos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasa de éxito</span>
                  <span className="font-semibold text-primary">{tasaExito}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historial de casos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de Casos
              </CardTitle>
              <CardDescription>Resumen de casos resueltos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Casos Ganados</span>
                    <span className="font-semibold text-green-600">{casosGanados}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${(casosGanados / (casosGanados + casosPerdidos)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Casos Perdidos</span>
                    <span className="font-semibold text-red-600">{casosPerdidos}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-red-600"
                      style={{
                        width: `${(casosPerdidos / (casosGanados + casosPerdidos)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Experiencia */}
        <TabsContent value="experiencia">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experiencia Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    Abogado Independiente • {experienciaAnios} años
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {añoRegistro} - Presente
                  </p>
                  <p className="mt-2 text-sm">
                    Especialización en derecho civil, familiar y comercial. Experiencia
                    comprobada en casos de alto perfil y asesoría legal integral.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Reseñas */}
        <TabsContent value="reseñas">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas de Clientes</CardTitle>
              <CardDescription>Opiniones verificadas de casos anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Las reseñas estarán disponibles próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de solicitud */}
      <Dialog open={showSolicitudModal} onOpenChange={setShowSolicitudModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Representación Legal</DialogTitle>
            <DialogDescription>
              Completa el formulario para enviar tu solicitud
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipoCaso">
                Tipo de Caso <span className="text-destructive">*</span>
              </Label>
              <Select
                value={solicitudData.tipoCaso}
                onValueChange={(value) =>
                  setSolicitudData({ ...solicitudData, tipoCaso: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Penal">Penal</SelectItem>
                  <SelectItem value="Familiar">Familiar</SelectItem>
                  <SelectItem value="Laboral">Laboral</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgencia">Urgencia</Label>
              <Select
                value={solicitudData.urgencia}
                onValueChange={(value) =>
                  setSolicitudData({ ...solicitudData, urgencia: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensaje">
                Mensaje <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="mensaje"
                placeholder="Describe brevemente tu caso..."
                rows={4}
                value={solicitudData.mensaje}
                onChange={(e) =>
                  setSolicitudData({ ...solicitudData, mensaje: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSolicitudModal(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEnviarSolicitud}
                disabled={!solicitudData.mensaje || !solicitudData.tipoCaso || submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
