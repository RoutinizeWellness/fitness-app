/**
 * Este archivo sirve como puente entre el antiguo training-service.ts y el nuevo training-api-service.ts
 * Redirige todas las llamadas al nuevo servicio para mantener la compatibilidad con el código existente
 */

import {
  getUserRoutines,
  getWorkoutRoutine,
  getActiveWorkoutRoutine,
  saveWorkoutRoutine,
  activateWorkoutRoutine,
  deleteWorkoutRoutine,
  getWorkoutLogs,
  getWorkoutLog,
  saveWorkoutLog,
  deleteWorkoutLog,
  getExercises,
  getExercise,
  getUserTrainingProfile,
  saveUserTrainingProfile,
  getTrainingStats
} from './training-api-service'

// Exportar todas las funciones del nuevo servicio con los mismos nombres
// para mantener la compatibilidad con el código existente
export {
  getUserRoutines,
  getWorkoutRoutine,
  getActiveWorkoutRoutine,
  saveWorkoutRoutine,
  activateWorkoutRoutine,
  deleteWorkoutRoutine,
  getWorkoutLogs,
  getWorkoutLog,
  saveWorkoutLog,
  deleteWorkoutLog,
  getExercises,
  getExercise,
  getUserTrainingProfile as getTrainingProfile,
  saveUserTrainingProfile as saveTrainingProfile,
  getTrainingStats
}

// Exportar también las versiones con nombres antiguos para mantener la compatibilidad
export const getUserRoutineById = getWorkoutRoutine
export const getWorkoutRoutineById = getWorkoutRoutine
