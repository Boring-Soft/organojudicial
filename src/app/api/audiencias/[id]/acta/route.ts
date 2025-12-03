import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { generarActaAudiencia } from '@/lib/audiencias/generador-actas';

/**
 * GET /api/audiencias/[id]/acta - Genera el acta de la audiencia
 */
export async function GET(
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

    const audiencia = await prisma.audiencia.findUnique({
      where: { id: params.id },
      include: {
        proceso: true,
        juez: true,
      },
    });

    if (!audiencia) {
      return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 });
    }

    if (audiencia.estado !== 'FINALIZADA') {
      return NextResponse.json(
        { error: 'La audiencia debe estar finalizada para generar el acta' },
        { status: 400 }
      );
    }

    // Si ya existe acta, devolverla
    if (audiencia.actaUrl) {
      return NextResponse.json({
        url: audiencia.actaUrl,
        message: 'Acta ya generada',
      });
    }

    // Generar acta
    const datosActa = {
      nurej: audiencia.proceso.nurej,
      juzgado: audiencia.proceso.juzgado,
      materia: audiencia.proceso.materia,
      juez: `${audiencia.juez.nombres} ${audiencia.juez.apellidos}`,
      fecha: new Date(audiencia.fecha),
      tipo: audiencia.tipo as 'PRELIMINAR' | 'COMPLEMENTARIA',
      duracion: audiencia.duracion || 60,
      asistentes: Array.isArray(audiencia.asistentes) ? audiencia.asistentes : [],
      transcripcion: audiencia.transcripcion || undefined,
    };

    const acta = generarActaAudiencia(datosActa);

    // TODO: En producción, guardar el acta como PDF en Supabase Storage
    // y actualizar audiencia.actaUrl con la URL del archivo

    return NextResponse.json({
      acta,
      formato: 'text',
      message: 'Acta generada (TODO: convertir a PDF y guardar en Storage)',
    });
  } catch (error) {
    console.error('Error al generar acta:', error);
    return NextResponse.json(
      { error: 'Error al generar acta' },
      { status: 500 }
    );
  }
}
