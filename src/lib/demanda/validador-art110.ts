/**
 * Validador automático del Art. 110 del Código Procesal Civil Boliviano
 * Verifica que la demanda cumpla con todos los requisitos formales
 */

export interface ObservacionDemanda {
  campo: string;
  descripcion: string;
  articulo: string;
  nivel: 'CRITICO' | 'ADVERTENCIA';
}

export interface ResultadoValidacion {
  esValida: boolean;
  observaciones: ObservacionDemanda[];
  puntaje: number; // 0-100
  requisitosCumplidos: number;
  requisitosTotales: number;
}

export interface DatosDemanda {
  // Paso 1: Partes
  demandante: {
    ci?: string;
    nombres?: string;
    apellidos?: string;
    edad?: number;
    estadoCivil?: string;
    profesion?: string;
    domicilioReal?: string;
    domicilioProcesal?: string;
  };
  demandado: {
    ci?: string;
    nombres?: string;
    apellidos?: string;
    domicilioReal?: string;
  };
  abogado: {
    nombres?: string;
    registro?: string;
  };

  // Paso 2: Detalles
  designacionJuez?: string;
  objetoDemanda?: string;
  materia?: string;
  valor?: number;

  // Paso 3: Fundamentos
  hechos?: string;
  derecho?: string;
  petitorio?: string;
  ofrecimientoPrueba?: string;

  // Paso 4: Anexos
  anexos?: Array<{
    nombre: string;
    tipo: string;
    size: number;
  }>;
}

/**
 * Valida todos los requisitos del Art. 110
 */
