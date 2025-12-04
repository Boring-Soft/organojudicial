"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Usuario } from "@/types/profile";
import { RolUsuario } from "@prisma/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Usuario | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Usuario>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  getUserRole: () => null,
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch profile from database
  const fetchProfile = async (userId: string): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);

        // Si el usuario no existe en la DB, intentar sincronizar
        if (error.code === 'PGRST116') {
          console.log("User not found in database, attempting to sync...");
          const { data: { user } } = await supabase.auth.getUser();

          if (user && user.email) {
            // Crear usuario con datos básicos
            const response = await fetch('/api/auth/sync-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                rol: 'CIUDADANO', // Rol por defecto
                nombres: user.user_metadata?.nombres || 'Usuario',
                apellidos: user.user_metadata?.apellidos || 'Nuevo',
              }),
            });

            if (response.ok) {
              const newProfile = await response.json();
              setProfile(newProfile);
              return newProfile;
            }
          }
        }
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);

        // Handle navigation after SIGNED_IN event
        if (event === "SIGNED_IN" && userProfile) {
          // Navigate to role-specific dashboard
          const dashboardRoutes: Record<string, string> = {
            CIUDADANO: '/ciudadano/dashboard',
            ABOGADO: '/abogado/dashboard',
            SECRETARIO: '/secretario/dashboard',
            JUEZ: '/juez/dashboard',
          };

          const route = dashboardRoutes[userProfile.rol];
          if (route) {
            console.log(`Redirecting to ${route} for role ${userProfile.rol}`);
            router.push(route);
          }
        }
      } else {
        setProfile(null);
      }

      setIsLoading(false);

      // Handle SIGNED_OUT event
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile to get role
        const userProfile = await fetchProfile(data.user.id);

        if (userProfile) {
          // Redirect based on role
          const dashboardRoutes: Record<string, string> = {
            CIUDADANO: '/ciudadano/dashboard',
            ABOGADO: '/abogado/dashboard',
            SECRETARIO: '/secretario/dashboard',
            JUEZ: '/juez/dashboard',
          };

          const route = dashboardRoutes[userProfile.rol];
          if (route) {
            router.push(route);
          } else {
            router.push('/dashboard');
          }
        } else {
          // If no profile exists, redirect to complete registration
          router.push('/registro/completar');
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Si el registro es exitoso y tenemos metadata, crear perfil en DB
      if (data.user && metadata) {
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: email,
            rol: metadata.rol || 'CIUDADANO',
            nombres: metadata.nombres || '',
            apellidos: metadata.apellidos || '',
            ci: metadata.ci,
            telefono: metadata.telefono,
            domicilio: metadata.domicilio,
            registroAbogado: metadata.registroAbogado,
            juzgado: metadata.juzgado,
          }),
        });

        if (!response.ok) {
          console.error("Error syncing user with database");
        }
      }

      // Redirect to email confirmation page
      router.push('/auth/confirm-email');
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setProfile(null);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const getUserRole = () => {
    return profile?.rol ?? null;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (data: Partial<Usuario>) => {
    if (!user || !profile) throw new Error("No user logged in");

    try {
      const { error } = await supabase
        .from('usuarios')
        .update(data)
        .eq('userId', user.id);

      if (error) throw error;

      // Refresh profile after update
      await refreshProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        getUserRole,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 