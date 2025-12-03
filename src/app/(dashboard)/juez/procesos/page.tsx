'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Gavel,
  Video,
  Scale,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  estado: string;
  juzgado: string;
  createdAt: string;
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
    abogado?: {
      nombres: string;
      apellidos: string;
    };
  }>;
  demanda?: {
    id: string;
    tipo: string;
    cuantia: number | null;
    objetoDemanda: string;
  };
  plazos: Array<{
    id: string;
    tipo: string;
    descripcion: string;
    fechaVencimiento: string;
    estado: string;
  }>;
}

const ESTADOS_PROCESO = [
  { value: 'todos', label: 'Todos los Estados' },
  { value: 'ADMITIDO', label: 'Admitido' },
  { value: 'CONTESTACION_PENDIENTE', label: 'Contestación Pendiente' },
  { value: 'AUDIENCIA_PRELIMINAR', label: 'Audiencia Preliminar' },
  { value: 'AUDIENCIA_COMPLEMENTARIA', label: 'Audiencia Complementaria' },
  { value: 'PRUEBA', label: 'Prueba' },
  { value: 'SENTENCIA', label: 'Sentencia' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

export default function ProcesosJuezPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [filteredProcesos, setFilteredProcesos] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  useEffect(() => {
    cargarProcesos();
  }, []);

  useEffect(() => {
    filtrarProcesos();
  }, [searchTerm, estadoFilter, procesos]);

  const cargarProcesos = async () => {
    try {
      const response = await fetch('/api/procesos');
      if (response.ok) {
        const data = await response.json();
        setProcesos(data.procesos || []);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los procesos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al cargar procesos:', error);
      toast({
        title: 'Error',
        description: 'Error al conectar con el servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filtrarProcesos = () => {
    let filtered = procesos;

    if (searchTerm) {
      filtered = filtered.filter(
        (proceso) =>
          proceso.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proceso.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proceso.partes.some(
            (parte) =>
              parte.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
              parte.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (estadoFilter !== 'todos') {
      filtered = filtered.filter((proceso) => proceso.estado === estadoFilter);
    }

    setFilteredProcesos(filtered);
  };

  const getEstadoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      ADMITIDO: 'bg-green-500',
      CONTESTACION_PENDIENTE: 'bg-yellow-500',
      AUDIENCIA_PRELIMINAR: 'bg-blue-500',
      AUDIENCIA_COMPLEMENTARIA: 'bg-purple-500',
      PRUEBA: 'bg-orange-500',
      SENTENCIA: 'bg-red-500',
      FINALIZADO: 'bg-gray-500',
    };
    return colors[estado] || 'bg-gray-500';
  };

  const calcularDiasRestantes = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ProcesoCard = ({ proceso }: { proceso: Proceso }) => {
    const actor = proceso.partes.find((p) => p.tipo === 'ACTOR');
    const demandado = proceso.partes.find((p) => p.tipo === 'DEMANDADO');
    const plazoActivo = proceso.plazos[0];
    const diasRestantes = plazoActivo ? calcularDiasRestantes(plazoActivo.fechaVencimiento) : null;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{proceso.nurej}</CardTitle>
              </div>
              <CardDescription>{proceso.materia}</CardDescription>
            </div>
            <Badge className={getEstadoBadgeColor(proceso.estado)}>
              {proceso.estado.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Partes */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Actor:</p>
                <p className="text-muted-foreground">
                  {actor ? `${actor.nombres} ${actor.apellidos}` : 'No asignado'}
                  {actor?.abogado && (
                    <span className="text-xs block">
                      Abog. {actor.abogado.nombres} {actor.abogado.apellidos}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Demandado:</p>
                <p className="text-muted-foreground">
                  {demandado ? `${demandado.nombres} ${demandado.apellidos}` : 'No asignado'}
                  {demandado?.abogado && (
                    <span className="text-xs block">
                      Abog. {demandado.abogado.nombres} {demandado.abogado.apellidos}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Demanda */}
          {proceso.demanda && (
            <div className="text-sm border-t pt-3">
              <p className="font-semibold mb-1">Objeto de la demanda:</p>
              <p className="text-muted-foreground text-xs">{proceso.demanda.objetoDemanda}</p>
              {proceso.demanda.cuantia && (
                <p className="text-xs mt-1">
                  <span className="font-semibold">Cuantía:</span> Bs.{' '}
                  {proceso.demanda.cuantia.toLocaleString('es-BO')}
                </p>
              )}
            </div>
          )}

          {/* Plazo Activo */}
          {plazoActivo && (
            <div
              className={`rounded-lg p-3 ${
                diasRestantes !== null && diasRestantes <= 3
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <Clock
                  className={`h-4 w-4 mt-0.5 ${
                    diasRestantes !== null && diasRestantes <= 3 ? 'text-red-600' : 'text-blue-600'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Próximo plazo:</p>
                  <p className="text-xs text-muted-foreground">{plazoActivo.descripcion}</p>
                  <p className="text-xs mt-1">
                    Vence:{' '}
                    {format(new Date(plazoActivo.fechaVencimiento), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                  {diasRestantes !== null && (
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        diasRestantes <= 3 ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {diasRestantes > 0
                        ? `${diasRestantes} días restantes`
                        : diasRestantes === 0
                        ? 'Vence hoy'
                        : `Venció hace ${Math.abs(diasRestantes)} días`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/proceso/${proceso.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" /> Ver Detalle
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/juez/audiencias?proceso=${proceso.id}`)}
            >
              <Video className="h-4 w-4 mr-2" /> Audiencias
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/juez/resoluciones?proceso=${proceso.id}`)}
            >
              <Gavel className="h-4 w-4 mr-2" /> Resolución
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/juez/sentencias?proceso=${proceso.id}`)}
            >
              <FileText className="h-4 w-4 mr-2" /> Sentencia
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

  // Estadísticas
  const procesosPorEstado = ESTADOS_PROCESO.slice(1).map((estado) => ({
    estado: estado.label,
    cantidad: procesos.filter((p) => p.estado === estado.value).length,
  }));

  const procesosConPlazosUrgentes = procesos.filter((p) => {
    if (p.plazos.length === 0) return false;
    const dias = calcularDiasRestantes(p.plazos[0].fechaVencimiento);
    return dias !== null && dias <= 3 && dias >= 0;
  }).length;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mis Procesos Asignados</h1>
        <p className="text-muted-foreground">Gestión de procesos judiciales a su cargo</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Procesos</p>
                <p className="text-3xl font-bold">{procesos.length}</p>
              </div>
              <Scale className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Contestación</p>
                <p className="text-3xl font-bold">
                  {procesos.filter((p) => p.estado === 'CONTESTACION_PENDIENTE').length}
                </p>
              </div>
              <FileText className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Audiencia</p>
                <p className="text-3xl font-bold">
                  {
                    procesos.filter(
                      (p) =>
                        p.estado === 'AUDIENCIA_PRELIMINAR' ||
                        p.estado === 'AUDIENCIA_COMPLEMENTARIA'
                    ).length
                  }
                </p>
              </div>
              <Video className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plazos Urgentes</p>
                <p className="text-3xl font-bold text-red-600">{procesosConPlazosUrgentes}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por NUREJ, materia o parte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_PROCESO.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos ({filteredProcesos.length})</TabsTrigger>
          <TabsTrigger value="urgentes">
            Urgentes ({procesosConPlazosUrgentes})
          </TabsTrigger>
          <TabsTrigger value="activos">
            Activos (
            {
              procesos.filter(
                (p) =>
                  p.estado !== 'FINALIZADO' &&
                  p.estado !== 'SENTENCIA'
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          {filteredProcesos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron procesos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProcesos.map((proceso) => (
                <ProcesoCard key={proceso.id} proceso={proceso} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="urgentes" className="mt-6">
          {procesos
            .filter((p) => {
              if (p.plazos.length === 0) return false;
              const dias = calcularDiasRestantes(p.plazos[0].fechaVencimiento);
              return dias !== null && dias <= 3 && dias >= 0;
            })
            .filter((p) =>
              estadoFilter === 'todos' ? true : p.estado === estadoFilter
            ).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay procesos con plazos urgentes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {procesos
                .filter((p) => {
                  if (p.plazos.length === 0) return false;
                  const dias = calcularDiasRestantes(p.plazos[0].fechaVencimiento);
                  return dias !== null && dias <= 3 && dias >= 0;
                })
                .filter((p) =>
                  estadoFilter === 'todos' ? true : p.estado === estadoFilter
                )
                .map((proceso) => (
                  <ProcesoCard key={proceso.id} proceso={proceso} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activos" className="mt-6">
          {procesos
            .filter(
              (p) =>
                p.estado !== 'FINALIZADO' &&
                p.estado !== 'SENTENCIA'
            )
            .filter((p) =>
              estadoFilter === 'todos' ? true : p.estado === estadoFilter
            ).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay procesos activos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {procesos
                .filter(
                  (p) =>
                    p.estado !== 'FINALIZADO' &&
                    p.estado !== 'SENTENCIA'
                )
                .filter((p) =>
                  estadoFilter === 'todos' ? true : p.estado === estadoFilter
                )
                .map((proceso) => (
                  <ProcesoCard key={proceso.id} proceso={proceso} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
