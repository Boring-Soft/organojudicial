/**
 * Generador de NUREJ (Número Único de Registro Judicial)
 * Formato: AAAA-JJJJJ-NNNN-CC
 * - AAAA: Año
 * - JJJJJ: Código de juzgado
 * - NNNN: Número secuencial
 * - CC: Dígito verificador
 */

import prisma from '@/lib/prisma';

/**
 * Genera un código de juzgado de 5 dígitos
 * Basado en materia y departamento
 */
function generarCodigoJuzgado(materia: string, juzgado: string): string {
  // Mapeo de materias a códigos
  const materiaMap: Record<string, string> = {
    'CIVIL': '01',
    'PENAL': '02',
    'LABORAL': '03',
    'FAMILIAR': '04',
    'ADMINISTRATIVO': '05',
    'TRIBUTARIO': '06',
    'COMERCIAL': '07',
  };

  // Mapeo de departamentos a códigos
  const departamentoMap: Record<string, string> = {
    'LA PAZ': '001',
    'COCHABAMBA': '002',
    'SANTA CRUZ': '003',
    'ORURO': '004',
    'POTOSÍ': '005',
    'CHUQUISACA': '006',
    'TARIJA': '007',
    'BENI': '008',
    'PANDO': '009',
  };

  const codigoMateria = materiaMap[materia.toUpperCase()] || '99';

  // Extraer departamento del nombre del juzgado
  let codigoDepartamento = '999';
  for (const [dept, codigo] of Object.entries(departamentoMap)) {
    if (juzgado.toUpperCase().includes(dept)) {
      codigoDepartamento = codigo;
      break;
    }
  }

  return `${codigoMateria}${codigoDepartamento}`;
}

/**
 * Calcula dígito verificador usando algoritmo módulo 11
 */
function calcularDigitoVerificador(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  let suma = 0;
  let multiplicador = 2;

  // Recorrer de derecha a izquierda
  for (let i = digitos.length - 1; i >= 0; i--) {
    suma += parseInt(digitos[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 1 : 11 - resto;

  return digitoVerificador.toString().padStart(2, '0');
}

/**
 * Genera un NUREJ único para un proceso
 */
export async function generarNUREJ(
  materia: string,
  juzgado: string
): Promise<string> {
  const year = new Date().getFullYear();
  const codigoJuzgado = generarCodigoJuzgado(materia, juzgado);

  // Obtener el último número secuencial del año actual para este juzgado
  const ultimoProceso = await prisma.proceso.findFirst({
    where: {
      nurej: {
        startsWith: `${year}-${codigoJuzgado}`,
      },
    },
    orderBy: {
      nurej: 'desc',
    },
  });

  let numeroSecuencial = 1;

  if (ultimoProceso) {
    // Extraer el número secuencial del último NUREJ
    const partes = ultimoProceso.nurej.split('-');
    if (partes.length >= 3) {
      numeroSecuencial = parseInt(partes[2]) + 1;
    }
  }

  const secuencialStr = numeroSecuencial.toString().padStart(4, '0');

  // Generar NUREJ sin dígito verificador
  const nurejBase = `${year}-${codigoJuzgado}-${secuencialStr}`;

  // Calcular dígito verificador
  const digitoVerificador = calcularDigitoVerificador(nurejBase);

  // NUREJ completo
  const nurej = `${nurejBase}-${digitoVerificador}`;

  return nurej;
}

/**
 * Valida un NUREJ
 */
export function validarNUREJ(nurej: string): boolean {
  // Formato: AAAA-JJJJJ-NNNN-CC
  const regex = /^\d{4}-\d{5}-\d{4}-\d{2}$/;

  if (!regex.test(nurej)) {
    return false;
  }

  const partes = nurej.split('-');
  const nurejBase = `${partes[0]}-${partes[1]}-${partes[2]}`;
  const digitoVerificadorRecibido = partes[3];
  const digitoVerificadorCalculado = calcularDigitoVerificador(nurejBase);

  return digitoVerificadorRecibido === digitoVerificadorCalculado;
}

/**
 * Extrae información de un NUREJ
 */
export function parsearNUREJ(nurej: string): {
  year: number;
  codigoJuzgado: string;
  numeroSecuencial: number;
  digitoVerificador: string;
} | null {
  if (!validarNUREJ(nurej)) {
    return null;
  }

  const partes = nurej.split('-');

  return {
    year: parseInt(partes[0]),
    codigoJuzgado: partes[1],
    numeroSecuencial: parseInt(partes[2]),
    digitoVerificador: partes[3],
  };
}
