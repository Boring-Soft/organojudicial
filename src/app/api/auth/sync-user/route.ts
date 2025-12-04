import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RolUsuario } from '@prisma/client';

/**
 * POST /api/auth/sync-user
 * Sincroniza un usuario de Supabase Auth con la base de datos Prisma
 * Se llama después del registro o cuando un usuario no existe en la DB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      rol = 'CIUDADANO',
      nombres,
      apellidos,
      ci,
      telefono,
      domicilio,
      registroAbogado,
      juzgado,
    } = body;

    // Validar datos requeridos
    if (!userId || !email || !nombres || !apellidos) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { userId },
    });

    if (existingUser) {
      return NextResponse.json(existingUser, { status: 200 });
    }

    // Crear nuevo usuario
    const newUser = await prisma.usuario.create({
      data: {
        userId,
        email,
        rol: rol as RolUsuario,
        nombres,
        apellidos,
        ci,
        telefono,
        domicilio,
        registroAbogado: rol === 'ABOGADO' ? registroAbogado : null,
        juzgado: ['SECRETARIO', 'JUEZ'].includes(rol) ? juzgado : null,
        activo: true,
      },
    });

    console.log(`Usuario sincronizado: ${email} con rol ${rol}`);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error sincronizando usuario:', error);

    // Si el error es por email duplicado, intentar obtener el usuario existente
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      try {
        const body = await request.json();
        const existingUser = await prisma.usuario.findUnique({
          where: { email: body.email },
        });

        if (existingUser) {
          return NextResponse.json(existingUser, { status: 200 });
        }
      } catch {}
    }

    return NextResponse.json(
      { error: 'Error al sincronizar usuario' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/sync-user
 * Obtiene el usuario actual de la base de datos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const user = await prisma.usuario.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}