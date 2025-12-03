import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/citaciones - Obtiene citaciones
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
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
    const procesoId = searchParams.get('procesoId');
    const estado = searchParams.get('estado');

    const where: any = {};

    if (procesoId) {
      where.procesoId = procesoId;
    }

    if (estado) {
      where.estado = estado;
    }

    // Filtrar según rol
    if (usuario.rol === 'SECRETARIO') {
      where.proceso = {
        juzgado: usuario.juzgado,
      };
    }

    const citaciones = await prisma.citacion.findMany({
      where,
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        secretario: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(citaciones);
  } catch (error) {
    console.error('Error al obtener citaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener citaciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/citaciones - Crea una nueva citación
 */
export async function POST(request: NextRequest) {
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
        { error: 'Solo los secretarios pueden crear citaciones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { procesoId, parteId, tipo, metodo, domicilio, email } = body;

    // Validar datos requeridos
    if (!procesoId || !parteId || !tipo || !metodo) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Generar token único para citación digital
    const token = metodo === 'EMAIL' ? generateCitacionToken() : null;

    // Crear citación
    const citacion = await prisma.citacion.create({
      data: {
        procesoId,
        parteId,
        tipo,
        metodo,
        secretarioId: usuario.id,
        estado: 'PENDIENTE',
        intentos: [],
      },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
      },
    });

    // Si es citación por email, enviar correo
    if (metodo === 'EMAIL' && email && token) {
      // Aquí iría la lógica de envío de email
      // await enviarEmailCitacion(email, citacion, token);
    }

    // Cambiar estado del proceso a CITACION_PENDIENTE
    await prisma.proceso.update({
      where: { id: procesoId },
      data: { estado: 'CITACION_PENDIENTE' },
    });

    // Crear plazo de citación (5 días para realizar la citación)
    const fechaInicio = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);

    await prisma.plazo.create({
      data: {
        procesoId,
        tipo: 'CITACION',
        descripcion: `Plazo para realizar citación de la parte demandada`,
        articulo: 'Art. 103',
        fechaInicio,
        fechaVencimiento,
        diasPlazo: 5,
        estado: 'ACTIVO',
      },
    });

    return NextResponse.json(citacion, { status: 201 });
  } catch (error) {
    console.error('Error al crear citación:', error);
    return NextResponse.json(
      { error: 'Error al crear citación' },
      { status: 500 }
    );
  }
}

/**
 * Genera un token único para citación digital
 */
function generateCitacionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}
