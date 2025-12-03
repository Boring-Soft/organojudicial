'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { FileUpload } from '@/components/documentos/file-upload';
import { PDFViewer } from '@/components/documentos/pdf-viewer';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Documento {
  id: string;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  url: string;
  tamano: number;
  mimeType: string;
  contenidoHash: string | null;
  verificado: boolean;
  createdAt: string;
  subidoPor: {
    id: string;
    nombres: string;
    apellidos: string;
    rol: string;
  };
  anotaciones: any[];
}

const TIPOS_DOCUMENTO = [
  { value: 'DEMANDA', label: 'Demanda' },
  { value: 'CONTESTACION', label: 'Contestación' },
  { value: 'PRUEBA', label: 'Prueba' },
  { value: 'RESOLUCION', label: 'Resolución' },
  { value: 'SENTENCIA', label: 'Sentencia' },
  { value: 'RECURSO', label: 'Recurso' },
  { value: 'ACTUADO', label: 'Actuado' },
  { value: 'OTRO', label: 'Otro' },
];

export default function DocumentosPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [modalUpload, setModalUpload] = useState(false);
  const [modalViewer, setModalViewer] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<Documento | null>(null);
  const [nuevoDocumento, setNuevoDocumento] = useState<{
    tipo: string;
    descripcion: string;
  }>({ tipo: '', descripcion: '' });

  // TODO: Obtener del contexto de autenticación
  const currentUserRole = 'CIUDADANO';

  useEffect(() => {
    cargarDocumentos();
  }, [params.procesoId, tipoFiltro]);

  const cargarDocumentos = async () => {
    try {
      let url = `/api/documentos?procesoId=${params.procesoId}`;
      if (tipoFiltro) {
        url += `&tipo=${tipoFiltro}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (fileData: any) => {
    if (!nuevoDocumento.tipo) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un tipo de documento',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId: params.procesoId,
          tipo: nuevoDocumento.tipo,
          nombre: fileData.nombre,
          descripcion: nuevoDocumento.descripcion,
          url: fileData.url,
          tamano: fileData.tamano,
          mimeType: fileData.mimeType,
          contenidoHash: fileData.contenidoHash,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Documento agregado',
          description: 'El documento se agregó correctamente',
        });
        cargarDocumentos();
        setModalUpload(false);
        setNuevoDocumento({ tipo: '', descripcion: '' });
      } else {
        throw new Error('Error al agregar documento');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar el documento',
        variant: 'destructive',
      });
    }
  };

  const handleEliminar = async (documentoId: string) => {
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    try {
      const response = await fetch(`/api/documentos/${documentoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Documento eliminado',
          description: 'El documento se eliminó correctamente',
        });
        cargarDocumentos();
      } else {
        throw new Error('Error al eliminar documento');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el documento',
        variant: 'destructive',
      });
    }
  };

  const handleDescargar = async (documento: Documento) => {
    try {
      const response = await fetch(documento.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nombre;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Descarga iniciada',
        description: `Descargando ${documento.nombre}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el archivo',
        variant: 'destructive',
      });
    }
  };

  const handleVisualizarPDF = (documento: Documento) => {
    setDocumentoSeleccionado(documento);
    setModalViewer(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Filtrar documentos por búsqueda
  const documentosFiltrados = documentos.filter((doc) =>
    doc.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión Documental</h1>
            <p className="text-muted-foreground">
              Documentos del proceso judicial
            </p>
          </div>

          <Dialog open={modalUpload} onOpenChange={setModalUpload}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Subir Nuevo Documento</DialogTitle>
                <DialogDescription>
                  Seleccione el tipo de documento y suba el archivo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tipo de Documento *
                  </label>
                  <Select
                    value={nuevoDocumento.tipo}
                    onValueChange={(value) =>
                      setNuevoDocumento((prev) => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descripción (opcional)
                  </label>
                  <Input
                    placeholder="Descripción del documento..."
                    value={nuevoDocumento.descripcion}
                    onChange={(e) =>
                      setNuevoDocumento((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                  />
                </div>

                <FileUpload
                  procesoId={params.procesoId as string}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documentos ({documentosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {busqueda || tipoFiltro
                  ? 'No se encontraron documentos con los filtros aplicados'
                  : 'No hay documentos aún. Suba el primer documento.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Subido por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.map((documento) => (
                  <TableRow key={documento.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {documento.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {
                          TIPOS_DOCUMENTO.find((t) => t.value === documento.tipo)
                            ?.label
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {documento.subidoPor.nombres}{' '}
                          {documento.subidoPor.apellidos}
                        </p>
                        <p className="text-muted-foreground">
                          {documento.subidoPor.rol}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(documento.createdAt), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>{formatFileSize(documento.tamano)}</TableCell>
                    <TableCell>
                      {documento.verificado ? (
                        <Badge>Verificado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {documento.mimeType === 'application/pdf' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVisualizarPDF(documento)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDescargar(documento)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {(currentUserRole === 'JUEZ' ||
                          currentUserRole === 'SECRETARIO') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(documento.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Visor PDF */}
      <Dialog open={modalViewer} onOpenChange={setModalViewer}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          {documentoSeleccionado && (
            <PDFViewer
              url={documentoSeleccionado.url}
              nombre={documentoSeleccionado.nombre}
              allowPrint={currentUserRole !== 'CIUDADANO'}
              allowDownload={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
