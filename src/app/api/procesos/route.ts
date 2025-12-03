import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generarNUREJ } from '@/lib/utils/nurej-generator';
import { getUser } from '@/lib/auth';

/**
 * GET /api/procesos - Obtiene lista de procesos
 * Query params: estado, juezId, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const juezId = searchParams.get('juezId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (juezId) {
      where.juezId = juezId;
    }

    // Filtrar según rol del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si es abogado, mostrar solo sus procesos
    if (usuario.rol === 'ABOGADO') {
      where.partes = {
        some: {
          abogadoId: usuario.id,
        },
      };
    }

    // Si es juez, mostrar solo procesos asignados
    if (usuario.rol === 'JUEZ') {
      where.juezId = usuario.id;
    }

    // Si es secretario, mostrar procesos del mismo juzgado
    if (usuario.rol === 'SECRETARIO') {
      where.juzgado = usuario.juzgado;
    }

    const [procesos, total] = await Promise.all([
      prisma.proceso.findMany({
        where,
        include: {
          juez: true,
          demanda: true,
          partes: {
            include: {
              abogado: true,
            },
          },
          plazos: {
            where: { estado: 'ACTIVO' },
            orderBy: { fechaVencimiento: 'asc' },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.proceso.count({ where }),
    ]);

    return NextResponse.json({
      procesos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener procesos:', error);
    return NextResponse.json(
      { error: 'Error al obtener procesos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/procesos - Crea un nuevo proceso
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario || usuario.rol !== 'ABOGADO') {
      return NextResponse.json(
        { error: 'Solo los abogados pueden crear procesos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tipo, materia, juzgado, juezId, objetoDemanda } = body;

    // Validar datos requeridos
    if (!tipo || !materia || !juzgado || !juezId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Generar NUREJ único
    const nurej = await generarNUREJ(materia, juzgado);

    // Crear proceso
    const proceso = await prisma.proceso.create({
      data: {
        nurej,
        tipo,
        materia,
        juzgado,
        juezId,
        objetoDemanda,
        estado: 'BORRADOR',
      },
      include: {
        juez: true,
      },
    });

    return NextResponse.json(proceso, { status: 201 });
  } catch (error) {
    console.error('Error al crear proceso:', error);
    return NextResponse.json(
      { error: 'Error al crear proceso' },
      { status: 500 }
    );
  }
}
