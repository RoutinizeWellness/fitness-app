"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import {
  getUserRoutines,
  saveWorkoutRoutine,
  deleteWorkoutRoutine,
  getWorkoutLogs,
  saveWorkoutLog,
  getExercises,
  getTrainingStats
} from '@/lib/training-api-service'
import {
  WorkoutRoutine,
  WorkoutDay,
  WorkoutLog,
  Exercise
} from '@/lib/types/training'
import { generateUUID } from '@/lib/utils'

// Define the context type
interface TrainingContextType {
  // Workout routines
  routines: WorkoutRoutine[]
  activeRoutine: WorkoutRoutine | null
  isLoadingRoutines: boolean
  getRoutines: () => Promise<void>
  getRoutineById: (routineId: string) => WorkoutRoutine | null
  saveRoutine: (routine: WorkoutRoutine) => Promise<WorkoutRoutine | null>
  deleteRoutine: (routineId: string) => Promise<boolean>
  createNewRoutine: (name: string) => WorkoutRoutine

  // Workout logs
  workoutLogs: WorkoutLog[]
  isLoadingLogs: boolean
  getLogs: () => Promise<void>
  saveLog: (log: WorkoutLog) => Promise<WorkoutLog | null>
  createNewLog: (routineId: string, dayId: string) => WorkoutLog

  // Exercises
  exercises: Exercise[]
  isLoadingExercises: boolean
  getExercisesList: () => Promise<void>
  getExerciseById: (exerciseId: string) => Exercise | null
  getExercisesByMuscleGroup: (muscleGroup: string) => Exercise[]

  // Stats
  trainingStats: any
  isLoadingStats: boolean
  getStats: () => Promise<void>
}

// Create the context
const TrainingContext = createContext<TrainingContextType | undefined>(undefined)

