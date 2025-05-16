import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaces para el módulo de hábitos
 */
export interface Habit {
  id: string
  userId: string
  title: string
  description?: string
  category: string
  frequency: string[]
  timeOfDay?: string
  duration?: number
  reminder: boolean
  reminderTime?: string
  streak: number
  longestStreak: number
  lastCompleted?: string
  startDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  userId: string
  completedAt: string
  notes?: string
  mood?: number
  createdAt: string
}

export interface WorkScheduleTemplate {
  id: string
  name: string
  description?: string
  schedule: Record<string, { start: string, end: string }[]>
  isSpanish: boolean
  includesSiesta: boolean
  createdAt: string
}

/**
 * Obtiene los hábitos de un usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Lista de hábitos o null en caso de error
 */
export const getHabits = async (
  userId: string,
  options?: {
    category?: string
    isActive?: boolean
    limit?: number
  }
): Promise<{ data: Habit[] | null, error: any }> => {
  try {
    let query = supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener hábitos:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos de snake_case a camelCase
    const habits: Habit[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      description: item.description,
      category: item.category,
      frequency: item.frequency,
      timeOfDay: item.time_of_day,
      duration: item.duration,
      reminder: item.reminder,
      reminderTime: item.reminder_time,
      streak: item.streak,
      longestStreak: item.longest_streak,
      lastCompleted: item.last_completed,
      startDate: item.start_date,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return { data: habits, error: null }
  } catch (error) {
    console.error('Error al obtener hábitos:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un hábito
 * @param habit - Datos del hábito
 * @returns - Hábito guardado o null en caso de error
 */
export const saveHabit = async (
  habit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ data: Habit | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const habitId = habit.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo del hábito
    const completeHabit: Habit = {
      id: habitId,
      streak: 0,
      longestStreak: 0,
      createdAt: habit.id ? (habit as any).createdAt || now : now,
      updatedAt: now,
      ...habit
    } as Habit

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeHabit.id,
      user_id: completeHabit.userId,
      title: completeHabit.title,
      description: completeHabit.description,
      category: completeHabit.category,
      frequency: completeHabit.frequency,
      time_of_day: completeHabit.timeOfDay,
      duration: completeHabit.duration,
      reminder: completeHabit.reminder,
      reminder_time: completeHabit.reminderTime,
      streak: completeHabit.streak,
      longest_streak: completeHabit.longestStreak,
      last_completed: completeHabit.lastCompleted,
      start_date: completeHabit.startDate,
      is_active: completeHabit.isActive,
      created_at: completeHabit.createdAt,
      updated_at: completeHabit.updatedAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('habits')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeHabit, error }
      }

      console.log('Hábito guardado exitosamente en Supabase')
      return { data: completeHabit, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar hábito:', error)
    return { data: null, error }
  }
}

/**
 * Registra la completitud de un hábito
 * @param habitId - ID del hábito
 * @param userId - ID del usuario
 * @param options - Opciones adicionales
 * @returns - Registro de completitud o null en caso de error
 */
export const completeHabit = async (
  habitId: string,
  userId: string,
  options?: {
    notes?: string
    mood?: number
    completedAt?: string
  }
): Promise<{ data: HabitLog | null, error: any }> => {
  try {
    const now = new Date().toISOString()
    const completedAt = options?.completedAt || now

    // Crear el registro de completitud
    const habitLog: HabitLog = {
      id: uuidv4(),
      habitId,
      userId,
      completedAt,
      notes: options?.notes,
      mood: options?.mood,
      createdAt: now
    }

    // Preparar datos para Supabase
    const logData = {
      id: habitLog.id,
      habit_id: habitLog.habitId,
      user_id: habitLog.userId,
      completed_at: habitLog.completedAt,
      notes: habitLog.notes,
      mood: habitLog.mood,
      created_at: habitLog.createdAt
    }

    // Guardar el registro
    const { error: logError } = await supabase
      .from('habit_logs')
      .insert(logData)

    if (logError) {
      console.error('Error al guardar registro de hábito:', logError)
      return { data: null, error: logError }
    }

    // Actualizar el hábito (streak, last_completed)
    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .select('streak, longest_streak, last_completed')
      .eq('id', habitId)
      .single()

    if (habitError) {
      console.error('Error al obtener datos del hábito:', habitError)
      return { data: habitLog, error: null } // Devolver el log aunque haya error
    }

    // Calcular nuevo streak
    let newStreak = habitData.streak
    let newLongestStreak = habitData.longest_streak
    const lastCompletedDate = habitData.last_completed ? new Date(habitData.last_completed) : null
    const completedDate = new Date(completedAt)

    // Si es el primer registro o si la última completitud fue ayer, incrementar streak
    if (!lastCompletedDate || isYesterday(lastCompletedDate, completedDate)) {
      newStreak += 1
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak
      }
    } 
    // Si la última completitud fue hoy, mantener streak
    else if (isSameDay(lastCompletedDate, completedDate)) {
      // No cambiar streak
    } 
    // Si ha pasado más de un día, reiniciar streak
    else {
      newStreak = 1
    }

    // Actualizar el hábito
    const { error: updateError } = await supabase
      .from('habits')
      .update({
        streak: newStreak,
        longest_streak: newLongestStreak,
        last_completed: completedAt,
        updated_at: now
      })
      .eq('id', habitId)

    if (updateError) {
      console.error('Error al actualizar hábito:', updateError)
      return { data: habitLog, error: null } // Devolver el log aunque haya error
    }

    return { data: habitLog, error: null }
  } catch (error) {
    console.error('Error al completar hábito:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las plantillas de horarios laborales españoles
 * @returns - Lista de plantillas o null en caso de error
 */
export const getWorkScheduleTemplates = async (
  options?: {
    isSpanish?: boolean
    includesSiesta?: boolean
  }
): Promise<{ data: WorkScheduleTemplate[] | null, error: any }> => {
  try {
    let query = supabase
      .from('work_schedule_templates')
      .select('*')

    if (options?.isSpanish !== undefined) {
      query = query.eq('is_spanish', options.isSpanish)
    }

    if (options?.includesSiesta !== undefined) {
      query = query.eq('includes_siesta', options.includesSiesta)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener plantillas de horarios:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos
    const templates: WorkScheduleTemplate[] = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      schedule: item.schedule,
      isSpanish: item.is_spanish,
      includesSiesta: item.includes_siesta,
      createdAt: item.created_at
    }))

    return { data: templates, error: null }
  } catch (error) {
    console.error('Error al obtener plantillas de horarios:', error)
    return { data: null, error }
  }
}

// Funciones auxiliares
function isYesterday(date1: Date, date2: Date): boolean {
  const yesterday = new Date(date2)
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(date1, yesterday)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
