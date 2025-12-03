/**
 * Utilidad para cálculo de días hábiles en Bolivia
 * Considera feriados nacionales y días no laborables
 */

// Feriados fijos de Bolivia
const FERIADOS_FIJOS = [
  { mes: 1, dia: 1 }, // Año Nuevo
  { mes: 5, dia: 1 }, // Día del Trabajo
  { mes: 8, dia: 6 }, // Día de la Independencia
  { mes: 11, dia: 2 }, // Día de Todos los Santos
  { mes: 12, dia: 25 }, // Navidad
];

// Feriados móviles de Bolivia (actualizar cada año)
const FERIADOS_MOVILES_2025 = [
  new Date(2025, 1, 24), // Carnaval (lunes)
  new Date(2025, 1, 25), // Carnaval (martes)
  new Date(2025, 3, 18), // Viernes Santo
  new Date(2025, 5, 19), // Corpus Christi
];

const FERIADOS_MOVILES_2026 = [
  new Date(2026, 1, 16), // Carnaval (lunes)
  new Date(2026, 1, 17), // Carnaval (martes)
  new Date(2026, 3, 3), // Viernes Santo
  new Date(2026, 5, 4), // Corpus Christi
];

/**
 * Verifica si una fecha es feriado en Bolivia
 */
export function esFeriado(fecha: Date): boolean {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();

  // Verificar feriados fijos
  const esFeriadoFijo = FERIADOS_FIJOS.some(
    (feriado) => feriado.mes === mes && feriado.dia === dia
  );

  if (esFeriadoFijo) return true;

  // Verificar feriados móviles
  const year = fecha.getFullYear();
  let feriadosMoviles: Date[] = [];

  if (year === 2025) {
    feriadosMoviles = FERIADOS_MOVILES_2025;
  } else if (year === 2026) {
    feriadosMoviles = FERIADOS_MOVILES_2026;
  }

  const esFeriadoMovil = feriadosMoviles.some((feriado) => {
    return (
      feriado.getDate() === fecha.getDate() &&
      feriado.getMonth() === fecha.getMonth() &&
      feriado.getFullYear() === fecha.getFullYear()
    );
  });

  return esFeriadoMovil;
}

/**
 * Verifica si una fecha es día hábil (lunes a viernes, no feriado)
 */
export function esDiaHabil(fecha: Date): boolean {
  const diaSemana = fecha.getDay();

  // 0 = Domingo, 6 = Sábado
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }

  // Verificar si es feriado
  if (esFeriado(fecha)) {
    return false;
  }

  return true;
}

/**
 * Calcula la fecha sumando días hábiles a partir de una fecha inicial
 * @param fechaInicio - Fecha de inicio
 * @param diasHabiles - Número de días hábiles a sumar
 * @returns Fecha resultante
 */
export function sumarDiasHabiles(fechaInicio: Date, diasHabiles: number): Date {
  const fecha = new Date(fechaInicio);
  let diasAgregados = 0;

  while (diasAgregados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);

    if (esDiaHabil(fecha)) {
      diasAgregados++;
    }
  }

  return fecha;
}

/**
 * Calcula el número de días hábiles entre dos fechas
 * @param fechaInicio - Fecha inicial
 * @param fechaFin - Fecha final
 * @returns Número de días hábiles
 */
export function contarDiasHabiles(fechaInicio: Date, fechaFin: Date): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  let contador = 0;

  const fechaActual = new Date(inicio);

  while (fechaActual <= fin) {
    if (esDiaHabil(fechaActual)) {
      contador++;
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return contador;
}

/**
 * Calcula días restantes hasta una fecha (solo días hábiles)
 * @param fechaVencimiento - Fecha de vencimiento
 * @returns Número de días hábiles restantes
 */
export function diasHabilesRestantes(fechaVencimiento: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  if (vencimiento < hoy) {
    return 0;
  }

  return contarDiasHabiles(hoy, vencimiento);
}

/**
 * Determina la urgencia de un plazo basado en días restantes
 * @param diasRestantes - Días hábiles restantes
 * @returns Estado de urgencia
 */
export function determinarUrgencia(diasRestantes: number): 'critico' | 'urgente' | 'normal' {
  if (diasRestantes <= 3) return 'critico';
  if (diasRestantes <= 7) return 'urgente';
  return 'normal';
}

/**
 * Formatea días restantes en texto legible
 * @param diasRestantes - Días hábiles restantes
 * @returns Texto formateado
 */
export function formatearDiasRestantes(diasRestantes: number): string {
  if (diasRestantes === 0) return 'Vence hoy';
  if (diasRestantes === 1) return '1 día hábil';
  if (diasRestantes < 0) return 'Vencido';
  return `${diasRestantes} días hábiles`;
}
