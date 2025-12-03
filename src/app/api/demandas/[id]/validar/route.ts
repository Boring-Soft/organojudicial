import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validarDemandaArt110, DatosDemanda } from '@/lib/demanda/validador-art110';

/**
 * POST /api/demandas/[id]/validar - Valida una demanda según Art. 110
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener la demanda con todas sus relaciones
    const demanda = await prisma.demanda.findUnique({
      where: { id: params.id },
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

    if (!demanda) {
      return NextResponse.json(
        { error: 'Demanda no encontrada' },
        { status: 404 }
      );
    }

    // Extraer datos para validación
    const actor = demanda.proceso.partes.find(p => p.tipo === 'ACTOR');
    const demandado = demanda.proceso.partes.find(p => p.tipo === 'DEMANDADO');
    const abogado = actor?.abogado;

    const datosDemanda: DatosDemanda = {
      demandante: {
        ci: actor?.ci,
        nombres: actor?.nombres,
        apellidos: actor?.apellidos,
        edad: actor?.edad || undefined,
        estadoCivil: actor?.estadoCivil || undefined,
        profesion: actor?.profesion || undefined,
        domicilioReal: actor?.domicilioReal || undefined,
        domicilioProcesal: actor?.domicilioProcesal || undefined,
      },
      demandado: {
        ci: demandado?.ci,
        nombres: demandado?.nombres,
        apellidos: demandado?.apellidos,
        domicilioReal: demandado?.domicilioReal || undefined,
      },
      abogado: {
        nombres: abogado?.nombres,
        registro: abogado?.registroAbogado || undefined,
      },
      designacionJuez: demanda.designacionJuez,
      objetoDemanda: demanda.objetoDemanda,
      materia: demanda.proceso.materia,
      valor: demanda.valor ? Number(demanda.valor) : undefined,
      hechos: demanda.hechos,
      derecho: demanda.derecho,
      petitorio: demanda.petitorio,
      ofrecimientoPrueba: demanda.ofrecimientoPrueba,
      anexos: (demanda.anexos as any[]) || [],
    };

    // Validar la demanda
    const resultado = validarDemandaArt110(datosDemanda);

    // Guardar resultado de validación en la demanda
    if (!resultado.esValida) {
      await prisma.demanda.update({
        where: { id: params.id },
        data: {
          observaciones: JSON.stringify(resultado.observaciones),
        },
      });
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al validar demanda:', error);
    return NextResponse.json(
      { error: 'Error al validar demanda' },
      { status: 500 }
    );
  }
}
