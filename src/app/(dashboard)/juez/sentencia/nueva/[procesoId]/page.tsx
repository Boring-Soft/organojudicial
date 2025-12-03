'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  juzgado: string;
  objetoDemanda: string;
  partes: Array<{
    tipo: string;
    nombres: string;
    apellidos: string;
    ci: string;
  }>;
}

interface Sentencia {
  id: string;
  encabezamiento: string;
  narrativa: string;
  motiva: string;
  resolutiva: string;
  estadoNotificacion: string;
}

export default function EditorSentenciaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [sentencia, setSentencia] = useState<Sentencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [firmando, setFirmando] = useState(false);
  const [dialogFirma, setDialogFirma] = useState(false);
  const [dialogPreview, setDialogPreview] = useState(false);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);

  const [formulario, setFormulario] = useState({
    encabezamiento: '',
    narrativa: '',
    motiva: '',
    resolutiva: '',
  });

  const [resultados, setResultados] = useState({
    resultadoActor: '',
    resultadoDemandado: '',
  });

  useEffect(() => {
    cargarProceso();
  }, [params.procesoId]);

  // Auto-guardado cada 30 segundos si hay cambios
  useEffect(() => {
    if (!cambiosSinGuardar || !sentencia) return;

    const timer = setTimeout(() => {
      handleGuardarBorrador(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [cambiosSinGuardar, formulario]);

  const cargarProceso = async () => {
    try {
      const response = await fetch(`/api/procesos/${params.procesoId}`);
      if (!response.ok) throw new Error('Error al cargar proceso');

      const data = await response.json();
      setProceso(data);

      // Verificar si ya existe sentencia
      const sentenciaResponse = await fetch(`/api/sentencias?procesoId=${params.procesoId}`);
      if (sentenciaResponse.ok) {
        const sentencias = await sentenciaResponse.json();
        if (sentencias.length > 0) {
          const sent = sentencias[0];
          setSentencia(sent);
          setFormulario({
            encabezamiento: sent.encabezamiento,
            narrativa: sent.narrativa,
            motiva: sent.motiva,
            resolutiva: sent.resolutiva,
          });
        } else {
          // Crear nueva sentencia borrador
          await crearNuevaSentencia();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar el proceso',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const crearNuevaSentencia = async () => {
    try {
      const response = await fetch('/api/sentencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procesoId: params.procesoId }),
      });

      if (!response.ok) throw new Error('Error al crear sentencia');

      const data = await response.json();
      setSentencia(data);

      // Cargar plantilla
      cargarPlantilla();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear sentencia',
        variant: 'destructive',
      });
    }
  };

  const cargarPlantilla = () => {
    if (!proceso) return;

    const fechaActual = new Date().toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    setFormulario({
      encabezamiento: `En la ciudad de La Paz, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-BO', { month: 'long' })} del año ${new Date().getFullYear()}, el ${proceso.juzgado}, en el proceso ordinario signado con el NUREJ ${proceso.nurej}, ha pronunciado la siguiente sentencia:

VISTOS: Los antecedentes del proceso, la demanda presentada, la contestación de la demanda, las pruebas aportadas y los alegatos de las partes;

CONSIDERANDO: Las normas procesales y sustantivas aplicables al caso;`,

      narrativa: `1. ANTECEDENTES

[Describir cronológicamente los hechos del proceso desde la presentación de la demanda hasta el cierre de la etapa probatoria]

2. DEMANDA

Objeto: ${proceso.objetoDemanda}

[Resumir las pretensiones del actor, los hechos alegados y el fundamento de derecho]

3. CONTESTACIÓN

[Resumir la contestación del demandado, las excepciones interpuestas si hubiere, y su posición procesal]

4. PRUEBAS

[Enumerar las pruebas presentadas por ambas partes]`,

      motiva: `1. FUNDAMENTOS DE DERECHO

[Citar las normas legales aplicables al caso]

2. VALORACIÓN DE LA PRUEBA

[Analizar las pruebas conforme a las reglas de la sana crítica]

3. ANÁLISIS JURÍDICO

[Aplicar el derecho a los hechos probados]

4. CONCLUSIÓN

[Fundamentar la decisión tomada]`,

      resolutiva: `Por los fundamentos expuestos, el ${proceso.juzgado}, administrando justicia en nombre del Pueblo Boliviano:

RESUELVE:

PRIMERO.- [Decisión principal sobre el fondo del asunto]

SEGUNDO.- [Consecuencias accesorias: costas, costos, intereses, etc.]

TERCERO.- Sin costas ni costos por [fundamentar si corresponde]

Regístrese, notifíquese y cúmplase.`,
    });

    setCambiosSinGuardar(true);
  };

  const handleGuardarBorrador = async (esAutoGuardado = false) => {
    if (!sentencia) return;

    setGuardando(true);
    try {
      const response = await fetch(`/api/sentencias/${sentencia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });

      if (!response.ok) throw new Error('Error al guardar');

      if (!esAutoGuardado) {
        toast({
          title: 'Borrador guardado',
          description: 'Los cambios han sido guardados exitosamente',
        });
      }

      setCambiosSinGuardar(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar borrador',
        variant: 'destructive',
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleFirmar = async () => {
    if (!resultados.resultadoActor || !resultados.resultadoDemandado) {
      toast({
        title: 'Error',
        description: 'Debe indicar el resultado para ambas partes',
        variant: 'destructive',
      });
      return;
    }

    // Guardar antes de firmar
    await handleGuardarBorrador();

    setFirmando(true);
    try {
      const response = await fetch(`/api/sentencias/${sentencia?.id}/firmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultados),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al firmar sentencia');
      }

      const data = await response.json();

      toast({
        title: 'Sentencia firmada',
        description: 'La sentencia ha sido firmada y notificada exitosamente',
      });

      setDialogFirma(false);
      router.push(`/proceso/${params.procesoId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al firmar sentencia',
        variant: 'destructive',
      });
    } finally {
      setFirmando(false);
    }
  };

  const handleChange = (campo: string, valor: string) => {
    setFormulario({ ...formulario, [campo]: valor });
    setCambiosSinGuardar(true);
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Proceso no encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  const demandante = proceso.partes.find(p => p.tipo === 'ACTOR');
  const demandado = proceso.partes.find(p => p.tipo === 'DEMANDADO');

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Editor de Sentencia</h1>
            <p className="text-muted-foreground">NUREJ: {proceso.nurej}</p>
          </div>
          <div className="flex gap-2">
            {cambiosSinGuardar && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Cambios sin guardar
              </Badge>
            )}
            {sentencia?.estadoNotificacion === 'NOTIFICADA' && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Firmada y Notificada
              </Badge>
            )}
          </div>
        </div>
      </div>

      {sentencia?.estadoNotificacion === 'NOTIFICADA' ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sentencia Publicada</AlertTitle>
          <AlertDescription>
            Esta sentencia ya fue firmada y notificada. No es posible realizar cambios.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Estructura de la Sentencia (Art. 213 CPC)</CardTitle>
                <CardDescription>
                  Complete cada sección siguiendo la estructura legal establecida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="encabezamiento">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="encabezamiento">I. Encabezamiento</TabsTrigger>
                    <TabsTrigger value="narrativa">II. Narrativa</TabsTrigger>
                    <TabsTrigger value="motiva">III. Motiva</TabsTrigger>
                    <TabsTrigger value="resolutiva">IV. Resolutiva</TabsTrigger>
                  </TabsList>

                  <TabsContent value="encabezamiento" className="mt-4">
                    <div className="space-y-2">
                      <Label>I. Encabezamiento (Parte Expositiva)</Label>
                      <Textarea
                        value={formulario.encabezamiento}
                        onChange={(e) => handleChange('encabezamiento', e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Introduzca el encabezamiento de la sentencia..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluir: Lugar, fecha, identificación del tribunal, número de proceso, vistos y considerandos.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="narrativa" className="mt-4">
                    <div className="space-y-2">
                      <Label>II. Narrativa (Parte Expositiva)</Label>
                      <Textarea
                        value={formulario.narrativa}
                        onChange={(e) => handleChange('narrativa', e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Describa los hechos del proceso..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluir: Antecedentes, demanda, contestación, pruebas presentadas.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="motiva" className="mt-4">
                    <div className="space-y-2">
                      <Label>III. Motiva (Parte Considerativa)</Label>
                      <Textarea
                        value={formulario.motiva}
                        onChange={(e) => handleChange('motiva', e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Fundamente jurídicamente la decisión..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluir: Fundamentos de derecho, valoración de pruebas, análisis jurídico, conclusión.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="resolutiva" className="mt-4">
                    <div className="space-y-2">
                      <Label>IV. Resolutiva (Parte Dispositiva)</Label>
                      <Textarea
                        value={formulario.resolutiva}
                        onChange={(e) => handleChange('resolutiva', e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Redacte la parte resolutiva..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluir: Decisión principal, consecuencias accesorias (costas, costos), cierre.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={() => setDialogPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" /> Vista Previa
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleGuardarBorrador()}
                      disabled={guardando}
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Borrador
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setDialogFirma(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Firmar y Publicar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Información del Proceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Materia</p>
                  <p className="text-sm">{proceso.materia}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Objeto</p>
                  <p className="text-sm">{proceso.objetoDemanda}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Demandante</p>
                  <p className="text-sm font-medium">
                    {demandante?.nombres} {demandante?.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground">CI: {demandante?.ci}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Demandado</p>
                  <p className="text-sm font-medium">
                    {demandado?.nombres} {demandado?.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground">CI: {demandado?.ci}</p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/proceso/${proceso.id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Expediente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog Firmar */}
      <Dialog open={dialogFirma} onOpenChange={setDialogFirma}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmar y Publicar Sentencia</DialogTitle>
            <DialogDescription>
              Esta acción es IRREVOCABLE. La sentencia será firmada digitalmente y notificada a todas las partes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Una vez firmada, la sentencia no podrá ser modificada. Asegúrese de haber revisado todo el contenido.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Resultado para el Demandante*</Label>
              <Select
                value={resultados.resultadoActor}
                onValueChange={(value) =>
                  setResultados({ ...resultados, resultadoActor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAVORABLE">✅ FAVORABLE (Ganó)</SelectItem>
                  <SelectItem value="DESFAVORABLE">❌ DESFAVORABLE (Perdió)</SelectItem>
                  <SelectItem value="PARCIAL">⚖️ PARCIAL (Ganó parcialmente)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resultado para el Demandado*</Label>
              <Select
                value={resultados.resultadoDemandado}
                onValueChange={(value) =>
                  setResultados({ ...resultados, resultadoDemandado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAVORABLE">✅ FAVORABLE (Ganó)</SelectItem>
                  <SelectItem value="DESFAVORABLE">❌ DESFAVORABLE (Perdió)</SelectItem>
                  <SelectItem value="PARCIAL">⚖️ PARCIAL (Resultado parcial)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Proceso automático:</strong> Al firmar se generará:
                <ul className="list-disc list-inside mt-2 ml-2">
                  <li>Firma digital y hash SHA-256</li>
                  <li>Plazo de apelación de 15 días hábiles</li>
                  <li>Notificaciones diferenciadas (ciudadanos y abogados)</li>
                  <li>Cambio de estado del proceso a SENTENCIADO</li>
                </ul>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFirma(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFirmar} disabled={firmando}>
              {firmando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Firmando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Firma
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Preview */}
      <Dialog open={dialogPreview} onOpenChange={setDialogPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de la Sentencia</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4 font-serif">
            <div className="text-center font-bold">
              <p>{proceso.juzgado.toUpperCase()}</p>
              <p className="mt-2">SENTENCIA</p>
            </div>

            <div>
              <p><strong>NUREJ:</strong> {proceso.nurej}</p>
              <p><strong>MATERIA:</strong> {proceso.materia}</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">I. ENCABEZAMIENTO</h3>
              <p className="whitespace-pre-wrap">{formulario.encabezamiento}</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">II. NARRATIVA</h3>
              <p className="whitespace-pre-wrap">{formulario.narrativa}</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">III. MOTIVA</h3>
              <p className="whitespace-pre-wrap">{formulario.motiva}</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">IV. RESOLUTIVA</h3>
              <p className="whitespace-pre-wrap">{formulario.resolutiva}</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogPreview(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
