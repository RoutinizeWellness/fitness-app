import { supabase, handleSupabaseError, TABLES, COLUMNS, AUTH } from "../supabase-client-enhanced"
import { User } from "@supabase/supabase-js"

/**
 * Registrar un nuevo usuario
 * @param email - Correo electrónico
 * @param password - Contraseña
 * @returns - Usuario registrado o error
 */
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: AUTH.REDIRECT_URL,
        data: {
          email_confirmed: true
        }
      }
    })

    if (error) {
      return { user: null, error: handleSupabaseError(error, "Error al registrar usuario") }
    }

    // Si el registro fue exitoso y tenemos un usuario, crear su perfil
    if (data?.user) {
      try {
        await createUserProfile({
          user_id: data.user.id,
          full_name: email.split('@')[0], // Usar la parte del email antes del @ como nombre
          is_admin: email.toLowerCase() === 'admin@routinize.com',
          level: "Principiante",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } catch (profileError) {
        console.error("Error al crear perfil durante el registro:", profileError)
      }
    }

    return { user: data?.user || null, error: null }
  } catch (e) {
    console.error("Error en signUp:", e)
    return { user: null, error: e instanceof Error ? e : new Error("Error desconocido en signUp") }
  }
}

/**
 * Iniciar sesión con email y contraseña
 * @param email - Correo electrónico
 * @param password - Contraseña
 * @returns - Usuario autenticado o error
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, session: null, error: handleSupabaseError(error, "Error al iniciar sesión") }
    }

    // Si el inicio de sesión fue exitoso y el email es admin@routinize.com
    if (data?.user && email.toLowerCase() === 'admin@routinize.com') {
      try {
        // Verificar si el usuario ya tiene un perfil
        const { data: profileData } = await getUserProfile(data.user.id)

        // Si tiene perfil pero no es admin, actualizarlo
        if (profileData && !profileData.is_admin) {
          await updateUserProfile(data.user.id, { is_admin: true })
        }
        // Si no tiene perfil, crearlo con rol de admin
        else if (!profileData) {
          await createUserProfile({
            user_id: data.user.id,
            full_name: "Administrador",
            is_admin: true,
            level: "Avanzado",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } catch (profileError) {
        console.error("Error al verificar/actualizar perfil de administrador:", profileError)
      }
    }

    return { user: data?.user || null, session: data?.session || null, error: null }
  } catch (e) {
    console.error("Error en signIn:", e)
    return { user: null, session: null, error: e instanceof Error ? e : new Error("Error desconocido en signIn") }
  }
}

/**
 * Iniciar sesión con Google
 * @returns - Redirección a Google o error
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: AUTH.REDIRECT_URL,
      }
    })

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al iniciar sesión con Google") }
    }

    return { data, error: null }
  } catch (e) {
    console.error("Error en signInWithGoogle:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en signInWithGoogle") }
  }
}

/**
 * Cerrar sesión
 * @returns - Éxito o error
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: handleSupabaseError(error, "Error al cerrar sesión") }
    }

    return { success: true, error: null }
  } catch (e) {
    console.error("Error en signOut:", e)
    return { success: false, error: e instanceof Error ? e : new Error("Error desconocido en signOut") }
  }
}

/**
 * Obtener el usuario actual
 * @returns - Usuario actual o null
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: handleSupabaseError(error, "Error al obtener usuario actual") }
    }

    return { user: data?.user || null, error: null }
  } catch (e) {
    console.error("Error en getCurrentUser:", e)
    return { user: null, error: e instanceof Error ? e : new Error("Error desconocido en getCurrentUser") }
  }
}

/**
 * Restablecer contraseña
 * @param email - Correo electrónico
 * @returns - Éxito o error
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: AUTH.RESET_PASSWORD_URL,
    })

    if (error) {
      return { success: false, error: handleSupabaseError(error, "Error al restablecer contraseña") }
    }

    return { success: true, error: null }
  } catch (e) {
    console.error("Error en resetPassword:", e)
    return { success: false, error: e instanceof Error ? e : new Error("Error desconocido en resetPassword") }
  }
}

/**
 * Actualizar contraseña
 * @param password - Nueva contraseña
 * @returns - Éxito o error
 */
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { success: false, error: handleSupabaseError(error, "Error al actualizar contraseña") }
    }

    return { success: true, error: null }
  } catch (e) {
    console.error("Error en updatePassword:", e)
    return { success: false, error: e instanceof Error ? e : new Error("Error desconocido en updatePassword") }
  }
}

/**
 * Suscribirse a cambios de autenticación
 * @param callback - Función a ejecutar cuando cambie el estado de autenticación
 * @returns - Suscripción
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Crear un perfil de usuario
 * @param profile - Datos del perfil
 * @returns - Perfil creado o error
 */
export const createUserProfile = async (profile: any) => {
  try {
    // Verificar que el perfil y el user_id sean válidos
    if (!profile || !profile.user_id) {
      console.error("createUserProfile: perfil o user_id no válidos", profile)
      return { data: null, error: new Error("Perfil o user_id no válidos") }
    }

    // Asegurarse de que el perfil tenga los campos mínimos necesarios
    const completeProfile = {
      ...profile,
      full_name: profile.full_name || "Usuario",
    }

    // Realizar la inserción en Supabase
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .insert([completeProfile])
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al crear perfil de usuario") }
    }

    return { data: data[0] || null, error: null }
  } catch (e) {
    console.error("Error en createUserProfile:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en createUserProfile") }
  }
}

/**
 * Obtener el perfil de un usuario
 * @param userId - ID del usuario
 * @returns - Perfil del usuario o error
 */
export const getUserProfile = async (userId: string) => {
  try {
    // Verificar que userId sea válido
    if (!userId) {
      return { data: null, error: new Error("userId es requerido") }
    }

    // Obtener el perfil de Supabase
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select("*")
      .eq(COLUMNS.USER_ID, userId)
      .maybeSingle()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al obtener perfil de usuario") }
    }

    return { data, error: null }
  } catch (e) {
    console.error("Error en getUserProfile:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getUserProfile") }
  }
}

/**
 * Actualizar el perfil de un usuario
 * @param userId - ID del usuario
 * @param updates - Datos a actualizar
 * @returns - Perfil actualizado o error
 */
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    // Verificar que userId sea válido
    if (!userId) {
      return { data: null, error: new Error("userId es requerido") }
    }

    // Preparar los datos para la operación
    const profileData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // Actualizar el perfil en Supabase
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .update(profileData)
      .eq(COLUMNS.USER_ID, userId)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al actualizar perfil de usuario") }
    }

    return { data: data[0] || null, error: null }
  } catch (e) {
    console.error("Error en updateUserProfile:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en updateUserProfile") }
  }
}
