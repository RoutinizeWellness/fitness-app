import { createClient } from '@/lib/supabase/client'
import { User, PostgrestError } from '@supabase/supabase-js'
import { toast } from '@/components/ui/use-toast'
import { isEmptyErrorObject } from './error-utils'

// Initialize Supabase client
const supabase = createClient()

/**
 * Función para verificar la conexión con Supabase
 * @returns {Promise<boolean>} - True si la conexión es exitosa, false en caso contrario
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (error) {
      console.error('Error al verificar la conexión con Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error al verificar la conexión con Supabase:', error)
    return false
  }
}

/**
 * Función para manejar errores de Supabase
 * @param error - Error de Supabase
 * @param fallbackData - Datos de respaldo en caso de error
 * @param errorMessage - Mensaje de error personalizado
 * @returns - Objeto con datos (fallback si hay error) y error
 */
export const handleSupabaseError = <T>(error: any, fallbackData: T, errorMessage: string = 'Error en la operación') => {
  if (error) {
    console.error(`${errorMessage}:`, error)
    toast({
      title: 'Error',
      description: `${errorMessage}. Por favor, inténtalo de nuevo más tarde.`,
      variant: 'destructive'
    })
  }

  return {
    data: error ? fallbackData : null,
    error
  }
}

/**
 * Función para obtener datos de Supabase con manejo de errores
 * @param tableName - Nombre de la tabla
 * @param userId - ID del usuario
 * @param options - Opciones adicionales para la consulta
 * @returns - Datos obtenidos o null en caso de error
 */
export const fetchDataFromSupabase = async <T>(
  tableName: string,
  userId: string,
  options: {
    select?: string,
    orderBy?: { column: string, ascending: boolean },
    limit?: number,
    filter?: { column: string, value: any }[]
  } = {}
): Promise<{ data: T[] | null, error: any }> => {
  try {
    // Verificar que el userId sea válido
    if (!userId) {
      console.warn(`fetchDataFromSupabase: userId no válido para tabla ${tableName}`)
      return { data: [], error: null }
    }

    // Iniciar la consulta
    let query = supabase.from(tableName).select(options.select || '*')

    // Añadir filtro por userId
    query = query.eq('user_id', userId)

    // Añadir filtros adicionales
    if (options.filter && options.filter.length > 0) {
      options.filter.forEach(filter => {
        query = query.eq(filter.column, filter.value)
      })
    }

    // Añadir ordenamiento
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
    }

    // Añadir límite
    if (options.limit) {
      query = query.limit(options.limit)
    }

    // Ejecutar la consulta
    const { data, error } = await query

    if (error) {
      return handleSupabaseError(error, [], `Error al obtener datos de ${tableName}`)
    }

    return { data, error: null }
  } catch (error) {
    console.error(`Error al obtener datos de ${tableName}:`, error)
    return { data: [], error }
  }
}

/**
 * Función para insertar datos en Supabase con manejo de errores
 * @param tableName - Nombre de la tabla
 * @param data - Datos a insertar
 * @returns - Datos insertados o null en caso de error
 */
export const insertDataToSupabase = async <T>(
  tableName: string,
  data: any
): Promise<{ data: T | null, error: any }> => {
  try {
    // Verificar que los datos sean válidos
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`insertDataToSupabase: datos no válidos para tabla ${tableName}`)
      return { data: null, error: new Error('Datos no válidos') }
    }

    // Añadir timestamp
    const dataWithTimestamp = Array.isArray(data)
      ? data.map(item => ({ ...item, created_at: new Date().toISOString() }))
      : { ...data, created_at: new Date().toISOString() }

    // Ejecutar la inserción
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(dataWithTimestamp)
      .select()

    if (error) {
      return handleSupabaseError(error, null, `Error al insertar datos en ${tableName}`)
    }

    return { data: insertedData as unknown as T, error: null }
  } catch (error) {
    console.error(`Error al insertar datos en ${tableName}:`, error)
    return { data: null, error }
  }
}

/**
 * Función para actualizar datos en Supabase con manejo de errores
 * @param tableName - Nombre de la tabla
 * @param id - ID del registro a actualizar
 * @param data - Datos a actualizar
 * @returns - Datos actualizados o null en caso de error
 */
