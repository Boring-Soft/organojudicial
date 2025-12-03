/**
 * Generador de decretos judiciales
 * Crea decretos de admisión, observación y rechazo de demandas
 */

interface DatosDecreto {
  nurej: string;
  juez: string;
  juzgado: string;
  materia: string;
  actor: {
    nombres: string;
    apellidos: string;
    ci: string;
  };
  demandado: {
    nombres: string;
    apellidos: string;
    ci: string;
  };
  abogado: {
    nombres: string;
    apellidos: string;
    registro: string;
  };
  objetoDemanda: string;
  valor: number;
  fecha?: Date;
  observaciones?: string;
}

/**
 * Genera decreto de admisión de demanda
 */
export function generarDecretoAdmision(datos: DatosDecreto): string {
  const fecha = datos.fecha || new Date();
  const fechaStr = fecha.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
${datos.juzgado.toUpperCase()}
${datos.materia.toUpperCase()}

DECRETO DE ADMISIÓN

NUREJ: ${datos.nurej}

${datos.juez}, Juez Público en lo ${datos.materia} del ${datos.juzgado}, en ejercicio de las atribuciones conferidas por Ley.

VISTOS:

La demanda de fecha ${fechaStr}, presentada por ${datos.actor.nombres} ${datos.actor.apellidos}, con C.I. ${datos.actor.ci}, en calidad de PARTE ACTORA, representado por el Dr(a). ${datos.abogado.nombres} ${datos.abogado.apellidos}, Abogado con Registro Profesional N° ${datos.abogado.registro}, contra ${datos.demandado.nombres} ${datos.demandado.apellidos}, con C.I. ${datos.demandado.ci}, en calidad de PARTE DEMANDADA.

CONSIDERANDO:

I. Que la demanda presentada cumple con los requisitos establecidos en el Artículo 110 del Código Procesal Civil, conteniendo todos los elementos formales necesarios para su admisión.

II. Que corresponde admitir la demanda presentada y ordenar la citación de la parte demandada conforme a derecho.

III. Que el objeto de la demanda es: ${datos.objetoDemanda}

IV. Que la cuantía del proceso se establece en la suma de Bs. ${datos.valor.toLocaleString('es-BO')} (${numeroALetras(datos.valor)} Bolivianos).

POR TANTO:

El Juez Público en lo ${datos.materia} del ${datos.juzgado}, en aplicación de los artículos 110, 111 y concordantes del Código Procesal Civil,

DECRETA:

PRIMERO.- Se ADMITE a trámite la demanda presentada por ${datos.actor.nombres} ${datos.actor.apellidos} contra ${datos.demandado.nombres} ${datos.demandado.apellidos}, siguiendo el procedimiento ${datos.materia === 'CIVIL' ? 'ordinario' : 'correspondiente'}.

SEGUNDO.- Se ordena la CITACIÓN de la parte demandada ${datos.demandado.nombres} ${datos.demandado.apellidos}, bajo apercibimiento de Ley, otorgándole el plazo de TREINTA (30) DÍAS HÁBILES para que conteste la demanda, conforme establece el Artículo 330 del Código Procesal Civil.

TERCERO.- Cúmplase con notificar a las partes del presente decreto.

Regístrese, notifíquese y cúmplase.

${fechaStr}


_______________________________
${datos.juez}
Juez Público en lo ${datos.materia}
${datos.juzgado}
`.trim();
}

/**
 * Genera decreto de observación de demanda (Art. 113 CPC)
 */
export function generarDecretoObservacion(datos: DatosDecreto): string {
  const fecha = datos.fecha || new Date();
  const fechaStr = fecha.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
${datos.juzgado.toUpperCase()}
${datos.materia.toUpperCase()}

DECRETO DE OBSERVACIÓN

NUREJ: ${datos.nurej}

${datos.juez}, Juez Público en lo ${datos.materia} del ${datos.juzgado}, en ejercicio de las atribuciones conferidas por Ley.

VISTOS:

La demanda de fecha ${fechaStr}, presentada por ${datos.actor.nombres} ${datos.actor.apellidos}, con C.I. ${datos.actor.ci}, representado por el Dr(a). ${datos.abogado.nombres} ${datos.abogado.apellidos}, Abogado con Registro Profesional N° ${datos.abogado.registro}.

CONSIDERANDO:

I. Que habiéndose revisado la demanda presentada, se ha verificado que NO cumple con todos los requisitos establecidos en el Artículo 110 del Código Procesal Civil.

II. Que el Artículo 113 del Código Procesal Civil establece que cuando la demanda no cumpla con los requisitos del Artículo 110, el Juez señalará en el decreto, con precisión, los defectos u omisiones de que adolezca, concediendo al demandante el plazo de TRES (3) DÍAS para subsanarlos.

III. Que se han detectado las siguientes observaciones:

OBSERVACIONES:

${datos.observaciones || 'No se especificaron observaciones'}

POR TANTO:

El Juez Público en lo ${datos.materia} del ${datos.juzgado}, en aplicación del Artículo 113 del Código Procesal Civil,

DECRETA:

PRIMERO.- Se OBSERVA la demanda presentada por ${datos.actor.nombres} ${datos.actor.apellidos}, debiendo subsanar las observaciones señaladas precedentemente.

SEGUNDO.- Se concede el plazo de TRES (3) DÍAS HÁBILES, computables a partir de su legal notificación, para que la parte actora subsane las observaciones formuladas, bajo apercibimiento de rechazar la demanda en caso de incumplimiento.

TERCERO.- Una vez subsanadas las observaciones, el demandante deberá presentar memorial expreso solicitando el examen de la demanda.

CUARTO.- Notifíquese.

Regístrese, notifíquese y cúmplase.

${fechaStr}


_______________________________
${datos.juez}
Juez Público en lo ${datos.materia}
${datos.juzgado}
`.trim();
}

