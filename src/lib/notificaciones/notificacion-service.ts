import prisma from '@/lib/prisma';

export type TipoNotificacion =
  | 'DEMANDA_NUEVA'
  | 'DEMANDA_ADMITIDA'
  | 'DEMANDA_OBSERVADA'
  | 'DEMANDA_RECHAZADA'
  | 'CITACION_NUEVA'
  | 'CITACION_EXITOSA'
  | 'CONTESTACION_PRESENTADA'
  | 'EXCEPCION_PRESENTADA'
  | 'RECONVENCION_PRESENTADA'
  | 'ALLANAMIENTO'
  | 'AUDIENCIA_PROGRAMADA'
  | 'AUDIENCIA_PROXIMA'
  | 'SENTENCIA_PUBLICADA'
  | 'PLAZO_VENCIENDO'
  | 'PLAZO_VENCIDO'
  | 'MENSAJE_NUEVO'
  | 'DOCUMENTO_SUBIDO'
  | 'VINCULACION_SOLICITADA'
  | 'VINCULACION_ACEPTADA'
  | 'VINCULACION_RECHAZADA'
  | 'OTRO';

interface NotificacionData {
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  procesoId?: string;
  url?: string;
}

/**
 * Servicio para crear y gestionar notificaciones
 */
export class NotificacionService {
  /**
   * Crea una notificación para un usuario
   */
  static async crear(data: NotificacionData) {
    try {
      const notificacion = await prisma.notificacion.create({
        data: {
          usuarioId: data.usuarioId,
          tipo: data.tipo,
          titulo: data.titulo,
          mensaje: data.mensaje,
          procesoId: data.procesoId || null,
          url: data.url || null,
          leida: false,
        },
      });

      return notificacion;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  /**
   * Crea notificaciones para múltiples usuarios
   */
  static async crearMultiple(usuarios: string[], data: Omit<NotificacionData, 'usuarioId'>) {
    try {
      const notificaciones = await prisma.notificacion.createMany({
        data: usuarios.map((usuarioId) => ({
          usuarioId,
          tipo: data.tipo,
          titulo: data.titulo,
          mensaje: data.mensaje,
          procesoId: data.procesoId || null,
          url: data.url || null,
          leida: false,
        })),
      });

      return notificaciones;
    } catch (error) {
      console.error('Error al crear notificaciones múltiples:', error);
      throw error;
    }
  }

  /**
   * Notifica sobre una nueva demanda
   */
  static async notificarDemandaNueva(procesoId: string, juezId: string, secretarioId?: string) {
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: { demanda: true },
    });

    if (!proceso) return;

    const usuarios = secretarioId ? [juezId, secretarioId] : [juezId];

    await this.crearMultiple(usuarios, {
      tipo: 'DEMANDA_NUEVA',
      titulo: '📋 Nueva demanda presentada',
      mensaje: `Se ha presentado una nueva demanda: ${proceso.nurej} - ${proceso.materia}`,
      procesoId,
      url: `/secretario/demandas/${proceso.demanda?.id}`,
    });
  }

