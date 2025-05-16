import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function getUser() {
      try {
        setIsLoading(true)
        
        // Obtener la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Error al obtener el usuario:', err)
        setError(err instanceof Error ? err : new Error('Error desconocido'))
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Obtener el usuario al montar el componente
    getUser()
    
    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )
    
    // Limpiar la suscripción al desmontar
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading, error }
}
