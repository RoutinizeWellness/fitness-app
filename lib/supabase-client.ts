import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Cliente de Supabase optimizado para el navegador con manejo correcto de cookies
 */
function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-application-name': 'routinize-fitness-app',
      },
    },
  })
}

/**
 * Cliente singleton para uso en el navegador
 */
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

// Exportar el cliente de Supabase para mantener compatibilidad con el código existente
export const supabase = getSupabaseClient()

// Verificar la conexión a Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Hacer una consulta simple para verificar la conexión
    const { error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.error("Error de conexión a Supabase:", error)
      return { success: false, error }
    }

    return { success: true, data: { status: 'connected' } }
  } catch (error) {
    console.error("Error al verificar conexión a Supabase:", error)
    return { success: false, error }
  }
}

// Ejecutar la verificación de conexión de forma asíncrona sin bloquear
setTimeout(() => {
  checkSupabaseConnection().catch(err => {
    console.error("Error en la verificación asíncrona de Supabase:", err)
  })
}, 2000)

// Tipos para nuestras tablas en Supabase
export type Workout = {
  id: string
  user_id: string
  date: string
  type: string
  name: string
  sets?: string
  reps?: string
  weight?: string
  duration?: string
  distance?: string
  notes?: string
  created_at: string
}

export type Mood = {
  id: string
  user_id: string
  date: string
  mood_level: number
  stress_level: number
  sleep_hours: number
  notes?: string
  created_at: string
}

export type Plan = {
  id: string
  user_id: string
  day: string
  activities: {
    tipo: string
    descripcion: string
    icono: string
  }[]
  created_at: string
}

export type NutritionEntry = {
  id: string
  user_id: string
  date: string
  meal_type: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string
  created_at: string
}

export type UserProfile = {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  weight?: number
  height?: number
  goal?: string
  level?: string
  is_admin?: boolean
  created_at: string
  updated_at?: string
}

// Authentication functions have been moved to lib/auth/supabase-auth.ts
// Use the unified authentication system instead

// signIn and signInWithGoogle functions have been moved to lib/auth/supabase-auth.ts

