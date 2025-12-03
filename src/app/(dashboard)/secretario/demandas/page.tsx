'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Check, X, AlertCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Demanda {
  id: string;
  estado: string;
  createdAt: string;
  objetoDemanda: string;
  valor: number;
  proceso: {
    id: string;
    nurej: string;
    materia: string;
    partes: Array<{
      tipo: string;
      nombres: string;
      apellidos: string;
      abogado?: {
        nombres: string;
        apellidos: string;
        registroAbogado: string;
      };
    }>;
  };
}

export default function DemandasSecretarioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [demandaSeleccionada, setDemandaSeleccionada] = useState<Demanda | null>(null);
  const [dialogObservar, setDialogObservar] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDemandas();
  }, []);

  const cargarDemandas = async () => {
    try {
      const response = await fetch('/api/demandas?estado=PRESENTADA');
      if (response.ok) {
        const data = await response.json();
        setDemandas(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las demandas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdmitir = async (demanda: Demanda) => {
    setProcesando(true);
    try {
      // 1. Cambiar estado de demanda a ADMITIDA
      const response = await fetch(`/api/demandas/${demanda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'ADMITIDA',
          fechaAdmision: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Error al admitir demanda');

      // 2. Cambiar estado del proceso a ADMITIDO
      await fetch(`/api/procesos/${demanda.proceso.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ADMITIDO' }),
      });

      toast({
        title: 'Demanda admitida',
        description: `NUREJ: ${demanda.proceso.nurej}`,
      });

      cargarDemandas();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo admitir la demanda',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleObservar = async () => {
    if (!demandaSeleccionada || !observaciones.trim()) {
      toast({
        title: 'Error',
        description: 'Debe ingresar las observaciones',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      // Cambiar estado a OBSERVADA
      const response = await fetch(`/api/demandas/${demandaSeleccionada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'OBSERVADA',
          observaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al observar demanda');

      // Cambiar estado del proceso a BORRADOR
      await fetch(`/api/procesos/${demandaSeleccionada.proceso.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'BORRADOR' }),
      });

      toast({
        title: 'Demanda observada',
        description: 'Se ha notificado al abogado',
      });

      setDialogObservar(false);
      setObservaciones('');
      setDemandaSeleccionada(null);
      cargarDemandas();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo observar la demanda',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async (demanda: Demanda) => {
    if (!confirm('¿Está seguro de rechazar esta demanda?')) return;

    setProcesando(true);
    try {
      await fetch(`/api/demandas/${demanda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'RECHAZADA' }),
      });

      toast({
        title: 'Demanda rechazada',
        description: `NUREJ: ${demanda.proceso.nurej}`,
      });

      cargarDemandas();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la demanda',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  const DemandaCard = ({ demanda }: { demanda: Demanda }) => {
    const actor = demanda.proceso.partes.find(p => p.tipo === 'ACTOR');
    const demandado = demanda.proceso.partes.find(p => p.tipo === 'DEMANDADO');

    return (
      <Card key={demanda.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{demanda.proceso.nurej}</CardTitle>
              <CardDescription>{demanda.proceso.materia}</CardDescription>
            </div>
            <Badge variant="secondary">{demanda.estado}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Actor:</span> {actor?.nombres} {actor?.apellidos}
              </div>
              <div>
                <span className="font-semibold">Demandado:</span> {demandado?.nombres} {demandado?.apellidos}
              </div>
              <div>
                <span className="font-semibold">Abogado:</span> {actor?.abogado?.nombres} (Reg. {actor?.abogado?.registroAbogado})
              </div>
              <div>
                <span className="font-semibold">Valor:</span> Bs. {demanda.valor?.toLocaleString('es-BO')}
              </div>
            </div>

            <div className="text-sm">
              <span className="font-semibold">Objeto:</span>
              <p className="text-muted-foreground mt-1 line-clamp-2">{demanda.objetoDemanda}</p>
            </div>

            <div className="text-xs text-muted-foreground">
              Presentada: {new Date(demanda.createdAt).toLocaleDateString('es-BO')}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/secretario/demandas/${demanda.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" /> Ver
              </Button>
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAdmitir(demanda)}
                disabled={procesando}
              >
                <Check className="h-4 w-4 mr-1" /> Admitir
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-orange-600"
                onClick={() => {
                  setDemandaSeleccionada(demanda);
                  setDialogObservar(true);
                }}
                disabled={procesando}
              >
                <AlertCircle className="h-4 w-4 mr-1" /> Observar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRechazar(demanda)}
                disabled={procesando}
              >
                <X className="h-4 w-4 mr-1" /> Rechazar
              </Button>
            </div>
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
        <h1 className="text-3xl font-bold mb-2">Demandas Nuevas</h1>
        <p className="text-muted-foreground">
          Revise y valide las demandas presentadas
        </p>
      </div>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Pendientes ({demandas.filter(d => d.estado === 'PRESENTADA').length})
          </TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4 mt-6">
          {demandas.filter(d => d.estado === 'PRESENTADA').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay demandas pendientes</p>
              </CardContent>
            </Card>
          ) : (
            demandas
              .filter(d => d.estado === 'PRESENTADA')
              .map(demanda => <DemandaCard key={demanda.id} demanda={demanda} />)
          )}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4 mt-6">
          {demandas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay demandas</p>
              </CardContent>
            </Card>
          ) : (
            demandas.map(demanda => <DemandaCard key={demanda.id} demanda={demanda} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Observaciones */}
      <Dialog open={dialogObservar} onOpenChange={setDialogObservar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observar Demanda</DialogTitle>
            <DialogDescription>
              Ingrese las observaciones que deben ser subsanadas (Art. 113)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="observaciones">Observaciones*</Label>
              <Textarea
                id="observaciones"
                placeholder="Detalle los requisitos faltantes o incorrectos..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="min-h-[150px] mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                El abogado tendrá 3 días hábiles para subsanar
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogObservar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleObservar} disabled={procesando || !observaciones.trim()}>
              {procesando ? 'Procesando...' : 'Observar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
