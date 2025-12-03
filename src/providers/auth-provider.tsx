"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User, Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/types/profile";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Usuario | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if Supabase credentials are available and valid
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasSupabaseCredentials =
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-") && // Check for placeholder
    !supabaseKey.includes("your-"); // Check for placeholder

  // Only create Supabase client if credentials exist and are valid
  let supabase = null;
  try {
    if (hasSupabaseCredentials) {
      supabase = createClientComponentClient();
    }
  } catch {
    console.warn("Supabase client creation failed. Running without authentication.");
  }

  // Fetch profile function
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // If no Supabase credentials, just mark as not loading
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);

      if (event === "SIGNED_OUT") {
        router.push("/sign-in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Please set up environment variables.");
    }
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      // Fetch user profile to get role
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('userId', data.user.id)
        .single();

      if (usuario) {
        setProfile(usuario);

        // Redirect based on role
        switch (usuario.rol) {
          case 'CIUDADANO':
            router.push('/ciudadano/dashboard');
            break;
          case 'ABOGADO':
            router.push('/abogado/dashboard');
            break;
          case 'SECRETARIO':
            router.push('/secretario/dashboard');
            break;
          case 'JUEZ':
            router.push('/juez/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Please set up environment variables.");
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Please set up environment variables.");
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    router.push("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 