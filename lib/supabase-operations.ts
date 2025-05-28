import { supabase } from './supabase-unified'
import { PostgrestError } from '@supabase/supabase-js'

// Tipos para las respuestas de las operaciones
export type OperationResponse<T> = {
  data: T | null
  error: PostgrestError | Error | null
  status: 'success' | 'error'
  message?: string
}

// Función genérica para obtener un registro por ID
export async function getById<T>(
  table: string,
  id: string,
  columns: string = '*'
): Promise<OperationResponse<T>> {
  try {
    const result = await supabase
      .from(table)
      .select(columns)
      .eq('id', id)
      .maybeSingle()

    if (result.error) {
      return {
        data: null,
        error: result.error,
        status: 'error',
        message: `Error al obtener ${table} con ID ${id}: ${result.error.message}`
      }
    }

    return {
      data: result.data as T,
      error: null,
      status: 'success'
    }
  } catch (error) {
    console.error(`Error en getById para ${table}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Error desconocido en getById para ${table}`),
      status: 'error',
      message: `Error inesperado al obtener ${table} con ID ${id}`
    }
  }
}

// Función genérica para obtener registros por user_id
export async function getByUserId<T>(
  table: string,
  userId: string,
  columns: string = '*',
  options: {
    orderBy?: { column: string, ascending?: boolean },
    limit?: number
  } = {}
): Promise<OperationResponse<T[]>> {
  try {
    const { orderBy, limit } = options

    let query = supabase
      .from(table)
      .select(columns)
      .eq('user_id', userId)

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
    }

    if (limit) {
      query = query.limit(limit)
    }

    const result = await query

    if (result.error) {
      return {
        data: null,
        error: result.error,
        status: 'error',
        message: `Error al obtener ${table} para usuario ${userId}: ${result.error.message}`
      }
    }

    return {
      data: result.data as T[],
      error: null,
      status: 'success'
    }
  } catch (error) {
    console.error(`Error en getByUserId para ${table}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Error desconocido en getByUserId para ${table}`),
      status: 'error',
      message: `Error inesperado al obtener ${table} para usuario ${userId}`
    }
  }
}

// Función genérica para insertar un registro
export async function insert<T>(
  table: string,
  data: any,
  returnColumns: string = '*'
): Promise<OperationResponse<T>> {
  try {
    const result = await supabase
      .from(table)
      .insert(data)
      .select(returnColumns)
      .single()

    if (result.error) {
      return {
        data: null,
        error: result.error,
        status: 'error',
        message: `Error al insertar en ${table}: ${result.error.message}`
      }
    }

    return {
      data: result.data as T,
      error: null,
      status: 'success',
      message: `Registro insertado exitosamente en ${table}`
    }
  } catch (error) {
    console.error(`Error en insert para ${table}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Error desconocido en insert para ${table}`),
      status: 'error',
      message: `Error inesperado al insertar en ${table}`
    }
  }
}

// Función genérica para actualizar un registro
export async function update<T>(
  table: string,
  id: string,
  data: any,
  returnColumns: string = '*'
): Promise<OperationResponse<T>> {
  try {
    const result = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select(returnColumns)
      .single()

    if (result.error) {
      return {
        data: null,
        error: result.error,
        status: 'error',
        message: `Error al actualizar ${table} con ID ${id}: ${result.error.message}`
      }
    }

    return {
      data: result.data as T,
      error: null,
      status: 'success',
      message: `Registro actualizado exitosamente en ${table}`
    }
  } catch (error) {
    console.error(`Error en update para ${table}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Error desconocido en update para ${table}`),
      status: 'error',
      message: `Error inesperado al actualizar ${table} con ID ${id}`
    }
  }
}

// Función genérica para eliminar un registro
export async function remove(
  table: string,
  id: string
): Promise<OperationResponse<null>> {
  try {
    const result = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (result.error) {
      return {
        data: null,
        error: result.error,
        status: 'error',
        message: `Error al eliminar ${table} con ID ${id}: ${result.error.message}`
      }
    }

    return {
      data: null,
      error: null,
      status: 'success',
      message: `Registro eliminado exitosamente de ${table}`
    }
  } catch (error) {
    console.error(`Error en remove para ${table}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Error desconocido en remove para ${table}`),
      status: 'error',
      message: `Error inesperado al eliminar ${table} con ID ${id}`
    }
  }
}

// Función para realizar una consulta personalizada
export async function customQuery<T>(
  queryFn: () => Promise<{ data: T | null, error: PostgrestError | null }>
): Promise<OperationResponse<T>> {
  try {
    const result = await queryFn()

    if (result.error) {
      return {
        data: null,
        error: result.error,
        status: 'error',
        message: `Error en consulta personalizada: ${result.error.message}`
      }
    }

    return {
      data: result.data as T,
      error: null,
      status: 'success'
    }
  } catch (error) {
    console.error('Error en customQuery:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Error desconocido en customQuery'),
      status: 'error',
      message: 'Error inesperado en consulta personalizada'
    }
  }
}

// Función para verificar la salud de la conexión
export async function checkHealth(): Promise<OperationResponse<{ status: string }>> {
  try {
    // Hacer una consulta simple para verificar la conexión
    const { error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      return {
        data: null,
        error: error,
        status: 'error',
        message: 'La conexión con Supabase no está disponible'
      }
    }

    return {
      data: { status: 'healthy' },
      error: null,
      status: 'success',
      message: 'Conexión con Supabase establecida correctamente'
    }
  } catch (error) {
    console.error('Error en checkHealth:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Error desconocido en checkHealth'),
      status: 'error',
      message: 'Error inesperado al verificar la salud de la conexión'
    }
  }
}
