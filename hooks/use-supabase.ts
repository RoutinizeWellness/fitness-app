import { useState, useEffect, useCallback } from 'react';
import { RealtimeSubscription, SubscriptionCallback, SubscriptionOptions } from '@/lib/supabase-realtime';
import * as supabaseLib from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Hook para manejar la autenticación con Supabase
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar el usuario actual al montar el componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const { user: currentUser, error: userError } = await supabaseLib.getCurrentUser();
        
        if (userError) {
          throw userError;
        }
        
        setUser(currentUser);
        
        // Si hay un usuario, cargar su perfil
        if (currentUser) {
          const { data: userProfile, error: profileError } = await supabaseLib.getUserProfile(currentUser.id);
          
          if (profileError) {
            console.error('Error al cargar el perfil:', profileError);
          } else {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.error('Error al cargar el usuario:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido al cargar el usuario'));
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
    
    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabaseLib.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Cargar el perfil del usuario
        const { data: userProfile } = await supabaseLib.getUserProfile(session.user.id);
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
      }
    });
    
    // Limpiar la suscripción al desmontar
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Función para iniciar sesión con email y contraseña
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: signedInUser, error: signInError } = await supabaseLib.signInWithEmail(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      return { user: signedInUser, error: null };
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al iniciar sesión'));
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para registrarse con email y contraseña
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: signedUpUser, error: signUpError } = await supabaseLib.signUpWithEmail(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      return { user: signedUpUser, error: null };
    } catch (err) {
      console.error('Error al registrarse:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al registrarse'));
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cerrar sesión
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabaseLib.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al cerrar sesión'));
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar el perfil del usuario
  const updateProfile = useCallback(async (updates: any) => {
    if (!user) {
      return { error: new Error('No hay un usuario autenticado') };
    }
    
    try {
      setLoading(true);
      const { data: updatedProfile, error: updateError } = await supabaseLib.updateUserProfile(user.id, updates);
      
      if (updateError) {
        throw updateError;
      }
      
      setProfile(updatedProfile);
      
      return { profile: updatedProfile, error: null };
    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al actualizar el perfil'));
      return { profile: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para refrescar el perfil del usuario
  const refreshProfile = useCallback(async () => {
    if (!user) {
      return { error: new Error('No hay un usuario autenticado') };
    }
    
    try {
      setLoading(true);
      const { data: refreshedProfile, error: refreshError } = await supabaseLib.getUserProfile(user.id);
      
      if (refreshError) {
        throw refreshError;
      }
      
      setProfile(refreshedProfile);
      
      return { profile: refreshedProfile, error: null };
    } catch (err) {
      console.error('Error al refrescar el perfil:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al refrescar el perfil'));
      return { profile: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };
};

// Hook para manejar las queries a Supabase
export const useSupabaseQuery = <T>(
  queryFn: () => Promise<supabaseLib.QueryResponse<T>>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Ejecutar la query
  const execute = useCallback(async () => {
    try {
      setLoading(true);
      const { data: queryData, error: queryError } = await queryFn();
      
      if (queryError) {
        throw queryError;
      }
      
      setData(queryData);
      return { data: queryData, error: null };
    } catch (err) {
      console.error('Error en la query:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido en la query'));
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [queryFn]);

  // Ejecutar la query al montar el componente o cuando cambien las dependencias
  useEffect(() => {
    execute();
  }, [...dependencies]);

  // Función para refrescar los datos
  const refresh = useCallback(async () => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

// Hook para manejar las mutaciones a Supabase
export const useSupabaseMutation = <T, P>(
  mutationFn: (params: P) => Promise<supabaseLib.QueryResponse<T>>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Ejecutar la mutación
  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      const { data: mutationData, error: mutationError } = await mutationFn(params);
      
      if (mutationError) {
        throw mutationError;
      }
      
      setData(mutationData);
      return { data: mutationData, error: null };
    } catch (err) {
      console.error('Error en la mutación:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido en la mutación'));
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return {
    data,
    loading,
    error,
    mutate,
  };
};

// Hook para manejar las suscripciones en tiempo real a Supabase
export const useSupabaseRealtime = <T>(
  options: SubscriptionOptions,
  callback?: SubscriptionCallback<T>
) => {
  const [subscription, setSubscription] = useState<RealtimeSubscription<T> | null>(null);

  // Crear la suscripción al montar el componente
  useEffect(() => {
    // Callback por defecto que actualiza el estado
    const defaultCallback: SubscriptionCallback<T> = (payload) => {
      console.log('Cambio en tiempo real:', payload);
    };
    
    // Crear la suscripción
    const sub = new supabaseLib.RealtimeSubscription<T>(
      options,
      callback || defaultCallback
    );
    
    // Iniciar la suscripción
    sub.subscribe();
    setSubscription(sub);
    
    // Detener la suscripción al desmontar
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [options, callback]);

  return {
    subscription,
  };
};

// Hook para manejar el storage de Supabase
export const useSupabaseStorage = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Función para subir un archivo
  const uploadFile = useCallback(async (options: supabaseLib.UploadOptions) => {
    try {
      setUploading(true);
      const { data: fileUrl, error: uploadError } = await supabaseLib.uploadFile(options);
      
      if (uploadError) {
        throw uploadError;
      }
      
      return { url: fileUrl, error: null };
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al subir el archivo'));
      return { url: null, error: err };
    } finally {
      setUploading(false);
    }
  }, []);

  // Función para subir una imagen de perfil
  const uploadProfileImage = useCallback(async (userId: string, file: File) => {
    try {
      setUploading(true);
      const { data: fileUrl, error: uploadError } = await supabaseLib.uploadProfileImage(userId, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      return { url: fileUrl, error: null };
    } catch (err) {
      console.error('Error al subir la imagen de perfil:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al subir la imagen de perfil'));
      return { url: null, error: err };
    } finally {
      setUploading(false);
    }
  }, []);

  // Función para eliminar un archivo
  const removeFile = useCallback(async (bucket: string, path: string) => {
    try {
      const { error: removeError } = await supabaseLib.removeUserFile(bucket, path);
      
      if (removeError) {
        throw removeError;
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error al eliminar el archivo:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al eliminar el archivo'));
      return { error: err };
    }
  }, []);

  return {
    uploading,
    error,
    uploadFile,
    uploadProfileImage,
    removeFile,
    getPublicUrl: supabaseLib.getPublicUrl,
  };
};
