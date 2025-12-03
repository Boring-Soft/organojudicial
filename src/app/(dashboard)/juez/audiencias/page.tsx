'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Video, Calendar as CalendarIcon, Clock, Eye, Users } from 'lucide-react';
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
}

export default function AudienciasJuezPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAudiencias();
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

  const AudienciaCard = ({ audiencia }: { audiencia: Audiencia }) => {
    const fechaAudiencia = new Date(audiencia.fecha);
    const ahora = new Date();
    const puedeIniciar = audiencia.estado === 'PROGRAMADA' && fechaAudiencia <= ahora;

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

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{audiencia.proceso.partes.length} partes involucradas</span>
          </div>

          <div className="pt-3 border-t space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/audiencia/${audiencia.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" /> Ver Detalle
            </Button>

            {puedeIniciar && (
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push(`/audiencia/${audiencia.id}`)}
              >
                <Video className="h-4 w-4 mr-2" /> Iniciar Audiencia
              </Button>
            )}

            {audiencia.estado === 'EN_CURSO' && (
              <Button
                size="sm"
                variant="default"
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => router.push(`/audiencia/${audiencia.id}`)}
              >
                <Video className="h-4 w-4 mr-2" /> Unirse a la Audiencia
              </Button>
            )}
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

  const audienciasHoy = audiencias.filter((a) => {
    const hoy = new Date();
    const fechaAudiencia = new Date(a.fecha);
    return (
      fechaAudiencia.getDate() === hoy.getDate() &&
      fechaAudiencia.getMonth() === hoy.getMonth() &&
      fechaAudiencia.getFullYear() === hoy.getFullYear()
    );
  });

  const audienciasProgramadas = audiencias.filter((a) => a.estado === 'PROGRAMADA');
  const audienciasEnCurso = audiencias.filter((a) => a.estado === 'EN_CURSO');
  const audienciasFinalizadas = audiencias.filter((a) => a.estado === 'FINALIZADA');

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mis Audiencias</h1>
        <p className="text-muted-foreground">
          Gestión de audiencias virtuales asignadas a su despacho
        </p>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold">{audienciasHoy.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programadas</p>
                <p className="text-2xl font-bold">{audienciasProgramadas.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Curso</p>
                <p className="text-2xl font-bold">{audienciasEnCurso.length}</p>
              </div>
              <Video className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
                <p className="text-2xl font-bold">{audienciasFinalizadas.length}</p>
              </div>
              <Badge className="h-8 w-8 bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hoy">
        <TabsList>
          <TabsTrigger value="hoy">Hoy ({audienciasHoy.length})</TabsTrigger>
          <TabsTrigger value="programadas">
            Programadas ({audienciasProgramadas.length})
          </TabsTrigger>
          <TabsTrigger value="encurso">En Curso ({audienciasEnCurso.length})</TabsTrigger>
          <TabsTrigger value="finalizadas">
            Finalizadas ({audienciasFinalizadas.length})
          </TabsTrigger>
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
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
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

        <TabsContent value="encurso" className="space-y-4 mt-6">
          {audienciasEnCurso.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay audiencias en curso</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienciasEnCurso.map((audiencia) => (
                <AudienciaCard key={audiencia.id} audiencia={audiencia} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalizadas" className="space-y-4 mt-6">
          {audienciasFinalizadas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Badge className="h-12 w-12 bg-green-500 mb-4" />
                <p className="text-muted-foreground">No hay audiencias finalizadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienciasFinalizadas.map((audiencia) => (
                <AudienciaCard key={audiencia.id} audiencia={audiencia} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
