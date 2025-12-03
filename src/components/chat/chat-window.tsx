'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, X, Loader2, Circle, Search, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  subscribeToMessages,
  subscribeToTyping,
  subscribeToPresence,
  broadcastTyping,
  trackPresence,
  unsubscribeChannel,
  type MensajeChat,
  type TypingIndicator,
} from '@/lib/chat/supabase-realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ChatWindowProps {
  procesoId: string;
  destinatarioId: string;
  destinatarioNombre: string;
  currentUserId: string;
  currentUserName: string;
}

export function ChatWindow({
  procesoId,
  destinatarioId,
  destinatarioNombre,
  currentUserId,
  currentUserName,
}: ChatWindowProps) {
  const { toast } = useToast();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [typing, setTyping] = useState<TypingIndicator | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMasMensajes, setHayMasMensajes] = useState(true);
  const [presenciaOnline, setPresenciaOnline] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    cargarMensajes();
    setupRealtime();

    return () => {
      cleanup();
    };
  }, [procesoId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const cargarMensajes = async () => {
    try {
      const response = await fetch(`/api/mensajes?procesoId=${procesoId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMensajes(data.reverse()); // Invertir para mostrar más recientes al final
        setHayMasMensajes(data.length === 50);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMasMensajes = async () => {
    if (cargandoMas || !hayMasMensajes) return;

    setCargandoMas(true);
    try {
      const offset = mensajes.length;
      const response = await fetch(
        `/api/mensajes?procesoId=${procesoId}&limit=50&offset=${offset}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setMensajes((prev) => [...data.reverse(), ...prev]);
          setHayMasMensajes(data.length === 50);
        } else {
          setHayMasMensajes(false);
        }
      }
    } catch (error) {
      console.error('Error al cargar más mensajes:', error);
    } finally {
      setCargandoMas(false);
    }
  };

  const setupRealtime = () => {
    // Suscribirse a nuevos mensajes
    const messageChannel = subscribeToMessages(procesoId, (newMessage) => {
      setMensajes((prev) => [...prev, newMessage]);

      // Reproducir sonido si el mensaje es del otro usuario
      if (newMessage.remitenteId !== currentUserId) {
        playNotificationSound();
      }
    });
    messageChannelRef.current = messageChannel;

    // Suscribirse a indicadores de escritura
    const typingChannel = subscribeToTyping(procesoId, (data) => {
      if (data.userId !== currentUserId) {
        setTyping(data.isTyping ? data : null);

        // Limpiar después de 3 segundos
        if (data.isTyping) {
          setTimeout(() => setTyping(null), 3000);
        }
      }
    });
    typingChannelRef.current = typingChannel;

    // Suscribirse a presencia (online/offline)
    const presenceChannel = subscribeToPresence(procesoId, (presences) => {
      // Verificar si el destinatario está online
      const destinatarioPresente = Object.values(presences).some((presence: any) => {
        const users = Array.isArray(presence) ? presence : [presence];
        return users.some((u: any) => u.user_id === destinatarioId);
      });
      setPresenciaOnline(destinatarioPresente);
    });
    presenceChannelRef.current = presenceChannel;

    // Trackear nuestra presencia
    trackPresence(presenceChannel, currentUserId, currentUserName);
  };

  const cleanup = async () => {
    if (messageChannelRef.current) {
      await unsubscribeChannel(messageChannelRef.current);
    }
    if (typingChannelRef.current) {
      await unsubscribeChannel(typingChannelRef.current);
    }
    if (presenceChannelRef.current) {
      await unsubscribeChannel(presenceChannelRef.current);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    // Sonido simple de notificación
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Silenciar error si no hay sonido
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (typingChannelRef.current) {
      broadcastTyping(typingChannelRef.current, currentUserId, currentUserName, isTyping);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoMensaje(e.target.value);

    // Notificar que está escribiendo
    handleTyping(true);

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Después de 2 segundos sin escribir, marcar como no escribiendo
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tamaño (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'El archivo no debe superar los 50MB',
          variant: 'destructive',
        });
        return;
      }

      setArchivo(file);
    }
  };

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() && !archivo) return;

    setEnviando(true);
    try {
      let archivoUrl = null;
      let archivoNombre = null;

      // TODO: Subir archivo a Supabase Storage si existe
      if (archivo) {
        archivoNombre = archivo.name;
        // archivoUrl = await uploadFile(archivo);
      }

      const response = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId,
          destinatarioId,
          contenido: nuevoMensaje.trim(),
          archivoUrl,
          archivoNombre,
        }),
      });

      if (!response.ok) throw new Error('Error al enviar mensaje');

      setNuevoMensaje('');
      setArchivo(null);
      handleTyping(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  // Filtrar mensajes según búsqueda
  const mensajesFiltrados = busqueda.trim()
    ? mensajes.filter((m) =>
        m.contenido.toLowerCase().includes(busqueda.toLowerCase())
      )
    : mensajes;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{destinatarioNombre}</CardTitle>
            <Badge variant={presenciaOnline ? 'default' : 'secondary'} className="gap-1">
              <Circle
                className={`h-2 w-2 ${
                  presenciaOnline
                    ? 'fill-green-500 text-green-500'
                    : 'fill-gray-400 text-gray-400'
                }`}
              />
              {presenciaOnline ? 'En línea' : 'Desconectado'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {mostrarBusqueda && (
          <div className="mt-2">
            <Input
              placeholder="Buscar en mensajes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-8"
            />
            {busqueda && (
              <p className="text-xs text-muted-foreground mt-1">
                {mensajesFiltrados.length} resultado(s) encontrado(s)
              </p>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* Botón cargar más mensajes */}
          {hayMasMensajes && !busqueda && mensajes.length >= 50 && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cargarMasMensajes}
                disabled={cargandoMas}
              >
                {cargandoMas ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Cargar mensajes anteriores
              </Button>
            </div>
          )}

          {mensajesFiltrados.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">
                {busqueda
                  ? 'No se encontraron mensajes con ese texto'
                  : 'No hay mensajes aún. Inicia la conversación.'}
              </p>
            </div>
          ) : (
            <>
              {mensajesFiltrados.map((mensaje) => {
                const esMio = mensaje.remitenteId === currentUserId;
                const fecha = new Date(mensaje.createdAt);

                return (
                  <div
                    key={mensaje.id}
                    className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        esMio
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {mensaje.contenido}
                      </p>
                      {mensaje.archivoUrl && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <a
                            href={mensaje.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline flex items-center gap-1"
                          >
                            <Paperclip className="h-3 w-3" />
                            {mensaje.archivoNombre}
                          </a>
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(fecha, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Indicador de escritura */}
        {typing && (
          <div className="px-4 py-2 text-sm text-muted-foreground italic">
            {typing.userName} está escribiendo...
          </div>
        )}

        {/* Archivo seleccionado */}
        {archivo && (
          <div className="px-4 py-2 bg-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">{archivo.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setArchivo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input de mensaje */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <label htmlFor="file-upload">
              <Button variant="outline" size="icon" asChild>
                <span className="cursor-pointer">
                  <Paperclip className="h-4 w-4" />
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <Input
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={enviando}
              className="flex-1"
            />

            <Button
              onClick={handleEnviar}
              disabled={enviando || (!nuevoMensaje.trim() && !archivo)}
            >
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
