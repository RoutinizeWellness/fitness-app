import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaz para las sesiones de respiración
 */
export interface BreathSession {
  id: string
  userId: string
  date: string
  sessionType: string // 'wim_hof', 'box_breathing', 'alternate_nostril', etc.
  rounds: number
  avgRetentionTime: number // en segundos
  maxRetentionTime: number // en segundos
  minRetentionTime: number // en segundos
  feelingBefore?: number // 1-5
  feelingAfter?: number // 1-5
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Obtiene las sesiones de respiración del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Sesiones de respiración o null en caso de error
 */
export const getBreathSessions = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    limit?: number
    sessionType?: string
  }
): Promise<{ data: BreathSession[] | null, error: any }> => {
  try {
    let query = supabase
      .from('breath_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }
    
    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }
    
    if (options?.sessionType) {
      query = query.eq('session_type', options.sessionType)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error al obtener sesiones de respiración:', error)
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: [], error: null }
    }
    
    // Transformar los datos al formato de la interfaz
    const sessions: BreathSession[] = data.map(session => ({
      id: session.id,
      userId: session.user_id,
      date: session.date,
      sessionType: session.session_type,
      rounds: session.rounds,
      avgRetentionTime: session.avg_retention_time,
      maxRetentionTime: session.max_retention_time,
      minRetentionTime: session.min_retention_time,
      feelingBefore: session.feeling_before,
      feelingAfter: session.feeling_after,
      notes: session.notes,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }))
    
    return { data: sessions, error: null }
  } catch (error) {
    console.error('Error al obtener sesiones de respiración:', error)
    return { data: null, error }
  }
}

/**
 * Guarda una sesión de respiración
 * @param session - Datos de la sesión
 * @returns - Sesión guardada o null en caso de error
 */
export const saveBreathSession = async (
  session: Omit<BreathSession, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: BreathSession | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const sessionId = uuidv4()
    const now = new Date().toISOString()
    
    // Crear el objeto completo de la sesión
    const completeSession: BreathSession = {
      id: sessionId,
      createdAt: now,
      updatedAt: now,
      ...session
    }
    
    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeSession.id,
      user_id: completeSession.userId,
      date: completeSession.date,
      session_type: completeSession.sessionType,
      rounds: completeSession.rounds,
      avg_retention_time: completeSession.avgRetentionTime,
      max_retention_time: completeSession.maxRetentionTime,
      min_retention_time: completeSession.minRetentionTime,
      feeling_before: completeSession.feelingBefore,
      feeling_after: completeSession.feelingAfter,
      notes: completeSession.notes,
      created_at: completeSession.createdAt,
      updated_at: completeSession.updatedAt
    }
    
    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('breath_sessions')
        .upsert(supabaseData)
        .select()
      
      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeSession, error: null }
      }
      
      console.log('Sesión de respiración guardada exitosamente en Supabase')
      return { data: completeSession, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: completeSession, error: null }
    }
  } catch (error) {
    console.error('Error al guardar sesión de respiración:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene estadísticas de las sesiones de respiración
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Estadísticas o null en caso de error
 */
export const getBreathingStats = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    sessionType?: string
  }
): Promise<{ data: any, error: any }> => {
  try {
    // Obtener sesiones de respiración
    const { data: sessions, error } = await getBreathSessions(userId, {
      startDate: options?.startDate,
      endDate: options?.endDate,
      sessionType: options?.sessionType
    })
    
    if (error || !sessions) {
      return { data: null, error: error || new Error('No se pudieron obtener las sesiones') }
    }
    
    if (sessions.length === 0) {
      return { 
        data: {
          totalSessions: 0,
          totalRounds: 0,
          avgRetentionTime: 0,
          maxRetentionTime: 0,
          progress: [],
          feelingChange: 0
        }, 
        error: null 
      }
    }
    
    // Calcular estadísticas
    const totalSessions = sessions.length
    const totalRounds = sessions.reduce((acc, session) => acc + session.rounds, 0)
    const avgRetentionTime = sessions.reduce((acc, session) => acc + session.avgRetentionTime, 0) / totalSessions
    const maxRetentionTime = Math.max(...sessions.map(session => session.maxRetentionTime))
    
    // Calcular progreso (últimas 10 sesiones)
    const recentSessions = sessions.slice(0, 10)
    const progress = recentSessions.map(session => ({
      date: new Date(session.date).toLocaleDateString(),
      avgRetention: session.avgRetentionTime,
      maxRetention: session.maxRetentionTime
    })).reverse()
    
    // Calcular cambio en sensación
    const sessionsWithFeelings = sessions.filter(
      session => session.feelingBefore !== undefined && session.feelingAfter !== undefined
    )
    
    let feelingChange = 0
    if (sessionsWithFeelings.length > 0) {
      const totalChange = sessionsWithFeelings.reduce(
        (acc, session) => acc + ((session.feelingAfter || 0) - (session.feelingBefore || 0)), 
        0
      )
      feelingChange = totalChange / sessionsWithFeelings.length
    }
    
    return {
      data: {
        totalSessions,
        totalRounds,
        avgRetentionTime,
        maxRetentionTime,
        progress,
        feelingChange
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de respiración:', error)
    return { data: null, error }
  }
}
