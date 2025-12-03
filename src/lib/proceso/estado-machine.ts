/**
 * Máquina de estados para procesos judiciales
 * Gestiona las transiciones válidas entre estados y pre-condiciones
 */

import { EstadoProceso, RolUsuario } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Define las transiciones válidas entre estados
 */
const TRANSICIONES_VALIDAS: Record<EstadoProceso, EstadoProceso[]> = {
  BORRADOR: ['PRESENTADO'],
  PRESENTADO: ['ADMITIDO', 'BORRADOR'], // Puede volver a borrador si hay observaciones
  ADMITIDO: ['CITACION_PENDIENTE'],
  CITACION_PENDIENTE: ['CONTESTACION_PENDIENTE'],
  CONTESTACION_PENDIENTE: ['AUDIENCIA_PRELIMINAR'],
  AUDIENCIA_PRELIMINAR: ['AUDIENCIA_COMPLEMENTARIA', 'SENTENCIA_PENDIENTE'],
  AUDIENCIA_COMPLEMENTARIA: ['SENTENCIA_PENDIENTE'],
  SENTENCIA_PENDIENTE: ['SENTENCIADO'],
  SENTENCIADO: ['APELADO', 'EJECUTORIADO'],
  APELADO: ['EJECUTORIADO', 'ARCHIVADO'],
  EJECUTORIADO: ['ARCHIVADO'],
  ARCHIVADO: [],
};

/**
 * Define qué roles pueden realizar qué transiciones
 */
const PERMISOS_TRANSICION: Record<string, RolUsuario[]> = {
  'BORRADOR->PRESENTADO': ['ABOGADO'],
  'PRESENTADO->ADMITIDO': ['SECRETARIO', 'JUEZ'],
  'PRESENTADO->BORRADOR': ['SECRETARIO'], // Cuando se observa
  'ADMITIDO->CITACION_PENDIENTE': ['SECRETARIO'],
  'CITACION_PENDIENTE->CONTESTACION_PENDIENTE': ['SECRETARIO'],
  'CONTESTACION_PENDIENTE->AUDIENCIA_PRELIMINAR': ['SECRETARIO', 'JUEZ'],
  'AUDIENCIA_PRELIMINAR->AUDIENCIA_COMPLEMENTARIA': ['JUEZ'],
  'AUDIENCIA_PRELIMINAR->SENTENCIA_PENDIENTE': ['JUEZ'],
  'AUDIENCIA_COMPLEMENTARIA->SENTENCIA_PENDIENTE': ['JUEZ'],
  'SENTENCIA_PENDIENTE->SENTENCIADO': ['JUEZ'],
  'SENTENCIADO->APELADO': ['ABOGADO'],
  'SENTENCIADO->EJECUTORIADO': ['JUEZ'],
  'APELADO->EJECUTORIADO': ['JUEZ'],
  'APELADO->ARCHIVADO': ['JUEZ'],
  'EJECUTORIADO->ARCHIVADO': ['SECRETARIO', 'JUEZ'],
};

export interface TransicionResultado {
  exito: boolean;
  mensaje?: string;
  nuevoEstado?: EstadoProceso;
}

/**
 * Valida si una transición de estado es válida
 */
export function esTransicionValida(
  estadoActual: EstadoProceso,
  nuevoEstado: EstadoProceso
): boolean {
  const estadosPermitidos = TRANSICIONES_VALIDAS[estadoActual];
  return estadosPermitidos.includes(nuevoEstado);
}

/**
 * Verifica si un rol tiene permiso para realizar una transición
 */
export function tienePermisoTransicion(
  estadoActual: EstadoProceso,
  nuevoEstado: EstadoProceso,
  rolUsuario: RolUsuario
): boolean {
  const claveTransicion = `${estadoActual}->${nuevoEstado}`;
  const rolesPermitidos = PERMISOS_TRANSICION[claveTransicion];

  if (!rolesPermitidos) {
    return false;
  }

  return rolesPermitidos.includes(rolUsuario);
}

/**
 * Valida pre-condiciones antes de cambiar de estado
 */
async function validarPrecondiciones(
  procesoId: string,
  nuevoEstado: EstadoProceso
): Promise<{ valido: boolean; mensaje?: string }> {
  const proceso = await prisma.proceso.findUnique({
    where: { id: procesoId },
    include: {
      demanda: true,
      partes: true,
      citaciones: true,
      audiencias: true,
      sentencia: true,
    },
  });

  if (!proceso) {
    return { valido: false, mensaje: 'Proceso no encontrado' };
  }

  switch (nuevoEstado) {
    case 'PRESENTADO':
      // Debe tener demanda completa
      if (!proceso.demanda) {
        return { valido: false, mensaje: 'Debe completar la demanda antes de presentar' };
      }
      if (proceso.partes.length < 2) {
        return { valido: false, mensaje: 'Debe registrar al menos actor y demandado' };
      }
      break;

    case 'ADMITIDO':
      // La demanda debe estar presentada
      if (proceso.estado !== 'PRESENTADO') {
        return { valido: false, mensaje: 'La demanda debe estar presentada' };
      }
      break;

    case 'CITACION_PENDIENTE':
      // Debe estar admitida
      if (proceso.estado !== 'ADMITIDO') {
        return { valido: false, mensaje: 'El proceso debe estar admitido' };
      }
      break;

    case 'CONTESTACION_PENDIENTE':
      // Debe existir al menos una citación exitosa
      const citacionExitosa = proceso.citaciones.some(c => c.estado === 'EXITOSA');
      if (!citacionExitosa) {
        return { valido: false, mensaje: 'Debe completar al menos una citación exitosa' };
      }
      break;

    case 'AUDIENCIA_PRELIMINAR':
      // Plazo de contestación debe haber vencido o contestado
      if (proceso.estado !== 'CONTESTACION_PENDIENTE') {
        return { valido: false, mensaje: 'Debe estar en estado de contestación pendiente' };
      }
      break;

    case 'SENTENCIA_PENDIENTE':
      // Debe haber al menos una audiencia finalizada
      const audienciaFinalizada = proceso.audiencias.some(a => a.estado === 'FINALIZADA');
      if (!audienciaFinalizada) {
        return { valido: false, mensaje: 'Debe finalizar al menos una audiencia' };
      }
      break;

    case 'SENTENCIADO':
      // Debe existir una sentencia
      if (!proceso.sentencia) {
        return { valido: false, mensaje: 'Debe emitir la sentencia' };
      }
      break;

    default:
      break;
  }

  return { valido: true };
}

