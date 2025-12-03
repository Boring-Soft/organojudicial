import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/citaciones/[id] - Obtiene una citación específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const citacion = await prisma.citacion.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        secretario: true,
      },
    });

    if (!citacion) {
      return NextResponse.json(
        { error: 'Citación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(citacion);
  } catch (error) {
    console.error('Error al obtener citación:', error);
    return NextResponse.json(
      { error: 'Error al obtener citación' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/citaciones/[id] - Actualiza una citación
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario || usuario.rol !== 'SECRETARIO') {
      return NextResponse.json(
        { error: 'Solo los secretarios pueden actualizar citaciones' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const citacionActualizada = await prisma.citacion.update({
      where: { id: params.id },
      data: body,
      include: {
        proceso: true,
      },
    });

    return NextResponse.json(citacionActualizada);
  } catch (error) {
    console.error('Error al actualizar citación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar citación' },
      { status: 500 }
    );
  }
}
