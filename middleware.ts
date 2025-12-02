import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { RolUsuario } from '@prisma/client'

/**
 * Middleware de autenticación para Next.js 15
 * Refresca las cookies de sesión de Supabase en cada request
 * Protege rutas según el rol del usuario con RBAC
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión si existe
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protección de rutas
  const path = request.nextUrl.pathname

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    '/',
    '/login',
    '/registro',
    '/registro/ciudadano',
    '/registro/abogado',
    '/registro/confirmacion',
    '/recuperar-contrasena',
    '/auth/reset-password',
    '/auth/callback',
    '/onboarding',
  ]
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))

  // Si no hay usuario y la ruta es privada, redirigir a login
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay usuario, verificar acceso por rol
  if (user && !isPublicRoute) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!usuario || !usuario.rol) {
      // Usuario sin rol definido, redirigir a login
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

    const rol = usuario.rol as RolUsuario

    // Definir rutas protegidas por rol
    const roleRoutes: Record<RolUsuario, string[]> = {
      CIUDADANO: ['/ciudadano'],
      ABOGADO: ['/abogado'],
      SECRETARIO: ['/secretario'],
      JUEZ: ['/juez', '/usuarios'], // Jueces tienen acceso a admin de usuarios
    }

    // Rutas compartidas (accesibles por múltiples roles)
    const sharedRoutes = ['/proceso', '/perfil', '/notificaciones', '/documentos']

    // Rutas de administración (solo JUEZ por ahora)
    if (path.startsWith('/usuarios') && rol !== 'JUEZ') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/403'
      redirectUrl.searchParams.set('from', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar si la ruta es compartida
    const isSharedRoute = sharedRoutes.some((route) => path.startsWith(route))

    if (!isSharedRoute) {
      // Verificar si el usuario está intentando acceder a una ruta de otro rol
      let hasAccess = false
      const userAllowedRoutes = roleRoutes[rol] || []

      // Verificar si la ruta pertenece a las rutas permitidas del usuario
      if (userAllowedRoutes.some((route) => path.startsWith(route))) {
        hasAccess = true
      }

      // Si intenta acceder a una ruta de otro rol, redirigir a 403
      if (!hasAccess) {
        for (const [routeRol, routes] of Object.entries(roleRoutes)) {
          if (routes.some((route) => path.startsWith(route)) && rol !== routeRol) {
            // Redirigir a página 403
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/403'
            redirectUrl.searchParams.set('from', path)
            return NextResponse.redirect(redirectUrl)
          }
        }
      }
    }

    // Si el usuario intenta acceder a la raíz (/), redirigir a su dashboard
    if (path === '/') {
      const dashboardRoutes: Record<RolUsuario, string> = {
        CIUDADANO: '/ciudadano/dashboard',
        ABOGADO: '/abogado/dashboard',
        SECRETARIO: '/secretario/dashboard',
        JUEZ: '/juez/dashboard',
      }

      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = dashboardRoutes[rol] || '/login'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
