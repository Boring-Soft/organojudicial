import { SupabaseClient } from "@supabase/supabase-js";

/**
 * This middleware extension allows the Supabase client to work with
 * client-side hashed passwords by modifying the auth calls.
 *
 * By applying this middleware, the server will understand that passwords
 * are already hashed and will handle them accordingly.
 */
export const applyPasswordHashMiddleware = (supabase: SupabaseClient) => {
  // Create a wrapper for the original fetch function
  const originalFetch = globalThis.fetch;

  // Override the global fetch to intercept Supabase auth requests
  globalThis.fetch = async (input, init) => {
    // Get the URL from the request
    const url = input instanceof Request ? input.url : input.toString();

    // Skip processing if this is NOT an auth endpoint
    const isSupabaseAuthEndpoint =
      url.includes("/auth/v1") &&
      (url.includes("/signup") ||
        url.includes("/token") ||
        url.includes("/user"));

    // If it's not an auth endpoint, just pass through without modification
    if (!isSupabaseAuthEndpoint) {
      return originalFetch(input, init);
    }

    // Only process if we have a body and it's a string (JSON)
    if (init?.body && typeof init.body === "string") {
      try {
        const body = JSON.parse(init.body);
        const hasPassword = body && "password" in body;

        if (hasPassword) {
          // Add the custom header to indicate password is pre-hashed
          init = {
            ...init,
            headers: {
              ...(init?.headers || {}),
              "x-password-hashed": "true",
            },
          };
        }
      } catch {
        // If JSON parsing fails, just continue with original request
      }
    }

    // Call the original fetch with potentially modified headers
    return originalFetch(input, init);
  };

  return supabase;
};
