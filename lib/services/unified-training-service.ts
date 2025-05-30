import { supabase } from "@/lib/supabase-client"
import { handleSupabaseError } from "@/lib/utils/error-handler"

export interface WorkoutRoutine {
  id: string
  user_id: string
  name: string
  description?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness'
  frequency: string
  days: WorkoutDay[]
  is_active: boolean
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface WorkoutDay {
  id: string
  routine_id: string
  name: string
  day_number: number
  exercises: WorkoutExercise[]
  target_muscle_groups: string[]
  rest_day: boolean
}

export interface WorkoutExercise {
  id: string
  day_id: string
  exercise_id: string
  exercise_name: string
  sets: number
  reps: string
  weight?: number
  rest_time: number
  notes?: string
  order_index: number
  exercise_details?: Exercise
}

export interface Exercise {
  id: string
  name: string
  category: string
  muscle_groups: string[]
  equipment: string[]
  difficulty: string
  instructions: string[]
  tips?: string[]
  image_url?: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  routine_id?: string
  name: string
  date: string
  duration_minutes: number
  exercises: SessionExercise[]
  notes?: string
  rating?: number
  created_at: string
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  exercise_name: string
  sets: SessionSet[]
}

export interface SessionSet {
  set_number: number
  reps: number
  weight: number
  rpe?: number
  rest_seconds?: number
}

export interface TrainingStats {
  total_workouts: number
  total_volume: number
  average_duration: number
  current_streak: number
  weekly_volume: number
  monthly_volume: number
  favorite_exercises: string[]
  strength_progress: { [exercise: string]: number }
}

/**
 * Obtener rutinas de entrenamiento del usuario
 */
export const getUserWorkoutRoutines = async (userId: string, includeTemplates: boolean = false): Promise<WorkoutRoutine[]> => {
  try {
    let query = supabase
      .from('workout_routines')
      .select(`
        *,
        workout_days (
          *,
          workout_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .eq('user_id', userId)

    if (includeTemplates) {
      query = query.or(`user_id.eq.${userId},is_template.eq.true`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error, { context: 'Obtener rutinas de entrenamiento', showToast: false })
      return []
    }

    // Transformar datos para incluir días y ejercicios
    const routines: WorkoutRoutine[] = (data || []).map(routine => ({
      id: routine.id,
      user_id: routine.user_id,
      name: routine.name,
      description: routine.description,
      level: routine.level,
      goal: routine.goal,
      frequency: routine.frequency,
      is_active: routine.is_active,
      is_template: routine.is_template,
      created_at: routine.created_at,
      updated_at: routine.updated_at,
      days: (routine.workout_days || []).map((day: any) => ({
        id: day.id,
        routine_id: day.routine_id,
        name: day.name,
        day_number: day.day_number,
        rest_day: day.rest_day,
        target_muscle_groups: day.target_muscle_groups || [],
        exercises: (day.workout_exercises || []).map((ex: any) => ({
          id: ex.id,
          day_id: ex.day_id,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_time: ex.rest_time,
          notes: ex.notes,
          order_index: ex.order_index,
          exercise_details: ex.exercises
        }))
      }))
    }))

    return routines
  } catch (error) {
    console.error('Error al obtener rutinas de entrenamiento:', error)
    return []
  }
}

/**
 * Crear nueva rutina de entrenamiento
 */
export const createWorkoutRoutine = async (routine: Omit<WorkoutRoutine, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutRoutine | null> => {
  try {
    // Crear la rutina principal
    const { data: routineData, error: routineError } = await supabase
      .from('workout_routines')
      .insert({
        user_id: routine.user_id,
        name: routine.name,
        description: routine.description,
        level: routine.level,
        goal: routine.goal,
        frequency: routine.frequency,
        is_active: routine.is_active,
        is_template: routine.is_template
      })
      .select()
      .single()

    if (routineError) {
      handleSupabaseError(routineError, { context: 'Crear rutina de entrenamiento', showToast: true })
      return null
    }

    // Crear los días de la rutina
    if (routine.days && routine.days.length > 0) {
      const daysToInsert = routine.days.map(day => ({
        routine_id: routineData.id,
        name: day.name,
        day_number: day.day_number,
        target_muscle_groups: day.target_muscle_groups,
        rest_day: day.rest_day
      }))

      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .insert(daysToInsert)
        .select()

      if (daysError) {
        console.error('Error al crear días de rutina:', daysError)
      } else if (daysData) {
        // Crear ejercicios para cada día
        for (let i = 0; i < routine.days.length; i++) {
          const day = routine.days[i]
          const dayData = daysData[i]

          if (day.exercises && day.exercises.length > 0) {
            const exercisesToInsert = day.exercises.map(ex => ({
              day_id: dayData.id,
              exercise_id: ex.exercise_id,
              exercise_name: ex.exercise_name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              rest_time: ex.rest_time,
              notes: ex.notes,
              order_index: ex.order_index
            }))

            const { error: exercisesError } = await supabase
              .from('workout_exercises')
              .insert(exercisesToInsert)

            if (exercisesError) {
              console.error('Error al crear ejercicios:', exercisesError)
            }
          }
        }
      }
    }

    return {
      ...routineData,
      days: routine.days
    } as WorkoutRoutine

  } catch (error) {
    console.error('Error al crear rutina de entrenamiento:', error)
    return null
  }
}

/**
 * Obtener estadísticas de entrenamiento
 */
export const getTrainingStats = async (userId: string): Promise<TrainingStats | null> => {
  try {
    // Obtener sesiones de entrenamiento del último mes
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        session_exercises (
          *,
          session_sets (*)
        )
      `)
      .eq('user_id', userId)
      .gte('date', oneMonthAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (sessionsError) {
      handleSupabaseError(sessionsError, { context: 'Obtener estadísticas de entrenamiento', showToast: false })
      return null
    }

    const workoutSessions = sessions || []

    // Calcular estadísticas
    const totalWorkouts = workoutSessions.length
    const totalVolume = workoutSessions.reduce((sum, session) => {
      const sessionVolume = (session.session_exercises || []).reduce((exSum: number, ex: any) => {
        const exerciseVolume = (ex.session_sets || []).reduce((setSum: number, set: any) => {
          return setSum + (set.reps * set.weight)
        }, 0)
        return exSum + exerciseVolume
      }, 0)
      return sum + sessionVolume
    }, 0)

    const averageDuration = totalWorkouts > 0 
      ? workoutSessions.reduce((sum, session) => sum + session.duration_minutes, 0) / totalWorkouts 
      : 0

    // Calcular racha actual
    let currentStreak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasWorkout = workoutSessions.some(session => session.date === dateStr)
      if (hasWorkout) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }

    // Volumen semanal (últimos 7 días)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weeklyVolume = workoutSessions
      .filter(session => new Date(session.date) >= oneWeekAgo)
      .reduce((sum, session) => {
        const sessionVolume = (session.session_exercises || []).reduce((exSum: number, ex: any) => {
          const exerciseVolume = (ex.session_sets || []).reduce((setSum: number, set: any) => {
            return setSum + (set.reps * set.weight)
          }, 0)
          return exSum + exerciseVolume
        }, 0)
        return sum + sessionVolume
      }, 0)

    // Ejercicios favoritos (más frecuentes)
    const exerciseFrequency: { [key: string]: number } = {}
    workoutSessions.forEach(session => {
      (session.session_exercises || []).forEach((ex: any) => {
        exerciseFrequency[ex.exercise_name] = (exerciseFrequency[ex.exercise_name] || 0) + 1
      })
    })

    const favoriteExercises = Object.entries(exerciseFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    return {
      total_workouts: totalWorkouts,
      total_volume: Math.round(totalVolume),
      average_duration: Math.round(averageDuration),
      current_streak: currentStreak,
      weekly_volume: Math.round(weeklyVolume),
      monthly_volume: Math.round(totalVolume),
      favorite_exercises: favoriteExercises,
      strength_progress: {} // TODO: Implementar cálculo de progreso de fuerza
    }

  } catch (error) {
    console.error('Error al obtener estadísticas de entrenamiento:', error)
    return null
  }
}

/**
 * Obtener ejercicios disponibles
 */
export const getAvailableExercises = async (filters?: {
  category?: string
  muscle_group?: string
  equipment?: string
  difficulty?: string
}): Promise<Exercise[]> => {
  try {
    let query = supabase
      .from('exercises')
      .select('*')

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.muscle_group) {
      query = query.contains('muscle_groups', [filters.muscle_group])
    }
    if (filters?.equipment) {
      query = query.contains('equipment', [filters.equipment])
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    const { data, error } = await query.order('name')

    if (error) {
      handleSupabaseError(error, { context: 'Obtener ejercicios disponibles', showToast: false })
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error al obtener ejercicios disponibles:', error)
    return []
  }
}

/**
 * Guardar sesión de entrenamiento
 */
export const saveWorkoutSession = async (session: Omit<WorkoutSession, 'id' | 'created_at'>): Promise<WorkoutSession | null> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: session.user_id,
        routine_id: session.routine_id,
        name: session.name,
        date: session.date,
        duration_minutes: session.duration_minutes,
        notes: session.notes,
        rating: session.rating
      })
      .select()
      .single()

