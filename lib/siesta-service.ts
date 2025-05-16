import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaces para el módulo de siesta
 */
export interface SiestaSession {
  id: string
  userId: string
  date: string
  duration: number // en minutos
  quality?: number // 1-5
  preSiestaEnergy?: number // 1-5
  postSiestaEnergy?: number // 1-5
  notes?: string
  createdAt: string
}

export interface SiestaStats {
  totalSessions: number
  averageDuration: number
  averageQuality: number
  averageEnergyImprovement: number
  lastWeekSessions: number
  mostProductiveTime?: string
  recommendedDuration?: number
}

/**
 * Obtiene las sesiones de siesta de un usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Lista de sesiones o null en caso de error
 */
export const getSiestaSessions = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<{ data: SiestaSession[] | null, error: any }> => {
  try {
    let query = supabase
      .from('siesta_sessions')
      .select('*')
      .eq('user_id', userId)
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
      console.error('Error al obtener sesiones de siesta:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const sessions: SiestaSession[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      date: item.date,
      duration: item.duration,
      quality: item.quality,
      preSiestaEnergy: item.pre_siesta_energy,
      postSiestaEnergy: item.post_siesta_energy,
      notes: item.notes,
      createdAt: item.created_at
    }))

    return { data: sessions, error: null }
  } catch (error) {
    console.error('Error al obtener sesiones de siesta:', error)
    return { data: null, error }
  }
}

/**
 * Guarda una sesión de siesta
 * @param session - Datos de la sesión
 * @returns - Sesión guardada o null en caso de error
 */
export const saveSiestaSession = async (
  session: Omit<SiestaSession, 'id' | 'createdAt'> & { id?: string }
): Promise<{ data: SiestaSession | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const sessionId = session.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo de la sesión
    const completeSession: SiestaSession = {
      id: sessionId,
      createdAt: now,
      ...session
    }

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeSession.id,
      user_id: completeSession.userId,
      date: completeSession.date,
      duration: completeSession.duration,
      quality: completeSession.quality,
      pre_siesta_energy: completeSession.preSiestaEnergy,
      post_siesta_energy: completeSession.postSiestaEnergy,
      notes: completeSession.notes,
      created_at: completeSession.createdAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('siesta_sessions')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeSession, error }
      }

      console.log('Sesión de siesta guardada exitosamente en Supabase')
      return { data: completeSession, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar sesión de siesta:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene estadísticas de siesta para un usuario
 * @param userId - ID del usuario
 * @returns - Estadísticas o null en caso de error
 */
export const getSiestaStats = async (
  userId: string
): Promise<{ data: SiestaStats | null, error: any }> => {
  try {
    // Obtener todas las sesiones
    const { data: sessions, error } = await getSiestaSessions(userId)

    if (error || !sessions) {
      return { data: null, error: error || new Error('No se pudieron obtener las sesiones') }
    }

    if (sessions.length === 0) {
      return {
        data: {
          totalSessions: 0,
          averageDuration: 0,
          averageQuality: 0,
          averageEnergyImprovement: 0,
          lastWeekSessions: 0
        },
        error: null
      }
    }

    // Calcular estadísticas
    const totalSessions = sessions.length
    const averageDuration = sessions.reduce((sum, session) => sum + session.duration, 0) / totalSessions

    // Calcular calidad promedio (si está disponible)
    let qualitySum = 0
    let qualityCount = 0
    sessions.forEach(session => {
      if (session.quality !== undefined) {
        qualitySum += session.quality
        qualityCount++
      }
    })
    const averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0

    // Calcular mejora de energía promedio
    let energyImprovementSum = 0
    let energyImprovementCount = 0
    sessions.forEach(session => {
      if (session.preSiestaEnergy !== undefined && session.postSiestaEnergy !== undefined) {
        energyImprovementSum += (session.postSiestaEnergy - session.preSiestaEnergy)
        energyImprovementCount++
      }
    })
    const averageEnergyImprovement = energyImprovementCount > 0 ? energyImprovementSum / energyImprovementCount : 0

    // Calcular sesiones de la última semana
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const lastWeekSessions = sessions.filter(session => new Date(session.date) >= oneWeekAgo).length

    // Determinar la hora más productiva (si hay suficientes datos)
    let mostProductiveTime: string | undefined
    if (sessions.length >= 5) {
      // Agrupar por hora del día
      const timeDistribution: Record<string, { count: number, avgImprovement: number }> = {}
      
      sessions.forEach(session => {
        if (session.preSiestaEnergy !== undefined && session.postSiestaEnergy !== undefined) {
          const date = new Date(session.date)
          const hour = date.getHours()
          const timeKey = `${hour}:00`
          
          if (!timeDistribution[timeKey]) {
            timeDistribution[timeKey] = { count: 0, avgImprovement: 0 }
          }
          
          timeDistribution[timeKey].count++
          timeDistribution[timeKey].avgImprovement += (session.postSiestaEnergy - session.preSiestaEnergy)
        }
      })
      
      // Encontrar la hora con mayor mejora promedio
      let bestTime = ''
      let bestImprovement = 0
      
      Object.entries(timeDistribution).forEach(([time, stats]) => {
        const avgImprovement = stats.count > 0 ? stats.avgImprovement / stats.count : 0
        if (avgImprovement > bestImprovement) {
          bestImprovement = avgImprovement
          bestTime = time
        }
      })
      
      if (bestTime) {
        mostProductiveTime = bestTime
      }
    }

    // Determinar duración recomendada basada en datos
    let recommendedDuration: number | undefined
    if (sessions.length >= 5) {
      // Agrupar por duración
      const durationEffectiveness: Record<number, { count: number, avgImprovement: number }> = {}
      
      sessions.forEach(session => {
        if (session.preSiestaEnergy !== undefined && session.postSiestaEnergy !== undefined) {
          const duration = session.duration
          
          if (!durationEffectiveness[duration]) {
            durationEffectiveness[duration] = { count: 0, avgImprovement: 0 }
          }
          
          durationEffectiveness[duration].count++
          durationEffectiveness[duration].avgImprovement += (session.postSiestaEnergy - session.preSiestaEnergy)
        }
      })
      
      // Encontrar la duración con mayor mejora promedio
      let bestDuration = 0
      let bestImprovement = 0
      
      Object.entries(durationEffectiveness).forEach(([duration, stats]) => {
        const avgImprovement = stats.count > 0 ? stats.avgImprovement / stats.count : 0
        if (avgImprovement > bestImprovement) {
          bestImprovement = avgImprovement
          bestDuration = parseInt(duration)
        }
      })
      
      if (bestDuration > 0) {
        recommendedDuration = bestDuration
      }
    }

    return {
      data: {
        totalSessions,
        averageDuration,
        averageQuality,
        averageEnergyImprovement,
        lastWeekSessions,
        mostProductiveTime,
        recommendedDuration
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de siesta:', error)
    return { data: null, error }
  }
}