// Función para manejar la creación o actualización de perfil después de autenticación con proveedores externos
export const handleExternalAuth = async (user: any) => {
  if (!user) return

  try {
    // Verificar si el usuario ya tiene un perfil
    const { data: profileData } = await getUserProfile(user.id)

    // Si el usuario no tiene perfil, crear uno nuevo
    if (!profileData) {
      // Obtener información del usuario desde los metadatos
      const fullName = user.user_metadata?.full_name ||
                      `${user.user_metadata?.given_name || ''} ${user.user_metadata?.family_name || ''}`.trim() ||
                      user.email?.split('@')[0] ||
                      'Usuario'

      const avatarUrl = user.user_metadata?.avatar_url || null

      // Verificar si el email es admin@routinize.com para asignar rol de administrador
      const isAdmin = user.email?.toLowerCase() === 'admin@routinize.com'

      await createUserProfile({
        user_id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        is_admin: isAdmin,
        level: "Principiante",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    // Si el usuario tiene perfil pero es admin@routinize.com y no tiene rol de admin, actualizarlo
    else if (user.email?.toLowerCase() === 'admin@routinize.com' && !profileData.is_admin) {
      await updateUserProfile(user.id, {
        is_admin: true,
        updated_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error("Error al manejar autenticación externa:", error)
  }
}

// signOut and getCurrentUser functions have been moved to lib/auth/supabase-auth.ts

// Funciones para perfiles de usuario
// Función para crear un perfil simulado cuando hay problemas con Supabase
const createMockProfile = (userId: string) => {
  // Crear perfil simulado silenciosamente sin mensajes en consola
  return {
    id: `mock-${userId.substring(0, 8)}`,
    user_id: userId,
    full_name: "Usuario",
    avatar_url: null,
    weight: null,
    height: null,
    goal: null,
    level: "Principiante",
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    // Verificar que userId sea válido
    if (!userId) {
      // Silenciosamente crear un perfil simulado sin mostrar error
      return {
        data: createMockProfile("default-user"),
        error: null
      }
    }

    try {
      // Intentar obtener el perfil directamente de Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.log(`Error al obtener perfil para userId=${userId}:`, error);
        return {
          data: createMockProfile(userId),
          error: null
        };
      }

      if (!data) {
        console.log(`No se encontró perfil para userId=${userId}, devolviendo perfil simulado`);
        return {
          data: createMockProfile(userId),
          error: null
        };
      }

      // Perfil encontrado correctamente
      return { data, error: null };
    } catch (supabaseError) {
      console.log(`Error al obtener perfil para userId=${userId}:`, supabaseError);

      // Si falla, intentar un enfoque alternativo
      try {
        console.log("Intentando enfoque alternativo...");

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .filter("user_id", "eq", userId)
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          console.log("Error en enfoque alternativo:", error);
          return {
            data: createMockProfile(userId),
            error: null
          };
        }

        return { data, error: null };
      } catch (alternativeError) {
        console.log("Error en enfoque alternativo:", alternativeError);
      }

      // Si todo falla, devolver un perfil simulado
      return {
        data: createMockProfile(userId),
        error: null
      };
    }
  } catch (e) {
    // Error inesperado, devolver un perfil simulado sin mostrar error
    console.log("Error inesperado en getUserProfile:", e);
    return {
      data: createMockProfile(userId),
      error: null
    };
  }
}

export const createUserProfile = async (profile: Omit<UserProfile, "id" | "created_at">) => {
  try {
    // Verificar que el perfil y el user_id sean válidos
    if (!profile || !profile.user_id) {
      console.error("createUserProfile: perfil o user_id no válidos", profile)
      return {
        data: [createMockProfile("default-user")],
        error: null
      }
    }

    // Asegurarse de que el perfil tenga los campos mínimos necesarios
    const completeProfile = {
      ...profile,
      full_name: profile.full_name || "Usuario",
    }

    console.log(`Intentando crear perfil para userId=${profile.user_id}`)

    try {
      // Realizar la inserción en Supabase
      const { data, error } = await supabase
        .from("profiles")
        .insert([completeProfile])
        .select()

      // Si hay un error o no hay datos, devolver un perfil simulado
      if (error) {
        console.error(`Error al crear perfil para userId=${profile.user_id}:`, error)
        return {
          data: [createMockProfile(profile.user_id)],
          error: null
        }
      }

      if (!data || data.length === 0) {
        console.error(`No se pudo crear perfil para userId=${profile.user_id}: No se devolvieron datos`)
        return {
          data: [createMockProfile(profile.user_id)],
          error: null
        }
      }

      console.log(`Perfil creado exitosamente para userId=${profile.user_id}`)
      return { data, error: null }
    } catch (supabaseError) {
      // Si hay un error con Supabase, devolver un perfil simulado
      console.error(`Error de Supabase en createUserProfile para userId=${profile.user_id}:`, supabaseError)
      return {
        data: [createMockProfile(profile.user_id)],
        error: null
      }
    }
  } catch (e) {
    // Error inesperado, devolver un perfil simulado
    console.error(`Error inesperado en createUserProfile para userId=${profile?.user_id}:`, e)
    return {
      data: [createMockProfile(profile?.user_id || "unknown")],
      error: null
    }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    if (!userId) {
      console.error("updateUserProfile: userId es nulo o vacío")
      return {
        data: createMockProfile("default-user"),
        error: null
      }
    }

    // Preparar los datos para la operación
    const profileData = {
      user_id: userId,
      full_name: updates.full_name || "Usuario",
      updated_at: new Date().toISOString(),
      ...updates
    }

    console.log("Intentando actualizar perfil con datos:", profileData)

    try {
      // Verificar si el perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      let result;

      if (checkError || !existingProfile) {
        console.log("Perfil no encontrado, intentando insertar...");

        // Si no existe, intentar insertar
        result = await supabase
          .from("profiles")
          .insert([profileData])
          .select();
      } else {
        console.log("Perfil encontrado, intentando actualizar...");

        // Si existe, intentar actualizar
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", userId)
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error("Error al actualizar/insertar perfil:", error);
        return {
          data: { ...createMockProfile(userId), ...updates },
          error: null
        };
      }

      if (!data || data.length === 0) {
        console.error("No se recibieron datos después de actualizar/insertar perfil");
        return {
          data: { ...createMockProfile(userId), ...updates },
          error: null
        };
      }

      console.log("Perfil actualizado/insertado exitosamente:", data[0]);
      return { data: data[0], error: null };
    } catch (supabaseError) {
      console.error("Error al usar Supabase:", supabaseError);

      // Intentar un enfoque alternativo
      try {
        console.log("Intentando enfoque alternativo con upsert...");

        const { data, error } = await supabase
          .from("profiles")
          .upsert(profileData, {
            onConflict: 'user_id'
          })
          .select();

        if (error) {
          console.error("Error al usar upsert:", error);
          return {
            data: { ...createMockProfile(userId), ...updates },
            error: null
          };
        }

        if (!data || data.length === 0) {
          console.error("No se recibieron datos después de upsert");
          return {
            data: { ...createMockProfile(userId), ...updates },
            error: null
          };
        }

        console.log("Perfil actualizado exitosamente con upsert:", data[0]);
        return { data: data[0], error: null };
      } catch (upsertError) {
        console.error("Error al usar upsert:", upsertError);
      }

      return {
        data: { ...createMockProfile(userId), ...updates },
        error: null
      };
    }
  } catch (e) {
    console.error("Error en updateUserProfile:", e);
    return {
      data: { ...createMockProfile(userId), ...updates },
      error: null
    };
  }
}

// Funciones para workouts
export const getWorkouts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    return { data, error }
  } catch (e) {
    console.error("Error en getWorkouts:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getWorkouts") }
  }
}

export const addWorkout = async (workout: Omit<Workout, "id" | "created_at">) => {
  try {
    console.log("Intentando insertar entrenamiento en Supabase:", workout)

    // Verificar que el workout tenga los campos requeridos
    if (!workout.user_id || !workout.date || !workout.type || !workout.name) {
      console.error("Error: Faltan campos requeridos en el entrenamiento", workout)
      return {
        data: null,
        error: new Error("Faltan campos requeridos en el entrenamiento")
      }
    }

    const { data, error } = await supabase
      .from("workouts")
      .insert([workout])
      .select()

    if (error) {
      console.error("Error de Supabase al insertar entrenamiento:", error)
    } else if (!data || data.length === 0) {
      console.error("No se recibieron datos después de insertar el entrenamiento")
    } else {
      console.log("Entrenamiento insertado exitosamente:", data)
    }

    return { data, error }
  } catch (e) {
    console.error("Error en addWorkout:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addWorkout") }
  }
}

