import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/resoluciones - Obtiene resoluciones según rol
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

    let whereClause: any = {};

    // Filtrar por proceso
    if (procesoId) {
      whereClause.procesoId = procesoId;
    }

    // Filtrar por tipo
    if (tipo) {
      whereClause.tipo = tipo;
    }

    // Filtrar por rol
    if (usuario.rol === 'JUEZ') {
      // Ver resoluciones de sus procesos
      whereClause.proceso = {
        juezId: usuario.id,
      };
    } else if (usuario.rol === 'SECRETARIO') {
      // Ver resoluciones del juzgado asignado
      whereClause.proceso = {
        juzgado: usuario.juzgado,
      };
    } else if (usuario.rol === 'ABOGADO') {
      // Ver resoluciones de procesos donde representa
      whereClause.proceso = {
        partes: {
          some: {
            abogadoId: usuario.id,
          },
        },
      };
    }

    const resoluciones = await prisma.resolucion.findMany({
      where: whereClause,
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
      orderBy: {
        fechaEmision: 'desc',
      },
    });

    return NextResponse.json(resoluciones);
  } catch (error) {
    console.error('Error al obtener resoluciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener resoluciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resoluciones - Crea una nueva resolución
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

    if (!usuario || (usuario.rol !== 'JUEZ' && usuario.rol !== 'SECRETARIO')) {
      return NextResponse.json(
        { error: 'Solo jueces y secretarios pueden crear resoluciones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { procesoId, tipo, contenido } = body;

    if (!procesoId || !tipo || !contenido) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el proceso existe
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Validar que el juez está asignado al proceso
    if (usuario.rol === 'JUEZ' && proceso.juezId !== usuario.id) {
      return NextResponse.json(
        { error: 'No tiene permisos para este proceso' },
        { status: 403 }
      );
    }

    // Crear resolución
    const resolucion = await prisma.resolucion.create({
      data: {
        procesoId,
        tipo,
        contenido,
        firmadoPorId: usuario.id,
      },
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
    });

    return NextResponse.json(resolucion, { status: 201 });
  } catch (error) {
    console.error('Error al crear resolución:', error);
    return NextResponse.json(
      { error: 'Error al crear resolución' },
      { status: 500 }
    );
  }
}
