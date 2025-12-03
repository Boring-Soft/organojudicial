/**
 * Sistema de gestión automática de plazos procesales
 * Crea, monitorea y envía alertas sobre plazos
 */

import prisma from '@/lib/prisma';
import { sumarDiasHabiles, diasHabilesRestantes, determinarUrgencia } from '@/lib/utils/dias-habiles';

/**
 * Configuración de plazos según el Código Procesal Civil boliviano
 */
const CONFIGURACION_PLAZOS = {
  CONTESTACION: {
    dias: 30,
    descripcion: 'Plazo para contestar la demanda',
    articulo: 'Art. 330',
  },
  OBSERVACION_DEMANDA: {
    dias: 3,
    descripcion: 'Plazo para subsanar observaciones',
    articulo: 'Art. 113',
  },
  AUDIENCIA_PRELIMINAR: {
    dias: 5,
    descripcion: 'Convocatoria a audiencia preliminar',
    articulo: 'Art. 365',
  },
  SENTENCIA: {
    dias: 15,
    descripcion: 'Plazo para emitir sentencia',
    articulo: 'Art. 213',
  },
  APELACION: {
    dias: 15,
    descripcion: 'Plazo para apelar sentencia',
    articulo: 'Art. 274',
  },
  EXCEPCIONES: {
    dias: 15,
    descripcion: 'Plazo para traslado de excepciones',
    articulo: 'Art. 348',
  },
  RECONVENCION: {
    dias: 30,
    descripcion: 'Plazo para contestar reconvención',
    articulo: 'Art. 342',
  },
  CITACION: {
    dias: 5,
    descripcion: 'Plazo para realizar citación',
    articulo: 'Art. 103',
  },
};

export type TipoPlazo = keyof typeof CONFIGURACION_PLAZOS;

/**
 * Crea un plazo automático para un proceso
 */
export async function crearPlazoAutomatico(
  procesoId: string,
  tipoPlazo: TipoPlazo,
  fechaInicio?: Date
): Promise<void> {
  const config = CONFIGURACION_PLAZOS[tipoPlazo];

  if (!config) {
    throw new Error(`Tipo de plazo no válido: ${tipoPlazo}`);
  }

  const inicio = fechaInicio || new Date();
  const vencimiento = sumarDiasHabiles(inicio, config.dias);

  await prisma.plazo.create({
    data: {
      procesoId,
      tipo: tipoPlazo,
      descripcion: config.descripcion,
      articulo: config.articulo,
      fechaInicio: inicio,
      fechaVencimiento: vencimiento,
      diasPlazo: config.dias,
      estado: 'ACTIVO',
    },
  });

  // Crear notificaciones para las partes
  await crearNotificacionesPlazo(procesoId, tipoPlazo, vencimiento);
}

/**
 * Crea notificaciones para las partes relacionadas con un plazo
 */
async function crearNotificacionesPlazo(
  procesoId: string,
  tipoPlazo: TipoPlazo,
  fechaVencimiento: Date
): Promise<void> {
  const proceso = await prisma.proceso.findUnique({
    where: { id: procesoId },
    include: {
      partes: {
        include: {
          abogado: true,
        },
      },
    },
  });

  if (!proceso) return;

  const config = CONFIGURACION_PLAZOS[tipoPlazo];

  // Determinar quiénes deben ser notificados según el tipo de plazo
  let destinatarios: string[] = [];

  switch (tipoPlazo) {
    case 'CONTESTACION':
    case 'RECONVENCION':
      // Notificar al demandado o su abogado
      const demandado = proceso.partes.find((p) => p.tipo === 'DEMANDADO');
      if (demandado?.abogadoId) {
        destinatarios.push(demandado.abogadoId);
      }
      break;

    case 'SENTENCIA':
      // Notificar al juez
      destinatarios.push(proceso.juezId);
      break;

    case 'CITACION':
      // Notificar al secretario
      // Los secretarios se obtienen por juzgado, aquí simplificamos
      break;

    default:
      // Notificar a todos los abogados
      proceso.partes.forEach((parte) => {
        if (parte.abogadoId) {
          destinatarios.push(parte.abogadoId);
        }
      });
  }

  // Crear notificaciones
  for (const usuarioId of destinatarios) {
    await prisma.notificacionInterna.create({
      data: {
        usuarioId,
        procesoId,
        tipo: 'PLAZO',
        titulo: `Nuevo plazo: ${config.descripcion}`,
        mensaje: `Se ha creado un plazo de ${config.dias} días hábiles que vence el ${fechaVencimiento.toLocaleDateString('es-BO')}. ${config.articulo}`,
        accionUrl: `/proceso/${procesoId}`,
        accionTexto: 'Ver proceso',
      },
    });
  }
}

/**
 * Verifica plazos próximos a vencer y envía alertas
 * Esta función debe ejecutarse diariamente mediante un cron job
 */
