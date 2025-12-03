import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/audiencias/[id] - Obtiene una audiencia específica
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
        proceso: {
          include: {
            partes: true,
            documentos: true,
          },
        },
        juez: true,
      },
    });

    if (!audiencia) {
      return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 });
    }

    return NextResponse.json(audiencia);
  } catch (error) {
    console.error('Error al obtener audiencia:', error);
    return NextResponse.json(
      { error: 'Error al obtener audiencia' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audiencias/[id] - Actualiza una audiencia
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

    if (!usuario || (usuario.rol !== 'SECRETARIO' && usuario.rol !== 'JUEZ')) {
      return NextResponse.json(
        { error: 'No tiene permisos para actualizar audiencias' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const audiencia = await prisma.audiencia.update({
      where: { id: params.id },
      data: body,
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        juez: true,
      },
    });

    return NextResponse.json(audiencia);
  } catch (error) {
    console.error('Error al actualizar audiencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar audiencia' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audiencias/[id] - Cancela una audiencia
 */
export async function DELETE(
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

    if (!usuario || (usuario.rol !== 'SECRETARIO' && usuario.rol !== 'JUEZ')) {
      return NextResponse.json(
        { error: 'No tiene permisos para cancelar audiencias' },
        { status: 403 }
      );
    }

    await prisma.audiencia.update({
      where: { id: params.id },
      data: { estado: 'SUSPENDIDA' },
    });

    return NextResponse.json({ message: 'Audiencia cancelada' });
  } catch (error) {
    console.error('Error al cancelar audiencia:', error);
    return NextResponse.json(
      { error: 'Error al cancelar audiencia' },
      { status: 500 }
    );
  }
}
