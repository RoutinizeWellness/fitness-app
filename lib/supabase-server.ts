import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Crear cliente de Supabase para el servidor con manejo de cookies
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.warn('Failed to set cookies in Server Component:', error)
        }
      },
    },
  })
}

/**
 * Obtener la sesión del usuario desde las cookies del servidor
 */
export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting server session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error creating server client:', error)
    return null
  }
}

/**
 * Obtener el usuario desde las cookies del servidor
 */
export async function getServerUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting server user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error creating server client:', error)
    return null
  }
}
