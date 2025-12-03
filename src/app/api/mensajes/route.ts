import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { NotificacionService } from '@/lib/notificaciones/notificacion-service';

/**
 * GET /api/mensajes - Obtiene mensajes de un proceso
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
    const procesoId = searchParams.get('procesoId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!procesoId) {
      return NextResponse.json({ error: 'procesoId requerido' }, { status: 400 });
    }

    // Verificar acceso al proceso
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
      },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso
    const tieneAcceso =
      usuario.rol === 'JUEZ' ||
      usuario.rol === 'SECRETARIO' ||
      proceso.partes.some((p) => p.abogadoId === usuario.id || p.usuarioId === usuario.userId);

    if (!tieneAcceso) {
      return NextResponse.json({ error: 'No tiene acceso a este proceso' }, { status: 403 });
    }

    // Obtener mensajes
    const mensajes = await prisma.mensaje.findMany({
      where: {
        procesoId,
        OR: [
          { remitenteId: usuario.id },
          { destinatarioId: usuario.id },
        ],
      },
      include: {
        remitente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
        destinatario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Marcar mensajes como leídos
    await prisma.mensaje.updateMany({
      where: {
        procesoId,
        destinatarioId: usuario.id,
        leido: false,
      },
      data: {
        leido: true,
      },
    });

    return NextResponse.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mensajes - Envía un nuevo mensaje
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

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { procesoId, destinatarioId, contenido, archivoUrl, archivoNombre } = body;

    if (!procesoId || !destinatarioId || !contenido) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    // Verificar acceso al proceso
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
      },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Crear mensaje
    const mensaje = await prisma.mensaje.create({
      data: {
        procesoId,
        remitenteId: usuario.id,
        destinatarioId,
        contenido,
        archivoUrl: archivoUrl || null,
        archivoNombre: archivoNombre || null,
        leido: false,
      },
      include: {
        remitente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
        destinatario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
      },
    });

    // Enviar notificación al destinatario
    try {
      await NotificacionService.notificarMensaje(mensaje.id, destinatarioId);
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      // No fallar la operación si falla la notificación
    }

    return NextResponse.json(mensaje);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
