import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/notificaciones - Obtiene notificaciones del usuario
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const leidas = searchParams.get('leidas');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtro
    const where: any = { usuarioId: usuario.id };
    if (leidas === 'false') {
      where.leida = false;
    } else if (leidas === 'true') {
      where.leida = true;
    }

    // Obtener notificaciones
    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Contar no leídas
    const noLeidas = await prisma.notificacion.count({
      where: {
        usuarioId: usuario.id,
        leida: false,
      },
    });

    return NextResponse.json({
      notificaciones,
      noLeidas,
      total: notificaciones.length,
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notificaciones - Crea una nueva notificación
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { usuarioId, tipo, titulo, mensaje, procesoId, url } = body;

    if (!usuarioId || !tipo || !titulo || !mensaje) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    const notificacion = await prisma.notificacion.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensaje,
        procesoId: procesoId || null,
        url: url || null,
        leida: false,
      },
    });

    return NextResponse.json(notificacion);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return NextResponse.json(
      { error: 'Error al crear notificación' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notificaciones - Marcar todas como leídas
 */
export async function PATCH(request: NextRequest) {
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

    // Marcar todas como leídas
    await prisma.notificacion.updateMany({
      where: {
        usuarioId: usuario.id,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificaciones' },
      { status: 500 }
    );
  }
}
