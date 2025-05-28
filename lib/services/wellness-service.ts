/**
 * Wellness Service
 *
 * This service handles all wellness-related operations with Supabase.
 * It provides methods for:
 * - Tracking mood and stress
 * - Managing sleep logs
 * - Tracking breathing sessions
 * - Managing meditation sessions
 * - Accessing mindfulness exercises
 */

import { supabaseService, QueryResponse } from "@/lib/supabase-service"
import { TABLES } from "@/lib/config/supabase-config"
import { v4 as uuidv4 } from "uuid"
import {
  MoodEntry,
  BreathingSession,
  MindfulnessSession,
  WellnessStats,
  EmotionType,
  BreathingTechnique,
  MindfulnessType
} from '@/lib/types/wellness'

/**
 * Wellness Service Class
 */
export class WellnessService {
  /**
   * Save a mood entry
   * @param entry - Mood entry data
   * @returns - Saved mood entry
   */
  static async saveMoodEntry(
    entry: Omit<MoodEntry, 'id' | 'createdAt'> & { id?: string }
  ): Promise<QueryResponse<MoodEntry>> {
    // Validate entry data
    if (!entry.userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    if (!entry.date) {
      return { data: null, error: { message: 'Date is required' }, status: 400 }
    }

    // Create a unique ID if not provided
    const entryId = entry.id || uuidv4()
    const now = new Date().toISOString()

    // Convert data to database format
    const dbEntry = {
      id: entryId,
      user_id: entry.userId,
      date: entry.date,
      time: entry.time,
      mood_level: entry.moodLevel,
      energy_level: entry.energyLevel,
      stress_level: entry.stressLevel,
      anxiety_level: entry.anxietyLevel,
      mental_clarity: entry.mentalClarity,
      emotion_type: entry.emotionType,
      emotion_intensity: entry.emotionIntensity,
      emotion_valence: entry.emotionValence,
      emotion_arousal: entry.emotionArousal,
      journal_entry: entry.journalEntry,
      factors: entry.factors,
      created_at: entry.id ? undefined : now
    }

    // Insert or update the entry
    const response = await supabaseService.insert<any>(
      'mood_entries',
      dbEntry,
      { upsert: true }
    )

    // Transform the result to interface format
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data

      const savedEntry: MoodEntry = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        time: data.time,
        moodLevel: data.mood_level,
        energyLevel: data.energy_level,
        stressLevel: data.stress_level,
        anxietyLevel: data.anxiety_level,
        mentalClarity: data.mental_clarity,
        emotionType: data.emotion_type as EmotionType,
        emotionIntensity: data.emotion_intensity,
        emotionValence: data.emotion_valence,
        emotionArousal: data.emotion_arousal,
        journalEntry: data.journal_entry,
        factors: data.factors,
        createdAt: data.created_at
      }

      return { ...response, data: savedEntry }
    }

