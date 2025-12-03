import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/documentos/[id] - Obtiene un documento específico
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

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const documento = await prisma.documento.findUnique({
      where: { id: params.id },
      include: {
        proceso: {
          include: {
            partes: true,
          },
        },
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
        anotaciones: {
          where: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Verificar acceso
    const tieneAcceso =
      usuario.rol === 'JUEZ' ||
      usuario.rol === 'SECRETARIO' ||
      documento.proceso.partes.some(
        (p) => p.abogadoId === usuario.id || p.usuarioId === usuario.userId
      );

    if (!tieneAcceso) {
      return NextResponse.json({ error: 'No tiene acceso a este documento' }, { status: 403 });
    }

    // Registrar acceso
    await prisma.logDocumento.create({
      data: {
        documentoId: documento.id,
        usuarioId: usuario.id,
        accion: 'ACCESO',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(documento);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    return NextResponse.json(
      { error: 'Error al obtener documento' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documentos/[id] - Elimina un documento
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

    const documento = await prisma.documento.findUnique({
      where: { id: params.id },
      include: {
        proceso: true,
      },
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Solo el juez, secretario o quien lo subió puede eliminarlo
    const puedeEliminar =
      usuario.rol === 'JUEZ' ||
      usuario.rol === 'SECRETARIO' ||
      documento.subidoPorId === usuario.id;

    if (!puedeEliminar) {
      return NextResponse.json(
        { error: 'No tiene permisos para eliminar este documento' },
        { status: 403 }
      );
    }

    // Eliminar documento de la base de datos
    await prisma.documento.delete({
      where: { id: params.id },
    });

    // TODO: Eliminar archivo de Supabase Storage

    // Registrar eliminación
    await prisma.logDocumento.create({
      data: {
        documentoId: documento.id,
        usuarioId: usuario.id,
        accion: 'ELIMINACION',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    );
  }
}
