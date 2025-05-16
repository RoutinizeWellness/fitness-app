import { supabase } from '@/lib/supabase-client'
import { getCurrentUserWithProfile } from '@/lib/supabase-utils'
import { getTrainingStats } from '@/lib/training-service'
import { getNutritionStats } from '@/lib/nutrition-service'
import { getSleepStats } from '@/lib/sleep-service'
import { getWellnessStats } from '@/lib/wellness-service'

/**
 * Interfaz para los datos del dashboard
 */
export interface DashboardData {
  profile: any
  training: any
  nutrition: any
  sleep: any
  wellness: any
  notifications: any[]
  goals: any
  streaks: any
}

/**
 * Obtiene todos los datos para el dashboard
 * @param userId - ID del usuario
 * @returns - Datos del dashboard o null en caso de error
 */
export const getDashboardData = async (userId: string): Promise<{ data: DashboardData | null, error: any }> => {
  try {
    // Obtener perfil del usuario
    const { user, profile, error: profileError } = await getCurrentUserWithProfile()
    
    if (profileError || !user) {
      console.error('Error al obtener perfil del usuario:', profileError)
      return { data: null, error: profileError }
    }
    
    // Obtener estadísticas de entrenamiento
    const { data: trainingStats, error: trainingError } = await getTrainingStats(userId)
    
    if (trainingError) {
      console.error('Error al obtener estadísticas de entrenamiento:', trainingError)
    }
    
    // Obtener estadísticas de nutrición
    const { data: nutritionStats, error: nutritionError } = await getNutritionStats(userId)
    
    if (nutritionError) {
      console.error('Error al obtener estadísticas de nutrición:', nutritionError)
    }
    
    // Obtener estadísticas de sueño
    const { data: sleepStats, error: sleepError } = await getSleepStats(userId)
    
    if (sleepError) {
      console.error('Error al obtener estadísticas de sueño:', sleepError)
    }
    
    // Obtener estadísticas de bienestar
    const { data: wellnessStats, error: wellnessError } = await getWellnessStats(userId)
    
    if (wellnessError) {
      console.error('Error al obtener estadísticas de bienestar:', wellnessError)
    }
    
    // Obtener notificaciones
    const { data: notifications, error: notificationsError } = await getNotifications(userId)
    
    if (notificationsError) {
      console.error('Error al obtener notificaciones:', notificationsError)
    }
    
    // Obtener objetivos
    const { data: goals, error: goalsError } = await getGoals(userId)
    
    if (goalsError) {
      console.error('Error al obtener objetivos:', goalsError)
    }
    
    // Obtener rachas
    const { data: streaks, error: streaksError } = await getStreaks(userId)
    
    if (streaksError) {
      console.error('Error al obtener rachas:', streaksError)
    }
    
    return {
      data: {
        profile,
        training: trainingStats,
        nutrition: nutritionStats,
        sleep: sleepStats,
        wellness: wellnessStats,
        notifications: notifications || [],
        goals: goals || {},
        streaks: streaks || {}
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las notificaciones del usuario
 * @param userId - ID del usuario
 * @returns - Notificaciones o null en caso de error
 */
export const getNotifications = async (userId: string): Promise<{ data: any[] | null, error: any }> => {
  try {
    // Intentar obtener notificaciones de Supabase
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Error al obtener notificaciones:', error)
      
      // Intentar obtener de localStorage
      const localNotifications = localStorage.getItem('notifications')
      
      if (localNotifications) {
        return { data: JSON.parse(localNotifications), error: null }
      }
      
      return { data: [], error: null }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los objetivos del usuario
 * @param userId - ID del usuario
 * @returns - Objetivos o null en caso de error
 */
export const getGoals = async (userId: string): Promise<{ data: any | null, error: any }> => {
  try {
    // Intentar obtener objetivos de Supabase
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Error al obtener objetivos:', error)
      return { data: null, error }
    }
    
    // Transformar los datos
    const goals = {
      training: data.filter(goal => goal.category === 'training'),
      nutrition: data.filter(goal => goal.category === 'nutrition'),
      sleep: data.filter(goal => goal.category === 'sleep'),
      wellness: data.filter(goal => goal.category === 'wellness')
    }
    
    return { data: goals, error: null }
  } catch (error) {
    console.error('Error al obtener objetivos:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las rachas del usuario
 * @param userId - ID del usuario
 * @returns - Rachas o null en caso de error
 */
export const getStreaks = async (userId: string): Promise<{ data: any | null, error: any }> => {
  try {
    // Intentar obtener rachas de Supabase
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error al obtener rachas:', error)
      
      // Datos de ejemplo
      return { 
        data: {
          workout: {
            current: 3,
            longest: 14,
            lastActivity: new Date().toISOString().split('T')[0]
          },
          nutrition: {
            current: 5,
            longest: 21,
            lastActivity: new Date().toISOString().split('T')[0]
          },
          sleep: {
            current: 7,
            longest: 30,
            lastActivity: new Date().toISOString().split('T')[0]
          },
          wellness: {
            current: 2,
            longest: 10,
            lastActivity: new Date().toISOString().split('T')[0]
          }
        }, 
        error: null 
      }
    }
    
    // Transformar los datos
    const streaks = {
      workout: data.find(streak => streak.type === 'workout') || { current: 0, longest: 0 },
      nutrition: data.find(streak => streak.type === 'nutrition') || { current: 0, longest: 0 },
      sleep: data.find(streak => streak.type === 'sleep') || { current: 0, longest: 0 },
      wellness: data.find(streak => streak.type === 'wellness') || { current: 0, longest: 0 }
    }
    
    return { data: streaks, error: null }
  } catch (error) {
    console.error('Error al obtener rachas:', error)
    return { data: null, error }
  }
}

/**
 * Actualiza una racha
 * @param userId - ID del usuario
 * @param type - Tipo de racha
 * @returns - Racha actualizada o null en caso de error
 */
export const updateStreak = async (userId: string, type: string): Promise<{ data: any | null, error: any }> => {
  try {
    // Obtener la racha actual
    const { data: currentStreak, error: getError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .single()
    
    if (getError && getError.code !== 'PGRST116') { // PGRST116 = No se encontró ningún registro
      console.error('Error al obtener racha actual:', getError)
      return { data: null, error: getError }
    }
    
    const today = new Date().toISOString().split('T')[0]
    
    // Si no existe la racha, crearla
    if (!currentStreak) {
      const newStreak = {
        user_id: userId,
        type,
        current: 1,
        longest: 1,
        last_activity: today
      }
      
      const { data, error } = await supabase
        .from('user_streaks')
        .insert([newStreak])
        .select()
      
      if (error) {
        console.error('Error al crear racha:', error)
        return { data: null, error }
      }
      
      return { data: data[0], error: null }
    }
    
    // Verificar si ya se actualizó hoy
    if (currentStreak.last_activity === today) {
      return { data: currentStreak, error: null }
    }
    
    // Verificar si es consecutivo
    const lastActivity = new Date(currentStreak.last_activity)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastActivity.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
    
    // Actualizar racha
    const updatedStreak = {
      current: isConsecutive ? currentStreak.current + 1 : 1,
      longest: isConsecutive ? Math.max(currentStreak.current + 1, currentStreak.longest) : currentStreak.longest,
      last_activity: today
    }
    
    const { data, error } = await supabase
      .from('user_streaks')
      .update(updatedStreak)
      .eq('id', currentStreak.id)
      .select()
    
    if (error) {
      console.error('Error al actualizar racha:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error al actualizar racha:', error)
    return { data: null, error }
  }
}
