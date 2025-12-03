'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Download, FileText, AlertCircle, Scale, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Sentencia {
  id: string;
  encabezamiento: string;
  narrativa: string;
  motiva: string;
  resolutiva: string;
  fechaEmision: string;
  resultadoActor: string;
  resultadoDemandado: string;
  estadoNotificacion: string;
  hashDocumento: string;
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
    }>;
  };
  juez: {
    nombres: string;
    apellidos: string;
  };
}

export default function SentenciaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [sentencia, setSentencia] = useState<Sentencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolUsuario, setRolUsuario] = useState<string>('');
  const [esActor, setEsActor] = useState(false);

  useEffect(() => {
    cargarSentencia();
  }, [params.id]);

  const cargarSentencia = async () => {
    try {
      const response = await fetch(`/api/sentencias/${params.id}`);
      if (!response.ok) throw new Error('Sentencia no encontrada');

      const data = await response.json();
      setSentencia(data);

      // TODO: Obtener rol del usuario actual
      // Por ahora asumimos que viene en el contexto
      setRolUsuario('CIUDADANO'); // Cambiar por usuario.rol real

      // Determinar si el usuario actual es el actor
      // TODO: Comparar con usuario actual
      setEsActor(true); // Cambiar por lógica real
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar la sentencia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generarResumenCiudadano = () => {
    if (!sentencia) return '';

    const resultado = esActor ? sentencia.resultadoActor : sentencia.resultadoDemandado;

    let emoji = '⚖️';
    let tituloResultado = '';
    let explicacion = '';

    if (resultado === 'FAVORABLE') {
      emoji = '✅';
      tituloResultado = esActor ? '¡GANÓ EL CASO!' : 'PERDIÓ EL CASO';
      explicacion = esActor
        ? 'El juez ha dado la razón a sus pretensiones. La demanda fue aceptada.'
        : 'El juez ha dado la razón al demandante. Debe cumplir con lo ordenado.';
    } else if (resultado === 'DESFAVORABLE') {
      emoji = '❌';
      tituloResultado = esActor ? 'PERDIÓ EL CASO' : '¡GANÓ EL CASO!';
      explicacion = esActor
        ? 'El juez no aceptó su demanda. Sus pretensiones fueron rechazadas.'
        : 'El juez rechazó la demanda. No está obligado a cumplir lo solicitado.';
    } else {
      emoji = '⚖️';
      tituloResultado = 'RESULTADO PARCIAL';
      explicacion = esActor
        ? 'El juez aceptó algunas de sus pretensiones pero rechazó otras.'
        : 'El juez aceptó parcialmente la demanda. Debe cumplir con parte de lo solicitado.';
    }

    return { emoji, tituloResultado, explicacion };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sentencia) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Sentencia no encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  const demandante = sentencia.proceso.partes.find(p => p.tipo === 'ACTOR');
  const demandado = sentencia.proceso.partes.find(p => p.tipo === 'DEMANDADO');
  const resumenCiudadano = generarResumenCiudadano();

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sentencia</h1>
            <p className="text-muted-foreground">NUREJ: {sentencia.proceso.nurej}</p>
          </div>
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Notificada
          </Badge>
        </div>
      </div>

      {/* Resumen para Ciudadanos */}
      {rolUsuario === 'CIUDADANO' && (
        <Alert className="mb-6 border-2 border-primary">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{resumenCiudadano.emoji}</div>
            <div className="flex-1">
              <AlertTitle className="text-xl mb-2">{resumenCiudadano.tituloResultado}</AlertTitle>
              <AlertDescription className="text-base">
                <p className="mb-3">{resumenCiudadano.explicacion}</p>
                <div className="bg-muted p-3 rounded">
                  <p className="font-semibold mb-2">IMPORTANTE:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Tiene derecho a apelar esta sentencia en un plazo de 15 días hábiles</li>
                    <li>Consulte con su abogado sobre las posibilidades de apelación</li>
                    <li>Si no apela, la sentencia quedará firme y deberá cumplirse</li>
                  </ul>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido de la Sentencia */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sentencia Completa</CardTitle>
              <CardDescription>
                Fecha de emisión:{' '}
                {new Date(sentencia.fechaEmision).toLocaleDateString('es-BO')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resumen">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="completa">Sentencia Completa</TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Proceso</h3>
                    <p className="text-sm">{sentencia.proceso.nurej}</p>
                    <p className="text-sm text-muted-foreground">{sentencia.proceso.materia}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Partes</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            sentencia.resultadoActor === 'FAVORABLE'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            sentencia.resultadoActor === 'FAVORABLE'
                              ? 'bg-green-500'
                              : ''
                          }
                        >
                          {sentencia.resultadoActor}
                        </Badge>
                        <span className="text-sm">
                          <strong>Demandante:</strong> {demandante?.nombres}{' '}
                          {demandante?.apellidos}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            sentencia.resultadoDemandado === 'FAVORABLE'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            sentencia.resultadoDemandado === 'FAVORABLE'
                              ? 'bg-green-500'
                              : ''
                          }
                        >
                          {sentencia.resultadoDemandado}
                        </Badge>
                        <span className="text-sm">
                          <strong>Demandado:</strong> {demandado?.nombres} {demandado?.apellidos}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-semibold mb-2">Parte Resolutiva (Decisión)</h3>
                    <p className="text-sm whitespace-pre-wrap">{sentencia.resolutiva}</p>
                  </div>

                  {rolUsuario !== 'CIUDADANO' && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                      <p className="text-sm text-blue-900">
                        <strong>Plazo de apelación:</strong> 15 días hábiles desde la notificación
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completa" className="mt-4">
                  <div className="space-y-6 font-serif text-sm bg-white p-6 rounded border">
                    <div className="text-center font-bold">
                      <p>{sentencia.proceso.juzgado.toUpperCase()}</p>
                      <p className="mt-2">SENTENCIA</p>
                    </div>

                    <div>
                      <p>
                        <strong>NUREJ:</strong> {sentencia.proceso.nurej}
                      </p>
                      <p>
                        <strong>MATERIA:</strong> {sentencia.proceso.materia}
                      </p>
                      <p>
                        <strong>FECHA:</strong>{' '}
                        {new Date(sentencia.fechaEmision).toLocaleDateString('es-BO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">I. ENCABEZAMIENTO</h3>
                      <p className="whitespace-pre-wrap">{sentencia.encabezamiento}</p>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">II. NARRATIVA (Parte Expositiva)</h3>
                      <p className="whitespace-pre-wrap">{sentencia.narrativa}</p>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">III. MOTIVA (Parte Considerativa)</h3>
                      <p className="whitespace-pre-wrap">{sentencia.motiva}</p>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">IV. RESOLUTIVA (Parte Dispositiva)</h3>
                      <p className="whitespace-pre-wrap">{sentencia.resolutiva}</p>
                    </div>

                    <div className="text-center pt-6 border-t">
                      <p>_________________________</p>
                      <p className="font-bold">
                        {sentencia.juez.nombres} {sentencia.juez.apellidos}
                      </p>
                      <p>JUEZ A CARGO</p>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      <p>Hash SHA-256: {sentencia.hashDocumento}</p>
                      <p className="mt-1">
                        Documento con firma digital. Validez legal conforme a normativa vigente.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" /> Descargar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/proceso/${sentencia.proceso.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" /> Ver Expediente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información Adicional */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Información Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Juzgado</p>
                <p className="text-sm">{sentencia.proceso.juzgado}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Juez</p>
                <p className="text-sm">
                  {sentencia.juez.nombres} {sentencia.juez.apellidos}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Fecha de Notificación</p>
                <p className="text-sm">
                  {new Date(sentencia.fechaEmision).toLocaleDateString('es-BO')}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Recursos Disponibles</p>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p className="text-xs font-semibold text-yellow-900">
                    Recurso de Apelación
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Plazo: 15 días hábiles desde la notificación
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Consulte con su abogado para evaluar la viabilidad
                  </p>
                </div>
              </div>

              {rolUsuario === 'CIUDADANO' && (
                <div className="pt-4 border-t">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">¿Tiene dudas?</AlertTitle>
                    <AlertDescription className="text-xs">
                      Comuníquese con su abogado para aclarar cualquier aspecto de la sentencia.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
