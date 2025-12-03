import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/audiencias/[id]/iniciar - Inicia una audiencia
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
        { error: 'Solo el juez puede iniciar la audiencia' },
        { status: 403 }
      );
    }

    const audiencia = await prisma.audiencia.findUnique({
      where: { id: params.id },
    });

    if (!audiencia) {
      return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 });
    }

    if (audiencia.juezId !== usuario.id) {
      return NextResponse.json(
        { error: 'Solo el juez asignado puede iniciar esta audiencia' },
        { status: 403 }
      );
    }

    if (audiencia.estado !== 'PROGRAMADA') {
      return NextResponse.json(
        { error: 'La audiencia no está en estado programada' },
        { status: 400 }
      );
    }

    const audienciaActualizada = await prisma.audiencia.update({
      where: { id: params.id },
      data: {
        estado: 'EN_CURSO',
      },
    });

    return NextResponse.json(audienciaActualizada);
  } catch (error) {
    console.error('Error al iniciar audiencia:', error);
    return NextResponse.json(
      { error: 'Error al iniciar audiencia' },
      { status: 500 }
    );
  }
}
