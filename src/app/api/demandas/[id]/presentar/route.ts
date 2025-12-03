import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { validarDemandaArt110, DatosDemanda } from '@/lib/demanda/validador-art110';
import { realizarTransicion } from '@/lib/proceso/estado-machine';

/**
 * POST /api/demandas/[id]/presentar - Presenta una demanda oficialmente
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

    if (!usuario || usuario.rol !== 'ABOGADO') {
      return NextResponse.json(
        { error: 'Solo los abogados pueden presentar demandas' },
        { status: 403 }
      );
    }

    // Obtener la demanda
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

    if (demanda.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'La demanda ya fue presentada' },
        { status: 400 }
      );
    }

    // Validar la demanda antes de presentar
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

    const validacion = validarDemandaArt110(datosDemanda);

    if (!validacion.esValida) {
      return NextResponse.json(
        {
          error: 'La demanda no cumple con los requisitos del Art. 110',
          validacion,
        },
        { status: 400 }
      );
    }

    // Actualizar estado de la demanda
    const demandaActualizada = await prisma.demanda.update({
      where: { id: params.id },
      data: {
        estado: 'PRESENTADA',
      },
    });

    // Cambiar estado del proceso a PRESENTADO
    await realizarTransicion(
      demanda.procesoId,
      'PRESENTADO',
      usuario.id,
      usuario.rol
    );

    // Crear notificación para el secretario
    const secretarios = await prisma.usuario.findMany({
      where: {
        rol: 'SECRETARIO',
        juzgado: demanda.proceso.juzgado,
      },
    });

    for (const secretario of secretarios) {
      await prisma.notificacionInterna.create({
        data: {
          usuarioId: secretario.id,
          procesoId: demanda.procesoId,
          tipo: 'DEMANDA',
          titulo: 'Nueva demanda presentada',
          mensaje: `Se ha presentado una nueva demanda en el proceso ${demanda.proceso.nurej}`,
          accionUrl: `/secretario/demandas/${demanda.id}`,
          accionTexto: 'Revisar demanda',
        },
      });
    }

    return NextResponse.json({
      success: true,
      demanda: demandaActualizada,
      mensaje: 'Demanda presentada exitosamente',
    });
  } catch (error) {
    console.error('Error al presentar demanda:', error);
    return NextResponse.json(
      { error: 'Error al presentar demanda' },
      { status: 500 }
    );
  }
}
