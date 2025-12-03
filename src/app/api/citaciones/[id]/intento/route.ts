import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/citaciones/[id]/intento - Registra un intento de citación
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Solo los secretarios pueden registrar intentos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { metodo, resultado, descripcion, evidenciaUrl, geolocalizacion } = body;

    // Obtener la citación actual
    const citacion = await prisma.citacion.findUnique({
      where: { id: params.id },
      include: { proceso: true },
    });

    if (!citacion) {
      return NextResponse.json(
        { error: 'Citación no encontrada' },
        { status: 404 }
      );
    }

    // Crear el intento
    const nuevoIntento = {
      fecha: new Date().toISOString(),
      metodo,
      resultado,
      descripcion,
      evidenciaUrl: evidenciaUrl || null,
      geolocalizacion: geolocalizacion || null,
      secretarioId: usuario.id,
    };

    // Obtener intentos actuales
    const intentosActuales = (citacion.intentos as any[]) || [];

    // Agregar el nuevo intento
    const nuevosIntentos = [...intentosActuales, nuevoIntento];

    // Determinar el nuevo estado de la citación
    let nuevoEstado = citacion.estado;
    if (resultado === 'EXITOSO') {
      nuevoEstado = 'EXITOSA';
    } else if (intentosActuales.length >= 2 && resultado === 'FALLIDO') {
      // Después de 3 intentos fallidos, pasar a citación por edicto
      nuevoEstado = 'FALLIDA';
    }

    // Actualizar la citación
    const citacionActualizada = await prisma.citacion.update({
      where: { id: params.id },
      data: {
        intentos: nuevosIntentos,
        estado: nuevoEstado,
        fechaValidacion: resultado === 'EXITOSO' ? new Date() : null,
      },
    });

    // Si la citación fue exitosa, cambiar estado del proceso
    if (resultado === 'EXITOSO') {
      await prisma.proceso.update({
        where: { id: citacion.procesoId },
        data: { estado: 'CONTESTACION_PENDIENTE' },
      });

      // Crear plazo de contestación (30 días)
      const fechaInicio = new Date();
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

      await prisma.plazo.create({
        data: {
          procesoId: citacion.procesoId,
          tipo: 'CONTESTACION',
          descripcion: 'Plazo para contestar la demanda',
          articulo: 'Art. 330',
          fechaInicio,
          fechaVencimiento,
          diasPlazo: 30,
          estado: 'ACTIVO',
        },
      });

      // Notificar al demandado o su abogado
      // await crearNotificacionContestacion(citacion.procesoId);
    }

    return NextResponse.json({
      citacion: citacionActualizada,
      intento: nuevoIntento,
    });
  } catch (error) {
    console.error('Error al registrar intento:', error);
    return NextResponse.json(
      { error: 'Error al registrar intento de citación' },
      { status: 500 }
    );
  }
}
