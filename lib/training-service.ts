/**
 * IMPORTANTE: Este archivo ahora utiliza el nuevo servicio training-api-service.ts
 * a través del puente training-service-bridge.ts para mantener la compatibilidad
 * con el código existente.
 *
 * Por favor, utilice directamente training-api-service.ts para nuevas implementaciones.
 */

import {
  getUserRoutineById,
  getUserRoutines,
  saveWorkoutRoutine,
  deleteWorkoutRoutine,
  getWorkoutLogs,
  saveWorkoutLog,
  getExercises,
  getTrainingStats
} from './training-service-bridge'

import {
  WorkoutRoutine,
  WorkoutDay,
  ExerciseSet,
  WorkoutLog,
  Exercise
} from '@/lib/types/training'

// Re-exportar todas las funciones para mantener la compatibilidad con el código existente
export {
  getUserRoutineById,
  getUserRoutines,
  saveWorkoutRoutine,
  deleteWorkoutRoutine,
  getWorkoutLogs,
  saveWorkoutLog,
  getExercises,
  getTrainingStats
}

/**
 * Obtiene la evaluación inicial de un usuario
 */
export async function getUserInitialAssessment(userId: string) {
  try {
    // Intentar obtener de la tabla initial_assessments primero
    const { data: initialAssessment, error: initialError } = await supabase
      .from("initial_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (initialError) {
      throw initialError
    }

    if (initialAssessment) {
      return { data: initialAssessment, error: null }
    }

    // Si no hay datos en initial_assessments, intentar con training_assessments
    const { data: trainingAssessment, error: trainingError } = await supabase
      .from("training_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (trainingError) {
      throw trainingError
    }

    return { data: trainingAssessment, error: null }
  } catch (error) {
    console.error("Error al obtener la evaluación inicial:", error)
    return { data: null, error }
  }
}

/**
 * Guarda un registro de entrenamiento
 */
export async function saveWorkoutLog(workoutLog: any) {
  try {
    // Verificar si el registro ya existe
    const { data: existingLog, error: checkError } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("id", workoutLog.id)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    let result

    if (existingLog) {
      // Actualizar registro existente
      const { data, error } = await supabase
        .from("workout_logs")
        .update({
          user_id: workoutLog.userId,
          routine_id: workoutLog.routineId,
          day_id: workoutLog.dayId,
          date: workoutLog.date,
          duration: workoutLog.duration,
          completed_sets: workoutLog.completedSets,
          notes: workoutLog.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", workoutLog.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      result = { data, error: null }
    } else {
      // Insertar nuevo registro
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          id: workoutLog.id,
          user_id: workoutLog.userId,
          routine_id: workoutLog.routineId,
          day_id: workoutLog.dayId,
          date: workoutLog.date,
          duration: workoutLog.duration,
          completed_sets: workoutLog.completedSets,
          notes: workoutLog.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      result = { data, error: null }
    }

    return result
  } catch (error) {
    console.error("Error al guardar el registro de entrenamiento:", error)
    return { data: null, error }
  }
}

/**
 * Obtiene los registros de entrenamiento de un usuario
 */
export async function getWorkoutLogs(userId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error al obtener los registros de entrenamiento:", error)
    return { data: null, error }
  }
}

/**
 * Obtiene un registro de entrenamiento por su ID
 */
export async function getWorkoutLogById(logId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("id", logId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error al obtener el registro de entrenamiento:", error)
    return { data: null, error }
  }
}

/**
 * Obtiene una rutina de usuario por su ID
 */
export async function getUserRoutineById(routineId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_routines")
      .select("*")
      .eq("id", routineId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error al obtener la rutina de usuario:", error)
    return { data: null, error }
  }
}