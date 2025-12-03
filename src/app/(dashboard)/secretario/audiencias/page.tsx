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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Video, Calendar as CalendarIcon, Clock, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Audiencia {
  id: string;
  tipo: string;
  fecha: string;
  duracion: number;
  estado: string;
  sala: string;
  proceso: {
    nurej: string;
    materia: string;
    partes: Array<{
      tipo: string;
      nombres: string;
      apellidos: string;
    }>;
  };
  juez: {
    nombres: string;
    apellidos: string;
  };
}

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  estado: string;
  juezId: string;
  juez: {
    nombres: string;
    apellidos: string;
  };
}

export default function AudienciasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogNueva, setDialogNueva] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [formulario, setFormulario] = useState({
    procesoId: '',
    tipo: '',
    fecha: new Date(),
    hora: '',
    duracion: '60',
  });

  useEffect(() => {
    cargarAudiencias();
    cargarProcesos();
  }, []);

  const cargarAudiencias = async () => {
    try {
      const response = await fetch('/api/audiencias');
      if (response.ok) {
        const data = await response.json();
        setAudiencias(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las audiencias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProcesos = async () => {
    try {
      // Cargar procesos que requieren audiencia
      const response = await fetch('/api/procesos?estado=CONTESTACION_PENDIENTE,AUDIENCIA_PRELIMINAR');
      if (response.ok) {
        const data = await response.json();
        setProcesos(data.procesos || []);
      }
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    }
  };

  const handleCrearAudiencia = async () => {
    if (!formulario.procesoId || !formulario.tipo || !formulario.hora) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      // Combinar fecha y hora
      const fechaHora = new Date(formulario.fecha);
      const [horas, minutos] = formulario.hora.split(':');
      fechaHora.setHours(parseInt(horas), parseInt(minutos), 0, 0);

      const response = await fetch('/api/audiencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId: formulario.procesoId,
          tipo: formulario.tipo,
          fecha: fechaHora.toISOString(),
          duracion: parseInt(formulario.duracion),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear audiencia');
      }

      toast({
        title: 'Audiencia creada',
        description: 'La audiencia ha sido programada exitosamente',
      });

      setDialogNueva(false);
      setFormulario({
        procesoId: '',
        tipo: '',
        fecha: new Date(),
        hora: '',
        duracion: '60',
      });
      cargarAudiencias();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la audiencia',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  const AudienciaCard = ({ audiencia }: { audiencia: Audiencia }) => {
    const fechaAudiencia = new Date(audiencia.fecha);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{audiencia.proceso.nurej}</CardTitle>
              <CardDescription>{audiencia.proceso.materia}</CardDescription>
            </div>
            <Badge
              variant={
                audiencia.estado === 'FINALIZADA'
                  ? 'default'
                  : audiencia.estado === 'EN_CURSO'
                  ? 'destructive'
                  : 'secondary'
              }
              className={
                audiencia.estado === 'FINALIZADA'
                  ? 'bg-green-500'
                  : audiencia.estado === 'EN_CURSO'
                  ? 'bg-blue-500'
                  : ''
              }
            >
              {audiencia.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{format(fechaAudiencia, "d 'de' MMMM, yyyy", { locale: es })}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(fechaAudiencia, 'HH:mm')} - {audiencia.duracion} minutos
            </span>
          </div>

          <div className="text-sm">
            <span className="font-semibold">Tipo:</span> {audiencia.tipo}
          </div>

          <div className="text-sm">
            <span className="font-semibold">Juez:</span> {audiencia.juez.nombres}{' '}
            {audiencia.juez.apellidos}
          </div>

          <div className="pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/audiencia/${audiencia.id}`)}
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

  const audienciasProgramadas = audiencias.filter((a) => a.estado === 'PROGRAMADA');
  const audienciasHoy = audiencias.filter((a) => {
    const hoy = new Date();
    const fechaAudiencia = new Date(a.fecha);
    return (
      fechaAudiencia.getDate() === hoy.getDate() &&
      fechaAudiencia.getMonth() === hoy.getMonth() &&
      fechaAudiencia.getFullYear() === hoy.getFullYear()
    );
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audiencias</h1>
          <p className="text-muted-foreground">Gestión y programación de audiencias virtuales</p>
        </div>
        <Button onClick={() => setDialogNueva(true)}>
          <Plus className="h-4 w-4 mr-2" /> Programar Audiencia
        </Button>
      </div>

      <Tabs defaultValue="programadas">
        <TabsList>
          <TabsTrigger value="hoy">Hoy ({audienciasHoy.length})</TabsTrigger>
          <TabsTrigger value="programadas">
            Programadas ({audienciasProgramadas.length})
          </TabsTrigger>
          <TabsTrigger value="todas">Todas ({audiencias.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hoy" className="space-y-4 mt-6">
          {audienciasHoy.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay audiencias programadas para hoy</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienciasHoy.map((audiencia) => (
                <AudienciaCard key={audiencia.id} audiencia={audiencia} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programadas" className="space-y-4 mt-6">
          {audienciasProgramadas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay audiencias programadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienciasProgramadas.map((audiencia) => (
                <AudienciaCard key={audiencia.id} audiencia={audiencia} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiencias.map((audiencia) => (
              <AudienciaCard key={audiencia.id} audiencia={audiencia} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nueva Audiencia */}
      <Dialog open={dialogNueva} onOpenChange={setDialogNueva}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Programar Nueva Audiencia</DialogTitle>
            <DialogDescription>
              Configure los detalles de la audiencia virtual
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
              <Label>Tipo de Audiencia*</Label>
              <Select
                value={formulario.tipo}
                onValueChange={(value) => setFormulario({ ...formulario, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRELIMINAR">Audiencia Preliminar</SelectItem>
                  <SelectItem value="COMPLEMENTARIA">Audiencia Complementaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formulario.fecha, "d 'de' MMMM, yyyy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formulario.fecha}
                      onSelect={(date) =>
                        date && setFormulario({ ...formulario, fecha: date })
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Hora*</Label>
                <Input
                  type="time"
                  value={formulario.hora}
                  onChange={(e) => setFormulario({ ...formulario, hora: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Duración (minutos)*</Label>
              <Select
                value={formulario.duracion}
                onValueChange={(value) => setFormulario({ ...formulario, duracion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                  <SelectItem value="180">180 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Se generará automáticamente una sala virtual de Jitsi Meet
                y se notificará a todas las partes involucradas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNueva(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearAudiencia} disabled={procesando}>
              {procesando ? 'Programando...' : 'Programar Audiencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