  /**
   * Notifica sobre demanda admitida
   */
  static async notificarDemandaAdmitida(procesoId: string, abogadoId: string, ciudadanoUserId?: string) {
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
    });

    if (!proceso) return;

    const usuarios = ciudadanoUserId ? [abogadoId, ciudadanoUserId] : [abogadoId];

    await this.crearMultiple(usuarios, {
      tipo: 'DEMANDA_ADMITIDA',
      titulo: '✅ Demanda admitida',
      mensaje: `La demanda ${proceso.nurej} ha sido admitida y se procederá con la citación`,
      procesoId,
      url: `/proceso/${procesoId}`,
    });
  }

  /**
   * Notifica sobre demanda observada
   */
  static async notificarDemandaObservada(procesoId: string, abogadoId: string, observaciones: string) {
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
    });

    if (!proceso) return;

    await this.crear({
      usuarioId: abogadoId,
      tipo: 'DEMANDA_OBSERVADA',
      titulo: '⚠️ Demanda observada',
      mensaje: `La demanda ${proceso.nurej} tiene observaciones: ${observaciones.substring(0, 100)}...`,
      procesoId,
      url: `/abogado/demanda/nueva?procesoId=${procesoId}`,
    });
  }

  /**
   * Notifica sobre nueva citación
   */
  static async notificarCitacion(citacionId: string, parteId: string) {
    const citacion = await prisma.citacion.findUnique({
      where: { id: citacionId },
      include: {
        proceso: true,
        parte: true,
      },
    });

    if (!citacion) return;

    // Si la parte tiene usuarioId (ciudadano)
    if (citacion.parte.usuarioId) {
      await this.crear({
        usuarioId: citacion.parte.usuarioId,
        tipo: 'CITACION_NUEVA',
        titulo: '📨 Nueva citación',
        mensaje: `Ha sido citado en el proceso ${citacion.proceso.nurej}. Tiene 30 días para contestar.`,
        procesoId: citacion.procesoId,
        url: `/proceso/${citacion.procesoId}`,
      });
    }

    // Si la parte tiene abogado
    if (citacion.parte.abogadoId) {
      await this.crear({
        usuarioId: citacion.parte.abogadoId,
        tipo: 'CITACION_NUEVA',
        titulo: '📨 Citación a su cliente',
        mensaje: `Su cliente ha sido citado en el proceso ${citacion.proceso.nurej}. Debe presentar contestación en 30 días.`,
        procesoId: citacion.procesoId,
        url: `/abogado/contestacion/${citacion.procesoId}`,
      });
    }
  }

  /**
   * Notifica sobre contestación presentada
   */
  static async notificarContestacion(contestacionId: string, procesoId: string) {
    const contestacion = await prisma.contestacion.findUnique({
      where: { id: contestacionId },
    });

    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
        juez: true,
      },
    });

    if (!contestacion || !proceso) return;

    // Notificar al actor (contraparte)
    const parteActora = proceso.partes.find((p) => p.tipo === 'ACTOR');
    if (parteActora) {
      const usuarios: string[] = [];
      if (parteActora.usuarioId) usuarios.push(parteActora.usuarioId);
      if (parteActora.abogadoId) usuarios.push(parteActora.abogadoId);

      await this.crearMultiple(usuarios, {
        tipo: 'CONTESTACION_PRESENTADA',
        titulo: '📝 Contestación presentada',
        mensaje: `Se ha presentado ${contestacion.tipo.toLowerCase()} en el proceso ${proceso.nurej}`,
        procesoId,
        url: `/proceso/${procesoId}`,
      });
    }

    // Notificar al juez
    if (proceso.juez) {
      await this.crear({
        usuarioId: proceso.juez.id,
        tipo: 'CONTESTACION_PRESENTADA',
        titulo: '📝 Nueva contestación',
        mensaje: `Se ha presentado ${contestacion.tipo.toLowerCase()} en el proceso ${proceso.nurej}`,
        procesoId,
        url: `/proceso/${procesoId}`,
      });
    }
  }

  /**
   * Notifica sobre audiencia programada
   */
  static async notificarAudiencia(audienciaId: string) {
    const audiencia = await prisma.audiencia.findUnique({
      where: { id: audienciaId },
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
    });

    if (!audiencia) return;

    const fecha = new Date(audiencia.fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Notificar a todas las partes
    const usuarios: string[] = [];

    audiencia.proceso.partes.forEach((parte) => {
      if (parte.usuarioId) usuarios.push(parte.usuarioId);
      if (parte.abogadoId) usuarios.push(parte.abogadoId);
    });

    // Agregar juez
    if (audiencia.proceso.juez) {
      usuarios.push(audiencia.proceso.juez.id);
    }

    await this.crearMultiple(usuarios, {
      tipo: 'AUDIENCIA_PROGRAMADA',
      titulo: '📅 Audiencia programada',
      mensaje: `Se ha programado audiencia ${audiencia.tipo.toLowerCase()} para el ${fecha}`,
      procesoId: audiencia.procesoId,
      url: `/audiencia/${audienciaId}`,
    });
  }

  /**
   * Notifica sobre sentencia publicada
   */
  static async notificarSentencia(sentenciaId: string, procesoId: string) {
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
      },
    });

    if (!proceso) return;

    // Notificar a todas las partes
    const usuarios: string[] = [];

    proceso.partes.forEach((parte) => {
      if (parte.usuarioId) usuarios.push(parte.usuarioId);
      if (parte.abogadoId) usuarios.push(parte.abogadoId);
    });

    await this.crearMultiple(usuarios, {
      tipo: 'SENTENCIA_PUBLICADA',
      titulo: '⚖️ Sentencia publicada',
      mensaje: `Se ha publicado la sentencia del proceso ${proceso.nurej}. Tiene 15 días para apelar.`,
      procesoId,
      url: `/sentencia/${sentenciaId}`,
    });
  }

  /**
   * Notifica sobre plazo próximo a vencer
   */
  static async notificarPlazoVenciendo(plazoId: string, usuarioId: string) {
    const plazo = await prisma.plazo.findUnique({
      where: { id: plazoId },
      include: {
        proceso: true,
      },
    });

    if (!plazo) return;

    const diasRestantes = Math.ceil(
      (new Date(plazo.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    await this.crear({
      usuarioId,
      tipo: 'PLAZO_VENCIENDO',
      titulo: '⏰ Plazo próximo a vencer',
      mensaje: `El plazo ${plazo.tipo.toLowerCase()} del proceso ${plazo.proceso.nurej} vence en ${diasRestantes} día(s)`,
      procesoId: plazo.procesoId,
      url: `/proceso/${plazo.procesoId}`,
    });
  }

  /**
   * Notifica sobre nuevo mensaje
   */
  static async notificarMensaje(mensajeId: string, destinatarioId: string) {
    const mensaje = await prisma.mensaje.findUnique({
      where: { id: mensajeId },
      include: {
        remitente: true,
        proceso: true,
      },
    });

    if (!mensaje) return;

    await this.crear({
      usuarioId: destinatarioId,
      tipo: 'MENSAJE_NUEVO',
      titulo: '💬 Nuevo mensaje',
      mensaje: `${mensaje.remitente.nombres} ${mensaje.remitente.apellidos}: ${mensaje.contenido.substring(0, 50)}...`,
      procesoId: mensaje.procesoId,
      url: `/chat/${mensaje.procesoId}`,
    });
  }

  /**
   * Notifica sobre documento subido
   */
  static async notificarDocumento(documentoId: string, procesoId: string, excluyeUsuarioId: string) {
    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
      include: {
        subidoPor: true,
      },
    });

    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
        juez: true,
      },
    });

    if (!documento || !proceso) return;

    // Notificar a todas las partes excepto quien lo subió
    const usuarios: string[] = [];

    proceso.partes.forEach((parte) => {
      if (parte.usuarioId && parte.usuarioId !== excluyeUsuarioId) {
        usuarios.push(parte.usuarioId);
      }
      if (parte.abogadoId && parte.abogadoId !== excluyeUsuarioId) {
        usuarios.push(parte.abogadoId);
      }
    });

    // Agregar juez si no es quien lo subió
    if (proceso.juez && proceso.juez.id !== excluyeUsuarioId) {
      usuarios.push(proceso.juez.id);
    }

    if (usuarios.length > 0) {
      await this.crearMultiple(usuarios, {
        tipo: 'DOCUMENTO_SUBIDO',
        titulo: '📎 Nuevo documento',
        mensaje: `${documento.subidoPor.nombres} ${documento.subidoPor.apellidos} ha subido: ${documento.nombre}`,
        procesoId,
        url: `/documentos/${procesoId}`,
      });
    }
  }
}
