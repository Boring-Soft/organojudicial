'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, AlertCircle, FileText, ArrowLeft, Download, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Demanda {
  id: string;
  estado: string;
  createdAt: string;
  designacionJuez: string;
  objetoDemanda: string;
  hechos: string;
  derecho: string;
  petitorio: string;
  valor: number;
  ofrecimientoPrueba: string;
  anexos: Array<{
    nombre: string;
    url: string;
    tipo: string;
    size: number;
  }>;
  proceso: {
    id: string;
    nurej: string;
    materia: string;
    juzgado: string;
    partes: Array<{
      tipo: string;
      nombres: string;
      apellidos: string;
      ci: string;
      edad: number;
      estadoCivil: string;
      profesion: string;
      domicilioReal: string;
      domicilioProcesal: string;
      abogado?: {
        nombres: string;
        apellidos: string;
        registroAbogado: string;
      };
    }>;
    juez: {
      nombres: string;
      apellidos: string;
    };
  };
}

export default function DemandaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogObservar, setDialogObservar] = useState(false);
  const [dialogDecreto, setDialogDecreto] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [decretoGenerado, setDecretoGenerado] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDemanda();
  }, [params.id]);

  const cargarDemanda = async () => {
    try {
      const response = await fetch(`/api/demandas/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDemanda(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la demanda',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdmitir = async () => {
    if (!demanda) return;

    setProcesando(true);
    try {
      // Generar decreto de admisión
      const responseDecreto = await fetch(`/api/demandas/${demanda.id}/decreto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoDecreto: 'ADMISION' }),
      });

      if (!responseDecreto.ok) throw new Error('Error al generar decreto');

      const { decreto } = await responseDecreto.json();
      setDecretoGenerado(decreto);
      setDialogDecreto(true);

      // Cambiar estado de demanda
      await fetch(`/api/demandas/${demanda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'ADMITIDA',
          fechaAdmision: new Date().toISOString(),
        }),
      });

      // Cambiar estado del proceso
      await fetch(`/api/procesos/${demanda.proceso.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ADMITIDO' }),
      });

      toast({
        title: 'Demanda admitida',
        description: `NUREJ: ${demanda.proceso.nurej}`,
      });
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
    if (!demanda || !observaciones.trim()) return;

    setProcesando(true);
    try {
      // Generar decreto de observación
      const responseDecreto = await fetch(`/api/demandas/${demanda.id}/decreto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDecreto: 'OBSERVACION',
          observaciones,
        }),
      });

      if (!responseDecreto.ok) throw new Error('Error al generar decreto');

      const { decreto } = await responseDecreto.json();
      setDecretoGenerado(decreto);

      // Cambiar estado
      await fetch(`/api/demandas/${demanda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'OBSERVADA',
          observaciones,
        }),
      });

      await fetch(`/api/procesos/${demanda.proceso.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'BORRADOR' }),
      });

      setDialogObservar(false);
      setDialogDecreto(true);

      toast({
        title: 'Demanda observada',
        description: 'Se ha generado el decreto de observación',
      });
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

  const descargarDecreto = () => {
    const blob = new Blob([decretoGenerado], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decreto-${demanda?.proceso.nurej}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!demanda) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Demanda no encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actor = demanda.proceso.partes.find(p => p.tipo === 'ACTOR');
  const demandado = demanda.proceso.partes.find(p => p.tipo === 'DEMANDADO');

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{demanda.proceso.nurej}</h1>
            <p className="text-muted-foreground">
              {demanda.proceso.materia} - {demanda.proceso.juzgado}
            </p>
          </div>
          <Badge variant="secondary">{demanda.estado}</Badge>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Juez Designado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {demanda.proceso.juez.nombres} {demanda.proceso.juez.apellidos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Bs. {demanda.valor.toLocaleString('es-BO')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fecha Presentación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {new Date(demanda.createdAt).toLocaleDateString('es-BO')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="partes">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="partes">Partes</TabsTrigger>
          <TabsTrigger value="fundamentos">Fundamentos</TabsTrigger>
          <TabsTrigger value="anexos">Anexos ({demanda.anexos.length})</TabsTrigger>
          <TabsTrigger value="validacion">Validación</TabsTrigger>
        </TabsList>

        {/* Partes */}
        <TabsContent value="partes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Parte Actora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nombre completo</Label>
                  <p className="font-semibold">{actor?.nombres} {actor?.apellidos}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CI</Label>
                    <p>{actor?.ci}</p>
                  </div>
                  <div>
                    <Label>Edad</Label>
                    <p>{actor?.edad} años</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estado Civil</Label>
                    <p>{actor?.estadoCivil}</p>
                  </div>
                  <div>
                    <Label>Profesión</Label>
                    <p>{actor?.profesion}</p>
                  </div>
                </div>
                <div>
                  <Label>Domicilio Real</Label>
                  <p className="text-sm">{actor?.domicilioReal}</p>
                </div>
                <div>
                  <Label>Domicilio Procesal</Label>
                  <p className="text-sm">{actor?.domicilioProcesal}</p>
                </div>
                {actor?.abogado && (
                  <>
                    <Separator />
                    <div>
                      <Label>Abogado</Label>
                      <p className="font-semibold">
                        {actor.abogado.nombres} {actor.abogado.apellidos}
                      </p>
                      <p className="text-sm">Reg. {actor.abogado.registroAbogado}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parte Demandada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nombre completo</Label>
                  <p className="font-semibold">{demandado?.nombres} {demandado?.apellidos}</p>
                </div>
                <div>
                  <Label>CI</Label>
                  <p>{demandado?.ci}</p>
                </div>
                <div>
                  <Label>Domicilio (para citación)</Label>
                  <p className="text-sm">{demandado?.domicilioReal}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fundamentos */}
        <TabsContent value="fundamentos">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Objeto de la Demanda</h3>
                <p className="bg-muted p-4 rounded-lg">{demanda.objetoDemanda}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Hechos</h3>
                <p className="bg-muted p-4 rounded-lg whitespace-pre-wrap">{demanda.hechos}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Fundamentos de Derecho</h3>
                <p className="bg-muted p-4 rounded-lg whitespace-pre-wrap">{demanda.derecho}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Petitorio</h3>
                <p className="bg-muted p-4 rounded-lg whitespace-pre-wrap">{demanda.petitorio}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Ofrecimiento de Prueba</h3>
                <p className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {demanda.ofrecimientoPrueba}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anexos */}
        <TabsContent value="anexos">
          <Card>
            <CardContent className="pt-6">
              {demanda.anexos.length > 0 ? (
                <div className="space-y-3">
                  {demanda.anexos.map((anexo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-semibold">{anexo.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {(anexo.size / 1024 / 1024).toFixed(2)} MB
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay anexos adjuntos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validación */}
        <TabsContent value="validacion">
          <Card>
            <CardHeader>
              <CardTitle>Checklist Art. 110 CPC</CardTitle>
              <CardDescription>
                Verificación de requisitos formales de la demanda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Designación del juez o tribunal', ok: !!demanda.designacionJuez },
                  { label: 'Datos completos del demandante', ok: !!actor },
                  { label: 'Datos completos del demandado', ok: !!demandado },
                  { label: 'Objeto de la demanda', ok: !!demanda.objetoDemanda },
                  { label: 'Exposición de hechos', ok: !!demanda.hechos },
                  { label: 'Fundamentos de derecho', ok: !!demanda.derecho },
                  { label: 'Petitorio', ok: !!demanda.petitorio },
                  { label: 'Valor de la demanda', ok: demanda.valor > 0 },
                  { label: 'Ofrecimiento de prueba', ok: !!demanda.ofrecimientoPrueba },
                  { label: 'Firma de abogado', ok: !!actor?.abogado },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 border rounded"
                  >
                    {item.ok ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={item.ok ? '' : 'text-muted-foreground'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      {demanda.estado === 'PRESENTADA' && (
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleAdmitir}
            disabled={procesando}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" /> Admitir Demanda
          </Button>
          <Button
            onClick={() => setDialogObservar(true)}
            disabled={procesando}
            variant="outline"
            className="text-orange-600"
          >
            <AlertCircle className="h-4 w-4 mr-2" /> Observar
          </Button>
        </div>
      )}

      {/* Dialog de Observaciones */}
      <Dialog open={dialogObservar} onOpenChange={setDialogObservar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observar Demanda</DialogTitle>
            <DialogDescription>
              Ingrese las observaciones (Art. 113 CPC)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="observaciones">Observaciones*</Label>
            <Textarea
              id="observaciones"
              placeholder="Detalle los requisitos faltantes o incorrectos..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="min-h-[150px] mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogObservar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleObservar}
              disabled={procesando || !observaciones.trim()}
            >
              {procesando ? 'Generando decreto...' : 'Generar Decreto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Decreto Generado */}
      <Dialog open={dialogDecreto} onOpenChange={setDialogDecreto}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Decreto Generado</DialogTitle>
            <DialogDescription>
              El decreto ha sido generado y guardado en el expediente
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
              {decretoGenerado}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={descargarDecreto}>
              <Download className="h-4 w-4 mr-2" /> Descargar
            </Button>
            <Button onClick={() => {
              setDialogDecreto(false);
              router.push('/secretario/demandas');
            }}>
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
