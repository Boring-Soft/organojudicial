import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Página genérica de dashboard - redirige al dashboard específico según rol
 */
export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  try {
    // Obtener usuario autenticado
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }

    // Obtener rol del usuario
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('userId', session.user.id)
      .single();

    if (!usuario) {
      redirect('/login');
    }

    // Redirigir según rol
    switch (usuario.rol) {
      case 'CIUDADANO':
        redirect('/ciudadano/dashboard');
      case 'ABOGADO':
        redirect('/abogado/dashboard');
      case 'SECRETARIO':
        redirect('/secretario/dashboard');
      case 'JUEZ':
        redirect('/juez/dashboard');
      default:
        redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }
} 