'use client';

import { SupabaseClient, AuthError, Session, User, Provider } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase-unified';

// Tipo para la respuesta de autenticación
export type AuthResponse<T = any> = {
  data: T | null;
  error: AuthError | Error | null;
  status: 'success' | 'error';
  message?: string;
};

/**
 * Servicio unificado de autenticación con Supabase
 * Utiliza el cliente unificado de Supabase para garantizar consistencia
 */
class SupabaseAuth {
  private client: SupabaseClient;
  private static instance: SupabaseAuth;

  private constructor() {
    // Usar el cliente unificado de Supabase
    this.client = supabase;
  }

  /**
   * Obtiene la instancia única del servicio (patrón Singleton)
   */
  public static getInstance(): SupabaseAuth {
    if (!SupabaseAuth.instance) {
      SupabaseAuth.instance = new SupabaseAuth();
    }
    return SupabaseAuth.instance;
  }

  /**
   * Obtiene el cliente de Supabase subyacente
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

  /**
   * Iniciar sesión con email y contraseña
   */
  public async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log(`Iniciando sesión con email: ${email}`);

      // Verificar que los parámetros sean válidos
      if (!email || !password) {
        console.error('Email o contraseña no proporcionados');
        return {
          data: null,
          error: new Error('Email y contraseña son requeridos'),
          status: 'error',
          message: 'Email y contraseña son requeridos'
        };
      }

      // Intentar iniciar sesión
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error al iniciar sesión:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      // Almacenar información de la sesión para depuración y verificar cookies
      if (data.session && typeof window !== 'undefined') {
        console.log('🍪 Sesión establecida correctamente');
        console.log('🔑 Access token:', data.session.access_token.substring(0, 20) + '...');
        console.log('🔄 Refresh token:', data.session.refresh_token?.substring(0, 20) + '...');
        console.log('⏰ Expires at:', new Date(data.session.expires_at * 1000).toISOString());

        localStorage.setItem('login_success', 'true');
        localStorage.setItem('login_time', new Date().toISOString());
        localStorage.setItem('session_user_id', data.user.id);
        localStorage.setItem('supabase_session_debug', JSON.stringify({
          user_id: data.user.id,
          expires_at: data.session.expires_at,
          established_at: new Date().toISOString(),
          access_token_preview: data.session.access_token.substring(0, 20) + '...'
        }));

        if (data.session.expires_at) {
          localStorage.setItem('session_expiry', new Date(data.session.expires_at * 1000).toISOString());
        }

        // Verificar que las cookies se establecieron
        setTimeout(() => {
          const cookies = document.cookie.split(';').map(c => c.trim());
          const supabaseCookies = cookies.filter(c => c.includes('sb-'));
          console.log('🍪 Cookies de Supabase encontradas:', supabaseCookies.length);
          supabaseCookies.forEach(cookie => {
            console.log('🍪', cookie.split('=')[0]);
          });

          if (supabaseCookies.length === 0) {
            console.warn('⚠️ No se encontraron cookies de Supabase después del login');
          }
        }, 100);
      }

