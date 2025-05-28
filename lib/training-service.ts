/**
 * IMPORTANTE: Este archivo ahora utiliza el nuevo servicio training-api-service.ts
 * a través del puente training-service-bridge.ts para mantener la compatibilidad
 * con el código existente.
 *
 * Por favor, utilice directamente training-api-service.ts para nuevas implementaciones.
 */

import {
  getUserRoutineById,
  getWorkoutRoutineById,
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
  getWorkoutRoutineById,
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

// La función saveWorkoutLog ya está exportada desde training-service-bridge
// Se eliminó la implementación duplicada para evitar el error "Duplicate export 'saveWorkoutLog'"

// La función getWorkoutLogs ya está exportada desde training-service-bridge
// Se eliminó la implementación duplicada para evitar posibles errores de duplicación

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

// La función getUserRoutineById ya está exportada desde training-service-bridge
// Se eliminó la implementación duplicada para evitar posibles errores de duplicación