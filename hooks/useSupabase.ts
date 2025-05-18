import { useState, useEffect, useCallback } from 'react'
import { enhancedSupabase } from '@/lib/enhanced-supabase-client'
import { 
  getById, 
  getByUserId, 
  insert, 
  update, 
  remove, 
  customQuery,
  OperationResponse 
} from '@/lib/supabase-operations'
import { PostgrestError } from '@supabase/supabase-js'

// Hook para manejar operaciones de Supabase con estado de carga
export function useSupabaseOperation<T>(
  initialData: T | null = null
) {
  const [data, setData] = useState<T | null>(initialData)
  const [error, setError] = useState<PostgrestError | Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Función para resetear el estado
  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setIsLoading(false)
    setIsSuccess(false)
  }, [initialData])

  // Función para ejecutar una operación genérica
  const execute = useCallback(async <R>(
    operation: () => Promise<OperationResponse<R>>
  ): Promise<OperationResponse<R>> => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    
    try {
      const response = await operation()
      
      if (response.status === 'success') {
        setIsSuccess(true)
        setData(response.data as unknown as T)
      } else {
        setError(response.error)
      }
      
      setIsLoading(false)
      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      setError(error)
      setIsLoading(false)
      setIsSuccess(false)
      
      return {
        data: null,
        error,
        status: 'error',
        message: error.message
      }
    }
  }, [])

  // Operaciones específicas
  const getItemById = useCallback(async (
    table: string,
    id: string,
    columns: string = '*',
    useCache: boolean = true
  ) => {
    return execute(() => getById(table, id, columns, useCache))
  }, [execute])

  const getItemsByUserId = useCallback(async (
    table: string,
    userId: string,
    columns: string = '*',
    options = {}
  ) => {
    return execute(() => getByUserId(table, userId, columns, options))
  }, [execute])

  const insertItem = useCallback(async (
    table: string,
    data: any,
    returnColumns: string = '*'
  ) => {
    return execute(() => insert(table, data, returnColumns))
  }, [execute])

  const updateItem = useCallback(async (
    table: string,
    id: string,
    data: any,
    returnColumns: string = '*'
  ) => {
    return execute(() => update(table, id, data, returnColumns))
  }, [execute])

  const removeItem = useCallback(async (
    table: string,
    id: string
  ) => {
    return execute(() => remove(table, id))
  }, [execute])

  const executeQuery = useCallback(async <R>(
    queryFn: () => Promise<{ data: R | null, error: PostgrestError | null }>,
    cacheKey?: string
  ) => {
    return execute(() => customQuery(queryFn, cacheKey))
  }, [execute])

  return {
    data,
    error,
    isLoading,
    isSuccess,
    reset,
    execute,
    getItemById,
    getItemsByUserId,
    insertItem,
    updateItem,
    removeItem,
    executeQuery
  }
}

// Hook para manejar la autenticación de Supabase
export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Cargar el usuario actual al montar el componente
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await enhancedSupabase.supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setSession(data.session)
        
        if (data.session) {
          const { data: userData } = await enhancedSupabase.supabase.auth.getUser()
          setUser(userData.user)
        }
      } catch (err) {
        console.error('Error al cargar el usuario:', err)
        setError(err instanceof Error ? err : new Error('Error desconocido al cargar el usuario'))
      } finally {
        setIsLoading(false)
      }
    }
    
    checkUser()
    
    // Suscribirse a cambios en la autenticación
    const { data: authListener } = enhancedSupabase.supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Función para iniciar sesión con email y contraseña
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await enhancedSupabase.supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      setUser(data.user)
      setSession(data.session)
      
      return { data, error: null }
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al iniciar sesión'))
      return { data: null, error: err }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para registrarse con email y contraseña
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await enhancedSupabase.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Error al registrarse:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al registrarse'))
      return { data: null, error: err }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para iniciar sesión con un proveedor externo
  const signInWithProvider = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await enhancedSupabase.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (err) {
      console.error(`Error al iniciar sesión con ${provider}:`, err)
      setError(err instanceof Error ? err : new Error(`Error desconocido al iniciar sesión con ${provider}`))
      return { data: null, error: err }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await enhancedSupabase.supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      setUser(null)
      setSession(null)
      
      return { error: null }
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al cerrar sesión'))
      return { error: err }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithProvider,
    signOut
  }
}

// Hook para manejar suscripciones en tiempo real
export function useSupabaseRealtime<T>(
  table: string,
  filter?: { column: string, value: string }
) {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    
    // Cargar datos iniciales
    const loadInitialData = async () => {
      try {
        let query = enhancedSupabase.supabase.from(table).select('*')
        
        if (filter) {
          query = query.eq(filter.column, filter.value)
        }
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        setData(data as T[])
      } catch (err) {
        console.error(`Error al cargar datos iniciales de ${table}:`, err)
        setError(err instanceof Error ? err : new Error(`Error desconocido al cargar datos de ${table}`))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialData()
    
    // Suscribirse a cambios en la tabla
    let subscription: any
    
    const setupSubscription = () => {
      let channel = enhancedSupabase.supabase.channel(`${table}-changes`)
      
      if (filter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `${filter.column}=eq.${filter.value}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [...prev, payload.new as T])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) => 
                prev.map((item: any) => 
                  item.id === payload.new.id ? payload.new as T : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) => 
                prev.filter((item: any) => item.id !== payload.old.id)
              )
            }
          }
        )
      } else {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [...prev, payload.new as T])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) => 
                prev.map((item: any) => 
                  item.id === payload.new.id ? payload.new as T : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) => 
                prev.filter((item: any) => item.id !== payload.old.id)
              )
            }
          }
        )
      }
      
      subscription = channel.subscribe()
    }
    
    setupSubscription()
    
    // Limpiar suscripción al desmontar
    return () => {
      if (subscription) {
        enhancedSupabase.supabase.removeChannel(subscription)
      }
    }
  }, [table, filter])

  return { data, error, isLoading }
}
