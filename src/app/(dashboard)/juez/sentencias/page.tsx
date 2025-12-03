'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Edit, CheckCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  objetoDemanda: string;
  estado: string;
  partes: Array<{
    tipo: string;
    nombres: string;
    apellidos: string;
  }>;
  plazos: Array<{
    tipo: string;
    fechaVencimiento: string;
    estado: string;
  }>;
  sentencia?: {
    id: string;
    estadoNotificacion: string;
    fechaEmision: string;
  };
}

export default function SentenciasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [procesosPendientes, setProcesosPendientes] = useState<Proceso[]>([]);
  const [sentenciasEmitidas, setSentenciasEmitidas] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar procesos en estado de sentencia pendiente
      const responsePendientes = await fetch('/api/procesos?estado=SENTENCIA_PENDIENTE');
      if (responsePendientes.ok) {
        const data = await responsePendientes.json();
        setProcesosPendientes(data.procesos || []);
      }

      // Cargar sentencias emitidas
      const responseSentenciados = await fetch('/api/procesos?estado=SENTENCIADO');
      if (responseSentenciados.ok) {
        const data = await responseSentenciados.json();
        setSentenciasEmitidas(data.procesos || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las sentencias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasRestantes = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = vencimiento.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const ProcesoCard = ({ proceso }: { proceso: Proceso }) => {
    const plazoSentencia = proceso.plazos?.find(p => p.tipo === 'SENTENCIA' && p.estado === 'ACTIVO');
    const diasRestantes = plazoSentencia ? calcularDiasRestantes(plazoSentencia.fechaVencimiento) : null;
    const demandante = proceso.partes.find(p => p.tipo === 'ACTOR');
    const demandado = proceso.partes.find(p => p.tipo === 'DEMANDADO');

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{proceso.nurej}</CardTitle>
              <CardDescription>{proceso.materia}</CardDescription>
            </div>
            {diasRestantes !== null && (
              <Badge
                variant={diasRestantes <= 3 ? 'destructive' : diasRestantes <= 7 ? 'default' : 'secondary'}
                className={diasRestantes > 7 ? 'bg-green-500' : ''}
              >
                <Clock className="h-3 w-3 mr-1" />
                {diasRestantes} días
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-semibold">Objeto:</p>
            <p className="text-muted-foreground line-clamp-2">{proceso.objetoDemanda}</p>
          </div>

          <div className="text-sm">
            <p className="font-semibold">Partes:</p>
            <p>
              <Badge variant="outline">Actor</Badge> {demandante?.nombres} {demandante?.apellidos}
            </p>
            <p className="mt-1">
              <Badge variant="outline">Demandado</Badge> {demandado?.nombres} {demandado?.apellidos}
            </p>
          </div>

          {plazoSentencia && (
            <div className="text-xs text-muted-foreground">
              Vence: {format(new Date(plazoSentencia.fechaVencimiento), "d 'de' MMMM", { locale: es })}
            </div>
          )}

          <div className="pt-3 border-t flex gap-2">
            {proceso.sentencia ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/juez/sentencia/nueva/${proceso.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Continuar Editando
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/proceso/${proceso.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push(`/juez/sentencia/nueva/${proceso.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" /> Redactar Sentencia
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const SentenciaEmitidaCard = ({ proceso }: { proceso: Proceso }) => {
    const demandante = proceso.partes.find(p => p.tipo === 'ACTOR');
    const demandado = proceso.partes.find(p => p.tipo === 'DEMANDADO');

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{proceso.nurej}</CardTitle>
              <CardDescription>{proceso.materia}</CardDescription>
            </div>
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Notificada
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-semibold">Fecha de emisión:</p>
            <p className="text-muted-foreground">
              {proceso.sentencia?.fechaEmision &&
                format(new Date(proceso.sentencia.fechaEmision), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>

          <div className="text-sm">
            <p className="font-semibold">Partes:</p>
            <p className="text-xs">
              {demandante?.nombres} {demandante?.apellidos} vs. {demandado?.nombres}{' '}
              {demandado?.apellidos}
            </p>
          </div>

          <div className="pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/proceso/${proceso.id}`)}
            >
              <FileText className="h-4 w-4 mr-2" /> Ver Expediente
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sentencias</h1>
        <p className="text-muted-foreground">
          Gestión de sentencias pendientes y emitidas
        </p>
      </div>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Pendientes ({procesosPendientes.length})
          </TabsTrigger>
          <TabsTrigger value="emitidas">
            Emitidas ({sentenciasEmitidas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4 mt-6">
          {procesosPendientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay sentencias pendientes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {procesosPendientes.map((proceso) => (
                <ProcesoCard key={proceso.id} proceso={proceso} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="emitidas" className="space-y-4 mt-6">
          {sentenciasEmitidas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay sentencias emitidas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentenciasEmitidas.map((proceso) => (
                <SentenciaEmitidaCard key={proceso.id} proceso={proceso} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
