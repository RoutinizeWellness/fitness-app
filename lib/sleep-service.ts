import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaz para los registros de sueño
 */
export interface SleepEntry {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  duration: number // en minutos
  quality: number // 1-5
  deepSleep?: number // en minutos
  remSleep?: number // en minutos
  lightSleep?: number // en minutos
  awakeTime?: number // en minutos
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Interfaz para los objetivos de sueño
 */
export interface SleepGoal {
  userId: string
  targetDuration: number // en minutos
  targetBedtime: string
  targetWakeTime: string
  createdAt: string
  updatedAt: string
}

/**
 * Interfaz para las recomendaciones de sueño
 */
export interface SleepRecommendation {
  id: string
  userId: string
  recommendation: string
  type: 'habit' | 'environment' | 'schedule' | 'other'
  priority: 'high' | 'medium' | 'low'
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Obtiene los registros de sueño del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Registros de sueño o null en caso de error
 */
export const getSleepEntries = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<{ data: SleepEntry[] | null, error: any }> => {
  try {
    // Intentar obtener el usuario actual de auth para verificar permisos
    const { data: authData } = await supabase.auth.getUser()

    if (!authData?.user) {
      console.error('No se pudo obtener usuario autenticado')
      return {
        data: null,
        error: new Error('No se pudo verificar el usuario. Por favor, inicia sesión nuevamente.')
      }
    }

    // Usar el ID del usuario autenticado para mayor seguridad
    const authenticatedUserId = authData.user.id

    let query = supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .order('date', { ascending: false })

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener registros de sueño:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos al formato de la interfaz
    const entries: SleepEntry[] = data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      date: entry.date,
      startTime: entry.bed_time,
      endTime: entry.wake_time,
      duration: entry.duration,
      quality: entry.quality,
      // Estos campos no existen en la base de datos, pero los mantenemos en la interfaz
      deepSleep: 0,
      remSleep: 0,
      lightSleep: 0,
      awakeTime: 0,
      notes: entry.notes,
      tags: entry.tags,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }))

    return { data: entries, error: null }
  } catch (error) {
    console.error('Error al obtener registros de sueño:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de sueño
 * @param entry - Datos del registro
 * @returns - Registro guardado o null en caso de error
 */
export const saveSleepEntry = async (
  entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ data: SleepEntry | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const entryId = entry.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo del registro
    const completeEntry: SleepEntry = {
      id: entryId,
      createdAt: entry.id ? (entry as any).createdAt || now : now,
      updatedAt: now,
      ...entry
    } as SleepEntry

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeEntry.id,
      user_id: completeEntry.userId,
      date: completeEntry.date,
      bed_time: completeEntry.startTime,
      wake_time: completeEntry.endTime,
      duration: completeEntry.duration,
      quality: completeEntry.quality,
      notes: completeEntry.notes,
      tags: completeEntry.tags,
      created_at: completeEntry.createdAt,
      updated_at: completeEntry.updatedAt
    }

    // Intentar obtener el usuario actual de auth
    try {
      // La tabla users no existe en el esquema public, está en auth.users
      // Obtener el usuario actual de auth
      const { data: authData } = await supabase.auth.getUser()

      if (authData?.user) {
        console.log('Usuario autenticado encontrado, usando ID:', authData.user.id)

        // Actualizar el ID de usuario en los datos para asegurarnos de que usamos el ID correcto
        supabaseData.user_id = authData.user.id
        completeEntry.userId = authData.user.id
      } else {
        console.error('No se pudo obtener usuario autenticado')
        return {
          data: completeEntry,
          error: new Error('No se pudo verificar el usuario. Por favor, inicia sesión nuevamente.')
        }
      }

      // Intentar guardar en Supabase
      const { data, error } = await supabase
        .from('sleep_entries')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)

        // Si el error es de clave foránea, proporcionar un mensaje más claro
        if (error.code === '23503') {
          return {
            data: completeEntry,
            error: new Error('El usuario no existe en la base de datos. Por favor, inicia sesión nuevamente.')
          }
        }

        return { data: completeEntry, error }
      }

      console.log('Registro de sueño guardado exitosamente en Supabase')
      return { data: completeEntry, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar registro de sueño:', error)
    return { data: null, error }
  }
}

/**
 * Elimina un registro de sueño
 * @param entryId - ID del registro
 * @returns - True si se eliminó correctamente, false en caso contrario
 */
export const deleteSleepEntry = async (entryId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Intentar obtener el usuario actual de auth para verificar permisos
    const { data: authData } = await supabase.auth.getUser()

    if (!authData?.user) {
      console.error('No se pudo obtener usuario autenticado')
      return {
        success: false,
        error: new Error('No se pudo verificar el usuario. Por favor, inicia sesión nuevamente.')
      }
    }

    // Eliminar el registro asegurándose de que pertenece al usuario actual
    const { error } = await supabase
      .from('sleep_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', authData.user.id)

    if (error) {
      console.error('Error al eliminar registro de sueño:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error al eliminar registro de sueño:', error)
    return { success: false, error }
  }
}

