import { supabase } from '@/lib/supabase-client'

/**
 * Interfaz para la sesión de entrenamiento
 */
export interface WorkoutSession {
  id?: string
  userId: string
  workoutDayId: string
  workoutDayName?: string
  date: string
  duration?: number
  exercises: {
    exerciseId: string
    name: string
    sets: {
      weight: number
      reps: number
      rir: number
    }[]
  }[]
  notes?: string
  fatigue?: number
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
}

/**
 * Obtiene las sesiones de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns - Sesiones de entrenamiento o array vacío en caso de error
 */
export const getUserWorkoutSessions = async (userId: string): Promise<WorkoutSession[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error al obtener sesiones de entrenamiento:', error)
      return []
    }

    // Transformar los datos al formato esperado
    return data.map(session => ({
      id: session.id,
      userId: session.user_id,
      workoutDayId: session.workout_day_id,
      workoutDayName: session.workout_day_name,
      date: session.date,
      duration: session.duration,
      exercises: session.exercises || [],
      notes: session.notes,
      fatigue: session.fatigue,
      mood: session.mood
    }))
  } catch (error) {
    console.error('Error al obtener sesiones de entrenamiento:', error)
    return []
  }
}

/**
 * Guarda una sesión de entrenamiento
 * @param session - Datos de la sesión
 * @returns - Sesión guardada o null en caso de error
 */
export const saveWorkoutSession = async (session: WorkoutSession): Promise<WorkoutSession | null> => {
  try {
    console.log('Guardando sesión de entrenamiento:', session)

    // Preparar datos para Supabase
    const sessionData = {
      id: session.id || crypto.randomUUID(),
      user_id: session.userId,
      workout_day_id: session.workoutDayId,
      workout_day_name: session.workoutDayName || 'Entrenamiento',
      date: session.date,
      duration: session.duration || 0,
      exercises: session.exercises,
      notes: session.notes || '',
      fatigue: session.fatigue || 0,
      mood: session.mood || 'neutral'
    }

    // Guardar en Supabase
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([sessionData])
      .select()

    if (error) {
      console.error('Error al guardar sesión de entrenamiento:', error)

      // Intentar con un enfoque más simple
      console.log('Intentando con un enfoque más simple...')
      const simpleSessionData = {
        id: sessionData.id,
        user_id: sessionData.user_id,
        workout_day_id: sessionData.workout_day_id,
        workout_day_name: sessionData.workout_day_name,
        date: sessionData.date,
        exercises: JSON.stringify(sessionData.exercises)
      }

      const { error: simpleError } = await supabase
        .from('workout_sessions')
        .insert([simpleSessionData])

      if (simpleError) {
        console.error('Error al guardar sesión simplificada:', simpleError)
        return null
      }

      console.log('Sesión simplificada guardada exitosamente')
      return session
    }

    console.log('Sesión guardada exitosamente:', data)

    // Transformar los datos al formato esperado
    return {
      id: data[0].id,
      userId: data[0].user_id,
      workoutDayId: data[0].workout_day_id,
      workoutDayName: data[0].workout_day_name,
      date: data[0].date,
      duration: data[0].duration,
      exercises: data[0].exercises,
      notes: data[0].notes,
      fatigue: data[0].fatigue,
      mood: data[0].mood
    }
  } catch (error) {
    console.error('Error al guardar sesión de entrenamiento:', error)
    return null
  }
}

/**
 * Elimina una sesión de entrenamiento
 * @param sessionId - ID de la sesión
 * @param userId - ID del usuario
 * @returns - Éxito o error
 */
export const deleteWorkoutSession = async (sessionId: string, userId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error al eliminar sesión de entrenamiento:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar sesión de entrenamiento:', error)
    return { success: false, error }
  }
}

/**
 * Obtiene estadísticas de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns - Estadísticas o null en caso de error
 */
export const getUserWorkoutStats = async (userId: string): Promise<any | null> => {
  try {
    // Obtener todas las sesiones
    const sessions = await getUserWorkoutSessions(userId)

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalVolume: 0,
        averageDuration: 0,
        averageVolume: 0,
        sessionsPerWeek: 0,
        mostTrainedMuscleGroups: []
      }
    }

    // Calcular estadísticas
    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((acc, session) => acc + (session.duration || 0), 0)
    const averageDuration = Math.round(totalDuration / totalSessions)

    // Calcular volumen total (peso x repeticiones)
    let totalVolume = 0
    const muscleGroupCount: Record<string, number> = {}

    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        // Contar grupos musculares
        const muscleGroup = exercise.name.split(' ')[0] // Simplificación
        muscleGroupCount[muscleGroup] = (muscleGroupCount[muscleGroup] || 0) + 1

        // Calcular volumen
        exercise.sets.forEach(set => {
          totalVolume += set.weight * set.reps
        })
      })
    })

    const averageVolume = Math.round(totalVolume / totalSessions)

    // Calcular sesiones por semana
    const firstSessionDate = new Date(sessions[sessions.length - 1].date)
    const lastSessionDate = new Date(sessions[0].date)
    const weeksDiff = Math.max(1, Math.round((lastSessionDate.getTime() - firstSessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const sessionsPerWeek = Math.round((totalSessions / weeksDiff) * 10) / 10

    // Obtener grupos musculares más entrenados
    const mostTrainedMuscleGroups = Object.entries(muscleGroupCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([group, count]) => ({ group, count }))

    return {
      totalSessions,
      totalDuration,
      totalVolume,
      averageDuration,
      averageVolume,
      sessionsPerWeek,
      mostTrainedMuscleGroups
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de entrenamiento:', error)
    return null
  }
}
