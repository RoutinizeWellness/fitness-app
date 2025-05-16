import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaces para el módulo de mindfulness
 */
export interface MindfulnessExercise {
  id: string
  title: string
  description: string
  category: string
  duration: number
  difficulty: string
  instructions: any[]
  benefits: string[]
  audioUrl?: string
  imageUrl?: string
  createdAt: string
}

export interface MindfulnessLog {
  id: string
  userId: string
  exerciseId?: string
  date: string
  duration: number
  stressBefore?: number
  stressAfter?: number
  notes?: string
  createdAt: string
}

export interface MindfulnessStats {
  totalSessions: number
  totalMinutes: number
  averageDuration: number
  averageStressReduction: number
  lastWeekSessions: number
  favoriteCategory?: string
  mostEffectiveExercise?: string
}

/**
 * Obtiene ejercicios de mindfulness
 * @param options - Opciones de filtrado
 * @returns - Lista de ejercicios o null en caso de error
 */
export const getMindfulnessExercises = async (
  options?: {
    category?: string
    difficulty?: string
    duration?: number
    limit?: number
  }
): Promise<{ data: MindfulnessExercise[] | null, error: any }> => {
  try {
    let query = supabase
      .from('mindfulness_exercises')
      .select('*')

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.difficulty) {
      query = query.eq('difficulty', options.difficulty)
    }

    if (options?.duration) {
      query = query.lte('duration', options.duration)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener ejercicios de mindfulness:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const exercises: MindfulnessExercise[] = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      duration: item.duration,
      difficulty: item.difficulty,
      instructions: item.instructions,
      benefits: item.benefits,
      audioUrl: item.audio_url,
      imageUrl: item.image_url,
      createdAt: item.created_at
    }))

    return { data: exercises, error: null }
  } catch (error) {
    console.error('Error al obtener ejercicios de mindfulness:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los registros de mindfulness de un usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Lista de registros o null en caso de error
 */
export const getMindfulnessLogs = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    exerciseId?: string
    limit?: number
  }
): Promise<{ data: MindfulnessLog[] | null, error: any }> => {
  try {
    let query = supabase
      .from('mindfulness_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.exerciseId) {
      query = query.eq('exercise_id', options.exerciseId)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener registros de mindfulness:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const logs: MindfulnessLog[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      exerciseId: item.exercise_id,
      date: item.date,
      duration: item.duration,
      stressBefore: item.stress_before,
      stressAfter: item.stress_after,
      notes: item.notes,
      createdAt: item.created_at
    }))

    return { data: logs, error: null }
  } catch (error) {
    console.error('Error al obtener registros de mindfulness:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de mindfulness
 * @param log - Datos del registro
 * @returns - Registro guardado o null en caso de error
 */
export const saveMindfulnessLog = async (
  log: Omit<MindfulnessLog, 'id' | 'createdAt'> & { id?: string }
): Promise<{ data: MindfulnessLog | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const logId = log.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo del registro
    const completeLog: MindfulnessLog = {
      id: logId,
      createdAt: now,
      ...log
    }

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeLog.id,
      user_id: completeLog.userId,
      exercise_id: completeLog.exerciseId,
      date: completeLog.date,
      duration: completeLog.duration,
      stress_before: completeLog.stressBefore,
      stress_after: completeLog.stressAfter,
      notes: completeLog.notes,
      created_at: completeLog.createdAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('mindfulness_logs')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeLog, error }
      }

      console.log('Registro de mindfulness guardado exitosamente en Supabase')
      return { data: completeLog, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar registro de mindfulness:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene estadísticas de mindfulness para un usuario
 * @param userId - ID del usuario
 * @returns - Estadísticas o null en caso de error
 */
export const getMindfulnessStats = async (
  userId: string
): Promise<{ data: MindfulnessStats | null, error: any }> => {
  try {
    // Obtener todos los registros
    const { data: logs, error } = await getMindfulnessLogs(userId)

    if (error || !logs) {
      return { data: null, error: error || new Error('No se pudieron obtener los registros') }
    }

    if (logs.length === 0) {
      return {
        data: {
          totalSessions: 0,
          totalMinutes: 0,
          averageDuration: 0,
          averageStressReduction: 0,
          lastWeekSessions: 0
        },
        error: null
      }
    }

    // Calcular estadísticas
    const totalSessions = logs.length
    const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0)
    const averageDuration = totalMinutes / totalSessions

    // Calcular reducción de estrés promedio
    let stressReductionSum = 0
    let stressReductionCount = 0
    logs.forEach(log => {
      if (log.stressBefore !== undefined && log.stressAfter !== undefined) {
        stressReductionSum += (log.stressBefore - log.stressAfter)
        stressReductionCount++
      }
    })
    const averageStressReduction = stressReductionCount > 0 ? stressReductionSum / stressReductionCount : 0

    // Calcular sesiones de la última semana
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const lastWeekSessions = logs.filter(log => new Date(log.date) >= oneWeekAgo).length

    // Determinar categoría favorita (si hay suficientes datos)
    let favoriteCategory: string | undefined
    if (logs.length >= 5) {
      // Obtener todos los ejercicios realizados
      const exerciseIds = logs.filter(log => log.exerciseId).map(log => log.exerciseId) as string[]
      
      if (exerciseIds.length > 0) {
        const { data: exercises } = await supabase
          .from('mindfulness_exercises')
          .select('id, category')
          .in('id', exerciseIds)
        
        if (exercises && exercises.length > 0) {
          // Contar por categoría
          const categoryCount: Record<string, number> = {}
          
          exercises.forEach(exercise => {
            const category = exercise.category
            const count = logs.filter(log => log.exerciseId === exercise.id).length
            
            if (!categoryCount[category]) {
              categoryCount[category] = 0
            }
            
            categoryCount[category] += count
          })
          
          // Encontrar la categoría más frecuente
          let maxCount = 0
          let maxCategory = ''
          
          Object.entries(categoryCount).forEach(([category, count]) => {
            if (count > maxCount) {
              maxCount = count
              maxCategory = category
            }
          })
          
          if (maxCategory) {
            favoriteCategory = maxCategory
          }
        }
      }
    }

    // Determinar ejercicio más efectivo (si hay suficientes datos)
    let mostEffectiveExercise: string | undefined
    if (logs.length >= 5) {
      // Filtrar logs con datos de estrés antes y después
      const logsWithStressData = logs.filter(
        log => log.exerciseId && log.stressBefore !== undefined && log.stressAfter !== undefined
      )
      
      if (logsWithStressData.length > 0) {
        // Calcular efectividad por ejercicio
        const exerciseEffectiveness: Record<string, { count: number, totalReduction: number }> = {}
        
        logsWithStressData.forEach(log => {
          const exerciseId = log.exerciseId as string
          const stressReduction = (log.stressBefore as number) - (log.stressAfter as number)
          
          if (!exerciseEffectiveness[exerciseId]) {
            exerciseEffectiveness[exerciseId] = { count: 0, totalReduction: 0 }
          }
          
          exerciseEffectiveness[exerciseId].count++
          exerciseEffectiveness[exerciseId].totalReduction += stressReduction
        })
        
        // Encontrar el ejercicio más efectivo
        let maxEffectiveness = 0
        let mostEffectiveId = ''
        
        Object.entries(exerciseEffectiveness).forEach(([exerciseId, data]) => {
          const avgReduction = data.count > 0 ? data.totalReduction / data.count : 0
          if (avgReduction > maxEffectiveness) {
            maxEffectiveness = avgReduction
            mostEffectiveId = exerciseId
          }
        })
        
        if (mostEffectiveId) {
          // Obtener el título del ejercicio
          const { data: exerciseData } = await supabase
            .from('mindfulness_exercises')
            .select('title')
            .eq('id', mostEffectiveId)
            .single()
          
          if (exerciseData) {
            mostEffectiveExercise = exerciseData.title
          }
        }
      }
    }

    return {
      data: {
        totalSessions,
        totalMinutes,
        averageDuration,
        averageStressReduction,
        lastWeekSessions,
        favoriteCategory,
        mostEffectiveExercise
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de mindfulness:', error)
    return { data: null, error }
  }
}
