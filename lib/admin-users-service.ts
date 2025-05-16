import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';

// Tipos
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  role?: 'user' | 'trainer' | 'nutritionist' | 'admin';
  created_at: string;
  last_sign_in_at?: string;
  status?: 'active' | 'suspended' | 'pending';
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  weight?: number;
  height?: number;
  goal?: string;
  level?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  role?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserStats {
  total: number;
  active: number;
  new_this_month: number;
  admins: number;
  trainers: number;
  nutritionists: number;
  verified: number;
}

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Obtiene todos los usuarios con sus perfiles
 */
export const getAllUsers = async (options?: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<QueryResponse<{ users: User[]; total: number }>> => {
  try {
    // Obtener usuarios de auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: options?.offset ? Math.floor(options.offset / (options.limit || 10)) + 1 : 1,
      perPage: options?.limit || 10
    });

    if (authError) throw authError;

    // Obtener perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesErrors;

    // Combinar datos
    let users: User[] = authUsers.users.map(authUser => {
      const profile = profiles.find(p => p.user_id === authUser.id) || {};
      
      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile.avatar_url || authUser.user_metadata?.avatar_url || '',
        is_admin: profile.is_admin || false,
        is_verified: profile.is_verified || false,
        role: profile.is_admin ? 'admin' : (profile.role || 'user'),
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        status: authUser.banned ? 'suspended' : (authUser.email_confirmed_at ? 'active' : 'pending')
      };
    });

    // Aplicar filtros
    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm))
      );
    }

    if (options?.role && options.role !== 'all') {
      users = users.filter(user => user.role === options.role);
    }

    if (options?.status && options.status !== 'all') {
      users = users.filter(user => user.status === options.status);
    }

    // Obtener total
    const total = users.length;

    // Aplicar paginación
    if (options?.limit && options?.offset !== undefined) {
      users = users.slice(options.offset, options.offset + options.limit);
    } else if (options?.limit) {
      users = users.slice(0, options.limit);
    }

    return { data: { users, total }, error: null };
  } catch (e) {
    console.error('Error en getAllUsers:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getAllUsers')
    };
  }
};

/**
 * Obtiene un usuario por su ID
 */
export const getUserById = async (userId: string): Promise<QueryResponse<User>> => {
  try {
    // Obtener usuario de auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) throw authError;
    if (!authUser) throw new Error('Usuario no encontrado');

    // Obtener perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') throw profileError;

    // Combinar datos
    const user: User = {
      id: authUser.user.id,
      email: authUser.user.email || '',
      full_name: profile?.full_name || authUser.user.user_metadata?.full_name || '',
      avatar_url: profile?.avatar_url || authUser.user.user_metadata?.avatar_url || '',
      is_admin: profile?.is_admin || false,
      is_verified: profile?.is_verified || false,
      role: profile?.is_admin ? 'admin' : (profile?.role || 'user'),
      created_at: authUser.user.created_at,
      last_sign_in_at: authUser.user.last_sign_in_at,
      status: authUser.user.banned ? 'suspended' : (authUser.user.email_confirmed_at ? 'active' : 'pending')
    };

    return { data: user, error: null };
  } catch (e) {
    console.error(`Error en getUserById:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getUserById`)
    };
  }
};

/**
 * Actualiza el perfil de un usuario
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<QueryResponse<UserProfile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (e) {
    console.error(`Error en updateUserProfile:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en updateUserProfile`)
    };
  }
};

/**
 * Elimina un usuario y su perfil
 */
export const deleteUser = async (userId: string): Promise<QueryResponse<boolean>> => {
  try {
    // Eliminar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) throw profileError;

    // Eliminar usuario de auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) throw authError;

    return { data: true, error: null };
  } catch (e) {
    console.error(`Error en deleteUser:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en deleteUser`)
    };
  }
};

/**
 * Cambia el estado de verificación de un usuario
 */
export const toggleUserVerification = async (
  userId: string,
  isVerified: boolean
): Promise<QueryResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (e) {
    console.error(`Error en toggleUserVerification:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en toggleUserVerification`)
    };
  }
};

/**
 * Cambia el rol de un usuario
 */
export const changeUserRole = async (
  userId: string,
  role: string
): Promise<QueryResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role, 
        is_admin: role === 'admin',
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (e) {
    console.error(`Error en changeUserRole:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en changeUserRole`)
    };
  }
};

/**
 * Obtiene estadísticas de usuarios
 */
export const getUserStats = async (): Promise<QueryResponse<UserStats>> => {
  try {
    // Obtener fecha de inicio del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Obtener total de usuarios
    const { count: total, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Obtener usuarios activos (que han iniciado sesión en los últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: active, error: activeError } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

    if (activeError) throw activeError;

    // Obtener nuevos usuarios este mes
    const { count: newThisMonth, error: newError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    if (newError) throw newError;

    // Obtener administradores
    const { count: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);

    if (adminsError) throw adminsError;

    // Obtener entrenadores
    const { count: trainers, error: trainersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'trainer');

    if (trainersError) throw trainersError;

    // Obtener nutricionistas
    const { count: nutritionists, error: nutritionistsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'nutritionist');

    if (nutritionistsError) throw nutritionistsError;

    // Obtener usuarios verificados
    const { count: verified, error: verifiedError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    if (verifiedError) throw verifiedError;

    return {
      data: {
        total: total || 0,
        active: active || 0,
        new_this_month: newThisMonth || 0,
        admins: admins || 0,
        trainers: trainers || 0,
        nutritionists: nutritionists || 0,
        verified: verified || 0
      },
      error: null
    };
  } catch (e) {
    console.error('Error en getUserStats:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getUserStats')
    };
  }
};
