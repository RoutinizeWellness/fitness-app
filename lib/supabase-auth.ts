import { supabase } from './supabase-client';
import { User, Session, AuthError } from '@supabase/supabase-js';

// Tipos para autenticación
export type AuthResponse = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};

export type AuthProviderOptions = {
  provider: 'google' | 'facebook' | 'twitter' | 'github';
  redirectTo?: string;
};

// Funciones de autenticación mejoradas
export const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (e) {
    console.error("Error en signUpWithEmail:", e);
    return {
      user: null,
      session: null,
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en signUpWithEmail'),
    };
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (e) {
    console.error("Error en signInWithEmail:", e);
    return {
      user: null,
      session: null,
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en signInWithEmail'),
    };
  }
};

export const signInWithProvider = async (options: AuthProviderOptions): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: options.provider,
      options: {
        redirectTo: options.redirectTo,
      },
    });

    return { error };
  } catch (e) {
    console.error(`Error en signInWithProvider (${options.provider}):`, e);
    return {
      error: e instanceof AuthError ? e : new AuthError(`Error desconocido en signInWithProvider (${options.provider})`),
    };
  }
};

export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    return { error };
  } catch (e) {
    console.error("Error en resetPassword:", e);
    return {
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en resetPassword'),
    };
  }
};

export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  } catch (e) {
    console.error("Error en updatePassword:", e);
    return {
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en updatePassword'),
    };
  }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (e) {
    console.error("Error en signOut:", e);
    return {
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en signOut'),
    };
  }
};

export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data?.user || null, error };
  } catch (e) {
    console.error("Error en getCurrentUser:", e);
    return {
      user: null,
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en getCurrentUser'),
    };
  }
};

export const getSession = async (): Promise<{ session: Session | null; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session || null, error };
  } catch (e) {
    console.error("Error en getSession:", e);
    return {
      session: null,
      error: e instanceof AuthError ? e : new AuthError('Error desconocido en getSession'),
    };
  }
};

// Función para escuchar cambios en la autenticación
export const onAuthStateChange = (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY', session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
