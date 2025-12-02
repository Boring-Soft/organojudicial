import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente de Supabase para el servidor (server-side)
 * Usa cookies para mantener la sesión del usuario
 * Compatible con Next.js 15 App Router
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // La función `setAll` fue llamada desde un Server Component.
            // Esto puede ignorarse si tienes middleware refrescando las cookies del usuario.
          }
        },
      },
    }
  )
}
