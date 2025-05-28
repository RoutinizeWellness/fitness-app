import { supabase } from "./supabase-unified";
import { toast } from "@/components/ui/use-toast";

/**
 * Attempts to recover a session by refreshing the token
 * @returns Promise<boolean> indicating if recovery was successful
 */
export async function attemptSessionRecovery(): Promise<boolean> {
  try {
    console.log("Attempting session recovery...");

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log("Session recovery not available in server environment");
      return false;
    }

    // Check for auth token in localStorage as a quick test
    const hasLocalStorageToken = !!localStorage.getItem('supabase.auth.token');
    console.log("Local storage token exists:", hasLocalStorageToken);

    // First check if we have a session
    const { data: sessionData, error: sessionError } = await enhancedSupabase.supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);

      // If there's a specific error about missing session, we need to redirect to login
      if (sessionError.message?.includes('Auth session missing')) {
        console.log("Auth session missing, redirecting to login");

        // Clear any stale tokens
        localStorage.removeItem('supabase.auth.token');

        // Only redirect if we're in a browser and not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
          window.location.href = '/auth/login?reason=session_expired';
          return false;
        }
      }

      return false;
    }

    if (!sessionData.session) {
      console.log("No session found to recover");

      // If we have a token in localStorage but no session, the token might be invalid
      if (hasLocalStorageToken) {
        console.log("Clearing potentially invalid token from localStorage");
        localStorage.removeItem('supabase.auth.token');
      }

      return false;
    }

    // Check if the session is expired or about to expire
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    if (expiresAt && expiresAt <= now) {
      console.log("Session is expired, attempting refresh");
    } else {
      console.log("Session is valid but attempting refresh for good measure");
    }

    // Try to refresh the session
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("Session refresh failed:", error);

      // If refresh fails with auth error, we need to redirect to login
      if (error.message?.includes('JWT expired') || error.message?.includes('Auth session missing')) {
        console.log("JWT expired or missing, redirecting to login");

        // Clear any stale tokens
        localStorage.removeItem('supabase.auth.token');

        // Only redirect if we're in a browser and not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
          window.location.href = '/auth/login?reason=session_expired';
        }
      }

      return false;
    }

    if (data.session) {
      console.log("Session successfully recovered, expires at:", new Date(data.session.expires_at * 1000).toISOString());
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error during session recovery:", error);
    return false;
  }
}

/**
 * Checks if the current session is valid and attempts recovery if needed
 * @param showToast Whether to show a toast notification on success/failure
 * @returns Promise<boolean> indicating if the session is valid
 */
export async function ensureValidSession(showToast: boolean = false): Promise<boolean> {
  try {
    // Check if we have a session
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      if (showToast) {
        toast({
          title: "No hay sesión activa",
          description: "Por favor, inicia sesión para continuar.",
          variant: "destructive",
        });
      }
      return false;
    }

    // Check if the session is about to expire (within 5 minutes)
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const fiveMinutesInSeconds = 5 * 60;

    if (expiresAt && expiresAt - now < fiveMinutesInSeconds) {
      console.log("Session about to expire, attempting refresh...");
      const recovered = await attemptSessionRecovery();

      if (recovered && showToast) {
        toast({
          title: "Sesión actualizada",
          description: "Tu sesión ha sido actualizada correctamente.",
        });
      }

      return recovered;
    }

    // Session is valid and not about to expire
    return true;
  } catch (error) {
    console.error("Error checking session validity:", error);

    // Try recovery as a last resort
    const recovered = await attemptSessionRecovery();

    if (!recovered && showToast) {
      toast({
        title: "Error de sesión",
        description: "Hubo un problema con tu sesión. Por favor, inicia sesión de nuevo.",
        variant: "destructive",
      });
    }

    return recovered;
  }
}

/**
 * Utility to handle session errors in components
 * @param callback Function to execute with session validation
 */
export function withSessionValidation<T>(callback: () => Promise<T>): Promise<T | null> {
  return ensureValidSession().then(isValid => {
    if (isValid) {
      return callback();
    } else {
      // Redirect to login if not in an auth page
      if (typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login?reason=session_expired';
      }
      return null;
    }
  });
}
