import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/sentencias - Obtiene sentencias según rol
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

    let whereClause: any = {};

    if (procesoId) {
      whereClause.procesoId = procesoId;
    }

    // Filtrar por rol
    if (usuario.rol === 'JUEZ') {
      whereClause.juezId = usuario.id;
    }

    const sentencias = await prisma.sentencia.findMany({
      where: whereClause,
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        juez: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sentencias);
  } catch (error) {
    console.error('Error al obtener sentencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener sentencias' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sentencias - Crea una nueva sentencia (borrador)
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

    if (!usuario || usuario.rol !== 'JUEZ') {
      return NextResponse.json(
        { error: 'Solo los jueces pueden crear sentencias' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { procesoId } = body;

    // Validar que el proceso existe y está en estado correcto
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
      },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    if (proceso.estado !== 'SENTENCIA_PENDIENTE') {
      return NextResponse.json(
        { error: 'El proceso no está en estado de sentencia pendiente' },
        { status: 400 }
      );
    }

    if (proceso.juezId !== usuario.id) {
      return NextResponse.json(
        { error: 'No es el juez asignado a este proceso' },
        { status: 403 }
      );
    }

    // Verificar que no exista ya una sentencia
    const sentenciaExistente = await prisma.sentencia.findUnique({
      where: { procesoId },
    });

    if (sentenciaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una sentencia para este proceso' },
        { status: 400 }
      );
    }

    // Crear sentencia en borrador
    const sentencia = await prisma.sentencia.create({
      data: {
        procesoId,
        juezId: usuario.id,
        encabezamiento: '',
        narrativa: '',
        motiva: '',
        resolutiva: '',
        firmaDigital: '',
        hashDocumento: '',
        documentoUrl: '',
        estadoNotificacion: 'PENDIENTE',
      },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        juez: true,
      },
    });

    return NextResponse.json(sentencia);
  } catch (error) {
    console.error('Error al crear sentencia:', error);
    return NextResponse.json(
      { error: 'Error al crear sentencia' },
      { status: 500 }
    );
  }
}
