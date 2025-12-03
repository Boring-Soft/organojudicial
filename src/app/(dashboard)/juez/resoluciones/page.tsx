'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, FileText, Gavel, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Resolucion {
  id: string;
  tipo: string;
  contenido: string;
  fechaEmision: string;
  fechaNotificacion: string | null;
  firmadoPorId: string | null;
  firmaDigital: string | null;
  documentoUrl: string | null;
  proceso: {
    id: string;
    nurej: string;
    materia: string;
    estado: string;
    partes: Array<{
      tipo: string;
      nombres: string;
      apellidos: string;
    }>;
  };
}

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  estado: string;
}

const TIPOS_RESOLUCION = [
  { value: 'PROVIDENCIA', label: 'Providencia' },
  { value: 'AUTO_INTERLOCUTORIO', label: 'Auto Interlocutorio' },
  { value: 'AUTO_DEFINITIVO', label: 'Auto Definitivo' },
];

export default function ResolucionesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogNueva, setDialogNueva] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [formulario, setFormulario] = useState({
    procesoId: '',
    tipo: '',
    contenido: '',
  });

  useEffect(() => {
    cargarResoluciones();
    cargarProcesos();
  }, []);

  const cargarResoluciones = async () => {
    try {
      const response = await fetch('/api/resoluciones');
      if (response.ok) {
        const data = await response.json();
        setResoluciones(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las resoluciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProcesos = async () => {
    try {
      const response = await fetch('/api/procesos');
      if (response.ok) {
        const data = await response.json();
        setProcesos(data.procesos || []);
      }
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    }
  };

  const handleCrearResolucion = async () => {
    if (!formulario.procesoId || !formulario.tipo || !formulario.contenido) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      const response = await fetch('/api/resoluciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear resolución');
      }

      toast({
        title: 'Resolución creada',
        description: 'La resolución ha sido registrada exitosamente',
      });

      setDialogNueva(false);
      setFormulario({
        procesoId: '',
        tipo: '',
        contenido: '',
      });
      cargarResoluciones();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la resolución',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'PROVIDENCIA':
        return 'bg-blue-500';
      case 'AUTO_INTERLOCUTORIO':
        return 'bg-yellow-500';
      case 'AUTO_DEFINITIVO':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const ResolucionCard = ({ resolucion }: { resolucion: Resolucion }) => {
    const fechaEmision = new Date(resolucion.fechaEmision);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-base">{resolucion.proceso.nurej}</CardTitle>
              <CardDescription>{resolucion.proceso.materia}</CardDescription>
            </div>
            <Badge className={getTipoBadgeColor(resolucion.tipo)}>
              {resolucion.tipo.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(fechaEmision, "d 'de' MMMM, yyyy", { locale: es })}</span>
          </div>

          <div className="text-sm">
            <span className="font-semibold">Estado del Proceso:</span>{' '}
            <Badge variant="outline">{resolucion.proceso.estado}</Badge>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium mb-1">Contenido:</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{resolucion.contenido}</p>
          </div>

          {resolucion.fechaNotificacion && (
            <div className="text-xs text-muted-foreground">
              Notificada:{' '}
              {format(new Date(resolucion.fechaNotificacion), "d 'de' MMMM, yyyy", { locale: es })}
            </div>
          )}

          <div className="pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/proceso/${resolucion.proceso.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" /> Ver Proceso
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const providencias = resoluciones.filter((r) => r.tipo === 'PROVIDENCIA');
  const autosInterlocutorios = resoluciones.filter((r) => r.tipo === 'AUTO_INTERLOCUTORIO');
  const autosDefinitivos = resoluciones.filter((r) => r.tipo === 'AUTO_DEFINITIVO');

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resoluciones Judiciales</h1>
          <p className="text-muted-foreground">
            Gestión de providencias, autos interlocutorios y autos definitivos
          </p>
        </div>
        <Button onClick={() => setDialogNueva(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Resolución
        </Button>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{resoluciones.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Providencias</p>
                <p className="text-2xl font-bold">{providencias.length}</p>
              </div>
              <Gavel className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Autos Interl.</p>
                <p className="text-2xl font-bold">{autosInterlocutorios.length}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Autos Def.</p>
                <p className="text-2xl font-bold">{autosDefinitivos.length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">Todas ({resoluciones.length})</TabsTrigger>
          <TabsTrigger value="providencias">Providencias ({providencias.length})</TabsTrigger>
          <TabsTrigger value="interlocutorios">
            Autos Interlocutorios ({autosInterlocutorios.length})
          </TabsTrigger>
          <TabsTrigger value="definitivos">
            Autos Definitivos ({autosDefinitivos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4 mt-6">
          {resoluciones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay resoluciones registradas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resoluciones.map((resolucion) => (
                <ResolucionCard key={resolucion.id} resolucion={resolucion} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="providencias" className="space-y-4 mt-6">
          {providencias.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay providencias registradas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providencias.map((resolucion) => (
                <ResolucionCard key={resolucion.id} resolucion={resolucion} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interlocutorios" className="space-y-4 mt-6">
          {autosInterlocutorios.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay autos interlocutorios registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {autosInterlocutorios.map((resolucion) => (
                <ResolucionCard key={resolucion.id} resolucion={resolucion} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="definitivos" className="space-y-4 mt-6">
          {autosDefinitivos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay autos definitivos registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {autosDefinitivos.map((resolucion) => (
                <ResolucionCard key={resolucion.id} resolucion={resolucion} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Nueva Resolución */}
      <Dialog open={dialogNueva} onOpenChange={setDialogNueva}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Resolución Judicial</DialogTitle>
            <DialogDescription>
              Redacte y registre una nueva resolución judicial
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Proceso*</Label>
              <Select
                value={formulario.procesoId}
                onValueChange={(value) => setFormulario({ ...formulario, procesoId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un proceso..." />
                </SelectTrigger>
                <SelectContent>
                  {procesos.map((proceso) => (
                    <SelectItem key={proceso.id} value={proceso.id}>
                      {proceso.nurej} - {proceso.materia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Resolución*</Label>
              <Select
                value={formulario.tipo}
                onValueChange={(value) => setFormulario({ ...formulario, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_RESOLUCION.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Providencia:</strong> Decisión de trámite simple.{' '}
                <strong>Auto Interlocutorio:</strong> Resuelve incidente procesal.{' '}
                <strong>Auto Definitivo:</strong> Decide sobre cuestión de fondo.
              </p>
            </div>

            <div>
              <Label>Contenido de la Resolución*</Label>
              <Textarea
                placeholder="Redacte el contenido completo de la resolución..."
                rows={12}
                value={formulario.contenido}
                onChange={(e) => setFormulario({ ...formulario, contenido: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Incluya los fundamentos legales y la decisión adoptada
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Esta resolución quedará registrada en el expediente digital
                y será notificada automáticamente a las partes del proceso.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNueva(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearResolucion} disabled={procesando}>
              {procesando ? 'Registrando...' : 'Registrar Resolución'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
