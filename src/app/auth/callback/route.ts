import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { RolUsuario } from "@prisma/client";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/login?error=auth", request.url));
    }

    // Create user profile in Prisma if it doesn't exist and we have a session
    if (data?.session) {
      const userId = data.session.user.id;
      const email = data.session.user.email;
      const metadata = data.session.user.user_metadata;

      // Check if user exists in usuarios table
      const existingUser = await prisma.usuario.findUnique({
        where: { userId },
      });

      if (!existingUser && email) {
        // Create user with default role CIUDADANO
        await prisma.usuario.create({
          data: {
            userId,
            email,
            rol: (metadata?.rol as RolUsuario) || 'CIUDADANO',
            nombres: metadata?.nombres || 'Usuario',
            apellidos: metadata?.apellidos || 'Nuevo',
            ci: metadata?.ci,
            telefono: metadata?.telefono,
            domicilio: metadata?.domicilio,
            registroAbogado: metadata?.registroAbogado,
            juzgado: metadata?.juzgado,
            activo: true,
          },
        });
      }

      // Get user role for redirection
      const usuario = existingUser || await prisma.usuario.findUnique({
        where: { userId },
      });

      if (usuario) {
        // Redirect based on role
        const dashboardRoutes: Record<RolUsuario, string> = {
          CIUDADANO: '/ciudadano/dashboard',
          ABOGADO: '/abogado/dashboard',
          SECRETARIO: '/secretario/dashboard',
          JUEZ: '/juez/dashboard',
        };

        const route = dashboardRoutes[usuario.rol];
        if (route) {
          return NextResponse.redirect(new URL(route, request.url));
        }
      }
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
