import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { validarDemandaArt110, DatosDemanda } from '@/lib/demanda/validador-art110';

/**
 * GET /api/demandas/[id] - Obtiene una demanda específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

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

    return NextResponse.json(demanda);
  } catch (error) {
    console.error('Error al obtener demanda:', error);
    return NextResponse.json(
      { error: 'Error al obtener demanda' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/demandas/[id] - Actualiza una demanda
 */
export async function PATCH(
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();

    // Verificar que la demanda existe
    const demandaExistente = await prisma.demanda.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
      },
    });

    if (!demandaExistente) {
      return NextResponse.json(
        { error: 'Demanda no encontrada' },
        { status: 404 }
      );
    }

    // Solo abogados pueden editar demandas en estado BORRADOR
    if (usuario.rol === 'ABOGADO' && demandaExistente.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'Solo se pueden editar demandas en estado BORRADOR' },
        { status: 400 }
      );
    }

    // Actualizar la demanda
    const demandaActualizada = await prisma.demanda.update({
      where: { id: params.id },
      data: body,
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
    });

    return NextResponse.json(demandaActualizada);
  } catch (error) {
    console.error('Error al actualizar demanda:', error);
    return NextResponse.json(
      { error: 'Error al actualizar demanda' },
      { status: 500 }
    );
  }
}
