'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Phone, Mail, UserX, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

interface Vinculacion {
  id: string
  abogado_id: string
  estado: string
  activo: boolean
  abogado: {
    nombres: string
    apellidos: string
    registroAbogado: string | null
    email: string
    telefono: string | null
  }
}

/**
 * Widget que muestra el abogado actual del ciudadano
 * Permite chat rápido y desvinculación
 */
export default function MiAbogadoWidget() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [vinculacion, setVinculacion] = useState<Vinculacion | null>(null)
  const [showDesvincularModal, setShowDesvincularModal] = useState(false)
  const [motivoDesvinculacion, setMotivoDesvinculacion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVinculacion()
  }, [user])

  const fetchVinculacion = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .select(
          `
          *,
          abogado:usuarios!vinculaciones_abogado_ciudadano_abogado_id_fkey (
            nombres,
            apellidos,
            registroAbogado,
            email,
            telefono
          )
        `
        )
        .eq('ciudadano_id', user.id)
        .eq('estado', 'ACTIVA')
        .eq('activo', true)
        .single()

      if (!error && data) {
        setVinculacion(data as unknown as Vinculacion)
      }
    } catch (error) {
      console.error('Error fetching vinculacion:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDesvincular = async () => {
    if (!vinculacion || !motivoDesvinculacion) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .update({
          estado: 'FINALIZADA',
          activo: false,
          fecha_fin: new Date().toISOString(),
          motivo_finalizacion: motivoDesvinculacion,
        })
        .eq('id', vinculacion.id)

      if (error) {
        console.error('Error updating vinculacion:', error)
        alert('Error al finalizar la vinculación.')
        return
      }

      alert('Vinculación finalizada exitosamente.')
      setShowDesvincularModal(false)
      setMotivoDesvinculacion('')
      await fetchVinculacion()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!vinculacion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi Abogado</CardTitle>
          <CardDescription>No tienes un abogado asignado actualmente</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/ciudadano/abogados/buscar">
              <User className="mr-2 h-4 w-4" />
              Buscar Abogado
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { abogado } = vinculacion
  const getInitials = () => {
    return `${abogado.nombres.charAt(0)}${abogado.apellidos.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mi Abogado</CardTitle>
          <CardDescription>Tu representante legal actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info del abogado */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={`${abogado.nombres} ${abogado.apellidos}`} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-semibold">
                {abogado.nombres} {abogado.apellidos}
              </p>
              <p className="text-sm text-muted-foreground">
                Reg. {abogado.registroAbogado || 'N/A'}
              </p>
              <Badge variant="default" className="mt-1">
                Activo
              </Badge>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{abogado.email}</span>
            </div>
            {abogado.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{abogado.telefono}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <Button className="w-full" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Enviar Mensaje
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowDesvincularModal(true)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Cambiar Abogado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de desvinculación */}
      <Dialog open={showDesvincularModal} onOpenChange={setShowDesvincularModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar de Abogado</DialogTitle>
            <DialogDescription>
              Al finalizar esta vinculación, podrás buscar y solicitar la representación de otro
              abogado. Por favor indica el motivo del cambio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">
                Motivo del Cambio <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Ej: Requiero un abogado con otra especialidad, Falta de comunicación, etc."
                rows={4}
                value={motivoDesvinculacion}
                onChange={(e) => setMotivoDesvinculacion(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDesvincularModal(false)
                  setMotivoDesvinculacion('')
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDesvincular}
                disabled={!motivoDesvinculacion || submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Finalizando...' : 'Finalizar Vinculación'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
