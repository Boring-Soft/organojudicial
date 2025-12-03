import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { sumarDiasHabiles } from '@/lib/utils/dias-habiles';

/**
 * POST /api/audiencias/[id]/finalizar - Finaliza una audiencia
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario || usuario.rol !== 'JUEZ') {
      return NextResponse.json(
        { error: 'Solo el juez puede finalizar la audiencia' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { grabacionUrl, audioUrl } = body;

    const audiencia = await prisma.audiencia.findUnique({
      where: { id: params.id },
      include: {
        proceso: true,
      },
    });

    if (!audiencia) {
      return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 });
    }

    if (audiencia.juezId !== usuario.id) {
      return NextResponse.json(
        { error: 'Solo el juez asignado puede finalizar esta audiencia' },
        { status: 403 }
      );
    }

    if (audiencia.estado !== 'EN_CURSO') {
      return NextResponse.json(
        { error: 'La audiencia no está en curso' },
        { status: 400 }
      );
    }

    // Finalizar audiencia y crear plazo de sentencia si es necesario
    const resultado = await prisma.$transaction(async (tx) => {
      const audienciaFinalizada = await tx.audiencia.update({
        where: { id: params.id },
        data: {
          estado: 'FINALIZADA',
          grabacionUrl: grabacionUrl || null,
          audioUrl: audioUrl || null,
        },
      });

      // Si es audiencia complementaria o no hay más audiencias pendientes, crear plazo de sentencia
      if (audiencia.tipo === 'COMPLEMENTARIA') {
        // Verificar que no haya más audiencias programadas
        const audienciasPendientes = await tx.audiencia.count({
          where: {
            procesoId: audiencia.procesoId,
            estado: {
              in: ['PROGRAMADA', 'EN_CURSO'],
            },
          },
        });

        if (audienciasPendientes === 0) {
          // Crear plazo de sentencia (15 días)
          const fechaInicio = new Date();
          const fechaVencimiento = sumarDiasHabiles(fechaInicio, 15);

          await tx.plazo.create({
            data: {
              procesoId: audiencia.procesoId,
              tipo: 'SENTENCIA',
              descripcion: 'Plazo para emitir sentencia',
              articulo: 'Art. 330',
              fechaInicio,
              fechaVencimiento,
              diasPlazo: 15,
            },
          });

          // Actualizar estado del proceso
          await tx.proceso.update({
            where: { id: audiencia.procesoId },
            data: { estado: 'SENTENCIA_PENDIENTE' },
          });
        }
      }

      return audienciaFinalizada;
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al finalizar audiencia:', error);
    return NextResponse.json(
      { error: 'Error al finalizar audiencia' },
      { status: 500 }
    );
  }
}
