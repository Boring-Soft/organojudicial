import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/notificaciones/[id] - Marca una notificación como leída
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const notificacion = await prisma.notificacion.findUnique({
      where: { id: params.id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la notificación pertenezca al usuario
    if (notificacion.usuarioId !== usuario.id) {
      return NextResponse.json(
        { error: 'No tiene acceso a esta notificación' },
        { status: 403 }
      );
    }

    // Marcar como leída
    const notificacionActualizada = await prisma.notificacion.update({
      where: { id: params.id },
      data: { leida: true },
    });

    return NextResponse.json(notificacionActualizada);
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificación' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notificaciones/[id] - Elimina una notificación
 */
export async function DELETE(
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const notificacion = await prisma.notificacion.findUnique({
      where: { id: params.id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la notificación pertenezca al usuario
    if (notificacion.usuarioId !== usuario.id) {
      return NextResponse.json(
        { error: 'No tiene acceso a esta notificación' },
        { status: 403 }
      );
    }

    // Eliminar notificación
    await prisma.notificacion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar notificación' },
      { status: 500 }
    );
  }
}
