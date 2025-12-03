import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { generarSentenciaOficial, generarHashSentencia } from '@/lib/sentencias/generador-sentencias';
import { sumarDiasHabiles } from '@/lib/utils/dias-habiles';

/**
 * POST /api/sentencias/[id]/firmar - Firma y publica la sentencia
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Solo los jueces pueden firmar sentencias' },
        { status: 403 }
      );
    }

    const sentencia = await prisma.sentencia.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        juez: true,
      },
    });

    if (!sentencia) {
      return NextResponse.json({ error: 'Sentencia no encontrada' }, { status: 404 });
    }

    if (sentencia.juezId !== usuario.id) {
      return NextResponse.json(
        { error: 'No es el juez autor de esta sentencia' },
        { status: 403 }
      );
    }

    if (sentencia.estadoNotificacion !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'Esta sentencia ya fue firmada y notificada' },
        { status: 400 }
      );
    }

    // Validar que la sentencia esté completa
    if (
      !sentencia.encabezamiento ||
      !sentencia.narrativa ||
      !sentencia.motiva ||
      !sentencia.resolutiva
    ) {
      return NextResponse.json(
        { error: 'La sentencia debe estar completa antes de firmar' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { resultadoActor, resultadoDemandado } = body;

    if (!resultadoActor || !resultadoDemandado) {
      return NextResponse.json(
        { error: 'Debe indicar el resultado para ambas partes' },
        { status: 400 }
      );
    }

    // Obtener partes
    const demandante = sentencia.proceso.partes.find(p => p.tipo === 'ACTOR');
    const demandado = sentencia.proceso.partes.find(p => p.tipo === 'DEMANDADO');

    if (!demandante || !demandado) {
      return NextResponse.json(
        { error: 'No se encontraron las partes del proceso' },
        { status: 400 }
      );
    }

    // Generar sentencia oficial
    const datosSentencia = {
      nurej: sentencia.proceso.nurej,
      juzgado: sentencia.proceso.juzgado,
      materia: sentencia.proceso.materia,
      juez: `${sentencia.juez.nombres} ${sentencia.juez.apellidos}`,
      demandante: {
        nombres: demandante.nombres,
        apellidos: demandante.apellidos,
        ci: demandante.ci || '',
      },
      demandado: {
        nombres: demandado.nombres,
        apellidos: demandado.apellidos,
        ci: demandado.ci || '',
      },
      encabezamiento: sentencia.encabezamiento,
      narrativa: sentencia.narrativa,
      motiva: sentencia.motiva,
      resolutiva: sentencia.resolutiva,
      resultadoActor,
      resultadoDemandado,
    };

    const sentenciaOficial = generarSentenciaOficial(datosSentencia);

    // Generar hash SHA-256
    const hash = await generarHashSentencia(sentenciaOficial);

    // Generar firma digital (simulada - en producción usar certificado real)
    const timestamp = new Date().toISOString();
    const firmaDigital = `FIRMA_DIGITAL_${hash.substring(0, 16)}_${timestamp}`;

    // TODO: En producción, convertir a PDF y subir a Supabase Storage
    const documentoUrl = `sentencia_${sentencia.proceso.nurej}_${Date.now()}.pdf`;

    // Actualizar sentencia y proceso en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar sentencia
      const sentenciaFirmada = await tx.sentencia.update({
        where: { id: params.id },
        data: {
          resultadoActor,
          resultadoDemandado,
          firmaDigital,
          hashDocumento: hash,
          documentoUrl,
          fechaEmision: new Date(),
          estadoNotificacion: 'NOTIFICADA',
          fechaNotificacion: new Date(),
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

      // Actualizar estado del proceso
      await tx.proceso.update({
        where: { id: sentencia.procesoId },
        data: {
          estado: 'SENTENCIADO',
          fechaFin: new Date(),
        },
      });

      // Crear plazo de apelación (15 días)
      const fechaInicio = new Date();
      const fechaVencimiento = sumarDiasHabiles(fechaInicio, 15);

      await tx.plazo.create({
        data: {
          procesoId: sentencia.procesoId,
          tipo: 'APELACION',
          descripcion: 'Plazo para interponer recurso de apelación',
          articulo: 'Art. 229 CPC',
          fechaInicio,
          fechaVencimiento,
          diasPlazo: 15,
        },
      });

      // TODO: Crear notificaciones diferenciadas para ciudadanos y abogados
      // usando generarResumenCiudadano() y generarResumenAbogado()

      return sentenciaFirmada;
    });

    return NextResponse.json({
      message: 'Sentencia firmada y notificada exitosamente',
      sentencia: resultado,
      hash,
    });
  } catch (error) {
    console.error('Error al firmar sentencia:', error);
    return NextResponse.json(
      { error: 'Error al firmar sentencia' },
      { status: 500 }
    );
  }
}
