import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { applyPasswordHashMiddleware } from "./password-hash-middleware";

/**
 * Crea un cliente de Supabase para el navegador
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Create base client
  const baseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "app-token",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });

  // Apply password hash middleware to handle client-side hashed passwords
  return applyPasswordHashMiddleware(baseClient);
}

// Export default instance for backwards compatibility
export const supabase = createClient();
