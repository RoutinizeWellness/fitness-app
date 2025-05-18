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