/**
 * Genera decreto de rechazo de demanda
 */
export function generarDecretoRechazo(datos: DatosDecreto): string {
  const fecha = datos.fecha || new Date();
  const fechaStr = fecha.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
${datos.juzgado.toUpperCase()}
${datos.materia.toUpperCase()}

DECRETO DE RECHAZO

NUREJ: ${datos.nurej}

${datos.juez}, Juez Público en lo ${datos.materia} del ${datos.juzgado}, en ejercicio de las atribuciones conferidas por Ley.

VISTOS:

La demanda de fecha ${fechaStr}, presentada por ${datos.actor.nombres} ${datos.actor.apellidos}, con C.I. ${datos.actor.ci}, representado por el Dr(a). ${datos.abogado.nombres} ${datos.abogado.apellidos}, Abogado con Registro Profesional N° ${datos.abogado.registro}.

CONSIDERANDO:

I. Que mediante decreto de observación se señalaron defectos y omisiones en la demanda presentada, otorgándose el plazo legal para su subsanación conforme al Artículo 113 del Código Procesal Civil.

II. Que habiendo transcurrido el plazo otorgado, la parte demandante NO ha cumplido con subsanar las observaciones formuladas.

III. Que el Artículo 113 del Código Procesal Civil establece que si el demandante no subsana las observaciones en el plazo señalado, se rechazará la demanda.

POR TANTO:

El Juez Público en lo ${datos.materia} del ${datos.juzgado}, en aplicación del Artículo 113 del Código Procesal Civil,

DECRETA:

PRIMERO.- Se RECHAZA la demanda presentada por ${datos.actor.nombres} ${datos.actor.apellidos} contra ${datos.demandado.nombres} ${datos.demandado.apellidos}, por no haber subsanado las observaciones formuladas en el plazo otorgado.

SEGUNDO.- El presente rechazo no impide que el demandante presente nuevamente su demanda, subsanando las observaciones señaladas.

TERCERO.- Notifíquese.

Regístrese, notifíquese y archívese.

${fechaStr}


_______________________________
${datos.juez}
Juez Público en lo ${datos.materia}
${datos.juzgado}
`.trim();
}

/**
 * Convierte un número a letras (simplificado para montos)
 */
function numeroALetras(num: number): string {
  const unidades = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
  const decenas = ['', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
  const especiales = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
  const centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

  if (num === 0) return 'Cero';
  if (num >= 1000000) return num.toLocaleString('es-BO'); // Simplificado para números grandes

  let resultado = '';

  // Miles
  const miles = Math.floor(num / 1000);
  if (miles > 0) {
    if (miles === 1) {
      resultado += 'Mil ';
    } else {
      resultado += numeroMenorMil(miles) + ' Mil ';
    }
  }

  // Centenas, decenas y unidades
  const resto = num % 1000;
  if (resto > 0) {
    resultado += numeroMenorMil(resto);
  }

  return resultado.trim();
}

function numeroMenorMil(num: number): string {
  const unidades = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
  const decenas = ['', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
  const especiales = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
  const centenas = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

  let resultado = '';

  // Centenas
  const c = Math.floor(num / 100);
  if (c > 0) {
    if (c === 1 && num === 100) {
      resultado += 'Cien';
      return resultado;
    }
    resultado += centenas[c] + ' ';
  }

  // Decenas y unidades
  const resto = num % 100;
  if (resto >= 10 && resto < 20) {
    resultado += especiales[resto - 10];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;

    if (d > 0) {
      resultado += decenas[d];
      if (u > 0) {
        resultado += ' y ' + unidades[u];
      }
    } else if (u > 0) {
      resultado += unidades[u];
    }
  }

  return resultado.trim();
}
