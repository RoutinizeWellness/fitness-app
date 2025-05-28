import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './supabase-client'

/**
 * Verifica la conexión a Supabase
 * @returns Objeto con el resultado de la verificación
 */
export const checkSupabaseConnection = async (): Promise<{ connected: boolean, error?: any }> => {
  try {
    // Verificar que supabase esté definido
    if (!supabase) {
      console.error('Error: supabase no está definido en error-handling.ts')
      return {
        connected: false,
        error: new Error('La instancia de Supabase no está definida')
      }
    }

    // Intentar una consulta simple para verificar la conexión
    try {
      // Intentamos con profiles primero
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        console.warn('Error al verificar conexión con profiles, intentando con users:', error)

        // Si profiles falla, intentamos con users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (usersError) {
          console.warn('Error al verificar conexión con users, intentando con auth.users:', usersError)

          // Si users falla, intentamos con una función RPC básica
          const { error: rpcError } = await supabase.rpc('get_session')

          if (rpcError) {
            console.error('Error al verificar conexión a Supabase con todos los métodos:', rpcError)
            return { connected: false, error: rpcError }
          }
        }
      }

      return { connected: true }
    } catch (queryError) {
      console.error('Error al ejecutar consulta para verificar conexión:', queryError)
      return { connected: false, error: queryError }
    }
  } catch (error) {
    console.error('Error inesperado al verificar conexión:', error)
    return { connected: false, error }
  }
}

/**
 * Maneja errores de Supabase de manera mejorada
 * @param error Error original
 * @param defaultMessage Mensaje por defecto
 * @returns Error procesado con mensaje mejorado
 */
export const handleSupabaseError = (error: PostgrestError | Error | unknown, defaultMessage: string = 'Error en la operación'): Error => {
  // Si el error es un objeto vacío
  if (error && typeof error === 'object' && Object.keys(error).length === 0) {
    console.warn('Se recibió un objeto de error vacío {}')
    return new Error(`${defaultMessage} (Error desconocido - objeto vacío)`)
  }

  // Si es un error de Postgrest
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const pgError = error as PostgrestError

    // Errores comunes de Supabase
    switch (pgError.code) {
      case '23505': // Unique violation
        return new Error(`Ya existe un registro con esos datos: ${pgError.message}`)
      case '23503': // Foreign key violation
        return new Error(`Referencia inválida a otro registro: ${pgError.message}`)
      case '42P01': // Undefined table
        return new Error(`Tabla no encontrada: ${pgError.message}`)
      case '42703': // Undefined column
        return new Error(`Columna no encontrada: ${pgError.message}`)
      case '28000': // Invalid authorization
      case '28P01': // Invalid password
        return new Error(`Error de autenticación: ${pgError.message}`)
      case '3D000': // Invalid catalog name
        return new Error(`Base de datos no encontrada: ${pgError.message}`)
      case '3F000': // Invalid schema name
        return new Error(`Esquema no encontrado: ${pgError.message}`)
      default:
        return new Error(`${defaultMessage}: ${pgError.message} (Código: ${pgError.code})`)
    }
  }

  // Si es un error estándar
  if (error instanceof Error) {
    return new Error(`${defaultMessage}: ${error.message}`)
  }

  // Para cualquier otro tipo de error
  return new Error(`${defaultMessage}: ${String(error)}`)
}

/**
 * Verifica si una tabla existe en la base de datos
 * @param tableName Nombre de la tabla a verificar
 * @returns Objeto con el resultado de la verificación
 */
export const checkTableExists = async (tableName: string): Promise<{ exists: boolean, error?: any }> => {
  try {
    // Verificar que supabase esté definido
    if (!supabase) {
      console.error('Error: supabase no está definido en checkTableExists')
      return {
        exists: false,
        error: new Error('La instancia de Supabase no está definida')
      }
    }

    // Consultar información del esquema para verificar si la tabla existe
    try {
      // Primero intentamos con el método RPC si está disponible
      try {
        const { data, error } = await supabase
          .rpc('check_table_exists', { table_name: tableName })

        if (!error) {
          return { exists: !!data }
        }

        // Si hay error en RPC, continuamos con el enfoque alternativo
        console.warn(`RPC check_table_exists no disponible, usando método alternativo:`, error)
      } catch (rpcError) {
        console.warn(`Error al llamar RPC check_table_exists:`, rpcError)
        // Continuamos con el enfoque alternativo
      }

      // Enfoque alternativo: intentar hacer una consulta a la tabla
      try {
        const { count, error: selectError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1)

        // Si no hay error, la tabla existe
        if (!selectError) {
          console.log(`Tabla ${tableName} verificada correctamente`)
          return { exists: true }
        }

        // Verificar si el error indica que la tabla no existe
        if (selectError.code === '42P01') { // Undefined table
          console.log(`Confirmado: La tabla ${tableName} no existe`)
          return { exists: false, error: selectError }
        }

        // Otro tipo de error
        console.warn(`Error al verificar tabla ${tableName}:`, selectError)
        return { exists: false, error: selectError }
      } catch (queryError) {
        console.error(`Error al consultar la tabla ${tableName}:`, queryError)
        return { exists: false, error: queryError }
      }
    } catch (strategyError) {
      console.error(`Error en las estrategias para verificar la tabla ${tableName}:`, strategyError)
      return { exists: false, error: strategyError }
    }
  } catch (error) {
    console.error(`Error inesperado al verificar si la tabla ${tableName} existe:`, error)
    return { exists: false, error }
  }
}

/**
 * Intenta crear una tabla si no existe
 * @param tableName Nombre de la tabla
 * @param createTableSQL SQL para crear la tabla
 * @returns Resultado de la operación
 */
export const createTableIfNotExists = async (
  tableName: string,
  createTableSQL: string
): Promise<{ success: boolean, error?: any }> => {
  try {
    // Verificar que supabase esté definido
    if (!supabase) {
      console.error('Error: supabase no está definido en createTableIfNotExists')
      return {
        success: false,
        error: new Error('La instancia de Supabase no está definida')
      }
    }

    // Verificar si la tabla existe
    const { exists, error: checkError } = await checkTableExists(tableName)

    if (checkError) {
      console.warn(`Error al verificar si la tabla ${tableName} existe:`, checkError)
    }

    // Si la tabla ya existe, no hacer nada
    if (exists) {
      console.log(`La tabla ${tableName} ya existe, no es necesario crearla`)
      return { success: true }
    }

    // Intentar crear la tabla
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: createTableSQL })

      if (error) {
        console.error(`Error al crear la tabla ${tableName} con RPC:`, error)
        return { success: false, error }
      }

      console.log(`Tabla ${tableName} creada exitosamente`)
      return { success: true }
    } catch (rpcError) {
      console.error(`Error al ejecutar RPC para crear la tabla ${tableName}:`, rpcError)
      return { success: false, error: rpcError }
    }
  } catch (error) {
    console.error(`Error inesperado al crear la tabla ${tableName}:`, error)
    return { success: false, error }
  }
}
