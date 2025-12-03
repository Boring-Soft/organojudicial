import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { realizarTransicion } from '@/lib/proceso/estado-machine';

/**
 * GET /api/procesos/[id] - Obtiene un proceso específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const proceso = await prisma.proceso.findUnique({
      where: { id: params.id },
      include: {
        juez: true,
        demanda: true,
        partes: {
          include: {
            abogado: true,
          },
        },
        plazos: {
          orderBy: { fechaVencimiento: 'asc' },
        },
        documentos: {
          orderBy: { createdAt: 'desc' },
        },
        citaciones: {
          orderBy: { createdAt: 'desc' },
        },
        audiencias: {
          orderBy: { fecha: 'desc' },
        },
        resoluciones: {
          orderBy: { fechaEmision: 'desc' },
        },
        sentencia: true,
      },
    });

    if (!proceso) {
      return NextResponse.json(
        { error: 'Proceso no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos de acceso
    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar si el usuario tiene acceso al proceso
    const tieneAcceso =
      usuario.rol === 'JUEZ' && proceso.juezId === usuario.id ||
      usuario.rol === 'SECRETARIO' && proceso.juzgado === usuario.juzgado ||
      usuario.rol === 'ABOGADO' && proceso.partes.some(p => p.abogadoId === usuario.id) ||
      proceso.partes.some(p => p.usuarioId === usuario.id);

    if (!tieneAcceso) {
      return NextResponse.json(
        { error: 'No tiene acceso a este proceso' },
        { status: 403 }
      );
    }

    // Registrar acceso
    await prisma.accesoExpediente.create({
      data: {
        procesoId: proceso.id,
        usuarioId: usuario.id,
        accion: 'VER',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(proceso);
  } catch (error) {
    console.error('Error al obtener proceso:', error);
    return NextResponse.json(
      { error: 'Error al obtener proceso' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/procesos/[id] - Actualiza un proceso
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { estado, ...otrosDatos } = body;

    // Si se quiere cambiar de estado, usar la máquina de estados
    if (estado) {
      const resultado = await realizarTransicion(
        params.id,
        estado,
        usuario.id,
        usuario.rol
      );

      if (!resultado.exito) {
        return NextResponse.json(
          { error: resultado.mensaje },
          { status: 400 }
        );
      }

      // Obtener proceso actualizado
      const procesoActualizado = await prisma.proceso.findUnique({
        where: { id: params.id },
        include: {
          juez: true,
          demanda: true,
          partes: true,
        },
      });

      return NextResponse.json(procesoActualizado);
    }

    // Actualizar otros datos
    const procesoActualizado = await prisma.proceso.update({
      where: { id: params.id },
      data: otrosDatos,
      include: {
        juez: true,
        demanda: true,
        partes: true,
      },
    });

    return NextResponse.json(procesoActualizado);
  } catch (error) {
    console.error('Error al actualizar proceso:', error);
    return NextResponse.json(
      { error: 'Error al actualizar proceso' },
      { status: 500 }
    );
  }
}
