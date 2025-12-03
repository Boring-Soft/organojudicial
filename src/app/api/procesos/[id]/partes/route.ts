import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

/**
 * POST /api/procesos/[id]/partes - Crea las partes de un proceso
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    if (!usuario || usuario.rol !== 'ABOGADO') {
      return NextResponse.json(
        { error: 'Solo los abogados pueden agregar partes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { partes } = body;

    if (!Array.isArray(partes) || partes.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos una parte' },
        { status: 400 }
      );
    }

    // Verificar que el proceso existe
    const proceso = await prisma.proceso.findUnique({
      where: { id: params.id },
    });

    if (!proceso) {
      return NextResponse.json(
        { error: 'Proceso no encontrado' },
        { status: 404 }
      );
    }

    // Crear las partes
    const partesCreadas = await Promise.all(
      partes.map((parte) =>
        prisma.parteEnProceso.create({
          data: {
            procesoId: params.id,
            tipo: parte.tipo,
            ci: parte.ci,
            nombres: parte.nombres,
            apellidos: parte.apellidos,
            edad: parte.edad,
            estadoCivil: parte.estadoCivil,
            profesion: parte.profesion,
            domicilioReal: parte.domicilioReal,
            domicilioProcesal: parte.domicilioProcesal,
            abogadoId: parte.tipo === 'ACTOR' ? usuario.id : undefined,
            abogadoNombres: usuario.nombres,
            abogadoRegistro: usuario.registroAbogado,
          },
        })
      )
    );

    return NextResponse.json(partesCreadas, { status: 201 });
  } catch (error) {
    console.error('Error al crear partes:', error);
    return NextResponse.json(
      { error: 'Error al crear partes del proceso' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/procesos/[id]/partes - Obtiene las partes de un proceso
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const partes = await prisma.parteEnProceso.findMany({
      where: { procesoId: params.id },
      include: {
        abogado: true,
      },
    });

    return NextResponse.json(partes);
  } catch (error) {
    console.error('Error al obtener partes:', error);
    return NextResponse.json(
      { error: 'Error al obtener partes del proceso' },
      { status: 500 }
    );
  }
}
