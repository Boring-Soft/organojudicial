'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import AbogadoCard from '@/components/ciudadano/abogado-card'

interface Abogado {
  id: string
  nombres: string
  apellidos: string
  registroAbogado: string | null
  email: string
  telefono: string | null
  juzgado: string | null
  activo: boolean
}

const ESPECIALIDADES = [
  'Civil',
  'Penal',
  'Familiar',
  'Laboral',
  'Administrativo',
  'Tributario',
  'Comercial',
]

const CIUDADES = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando']

/**
 * Página de búsqueda de abogados para ciudadanos
 * Permite filtrar por nombre, especialidad y ciudad
 */
export default function BuscarAbogadosPage() {
  const router = useRouter()
  const { user, getUserRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [abogados, setAbogados] = useState<Abogado[]>([])
  const [filteredAbogados, setFilteredAbogados] = useState<Abogado[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEspecialidad, setFilterEspecialidad] = useState<string>('TODAS')
  const [filterCiudad, setFilterCiudad] = useState<string>('TODAS')
  const [showSolicitudModal, setShowSolicitudModal] = useState(false)
  const [selectedAbogado, setSelectedAbogado] = useState<string | null>(null)
  const [solicitudData, setSolicitudData] = useState({
    mensaje: '',
    tipoCaso: '',
    urgencia: 'MEDIA',
  })
  const [submitting, setSubmitting] = useState(false)

  // Verificar acceso
  useEffect(() => {
    const checkAccess = async () => {
      const rol = getUserRole()
      if (rol !== 'CIUDADANO') {
        router.push('/403')
        return
      }
      await fetchAbogados()
      setLoading(false)
    }

    checkAccess()
  }, [getUserRole, router])

  // Obtener lista de abogados
  const fetchAbogados = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('rol', 'ABOGADO')
        .eq('activo', true)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching abogados:', error)
        return
      }

      setAbogados(data as Abogado[])
      setFilteredAbogados(data as Abogado[])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...abogados]

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.registroAbogado?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por ciudad (basado en registro profesional)
    if (filterCiudad !== 'TODAS') {
      const codigoCiudad: Record<string, string> = {
        'La Paz': 'LP',
        'Cochabamba': 'CB',
        'Santa Cruz': 'SC',
        'Oruro': 'OR',
        'Potosí': 'PO',
        'Chuquisaca': 'CH',
        'Tarija': 'TJ',
        'Beni': 'BE',
        'Pando': 'PA',
      }
      filtered = filtered.filter((a) =>
        a.registroAbogado?.includes(codigoCiudad[filterCiudad])
      )
    }

    setFilteredAbogados(filtered)
  }, [searchTerm, filterEspecialidad, filterCiudad, abogados])

  // Abrir modal de solicitud
  const handleSolicitarRepresentacion = (abogadoId: string) => {
    setSelectedAbogado(abogadoId)
    setShowSolicitudModal(true)
  }

  // Enviar solicitud
  const handleEnviarSolicitud = async () => {
    if (!selectedAbogado || !user) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      // Crear vinculación con estado PENDIENTE
      const { error } = await supabase.from('vinculaciones_abogado_ciudadano').insert({
        abogado_id: selectedAbogado,
        ciudadano_id: user.id,
        estado: 'PENDIENTE',
        mensaje_solicitud: solicitudData.mensaje,
        tipo_caso: solicitudData.tipoCaso,
        urgencia: solicitudData.urgencia,
        fecha_solicitud: new Date().toISOString(),
      })

      if (error) {
        console.error('Error creating solicitud:', error)
        alert('Error al enviar la solicitud. Por favor intenta nuevamente.')
        return
      }

      // Éxito
      alert('¡Solicitud enviada exitosamente! El abogado revisará tu solicitud pronto.')
      setShowSolicitudModal(false)
      setSolicitudData({ mensaje: '', tipoCaso: '', urgencia: 'MEDIA' })
      setSelectedAbogado(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Ocurrió un error inesperado.')
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Buscar Abogados</h1>
        <p className="text-muted-foreground">
          Encuentra y conecta con abogados verificados en Bolivia
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre o registro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Select value={filterEspecialidad} onValueChange={setFilterEspecialidad}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  {ESPECIALIDADES.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Select value={filterCiudad} onValueChange={setFilterCiudad}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  {CIUDADES.map((ciudad) => (
                    <SelectItem key={ciudad} value={ciudad}>
                      {ciudad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <Users className="mb-1 mr-1 inline h-4 w-4" />
          {filteredAbogados.length} abogado(s) encontrado(s)
        </p>
      </div>

      {/* Grid de abogados */}
      {filteredAbogados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No se encontraron abogados</p>
            <p className="text-sm text-muted-foreground">
              Intenta ajustar los filtros de búsqueda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAbogados.map((abogado) => (
            <AbogadoCard
              key={abogado.id}
              abogado={abogado}
              onSolicitarRepresentacion={handleSolicitarRepresentacion}
            />
          ))}
        </div>
      )}

      {/* Modal de solicitud */}
      <Dialog open={showSolicitudModal} onOpenChange={setShowSolicitudModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Representación Legal</DialogTitle>
            <DialogDescription>
              Completa el formulario para enviar tu solicitud al abogado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de caso */}
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

            {/* Urgencia */}
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

            {/* Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="mensaje">
                Mensaje <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="mensaje"
                placeholder="Describe brevemente tu caso y por qué necesitas representación legal..."
                rows={4}
                value={solicitudData.mensaje}
                onChange={(e) =>
                  setSolicitudData({ ...solicitudData, mensaje: e.target.value })
                }
              />
            </div>

            {/* Botones */}
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