      return {
        data,
        error: null,
        status: 'success',
        message: 'Inicio de sesión exitoso'
      };
    } catch (error) {
      console.error('Error inesperado al iniciar sesión:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al iniciar sesión'),
        status: 'error',
        message: 'Ocurrió un error inesperado al iniciar sesión'
      };
    }
  }

  /**
   * Registrar un nuevo usuario
   */
  public async signUp(email: string, password: string, options?: {
    data?: Record<string, any>,
    redirectTo?: string
  }): Promise<AuthResponse> {
    try {
      console.log(`Registrando nuevo usuario con email: ${email}`);

      // Verificar que los parámetros sean válidos
      if (!email || !password) {
        console.error('Email o contraseña no proporcionados');
        return {
          data: null,
          error: new Error('Email y contraseña son requeridos'),
          status: 'error',
          message: 'Email y contraseña son requeridos'
        };
      }

      // Configurar opciones de registro
      const signUpOptions: any = {
        email,
        password,
        options: {
          data: options?.data || {},
          emailRedirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`
        }
      };

      // Intentar registrar al usuario
      const { data, error } = await this.client.auth.signUp(signUpOptions);

      if (error) {
        console.error('Error al registrar usuario:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      return {
        data,
        error: null,
        status: 'success',
        message: 'Registro exitoso. Por favor, verifica tu correo electrónico.'
      };
    } catch (error) {
      console.error('Error inesperado al registrar usuario:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al registrar usuario'),
        status: 'error',
        message: 'Ocurrió un error inesperado al registrar usuario'
      };
    }
  }

  /**
   * Iniciar sesión con un proveedor externo (Google, Facebook, etc.)
   */
  public async signInWithProvider(provider: Provider): Promise<AuthResponse> {
    try {
      console.log(`Iniciando sesión con proveedor: ${provider}`);

      // Configurar opciones de inicio de sesión
      const options = {
        redirectTo: `${window.location.origin}/auth/callback`
      };

      // Intentar iniciar sesión con el proveedor
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider,
        options
      });

      if (error) {
        console.error(`Error al iniciar sesión con ${provider}:`, error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      return {
        data,
        error: null,
        status: 'success',
        message: `Redirigiendo a ${provider} para iniciar sesión...`
      };
    } catch (error) {
      console.error(`Error inesperado al iniciar sesión con ${provider}:`, error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error(`Error inesperado al iniciar sesión con ${provider}`),
        status: 'error',
        message: `Ocurrió un error inesperado al iniciar sesión con ${provider}`
      };
    }
  }

  /**
   * Obtener un mensaje de error amigable para el usuario
   */
  private getErrorMessage(error: AuthError | Error): string {
    const message = error.message || 'Ocurrió un error desconocido';

    // Mapear mensajes de error comunes a mensajes más amigables
    if (message.includes('Invalid login credentials')) {
      return 'Credenciales de inicio de sesión inválidas. Por favor, verifica tu correo y contraseña.';
    } else if (message.includes('Email not confirmed')) {
      return 'Correo electrónico no confirmado. Por favor, verifica tu bandeja de entrada y confirma tu correo.';
    } else if (message.includes('User already registered')) {
      return 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
    } else if (message.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    } else if (message.includes('JWT expired')) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    } else if (message.includes('Auth session missing')) {
      return 'No se encontró una sesión válida. Por favor, inicia sesión de nuevo.';
    } else if (message.includes('rate limit')) {
      return 'Has realizado demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.';
    }

    return message;
  }

  /**
   * Cerrar sesión
   */
  public async signOut(): Promise<AuthResponse> {
    try {
      console.log('Cerrando sesión...');

      // Limpiar datos de sesión antes de cerrar sesión
      this.clearSessionData();

      const { error } = await this.client.auth.signOut();

      if (error) {
        console.error('Error al cerrar sesión:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      return {
        data: null,
        error: null,
        status: 'success',
        message: 'Sesión cerrada correctamente'
      };
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al cerrar sesión'),
        status: 'error',
        message: 'Ocurrió un error inesperado al cerrar sesión'
      };
    }
  }

  /**
   * Obtener la sesión actual
   */
  public async getSession(): Promise<AuthResponse<{ session: Session | null; user: User | null }>> {
    try {
      console.log('Obteniendo sesión actual...');

      const { data, error } = await this.client.auth.getSession();

      if (error) {
        console.error('Error al obtener sesión:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      return {
        data: {
          session: data.session,
          user: data.session?.user || null
        },
        error: null,
        status: 'success',
        message: data.session ? 'Sesión obtenida correctamente' : 'No hay sesión activa'
      };
    } catch (error) {
      console.error('Error inesperado al obtener sesión:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al obtener sesión'),
        status: 'error',
        message: 'Ocurrió un error inesperado al obtener sesión'
      };
    }
  }

  /**
   * Refrescar la sesión actual
   */
  public async refreshSession(): Promise<AuthResponse<{ session: Session | null; user: User | null }>> {
    try {
      console.log('Refrescando sesión...');

      const { data, error } = await this.client.auth.refreshSession();

      if (error) {
        console.error('Error al refrescar sesión:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      // Almacenar información de la sesión refrescada
      if (data.session && typeof window !== 'undefined') {
        localStorage.setItem('session_refreshed', 'true');
        localStorage.setItem('session_refresh_time', new Date().toISOString());

        if (data.session.expires_at) {
          localStorage.setItem('session_expiry', new Date(data.session.expires_at * 1000).toISOString());
        }
      }

      return {
        data: {
          session: data.session,
          user: data.user
        },
        error: null,
        status: 'success',
        message: 'Sesión refrescada correctamente'
      };
    } catch (error) {
      console.error('Error inesperado al refrescar sesión:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al refrescar sesión'),
        status: 'error',
        message: 'Ocurrió un error inesperado al refrescar sesión'
      };
    }
  }

  /**
   * Enviar correo de restablecimiento de contraseña
   */
  public async resetPassword(email: string): Promise<AuthResponse> {
    try {
      console.log(`Enviando correo de restablecimiento a: ${email}`);

      // Verificar que el email sea válido
      if (!email) {
        console.error('Email no proporcionado');
        return {
          data: null,
          error: new Error('Email es requerido'),
          status: 'error',
          message: 'Email es requerido'
        };
      }

      // Configurar opciones de restablecimiento
      const resetOptions = {
        redirectTo: `${window.location.origin}/auth/reset-password`
      };

      // Intentar enviar correo de restablecimiento
      const { data, error } = await this.client.auth.resetPasswordForEmail(email, resetOptions);

      if (error) {
        console.error('Error al enviar correo de restablecimiento:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      return {
        data,
        error: null,
        status: 'success',
        message: `Se ha enviado un correo de restablecimiento a ${email}`
      };
    } catch (error) {
      console.error('Error inesperado al enviar correo de restablecimiento:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al enviar correo de restablecimiento'),
        status: 'error',
        message: 'Ocurrió un error inesperado al enviar correo de restablecimiento'
      };
    }
  }

  /**
   * Actualizar contraseña
   */
  public async updatePassword(password: string, token?: string): Promise<AuthResponse> {
    try {
      console.log('Actualizando contraseña...');

      // Verificar que la contraseña sea válida
      if (!password) {
        console.error('Contraseña no proporcionada');
        return {
          data: null,
          error: new Error('Contraseña es requerida'),
          status: 'error',
          message: 'Contraseña es requerida'
        };
      }

      let result;

      // Si se proporciona un token, usar el método para actualizar con token
      if (token) {
        console.log('Actualizando contraseña con token...');

        // Usar el método updateUser con el token
        result = await this.client.auth.updateUser({
          password
        }, {
          emailRedirectTo: `${window.location.origin}/auth/login`
        });
      } else {
        // Actualizar contraseña del usuario actual (debe estar autenticado)
        console.log('Actualizando contraseña de usuario autenticado...');
        result = await this.client.auth.updateUser({ password });
      }

      const { data, error } = result;

      if (error) {
        console.error('Error al actualizar contraseña:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: this.getErrorMessage(error)
        };
      }

      return {
        data,
        error: null,
        status: 'success',
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      console.error('Error inesperado al actualizar contraseña:', error);

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Error inesperado al actualizar contraseña'),
        status: 'error',
        message: 'Ocurrió un error inesperado al actualizar contraseña'
      };
    }
  }
}

// Exportar una instancia única del servicio
export const supabaseAuth = SupabaseAuth.getInstance();