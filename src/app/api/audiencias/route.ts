import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { sumarDiasHabiles } from '@/lib/utils/dias-habiles';

/**
 * GET /api/audiencias - Obtiene audiencias según rol
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
    const fecha = searchParams.get('fecha');
    const estado = searchParams.get('estado');

    let whereClause: any = {};

    // Filtrar por proceso
    if (procesoId) {
      whereClause.procesoId = procesoId;
    }

    // Filtrar por fecha
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      whereClause.fecha = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    }

    // Filtrar por estado
    if (estado) {
      whereClause.estado = estado;
    }

    // Filtrar por rol
    if (usuario.rol === 'JUEZ') {
      whereClause.juezId = usuario.id;
    } else if (usuario.rol === 'SECRETARIO') {
      // Ver audiencias del juzgado asignado
      whereClause.proceso = {
        juzgado: usuario.juzgado,
      };
    }

    const audiencias = await prisma.audiencia.findMany({
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
        fecha: 'asc',
      },
    });

    return NextResponse.json(audiencias);
  } catch (error) {
    console.error('Error al obtener audiencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener audiencias' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audiencias - Crea una nueva audiencia
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

    if (!usuario || (usuario.rol !== 'SECRETARIO' && usuario.rol !== 'JUEZ')) {
      return NextResponse.json(
        { error: 'No tiene permisos para crear audiencias' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { procesoId, tipo, fecha, duracion, juezId } = body;

    // Validar que el proceso existe
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
      },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    // Validar conflictos de horario
    const fechaAudiencia = new Date(fecha);
    const fechaInicio = new Date(fechaAudiencia);
    fechaInicio.setHours(fechaAudiencia.getHours() - 1);
    const fechaFin = new Date(fechaAudiencia);
    fechaFin.setHours(fechaAudiencia.getHours() + (duracion || 60) / 60 + 1);

    const conflictos = await prisma.audiencia.findMany({
      where: {
        juezId: juezId || proceso.juezId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          in: ['PROGRAMADA', 'EN_CURSO'],
        },
      },
    });

    if (conflictos.length > 0) {
      return NextResponse.json(
        { error: 'El juez tiene otra audiencia programada en ese horario' },
        { status: 400 }
      );
    }

    // Generar sala virtual (Jitsi)
    const salaId = `audiencia-${procesoId}-${Date.now()}`;
    const salaUrl = `https://meet.jit.si/${salaId}`;

    // Crear audiencia
    const audiencia = await prisma.$transaction(async (tx) => {
      const newAudiencia = await tx.audiencia.create({
        data: {
          procesoId,
          tipo,
          fecha: fechaAudiencia,
          duracion: duracion || 60,
          juezId: juezId || proceso.juezId,
          sala: salaUrl,
          estado: 'PROGRAMADA',
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

      // Actualizar estado del proceso según tipo de audiencia
      let nuevoEstado = proceso.estado;
      if (tipo === 'PRELIMINAR' && proceso.estado === 'CONTESTACION_PENDIENTE') {
        nuevoEstado = 'AUDIENCIA_PRELIMINAR';
      } else if (tipo === 'COMPLEMENTARIA' && proceso.estado === 'AUDIENCIA_PRELIMINAR') {
        nuevoEstado = 'AUDIENCIA_COMPLEMENTARIA';
      }

      if (nuevoEstado !== proceso.estado) {
        await tx.proceso.update({
          where: { id: procesoId },
          data: { estado: nuevoEstado },
        });
      }

      return newAudiencia;
    });

    return NextResponse.json(audiencia);
  } catch (error) {
    console.error('Error al crear audiencia:', error);
    return NextResponse.json(
      { error: 'Error al crear audiencia' },
      { status: 500 }
    );
  }
}
