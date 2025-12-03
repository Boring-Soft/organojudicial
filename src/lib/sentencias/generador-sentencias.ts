/**
 * Generador de Sentencias según Art. 213 CPC Bolivia
 * Estructura: Encabezamiento, Narrativa, Motiva, Resolutiva
 */

export interface DatosSentencia {
  nurej: string;
  juzgado: string;
  materia: string;
  juez: string;

  // Partes
  demandante: {
    nombres: string;
    apellidos: string;
    ci: string;
  };
  demandado: {
    nombres: string;
    apellidos: string;
    ci: string;
  };

  // Contenido de la sentencia
  encabezamiento: string;
  narrativa: string;
  motiva: string;
  resolutiva: string;

  // Resultado
  resultadoActor: 'FAVORABLE' | 'DESFAVORABLE' | 'PARCIAL';
  resultadoDemandado: 'FAVORABLE' | 'DESFAVORABLE' | 'PARCIAL';
}

/**
 * Genera sentencia en formato oficial
 */
export function generarSentenciaOficial(datos: DatosSentencia): string {
  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
${datos.juzgado.toUpperCase()}

SENTENCIA

NUREJ: ${datos.nurej}
MATERIA: ${datos.materia}
FECHA: ${fechaFormateada}

I. ENCABEZAMIENTO

${datos.encabezamiento}

${datos.juez}, Juez a cargo del presente proceso, ha pronunciado la siguiente sentencia:

II. NARRATIVA (Parte Expositiva)

${datos.narrativa}

III. MOTIVA (Parte Considerativa)

${datos.motiva}

IV. RESOLUTIVA (Parte Dispositiva)

${datos.resolutiva}

Regístrese, notifíquese y cúmplase.


_________________________
${datos.juez}
JUEZ A CARGO


NOTA: Sentencia generada mediante el Sistema Integral de Gestión Procesal Judicial (SIGPJ).
Tiene plena validez legal conforme a la normativa vigente sobre firma digital.
  `.trim();
}

/**
 * Genera resumen simplificado para ciudadanos
 */
export function generarResumenCiudadano(
  datos: DatosSentencia,
  esActor: boolean
): string {
  const resultado = esActor ? datos.resultadoActor : datos.resultadoDemandado;

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

  return `
${emoji} ${tituloResultado}

Proceso: ${datos.nurej}
Fecha de sentencia: ${new Date().toLocaleDateString('es-BO')}

¿QUÉ DECIDIÓ EL JUEZ?

${explicacion}

IMPORTANTE:

• Tiene derecho a apelar esta sentencia en un plazo de 15 días hábiles
• Consulte con su abogado sobre las posibilidades de apelación
• Si no apela, la sentencia quedará firme y deberá cumplirse

Para leer la sentencia completa, ingrese al sistema con su usuario.

¿QUÉ SIGUE?

${resultado === 'FAVORABLE' && esActor
  ? '• Esperar el cumplimiento de la sentencia\n• Si no se cumple voluntariamente, solicitar ejecución forzosa'
  : resultado === 'DESFAVORABLE' && !esActor
  ? '• Debe cumplir con lo ordenado en la sentencia\n• Consulte con su abogado sobre los plazos de cumplimiento'
  : '• Evaluar con su abogado si conviene apelar\n• Analizar qué partes fueron favorables y desfavorables'
}
  `.trim();
}

/**
 * Genera resumen técnico para abogados
 */
export function generarResumenAbogado(datos: DatosSentencia): string {
  const fecha = new Date();

  return `
RESUMEN EJECUTIVO DE SENTENCIA

NUREJ: ${datos.nurej}
JUZGADO: ${datos.juzgado}
MATERIA: ${datos.materia}
FECHA DE EMISIÓN: ${fecha.toLocaleDateString('es-BO')}

PARTES:

Actor: ${datos.demandante.nombres} ${datos.demandante.apellidos} (CI: ${datos.demandante.ci})
Resultado: ${datos.resultadoActor}

Demandado: ${datos.demandado.nombres} ${datos.demandado.apellidos} (CI: ${datos.demandado.ci})
Resultado: ${datos.resultadoDemandado}

PARTE RESOLUTIVA:

${datos.resolutiva}

PLAZOS Y RECURSOS:

• Plazo de apelación: 15 días hábiles desde la notificación
• Recurso disponible: Apelación ante Tribunal Departamental
• Ejecutoria: Si no se apela, la sentencia ejecutoria en 15 días hábiles

ACCIONES RECOMENDADAS:

1. Analizar fundamentos de derecho
2. Evaluar viabilidad de apelación
3. Notificar decisión al cliente
4. Preparar memorial de apelación (si corresponde)

Para acceder a la sentencia completa en formato PDF, ingrese al sistema.
  `.trim();
}

/**
 * Genera hash SHA-256 para la sentencia
 */
export async function generarHashSentencia(contenido: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(contenido);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Plantilla por defecto para nueva sentencia
 */
export function generarPlantillaVacia(nurej: string, juzgado: string, materia: string): Partial<DatosSentencia> {
  return {
    nurej,
    juzgado,
    materia,
    encabezamiento: `En la ciudad de La Paz, a los ... días del mes de ... del año ..., el ${juzgado}, en el proceso ordinario signado con el NUREJ ${nurej}, ha pronunciado la siguiente sentencia:

VISTOS: Los antecedentes del proceso, la demanda presentada, la contestación de la demanda, las pruebas aportadas y los alegatos de las partes;

CONSIDERANDO: Las normas procesales y sustantivas aplicables al caso;`,

    narrativa: `1. ANTECEDENTES

[Describir cronológicamente los hechos del proceso desde la presentación de la demanda hasta el cierre de la etapa probatoria]

2. DEMANDA

[Resumir las pretensiones del actor, los hechos alegados y el fundamento de derecho]

3. CONTESTACIÓN

[Resumir la contestación del demandado, las excepciones interpuestas si hubiere, y su posición procesal]

4. PRUEBAS

[Enumerar las pruebas presentadas por ambas partes]`,

    motiva: `1. FUNDAMENTOS DE DERECHO

[Citar las normas legales aplicables]

2. VALORACIÓN DE LA PRUEBA

[Analizar las pruebas conforme a las reglas de la sana crítica]

3. ANÁLISIS JURÍDICO

[Aplicar el derecho a los hechos probados]

4. CONCLUSIÓN

[Fundamentar la decisión tomada]`,

    resolutiva: `Por los fundamentos expuestos, el ${juzgado}, administrando justicia en nombre del Pueblo Boliviano:

RESUELVE:

PRIMERO.- [Decisión principal sobre el fondo del asunto]

SEGUNDO.- [Consecuencias accesorias: costas, costos, intereses, etc.]

TERCERO.- Sin costas ni costos por [fundamentar si corresponde]

Regístrese, notifíquese y cúmplase.`,
  };
}
