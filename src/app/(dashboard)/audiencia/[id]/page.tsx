'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  FileText,
  Clock,
  Play,
  Square,
  AlertCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Audiencia {
  id: string;
  tipo: string;
  fecha: string;
  duracion: number;
  estado: string;
  sala: string;
  grabacionUrl: string | null;
  audioUrl: string | null;
  transcripcion: string | null;
  asistentes: Array<{
    usuarioId: string;
    nombre: string;
    tipo: string;
    rol: string;
    horaEntrada: string;
    horaSalida: string | null;
  }>;
  proceso: {
    id: string;
    nurej: string;
    materia: string;
    objetoDemanda: string;
    partes: Array<{
      tipo: string;
      nombres: string;
      apellidos: string;
      ci: string;
    }>;
  };
  juez: {
    id: string;
    nombres: string;
    apellidos: string;
  };
}

export default function AudienciaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [audiencia, setAudiencia] = useState<Audiencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [dialogFinalizar, setDialogFinalizar] = useState(false);
  const [transcripcionEditada, setTranscripcionEditada] = useState('');
  const [generandoTranscripcion, setGenerandoTranscripcion] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApi = useRef<any>(null);

  useEffect(() => {
    cargarAudiencia();

    return () => {
      // Limpiar Jitsi al desmontar
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
      }
    };
  }, [params.id]);

  const cargarAudiencia = async () => {
    try {
      const response = await fetch(`/api/audiencias/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAudiencia(data);
        setTranscripcionEditada(data.transcripcion || '');
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la audiencia',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar la audiencia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`/api/audiencias/${params.id}/check-in`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Asistencia registrada',
          description: 'Su entrada a la audiencia ha sido registrada',
        });
        cargarAudiencia();
      }
    } catch (error) {
      console.error('Error al registrar check-in:', error);
    }
  };

  const handleIniciarAudiencia = async () => {
    setIniciando(true);
    try {
      const response = await fetch(`/api/audiencias/${params.id}/iniciar`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al iniciar audiencia');
      }

      toast({
        title: 'Audiencia iniciada',
        description: 'La audiencia ha comenzado',
      });

      cargarAudiencia();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar la audiencia',
        variant: 'destructive',
      });
    } finally {
      setIniciando(false);
    }
  };

  const handleFinalizarAudiencia = async () => {
    setFinalizando(true);
    try {
      // En producción, aquí se subiría la grabación a Supabase Storage
      const response = await fetch(`/api/audiencias/${params.id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grabacionUrl: null, // TODO: implementar upload
          audioUrl: null, // TODO: implementar upload
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al finalizar audiencia');
      }

      toast({
        title: 'Audiencia finalizada',
        description: 'La audiencia ha sido finalizada exitosamente',
      });

      setDialogFinalizar(false);
      cargarAudiencia();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo finalizar la audiencia',
        variant: 'destructive',
      });
    } finally {
      setFinalizando(false);
    }
  };

  const handleGenerarTranscripcion = async () => {
    setGenerandoTranscripcion(true);
    try {
      const response = await fetch(`/api/audiencias/${params.id}/transcripcion`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar transcripción');
      }

      const data = await response.json();
      setTranscripcionEditada(data.transcripcion);

      toast({
        title: 'Transcripción generada',
        description: data.nota || 'La transcripción se ha generado exitosamente',
      });

      cargarAudiencia();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo generar la transcripción',
        variant: 'destructive',
      });
    } finally {
      setGenerandoTranscripcion(false);
    }
  };

  const handleGuardarTranscripcion = async () => {
    try {
      const response = await fetch(`/api/audiencias/${params.id}/transcripcion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcripcion: transcripcionEditada }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar transcripción');
      }

      toast({
        title: 'Transcripción guardada',
        description: 'Los cambios han sido guardados exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la transcripción',
        variant: 'destructive',
      });
    }
  };

  const cargarJitsi = () => {
    if (!audiencia || !jitsiContainerRef.current) return;

    // Cargar script de Jitsi si no está cargado
    const existingScript = document.getElementById('jitsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'jitsi-script';
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);
    } else {
      initJitsi();
    }
  };

  const initJitsi = () => {
    if (!audiencia || !jitsiContainerRef.current || jitsiApi.current) return;

    const domain = 'meet.jit.si';
    const roomName = audiencia.sala.split('/').pop() || '';

    const options = {
      roomName: roomName,
      width: '100%',
      height: '600px',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'invite',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
        ],
      },
      userInfo: {
        displayName: 'Usuario', // En producción, usar el nombre real del usuario
      },
    };

    // @ts-ignore
    jitsiApi.current = new window.JitsiMeetExternalAPI(domain, options);

    // Registrar eventos
    jitsiApi.current.addEventListener('videoConferenceJoined', () => {
      handleCheckIn();
    });

    jitsiApi.current.addEventListener('participantLeft', () => {
      console.log('Participante salió');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!audiencia) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Audiencia no encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fechaAudiencia = new Date(audiencia.fecha);

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Audiencia {audiencia.tipo.charAt(0) + audiencia.tipo.slice(1).toLowerCase()}
            </h1>
            <p className="text-muted-foreground">NUREJ: {audiencia.proceso.nurej}</p>
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
            <Clock className="h-3 w-3 mr-1" />
            {audiencia.estado}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sala Virtual */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sala Virtual</CardTitle>
              <CardDescription>
                {fechaAudiencia.toLocaleString('es-BO')} - {audiencia.duracion} minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {audiencia.estado === 'PROGRAMADA' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Audiencia Programada</AlertTitle>
                    <AlertDescription>
                      La audiencia aún no ha comenzado. El juez debe iniciarla para que pueda
                      acceder a la sala virtual.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleIniciarAudiencia} disabled={iniciando} className="w-full">
                    {iniciando ? 'Iniciando...' : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> Iniciar Audiencia
                      </>
                    )}
                  </Button>
                </div>
              )}

              {audiencia.estado === 'EN_CURSO' && (
                <div className="space-y-4">
                  <div ref={jitsiContainerRef} className="w-full h-[600px] bg-black rounded"></div>

                  {!jitsiApi.current && (
                    <Button onClick={cargarJitsi} className="w-full">
                      <Video className="h-4 w-4 mr-2" /> Unirse a la Audiencia
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => setDialogFinalizar(true)}
                      className="flex-1"
                    >
                      <Square className="h-4 w-4 mr-2" /> Finalizar Audiencia
                    </Button>
                  </div>
                </div>
              )}

              {audiencia.estado === 'FINALIZADA' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Audiencia Finalizada</AlertTitle>
                  <AlertDescription>
                    Esta audiencia ha finalizado. Puede revisar la transcripción y el acta en las
                    pestañas correspondientes.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Transcripción y Acta */}
          {audiencia.estado === 'FINALIZADA' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Post-Audiencia</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transcripcion">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="transcripcion">Transcripción</TabsTrigger>
                    <TabsTrigger value="acta">Acta</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transcripcion" className="space-y-4 mt-4">
                    {!audiencia.transcripcion ? (
                      <div className="text-center py-6">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No hay transcripción disponible
                        </p>
                        <Button
                          onClick={handleGenerarTranscripcion}
                          disabled={generandoTranscripcion || !audiencia.audioUrl}
                        >
                          {generandoTranscripcion
                            ? 'Generando...'
                            : 'Generar Transcripción con Whisper'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          value={transcripcionEditada}
                          onChange={(e) => setTranscripcionEditada(e.target.value)}
                          className="min-h-[400px] font-mono text-sm"
                        />
                        <Button onClick={handleGuardarTranscripcion}>
                          Guardar Correcciones
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="acta" className="mt-4">
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Generación de acta no implementada</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información del Proceso */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Información del Proceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Materia</p>
                <p>{audiencia.proceso.materia}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Objeto</p>
                <p className="text-sm">{audiencia.proceso.objetoDemanda}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Juez</p>
                <p>
                  {audiencia.juez.nombres} {audiencia.juez.apellidos}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  Partes del Proceso
                </p>
                {audiencia.proceso.partes.map((parte, idx) => (
                  <div key={idx} className="text-sm mb-2">
                    <Badge variant={parte.tipo === 'ACTOR' ? 'default' : 'secondary'}>
                      {parte.tipo}
                    </Badge>
                    <p className="mt-1">
                      {parte.nombres} {parte.apellidos}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Asistentes ({audiencia.asistentes.length})
                </p>
                {audiencia.asistentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin asistentes registrados</p>
                ) : (
                  <div className="space-y-2">
                    {audiencia.asistentes.map((asistente, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium">{asistente.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {asistente.rol} - {asistente.tipo}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Finalizar */}
      <Dialog open={dialogFinalizar} onOpenChange={setDialogFinalizar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Audiencia</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea finalizar esta audiencia? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Al finalizar, se guardará la grabación (si está disponible) y se podrá generar la
              transcripción automática con Whisper.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFinalizar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleFinalizarAudiencia} disabled={finalizando}>
              {finalizando ? 'Finalizando...' : 'Finalizar Audiencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
