import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { sumarDiasHabiles } from '@/lib/utils/dias-habiles';

/**
 * GET /api/contestaciones - Obtiene contestaciones según rol
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

    // Filtrar por proceso si se especifica
    if (procesoId) {
      whereClause.procesoId = procesoId;
    }

    const contestaciones = await prisma.documento.findMany({
      where: {
        ...whereClause,
        tipo: {
          in: ['CONTESTACION', 'EXCEPCION', 'RECONVENCION', 'ALLANAMIENTO'],
        },
      },
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contestaciones);
  } catch (error) {
    console.error('Error al obtener contestaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener contestaciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contestaciones - Crea una nueva contestación
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

    if (!usuario || usuario.rol !== 'ABOGADO') {
      return NextResponse.json({ error: 'Solo abogados pueden contestar' }, { status: 403 });
    }

    const body = await request.json();
    const {
      procesoId,
      tipoContestacion,
      contenido,
      anexos,
      excepciones,
      reconvencion,
    } = body;

    // Validar que el proceso existe y está en estado correcto
    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
        plazos: {
          where: {
            tipo: 'CONTESTACION',
            estado: 'ACTIVO',
          },
        },
      },
    });

    if (!proceso) {
      return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 });
    }

    if (proceso.estado !== 'CONTESTACION_PENDIENTE') {
      return NextResponse.json(
        { error: 'El proceso no está en estado de contestación' },
        { status: 400 }
      );
    }

    // Verificar que el abogado representa a la parte demandada
    const parteDemandada = proceso.partes.find(
      (p) => p.tipo === 'DEMANDADO' && p.abogadoId === usuario.id
    );

    if (!parteDemandada) {
      return NextResponse.json(
        { error: 'No representa a la parte demandada en este proceso' },
        { status: 403 }
      );
    }

    // Verificar que el plazo no haya vencido
    const plazoContestacion = proceso.plazos[0];
    if (!plazoContestacion) {
      return NextResponse.json(
        { error: 'No existe plazo de contestación activo' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(plazoContestacion.fechaVencimiento)) {
      return NextResponse.json(
        { error: 'El plazo de contestación ha vencido' },
        { status: 400 }
      );
    }

    // Crear documento de contestación según tipo
    let tipoDocumento = 'CONTESTACION';
    let nuevoEstadoProceso = 'CONTESTACION_PENDIENTE';
    let contenidoFinal = contenido;

    switch (tipoContestacion) {
      case 'CONTESTAR':
        tipoDocumento = 'CONTESTACION';
        nuevoEstadoProceso = 'AUDIENCIA_PRELIMINAR';
        break;
      case 'EXCEPCIONES':
        tipoDocumento = 'EXCEPCION';
        contenidoFinal = JSON.stringify(excepciones);
        // Las excepciones requieren traslado de 15 días
        break;
      case 'RECONVENCION':
        tipoDocumento = 'RECONVENCION';
        contenidoFinal = JSON.stringify(reconvencion);
        nuevoEstadoProceso = 'AUDIENCIA_PRELIMINAR';
        break;
      case 'ALLANAMIENTO':
        tipoDocumento = 'ALLANAMIENTO';
        nuevoEstadoProceso = 'SENTENCIA_PENDIENTE';
        break;
    }

    // Crear el documento en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear documento
      const doc = await tx.documento.create({
        data: {
          procesoId,
          nombre: `${tipoDocumento} - ${proceso.nurej}`,
          tipo: tipoDocumento,
          url: '', // Se actualizará después del upload
          hashSHA256: '', // Se generará con el contenido
          size: 0,
          mimeType: 'application/json',
          uploadedBy: usuario.userId,
          uploadedByRole: 'ABOGADO',
        },
      });

      // Actualizar plazo de contestación como cumplido
      await tx.plazo.updateMany({
        where: {
          procesoId,
          tipo: 'CONTESTACION',
          estado: 'ACTIVO',
        },
        data: {
          estado: 'CUMPLIDO',
        },
      });

      // Actualizar estado del proceso
      await tx.proceso.update({
        where: { id: procesoId },
        data: { estado: nuevoEstadoProceso },
      });

      // Si es allanamiento, crear plazo de sentencia (15 días)
      if (tipoContestacion === 'ALLANAMIENTO') {
        const fechaInicio = new Date();
        const fechaVencimiento = sumarDiasHabiles(fechaInicio, 15);

        await tx.plazo.create({
          data: {
            procesoId,
            tipo: 'SENTENCIA',
            descripcion: 'Plazo para emitir sentencia por allanamiento',
            articulo: 'Art. 330',
            fechaInicio,
            fechaVencimiento,
            diasPlazo: 15,
          },
        });
      }

      // Si es excepción, crear plazo de traslado (15 días)
      if (tipoContestacion === 'EXCEPCIONES') {
        const fechaInicio = new Date();
        const fechaVencimiento = sumarDiasHabiles(fechaInicio, 15);

        await tx.plazo.create({
          data: {
            procesoId,
            tipo: 'TRASLADO_EXCEPCIONES',
            descripcion: 'Plazo para que el actor se pronuncie sobre las excepciones',
            articulo: 'Art. 330',
            fechaInicio,
            fechaVencimiento,
            diasPlazo: 15,
          },
        });
      }

      // Si es reconvención, crear plazo de contestación para el actor (30 días)
      if (tipoContestacion === 'RECONVENCION') {
        const fechaInicio = new Date();
        const fechaVencimiento = sumarDiasHabiles(fechaInicio, 30);

        await tx.plazo.create({
          data: {
            procesoId,
            tipo: 'CONTESTACION_RECONVENCION',
            descripcion: 'Plazo para contestar la reconvención',
            articulo: 'Art. 330',
            fechaInicio,
            fechaVencimiento,
            diasPlazo: 30,
          },
        });
      }

      return doc;
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al crear contestación:', error);
    return NextResponse.json(
      { error: 'Error al crear contestación' },
      { status: 500 }
    );
  }
}
