import { supabase } from './supabase-client';
import { AuthError } from '@supabase/supabase-js';

/**
 * Inicia sesión con Google utilizando OAuth
 * @returns Un objeto con el resultado de la operación
 */
export const signInWithGoogle = async (): Promise<{ data: any; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    return { data, error };
  } catch (e) {
    console.error("Error en signInWithGoogle:", e);
    return { 
      data: null, 
      error: e instanceof AuthError ? e : new AuthError("Error desconocido en signInWithGoogle") 
    };
  }
};

/**
 * Maneja la creación o actualización de perfil después de autenticación con proveedores externos
 * @param user El usuario autenticado
 */
export const handleExternalAuth = async (user: any): Promise<void> => {
  if (!user) return;
  
  try {
    // Verificar si el usuario ya tiene un perfil
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error al verificar perfil:", error);
      return;
    }
    
    // Si el usuario no tiene perfil, crear uno nuevo
    if (!profileData) {
      // Obtener información del usuario desde los metadatos
      const fullName = user.user_metadata?.full_name || 
                      `${user.user_metadata?.given_name || ''} ${user.user_metadata?.family_name || ''}`.trim() ||
                      user.email?.split('@')[0] || 
                      'Usuario';
      
      const avatarUrl = user.user_metadata?.avatar_url || null;
      
      // Verificar si el email es admin@routinize.com para asignar rol de administrador
      const isAdmin = user.email?.toLowerCase() === 'admin@routinize.com';
      
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          is_admin: isAdmin,
          level: "Principiante",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error al crear perfil:", insertError);
      }
    } 
    // Si el usuario tiene perfil pero es admin@routinize.com y no tiene rol de admin, actualizarlo
    else if (user.email?.toLowerCase() === 'admin@routinize.com' && !profileData.is_admin) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
      
      if (updateError) {
        console.error("Error al actualizar perfil:", updateError);
      }
    }
  } catch (error) {
    console.error("Error al manejar autenticación externa:", error);
  }
};
