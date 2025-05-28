'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Usar variables de entorno para las credenciales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://soviwrzrgskhvgcmujfj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s";

/**
 * Clase SupabaseUnified
 *
 * Esta clase implementa el patrón Singleton para garantizar que solo exista
 * una instancia del cliente de Supabase en toda la aplicación.
 *
 * Proporciona acceso al cliente de Supabase y métodos para interactuar con él.
 */
class SupabaseUnified {
  private static instance: SupabaseUnified;
  private client: SupabaseClient;

  private constructor() {
    // Crear un cliente de Supabase con opciones mejoradas para cookies
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-application-name': 'routinize-fitness-app',
        },
      },
      cookies: {
        domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
        sameSite: 'lax',
        secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
      },
    });

    // Auth state change listener is now handled by the unified authentication system
    // in lib/auth/auth-context.tsx to avoid duplicate listeners
    if (typeof window !== 'undefined') {
      console.log('SupabaseUnified client initialized. Auth state changes are handled by AuthProvider.');
    }
  }

  /**
   * Obtiene la instancia única de SupabaseUnified
   */
  public static getInstance(): SupabaseUnified {
    if (!SupabaseUnified.instance) {
      SupabaseUnified.instance = new SupabaseUnified();
    }
    return SupabaseUnified.instance;
  }

  /**
   * Obtiene el cliente de Supabase
   */
  public getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Limpia los datos de sesión del almacenamiento local
   */
  private clearSessionData(): void {
    if (typeof window === 'undefined') return;

    // Limpiar datos específicos de sesión
    localStorage.removeItem('auth_event');
    localStorage.removeItem('auth_event_time');
    localStorage.removeItem('session_user_id');
    localStorage.removeItem('session_expiry');
    localStorage.removeItem('session_refreshed');
    localStorage.removeItem('login_success');
    localStorage.removeItem('login_time');
    localStorage.removeItem('last_login');
    localStorage.removeItem('auth_return_url');
    localStorage.removeItem('google_auth_start');

    // Intentar limpiar otros datos relacionados con la autenticación
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('session') ||
            key.includes('user') || key.includes('profile')) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('session') ||
            key.includes('user') || key.includes('profile')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error al limpiar datos de sesión:', error);
    }
  }
}

// Exportar una instancia única del cliente de Supabase
const supabaseUnified = SupabaseUnified.getInstance();
export const supabase = supabaseUnified.getClient();

// Exportar la instancia para casos donde se necesite acceso a métodos adicionales
export { supabaseUnified };
