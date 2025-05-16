import { supabase } from '@/lib/supabase-client'
import { 
  fetchDataFromSupabase, 
  insertDataToSupabase, 
  updateDataInSupabase, 
  deleteDataFromSupabase 
} from '@/lib/supabase-utils'

/**
 * Interfaz para los registros de estado de ánimo
 */
export interface MoodEntry {
  id: string
  userId: string
  date: string
  time: string
  mood: number // 1-5
  energy: number // 1-5
  stress: number // 1-5
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Interfaz para las actividades de bienestar
 */
export interface WellnessActivity {
  id: string
  name: string
  description?: string
  category: 'mental' | 'emotional' | 'physical' | 'social' | 'spiritual'
  duration: number // en minutos
  imageUrl?: string
  videoUrl?: string
  instructions?: string[]
  benefits?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Interfaz para los registros de actividades de bienestar
 */
export interface WellnessActivityLog {
  id: string
  userId: string
  activityId: string
  date: string
  duration: number // en minutos
  notes?: string
  rating?: number // 1-5
  createdAt: string
  updatedAt: string
}

/**
 * Interfaz para las entradas del diario de gratitud
 */
export interface GratitudeEntry {
  id: string
  userId: string
  date: string
  entries: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Obtiene los registros de estado de ánimo del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Registros de estado de ánimo o null en caso de error
 */
export const getMoodEntries = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<{ data: MoodEntry[] | null, error: any }> => {
  try {
    // Intentar obtener registros de Supabase
    const { data, error } = await fetchDataFromSupabase<MoodEntry>(
      'mood_entries',
      userId,
      {
        orderBy: { column: 'date', ascending: false },
        limit: options?.limit
      }
    )
    
    // Si hay error o no hay datos, intentar obtener de localStorage
    if (error || !data || data.length === 0) {
      console.log('Intentando obtener registros de estado de ánimo de localStorage')
      const localEntries = localStorage.getItem(`mood_entries_${userId}`)
      
      if (localEntries) {
        let entries = JSON.parse(localEntries)
        
        // Aplicar filtros si es necesario
        if (options?.startDate && options?.endDate) {
          entries = entries.filter((entry: MoodEntry) => 
            entry.date >= options.startDate! && entry.date <= options.endDate!
          )
        }
        
        if (options?.limit) {
          entries = entries.slice(0, options.limit)
        }
        
        return { data: entries, error: null }
      }
    }
    
    return { data, error }
  } catch (error) {
    console.error('Error al obtener registros de estado de ánimo:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de estado de ánimo
 * @param entry - Registro de estado de ánimo
 * @returns - Registro guardado o null en caso de error
 */
export const saveMoodEntry = async (entry: MoodEntry): Promise<{ data: MoodEntry | null, error: any }> => {
  try {
    // Guardar en localStorage como respaldo
    const localEntries = localStorage.getItem(`mood_entries_${entry.userId}`)
    let entries = localEntries ? JSON.parse(localEntries) : []
    
    // Actualizar o añadir el registro
    const existingIndex = entries.findIndex((e: MoodEntry) => e.id === entry.id)
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }
    
    localStorage.setItem(`mood_entries_${entry.userId}`, JSON.stringify(entries))
    
    // Preparar datos para Supabase
    const supabaseData = {
      id: entry.id,
      user_id: entry.userId,
      date: entry.date,
      time: entry.time,
      mood: entry.mood,
      energy: entry.energy,
      stress: entry.stress,
      notes: entry.notes,
      tags: entry.tags,
      created_at: entry.createdAt,
      updated_at: new Date().toISOString()
    }
    
    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert(supabaseData)
        .select()
      
      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: entry, error: null }
      }
      
      console.log('Registro de estado de ánimo guardado exitosamente en Supabase')
      return { data: entry, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: entry, error: null }
    }
  } catch (error) {
    console.error('Error al guardar registro de estado de ánimo:', error)
    return { data: null, error }
  }
}

/**
 * Elimina un registro de estado de ánimo
 * @param entryId - ID del registro
 * @param userId - ID del usuario
 * @returns - True si se eliminó correctamente, false en caso contrario
 */
export const deleteMoodEntry = async (entryId: string, userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Eliminar de localStorage
    const localEntries = localStorage.getItem(`mood_entries_${userId}`)
    
    if (localEntries) {
      const entries = JSON.parse(localEntries)
      const updatedEntries = entries.filter((e: MoodEntry) => e.id !== entryId)
      localStorage.setItem(`mood_entries_${userId}`, JSON.stringify(updatedEntries))
    }
    
    // Eliminar de Supabase
    return await deleteDataFromSupabase('mood_entries', entryId)
  } catch (error) {
    console.error('Error al eliminar registro de estado de ánimo:', error)
    return { success: false, error }
  }
}

/**
 * Obtiene las actividades de bienestar
 * @param options - Opciones de filtrado
 * @returns - Actividades de bienestar o null en caso de error
 */
export const getWellnessActivities = async (
  options?: {
    category?: string
    difficulty?: string
    limit?: number
  }
): Promise<{ data: WellnessActivity[] | null, error: any }> => {
  try {
    // Iniciar consulta
    let query = supabase
      .from('wellness_activities')
      .select('*')
    
    // Aplicar filtros
    if (options?.category) {
      query = query.eq('category', options.category)
    }
    
    if (options?.difficulty) {
      query = query.eq('difficulty', options.difficulty)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    // Ejecutar consulta
    const { data, error } = await query
    
    if (error || !data || data.length === 0) {
      // Usar datos locales como respaldo
      return { 
        data: [
          {
            id: 'meditation-1',
            name: 'Meditación guiada',
            description: 'Una meditación de 10 minutos para reducir el estrés y aumentar la concentración',
            category: 'mental',
            duration: 10,
            difficulty: 'beginner',
            imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            benefits: ['Reduce el estrés', 'Mejora la concentración', 'Promueve la calma mental']
          },
          {
            id: 'breathing-1',
            name: 'Ejercicios de respiración',
            description: 'Técnica de respiración 4-7-8 para calmar la mente y reducir la ansiedad',
            category: 'emotional',
            duration: 5,
            difficulty: 'beginner',
            imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            instructions: ['Inhala por la nariz durante 4 segundos', 'Mantén la respiración durante 7 segundos', 'Exhala por la boca durante 8 segundos', 'Repite 4 veces'],
            benefits: ['Reduce la ansiedad', 'Mejora el sueño', 'Disminuye la presión arterial']
          },
          {
            id: 'walking-1',
            name: 'Caminata consciente',
            description: 'Una caminata de 20 minutos enfocándose en las sensaciones y el entorno',
            category: 'physical',
            duration: 20,
            difficulty: 'beginner',
            imageUrl: 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            benefits: ['Reduce el estrés', 'Mejora la condición física', 'Aumenta la conciencia del entorno']
          },
          {
            id: 'gratitude-1',
            name: 'Práctica de gratitud',
            description: 'Ejercicio para reconocer y apreciar las cosas positivas en tu vida',
            category: 'emotional',
            duration: 5,
            difficulty: 'beginner',
            imageUrl: 'https://images.unsplash.com/photo-1506252374453-ef5237291d83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            instructions: ['Escribe tres cosas por las que estés agradecido hoy', 'Reflexiona sobre por qué te hacen sentir gratitud', 'Intenta encontrar cosas nuevas cada día'],
            benefits: ['Mejora el estado de ánimo', 'Reduce el estrés', 'Aumenta la satisfacción con la vida']
          },
          {
            id: 'yoga-1',
            name: 'Yoga para principiantes',
            description: 'Secuencia de yoga suave para mejorar la flexibilidad y reducir el estrés',
            category: 'physical',
            duration: 15,
            difficulty: 'beginner',
            imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
            benefits: ['Mejora la flexibilidad', 'Reduce el estrés', 'Fortalece el cuerpo']
          }
        ] as WellnessActivity[],
        error: null
      }
    }
    
    // Transformar los datos al formato esperado
    const activities: WellnessActivity[] = data.map(activity => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      duration: activity.duration,
      imageUrl: activity.image_url,
      videoUrl: activity.video_url,
      instructions: activity.instructions,
      benefits: activity.benefits,
      difficulty: activity.difficulty
    }))
    
    return { data: activities, error: null }
  } catch (error) {
    console.error('Error al obtener actividades de bienestar:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los registros de actividades de bienestar del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Registros de actividades o null en caso de error
 */
export const getWellnessActivityLogs = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<{ data: WellnessActivityLog[] | null, error: any }> => {
  try {
    // Intentar obtener registros de Supabase
    const { data, error } = await fetchDataFromSupabase<WellnessActivityLog>(
      'wellness_activity_logs',
      userId,
      {
        orderBy: { column: 'date', ascending: false },
        limit: options?.limit
      }
    )
    
    // Si hay error o no hay datos, intentar obtener de localStorage
    if (error || !data || data.length === 0) {
      console.log('Intentando obtener registros de actividades de bienestar de localStorage')
      const localLogs = localStorage.getItem(`wellness_activity_logs_${userId}`)
      
      if (localLogs) {
        let logs = JSON.parse(localLogs)
        
        // Aplicar filtros si es necesario
        if (options?.startDate && options?.endDate) {
          logs = logs.filter((log: WellnessActivityLog) => 
            log.date >= options.startDate! && log.date <= options.endDate!
          )
        }
        
        if (options?.limit) {
          logs = logs.slice(0, options.limit)
        }
        
        return { data: logs, error: null }
      }
    }
    
    return { data, error }
  } catch (error) {
    console.error('Error al obtener registros de actividades de bienestar:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de actividad de bienestar
 * @param log - Registro de actividad
 * @returns - Registro guardado o null en caso de error
 */
export const saveWellnessActivityLog = async (log: WellnessActivityLog): Promise<{ data: WellnessActivityLog | null, error: any }> => {
  try {
    // Guardar en localStorage como respaldo
    const localLogs = localStorage.getItem(`wellness_activity_logs_${log.userId}`)
    let logs = localLogs ? JSON.parse(localLogs) : []
    
    // Actualizar o añadir el registro
    const existingIndex = logs.findIndex((l: WellnessActivityLog) => l.id === log.id)
    
    if (existingIndex >= 0) {
      logs[existingIndex] = log
    } else {
      logs.push(log)
    }
    
    localStorage.setItem(`wellness_activity_logs_${log.userId}`, JSON.stringify(logs))
    
    // Preparar datos para Supabase
    const supabaseData = {
      id: log.id,
      user_id: log.userId,
      activity_id: log.activityId,
      date: log.date,
      duration: log.duration,
      notes: log.notes,
      rating: log.rating,
      created_at: log.createdAt,
      updated_at: new Date().toISOString()
    }
    
    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('wellness_activity_logs')
        .upsert(supabaseData)
        .select()
      
      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: log, error: null }
      }
      
      console.log('Registro de actividad guardado exitosamente en Supabase')
      return { data: log, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: log, error: null }
    }
  } catch (error) {
    console.error('Error al guardar registro de actividad de bienestar:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las entradas del diario de gratitud del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Entradas del diario o null en caso de error
 */
export const getGratitudeEntries = async (
  userId: string,
  options?: {
    date?: string
    limit?: number
  }
): Promise<{ data: GratitudeEntry[] | null, error: any }> => {
  try {
    // Construir consulta
    let query = supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (options?.date) {
      query = query.eq('date', options.date)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    // Ejecutar consulta
    const { data, error } = await query
    
    // Si hay error o no hay datos, intentar obtener de localStorage
    if (error || !data || data.length === 0) {
      console.log('Intentando obtener entradas de gratitud de localStorage')
      const localEntries = localStorage.getItem(`gratitude_entries_${userId}`)
      
      if (localEntries) {
        let entries = JSON.parse(localEntries)
        
        // Aplicar filtros si es necesario
        if (options?.date) {
          entries = entries.filter((entry: GratitudeEntry) => entry.date === options.date)
        }
        
        if (options?.limit) {
          entries = entries.slice(0, options.limit)
        }
        
        return { data: entries, error: null }
      }
    }
    
    // Transformar los datos al formato esperado
    const entries: GratitudeEntry[] = data ? data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      date: entry.date,
      entries: entry.entries,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    })) : []
    
    return { data: entries, error: null }
  } catch (error) {
    console.error('Error al obtener entradas de gratitud:', error)
    return { data: null, error }
  }
}

/**
 * Guarda una entrada del diario de gratitud
 * @param entry - Entrada del diario
 * @returns - Entrada guardada o null en caso de error
 */
export const saveGratitudeEntry = async (entry: GratitudeEntry): Promise<{ data: GratitudeEntry | null, error: any }> => {
  try {
    // Guardar en localStorage como respaldo
    const localEntries = localStorage.getItem(`gratitude_entries_${entry.userId}`)
    let entries = localEntries ? JSON.parse(localEntries) : []
    
    // Actualizar o añadir la entrada
    const existingIndex = entries.findIndex((e: GratitudeEntry) => e.id === entry.id)
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }
    
    localStorage.setItem(`gratitude_entries_${entry.userId}`, JSON.stringify(entries))
    
    // Preparar datos para Supabase
    const supabaseData = {
      id: entry.id,
      user_id: entry.userId,
      date: entry.date,
      entries: entry.entries,
      created_at: entry.createdAt,
      updated_at: new Date().toISOString()
    }
    
    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('gratitude_entries')
        .upsert(supabaseData)
        .select()
      
      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: entry, error: null }
      }
      
      console.log('Entrada de gratitud guardada exitosamente en Supabase')
      return { data: entry, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: entry, error: null }
    }
  } catch (error) {
    console.error('Error al guardar entrada de gratitud:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las estadísticas de bienestar del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Estadísticas de bienestar o null en caso de error
 */
export const getWellnessStats = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
): Promise<{ data: any, error: any }> => {
  try {
    // Obtener registros de estado de ánimo
    const { data: moodEntries, error: moodError } = await getMoodEntries(userId, options)
    
    if (moodError) {
      console.error('Error al obtener registros de estado de ánimo:', moodError)
    }
    
    // Obtener registros de actividades
    const { data: activityLogs, error: activityError } = await getWellnessActivityLogs(userId, options)
    
    if (activityError) {
      console.error('Error al obtener registros de actividades:', activityError)
    }
    
    // Calcular estadísticas de estado de ánimo
    let moodStats = null
    if (moodEntries && moodEntries.length > 0) {
      const totalEntries = moodEntries.length
      const totalMood = moodEntries.reduce((acc, entry) => acc + entry.mood, 0)
      const totalEnergy = moodEntries.reduce((acc, entry) => acc + entry.energy, 0)
      const totalStress = moodEntries.reduce((acc, entry) => acc + entry.stress, 0)
      
      const avgMood = totalMood / totalEntries
      const avgEnergy = totalEnergy / totalEntries
      const avgStress = totalStress / totalEntries
      
      // Calcular tendencia
      const moodTrend = moodEntries.map(entry => ({
        date: entry.date,
        mood: entry.mood,
        energy: entry.energy,
        stress: entry.stress
      }))
      
      moodStats = {
        avgMood,
        avgEnergy,
        avgStress,
        moodTrend
      }
    }
    
    // Calcular estadísticas de actividades
    let activityStats = null
    if (activityLogs && activityLogs.length > 0) {
      const totalActivities = activityLogs.length
      const totalDuration = activityLogs.reduce((acc, log) => acc + log.duration, 0)
      const avgDuration = totalDuration / totalActivities
      
      // Agrupar por tipo de actividad
      const activitiesByType: Record<string, number> = {}
      
      for (const log of activityLogs) {
        // Obtener la actividad
        const { data: activity } = await supabase
          .from('wellness_activities')
          .select('category')
          .eq('id', log.activityId)
          .single()
        
        if (activity) {
          const category = activity.category
          activitiesByType[category] = (activitiesByType[category] || 0) + 1
        }
      }
      
      activityStats = {
        totalActivities,
        totalDuration,
        avgDuration,
        activitiesByType
      }
    }
    
    return {
      data: {
        mood: moodStats,
        activities: activityStats
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de bienestar:', error)
    return { data: null, error }
  }
}
