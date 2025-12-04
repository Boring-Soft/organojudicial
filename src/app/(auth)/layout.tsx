import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Get user role from database to redirect to correct dashboard
    const usuario = await prisma.usuario.findUnique({
      where: { userId: session.user.id },
    });

    if (usuario) {
      const dashboardRoutes: Record<string, string> = {
        CIUDADANO: '/ciudadano/dashboard',
        ABOGADO: '/abogado/dashboard',
        SECRETARIO: '/secretario/dashboard',
        JUEZ: '/juez/dashboard',
      };

      const route = dashboardRoutes[usuario.rol] || '/dashboard';
      redirect(route);
    }

    redirect("/dashboard");
  }

  return <>{children}</>;
}
