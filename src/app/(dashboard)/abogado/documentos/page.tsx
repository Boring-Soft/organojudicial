'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  FileText,
  Download,
  Eye,
  Upload,
  Folder,
  Calendar,
  User,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  caso_id: string
  caso_nurej: string
  cliente_nombre: string
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

interface CasoCarpeta {
  nurej: string
  cliente: string
  total_documentos: number
}

export default function DocumentosAbogadoPage() {
  const { user } = useAuth()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [filteredDocumentos, setFilteredDocumentos] = useState<Documento[]>([])
  const [carpetas, setCarpetas] = useState<CasoCarpeta[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos')
  const [casoFilter, setCasoFilter] = useState<string>('todos')
  const [clienteFilter, setClienteFilter] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [vista, setVista] = useState<'documentos' | 'carpetas'>('documentos')

  useEffect(() => {
    fetchDocumentos()
    generateCarpetas()
  }, [user])

  useEffect(() => {
    let filtered = documentos

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.caso_nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoriaFilter !== 'todos') {
      filtered = filtered.filter((doc) => doc.categoria === categoriaFilter)
    }

    if (casoFilter !== 'todos') {
      filtered = filtered.filter((doc) => doc.caso_nurej === casoFilter)
    }

    if (clienteFilter !== 'todos') {
      filtered = filtered.filter((doc) => doc.cliente_nombre === clienteFilter)
    }

    setFilteredDocumentos(filtered)
  }, [searchTerm, categoriaFilter, casoFilter, clienteFilter, documentos])

  const fetchDocumentos = async () => {
    // Mock data - en producción vendría de Supabase Storage
    const mockDocumentos: Documento[] = [
      {
        id: '1',
        nombre: 'Demanda_Cobro_Bolivianos.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 2548000,
        caso_id: '1',
        caso_nurej: 'LP-001-2024-CV',
        cliente_nombre: 'Carlos Morales',
        categoria: 'DEMANDA',
        descripcion: 'Demanda principal de cobro',
        fecha_subida: '2024-10-15T10:30:00Z',
        subido_por: 'Tú',
        url: '#',
        hash: 'a1b2c3d4e5f6',
      },
      {
        id: '2',
        nombre: 'Contrato_Incumplido.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 1820000,
        caso_id: '1',
        caso_nurej: 'LP-001-2024-CV',
        cliente_nombre: 'Carlos Morales',
        categoria: 'PRUEBA',
        descripcion: 'Contrato original',
        fecha_subida: '2024-10-15T10:35:00Z',
        subido_por: 'Cliente',
        url: '#',
        hash: 'b2c3d4e5f6g7',
      },
      {
        id: '3',
        nombre: 'Solicitud_Pension_Alimenticia.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 1950000,
        caso_id: '2',
        caso_nurej: 'LP-045-2024-FM',
        cliente_nombre: 'María López',
        categoria: 'DEMANDA',
        descripcion: 'Solicitud inicial',
        fecha_subida: '2024-09-20T14:20:00Z',
        subido_por: 'Tú',
        url: '#',
        hash: 'd4e5f6g7h8i9',
      },
      {
        id: '4',
        nombre: 'Certificado_Nacimiento.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 380000,
        caso_id: '2',
        caso_nurej: 'LP-045-2024-FM',
        cliente_nombre: 'María López',
        categoria: 'PRUEBA',
        descripcion: 'Certificado del menor',
        fecha_subida: '2024-09-20T14:25:00Z',
        subido_por: 'Cliente',
        url: '#',
        hash: 'e5f6g7h8i9j0',
      },
      {
        id: '5',
        nombre: 'Reclamo_Beneficios_Sociales.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 2100000,
        caso_id: '3',
        caso_nurej: 'LP-089-2024-LB',
        cliente_nombre: 'Roberto Sánchez',
        categoria: 'DEMANDA',
        descripcion: 'Demanda laboral',
        fecha_subida: '2024-08-10T11:00:00Z',
        subido_por: 'Tú',
        url: '#',
        hash: 'f6g7h8i9j0k1',
      },
      {
        id: '6',
        nombre: 'Planillas_Pago.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 850000,
        caso_id: '3',
        caso_nurej: 'LP-089-2024-LB',
        cliente_nombre: 'Roberto Sánchez',
        categoria: 'PRUEBA',
        descripcion: 'Planillas de pago como prueba',
        fecha_subida: '2024-08-10T11:15:00Z',
        subido_por: 'Cliente',
        url: '#',
        hash: 'g7h8i9j0k1l2',
      },
      {
        id: '7',
        nombre: 'Resolucion_Admision.pdf',
        tipo: 'application/pdf',
        extension: 'pdf',
        tamanio: 450000,
        caso_id: '1',
        caso_nurej: 'LP-001-2024-CV',
        cliente_nombre: 'Carlos Morales',
        categoria: 'RESOLUCION',
        descripcion: 'Resolución de admisión de demanda',
        fecha_subida: '2024-10-18T09:00:00Z',
        subido_por: 'Juzgado',
        url: '#',
        hash: 'h8i9j0k1l2m3',
      },
    ]

    setDocumentos(mockDocumentos)
    setFilteredDocumentos(mockDocumentos)
    setLoading(false)
  }

  const generateCarpetas = () => {
    const carpetasMap = new Map<string, CasoCarpeta>()

    documentos.forEach((doc) => {
      const key = doc.caso_nurej
      if (carpetasMap.has(key)) {
        carpetasMap.get(key)!.total_documentos++
      } else {
        carpetasMap.set(key, {
          nurej: doc.caso_nurej,
          cliente: doc.cliente_nombre,
          total_documentos: 1,
        })
      }
    })

    setCarpetas(Array.from(carpetasMap.values()))
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

  const casos = Array.from(new Set(documentos.map((d) => d.caso_nurej)))
  const clientes = Array.from(new Set(documentos.map((d) => d.cliente_nombre)))

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
          <h1 className="text-3xl font-bold">Centro de Documentos</h1>
          <p className="text-muted-foreground">Gestión centralizada de documentos por caso</p>
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
              <DialogDescription>Añade documentos a tus casos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="caso">Caso</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un caso" />
                  </SelectTrigger>
                  <SelectContent>
                    {casos.map((caso) => (
                      <SelectItem key={caso} value={caso}>
                        {caso}
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
                    <SelectItem value="DEMANDA">Demanda</SelectItem>
                    <SelectItem value="CONTESTACION">Contestación</SelectItem>
                    <SelectItem value="PRUEBA">Prueba</SelectItem>
                    <SelectItem value="RESOLUCION">Resolución</SelectItem>
                    <SelectItem value="SENTENCIA">Sentencia</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" placeholder="Describe el documento..." />
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
              <p className="text-2xl font-bold">{carpetas.length}</p>
              <p className="text-sm text-muted-foreground">Casos con Documentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.DEMANDA + stats.PRUEBA}</p>
              <p className="text-sm text-muted-foreground">Demandas y Pruebas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.RESOLUCION + stats.SENTENCIA}</p>
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

      {/* Tabs para vista */}
      <Tabs defaultValue="documentos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documentos">Vista de Documentos</TabsTrigger>
          <TabsTrigger value="carpetas">Vista por Caso</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos">
          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger>
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
                <Select value={casoFilter} onValueChange={setCasoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Caso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los casos</SelectItem>
                    {casos.map((caso) => (
                      <SelectItem key={caso} value={caso}>
                        {caso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={clienteFilter} onValueChange={setClienteFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los clientes</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente} value={cliente}>
                        {cliente}
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
                  No se encontraron documentos con los filtros aplicados
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Documentos ({filteredDocumentos.length})</CardTitle>
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
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {getCategoriaBadge(documento.categoria)}
                                  <Badge variant="outline">{documento.caso_nurej}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    <User className="mr-1 inline h-3 w-3" />
                                    {documento.cliente_nombre}
                                  </span>
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
        </TabsContent>

        <TabsContent value="carpetas">
          <div className="grid gap-4 md:grid-cols-3">
            {carpetas.map((carpeta) => (
              <Card key={carpeta.nurej} className="cursor-pointer hover:bg-muted" onClick={() => setCasoFilter(carpeta.nurej)}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Folder className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{carpeta.nurej}</CardTitle>
                      <CardDescription>{carpeta.cliente}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {carpeta.total_documentos} documento(s)
                    </span>
                    <Button size="sm" variant="outline">
                      Ver Documentos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
