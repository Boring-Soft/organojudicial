import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/citaciones/confirmar/[token] - Confirma recepción de citación digital
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const { ci } = body;

    // Buscar citación por token en los intentos
    const citaciones = await prisma.citacion.findMany({
      where: {
        metodo: 'EMAIL',
        estado: { in: ['PENDIENTE', 'EN_PROCESO'] },
      },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
      },
    });

    // Buscar la citación que contiene este token en sus intentos
    let citacionEncontrada = null;
    let intentoIndex = -1;

    for (const citacion of citaciones) {
      const intentos = (citacion.intentos as any[]) || [];
      const index = intentos.findIndex((intento: any) => intento.token === params.token);
      if (index !== -1) {
        citacionEncontrada = citacion;
        intentoIndex = index;
        break;
      }
    }

    if (!citacionEncontrada) {
      return NextResponse.json(
        { error: 'Token de citación inválido o expirado' },
        { status: 404 }
      );
    }

    // Verificar CI de la parte
    const parteDemandada = citacionEncontrada.proceso.partes.find(
      (p) => p.id === citacionEncontrada!.parteId
    );

    if (!parteDemandada || parteDemandada.ci !== ci) {
      return NextResponse.json(
        { error: 'CI no coincide con la parte citada' },
        { status: 403 }
      );
    }

    // Registrar la confirmación
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const intentos = (citacionEncontrada.intentos as any[]) || [];
    intentos[intentoIndex] = {
      ...intentos[intentoIndex],
      confirmado: true,
      fechaConfirmacion: new Date().toISOString(),
      ip,
      userAgent,
    };

    // Actualizar citación como exitosa
    const citacionActualizada = await prisma.citacion.update({
      where: { id: citacionEncontrada.id },
      data: {
        intentos,
        estado: 'EXITOSA',
        fechaValidacion: new Date(),
      },
    });

    // Cambiar estado del proceso a CONTESTACION_PENDIENTE
    await prisma.proceso.update({
      where: { id: citacionEncontrada.procesoId },
      data: { estado: 'CONTESTACION_PENDIENTE' },
    });

    // Crear plazo de contestación
    const fechaInicio = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    await prisma.plazo.create({
      data: {
        procesoId: citacionEncontrada.procesoId,
        tipo: 'CONTESTACION',
        descripcion: 'Plazo para contestar la demanda',
        articulo: 'Art. 330',
        fechaInicio,
        fechaVencimiento,
        diasPlazo: 30,
        estado: 'ACTIVO',
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Citación confirmada exitosamente',
      proceso: {
        nurej: citacionEncontrada.proceso.nurej,
        plazoContestacion: '30 días hábiles',
        fechaVencimiento: fechaVencimiento.toLocaleDateString('es-BO'),
      },
    });
  } catch (error) {
    console.error('Error al confirmar citación:', error);
    return NextResponse.json(
      { error: 'Error al confirmar citación' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/citaciones/confirmar/[token] - Obtiene información de la citación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Buscar citación por token
    const citaciones = await prisma.citacion.findMany({
      where: {
        metodo: 'EMAIL',
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

    let citacionEncontrada = null;

    for (const citacion of citaciones) {
      const intentos = (citacion.intentos as any[]) || [];
      const tieneToken = intentos.some((intento: any) => intento.token === params.token);
      if (tieneToken) {
        citacionEncontrada = citacion;
        break;
      }
    }

    if (!citacionEncontrada) {
      return NextResponse.json(
        { error: 'Token de citación inválido' },
        { status: 404 }
      );
    }

    const parteDemandada = citacionEncontrada.proceso.partes.find(
      (p) => p.id === citacionEncontrada!.parteId
    );

    return NextResponse.json({
      nurej: citacionEncontrada.proceso.nurej,
      juzgado: citacionEncontrada.proceso.juzgado,
      juez: `${citacionEncontrada.proceso.juez.nombres} ${citacionEncontrada.proceso.juez.apellidos}`,
      parte: {
        nombres: parteDemandada?.nombres,
        apellidos: parteDemandada?.apellidos,
      },
      tipo: citacionEncontrada.tipo,
    });
  } catch (error) {
    console.error('Error al obtener información de citación:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de citación' },
      { status: 500 }
    );
  }
}