export const updateDataInSupabase = async <T>(
  tableName: string,
  id: string,
  data: any
): Promise<{ data: T | null, error: any }> => {
  try {
    // Verificar que los datos sean válidos
    if (!id || !data) {
      console.warn(`updateDataInSupabase: id o datos no válidos para tabla ${tableName}`)
      return { data: null, error: new Error('ID o datos no válidos') }
    }

    // Añadir timestamp
    const dataWithTimestamp = { ...data, updated_at: new Date().toISOString() }

    // Ejecutar la actualización
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update(dataWithTimestamp)
      .eq('id', id)
      .select()

    if (error) {
      return handleSupabaseError(error, null, `Error al actualizar datos en ${tableName}`)
    }

    return { data: updatedData as unknown as T, error: null }
  } catch (error) {
    console.error(`Error al actualizar datos en ${tableName}:`, error)
    return { data: null, error }
  }
}

/**
 * Función para eliminar datos en Supabase con manejo de errores
 * @param tableName - Nombre de la tabla
 * @param id - ID del registro a eliminar
 * @returns - True si se eliminó correctamente, false en caso contrario
 */
export const deleteDataFromSupabase = async (
  tableName: string,
  id: string
): Promise<{ success: boolean, error: any }> => {
  try {
    // Verificar que el ID sea válido
    if (!id) {
      console.warn(`deleteDataFromSupabase: id no válido para tabla ${tableName}`)
      return { success: false, error: new Error('ID no válido') }
    }

    // Ejecutar la eliminación
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      return handleSupabaseError(error, false, `Error al eliminar datos de ${tableName}`)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error(`Error al eliminar datos de ${tableName}:`, error)
    return { success: false, error }
  }
}

/**
 * Función para sincronizar datos locales con Supabase
 * @param tableName - Nombre de la tabla
 * @param localData - Datos locales
 * @param userId - ID del usuario
 * @returns - Datos sincronizados
 */
export const syncDataWithSupabase = async <T>(
  tableName: string,
  localData: T[],
  userId: string
): Promise<T[]> => {
  try {
    // Verificar que el userId sea válido
    if (!userId) {
      console.warn(`syncDataWithSupabase: userId no válido para tabla ${tableName}`)
      return localData
    }

    // Obtener datos de Supabase
    const { data: remoteData, error } = await fetchDataFromSupabase<T>(tableName, userId)

    if (error || !remoteData) {
      console.warn(`No se pudieron obtener datos remotos para sincronizar ${tableName}`)
      return localData
    }

    // Si no hay datos locales, devolver los remotos
    if (!localData || localData.length === 0) {
      return remoteData
    }

    // Combinar datos locales y remotos (estrategia simple)
    // En una implementación real, se debería usar timestamps y resolución de conflictos
    const combinedData = [...localData]

    // Añadir datos remotos que no estén en los locales
    remoteData.forEach(remoteItem => {
      const remoteId = (remoteItem as any).id
      const exists = combinedData.some(localItem => (localItem as any).id === remoteId)

      if (!exists) {
        combinedData.push(remoteItem)
      }
    })

    return combinedData
  } catch (error) {
    console.error(`Error al sincronizar datos con ${tableName}:`, error)
    return localData
  }
}

/**
 * Función para obtener datos del usuario actual
 * @deprecated Use the unified authentication system from lib/auth/auth-context.tsx instead
 * @returns - Usuario actual o null
 */
