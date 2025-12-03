'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Scale,
  AlertTriangle,
  Clock,
} from 'lucide-react';

import { FormularioContestacion } from './components/formulario-contestacion';
import { FormularioExcepciones } from './components/formulario-excepciones';
import { FormularioReconvencion } from './components/formulario-reconvencion';
import { FormularioAllanamiento } from './components/formulario-allanamiento';

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  estado: string;
  objetoDemanda: string;
  partes: Array<{
    id: string;
    tipo: string;
    nombres: string;
    apellidos: string;
    ci: string;
  }>;
  demanda: {
    hechos: string;
    derecho: string;
    petitorio: string;
    valor: number;
  };
  plazos: Array<{
    tipo: string;
    fechaVencimiento: string;
    diasPlazo: number;
  }>;
}

export default function ContestacionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');

  useEffect(() => {
    cargarProceso();
  }, [params.procesoId]);

  const cargarProceso = async () => {
    try {
      const response = await fetch(`/api/procesos/${params.procesoId}`);
      if (response.ok) {
        const data = await response.json();
        setProceso(data);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el proceso',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar el proceso',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasRestantes = () => {
    if (!proceso?.plazos?.length) return 0;
    const plazoContestacion = proceso.plazos.find((p) => p.tipo === 'CONTESTACION');
    if (!plazoContestacion) return 0;

    const hoy = new Date();
    const vencimiento = new Date(plazoContestacion.fechaVencimiento);
    const diff = vencimiento.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proceso) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Proceso no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (proceso.estado !== 'CONTESTACION_PENDIENTE') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-lg font-semibold mb-2">Proceso no disponible para contestación</p>
            <p className="text-muted-foreground">
              El estado actual del proceso no permite presentar contestación
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes();
  const parteDemandante = proceso.partes.find((p) => p.tipo === 'ACTOR');

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Contestación de Demanda</h1>
            <p className="text-muted-foreground">NUREJ: {proceso.nurej}</p>
          </div>
          <div className="text-right">
            <Badge
              variant={diasRestantes <= 5 ? 'destructive' : diasRestantes <= 10 ? 'default' : 'secondary'}
              className={
                diasRestantes > 10
                  ? 'bg-green-500'
                  : diasRestantes > 5
                  ? 'bg-yellow-500'
                  : ''
              }
            >
              <Clock className="h-3 w-3 mr-1" />
              {diasRestantes} días restantes
            </Badge>
          </div>
        </div>
      </div>

      {/* Alerta de plazo */}
      {diasRestantes <= 5 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>¡Plazo próximo a vencer!</AlertTitle>
          <AlertDescription>
            Le quedan solo {diasRestantes} días hábiles para presentar la contestación. Pasado
            este plazo, se declarará la rebeldía.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la Demanda */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Información de la Demanda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Demandante</p>
                <p className="font-medium">
                  {parteDemandante?.nombres} {parteDemandante?.apellidos}
                </p>
                <p className="text-sm text-muted-foreground">CI: {parteDemandante?.ci}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Materia</p>
                <p>{proceso.materia}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Objeto</p>
                <p className="text-sm">{proceso.objetoDemanda}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Cuantía</p>
                <p className="font-semibold">
                  Bs. {proceso.demanda?.valor?.toLocaleString('es-BO')}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/proceso/${proceso.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Demanda Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formularios de Contestación */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seleccione el Tipo de Respuesta</CardTitle>
              <CardDescription>
                Elija cómo desea responder a la demanda presentada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tipoSeleccionado} onValueChange={setTipoSeleccionado}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="contestar">Contestar</TabsTrigger>
                  <TabsTrigger value="excepciones">Excepciones</TabsTrigger>
                  <TabsTrigger value="reconvencion">Reconvenir</TabsTrigger>
                  <TabsTrigger value="allanamiento">Allanarse</TabsTrigger>
                </TabsList>

                <TabsContent value="contestar">
                  <div className="mb-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertTitle>Contestación de la Demanda</AlertTitle>
                      <AlertDescription>
                        Presente su contestación respondiendo punto por punto a los hechos y
                        fundamentos de derecho de la demanda. Debe ofrecer pruebas que respalden
                        su posición.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <FormularioContestacion
                    procesoId={proceso.id}
                    demanda={proceso.demanda}
                    onSuccess={() => router.push(`/proceso/${proceso.id}`)}
                  />
                </TabsContent>

                <TabsContent value="excepciones">
                  <div className="mb-4">
                    <Alert>
                      <Scale className="h-4 w-4" />
                      <AlertTitle>Excepciones Previas</AlertTitle>
                      <AlertDescription>
                        Las excepciones previas son defensas procesales que cuestionan aspectos
                        formales del proceso (competencia, litispendencia, falta de personería,
                        etc.). Se resuelven antes de entrar al fondo del asunto.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <FormularioExcepciones
                    procesoId={proceso.id}
                    onSuccess={() => router.push(`/proceso/${proceso.id}`)}
                  />
                </TabsContent>

                <TabsContent value="reconvencion">
                  <div className="mb-4">
                    <Alert>
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Reconvención (Contrademanda)</AlertTitle>
                      <AlertDescription>
                        La reconvención es una demanda que presenta el demandado contra el actor
                        dentro del mismo proceso. Debe cumplir los mismos requisitos que una
                        demanda ordinaria.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <FormularioReconvencion
                    procesoId={proceso.id}
                    onSuccess={() => router.push(`/proceso/${proceso.id}`)}
                  />
                </TabsContent>

                <TabsContent value="allanamiento">
                  <div className="mb-4">
                    <Alert variant="destructive">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Allanamiento a la Demanda</AlertTitle>
                      <AlertDescription>
                        <strong>¡ATENCIÓN!</strong> Al allanarse, está aceptando completamente las
                        pretensiones del demandante. Esta acción es irrevocable y el juez dictará
                        sentencia favorable al actor en un plazo de 15 días.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <FormularioAllanamiento
                    procesoId={proceso.id}
                    demanda={proceso.demanda}
                    onSuccess={() => router.push(`/proceso/${proceso.id}`)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