/**
 * Realiza una transición de estado con todas las validaciones
 */
export async function realizarTransicion(
  procesoId: string,
  nuevoEstado: EstadoProceso,
  usuarioId: string,
  rolUsuario: RolUsuario,
  motivo?: string
): Promise<TransicionResultado> {
  try {
    // 1. Obtener el proceso actual
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
    });

    if (!proceso) {
      return { exito: false, mensaje: 'Proceso no encontrado' };
    }

    const estadoActual = proceso.estado;

    // 2. Validar que la transición sea válida
    if (!esTransicionValida(estadoActual, nuevoEstado)) {
      return {
        exito: false,
        mensaje: `No se puede cambiar de ${estadoActual} a ${nuevoEstado}`,
      };
    }

    // 3. Validar permisos del usuario
    if (!tienePermisoTransicion(estadoActual, nuevoEstado, rolUsuario)) {
      return {
        exito: false,
        mensaje: `No tiene permisos para realizar esta transición`,
      };
    }

    // 4. Validar pre-condiciones
    const validacion = await validarPrecondiciones(procesoId, nuevoEstado);
    if (!validacion.valido) {
      return { exito: false, mensaje: validacion.mensaje };
    }

    // 5. Realizar la transición
    const procesoActualizado = await prisma.proceso.update({
      where: { id: procesoId },
      data: {
        estado: nuevoEstado,
      },
    });

    // 6. Registrar en auditoría (opcional, puedes crear una tabla de auditoría)
    // await registrarAuditoria(procesoId, estadoActual, nuevoEstado, usuarioId, motivo);

    // 7. Ejecutar acciones post-transición
    await ejecutarAccionesPostTransicion(procesoId, nuevoEstado);

    return {
      exito: true,
      nuevoEstado: procesoActualizado.estado,
      mensaje: `Estado actualizado a ${nuevoEstado}`,
    };
  } catch (error) {
    console.error('Error en transición de estado:', error);
    return {
      exito: false,
      mensaje: 'Error al actualizar el estado del proceso',
    };
  }
}

/**
 * Ejecuta acciones automáticas después de cambiar de estado
 */
async function ejecutarAccionesPostTransicion(
  procesoId: string,
  nuevoEstado: EstadoProceso
): Promise<void> {
  switch (nuevoEstado) {
    case 'ADMITIDO':
      // Crear plazo de citación automáticamente
      // await crearPlazoAutomatico(procesoId, 'CITACION', 5);
      break;

    case 'CITACION_PENDIENTE':
      // Notificar al secretario
      break;

    case 'CONTESTACION_PENDIENTE':
      // Crear plazo de contestación (30 días)
      // await crearPlazoAutomatico(procesoId, 'CONTESTACION', 30);
      break;

    case 'AUDIENCIA_PRELIMINAR':
      // Programar audiencia automáticamente (5 días después de contestación)
      break;

    case 'SENTENCIA_PENDIENTE':
      // Crear plazo para sentencia
      // await crearPlazoAutomatico(procesoId, 'SENTENCIA', 15);
      break;

    default:
      break;
  }
}

/**
 * Obtiene los próximos estados posibles desde el estado actual
 */
export function obtenerEstadosPosibles(
  estadoActual: EstadoProceso,
  rolUsuario: RolUsuario
): EstadoProceso[] {
  const estadosPosibles = TRANSICIONES_VALIDAS[estadoActual];

  return estadosPosibles.filter((estado) =>
    tienePermisoTransicion(estadoActual, estado, rolUsuario)
  );
}

/**
 * Obtiene el nombre legible de un estado
 */
export function obtenerNombreEstado(estado: EstadoProceso): string {
  const nombres: Record<EstadoProceso, string> = {
    BORRADOR: 'Borrador',
    PRESENTADO: 'Presentado',
    ADMITIDO: 'Admitido',
    CITACION_PENDIENTE: 'Citación Pendiente',
    CONTESTACION_PENDIENTE: 'Contestación Pendiente',
    AUDIENCIA_PRELIMINAR: 'Audiencia Preliminar',
    AUDIENCIA_COMPLEMENTARIA: 'Audiencia Complementaria',
    SENTENCIA_PENDIENTE: 'Sentencia Pendiente',
    SENTENCIADO: 'Sentenciado',
    APELADO: 'Apelado',
    EJECUTORIADO: 'Ejecutoriado',
    ARCHIVADO: 'Archivado',
  };

  return nombres[estado] || estado;
}
