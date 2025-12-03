'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Calendar,
  FileSignature,
  FileText,
  Gavel,
  TrendingUp,
  Clock,
  CheckCircle2,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Proceso {
  id: string;
  nurej: string;
  estado: string;
  partes: Array<{
    tipo: string;
    nombres: string;
    apellidos: string;
  }>;
  plazos: Array<{
    id: string;
    tipo: string;
    descripcion: string;
    fechaVencimiento: string;
  }>;
}

interface Sentencia {
  id: string;
  procesoId: string;
  fechaEmision: string;
}

interface Resolucion {
  id: string;
  tipo: string;
  fechaEmision: string;
}

interface Audiencia {
  id: string;
  tipo: string;
  fecha: string;
  estado: string;
  proceso: {
    nurej: string;
    partes: Array<{
      tipo: string;
      nombres: string;
      apellidos: string;
    }>;
  };
}

export default function JuezDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Estados para datos reales
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [sentencias, setSentencias] = useState<Sentencia[]>([]);
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar todos los datos en paralelo
      const [procesosRes, sentenciasRes, resolucionesRes, audienciasRes] = await Promise.all([
        fetch('/api/procesos?limit=100'),
        fetch('/api/sentencias'),
        fetch('/api/resoluciones'),
        fetch('/api/audiencias'),
      ]);

      if (procesosRes.ok) {
        const data = await procesosRes.json();
        setProcesos(data.procesos || []);
      }

      if (sentenciasRes.ok) {
        const data = await sentenciasRes.json();
        setSentencias(data || []);
      }

      if (resolucionesRes.ok) {
        const data = await resolucionesRes.json();
        setResoluciones(data || []);
      }

      if (audienciasRes.ok) {
        const data = await audienciasRes.json();
        setAudiencias(data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar algunos datos del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de métricas reales
  const procesosActivos = procesos.filter(
    (p) => p.estado !== 'FINALIZADO' && p.estado !== 'SENTENCIA'
  ).length;

  const audienciasHoy = audiencias.filter((a) => {
    const hoy = new Date();
    const fechaAudiencia = new Date(a.fecha);
    return (
      fechaAudiencia.getDate() === hoy.getDate() &&
      fechaAudiencia.getMonth() === hoy.getMonth() &&
      fechaAudiencia.getFullYear() === hoy.getFullYear()
    );
  });

  const audienciasRealizadas = audiencias.filter((a) => a.estado === 'FINALIZADA').length;

  // Plazos críticos (vencen en 10 días o menos)
  const plazosCriticos = procesos
    .filter((p) => p.plazos && p.plazos.length > 0)
    .map((p) => {
      const plazo = p.plazos[0];
      const diasRestantes = calcularDiasRestantes(plazo.fechaVencimiento);
      return { proceso: p, plazo, diasRestantes };
    })
    .filter((item) => item.diasRestantes !== null && item.diasRestantes >= 0 && item.diasRestantes <= 10)
    .sort((a, b) => (a.diasRestantes || 0) - (b.diasRestantes || 0))
    .slice(0, 5);

  // Procesos por etapa
  const procesosPorEtapa = [
    {
      etapa: 'Admitido',
      estado: 'ADMITIDO',
      cantidad: procesos.filter((p) => p.estado === 'ADMITIDO').length,
      color: 'bg-blue-500',
    },
    {
      etapa: 'Contestación Pendiente',
      estado: 'CONTESTACION_PENDIENTE',
      cantidad: procesos.filter((p) => p.estado === 'CONTESTACION_PENDIENTE').length,
      color: 'bg-yellow-500',
    },
    {
      etapa: 'Audiencia Preliminar',
      estado: 'AUDIENCIA_PRELIMINAR',
      cantidad: procesos.filter((p) => p.estado === 'AUDIENCIA_PRELIMINAR').length,
      color: 'bg-purple-500',
    },
    {
      etapa: 'Prueba',
      estado: 'PRUEBA',
      cantidad: procesos.filter((p) => p.estado === 'PRUEBA').length,
      color: 'bg-orange-500',
    },
    {
      etapa: 'Sentencia',
      estado: 'SENTENCIA',
      cantidad: procesos.filter((p) => p.estado === 'SENTENCIA').length,
      color: 'bg-red-500',
    },
    {
      etapa: 'Finalizados',
      estado: 'FINALIZADO',
      cantidad: procesos.filter((p) => p.estado === 'FINALIZADO').length,
      color: 'bg-green-500',
    },
  ];

  // Cálculo de cumplimiento de plazos
  const calcularCumplimientoPlazos = () => {
    if (procesos.length === 0) return 0;

    const procesosConPlazos = procesos.filter((p) => p.plazos && p.plazos.length > 0);
    if (procesosConPlazos.length === 0) return 100;

    const plazosVencidos = procesosConPlazos.filter((p) => {
      const diasRestantes = calcularDiasRestantes(p.plazos[0].fechaVencimiento);
      return diasRestantes !== null && diasRestantes < 0;
    }).length;

    const porcentaje = ((procesosConPlazos.length - plazosVencidos) / procesosConPlazos.length) * 100;
    return Math.round(porcentaje);
  };

  const cumplimientoPlazos = calcularCumplimientoPlazos();

  function calcularDiasRestantes(fechaVencimiento: string): number | null {
    if (!fechaVencimiento) return null;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const getDiasColor = (dias: number | null) => {
    if (dias === null) return 'text-gray-600';
    if (dias <= 3) return 'text-red-600';
    if (dias <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard del Juez</h1>
        <p className="text-muted-foreground">Gestión judicial y toma de decisiones</p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Procesos Activos</p>
                <p className="text-2xl font-bold">{procesosActivos}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sentencias Emitidas</p>
                <p className="text-2xl font-bold">{sentencias.length}</p>
              </div>
              <FileSignature className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cumplimiento Plazos</p>
                <p className="text-2xl font-bold">{cumplimientoPlazos}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plazos Críticos</p>
                <p className="text-2xl font-bold">{plazosCriticos.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plazos Críticos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plazos Críticos</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/juez/procesos">Ver Todos</Link>
                </Button>
              </div>
              <CardDescription>Sentencias y resoluciones próximas a vencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plazosCriticos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No hay plazos críticos en este momento</p>
                </div>
              ) : (
                plazosCriticos.map((item) => {
                  const actor = item.proceso.partes.find((p) => p.tipo === 'ACTOR');
                  const demandado = item.proceso.partes.find((p) => p.tipo === 'DEMANDADO');

                  return (
                    <Card
                      key={item.proceso.id}
                      className={`border-l-4 ${
                        item.diasRestantes !== null && item.diasRestantes <= 3
                          ? 'border-l-red-500'
                          : 'border-l-yellow-500'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{item.proceso.nurej}</p>
                              <Badge variant={item.plazo.tipo === 'SENTENCIA' ? 'destructive' : 'default'}>
                                {item.plazo.tipo}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {actor ? `${actor.nombres} ${actor.apellidos}` : 'Actor no asignado'} vs.{' '}
                              {demandado ? `${demandado.nombres} ${demandado.apellidos}` : 'Demandado no asignado'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.plazo.descripcion}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className={`text-sm font-bold ${getDiasColor(item.diasRestantes)}`}>
                                {item.diasRestantes === 0
                                  ? 'Vence hoy'
                                  : item.diasRestantes === 1
                                  ? '1 día restante'
                                  : `${item.diasRestantes} días restantes`}
                              </span>
                            </div>
                          </div>
                          <AlertCircle
                            className={`h-5 w-5 ${
                              item.diasRestantes !== null && item.diasRestantes <= 3
                                ? 'text-red-500'
                                : 'text-yellow-500'
                            }`}
                          />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(
                                item.plazo.tipo === 'SENTENCIA'
                                  ? `/juez/sentencias`
                                  : `/juez/resoluciones`
                              )
                            }
                          >
                            {item.plazo.tipo === 'SENTENCIA' ? 'Emitir Sentencia' : 'Emitir Resolución'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/proceso/${item.proceso.id}`)}
                          >
                            Ver Expediente
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Procesos por Etapa */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Procesos por Etapa</CardTitle>
              <CardDescription>Vista Kanban de los procesos activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procesosPorEtapa.map((item) => (
                  <div key={item.etapa} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.etapa}</span>
                      </div>
                      <Badge variant="secondary">{item.cantidad}</Badge>
                    </div>
                    <Progress
                      value={procesos.length > 0 ? (item.cantidad / procesos.length) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href="/juez/procesos">Ver Detalle de Procesos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Audiencias del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audiencias del Día</CardTitle>
              <CardDescription>Programación de hoy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {audienciasHoy.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay audiencias programadas para hoy</p>
                </div>
              ) : (
                audienciasHoy.map((audiencia) => {
                  const actor = audiencia.proceso.partes.find((p) => p.tipo === 'ACTOR');
                  const demandado = audiencia.proceso.partes.find((p) => p.tipo === 'DEMANDADO');

                  return (
                    <Card key={audiencia.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Video className="mt-1 h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{audiencia.proceso.nurej}</p>
                            <p className="text-xs text-muted-foreground">{audiencia.tipo}</p>
                            <p className="mt-1 text-xs">
                              <Clock className="mr-1 inline h-3 w-3" />
                              {format(new Date(audiencia.fecha), 'HH:mm')}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {actor ? `${actor.nombres} ${actor.apellidos}` : 'Actor'} vs.{' '}
                              {demandado ? `${demandado.nombres} ${demandado.apellidos}` : 'Demandado'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/audiencia/${audiencia.id}`)}
                          >
                            Acceder
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
              <Button className="w-full" variant="outline" asChild>
                <Link href="/juez/audiencias">Ver Calendario Completo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Métricas de Desempeño */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Desempeño</CardTitle>
              <CardDescription>Resumen del mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cumplimiento de plazos</span>
                  <span className="font-semibold">{cumplimientoPlazos}%</span>
                </div>
                <Progress value={cumplimientoPlazos} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sentencias emitidas</span>
                  <span className="font-semibold">{sentencias.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resoluciones emitidas</span>
                  <span className="font-semibold">{resoluciones.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Audiencias realizadas</span>
                  <span className="font-semibold">{audienciasRealizadas}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Procesos resueltos</span>
                  <span className="font-semibold">
                    {procesos.filter((p) => p.estado === 'FINALIZADO').length}
                  </span>
                </div>
              </div>

              <Button className="w-full" variant="outline" asChild>
                <Link href="/juez/reportes">Ver Reporte Completo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/juez/sentencias">
                  <FileSignature className="mr-2 h-4 w-4" />
                  Nueva Sentencia
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/juez/resoluciones">
                  <Gavel className="mr-2 h-4 w-4" />
                  Nueva Resolución
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/juez/procesos">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Procesos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