    return response
  }

  /**
   * Get mood entries for a user
   * @param userId - User ID
   * @param options - Query options
   * @returns - List of mood entries
   */
  static async getMoodEntries(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      orderBy?: { column: string; ascending: boolean };
      useCache?: boolean;
    } = {}
  ): Promise<QueryResponse<MoodEntry[]>> {
    if (!userId) {
      return { data: [], error: { message: 'User ID is required' }, status: 400 }
    }

    const {
      limit = 30,
      offset = 0,
      startDate,
      endDate,
      orderBy,
      useCache = true
    } = options

    let queryOptions: any = {
      select: '*',
      eq: { user_id: userId },
      limit,
      offset,
      useCache
    }

    if (startDate) {
      queryOptions.gte = { date: startDate }
    }

    if (endDate) {
      queryOptions.lte = { date: endDate }
    }

    if (orderBy) {
      queryOptions.order = { [orderBy.column]: orderBy.ascending ? 'asc' : 'desc' }
    } else {
      queryOptions.order = { date: 'desc', time: 'desc' }
    }

    const response = await supabaseService.query<any[]>('mood_entries', queryOptions)

    // Transform database data to interface format
    if (response.data) {
      const moodEntries: MoodEntry[] = response.data.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        date: entry.date,
        time: entry.time,
        moodLevel: entry.mood_level,
        energyLevel: entry.energy_level,
        stressLevel: entry.stress_level,
        anxietyLevel: entry.anxiety_level,
        mentalClarity: entry.mental_clarity,
        emotionType: entry.emotion_type as EmotionType,
        emotionIntensity: entry.emotion_intensity,
        emotionValence: entry.emotion_valence,
        emotionArousal: entry.emotion_arousal,
        journalEntry: entry.journal_entry,
        factors: entry.factors,
        createdAt: entry.created_at
      }))

      return { ...response, data: moodEntries }
    }

    return response
  }

  /**
   * Guarda una sesión de respiración
   * @param session - Datos de la sesión
   * @returns - Sesión guardada o null en caso de error
   */
  static async saveBreathingSession(
    session: Omit<BreathingSession, 'id' | 'createdAt'> & { id?: string }
  ): Promise<{ data: BreathingSession | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const sessionId = session.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbSession = {
        id: sessionId,
        user_id: session.userId,
        date: session.date,
        time: session.time,
        technique: session.technique,
        duration: session.duration,
        rounds: session.rounds,
        breath_holds: session.breathHolds,
        pre_session_state: session.preSessionState,
        post_session_state: session.postSessionState,
        notes: session.notes,
        created_at: session.id ? undefined : now
      }

      // Insertar o actualizar la sesión
      const { data, error } = await supabase
        .from('breathing_sessions')
        .upsert(dbSession)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedSession: BreathingSession = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        time: data.time,
        technique: data.technique as BreathingTechnique,
        duration: data.duration,
        rounds: data.rounds,
        breathHolds: data.breath_holds,
        preSessionState: data.pre_session_state,
        postSessionState: data.post_session_state,
        notes: data.notes,
        createdAt: data.created_at
      }

      return { data: savedSession, error: null }
    } catch (error) {
      console.error('Error al guardar sesión de respiración:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene las sesiones de respiración de un usuario
   * @param userId - ID del usuario
   * @param options - Opciones de consulta
   * @returns - Lista de sesiones de respiración
   */
  static async getBreathingSessions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      technique?: BreathingTechnique;
      orderBy?: { column: string; ascending: boolean };
    } = {}
  ): Promise<{ data: BreathingSession[] | null; error: any }> {
    try {
      const { limit = 30, offset = 0, startDate, endDate, technique, orderBy } = options

      let query = supabase
        .from('breathing_sessions')
        .select('*')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      if (technique) {
        query = query.eq('technique', technique)
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending })
      } else {
        query = query.order('date', { ascending: false })
              .order('time', { ascending: false })
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Convertir los datos de la base de datos al formato de la interfaz
      const breathingSessions = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        date: session.date,
        time: session.time,
        technique: session.technique as BreathingTechnique,
        duration: session.duration,
        rounds: session.rounds,
        breathHolds: session.breath_holds,
        preSessionState: session.pre_session_state,
        postSessionState: session.post_session_state,
        notes: session.notes,
        createdAt: session.created_at
      }))

      return { data: breathingSessions, error: null }
    } catch (error) {
      console.error('Error al obtener sesiones de respiración:', error)
      return { data: null, error }
    }
  }

  /**
   * Guarda una sesión de mindfulness
   * @param session - Datos de la sesión
   * @returns - Sesión guardada o null en caso de error
   */
  static async saveMindfulnessSession(
    session: Omit<MindfulnessSession, 'id' | 'createdAt'> & { id?: string }
  ): Promise<{ data: MindfulnessSession | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const sessionId = session.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbSession = {
        id: sessionId,
        user_id: session.userId,
        date: session.date,
        time: session.time,
        type: session.type,
        duration: session.duration,
        guided: session.guided,
        guide_source: session.guideSource,
        pre_session_stress: session.preSessionStress,
        post_session_stress: session.postSessionStress,
        notes: session.notes,
        created_at: session.id ? undefined : now
      }

      // Insertar o actualizar la sesión
      const { data, error } = await supabase
        .from('mindfulness_sessions')
        .upsert(dbSession)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedSession: MindfulnessSession = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        time: data.time,
        type: data.type as MindfulnessType,
        duration: data.duration,
        guided: data.guided,
        guideSource: data.guide_source,
        preSessionStress: data.pre_session_stress,
        postSessionStress: data.post_session_stress,
        notes: data.notes,
        createdAt: data.created_at
      }

      return { data: savedSession, error: null }
    } catch (error) {
      console.error('Error al guardar sesión de mindfulness:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene las sesiones de mindfulness de un usuario
   * @param userId - ID del usuario
   * @param options - Opciones de consulta
   * @returns - Lista de sesiones de mindfulness
   */
  static async getMindfulnessSessions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      type?: MindfulnessType;
      orderBy?: { column: string; ascending: boolean };
    } = {}
  ): Promise<{ data: MindfulnessSession[] | null; error: any }> {
    try {
      const { limit = 30, offset = 0, startDate, endDate, type, orderBy } = options

      let query = supabase
        .from('mindfulness_sessions')
        .select('*')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending })
      } else {
        query = query.order('date', { ascending: false })
              .order('time', { ascending: false })
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Convertir los datos de la base de datos al formato de la interfaz
      const mindfulnessSessions = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        date: session.date,
        time: session.time,
        type: session.type as MindfulnessType,
        duration: session.duration,
        guided: session.guided,
        guideSource: session.guide_source,
        preSessionStress: session.pre_session_stress,
        postSessionStress: session.post_session_stress,
        notes: session.notes,
        createdAt: session.created_at
      }))

      return { data: mindfulnessSessions, error: null }
    } catch (error) {
      console.error('Error al obtener sesiones de mindfulness:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene estadísticas de bienestar para un usuario
   * @param userId - ID del usuario
   * @param days - Número de días para calcular estadísticas
   * @returns - Estadísticas de bienestar
   */
  static async getWellnessStats(
    userId: string,
    days: number = 30
  ): Promise<{ data: WellnessStats | null; error: any }> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Obtener registros de estado emocional
      const { data: moodEntries, error: moodError } = await this.getMoodEntries(userId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        orderBy: { column: 'date', ascending: true }
      })

      if (moodError) {
        throw moodError
      }

      // Obtener sesiones de respiración
      const { data: breathingSessions, error: breathingError } = await this.getBreathingSessions(userId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      if (breathingError) {
        throw breathingError
      }

      // Obtener sesiones de mindfulness
      const { data: mindfulnessSessions, error: mindfulnessError } = await this.getMindfulnessSessions(userId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      if (mindfulnessError) {
        throw mindfulnessError
      }

      // Calcular estadísticas
      const totalMood = moodEntries ? moodEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) : 0
      const totalStress = moodEntries ? moodEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) : 0
      const totalEnergy = moodEntries ? moodEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) : 0
      const totalClarity = moodEntries ? moodEntries.reduce((sum, entry) => sum + entry.mentalClarity, 0) : 0

      const averageMood = moodEntries && moodEntries.length > 0 ? totalMood / moodEntries.length : 0
      const averageStress = moodEntries && moodEntries.length > 0 ? totalStress / moodEntries.length : 0
      const averageEnergy = moodEntries && moodEntries.length > 0 ? totalEnergy / moodEntries.length : 0
      const averageMentalClarity = moodEntries && moodEntries.length > 0 ? totalClarity / moodEntries.length : 0

      // Calcular distribución de emociones
      const emotionDistribution: Record<EmotionType, number> = {
        happy: 0,
        sad: 0,
        angry: 0,
        anxious: 0,
        calm: 0,
        excited: 0,
        tired: 0,
        content: 0,
        frustrated: 0,
        other: 0
      }

      if (moodEntries) {
        moodEntries.forEach(entry => {
          if (entry.emotionType) {
            emotionDistribution[entry.emotionType] = (emotionDistribution[entry.emotionType] || 0) + 1
          }
        })
      }

      // Calcular tendencia de estrés
      const stressTrend = moodEntries ? moodEntries.map(entry => entry.stressLevel) : []
      const dates = moodEntries ? moodEntries.map(entry => entry.date) : []

      // Calcular minutos totales de mindfulness
      const totalMindfulnessMinutes = mindfulnessSessions
        ? mindfulnessSessions.reduce((sum, session) => sum + session.duration, 0)
        : 0

      const stats: WellnessStats = {
        averageMood,
        averageStress,
        averageEnergy,
        averageMentalClarity,
        breathingSessions: breathingSessions ? breathingSessions.length : 0,
        mindfulnessSessions: mindfulnessSessions ? mindfulnessSessions.length : 0,
        totalMindfulnessMinutes,
        emotionDistribution,
        stressTrend,
        dates
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error al obtener estadísticas de bienestar:', error)
      return { data: null, error }
    }
  }
}
