'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Proceso {
  id: string;
  nurej: string;
  tipo: string;
  estado: string;
  materia: string;
  juzgado: string;
  cuantia: number;
  objetoDemanda: string;
  fechaInicio: string;
  juez: {
    nombres: string;
    apellidos: string;
  };
  partes: Array<{
    id: string;
    tipo: string;
    nombres: string;
    apellidos: string;
    ci: string;
    domicilioReal: string;
    abogado?: {
      nombres: string;
      apellidos: string;
      registroAbogado: string;
    };
  }>;
  demanda?: {
    id: string;
    estado: string;
    hechos: string;
    derecho: string;
    petitorio: string;
    valor: number;
  };
  plazos: Array<{
    id: string;
    tipo: string;
    descripcion: string;
    fechaVencimiento: string;
    estado: string;
    diasPlazo: number;
  }>;
  documentos: Array<{
    id: string;
    nombre: string;
    tipo: string;
    url: string;
    createdAt: string;
    uploadedByRole: string;
  }>;
  citaciones: Array<{
    id: string;
    tipo: string;
    estado: string;
    createdAt: string;
  }>;
  audiencias: Array<{
    id: string;
    tipo: string;
    fecha: string;
    estado: string;
  }>;
}

const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-500',
  PRESENTADO: 'bg-blue-500',
  ADMITIDO: 'bg-green-500',
  CITACION_PENDIENTE: 'bg-yellow-500',
  CONTESTACION_PENDIENTE: 'bg-orange-500',
  AUDIENCIA_PRELIMINAR: 'bg-purple-500',
  SENTENCIA_PENDIENTE: 'bg-pink-500',
  SENTENCIADO: 'bg-green-600',
  EJECUTORIADO: 'bg-teal-600',
  ARCHIVADO: 'bg-gray-600',
};

const TIMELINE_ESTADOS = [
  'BORRADOR',
  'PRESENTADO',
  'ADMITIDO',
  'CITACION_PENDIENTE',
  'CONTESTACION_PENDIENTE',
  'AUDIENCIA_PRELIMINAR',
  'SENTENCIA_PENDIENTE',
  'SENTENCIADO',
  'EJECUTORIADO',
];

