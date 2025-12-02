'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  FileText,
  Download,
  Eye,
  Upload,
  Filter,
  Folder,
  File,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Documento {
  id: string
  nombre: string
  tipo: string
  extension: string
  tamanio: number
  proceso_id: string | null
  proceso_nurej: string | null
  categoria:
    | 'DEMANDA'
    | 'CONTESTACION'
    | 'PRUEBA'
    | 'RESOLUCION'
    | 'SENTENCIA'
    | 'APELACION'
    | 'OTRO'
  descripcion: string | null
  fecha_subida: string
  subido_por: string
  url: string
  hash: string
}

export default function DocumentosPage() {
  const { user } = useAuth()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [filteredDocumentos, setFilteredDocumentos] = useState<Documento[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos')
  const [procesoFilter, setProcesoFilter] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  useEffect(() => {
    fetchDocumentos()
  }, [user])

  useEffect(() => {
    let filtered = documentos

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoriaFilter !== 'todos') {
      filtered = filtered.filter((doc) => doc.categoria === categoriaFilter)
    }

    if (procesoFilter !== 'todos') {
      filtered = filtered.filter((doc) => doc.proceso_id === procesoFilter)
    }

    setFilteredDocumentos(filtered)
  }, [searchTerm, categoriaFilter, procesoFilter, documentos])

  const fetchDocumentos = async () => {
    // Mock data - en producción vendría de Supabase Storage
    const mockDocumentos: Documento[] = [
      {
        id: '1',
        nombre: 'Demanda_Cobro_Bolivianos.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 2548000,
        proceso_id: '1',
        proceso_nurej: 'LP-001-2024-CV',
        categoria: 'DEMANDA',
        descripcion: 'Demanda principal de cobro de bolivianos',
        fecha_subida: '2024-10-15T10:30:00Z',
        subido_por: 'Abogado: Juan Pérez',
        url: '#',
        hash: 'a1b2c3d4e5f6',
      },
      {
        id: '2',
        nombre: 'Contrato_Incumplido.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 1820000,
        proceso_id: '1',
        proceso_nurej: 'LP-001-2024-CV',
        categoria: 'PRUEBA',
        descripcion: 'Contrato original que fue incumplido',
        fecha_subida: '2024-10-15T10:35:00Z',
        subido_por: 'Abogado: Juan Pérez',
        url: '#',
        hash: 'b2c3d4e5f6g7',
      },
      {
        id: '3',
        nombre: 'Cedula_Identidad.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 450000,
        proceso_id: '1',
        proceso_nurej: 'LP-001-2024-CV',
        categoria: 'PRUEBA',
        descripcion: 'Cédula de identidad del actor',
        fecha_subida: '2024-10-15T10:40:00Z',
        subido_por: 'Tú',
        url: '#',
        hash: 'c3d4e5f6g7h8',
      },
      {
        id: '4',
        nombre: 'Solicitud_Pension_Alimenticia.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 1950000,
        proceso_id: '2',
        proceso_nurej: 'LP-045-2024-FM',
        categoria: 'DEMANDA',
        descripcion: 'Solicitud de pensión alimenticia para menor',
        fecha_subida: '2024-09-20T14:20:00Z',
        subido_por: 'Abogado: María López',
        url: '#',
        hash: 'd4e5f6g7h8i9',
      },
      {
        id: '5',
        nombre: 'Certificado_Nacimiento_Hijo.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 380000,
        proceso_id: '2',
        proceso_nurej: 'LP-045-2024-FM',
        categoria: 'PRUEBA',
        descripcion: 'Certificado de nacimiento del menor',
        fecha_subida: '2024-09-20T14:25:00Z',
        subido_por: 'Tú',
        url: '#',
        hash: 'e5f6g7h8i9j0',
      },
      {
        id: '6',
        nombre: 'Resolucion_Audiencia_Preliminar.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 650000,
        proceso_id: '2',
        proceso_nurej: 'LP-045-2024-FM',
        categoria: 'RESOLUCION',
        descripcion: 'Resolución emitida en audiencia preliminar',
        fecha_subida: '2024-11-28T16:00:00Z',
        subido_por: 'Juzgado 2do de Familia',
        url: '#',
        hash: 'f6g7h8i9j0k1',
      },
      {
        id: '7',
        nombre: 'Sentencia_LP-112-2023-CV.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 1200000,
        proceso_id: '4',
        proceso_nurej: 'LP-112-2023-CV',
        categoria: 'SENTENCIA',
        descripcion: 'Sentencia final del proceso',
        fecha_subida: '2024-11-25T11:00:00Z',
        subido_por: 'Juzgado 3ro de Partido Civil',
        url: '#',
        hash: 'g7h8i9j0k1l2',
      },
    ]

    setDocumentos(mockDocumentos)
    setFilteredDocumentos(mockDocumentos)
    setLoading(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getCategoriaBadge = (categoria: string) => {
    const categorias: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      DEMANDA: { label: 'Demanda', variant: 'default' },
      CONTESTACION: { label: 'Contestación', variant: 'secondary' },
      PRUEBA: { label: 'Prueba', variant: 'outline' },
      RESOLUCION: { label: 'Resolución', variant: 'secondary' },
      SENTENCIA: { label: 'Sentencia', variant: 'destructive' },
      APELACION: { label: 'Apelación', variant: 'default' },
      OTRO: { label: 'Otro', variant: 'outline' },
    }
    const cat_data = categorias[categoria] || { label: categoria, variant: 'outline' as const }
    return <Badge variant={cat_data.variant}>{cat_data.label}</Badge>
  }

  const procesos = Array.from(
    new Set(documentos.filter((d) => d.proceso_id).map((d) => d.proceso_nurej))
  )

  const getCategoriaStats = () => {
    return {
      DEMANDA: documentos.filter((d) => d.categoria === 'DEMANDA').length,
      PRUEBA: documentos.filter((d) => d.categoria === 'PRUEBA').length,
      RESOLUCION: documentos.filter((d) => d.categoria === 'RESOLUCION').length,
      SENTENCIA: documentos.filter((d) => d.categoria === 'SENTENCIA').length,
    }
  }

  const stats = getCategoriaStats()
  const totalSize = documentos.reduce((sum, doc) => sum + doc.tamanio, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando documentos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Documentos</h1>
          <p className="text-muted-foreground">
            Gestión de documentos y expedientes digitales
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Sube documentos relacionados con tus procesos judiciales
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="proceso">Proceso</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proceso" />
                  </SelectTrigger>
                  <SelectContent>
                    {procesos.map((proceso) => (
                      <SelectItem key={proceso} value={proceso}>
                        {proceso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRUEBA">Prueba</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" placeholder="Describe brevemente el documento..." />
              </div>
              <div>
                <Label htmlFor="archivo">Archivo (PDF, máx 50MB)</Label>
                <Input id="archivo" type="file" accept=".pdf" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button>Subir Documento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{documentos.length}</p>
              <p className="text-sm text-muted-foreground">Total Documentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.DEMANDA}</p>
              <p className="text-sm text-muted-foreground">Demandas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.PRUEBA}</p>
              <p className="text-sm text-muted-foreground">Pruebas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.RESOLUCION}</p>
              <p className="text-sm text-muted-foreground">Resoluciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              <p className="text-sm text-muted-foreground">Espacio Usado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las categorías</SelectItem>
                <SelectItem value="DEMANDA">Demandas</SelectItem>
                <SelectItem value="CONTESTACION">Contestaciones</SelectItem>
                <SelectItem value="PRUEBA">Pruebas</SelectItem>
                <SelectItem value="RESOLUCION">Resoluciones</SelectItem>
                <SelectItem value="SENTENCIA">Sentencias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={procesoFilter} onValueChange={setProcesoFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Proceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los procesos</SelectItem>
                {procesos.map((proceso) => (
                  <SelectItem key={proceso} value={proceso}>
                    {proceso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      {filteredDocumentos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {searchTerm || categoriaFilter !== 'todos' || procesoFilter !== 'todos'
                ? 'No se encontraron documentos con los filtros aplicados'
                : 'No tienes documentos todavía'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({filteredDocumentos.length})</CardTitle>
            <CardDescription>Listado de todos tus documentos judiciales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocumentos.map((documento) => (
                <Card key={documento.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{documento.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {documento.descripcion || 'Sin descripción'}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {getCategoriaBadge(documento.categoria)}
                              {documento.proceso_nurej && (
                                <Badge variant="outline">{documento.proceso_nurej}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(documento.tamanio)}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(documento.fecha_subida), 'dd MMM yyyy', {
                                  locale: es,
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {documento.subido_por}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
