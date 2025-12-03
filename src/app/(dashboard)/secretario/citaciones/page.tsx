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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Plus, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Citacion {
  id: string;
  tipo: string;
  metodo: string;
  estado: string;
  createdAt: string;
  fechaValidacion: string | null;
  intentos: Array<{
    fecha: string;
    metodo: string;
    resultado: string;
    descripcion?: string;
  }>;
  proceso: {
    id: string;
    nurej: string;
    materia: string;
    partes: Array<{
      id: string;
      tipo: string;
      nombres: string;
      apellidos: string;
      ci: string;
      domicilioReal: string;
    }>;
  };
}

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  estado: string;
  partes: Array<{
    id: string;
    tipo: string;
    nombres: string;
    apellidos: string;
  }>;
}

export default function CitacionesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [citaciones, setCitaciones] = useState<Citacion[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogNueva, setDialogNueva] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // Formulario de nueva citación
  const [formulario, setFormulario] = useState({
    procesoId: '',
    parteId: '',
    tipo: '',
    metodo: '',
    domicilio: '',
    email: '',
  });

  useEffect(() => {
    cargarCitaciones();
    cargarProcesosAdmitidos();
  }, []);

  const cargarCitaciones = async () => {
    try {
      const response = await fetch('/api/citaciones');
      if (response.ok) {
        const data = await response.json();
        setCitaciones(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las citaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProcesosAdmitidos = async () => {
    try {
      const response = await fetch('/api/procesos?estado=ADMITIDO');
      if (response.ok) {
        const data = await response.json();
        setProcesos(data.procesos || []);
      }
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    }
  };

  const handleCrearCitacion = async () => {
    if (!formulario.procesoId || !formulario.parteId || !formulario.tipo || !formulario.metodo) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      const response = await fetch('/api/citaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });

      if (!response.ok) throw new Error('Error al crear citación');

      toast({
        title: 'Citación creada',
        description: 'La citación ha sido registrada exitosamente',
      });

      setDialogNueva(false);
      setFormulario({
        procesoId: '',
        parteId: '',
        tipo: '',
        metodo: '',
        domicilio: '',
        email: '',
      });
      cargarCitaciones();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la citación',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  const procesoSeleccionado = procesos.find(p => p.id === formulario.procesoId);
  const partesDemandadas = procesoSeleccionado?.partes.filter(p => p.tipo === 'DEMANDADO') || [];

  const CitacionCard = ({ citacion }: { citacion: Citacion }) => {
    const parteDemandada = citacion.proceso.partes.find(p => p.id === citacion.parteId);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{citacion.proceso.nurej}</CardTitle>
              <CardDescription>
                {citacion.tipo} - {citacion.metodo}
              </CardDescription>
            </div>
            <Badge
              variant={
                citacion.estado === 'EXITOSA'
                  ? 'default'
                  : citacion.estado === 'FALLIDA'
                  ? 'destructive'
                  : 'secondary'
              }
              className={
                citacion.estado === 'EXITOSA'
                  ? 'bg-green-500'
                  : citacion.estado === 'FALLIDA'
                  ? ''
                  : 'bg-yellow-500'
              }
            >
              {citacion.estado === 'EXITOSA' && <CheckCircle className="h-3 w-3 mr-1" />}
              {citacion.estado === 'FALLIDA' && <XCircle className="h-3 w-3 mr-1" />}
              {citacion.estado === 'PENDIENTE' && <Clock className="h-3 w-3 mr-1" />}
              {citacion.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-semibold">Parte Demandada:</span>{' '}
              {parteDemandada?.nombres} {parteDemandada?.apellidos}
            </div>

            <div className="text-sm">
              <span className="font-semibold">CI:</span> {parteDemandada?.ci}
            </div>

            <div className="text-sm">
              <span className="font-semibold">Intentos:</span> {citacion.intentos.length}
            </div>

            {citacion.fechaValidacion && (
              <div className="text-sm">
                <span className="font-semibold">Fecha de citación:</span>{' '}
                {new Date(citacion.fechaValidacion).toLocaleDateString('es-BO')}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Creada: {new Date(citacion.createdAt).toLocaleDateString('es-BO')}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/secretario/citaciones/${citacion.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" /> Ver Detalle
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Citaciones</h1>
          <p className="text-muted-foreground">Gestión de citaciones judiciales</p>
        </div>
        <Button onClick={() => setDialogNueva(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Citación
        </Button>
      </div>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Pendientes ({citaciones.filter(c => c.estado === 'PENDIENTE').length})
          </TabsTrigger>
          <TabsTrigger value="exitosas">
            Exitosas ({citaciones.filter(c => c.estado === 'EXITOSA').length})
          </TabsTrigger>
          <TabsTrigger value="todas">Todas ({citaciones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4 mt-6">
          {citaciones.filter(c => c.estado === 'PENDIENTE').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay citaciones pendientes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {citaciones
                .filter(c => c.estado === 'PENDIENTE')
                .map(citacion => (
                  <CitacionCard key={citacion.id} citacion={citacion} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exitosas" className="space-y-4 mt-6">
          {citaciones.filter(c => c.estado === 'EXITOSA').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay citaciones exitosas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {citaciones
                .filter(c => c.estado === 'EXITOSA')
                .map(citacion => (
                  <CitacionCard key={citacion.id} citacion={citacion} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citaciones.map(citacion => (
              <CitacionCard key={citacion.id} citacion={citacion} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nueva Citación */}
      <Dialog open={dialogNueva} onOpenChange={setDialogNueva}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Citación</DialogTitle>
            <DialogDescription>
              Registre una nueva citación para notificar a la parte demandada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Proceso*</Label>
              <Select
                value={formulario.procesoId}
                onValueChange={(value) => {
                  setFormulario({ ...formulario, procesoId: value, parteId: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un proceso..." />
                </SelectTrigger>
                <SelectContent>
                  {procesos.map(proceso => (
                    <SelectItem key={proceso.id} value={proceso.id}>
                      {proceso.nurej} - {proceso.materia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formulario.procesoId && (
              <div>
                <Label>Parte a Citar*</Label>
                <Select
                  value={formulario.parteId}
                  onValueChange={(value) => setFormulario({ ...formulario, parteId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la parte demandada..." />
                  </SelectTrigger>
                  <SelectContent>
                    {partesDemandadas.map(parte => (
                      <SelectItem key={parte.id} value={parte.id}>
                        {parte.nombres} {parte.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Citación*</Label>
                <Select
                  value={formulario.tipo}
                  onValueChange={(value) => setFormulario({ ...formulario, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="CEDULA">Cédula</SelectItem>
                    <SelectItem value="EDICTO">Edicto</SelectItem>
                    <SelectItem value="TACITA">Tácita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Método*</Label>
                <Select
                  value={formulario.metodo}
                  onValueChange={(value) => setFormulario({ ...formulario, metodo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="CEDULA">Cédula</SelectItem>
                    <SelectItem value="EDICTO">Edicto Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formulario.metodo === 'EMAIL' && (
              <div>
                <Label>Email*</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                />
              </div>
            )}

            {(formulario.metodo === 'PRESENCIAL' || formulario.metodo === 'CEDULA') && (
              <div>
                <Label>Domicilio</Label>
                <Textarea
                  placeholder="Dirección completa para la citación..."
                  value={formulario.domicilio}
                  onChange={(e) => setFormulario({ ...formulario, domicilio: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNueva(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearCitacion} disabled={procesando}>
              {procesando ? 'Creando...' : 'Crear Citación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
