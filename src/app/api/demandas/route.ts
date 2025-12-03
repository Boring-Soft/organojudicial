import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { validarDemandaArt110 } from '@/lib/demanda/validador-art110';

/**
 * POST /api/demandas - Crea una nueva demanda para un proceso
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
        { error: 'Solo los abogados pueden crear demandas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      procesoId,
      designacionJuez,
      objetoDemanda,
      hechos,
      derecho,
      petitorio,
      valor,
      ofrecimientoPrueba,
      anexos,
    } = body;

    // Validar que el proceso existe y está en estado BORRADOR
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: {
          include: {
            abogado: true,
          },
        },
      },
    });

    if (!proceso) {
      return NextResponse.json(
        { error: 'Proceso no encontrado' },
        { status: 404 }
      );
    }

    if (proceso.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'Solo se puede crear demanda en estado BORRADOR' },
        { status: 400 }
      );
    }

    // Verificar que el abogado es parte del proceso
    const esAbogadoDelProceso = proceso.partes.some(
      (parte) => parte.abogadoId === usuario.id
    );

    if (!esAbogadoDelProceso) {
      return NextResponse.json(
        { error: 'No es el abogado asignado a este proceso' },
        { status: 403 }
      );
    }

    // Crear la demanda
    const demanda = await prisma.demanda.create({
      data: {
        procesoId,
        designacionJuez,
        objetoDemanda,
        hechos,
        derecho,
        petitorio,
        valor,
        ofrecimientoPrueba,
        anexos: anexos || [],
        estado: 'BORRADOR',
      },
    });

    return NextResponse.json(demanda, { status: 201 });
  } catch (error) {
    console.error('Error al crear demanda:', error);
    return NextResponse.json(
      { error: 'Error al crear demanda' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/demandas - Obtiene demandas (filtrado por rol)
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    // Filtrar según rol
    if (usuario.rol === 'ABOGADO') {
      // Obtener demandas de procesos donde es abogado
      where.proceso = {
        partes: {
          some: {
            abogadoId: usuario.id,
          },
        },
      };
    } else if (usuario.rol === 'SECRETARIO' || usuario.rol === 'JUEZ') {
      // Secretario y juez ven demandas de su juzgado
      where.proceso = {
        juzgado: usuario.juzgado,
      };
    }

    const demandas = await prisma.demanda.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(demandas);
  } catch (error) {
    console.error('Error al obtener demandas:', error);
    return NextResponse.json(
      { error: 'Error al obtener demandas' },
      { status: 500 }
    );
  }
}