export default function ProcesoDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProceso();
  }, [params.id]);

  const cargarProceso = async () => {
    try {
      const response = await fetch(`/api/procesos/${params.id}`);
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

  const calcularDiasRestantes = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Proceso no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estadoActualIndex = TIMELINE_ESTADOS.indexOf(proceso.estado);
  const actor = proceso.partes.find(p => p.tipo === 'ACTOR');
  const demandado = proceso.partes.find(p => p.tipo === 'DEMANDADO');

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{proceso.nurej}</h1>
            <p className="text-muted-foreground">{proceso.materia} - {proceso.juzgado}</p>
          </div>
          <Badge className={ESTADO_COLORS[proceso.estado]}>
            {proceso.estado.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Timeline de estados */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progreso del Proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex justify-between mb-2">
              {TIMELINE_ESTADOS.map((estado, index) => (
                <div key={estado} className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                      ${index <= estadoActualIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'}
                    `}
                  >
                    {index < estadoActualIndex ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : index === estadoActualIndex ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-xs text-center mt-2 max-w-[80px]">
                    {estado.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-0 right-0 h-1 bg-muted -z-10">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(estadoActualIndex / (TIMELINE_ESTADOS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipo de Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{proceso.tipo}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cuantía</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Bs. {proceso.cuantia?.toLocaleString('es-BO') || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fecha de Inicio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Date(proceso.fechaInicio).toLocaleDateString('es-BO')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de información */}
      <Tabs defaultValue="partes">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="partes">Partes</TabsTrigger>
          <TabsTrigger value="demanda">Demanda</TabsTrigger>
          <TabsTrigger value="plazos">Plazos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="audiencias">Audiencias</TabsTrigger>
        </TabsList>

        {/* Partes */}
        <TabsContent value="partes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parte Actora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-semibold">{actor?.nombres} {actor?.apellidos}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CI</p>
                  <p>{actor?.ci}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Domicilio</p>
                  <p className="text-sm">{actor?.domicilioReal}</p>
                </div>
                {actor?.abogado && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Abogado</p>
                      <p className="font-semibold">
                        {actor.abogado.nombres} {actor.abogado.apellidos}
                      </p>
                      <p className="text-sm">Reg. {actor.abogado.registroAbogado}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Demandado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parte Demandada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-semibold">{demandado?.nombres} {demandado?.apellidos}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CI</p>
                  <p>{demandado?.ci}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Domicilio</p>
                  <p className="text-sm">{demandado?.domicilioReal}</p>
                </div>
                {demandado?.abogado && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Abogado</p>
                      <p className="font-semibold">
                        {demandado.abogado.nombres} {demandado.abogado.apellidos}
                      </p>
                      <p className="text-sm">Reg. {demandado.abogado.registroAbogado}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Juez */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Juez Asignado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {proceso.juez.nombres} {proceso.juez.apellidos}
              </p>
              <p className="text-sm text-muted-foreground">{proceso.juzgado}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demanda */}
        <TabsContent value="demanda">
          {proceso.demanda ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Demanda</CardTitle>
                    <CardDescription>Estado: {proceso.demanda.estado}</CardDescription>
                  </div>
                  <Badge>Bs. {proceso.demanda.valor?.toLocaleString('es-BO')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Objeto de la Demanda</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{proceso.objetoDemanda}</p>
                </div>

                <Separator />

                <div>
                  <p className="font-semibold mb-2">Hechos</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {proceso.demanda.hechos}
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Fundamentos de Derecho</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {proceso.demanda.derecho}
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Petitorio</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {proceso.demanda.petitorio}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay demanda registrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plazos */}
        <TabsContent value="plazos">
          <div className="space-y-4">
            {proceso.plazos.length > 0 ? (
              proceso.plazos.map((plazo) => {
                const diasRestantes = calcularDiasRestantes(plazo.fechaVencimiento);
                const urgencia = diasRestantes <= 3 ? 'critico' : diasRestantes <= 7 ? 'urgente' : 'normal';

                return (
                  <Card key={plazo.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{plazo.descripcion}</CardTitle>
                          <CardDescription>{plazo.tipo}</CardDescription>
                        </div>
                        <Badge
                          variant={plazo.estado === 'ACTIVO' ? 'default' : 'secondary'}
                          className={
                            plazo.estado === 'ACTIVO' && urgencia === 'critico'
                              ? 'bg-red-500'
                              : plazo.estado === 'ACTIVO' && urgencia === 'urgente'
                              ? 'bg-orange-500'
                              : ''
                          }
                        >
                          {plazo.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Vencimiento</p>
                          <p className="font-semibold">
                            {new Date(plazo.fechaVencimiento).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Días de plazo</p>
                          <p className="font-semibold">{plazo.diasPlazo} días hábiles</p>
                        </div>
                        {plazo.estado === 'ACTIVO' && (
                          <div>
                            <p className="text-muted-foreground">Días restantes</p>
                            <p className={`font-semibold ${urgencia === 'critico' ? 'text-red-500' : urgencia === 'urgente' ? 'text-orange-500' : ''}`}>
                              {diasRestantes} días
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay plazos registrados</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <div className="space-y-4">
            {proceso.documentos.length > 0 ? (
              proceso.documentos.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">{doc.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.tipo} - Subido por {doc.uploadedByRole}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString('es-BO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" /> Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay documentos registrados</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Audiencias */}
        <TabsContent value="audiencias">
          <div className="space-y-4">
            {proceso.audiencias.length > 0 ? (
              proceso.audiencias.map((audiencia) => (
                <Card key={audiencia.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          Audiencia {audiencia.tipo}
                        </CardTitle>
                        <CardDescription>
                          {new Date(audiencia.fecha).toLocaleString('es-BO')}
                        </CardDescription>
                      </div>
                      <Badge>{audiencia.estado}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay audiencias programadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
