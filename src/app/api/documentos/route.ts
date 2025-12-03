import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { NotificacionService } from '@/lib/notificaciones/notificacion-service';

/**
 * GET /api/documentos - Lista documentos de un proceso
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
    const tipo = searchParams.get('tipo');
    const limit = parseInt(searchParams.get('limit') || '100');
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

    // Construir filtros
    const where: any = { procesoId };
    if (tipo) {
      where.tipo = tipo;
    }

    // Obtener documentos
    const documentos = await prisma.documento.findMany({
      where,
      include: {
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
        anotaciones: {
          where: {
            eliminado: false,
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                rol: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documentos - Sube un nuevo documento (metadata)
 * El archivo debe subirse primero a Supabase Storage
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
    const {
      procesoId,
      tipo,
      nombre,
      descripcion,
      url,
      tamano,
      mimeType,
      contenidoHash,
    } = body;

    if (!procesoId || !tipo || !nombre || !url) {
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

    // Crear documento
    const documento = await prisma.documento.create({
      data: {
        procesoId,
        tipo,
        nombre,
        descripcion: descripcion || null,
        url,
        tamano: tamano || 0,
        mimeType: mimeType || 'application/octet-stream',
        contenidoHash: contenidoHash || null,
        subidoPorId: usuario.id,
        verificado: false,
      },
      include: {
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
      },
    });

    // Crear log de acceso
    await prisma.logDocumento.create({
      data: {
        documentoId: documento.id,
        usuarioId: usuario.id,
        accion: 'SUBIDA',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    // Notificar a todas las partes del proceso (excepto quien lo subió)
    try {
      await NotificacionService.notificarDocumento(documento.id, procesoId, usuario.id);
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      // No fallar la operación si falla la notificación
    }

    return NextResponse.json(documento);
  } catch (error) {
    console.error('Error al crear documento:', error);
    return NextResponse.json(
      { error: 'Error al crear documento' },
      { status: 500 }
    );
  }
}
