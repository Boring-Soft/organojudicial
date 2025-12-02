'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Mail, Phone, Calendar, FileText, MessageSquare, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Cliente {
  id: string
  ciudadano_id: string
  ciudadano: {
    nombres: string
    apellidos: string
    ci: string
    email: string
    telefono: string
  }
  fecha_vinculacion: string
  casos_activos: number
  casos_finalizados: number
  ultima_interaccion: string
}

export default function MisClientesPage() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [desvincularDialogOpen, setDesvincularDialogOpen] = useState(false)
  const [motivoDesvinculacion, setMotivoDesvinculacion] = useState('')

  useEffect(() => {
    fetchClientes()
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.ciudadano.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.ciudadano.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.ciudadano.ci.includes(searchTerm)
      )
      setFilteredClientes(filtered)
    } else {
      setFilteredClientes(clientes)
    }
  }, [searchTerm, clientes])

  const fetchClientes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .select(
          `
          id,
          ciudadano_id,
          fecha_vinculacion,
          ciudadano:usuarios!vinculaciones_abogado_ciudadano_ciudadano_id_fkey (
            nombres,
            apellidos,
            ci,
            email,
            telefono
          )
        `
        )
        .eq('abogado_id', user.id)
        .eq('estado', 'ACTIVA')
        .eq('activo', true)

      if (error) throw error

      // Mock data for casos activos/finalizados y última interacción
      const clientesConCasos = data.map((vinculacion) => ({
        id: vinculacion.id,
        ciudadano_id: vinculacion.ciudadano_id,
        ciudadano: vinculacion.ciudadano,
        fecha_vinculacion: vinculacion.fecha_vinculacion,
        casos_activos: Math.floor(Math.random() * 3) + 1,
        casos_finalizados: Math.floor(Math.random() * 5),
        ultima_interaccion: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
      }))

      setClientes(clientesConCasos)
      setFilteredClientes(clientesConCasos)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDesvincular = async () => {
    if (!selectedCliente || !motivoDesvinculacion.trim()) return

    try {
      const { error } = await supabase
        .from('vinculaciones_abogado_ciudadano')
        .update({
          activo: false,
          fecha_fin: new Date().toISOString(),
          motivo_desvinculacion: motivoDesvinculacion,
        })
        .eq('id', selectedCliente.id)

      if (error) throw error

      // Actualizar la lista de clientes
      setClientes(clientes.filter((c) => c.id !== selectedCliente.id))
      setDesvincularDialogOpen(false)
      setMotivoDesvinculacion('')
      setSelectedCliente(null)
    } catch (error) {
      console.error('Error al desvincular cliente:', error)
    }
  }

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
  }

  const getDiasDesdeInteraccion = (fecha: string) => {
    const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))
    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Ayer'
    return `Hace ${dias} días`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando clientes...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Clientes</h1>
        <p className="text-muted-foreground">Gestión de vinculaciones activas</p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{clientes.length}</p>
              <p className="text-sm text-muted-foreground">Clientes Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {clientes.reduce((sum, c) => sum + c.casos_activos, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Casos Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {clientes.reduce((sum, c) => sum + c.casos_finalizados, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Casos Finalizados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {clientes.filter((c) => c.casos_activos > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Con Casos en Curso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}{' '}
                {searchTerm && 'encontrado(s)'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o CI..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes activos'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Casos</TableHead>
                  <TableHead>Vinculación</TableHead>
                  <TableHead>Última Interacción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {getInitials(cliente.ciudadano.nombres, cliente.ciudadano.apellidos)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {cliente.ciudadano.nombres} {cliente.ciudadano.apellidos}
                          </p>
                          <p className="text-sm text-muted-foreground">CI: {cliente.ciudadano.ci}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          <span className="text-muted-foreground">{cliente.ciudadano.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span className="text-muted-foreground">{cliente.ciudadano.telefono}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{cliente.casos_activos} Activos</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cliente.casos_finalizados} finalizados
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(cliente.fecha_vinculacion), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{getDiasDesdeInteraccion(cliente.ultima_interaccion)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" title="Ver casos" asChild>
                          <Link href={`/abogado/casos?cliente=${cliente.ciudadano_id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" title="Enviar mensaje" asChild>
                          <Link href={`/chat?usuario=${cliente.ciudadano_id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Desvincular"
                          onClick={() => {
                            setSelectedCliente(cliente)
                            setDesvincularDialogOpen(true)
                          }}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Desvinculación */}
      <Dialog open={desvincularDialogOpen} onOpenChange={setDesvincularDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular Cliente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas desvincular a{' '}
              {selectedCliente &&
                `${selectedCliente.ciudadano.nombres} ${selectedCliente.ciudadano.apellidos}`}
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="motivo">Motivo de desvinculación *</Label>
              <Textarea
                id="motivo"
                placeholder="Explica el motivo de la desvinculación..."
                value={motivoDesvinculacion}
                onChange={(e) => setMotivoDesvinculacion(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDesvincularDialogOpen(false)
                setMotivoDesvinculacion('')
                setSelectedCliente(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDesvincular}
              disabled={!motivoDesvinculacion.trim()}
            >
              Desvincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
