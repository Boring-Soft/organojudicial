import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/edictos - Obtiene edictos públicos (no requiere autenticación)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ci = searchParams.get('ci');
    const nombre = searchParams.get('nombre');

    // Obtener citaciones por edicto que están activas
    const where: any = {
      tipo: 'EDICTO',
      estado: { in: ['PENDIENTE', 'EN_PROCESO'] },
    };

    let citaciones = await prisma.citacion.findMany({
      where,
      include: {
        proceso: {
          include: {
            partes: true,
            juez: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrar por CI o nombre si se proporciona
    if (ci || nombre) {
      citaciones = citaciones.filter((citacion) => {
        const parteDemandada = citacion.proceso.partes.find(
          (p) => p.id === citacion.parteId
        );

        if (!parteDemandada) return false;

        if (ci && parteDemandada.ci?.includes(ci)) {
          return true;
        }

        if (nombre) {
          const nombreCompleto =
            `${parteDemandada.nombres} ${parteDemandada.apellidos}`.toLowerCase();
          return nombreCompleto.includes(nombre.toLowerCase());
        }

        return false;
      });
    }

    // Formatear datos para vista pública
    const edictos = citaciones.map((citacion) => {
      const parteDemandada = citacion.proceso.partes.find(
        (p) => p.id === citacion.parteId
      );

      return {
        id: citacion.id,
        nurej: citacion.proceso.nurej,
        fechaPublicacion: citacion.createdAt,
        juzgado: citacion.proceso.juzgado,
        materia: citacion.proceso.materia,
        juez: `${citacion.proceso.juez.nombres} ${citacion.proceso.juez.apellidos}`,
        demandado: {
          nombres: parteDemandada?.nombres,
          apellidos: parteDemandada?.apellidos,
          ci: parteDemandada?.ci,
        },
      };
    });

    return NextResponse.json(edictos);
  } catch (error) {
    console.error('Error al obtener edictos:', error);
    return NextResponse.json(
      { error: 'Error al obtener edictos' },
      { status: 500 }
    );
  }
}
