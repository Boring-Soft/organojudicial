import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/login',
    '/registro',
    '/recuperar-contrasena',
    '/auth',
    '/api/auth',
    '/',
    '/edictos', // Portal público de edictos
  ];

  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return response;
  }

  // Crear cliente de Supabase para el middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no está autenticado, redirigir a login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Obtener rol del usuario desde la base de datos
  const { data: userData } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('userId', user.id)
    .single();

  if (!userData) {
    // Si el usuario no existe en la base de datos, redirigir a completar registro
    if (!pathname.startsWith('/registro/completar')) {
      return NextResponse.redirect(new URL('/registro/completar', request.url));
    }
    return response;
  }

  const userRole = userData.rol;

  // Verificar permisos de acceso según el rol
  const roleRoutes: Record<string, string[]> = {
    CIUDADANO: ['/ciudadano', '/proceso', '/chat', '/documentos', '/notificaciones'],
    ABOGADO: ['/abogado', '/proceso', '/chat', '/documentos', '/notificaciones', '/demanda'],
    SECRETARIO: ['/secretario', '/proceso', '/documentos', '/notificaciones', '/audiencias', '/citaciones'],
    JUEZ: ['/juez', '/proceso', '/documentos', '/notificaciones', '/audiencias', '/sentencia'],
  };

  // Verificar si el usuario tiene permiso para acceder a la ruta
  const allowedRoutes = roleRoutes[userRole] || [];
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

  // Redirigir si no tiene acceso
  if (!hasAccess && !pathname.startsWith('/api')) {
    // Redirigir al dashboard correspondiente según el rol
    const dashboardRoutes: Record<string, string> = {
      CIUDADANO: '/ciudadano/dashboard',
      ABOGADO: '/abogado/dashboard',
      SECRETARIO: '/secretario/dashboard',
      JUEZ: '/juez/dashboard',
    };

    const dashboardUrl = dashboardRoutes[userRole];
    if (dashboardUrl && pathname !== dashboardUrl) {
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  // Agregar el rol del usuario a los headers para uso en las páginas
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-id', user.id);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
