import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create singleton instance
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Crea un cliente singleton de Supabase para el navegador
 */
export function createClient() {
  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      storageKey: "app-token",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });

  return clientInstance;
}

// Export default instance for backwards compatibility
export const supabase = createClient();