export async function verificarPlazosYEnviarAlertas(): Promise<void> {
  // Obtener todos los plazos activos
  const plazosActivos = await prisma.plazo.findMany({
    where: {
      estado: 'ACTIVO',
    },
    include: {
      proceso: {
        include: {
          partes: {
            include: {
              abogado: true,
            },
          },
        },
      },
    },
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (const plazo of plazosActivos) {
    const diasRestantes = diasHabilesRestantes(plazo.fechaVencimiento);

    // Verificar si el plazo ya venció
    if (diasRestantes < 0) {
      await prisma.plazo.update({
        where: { id: plazo.id },
        data: { estado: 'VENCIDO' },
      });

      // Notificar vencimiento
      await enviarNotificacionVencimiento(plazo);
      continue;
    }

    // Enviar alertas según días restantes
    const alertasEnviadas = plazo.alertasEnviadas as Array<{
      fecha: string;
      tipo: string;
    }>;

    const yaEnvioAlerta5Dias = alertasEnviadas.some((a) => a.tipo === '5_DIAS');
    const yaEnvioAlerta3Dias = alertasEnviadas.some((a) => a.tipo === '3_DIAS');
    const yaEnvioAlerta1Dia = alertasEnviadas.some((a) => a.tipo === '1_DIA');

    if (diasRestantes <= 5 && !yaEnvioAlerta5Dias) {
      await enviarAlertaPlazo(plazo, '5_DIAS');
    } else if (diasRestantes <= 3 && !yaEnvioAlerta3Dias) {
      await enviarAlertaPlazo(plazo, '3_DIAS');
    } else if (diasRestantes <= 1 && !yaEnvioAlerta1Dia) {
      await enviarAlertaPlazo(plazo, '1_DIA');
    }
  }
}

/**
 * Envía alerta de plazo próximo a vencer
 */
async function enviarAlertaPlazo(
  plazo: any,
  tipoAlerta: string
): Promise<void> {
  const diasRestantes = diasHabilesRestantes(plazo.fechaVencimiento);
  const urgencia = determinarUrgencia(diasRestantes);

  // Obtener destinatarios según el tipo de plazo
  const proceso = plazo.proceso;
  const destinatarios: string[] = [];

  // Notificar a los abogados de las partes
  proceso.partes.forEach((parte: any) => {
    if (parte.abogadoId) {
      destinatarios.push(parte.abogadoId);
    }
  });

  // Notificar al juez si es un plazo de sentencia
  if (plazo.tipo === 'SENTENCIA') {
    destinatarios.push(proceso.juezId);
  }

  // Crear notificaciones
  for (const usuarioId of destinatarios) {
    await prisma.notificacionInterna.create({
      data: {
        usuarioId,
        procesoId: plazo.procesoId,
        tipo: 'ALERTA_PLAZO',
        titulo: `⚠️ Plazo próximo a vencer: ${plazo.descripcion}`,
        mensaje: `El plazo "${plazo.descripcion}" vence en ${diasRestantes} día(s) hábil(es). NUREJ: ${proceso.nurej}`,
        accionUrl: `/proceso/${plazo.procesoId}`,
        accionTexto: 'Ver proceso',
      },
    });
  }

  // Registrar que se envió la alerta
  const alertasEnviadas = plazo.alertasEnviadas as any[];
  await prisma.plazo.update({
    where: { id: plazo.id },
    data: {
      alertasEnviadas: [
        ...alertasEnviadas,
        {
          fecha: new Date().toISOString(),
          tipo: tipoAlerta,
          destinatarios,
        },
      ],
    },
  });
}

/**
 * Envía notificación de vencimiento de plazo
 */
async function enviarNotificacionVencimiento(plazo: any): Promise<void> {
  const proceso = plazo.proceso;
  const destinatarios: string[] = [];

  // Notificar a los abogados de las partes
  proceso.partes.forEach((parte: any) => {
    if (parte.abogadoId) {
      destinatarios.push(parte.abogadoId);
    }
  });

  // Notificar al juez
  destinatarios.push(proceso.juezId);

  for (const usuarioId of destinatarios) {
    await prisma.notificacionInterna.create({
      data: {
        usuarioId,
        procesoId: plazo.procesoId,
        tipo: 'PLAZO_VENCIDO',
        titulo: `🔴 Plazo vencido: ${plazo.descripcion}`,
        mensaje: `El plazo "${plazo.descripcion}" ha vencido. NUREJ: ${proceso.nurej}`,
        accionUrl: `/proceso/${plazo.procesoId}`,
        accionTexto: 'Ver proceso',
      },
    });
  }
}

/**
 * Marca un plazo como cumplido
 */
export async function marcarPlazoComoCumplido(plazoId: string): Promise<void> {
  await prisma.plazo.update({
    where: { id: plazoId },
    data: { estado: 'CUMPLIDO' },
  });
}

/**
 * Obtiene plazos activos de un proceso
 */
export async function obtenerPlazosActivos(procesoId: string) {
  return await prisma.plazo.findMany({
    where: {
      procesoId,
      estado: 'ACTIVO',
    },
    orderBy: {
      fechaVencimiento: 'asc',
    },
  });
}

/**
 * Obtiene el próximo plazo crítico de un proceso
 */
export async function obtenerProximoPlazoCritico(procesoId: string) {
  const plazosActivos = await obtenerPlazosActivos(procesoId);

  if (plazosActivos.length === 0) {
    return null;
  }

  // Calcular días restantes para cada plazo
  const plazosConDias = plazosActivos.map((plazo) => ({
    ...plazo,
    diasRestantes: diasHabilesRestantes(plazo.fechaVencimiento),
    urgencia: determinarUrgencia(diasHabilesRestantes(plazo.fechaVencimiento)),
  }));

  // Ordenar por urgencia y días restantes
  plazosConDias.sort((a, b) => {
    if (a.urgencia !== b.urgencia) {
      const urgenciaOrder = { critico: 0, urgente: 1, normal: 2 };
      return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
    }
    return a.diasRestantes - b.diasRestantes;
  });

  return plazosConDias[0];
}