export const getCurrentUserWithProfile = async (): Promise<{ user: User | null, profile: any, error: any }> => {
  console.warn('getCurrentUserWithProfile is deprecated. Use the unified authentication system from lib/auth/auth-context.tsx instead');

  try {
    // Use the unified authentication system
    const { supabaseAuth } = await import('@/lib/auth/supabase-auth');
    const { data: { user }, error: userError } = await supabaseAuth.getClient().auth.getUser()

    if (userError || !user) {
      return { user: null, profile: null, error: userError }
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Verificar si el perfil es un objeto vacío
    if (profile && typeof profile === 'object' && Object.keys(profile).length === 0) {
      console.error("Se recibió un objeto vacío para el perfil del usuario")
      return {
        user,
        profile: null,
        error: {
          message: "Respuesta vacía de Supabase para el perfil. Posible problema de conexión o tabla inexistente.",
          code: "EMPTY_RESPONSE"
        }
      }
    }

    return {
      user,
      profile: profileError ? null : profile,
      error: profileError
    }
  } catch (error) {
    console.error('Error al obtener usuario con perfil:', error)
    return { user: null, profile: null, error }
  }
}

/**
 * Procesa una respuesta de Supabase, manejando objetos vacíos y otros problemas comunes
 * @param data Los datos devueltos por una consulta de Supabase
 * @param error El error devuelto por una consulta de Supabase
 * @param fallbackData Datos de respaldo opcionales para usar si la respuesta es inválida
 * @param context Contexto opcional para el registro
 * @returns Un objeto con datos procesados y error
 */
export function processSupabaseResponse<T>(
  data: T | null,
  error: PostgrestError | null,
  fallbackData?: T,
  context: string = "Consulta Supabase"
): { data: T | null, error: PostgrestError | null, usingFallback: boolean } {
  // Caso 1: Error explícito de Supabase
  if (error) {
    console.error(`${context} error:`, error)
    return {
      data: fallbackData || null,
      error,
      usingFallback: fallbackData !== undefined
    }
  }

  // Caso 2: Datos nulos o indefinidos
  if (data === null || data === undefined) {
    console.warn(`${context}: No se devolvieron datos (null/undefined)`)
    return {
      data: fallbackData || null,
      error: null,
      usingFallback: fallbackData !== undefined
    }
  }

  // Caso 3: Respuesta de objeto vacío
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    console.error(`🚨 ${context}: Respuesta de objeto vacío ({}) - Posible problema de cookies corruptas`)

    // Importar y usar las utilidades de limpieza de cookies
    if (typeof window !== 'undefined') {
      import('@/lib/utils/cookie-cleaner').then(({ autoHandleCorruptedCookies }) => {
        autoHandleCorruptedCookies();
      }).catch(err => console.warn('No se pudo cargar el limpiador de cookies:', err));
    }

    const emptyError = {
      message: "Respuesta vacía de Supabase. Posible problema de cookies corruptas o conexión.",
      details: "Empty object response - check authentication cookies",
      hint: "Try refreshing the page or clearing browser cookies",
      code: "EMPTY_RESPONSE"
    } as PostgrestError

    return {
      data: fallbackData || null,
      error: emptyError,
      usingFallback: fallbackData !== undefined
    }
  }

  // Caso 4: Se esperaba un array pero no se recibió
  if (Array.isArray(fallbackData) && !Array.isArray(data)) {
    console.error(`${context}: Se esperaba un array pero se obtuvo:`, typeof data)
    return {
      data: fallbackData,
      error: {
        message: "Se esperaba un array pero se recibió otro tipo de datos",
        code: "TYPE_MISMATCH"
      } as PostgrestError,
      usingFallback: true
    }
  }

  // Caso 5: Array vacío cuando esperábamos datos
  if (Array.isArray(data) && data.length === 0 && fallbackData !== undefined) {
    console.info(`${context}: Se devolvió un array vacío, usando datos de respaldo`)
    return {
      data: fallbackData,
      error: null,
      usingFallback: true
    }
  }

  // Caso 6: Datos válidos
  return {
    data,
    error: null,
    usingFallback: false
  }
}

/**
 * Procesa una respuesta de Supabase para un solo registro
 * @param data Los datos devueltos por una consulta de Supabase
 * @param error El error devuelto por una consulta de Supabase
 * @param fallbackData Datos de respaldo opcionales para usar si la respuesta es inválida
 * @param context Contexto opcional para el registro
 * @returns Un objeto con datos procesados y error
 */
export function processSingleRecord<T>(
  data: T | null,
  error: PostgrestError | null,
  fallbackData?: T,
  context: string = "Consulta de registro único de Supabase"
): { data: T | null, error: PostgrestError | null, usingFallback: boolean } {
  // Manejar el error PGRST116 (no se devolvieron filas) de manera especial
  if (error && error.code === 'PGRST116') {
    console.info(`${context}: No se encontró ningún registro (PGRST116)`)
    return {
      data: fallbackData || null,
      error: null,
      usingFallback: fallbackData !== undefined
    }
  }

  return processSupabaseResponse(data, error, fallbackData, context)
}
