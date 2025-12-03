/**
 * Configuración de Supabase Realtime para Chat
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface MensajeChat {
  id: string;
  procesoId: string;
  remitenteId: string;
  destinatarioId: string;
  contenido: string;
  archivoUrl?: string;
  archivoNombre?: string;
  leido: boolean;
  createdAt: string;
  remitente?: {
    id: string;
    nombres: string;
    apellidos: string;
    rol: string;
  };
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
}

/**
 * Suscribirse a mensajes nuevos de un proceso
 */
export function subscribeToMessages(
  procesoId: string,
  onNewMessage: (message: MensajeChat) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`mensajes:${procesoId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `procesoId=eq.${procesoId}`,
      },
      (payload) => {
        onNewMessage(payload.new as MensajeChat);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Suscribirse a actualizaciones de mensajes (lectura)
 */
export function subscribeToMessageUpdates(
  procesoId: string,
  onMessageUpdate: (message: MensajeChat) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`mensajes-updates:${procesoId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'mensajes',
        filter: `procesoId=eq.${procesoId}`,
      },
      (payload) => {
        onMessageUpdate(payload.new as MensajeChat);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Broadcast de indicador de escritura (typing)
 */
export function broadcastTyping(
  channel: RealtimeChannel,
  userId: string,
  userName: string,
  isTyping: boolean
) {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: {
      userId,
      userName,
      isTyping,
    },
  });
}

/**
 * Suscribirse a indicadores de escritura
 */
export function subscribeToTyping(
  procesoId: string,
  onTyping: (data: TypingIndicator) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`typing:${procesoId}`)
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      onTyping(payload as TypingIndicator);
    })
    .subscribe();

  return channel;
}

/**
 * Broadcast de estado de presencia (online/offline)
 */
export function trackPresence(
  channel: RealtimeChannel,
  userId: string,
  userName: string
) {
  channel.track({
    user_id: userId,
    user_name: userName,
    online_at: new Date().toISOString(),
  });
}

/**
 * Suscribirse a cambios de presencia
 */
export function subscribeToPresence(
  procesoId: string,
  onPresenceChange: (presences: any) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`presence:${procesoId}`, {
      config: {
        presence: {
          key: procesoId,
        },
      },
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceChange(state);
    })
    .subscribe();

  return channel;
}

/**
 * Desuscribirse de un canal
 */
export async function unsubscribeChannel(channel: RealtimeChannel) {
  await channel.unsubscribe();
}
