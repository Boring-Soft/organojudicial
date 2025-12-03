'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  procesoId: string | null;
  url: string | null;
  createdAt: string;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'noLeidas' | 'leidas'>('todas');

  useEffect(() => {
    cargarNotificaciones();
  }, [filtro]);

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      let url = '/api/notificaciones?limit=100';
      if (filtro === 'noLeidas') {
        url += '&leidas=false';
      } else if (filtro === 'leidas') {
        url += '&leidas=true';
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data.notificaciones || []);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (notificacionId: string, url?: string | null) => {
    try {
      await fetch(`/api/notificaciones/${notificacionId}`, {
        method: 'PATCH',
      });

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n))
      );

      if (url) {
        router.push(url);
      }
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    if (procesando) return;

    setProcesando(true);
    try {
      await fetch('/api/notificaciones', {
        method: 'PATCH',
      });

      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error al marcar todas:', error);
    } finally {
      setProcesando(false);
    }
  };

  const eliminarNotificacion = async (notificacionId: string) => {
    try {
      await fetch(`/api/notificaciones/${notificacionId}`, {
        method: 'DELETE',
      });

      setNotificaciones((prev) => prev.filter((n) => n.id !== notificacionId));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const getIconoPorTipo = (tipo: string) => {
    const iconos: Record<string, string> = {
      DEMANDA_NUEVA: '📋',
      DEMANDA_ADMITIDA: '✅',
      DEMANDA_OBSERVADA: '⚠️',
      DEMANDA_RECHAZADA: '❌',
      CITACION_NUEVA: '📨',
      CITACION_EXITOSA: '✉️',
      CONTESTACION_PRESENTADA: '📝',
      EXCEPCION_PRESENTADA: '🛡️',
      RECONVENCION_PRESENTADA: '⚖️',
      ALLANAMIENTO: '🤝',
      AUDIENCIA_PROGRAMADA: '📅',
      AUDIENCIA_PROXIMA: '⏰',
      SENTENCIA_PUBLICADA: '⚖️',
      PLAZO_VENCIENDO: '⏰',
      PLAZO_VENCIDO: '🔴',
      MENSAJE_NUEVO: '💬',
      DOCUMENTO_SUBIDO: '📎',
      VINCULACION_SOLICITADA: '🤝',
      VINCULACION_ACEPTADA: '✅',
      VINCULACION_RECHAZADA: '❌',
    };

    return iconos[tipo] || '🔔';
  };

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida);

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
            <p className="text-muted-foreground">
              Mantente al día con todas tus actualizaciones
            </p>
          </div>

          {notificacionesNoLeidas.length > 0 && (
            <Button
              onClick={marcarTodasComoLeidas}
              disabled={procesando}
              variant="outline"
            >
              {procesando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={filtro} onValueChange={(v: any) => setFiltro(v)}>
            <TabsList>
              <TabsTrigger value="todas">
                Todas ({notificaciones.length})
              </TabsTrigger>
              <TabsTrigger value="noLeidas">
                No leídas ({notificacionesNoLeidas.length})
              </TabsTrigger>
              <TabsTrigger value="leidas">Leídas</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No hay notificaciones</p>
              <p className="text-sm">
                {filtro === 'noLeidas'
                  ? 'No tienes notificaciones sin leer'
                  : filtro === 'leidas'
                  ? 'No tienes notificaciones leídas'
                  : 'Cuando recibas notificaciones aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificaciones.map((notificacion) => (
                <Card
                  key={notificacion.id}
                  className={`cursor-pointer transition-colors ${
                    !notificacion.leida
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-200'
                      : ''
                  }`}
                  onClick={() =>
                    marcarComoLeida(notificacion.id, notificacion.url)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Icono */}
                      <div className="text-3xl flex-shrink-0">
                        {getIconoPorTipo(notificacion.tipo)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {notificacion.titulo}
                            </h3>
                            {!notificacion.leida && (
                              <Badge variant="default" className="text-xs">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(
                              new Date(notificacion.createdAt),
                              {
                                addSuffix: true,
                                locale: es,
                              }
                            )}
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {notificacion.mensaje}
                        </p>

                        <div className="flex items-center gap-2">
                          {notificacion.url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                marcarComoLeida(
                                  notificacion.id,
                                  notificacion.url
                                );
                              }}
                            >
                              Ver detalles
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarNotificacion(notificacion.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
