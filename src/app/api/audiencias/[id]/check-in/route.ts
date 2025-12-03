import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/audiencias/[id]/check-in - Registra la entrada de un participante
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const audiencia = await prisma.audiencia.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
      },
    });

    if (!audiencia) {
      return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 });
    }

    // Determinar tipo de participante
    let tipoParticipante = 'OTRO';
    let rolParticipante = usuario.rol;

    if (usuario.id === audiencia.juezId) {
      tipoParticipante = 'JUEZ';
    } else {
      // Buscar si es parte o abogado en el proceso
      const parte = audiencia.proceso.partes.find(
        (p) => p.abogadoId === usuario.id || p.usuarioId === usuario.userId
      );
      if (parte) {
        tipoParticipante = parte.tipo; // ACTOR o DEMANDADO
      }
    }

    // Registrar asistencia
    const asistentes = Array.isArray(audiencia.asistentes) ? audiencia.asistentes : [];

    const nuevoAsistente = {
      usuarioId: usuario.id,
      nombre: `${usuario.nombres} ${usuario.apellidos}`,
      tipo: tipoParticipante,
      rol: rolParticipante,
      horaEntrada: new Date().toISOString(),
      horaSalida: null,
    };

    asistentes.push(nuevoAsistente);

    const audienciaActualizada = await prisma.audiencia.update({
      where: { id: params.id },
      data: {
        asistentes: asistentes as any,
      },
    });

    return NextResponse.json({
      message: 'Check-in registrado',
      asistente: nuevoAsistente,
    });
  } catch (error) {
    console.error('Error al registrar check-in:', error);
    return NextResponse.json(
      { error: 'Error al registrar check-in' },
      { status: 500 }
    );
  }
}
