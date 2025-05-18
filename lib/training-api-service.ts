import { WorkoutRoutine, WorkoutLog, Exercise, UserTrainingProfile } from './types/training'
import { TrainingProfile } from './training-personalization-service'

// Tipo de compatibilidad para mantener la coherencia con el código existente
type TrainingProfileCompatible = TrainingProfile | UserTrainingProfile

/**
 * Get user's workout routines
 * @param userId - The user ID
 * @returns - The workout routines and any error
 */
export async function getUserRoutines(userId: string): Promise<{ data: WorkoutRoutine[] | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=routines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getUserRoutines:', error)
    return { data: null, error }
  }
}

/**
 * Get a specific workout routine
 * @param routineId - The routine ID
 * @returns - The workout routine and any error
 */
export async function getWorkoutRoutine(routineId: string): Promise<{ data: WorkoutRoutine | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=routine&id=${routineId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getWorkoutRoutine:', error)
    return { data: null, error }
  }
}

/**
 * Get the active workout routine
 * @returns - The active workout routine and any error
 */
export async function getActiveWorkoutRoutine(): Promise<{ data: WorkoutRoutine | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=active-routine`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getActiveWorkoutRoutine:', error)
    return { data: null, error }
  }
}

/**
 * Save a workout routine
 * @param routine - The workout routine to save
 * @returns - The saved workout routine and any error
 */
export async function saveWorkoutRoutine(routine: WorkoutRoutine): Promise<{ data: WorkoutRoutine | null, error: any }> {
  try {
    const response = await fetch(`/api/training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'routine',
        data: routine
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in saveWorkoutRoutine:', error)
    return { data: null, error }
  }
}

/**
 * Activate a workout routine
 * @param routineId - The ID of the routine to activate
 * @returns - Success status and any error
 */
export async function activateWorkoutRoutine(routineId: string): Promise<{ success: boolean, error: any }> {
  try {
    const response = await fetch(`/api/training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'activate-routine',
        data: { id: routineId }
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in activateWorkoutRoutine:', error)
    return { success: false, error }
  }
}

/**
 * Delete a workout routine
 * @param routineId - The ID of the routine to delete
 * @param userId - The user ID
 * @returns - Success status and any error
 */
export async function deleteWorkoutRoutine(routineId: string, userId: string): Promise<{ success: boolean, error: any }> {
  try {
    const response = await fetch(`/api/training?type=routine&id=${routineId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteWorkoutRoutine:', error)
    return { success: false, error }
  }
}

/**
 * Get user's workout logs
 * @param userId - The user ID
 * @returns - The workout logs and any error
 */
export async function getWorkoutLogs(userId: string): Promise<{ data: WorkoutLog[] | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getWorkoutLogs:', error)
    return { data: null, error }
  }
}

/**
 * Get a specific workout log
 * @param logId - The log ID
 * @returns - The workout log and any error
 */
export async function getWorkoutLog(logId: string): Promise<{ data: WorkoutLog | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=session&id=${logId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getWorkoutLog:', error)
    return { data: null, error }
  }
}

/**
 * Save a workout log
 * @param log - The workout log to save
 * @returns - The saved workout log and any error
 */
export async function saveWorkoutLog(log: WorkoutLog): Promise<{ data: WorkoutLog | null, error: any }> {
  try {
    const response = await fetch(`/api/training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'session',
        data: log
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in saveWorkoutLog:', error)
    return { data: null, error }
  }
}

/**
 * Delete a workout log
 * @param logId - The ID of the log to delete
 * @returns - Success status and any error
 */
export async function deleteWorkoutLog(logId: string): Promise<{ success: boolean, error: any }> {
  try {
    const response = await fetch(`/api/training?type=session&id=${logId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteWorkoutLog:', error)
    return { success: false, error }
  }
}

/**
 * Get exercises
 * @returns - The exercises and any error
 */
export async function getExercises(): Promise<{ data: Exercise[] | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=exercises`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getExercises:', error)
    return { data: null, error }
  }
}

/**
 * Get a specific exercise
 * @param exerciseId - The exercise ID
 * @returns - The exercise and any error
 */
export async function getExercise(exerciseId: string): Promise<{ data: Exercise | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=exercise&id=${exerciseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getExercise:', error)
    return { data: null, error }
  }
}

/**
 * Get user's training profile
 * @param userId - The user ID
 * @returns - The training profile and any error
 */
export async function getUserTrainingProfile(userId: string): Promise<{ data: TrainingProfile | null, error: any }> {
  try {
    const response = await fetch(`/api/training?type=profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.assessment_data || null, error: null }
  } catch (error) {
    console.error('Error in getUserTrainingProfile:', error)
    return { data: null, error }
  }
}

/**
 * Save user's training profile
 * @param profile - The training profile to save
 * @returns - The saved training profile and any error
 */
export async function saveUserTrainingProfile(profile: TrainingProfile): Promise<{ data: TrainingProfile | null, error: any }> {
  try {
    const response = await fetch(`/api/training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'profile',
        data: profile
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.assessment_data || null, error: null }
  } catch (error) {
    console.error('Error in saveUserTrainingProfile:', error)
    return { data: null, error }
  }
}

/**
 * Get training statistics
 * @param userId - The user ID
 * @returns - The training statistics and any error
 */
export async function getTrainingStats(userId: string): Promise<{ data: any, error: any }> {
  try {
    const response = await fetch(`/api/training?type=stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getTrainingStats:', error)
    return { data: null, error }
  }
}
