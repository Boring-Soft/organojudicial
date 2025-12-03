import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import {
  generarDecretoAdmision,
  generarDecretoObservacion,
  generarDecretoRechazo,
} from '@/lib/decretos/generador-decretos';

/**
 * POST /api/demandas/[id]/decreto - Genera un decreto judicial
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario || (usuario.rol !== 'SECRETARIO' && usuario.rol !== 'JUEZ')) {
      return NextResponse.json(
        { error: 'Solo secretarios y jueces pueden generar decretos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tipoDecreto, observaciones } = body;

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
            juez: true,
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

    const actor = demanda.proceso.partes.find(p => p.tipo === 'ACTOR');
    const demandado = demanda.proceso.partes.find(p => p.tipo === 'DEMANDADO');

    if (!actor || !demandado || !actor.abogado) {
      return NextResponse.json(
        { error: 'Faltan datos de las partes' },
        { status: 400 }
      );
    }

    const datosDecreto = {
      nurej: demanda.proceso.nurej,
      juez: `${demanda.proceso.juez.nombres} ${demanda.proceso.juez.apellidos}`,
      juzgado: demanda.proceso.juzgado,
      materia: demanda.proceso.materia,
      actor: {
        nombres: actor.nombres,
        apellidos: actor.apellidos,
        ci: actor.ci || '',
      },
      demandado: {
        nombres: demandado.nombres,
        apellidos: demandado.apellidos,
        ci: demandado.ci || '',
      },
      abogado: {
        nombres: actor.abogado.nombres,
        apellidos: actor.abogado.apellidos,
        registro: actor.abogado.registroAbogado || '',
      },
      objetoDemanda: demanda.objetoDemanda,
      valor: Number(demanda.valor),
      fecha: new Date(),
      observaciones,
    };

    let decretoTexto = '';

    switch (tipoDecreto) {
      case 'ADMISION':
        decretoTexto = generarDecretoAdmision(datosDecreto);
        break;
      case 'OBSERVACION':
        decretoTexto = generarDecretoObservacion(datosDecreto);
        break;
      case 'RECHAZO':
        decretoTexto = generarDecretoRechazo(datosDecreto);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de decreto inválido' },
          { status: 400 }
        );
    }

    // Guardar el decreto como resolución
    const resolucion = await prisma.resolucion.create({
      data: {
        procesoId: demanda.procesoId,
        tipo: 'PROVIDENCIA',
        contenido: decretoTexto,
        firmadoPorId: demanda.proceso.juezId,
      },
    });

    return NextResponse.json({
      decreto: decretoTexto,
      resolucionId: resolucion.id,
    });
  } catch (error) {
    console.error('Error al generar decreto:', error);
    return NextResponse.json(
      { error: 'Error al generar decreto' },
      { status: 500 }
    );
  }
}
