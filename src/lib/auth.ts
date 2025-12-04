import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { RolUsuario } from '@prisma/client';

/**
 * Obtiene el usuario actual desde Supabase Auth
 * Esta función es usada por todas las API routes para autenticación
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Obtiene el usuario completo con datos de Prisma
 * Sincroniza entre Supabase Auth y base de datos Prisma
 */
export async function getCurrentUserWithRole() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return null;

    // Buscar usuario en base de datos por el ID de Supabase
    const dbUser = await prisma.usuario.findUnique({
      where: { userId: authUser.id },
    });

    if (!dbUser) {
      console.warn(`Usuario ${authUser.id} existe en Auth pero no en DB`);
      return null;
    }

    return {
      ...authUser,
      ...dbUser,
      rol: dbUser.rol as RolUsuario,
    };
  } catch (error) {
    console.error('Error getting user with role:', error);
    return null;
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(roles: RolUsuario[]): Promise<boolean> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) return false;

    return roles.includes(user.rol);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Obtiene solo el rol del usuario actual
 */
export async function getCurrentUserRole(): Promise<RolUsuario | null> {
  try {
    const user = await getCurrentUserWithRole();
    return user?.rol || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Verifica si el usuario puede acceder a un proceso específico
 */
export async function canAccessProceso(procesoId: string): Promise<boolean> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) return false;

    // Jueces y Secretarios pueden ver todos los procesos
    if (['JUEZ', 'SECRETARIO'].includes(user.rol)) {
      return true;
    }

    const proceso = await prisma.proceso.findUnique({
      where: { id: procesoId },
      include: {
        partes: true,
      },
    });

    if (!proceso) return false;

    // Ciudadanos: verificar si son parte del proceso
    if (user.rol === 'CIUDADANO') {
      return proceso.partes.some(
        (parte) => parte.usuarioId === user.id
      );
    }

    // Abogados: verificar si representan a alguna de las partes
    if (user.rol === 'ABOGADO') {
      return proceso.partes.some(
        (parte) => parte.abogadoId === user.id
      );
    }

    return false;
  } catch (error) {
    console.error('Error checking proceso access:', error);
    return false;
  }
}

/**
 * Sincroniza un usuario de Supabase Auth con la base de datos Prisma
 * Se usa después del registro para crear el perfil en la DB
 */
export async function syncUserWithDatabase(
  authUser: User,
  userData: {
    rol: RolUsuario;
    nombres: string;
    apellidos: string;
    email: string;
    ci?: string;
    telefono?: string;
    domicilio?: string;
    registroAbogado?: string;
    juzgado?: string;
  }
) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { userId: authUser.id },
    });

    if (existingUser) {
      return existingUser;
    }

    // Crear nuevo usuario en la base de datos
    const newUser = await prisma.usuario.create({
      data: {
        userId: authUser.id,
        email: userData.email,
        rol: userData.rol,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        ci: userData.ci,
        telefono: userData.telefono,
        domicilio: userData.domicilio,
        registroAbogado: userData.registroAbogado,
        juzgado: userData.juzgado,
        activo: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error syncing user with database:', error);
    throw error;
  }
}