export function validarDemandaArt110(datos: DatosDemanda): ResultadoValidacion {
  const observaciones: ObservacionDemanda[] = [];
  let requisitosCumplidos = 0;
  const requisitosTotales = 18; // Total de requisitos del Art. 110

  // 1. Designación del Juez o Tribunal (Art. 110 inc. 1)
  if (!datos.designacionJuez || datos.designacionJuez.trim().length === 0) {
    observaciones.push({
      campo: 'designacionJuez',
      descripcion: 'Debe designarse el juez o tribunal ante quien se interpone la demanda',
      articulo: 'Art. 110 inc. 1',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 2. Nombre y apellidos completos del demandante (Art. 110 inc. 2)
  if (!datos.demandante.nombres || datos.demandante.nombres.trim().length === 0) {
    observaciones.push({
      campo: 'demandante.nombres',
      descripcion: 'Debe indicar el nombre completo del demandante',
      articulo: 'Art. 110 inc. 2',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  if (!datos.demandante.apellidos || datos.demandante.apellidos.trim().length === 0) {
    observaciones.push({
      campo: 'demandante.apellidos',
      descripcion: 'Debe indicar los apellidos completos del demandante',
      articulo: 'Art. 110 inc. 2',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 3. Edad del demandante (Art. 110 inc. 2)
  if (!datos.demandante.edad || datos.demandante.edad <= 0) {
    observaciones.push({
      campo: 'demandante.edad',
      descripcion: 'Debe indicar la edad del demandante',
      articulo: 'Art. 110 inc. 2',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 4. Estado civil del demandante (Art. 110 inc. 2)
  if (!datos.demandante.estadoCivil) {
    observaciones.push({
      campo: 'demandante.estadoCivil',
      descripcion: 'Debe indicar el estado civil del demandante',
      articulo: 'Art. 110 inc. 2',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 5. Profesión u oficio del demandante (Art. 110 inc. 2)
  if (!datos.demandante.profesion) {
    observaciones.push({
      campo: 'demandante.profesion',
      descripcion: 'Debe indicar la profesión u oficio del demandante',
      articulo: 'Art. 110 inc. 2',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 6. Domicilio real del demandante (Art. 110 inc. 2)
  if (!datos.demandante.domicilioReal || datos.demandante.domicilioReal.trim().length === 0) {
    observaciones.push({
      campo: 'demandante.domicilioReal',
      descripcion: 'Debe indicar el domicilio real del demandante',
      articulo: 'Art. 110 inc. 2',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 7. Domicilio procesal del demandante (Art. 110 inc. 2)
  if (!datos.demandante.domicilioProcesal || datos.demandante.domicilioProcesal.trim().length === 0) {
    observaciones.push({
      campo: 'demandante.domicilioProcesal',
      descripcion: 'Debe constituir domicilio procesal dentro del radio del asiento del juzgado',
      articulo: 'Art. 110 inc. 2',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 8. Nombre y apellidos del demandado (Art. 110 inc. 3)
  if (!datos.demandado.nombres || datos.demandado.nombres.trim().length === 0) {
    observaciones.push({
      campo: 'demandado.nombres',
      descripcion: 'Debe indicar el nombre del demandado',
      articulo: 'Art. 110 inc. 3',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  if (!datos.demandado.apellidos || datos.demandado.apellidos.trim().length === 0) {
    observaciones.push({
      campo: 'demandado.apellidos',
      descripcion: 'Debe indicar los apellidos del demandado',
      articulo: 'Art. 110 inc. 3',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 9. Domicilio del demandado (Art. 110 inc. 3)
  if (!datos.demandado.domicilioReal || datos.demandado.domicilioReal.trim().length === 0) {
    observaciones.push({
      campo: 'demandado.domicilioReal',
      descripcion: 'Debe indicar el domicilio del demandado para fines de citación',
      articulo: 'Art. 110 inc. 3',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 10. Objeto de la demanda (Art. 110 inc. 4)
  if (!datos.objetoDemanda || datos.objetoDemanda.trim().length === 0) {
    observaciones.push({
      campo: 'objetoDemanda',
      descripcion: 'Debe especificarse con claridad el objeto de la demanda',
      articulo: 'Art. 110 inc. 4',
      nivel: 'CRITICO',
    });
  } else if (datos.objetoDemanda.length < 20) {
    observaciones.push({
      campo: 'objetoDemanda',
      descripcion: 'El objeto de la demanda debe ser más detallado',
      articulo: 'Art. 110 inc. 4',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 11. Hechos en que se funda (Art. 110 inc. 5)
  if (!datos.hechos || datos.hechos.trim().length === 0) {
    observaciones.push({
      campo: 'hechos',
      descripcion: 'Debe exponer los hechos en que se funda la demanda',
      articulo: 'Art. 110 inc. 5',
      nivel: 'CRITICO',
    });
  } else if (datos.hechos.length < 100) {
    observaciones.push({
      campo: 'hechos',
      descripcion: 'La exposición de hechos debe ser más detallada',
      articulo: 'Art. 110 inc. 5',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 12. Fundamentos de derecho (Art. 110 inc. 6)
  if (!datos.derecho || datos.derecho.trim().length === 0) {
    observaciones.push({
      campo: 'derecho',
      descripcion: 'Debe fundar la demanda en derecho, citando las normas legales aplicables',
      articulo: 'Art. 110 inc. 6',
      nivel: 'CRITICO',
    });
  } else if (datos.derecho.length < 50) {
    observaciones.push({
      campo: 'derecho',
      descripcion: 'Los fundamentos de derecho deben ser más desarrollados',
      articulo: 'Art. 110 inc. 6',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 13. Petitorio (Art. 110 inc. 7)
  if (!datos.petitorio || datos.petitorio.trim().length === 0) {
    observaciones.push({
      campo: 'petitorio',
      descripcion: 'Debe contener un petitorio claro y preciso',
      articulo: 'Art. 110 inc. 7',
      nivel: 'CRITICO',
    });
  } else if (datos.petitorio.length < 30) {
    observaciones.push({
      campo: 'petitorio',
      descripcion: 'El petitorio debe ser más específico',
      articulo: 'Art. 110 inc. 7',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // 14. Valor de la demanda (Art. 110 inc. 8)
  if (!datos.valor || datos.valor <= 0) {
    observaciones.push({
      campo: 'valor',
      descripcion: 'Debe estimarse el valor de la demanda',
      articulo: 'Art. 110 inc. 8',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 15. Ofrecimiento de prueba (Art. 110 inc. 9)
  if (!datos.ofrecimientoPrueba || datos.ofrecimientoPrueba.trim().length === 0) {
    observaciones.push({
      campo: 'ofrecimientoPrueba',
      descripcion: 'Debe ofrecer toda la prueba de que el demandante ha de valerse',
      articulo: 'Art. 110 inc. 9',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 16. Firma del abogado (Art. 110 inc. 10)
  if (!datos.abogado.nombres || !datos.abogado.registro) {
    observaciones.push({
      campo: 'abogado',
      descripcion: 'La demanda debe estar firmada por un abogado con registro profesional',
      articulo: 'Art. 110 inc. 10',
      nivel: 'CRITICO',
    });
  } else {
    requisitosCumplidos++;
  }

  // 17. Documentos de prueba anexos
  if (!datos.anexos || datos.anexos.length === 0) {
    observaciones.push({
      campo: 'anexos',
      descripcion: 'Se recomienda adjuntar documentos probatorios',
      articulo: 'Art. 110 inc. 9',
      nivel: 'ADVERTENCIA',
    });
  } else {
    requisitosCumplidos++;
  }

  // Calcular puntaje
  const puntaje = Math.round((requisitosCumplidos / requisitosTotales) * 100);

  // La demanda es válida si cumple todos los requisitos CRÍTICOS
  const requisitosCriticos = observaciones.filter(o => o.nivel === 'CRITICO');
  const esValida = requisitosCriticos.length === 0;

  return {
    esValida,
    observaciones,
    puntaje,
    requisitosCumplidos,
    requisitosTotales,
  };
}

/**
 * Genera un reporte de validación en formato texto
 */
export function generarReporteValidacion(resultado: ResultadoValidacion): string {
  let reporte = `VALIDACIÓN DE DEMANDA - ART. 110 CPC\n`;
  reporte += `=======================================\n\n`;
  reporte += `Estado: ${resultado.esValida ? '✅ VÁLIDA' : '❌ REQUIERE CORRECCIONES'}\n`;
  reporte += `Puntaje: ${resultado.puntaje}/100\n`;
  reporte += `Requisitos cumplidos: ${resultado.requisitosCumplidos}/${resultado.requisitosTotales}\n\n`;

  if (resultado.observaciones.length > 0) {
    reporte += `OBSERVACIONES:\n`;
    reporte += `--------------\n\n`;

    const criticas = resultado.observaciones.filter(o => o.nivel === 'CRITICO');
    const advertencias = resultado.observaciones.filter(o => o.nivel === 'ADVERTENCIA');

    if (criticas.length > 0) {
      reporte += `🔴 CRÍTICAS (${criticas.length}):\n`;
      criticas.forEach((obs, i) => {
        reporte += `${i + 1}. ${obs.descripcion} (${obs.articulo})\n`;
      });
      reporte += `\n`;
    }

    if (advertencias.length > 0) {
      reporte += `🟡 ADVERTENCIAS (${advertencias.length}):\n`;
      advertencias.forEach((obs, i) => {
        reporte += `${i + 1}. ${obs.descripcion} (${obs.articulo})\n`;
      });
      reporte += `\n`;
    }
  } else {
    reporte += `✅ La demanda cumple con todos los requisitos del Art. 110 del CPC.\n`;
  }

  return reporte;
}
