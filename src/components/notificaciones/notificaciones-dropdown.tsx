'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';

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

export function NotificacionesDropdown() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
    setupRealtime();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data.notificaciones || []);
        setNoLeidas(data.noLeidas || 0);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const setupRealtime = () => {
    const supabase = createClient();

    // Suscribirse a nuevas notificaciones
    const channel = supabase
      .channel('notificaciones')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
        },
        (payload) => {
          const nuevaNotificacion = payload.new as Notificacion;
          setNotificaciones((prev) => [nuevaNotificacion, ...prev.slice(0, 9)]);
          setNoLeidas((prev) => prev + 1);

          // Reproducir sonido de notificación
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silenciar error si no hay sonido
      });
    } catch (error) {
      // Silenciar error
    }
  };

  const marcarComoLeida = async (notificacionId: string, url?: string | null) => {
    try {
      await fetch(`/api/notificaciones/${notificacionId}`, {
        method: 'PATCH',
      });

      // Actualizar estado local
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));

      // Navegar si hay URL
      if (url) {
        setOpen(false);
        router.push(url);
      }
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await fetch('/api/notificaciones', {
        method: 'PATCH',
      });

      // Actualizar estado local
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarNotificacion = async (notificacionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await fetch(`/api/notificaciones/${notificacionId}`, {
        method: 'DELETE',
      });

      // Actualizar estado local
      const notificacion = notificaciones.find((n) => n.id === notificacionId);
      setNotificaciones((prev) => prev.filter((n) => n.id !== notificacionId));

      if (notificacion && !notificacion.leida) {
        setNoLeidas((prev) => Math.max(0, prev - 1));
      }
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {noLeidas > 99 ? '99+' : noLeidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-[600px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {noLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLeidas}
              disabled={loading}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        {notificaciones.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <>
            {notificaciones.map((notificacion) => (
              <DropdownMenuItem
                key={notificacion.id}
                className={`p-3 cursor-pointer ${
                  !notificacion.leida ? 'bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => marcarComoLeida(notificacion.id, notificacion.url)}
              >
                <div className="flex gap-3 w-full">
                  {/* Icono */}
                  <div className="text-2xl flex-shrink-0">
                    {getIconoPorTipo(notificacion.tipo)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm leading-tight">
                        {notificacion.titulo}
                      </p>
                      {!notificacion.leida && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {notificacion.mensaje}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notificacion.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>

                  {/* Botón eliminar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={(e) => eliminarNotificacion(notificacion.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Ver todas */}
            <DropdownMenuItem
              className="text-center text-sm text-primary cursor-pointer p-3"
              onClick={() => {
                setOpen(false);
                router.push('/notificaciones');
              }}
            >
              Ver todas las notificaciones
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
