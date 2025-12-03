'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Plus, CheckCircle, XCircle, MapPin, Upload } from 'lucide-react';

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
    evidenciaUrl?: string;
    geolocalizacion?: {
      lat: number;
      lng: number;
    };
  }>;
  proceso: {
    id: string;
    nurej: string;
    materia: string;
    juzgado: string;
    partes: Array<{
      id: string;
      tipo: string;
      nombres: string;
      apellidos: string;
      ci: string;
      domicilioReal: string;
    }>;
  };
  parteId: string;
}

export default function CitacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [citacion, setCitacion] = useState<Citacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogIntento, setDialogIntento] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [formularioIntento, setFormularioIntento] = useState({
    metodo: '',
    resultado: '',
    descripcion: '',
    evidenciaUrl: '',
  });

  useEffect(() => {
    cargarCitacion();
  }, [params.id]);

  const cargarCitacion = async () => {
    try {
      const response = await fetch(`/api/citaciones/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCitacion(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la citación',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarIntento = async () => {
    if (!formularioIntento.metodo || !formularioIntento.resultado) {
      toast({
        title: 'Error',
        description: 'Complete los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      const response = await fetch(`/api/citaciones/${params.id}/intento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formularioIntento),
      });

      if (!response.ok) throw new Error('Error al registrar intento');

      toast({
        title: 'Intento registrado',
        description: 'El intento de citación ha sido registrado exitosamente',
      });

      setDialogIntento(false);
      setFormularioIntento({
        metodo: '',
        resultado: '',
        descripcion: '',
        evidenciaUrl: '',
      });
      cargarCitacion();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el intento',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!citacion) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Citación no encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parteDemandada = citacion.proceso.partes.find(p => p.id === citacion.parteId);

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Citación - {citacion.proceso.nurej}</h1>
            <p className="text-muted-foreground">
              {citacion.tipo} - {citacion.metodo}
            </p>
          </div>
          <Badge
            variant={
              citacion.estado === 'EXITOSA'
                ? 'default'
                : citacion.estado === 'FALLIDA'
                ? 'destructive'
                : 'secondary'
            }
            className={citacion.estado === 'EXITOSA' ? 'bg-green-500' : ''}
          >
            {citacion.estado}
          </Badge>
        </div>
      </div>

      {/* Información de la Parte */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Parte a Citar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre Completo</Label>
              <p className="font-semibold">
                {parteDemandada?.nombres} {parteDemandada?.apellidos}
              </p>
            </div>
            <div>
              <Label>CI</Label>
              <p className="font-semibold">{parteDemandada?.ci}</p>
            </div>
          </div>
          <div>
            <Label>Domicilio</Label>
            <p className="text-sm">{parteDemandada?.domicilioReal}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Juzgado</Label>
              <p>{citacion.proceso.juzgado}</p>
            </div>
            <div>
              <Label>Materia</Label>
              <p>{citacion.proceso.materia}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registro de Intentos */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Registro de Intentos</CardTitle>
              <CardDescription>
                Total de intentos: {citacion.intentos.length}
              </CardDescription>
            </div>
            {citacion.estado !== 'EXITOSA' && (
              <Button onClick={() => setDialogIntento(true)}>
                <Plus className="h-4 w-4 mr-2" /> Registrar Intento
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {citacion.intentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay intentos registrados
            </div>
          ) : (
            <div className="space-y-4">
              {citacion.intentos.map((intento, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Intento #{index + 1}</span>
                      <Badge
                        variant={intento.resultado === 'EXITOSO' ? 'default' : 'secondary'}
                        className={
                          intento.resultado === 'EXITOSO'
                            ? 'bg-green-500'
                            : intento.resultado === 'FALLIDO'
                            ? 'bg-red-500'
                            : ''
                        }
                      >
                        {intento.resultado === 'EXITOSO' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {intento.resultado === 'FALLIDO' && <XCircle className="h-3 w-3 mr-1" />}
                        {intento.resultado}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(intento.fecha).toLocaleString('es-BO')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Método:</span>{' '}
                      <span className="font-medium">{intento.metodo}</span>
                    </div>
                  </div>

                  {intento.descripcion && (
                    <div className="mt-3">
                      <Label>Descripción</Label>
                      <p className="text-sm bg-muted p-2 rounded mt-1">
                        {intento.descripcion}
                      </p>
                    </div>
                  )}

                  {intento.evidenciaUrl && (
                    <div className="mt-3">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" /> Ver Evidencia
                      </Button>
                    </div>
                  )}

                  {intento.geolocalizacion && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        Lat: {intento.geolocalizacion.lat}, Lng: {intento.geolocalizacion.lng}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Fecha de Creación</Label>
              <p>{new Date(citacion.createdAt).toLocaleDateString('es-BO')}</p>
            </div>
            {citacion.fechaValidacion && (
              <div>
                <Label>Fecha de Validación</Label>
                <p className="text-green-600 font-semibold">
                  {new Date(citacion.fechaValidacion).toLocaleDateString('es-BO')}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-semibold mb-2">Notas:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Después de 3 intentos fallidos, proceder con citación por edicto</li>
              <li>Documentar cada intento con evidencia fotográfica si es posible</li>
              <li>La citación personal requiere geolocalización</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Registrar Intento */}
      <Dialog open={dialogIntento} onOpenChange={setDialogIntento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Intento de Citación</DialogTitle>
            <DialogDescription>
              Complete la información del intento de citación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Método Utilizado*</Label>
              <Select
                value={formularioIntento.metodo}
                onValueChange={(value) =>
                  setFormularioIntento({ ...formularioIntento, metodo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="CEDULA">Cédula</SelectItem>
                  <SelectItem value="TELEFONICO">Telefónico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resultado*</Label>
              <Select
                value={formularioIntento.resultado}
                onValueChange={(value) =>
                  setFormularioIntento({ ...formularioIntento, resultado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXITOSO">Exitoso</SelectItem>
                  <SelectItem value="FALLIDO">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                placeholder="Describa lo ocurrido durante el intento de citación..."
                value={formularioIntento.descripcion}
                onChange={(e) =>
                  setFormularioIntento({ ...formularioIntento, descripcion: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
              <p className="font-semibold mb-1">Nota:</p>
              Si el intento es exitoso, se creará automáticamente el plazo de contestación
              de 30 días hábiles para el demandado.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogIntento(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrarIntento} disabled={procesando}>
              {procesando ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
