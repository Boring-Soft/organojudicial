import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/contestaciones/[id] - Obtiene una contestación específica
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

    const contestacion = await prisma.documento.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
    });

    if (!contestacion) {
      return NextResponse.json({ error: 'Contestación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(contestacion);
  } catch (error) {
    console.error('Error al obtener contestación:', error);
    return NextResponse.json(
      { error: 'Error al obtener contestación' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contestaciones/[id] - Actualiza una contestación
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();

    const contestacion = await prisma.documento.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(contestacion);
  } catch (error) {
    console.error('Error al actualizar contestación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar contestación' },
      { status: 500 }
    );
  }
}
