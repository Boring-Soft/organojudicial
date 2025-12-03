import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/documentos/[id]/anotaciones - Crea una anotación
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

    // Solo jueces pueden hacer anotaciones
    if (usuario.rol !== 'JUEZ') {
      return NextResponse.json(
        { error: 'Solo los jueces pueden hacer anotaciones' },
        { status: 403 }
      );
    }

    const documento = await prisma.documento.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
      },
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Verificar que el juez tenga acceso al proceso
    const tieneAcceso = documento.proceso.juezId === usuario.id;

    if (!tieneAcceso) {
      return NextResponse.json(
        { error: 'No tiene acceso a este documento' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { texto, pagina, coordenadas, color } = body;

    if (!texto || pagina === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    const anotacion = await prisma.anotacion.create({
      data: {
        documentoId: params.id,
        usuarioId: usuario.id,
        texto,
        pagina,
        coordenadas: coordenadas || null,
        color: color || '#FFD700',
        eliminado: false,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
      },
    });

    return NextResponse.json(anotacion);
  } catch (error) {
    console.error('Error al crear anotación:', error);
    return NextResponse.json(
      { error: 'Error al crear anotación' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documentos/[id]/anotaciones/[anotacionId] - Elimina una anotación
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const anotacionId = searchParams.get('anotacionId');

    if (!anotacionId) {
      return NextResponse.json({ error: 'anotacionId requerido' }, { status: 400 });
    }

    const anotacion = await prisma.anotacion.findUnique({
      where: { id: anotacionId },
    });

    if (!anotacion) {
      return NextResponse.json({ error: 'Anotación no encontrada' }, { status: 404 });
    }

    // Solo el creador puede eliminar su anotación
    if (anotacion.usuarioId !== usuario.id) {
      return NextResponse.json(
        { error: 'No puede eliminar esta anotación' },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.anotacion.update({
      where: { id: anotacionId },
      data: { eliminado: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar anotación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar anotación' },
      { status: 500 }
    );
  }
}
