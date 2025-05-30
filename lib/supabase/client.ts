import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Cliente de Supabase optimizado para el navegador con manejo correcto de cookies
 * Este es el cliente unificado que debe usarse en toda la aplicación
 */
export function createClient() {
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
    cookies: {
      getAll() {
        if (typeof document === 'undefined') return []
        return document.cookie
          .split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => cookie.length > 0)
          .map(cookie => {
            const [name, ...rest] = cookie.split('=')
            return { name: name.trim(), value: rest.join('=').trim() }
          })
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') return
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`

          if (options?.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`
          }
          if (options?.domain) {
            cookieString += `; Domain=${options.domain}`
          }
          if (options?.path) {
            cookieString += `; Path=${options.path}`
          } else {
            cookieString += `; Path=/`
          }
          if (options?.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`
          } else {
            cookieString += `; SameSite=lax`
          }
          if (options?.secure) {
            cookieString += `; Secure`
          }

          document.cookie = cookieString
          console.log(`🍪 Cookie set: ${name} = ${value ? 'value' : 'empty'}`)
        })
      },
    },
  })
}

/**
 * Cliente singleton para uso en el navegador
 */
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
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

// Re-exportar funciones principales del cliente legacy para compatibilidad
export { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile,
  getWorkouts,
  addWorkout,
  deleteWorkout,
  getMoods,
  addMood,
  deleteMood,
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
  getNutritionEntries,
  addNutritionEntry,
  deleteNutritionEntry,
  getCommunityActivities,
  addCommunityActivity,
  handleExternalAuth
} from '@/lib/supabase-client'

// Exportar por defecto el cliente
export default createClient