/**
 * Obtiene los objetivos de sueño del usuario
 * @param userId - ID del usuario
 * @returns - Objetivos de sueño o null en caso de error
 */
export const getSleepGoals = async (userId: string): Promise<{ data: SleepGoal | null, error: any }> => {
  try {
    // Intentar obtener el usuario actual de auth para verificar permisos
    const { data: authData } = await supabase.auth.getUser()

    if (!authData?.user) {
      console.error('No se pudo obtener usuario autenticado')
      return {
        data: null,
        error: new Error('No se pudo verificar el usuario. Por favor, inicia sesión nuevamente.')
      }
    }

    // Usar el ID del usuario autenticado para mayor seguridad
    const authenticatedUserId = authData.user.id

    const { data, error } = await supabase
      .from('sleep_goals')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .single()

    if (error) {
      // Si no existe, crear un objetivo por defecto
      if (error.code === 'PGRST116') {
        const defaultGoal: Omit<SleepGoal, 'createdAt' | 'updatedAt'> = {
          userId,
          targetDuration: 480, // 8 horas en minutos
          targetBedtime: '22:30',
          targetWakeTime: '06:30'
        }

        const { data: newGoal, error: saveError } = await saveSleepGoals(defaultGoal)

        if (saveError) {
          return { data: null, error: saveError }
        }

        return { data: newGoal, error: null }
      }

      console.error('Error al obtener objetivos de sueño:', error)
      return { data: null, error }
    }

    if (!data) {
      return { data: null, error: new Error('No se encontraron objetivos de sueño') }
    }

    // Transformar los datos al formato esperado
    const goal: SleepGoal = {
      userId: data.user_id,
      targetDuration: data.target_duration,
      targetBedtime: data.target_bed_time,
      targetWakeTime: data.target_wake_time,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return { data: goal, error: null }
  } catch (error) {
    console.error('Error al obtener objetivos de sueño:', error)
    return { data: null, error }
  }
}

/**
 * Guarda los objetivos de sueño del usuario
 * @param goal - Datos de los objetivos
 * @returns - Objetivos guardados o null en caso de error
 */
export const saveSleepGoals = async (
  goal: Omit<SleepGoal, 'createdAt' | 'updatedAt'>
): Promise<{ data: SleepGoal | null, error: any }> => {
  try {
    const now = new Date().toISOString()

    // Crear el objeto completo de los objetivos
    const completeGoal: SleepGoal = {
      createdAt: now,
      updatedAt: now,
      ...goal
    }

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      user_id: completeGoal.userId,
      target_duration: completeGoal.targetDuration,
      target_bed_time: completeGoal.targetBedtime,
      target_wake_time: completeGoal.targetWakeTime,
      created_at: completeGoal.createdAt,
      updated_at: completeGoal.updatedAt
    }

    // Eliminar objetivos anteriores para este usuario
    await supabase
      .from('sleep_goals')
      .delete()
      .eq('user_id', completeGoal.userId)

    // Intentar obtener el usuario actual de auth
    try {
      // La tabla users no existe en el esquema public, está en auth.users
      // Obtener el usuario actual de auth
      const { data: authData } = await supabase.auth.getUser()

      if (authData?.user) {
        console.log('Usuario autenticado encontrado, usando ID:', authData.user.id)

        // Actualizar el ID de usuario en los datos para asegurarnos de que usamos el ID correcto
        supabaseData.user_id = authData.user.id
        completeGoal.userId = authData.user.id
      } else {
        console.error('No se pudo obtener usuario autenticado')
        return {
          data: completeGoal,
          error: new Error('No se pudo verificar el usuario. Por favor, inicia sesión nuevamente.')
        }
      }

      // Intentar guardar en Supabase
      const { data, error } = await supabase
        .from('sleep_goals')
        .insert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)

        // Si el error es de clave foránea, proporcionar un mensaje más claro
        if (error.code === '23503') {
          return {
            data: completeGoal,
            error: new Error('El usuario no existe en la base de datos. Por favor, inicia sesión nuevamente.')
          }
        }

        return { data: completeGoal, error }
      }

      console.log('Objetivos de sueño guardados exitosamente en Supabase')
      return { data: completeGoal, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar insert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar objetivos de sueño:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las recomendaciones de sueño del usuario
 * @param userId - ID del usuario
 * @returns - Recomendaciones de sueño o null en caso de error
 */
export const getSleepRecommendations = async (userId: string): Promise<{ data: SleepRecommendation[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('sleep_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener recomendaciones de sueño:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos al formato de la interfaz
    const recommendations: SleepRecommendation[] = data.map(rec => ({
      id: rec.id,
      userId: rec.user_id,
      recommendation: rec.recommendation,
      type: rec.type,
      priority: rec.priority,
      isCompleted: rec.is_completed,
      createdAt: rec.created_at,
      updatedAt: rec.updated_at
    }))

    return { data: recommendations, error: null }
  } catch (error) {
    console.error('Error al obtener recomendaciones de sueño:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las estadísticas de sueño del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Estadísticas de sueño o null en caso de error
 */
export const getSleepStats = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
): Promise<{ data: any, error: any }> => {
  try {
    // Obtener registros de sueño
    const { data: entries, error } = await getSleepEntries(userId, options)

    if (error || !entries) {
      return { data: null, error: error || new Error('No se pudieron obtener los registros') }
    }

    if (entries.length === 0) {
      return {
        data: {
          totalEntries: 0,
          avgSleepTime: 0,
          avgQuality: 0,
          avgDeepSleep: 0,
          avgRemSleep: 0,
          avgLightSleep: 0,
          avgAwakeTime: 0,
          sleepTrend: [],
          bedtimeConsistency: 0,
          waketimeConsistency: 0,
          sleepScore: 0
        },
        error: null
      }
    }

    // Calcular estadísticas
    const totalEntries = entries.length
    const totalSleepTime = entries.reduce((acc, entry) => acc + entry.duration, 0)
    const avgSleepTime = totalSleepTime / totalEntries

    // Calcular calidad promedio
    const totalQuality = entries.reduce((acc, entry) => acc + entry.quality, 0)
    const avgQuality = totalQuality / totalEntries

    // Calcular tiempo promedio en cada fase
    const entriesWithPhases = entries.filter(entry =>
      entry.deepSleep !== undefined &&
      entry.remSleep !== undefined &&
      entry.lightSleep !== undefined
    )

    let avgDeepSleep = 0
    let avgRemSleep = 0
    let avgLightSleep = 0
    let avgAwakeTime = 0

    if (entriesWithPhases.length > 0) {
      const totalDeepSleep = entriesWithPhases.reduce((acc, entry) => acc + (entry.deepSleep || 0), 0)
      const totalRemSleep = entriesWithPhases.reduce((acc, entry) => acc + (entry.remSleep || 0), 0)
      const totalLightSleep = entriesWithPhases.reduce((acc, entry) => acc + (entry.lightSleep || 0), 0)
      const totalAwakeTime = entriesWithPhases.reduce((acc, entry) => acc + (entry.awakeTime || 0), 0)

      avgDeepSleep = totalDeepSleep / entriesWithPhases.length
      avgRemSleep = totalRemSleep / entriesWithPhases.length
      avgLightSleep = totalLightSleep / entriesWithPhases.length
      avgAwakeTime = totalAwakeTime / entriesWithPhases.length
    }

    // Calcular tendencia de sueño (últimos 7 días)
    const sleepTrend = entries.slice(0, 7).map(entry => ({
      date: entry.date,
      duration: entry.duration,
      quality: entry.quality
    })).reverse()

    // Calcular consistencia de horario
    const bedtimes = entries.map(entry => entry.startTime)
    const waketimes = entries.map(entry => entry.endTime)

    // Calcular desviación estándar de los horarios
    const bedtimeConsistency = calculateTimeConsistency(bedtimes)
    const waketimeConsistency = calculateTimeConsistency(waketimes)

    // Calcular puntuación de sueño (0-100)
    // Factores: duración, calidad, consistencia
    const idealSleepDuration = 480 // 8 horas en minutos
    const durationScore = Math.min(100, (avgSleepTime / idealSleepDuration) * 100)

    // Calidad (1-5 a 0-100)
    const qualityScore = (avgQuality / 5) * 100

    // Consistencia (menor es mejor, máximo 60 minutos)
    const maxConsistency = 60
    const bedtimeConsistencyScore = Math.max(0, 100 - (bedtimeConsistency / maxConsistency) * 100)
    const waketimeConsistencyScore = Math.max(0, 100 - (waketimeConsistency / maxConsistency) * 100)
    const consistencyScore = (bedtimeConsistencyScore + waketimeConsistencyScore) / 2

    // Puntuación final (ponderada)
    const sleepScore = Math.round(
      (durationScore * 0.4) + (qualityScore * 0.4) + (consistencyScore * 0.2)
    )

    return {
      data: {
        totalEntries,
        avgSleepTime,
        avgQuality,
        avgDeepSleep,
        avgRemSleep,
        avgLightSleep,
        avgAwakeTime,
        sleepTrend,
        bedtimeConsistency,
        waketimeConsistency,
        sleepScore,
        durationScore,
        qualityScore,
        consistencyScore
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de sueño:', error)
    return { data: null, error }
  }
}

/**
 * Calcula la consistencia de un conjunto de horas
 * @param times - Array de horas en formato HH:MM
 * @returns - Valor de consistencia (menor es mejor)
 */
const calculateTimeConsistency = (times: string[]): number => {
  if (times.length <= 1) return 0

  // Convertir horas a minutos desde medianoche
  const minutesArray = times.map(time => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  })

  // Calcular media
  const mean = minutesArray.reduce((acc, val) => acc + val, 0) / minutesArray.length

  // Calcular desviación estándar
  const squareDiffs = minutesArray.map(value => {
    const diff = value - mean
    return diff * diff
  })

  const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length
  const stdDev = Math.sqrt(avgSquareDiff)

  return stdDev
}