// Create the provider component
export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  // State for workout routines
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null)
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(false)

  // State for workout logs
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  // State for exercises
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)

  // State for stats
  const [trainingStats, setTrainingStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      getRoutines()
      getLogs()
      getExercisesList()
      getStats()
    } else {
      // Clear data when user logs out
      setRoutines([])
      setActiveRoutine(null)
      setWorkoutLogs([])
      setTrainingStats(null)
    }
  }, [user])

  // Get all routines for the current user
  const getRoutines = async () => {
    if (!user) return

    setIsLoadingRoutines(true)
    try {
      const { data, error } = await getUserRoutines(user.id)

      if (error) {
        console.error('Error fetching routines:', error)
      }

      if (data) {
        setRoutines(data)

        // Set active routine (first one or null)
        if (data.length > 0) {
          const active = data.find(r => r.isActive) || data[0]
          setActiveRoutine(active)
        } else {
          setActiveRoutine(null)
        }
      }
    } catch (error) {
      console.error('Error in getRoutines:', error)
    } finally {
      setIsLoadingRoutines(false)
    }
  }

  // Get a routine by ID
  const getRoutineById = (routineId: string): WorkoutRoutine | null => {
    return routines.find(r => r.id === routineId) || null
  }

  // Save a routine
  const saveRoutine = async (routine: WorkoutRoutine): Promise<WorkoutRoutine | null> => {
    if (!user) return null

    try {
      const { data, error } = await saveWorkoutRoutine(routine)

      if (error) {
        console.error('Error saving routine:', error)
        return null
      }

      if (data) {
        // Update routines list
        setRoutines(prev => {
          const index = prev.findIndex(r => r.id === data.id)
          if (index >= 0) {
            // Update existing routine
            const updated = [...prev]
            updated[index] = data
            return updated
          } else {
            // Add new routine
            return [...prev, data]
          }
        })

        // Update active routine if needed
        if (activeRoutine?.id === data.id) {
          setActiveRoutine(data)
        }

        return data
      }

      return null
    } catch (error) {
      console.error('Error in saveRoutine:', error)
      return null
    }
  }

  // Delete a routine
  const deleteRoutine = async (routineId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { success, error } = await deleteWorkoutRoutine(routineId, user.id)

      if (error) {
        console.error('Error deleting routine:', error)
        return false
      }

      if (success) {
        // Update routines list
        setRoutines(prev => prev.filter(r => r.id !== routineId))

        // Update active routine if needed
        if (activeRoutine?.id === routineId) {
          const remaining = routines.filter(r => r.id !== routineId)
          setActiveRoutine(remaining.length > 0 ? remaining[0] : null)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Error in deleteRoutine:', error)
      return false
    }
  }

  // Create a new routine
  const createNewRoutine = (name: string): WorkoutRoutine => {
    if (!user) throw new Error('User not authenticated')

    const newRoutine: WorkoutRoutine = {
      id: generateUUID(),
      userId: user.id,
      name: name || 'Nueva Rutina',
      description: '',
      level: 'principiante',
      goal: 'general',
      frequency: '3-4 días por semana',
      days: [
        {
          id: generateUUID(),
          name: 'Día 1',
          exercises: []
        }
      ],
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return newRoutine
  }

  // Get all workout logs for the current user
  const getLogs = async () => {
    if (!user) return

    setIsLoadingLogs(true)
    try {
      const { data, error } = await getWorkoutLogs(user.id)

      if (error) {
        console.error('Error fetching workout logs:', error)
      }

      if (data) {
        setWorkoutLogs(data)
      }
    } catch (error) {
      console.error('Error in getLogs:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Save a workout log
  const saveLog = async (log: WorkoutLog): Promise<WorkoutLog | null> => {
    if (!user) return null

    try {
      const { data, error } = await saveWorkoutLog(log)

      if (error) {
        console.error('Error saving workout log:', error)
        return null
      }

      if (data) {
        // Update logs list
        setWorkoutLogs(prev => {
          const index = prev.findIndex(l => l.id === data.id)
          if (index >= 0) {
            // Update existing log
            const updated = [...prev]
            updated[index] = data
            return updated
          } else {
            // Add new log
            return [data, ...prev]
          }
        })

        return data
      }

      return null
    } catch (error) {
      console.error('Error in saveLog:', error)
      return null
    }
  }

  // Create a new workout log
  const createNewLog = (routineId: string, dayId: string): WorkoutLog => {
    if (!user) throw new Error('User not authenticated')

    const routine = getRoutineById(routineId)
    const day = routine?.days.find(d => d.id === dayId)

    const newLog: WorkoutLog = {
      id: generateUUID(),
      userId: user.id,
      routineId,
      dayId,
      routineName: routine?.name || 'Unknown Routine',
      dayName: day?.name || 'Unknown Day',
      date: new Date().toISOString(),
      duration: 0,
      completedSets: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return newLog
  }

  // Get all exercises
  const getExercisesList = async () => {
    setIsLoadingExercises(true)
    try {
      const { data, error } = await getExercises()

      if (error) {
        console.error('Error fetching exercises:', error)
      }

      if (data) {
        setExercises(data)
      }
    } catch (error) {
      console.error('Error in getExercisesList:', error)
    } finally {
      setIsLoadingExercises(false)
    }
  }

  // Get an exercise by ID
  const getExerciseById = (exerciseId: string): Exercise | null => {
    return exercises.find(e => e.id === exerciseId) || null
  }

  // Get exercises by muscle group
  const getExercisesByMuscleGroup = (muscleGroup: string): Exercise[] => {
    return exercises.filter(e =>
      Array.isArray(e.muscleGroup)
        ? e.muscleGroup.includes(muscleGroup)
        : e.muscleGroup === muscleGroup
    )
  }

  // Get training stats
  const getStats = async () => {
    if (!user) return

    setIsLoadingStats(true)
    try {
      const { data, error } = await getTrainingStats(user.id)

      if (error) {
        console.error('Error fetching training stats:', error)
      }

      if (data) {
        setTrainingStats(data)
      }
    } catch (error) {
      console.error('Error in getStats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Create the context value
  const contextValue: TrainingContextType = {
    routines,
    activeRoutine,
    isLoadingRoutines,
    getRoutines,
    getRoutineById,
    saveRoutine,
    deleteRoutine,
    createNewRoutine,

    workoutLogs,
    isLoadingLogs,
    getLogs,
    saveLog,
    createNewLog,

    exercises,
    isLoadingExercises,
    getExercisesList,
    getExerciseById,
    getExercisesByMuscleGroup,

    trainingStats,
    isLoadingStats,
    getStats
  }

  return (
    <TrainingContext.Provider value={contextValue}>
      {children}
    </TrainingContext.Provider>
  )
}

// Create a hook to use the context
export const useTraining = () => {
  const context = useContext(TrainingContext)
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider')
  }
  return context
}
