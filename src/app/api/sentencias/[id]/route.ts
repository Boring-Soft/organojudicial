import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/sentencias/[id] - Obtiene una sentencia específica
 */
export async function GET(
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

    const sentencia = await prisma.sentencia.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        juez: true,
      },
    });

    if (!sentencia) {
      return NextResponse.json({ error: 'Sentencia no encontrada' }, { status: 404 });
    }

    return NextResponse.json(sentencia);
  } catch (error) {
    console.error('Error al obtener sentencia:', error);
    return NextResponse.json(
      { error: 'Error al obtener sentencia' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sentencias/[id] - Actualiza una sentencia (borrador)
 */
export async function PATCH(
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
        { error: 'Solo los jueces pueden editar sentencias' },
        { status: 403 }
      );
    }

    const sentencia = await prisma.sentencia.findUnique({
      where: { id: params.id },
    });

    if (!sentencia) {
      return NextResponse.json({ error: 'Sentencia no encontrada' }, { status: 404 });
    }

    if (sentencia.juezId !== usuario.id) {
      return NextResponse.json(
        { error: 'No es el juez autor de esta sentencia' },
        { status: 403 }
      );
    }

    // Si ya fue notificada, no permitir edición
    if (sentencia.estadoNotificacion !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'No se puede editar una sentencia ya notificada' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const sentenciaActualizada = await prisma.sentencia.update({
      where: { id: params.id },
      data: body,
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        juez: true,
      },
    });

    return NextResponse.json(sentenciaActualizada);
  } catch (error) {
    console.error('Error al actualizar sentencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar sentencia' },
      { status: 500 }
    );
  }
}
