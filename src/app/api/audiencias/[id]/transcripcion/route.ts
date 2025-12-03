import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

/**
 * POST /api/audiencias/[id]/transcripcion - Genera transcripción usando Whisper
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

    if (!usuario || (usuario.rol !== 'JUEZ' && usuario.rol !== 'SECRETARIO')) {
      return NextResponse.json(
        { error: 'No tiene permisos para generar transcripciones' },
        { status: 403 }
      );
    }

    const audiencia = await prisma.audiencia.findUnique({
      where: { id: params.id },
    });

    if (!audiencia) {
      return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 });
    }

    if (!audiencia.audioUrl) {
      return NextResponse.json(
        { error: 'No hay audio disponible para transcribir' },
        { status: 400 }
      );
    }

    // Verificar si ya existe transcripción
    if (audiencia.transcripcion) {
      return NextResponse.json({
        message: 'La audiencia ya tiene una transcripción',
        transcripcion: audiencia.transcripcion,
      });
    }

    // Inicializar OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Descargar el audio desde Supabase Storage
    // Nota: En producción, necesitarás implementar la descarga real del archivo
    // Por ahora, asumimos que audioUrl es accesible públicamente

    try {
      // Transcribir con Whisper
      // Nota: Whisper requiere el archivo de audio, no una URL
      // En producción, necesitarás descargar el archivo primero

      // Por ahora, marcamos como pendiente la implementación real
      // y guardamos un placeholder
      const transcripcionPlaceholder = `
[TRANSCRIPCIÓN AUTOMÁTICA - Audiencia ${audiencia.tipo}]

JUEZ: [Nombre del Juez]
Siendo las ${new Date(audiencia.fecha).toLocaleTimeString('es-BO')}, se da inicio a la audiencia ${audiencia.tipo.toLowerCase()}.

[La transcripción completa se generará cuando se implemente la integración completa con OpenAI Whisper]

IMPORTANTE: Para implementar la transcripción real:
1. Descargar el archivo de audio desde Supabase Storage
2. Enviar el archivo a la API de Whisper
3. Procesar la respuesta y formatear el texto

Ejemplo de código:
const response = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: "es",
  response_format: "verbose_json",
  timestamp_granularities: ["segment"]
});

JUEZ: Se levanta la audiencia.
      `.trim();

      // Actualizar audiencia con transcripción
      const audienciaActualizada = await prisma.audiencia.update({
        where: { id: params.id },
        data: {
          transcripcion: transcripcionPlaceholder,
        },
      });

      return NextResponse.json({
        message: 'Transcripción generada (placeholder)',
        transcripcion: transcripcionPlaceholder,
        nota: 'Implementar integración real con Whisper descargando el archivo de audio',
      });
    } catch (error: any) {
      console.error('Error al transcribir con Whisper:', error);
      return NextResponse.json(
        { error: `Error al transcribir: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al generar transcripción:', error);
    return NextResponse.json(
      { error: 'Error al generar transcripción' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audiencias/[id]/transcripcion - Actualiza la transcripción (edición manual)
 */
export async function PATCH(
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

    if (!usuario || (usuario.rol !== 'JUEZ' && usuario.rol !== 'SECRETARIO')) {
      return NextResponse.json(
        { error: 'No tiene permisos para editar transcripciones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { transcripcion } = body;

    const audienciaActualizada = await prisma.audiencia.update({
      where: { id: params.id },
      data: {
        transcripcion,
      },
    });

    return NextResponse.json(audienciaActualizada);
  } catch (error) {
    console.error('Error al actualizar transcripción:', error);
    return NextResponse.json(
      { error: 'Error al actualizar transcripción' },
      { status: 500 }
    );
  }
}
