'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseAuth } from './supabase-auth';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// Tipo para el perfil de usuario
export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  weight?: number;
  height?: number;
  goal?: string;
  level?: string;
  is_admin?: boolean;
  onboarding_completed?: boolean;
  experience_level?: string;
  interface_mode?: string;
  created_at: string;
  updated_at?: string;
};

// Tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any, error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ data: any, error: any }>;
  refreshProfile: () => Promise<UserProfile | null>;
  isSessionExpiring: () => boolean;
  refreshSession: () => Promise<boolean>;
};

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de autenticación
 * Gestiona el estado de autenticación y proporciona métodos para interactuar con la autenticación
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Efecto para obtener la sesión inicial y configurar el listener de cambios de autenticación
  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabaseAuth.getSession();

        if (error) {
          console.error('Error al obtener sesión inicial:', error);
          toast({
            title: 'Error',
            description: 'Error al obtener sesión. Por favor, intenta de nuevo.',
            variant: 'destructive'
          });
        }

        setSession(data?.session || null);
        setUser(data?.user || null);

        // Cargar el perfil del usuario si hay un usuario
        if (data?.user) {
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error inesperado al obtener sesión inicial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Configurar listener para cambios de autenticación usando el cliente optimizado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.id);

        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ Usuario ha iniciado sesión:', session?.user?.id);
            setUser(session?.user || null);
            setSession(session);

            // Cargar el perfil del usuario
            if (session?.user) {
              await refreshProfile();
            }

            setIsLoading(false);
            break;

          case 'SIGNED_OUT':
            console.log('👋 Usuario ha cerrado sesión');
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsLoading(false);
            break;

          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refrescado para usuario:', session?.user?.id);
            setUser(session?.user || null);
            setSession(session);
            break;

          case 'USER_UPDATED':
            console.log('👤 Usuario actualizado:', session?.user?.id);
            setUser(session?.user || null);
            setSession(session);
            break;

          default:
            console.log('🔔 Evento de auth:', event);
            setSession(session);
            setUser(session?.user || null);

            // Cargar el perfil del usuario si hay un usuario
            if (session?.user) {
              await refreshProfile();
            } else {
              setProfile(null);
            }

            setIsLoading(false);
            break;
        }
      }
    );

    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  /**
   * Verifica si la sesión está por expirar (menos de 15 minutos)
   */
  const isSessionExpiring = (): boolean => {
    if (!session?.expires_at) return false;

    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const fifteenMinutesInSeconds = 15 * 60;

    return expiresAt - now < fifteenMinutesInSeconds;
  };

  /**
   * Refresca la sesión actual
   */
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabaseAuth.refreshSession();

      if (error) {
        console.error('Error al refrescar sesión:', error);
        return false;
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error inesperado al refrescar sesión:', error);
      return false;
    }
  };

  /**
   * Refresca el perfil del usuario
   */
  const refreshProfile = async (): Promise<UserProfile | null> => {
    try {
      if (!user) {
        setProfile(null);
        return null;
      }

      console.log('Refrescando perfil para el usuario:', user.id);

      // Obtener el perfil del usuario
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error al obtener perfil:', error);

        // Si el error es que no se encontró el perfil, intentar crearlo
        if (error.code === 'PGRST116') {
          console.log('Perfil no encontrado, intentando crear uno por defecto');

          // Crear un perfil por defecto
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              full_name: user.email || 'Usuario',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              onboarding_completed: false,
              experience_level: 'beginner',
              interface_mode: 'beginner'
            })
            .select('*')
            .single();

          if (insertError) {
            console.error('Error al crear perfil:', insertError);
            return null;
          }

          console.log('Perfil creado exitosamente:', newProfile);
          setProfile(newProfile);
          return newProfile;
        }

        return null;
      }

      console.log('Perfil obtenido exitosamente:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error inesperado al refrescar perfil:', error);
      return null;
    }
  };

  /**
   * Inicia sesión con email y contraseña
   */
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Intentando iniciar sesión con email:', email);

      const { data, error, status, message } = await supabaseAuth.signInWithPassword(email, password);

      if (error) {
        console.error('❌ Error al iniciar sesión:', error);

        toast({
          title: 'Error de inicio de sesión',
          description: message || 'Error al iniciar sesión',
          variant: 'destructive'
        });

        return { data: null, error };
      }

      console.log('✅ Inicio de sesión exitoso, usuario:', data?.user?.id);
      console.log('🍪 Sesión establecida:', !!data?.session);

      // Actualizar estado inmediatamente
      setUser(data?.user || null);
      setSession(data?.session || null);

      // Verificar que la sesión se estableció correctamente
      if (data?.session) {
        console.log('✅ Sesión válida establecida, expires_at:', new Date(data.session.expires_at * 1000).toISOString());

        // Almacenar información de depuración
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_success', 'true');
          localStorage.setItem('auth_success_time', new Date().toISOString());
          localStorage.setItem('auth_user_id', data.user.id);
        }
      } else {
        console.warn('⚠️ Login exitoso pero no se estableció sesión');
      }

      // Mostrar toast de éxito
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Has iniciado sesión correctamente',
      });

      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inesperado al iniciar sesión:', error);

      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });

      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { error, status, message } = await supabaseAuth.signUp(email, password);

      if (error) {
        console.error('Error al registrar usuario:', error);

        toast({
          title: 'Error de registro',
          description: message || 'Error al registrar usuario',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Registro exitoso',
          description: 'Revisa tu correo electrónico para confirmar tu cuenta.',
        });
      }

      return { error };
    } catch (error) {
      console.error('Error inesperado al registrar usuario:', error);

      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });

      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra la sesión actual
   */
  const signOut = async () => {
    try {
      setIsLoading(true);

      // Limpiar estado antes de cerrar sesión
      setUser(null);
      setSession(null);
      setProfile(null);

      const { error, status, message } = await supabaseAuth.signOut();

      if (error) {
        console.error('Error al cerrar sesión:', error);

        toast({
          title: 'Error al cerrar sesión',
          description: message || 'Error al cerrar sesión',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sesión cerrada',
          description: 'Has cerrado sesión correctamente.',
        });

        // Redirigir a la página de inicio de sesión
        router.push('/auth/login?reason=signed_out');
      }

      return { error };
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);

      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });

      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envía un correo de restablecimiento de contraseña
   */
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);

      const { error, status, message } = await supabaseAuth.resetPassword(email);

      if (error) {
        console.error('Error al restablecer contraseña:', error);

        toast({
          title: 'Error al restablecer contraseña',
          description: message || 'Error al restablecer contraseña',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Correo enviado',
          description: 'Revisa tu correo electrónico para restablecer tu contraseña.',
        });
      }

      return { error };
    } catch (error) {
      console.error('Error inesperado al restablecer contraseña:', error);

      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });

      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia sesión con Google
   */
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('Intentando iniciar sesión con Google');

      const { data, error, status, message } = await supabaseAuth.signInWithProvider('google');

      if (error) {
        console.error('Error al iniciar sesión con Google:', error);

        toast({
          title: 'Error al iniciar sesión con Google',
          description: message || 'Error al iniciar sesión con Google',
          variant: 'destructive'
        });

        return { data: null, error };
      }

      console.log('Inicio de sesión con Google iniciado correctamente');

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado al iniciar sesión con Google:', error);

      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });

      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    refreshProfile,
    isSessionExpiring,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};