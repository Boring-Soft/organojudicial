/**
 * Generador de Actas de Audiencias
 * Genera actas en formato legal para audiencias virtuales
 */

interface DatosActa {
  nurej: string;
  juzgado: string;
  materia: string;
  juez: string;
  fecha: Date;
  tipo: 'PRELIMINAR' | 'COMPLEMENTARIA';
  duracion: number;
  asistentes: Array<{
    nombre: string;
    tipo: string;
    rol: string;
  }>;
  transcripcion?: string;
  resumen?: string;
}

export function generarActaAudiencia(datos: DatosActa): string {
  const fechaFormateada = datos.fecha.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaFormateada = datos.fecha.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
${datos.juzgado.toUpperCase()}

ACTA DE AUDIENCIA ${datos.tipo}

NUREJ: ${datos.nurej}
MATERIA: ${datos.materia}
FECHA: ${fechaFormateada}
HORA DE INICIO: ${horaFormateada}
DURACIÓN: ${datos.duracion} minutos

I. IDENTIFICACIÓN

Proceso judicial identificado con NUREJ ${datos.nurej}, correspondiente a la materia de ${datos.materia},
a cargo del ${datos.juez}.

II. ASISTENCIA

En la presente audiencia ${datos.tipo.toLowerCase()}, realizada de manera virtual mediante plataforma
de videoconferencia autorizada, comparecieron las siguientes personas:

${generarListaAsistentes(datos.asistentes)}

III. DESARROLLO DE LA AUDIENCIA

${datos.juez} abre la audiencia a horas ${horaFormateada} del día ${fechaFormateada},
verificando la presencia de las partes y sus representantes legales.

${datos.resumen || 'Se desarrolla la audiencia conforme a lo previsto en el Código Procesal Civil.'}

${datos.transcripcion ? '\nIV. TRANSCRIPCIÓN DE LA AUDIENCIA\n\n' + datos.transcripcion : ''}

V. RESOLUCIÓN

${generarResolucionSegunTipo(datos.tipo)}

VI. CIERRE

No habiendo más puntos que tratar, se da por concluida la presente audiencia a horas
${calcularHoraFin(datos.fecha, datos.duracion)}, firmando los comparecientes electrónicamente
a través del sistema de gestión procesal.

En fe de lo cual, se extiende la presente acta.


_________________________
${datos.juez}
JUEZ A CARGO


NOTA: Acta generada automáticamente por el Sistema Integral de Gestión Procesal Judicial (SIGPJ).
Tiene plena validez legal conforme a la normativa vigente sobre firma digital y actuaciones
procesales virtuales.
  `.trim();
}

function generarListaAsistentes(asistentes: Array<{ nombre: string; tipo: string; rol: string }>): string {
  return asistentes
    .map((asistente, index) => {
      return `${index + 1}. ${asistente.nombre} - ${asistente.tipo} (${asistente.rol})`;
    })
    .join('\n');
}

function generarResolucionSegunTipo(tipo: 'PRELIMINAR' | 'COMPLEMENTARIA'): string {
  if (tipo === 'PRELIMINAR') {
    return `El tribunal, habiendo escuchado a las partes y analizado las pruebas presentadas,
determina que el proceso se encuentra en condiciones de continuar con la audiencia complementaria
para la valoración definitiva de las pruebas.

Se fija fecha y hora para la audiencia complementaria, la cual será comunicada a las partes
mediante el sistema de notificaciones.`;
  } else {
    return `El tribunal, habiendo concluido la etapa probatoria y escuchado los alegatos finales
de las partes, declara la causa en estado de sentencia.

Se otorga el plazo de 15 días hábiles para la emisión de la sentencia correspondiente,
conforme al artículo 330 del Código Procesal Civil.`;
  }
}

function calcularHoraFin(fecha: Date, duracionMinutos: number): string {
  const fechaFin = new Date(fecha.getTime() + duracionMinutos * 60 * 1000);
  return fechaFin.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Genera un resumen simplificado para ciudadanos
 */
export function generarResumenCiudadano(datos: DatosActa, resultadoPreliminar?: string): string {
  return `
📋 RESUMEN DE AUDIENCIA

Proceso: ${datos.nurej}
Fecha: ${datos.fecha.toLocaleDateString('es-BO')}
Tipo: Audiencia ${datos.tipo.toLowerCase()}

¿QUÉ PASÓ EN LA AUDIENCIA?

${resultadoPreliminar || 'La audiencia se desarrolló con normalidad, participando todas las partes involucradas.'}

PRÓXIMOS PASOS:

${datos.tipo === 'PRELIMINAR'
  ? '• Se programará una audiencia complementaria\n• Debe estar atento a las notificaciones del sistema'
  : '• El juez tiene 15 días para emitir la sentencia\n• Recibirá una notificación cuando esté lista'
}

Para más información, consulte con su abogado.
  `.trim();
}