export const deleteWorkout = async (id: string) => {
  try {
    const { error } = await supabase.from("workouts").delete().eq("id", id)

    return { error }
  } catch (e) {
    console.error("Error en deleteWorkout:", e)
    return { error: e instanceof Error ? e : new Error("Error desconocido en deleteWorkout") }
  }
}

// Funciones para moods
export const getMoods = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    return { data, error }
  } catch (e) {
    console.error("Error en getMoods:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getMoods") }
  }
}

export const addMood = async (mood: Omit<Mood, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase.from("moods").insert([mood]).select()

    return { data, error }
  } catch (e) {
    console.error("Error en addMood:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addMood") }
  }
}

export const deleteMood = async (id: string) => {
  try {
    const { error } = await supabase.from("moods").delete().eq("id", id)

    return { error }
  } catch (e) {
    console.error("Error en deleteMood:", e)
    return { error: e instanceof Error ? e : new Error("Error desconocido en deleteMood") }
  }
}

// Funciones para planes
export const getPlans = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("plans").select("*").eq("user_id", userId)

    return { data, error }
  } catch (e) {
    console.error("Error en getPlans:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getPlans") }
  }
}

export const addPlan = async (plan: Omit<Plan, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase.from("plans").insert([plan]).select()

    return { data, error }
  } catch (e) {
    console.error("Error en addPlan:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addPlan") }
  }
}

export const updatePlan = async (id: string, activities: any[]) => {
  try {
    const { data, error } = await supabase.from("plans").update({ activities }).eq("id", id).select()

    return { data, error }
  } catch (e) {
    console.error("Error en updatePlan:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en updatePlan") }
  }
}

export const deletePlan = async (id: string) => {
  try {
    const { error } = await supabase.from("plans").delete().eq("id", id)

    return { error }
  } catch (e) {
    console.error("Error en deletePlan:", e)
    return { error: e instanceof Error ? e : new Error("Error desconocido en deletePlan") }
  }
}

// Funciones para nutrición
export const getNutritionEntries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("nutrition")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    return { data, error }
  } catch (e) {
    console.error("Error en getNutritionEntries:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getNutritionEntries") }
  }
}

export const addNutritionEntry = async (entry: Omit<NutritionEntry, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase.from("nutrition").insert([entry]).select()

    return { data, error }
  } catch (e) {
    console.error("Error en addNutritionEntry:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addNutritionEntry") }
  }
}

export const deleteNutritionEntry = async (id: string) => {
  try {
    const { error } = await supabase.from("nutrition").delete().eq("id", id)

    return { error }
  } catch (e) {
    console.error("Error en deleteNutritionEntry:", e)
    return { error: e instanceof Error ? e : new Error("Error desconocido en deleteNutritionEntry") }
  }
}

// Funciones para actividades de la comunidad
export const getCommunityActivities = async () => {
  try {
    const { data, error } = await supabase
      .from("community_activities")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(20)

    return { data, error }
  } catch (e) {
    console.error("Error en getCommunityActivities:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getCommunityActivities") }
  }
}

export const addCommunityActivity = async (activity: any) => {
  try {
    const { data, error } = await supabase.from("community_activities").insert([activity]).select()

    return { data, error }
  } catch (e) {
    console.error("Error en addCommunityActivity:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addCommunityActivity") }
  }
}