    if (sessionError) {
      handleSupabaseError(sessionError, { context: 'Guardar sesión de entrenamiento', showToast: true })
      return null
    }

    // Guardar ejercicios de la sesión
    if (session.exercises && session.exercises.length > 0) {
      for (const exercise of session.exercises) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('session_exercises')
          .insert({
            session_id: sessionData.id,
            exercise_id: exercise.exercise_id,
            exercise_name: exercise.exercise_name
          })
          .select()
          .single()

        if (exerciseError) {
          console.error('Error al guardar ejercicio de sesión:', exerciseError)
          continue
        }

        // Guardar sets del ejercicio
        if (exercise.sets && exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map(set => ({
            exercise_id: exerciseData.id,
            set_number: set.set_number,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            rest_seconds: set.rest_seconds
          }))

          const { error: setsError } = await supabase
            .from('session_sets')
            .insert(setsToInsert)

          if (setsError) {
            console.error('Error al guardar sets:', setsError)
          }
        }
      }
    }

    return {
      ...sessionData,
      exercises: session.exercises
    } as WorkoutSession

  } catch (error) {
    console.error('Error al guardar sesión de entrenamiento:', error)
    return null
  }
}

export default {
  getUserWorkoutRoutines,
  createWorkoutRoutine,
  getTrainingStats,
  getAvailableExercises,
  saveWorkoutSession
}
