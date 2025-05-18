import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from './auth-context'
import { useToast } from '@/components/ui/use-toast'
import {
  WorkoutRoutine,
  WorkoutDay,
  WorkoutLog,
  Exercise
} from '@/lib/types/training'
import { getAllExercises } from '@/lib/services/exercise-service'
import { getUserWorkoutLogs, saveWorkoutLog, deleteWorkoutLog, getTrainingStats } from '@/lib/services/workout-log-service'
import { getUserRoutines, saveWorkoutRoutine, deleteWorkoutRoutine } from '@/lib/services/workout-routine-service'

type PaginationParams = {
  page: number
  pageSize: number
}

type TrainingContextType = {
  routines: WorkoutRoutine[]
  logs: WorkoutLog[]
  exercises: Exercise[]
  stats: any
  isLoadingRoutines: boolean
  isLoadingLogs: boolean
  isLoadingExercises: boolean
  isLoadingStats: boolean
  hasMoreRoutines: boolean
  hasMoreLogs: boolean
  hasMoreExercises: boolean
  refreshRoutines: (pagination?: PaginationParams) => Promise<void>
  refreshLogs: (pagination?: PaginationParams) => Promise<void>
  refreshExercises: (pagination?: PaginationParams) => Promise<void>
  refreshStats: () => Promise<void>
  loadMoreRoutines: () => Promise<void>
  loadMoreLogs: () => Promise<void>
  loadMoreExercises: () => Promise<void>
  saveRoutine: (routine: WorkoutRoutine) => Promise<{ success: boolean, error: any }>
  deleteRoutine: (routineId: string) => Promise<{ success: boolean, error: any }>
  saveLog: (log: WorkoutLog) => Promise<{ success: boolean, error: any }>
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined)

// Default pagination values
const DEFAULT_PAGE_SIZE = 10
const INITIAL_PAGE = 1

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [isLoadingExercises, setIsLoadingExercises] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [hasMoreRoutines, setHasMoreRoutines] = useState(true)
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  const [hasMoreExercises, setHasMoreExercises] = useState(true)
  const [routinesPage, setRoutinesPage] = useState(INITIAL_PAGE)
  const [logsPage, setLogsPage] = useState(INITIAL_PAGE)
  const [exercisesPage, setExercisesPage] = useState(INITIAL_PAGE)
  const { user } = useAuth()
  const { toast } = useToast()

  const refreshRoutines = useCallback(async (pagination?: PaginationParams) => {
    if (!user) {
      setRoutines([])
      setIsLoadingRoutines(false)
      setHasMoreRoutines(false)
      return
    }

    const page = pagination?.page || INITIAL_PAGE
    const pageSize = pagination?.pageSize || DEFAULT_PAGE_SIZE

    // Reset pagination state if loading first page
    if (page === INITIAL_PAGE) {
      setRoutinesPage(INITIAL_PAGE)
      setRoutines([])
    }

    setIsLoadingRoutines(true)
    try {
      // Modify getUserRoutines to accept pagination parameters
      const { data, error } = await getUserRoutines(user.id, { page, pageSize })

      if (error) {
        console.error('Error fetching routines:', error)
        toast({
          title: 'Error',
          description: 'Failed to load workout routines',
          variant: 'destructive'
        })
        return
      }

      // If this is the first page, replace the data, otherwise append
      if (page === INITIAL_PAGE) {
        setRoutines(data || [])
      } else {
        setRoutines(prev => [...prev, ...(data || [])])
      }

      // Update pagination state
      setRoutinesPage(page)
      setHasMoreRoutines((data || []).length === pageSize)
    } catch (error) {
      console.error('Unexpected error fetching routines:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading routines',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingRoutines(false)
    }
  }, [user, toast])

  const refreshLogs = async () => {
    if (!user) {
      setLogs([])
      setIsLoadingLogs(false)
      return
    }

    setIsLoadingLogs(true)
    try {
      const { data, error } = await getUserWorkoutLogs(user.id)

      if (error) {
        console.error('Error fetching logs:', error)
        toast({
          title: 'Error',
          description: 'Failed to load workout logs',
          variant: 'destructive'
        })
        return
      }

      setLogs(data || [])
    } catch (error) {
      console.error('Unexpected error fetching logs:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading logs',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const refreshExercises = async () => {
    setIsLoadingExercises(true)
    try {
      const { data, error } = await getAllExercises()

      if (error) {
        console.error('Error fetching exercises:', error)
        toast({
          title: 'Error',
          description: 'Failed to load exercises',
          variant: 'destructive'
        })
        return
      }

      setExercises(data || [])
    } catch (error) {
      console.error('Unexpected error fetching exercises:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading exercises',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingExercises(false)
    }
  }

  const refreshStats = async () => {
    if (!user) {
      setStats(null)
      setIsLoadingStats(false)
      return
    }

    setIsLoadingStats(true)
    try {
      const { data, error } = await getTrainingStats(user.id)

      if (error) {
        console.error('Error fetching stats:', error)
        toast({
          title: 'Error',
          description: 'Failed to load training statistics',
          variant: 'destructive'
        })
        return
      }

      setStats(data || null)
    } catch (error) {
      console.error('Unexpected error fetching stats:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading statistics',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const saveRoutine = async (routine: WorkoutRoutine): Promise<{ success: boolean, error: any }> => {
    try {
      if (!user) {
        return { success: false, error: new Error('User not authenticated') }
      }

      // Ensure the routine has the correct user ID
      routine.userId = user.id

      const { data, error } = await saveWorkoutRoutine(routine)

      if (error) {
        console.error('Error saving routine:', error)
        toast({
          title: 'Error',
          description: 'Failed to save workout routine',
          variant: 'destructive'
        })
        return { success: false, error }
      }

      // Update local state
      if (data) {
        const existingIndex = routines.findIndex(r => r.id === data.id)

        if (existingIndex >= 0) {
          // Update existing routine
          const updatedRoutines = [...routines]
          updatedRoutines[existingIndex] = data
          setRoutines(updatedRoutines)
        } else {
          // Add new routine
          setRoutines([data, ...routines])
        }

        toast({
          title: 'Success',
          description: 'Workout routine saved successfully',
        })

        return { success: true, error: null }
      }

      return { success: false, error: new Error('No data returned after saving routine') }
    } catch (error) {
      console.error('Unexpected error saving routine:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving routine',
        variant: 'destructive'
      })
      return { success: false, error }
    }
  }

  const deleteRoutine = async (routineId: string): Promise<{ success: boolean, error: any }> => {
    try {
      if (!user) {
        return { success: false, error: new Error('User not authenticated') }
      }

      const { success, error } = await deleteWorkoutRoutine(routineId, user.id)

      if (error) {
        console.error('Error deleting routine:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete workout routine',
          variant: 'destructive'
        })
        return { success: false, error }
      }

      if (success) {
        // Update local state
        setRoutines(routines.filter(r => r.id !== routineId))

        toast({
          title: 'Success',
          description: 'Workout routine deleted successfully',
        })

        return { success: true, error: null }
      }

      return { success: false, error: new Error('Failed to delete routine') }
    } catch (error) {
      console.error('Unexpected error deleting routine:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting routine',
        variant: 'destructive'
      })
      return { success: false, error }
    }
  }

  const saveLog = async (log: WorkoutLog): Promise<{ success: boolean, error: any }> => {
    try {
      if (!user) {
        return { success: false, error: new Error('User not authenticated') }
      }

      // Ensure the log has the correct user ID
      log.userId = user.id

      const { data, error } = await saveWorkoutLog(log)

      if (error) {
        console.error('Error saving log:', error)
        toast({
          title: 'Error',
          description: 'Failed to save workout log',
          variant: 'destructive'
        })
        return { success: false, error }
      }

      // Update local state
      if (data) {
        const existingIndex = logs.findIndex(l => l.id === data.id)

        if (existingIndex >= 0) {
          // Update existing log
          const updatedLogs = [...logs]
          updatedLogs[existingIndex] = data
          setLogs(updatedLogs)
        } else {
          // Add new log
          setLogs([data, ...logs])
        }

        toast({
          title: 'Success',
          description: 'Workout log saved successfully',
        })

        // Refresh stats after saving a log
        refreshStats()

        return { success: true, error: null }
      }

      return { success: false, error: new Error('No data returned after saving log') }
    } catch (error) {
      console.error('Unexpected error saving log:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving log',
        variant: 'destructive'
      })
      return { success: false, error }
    }
  }

  // Function to load more routines
  const loadMoreRoutines = useCallback(async () => {
    if (isLoadingRoutines || !hasMoreRoutines) return;
    await refreshRoutines({ page: routinesPage + 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [isLoadingRoutines, hasMoreRoutines, routinesPage, refreshRoutines]);

  // Function to load more logs
  const loadMoreLogs = useCallback(async () => {
    if (isLoadingLogs || !hasMoreLogs) return;
    await refreshLogs({ page: logsPage + 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [isLoadingLogs, hasMoreLogs, logsPage, refreshLogs]);

  // Function to load more exercises
  const loadMoreExercises = useCallback(async () => {
    if (isLoadingExercises || !hasMoreExercises) return;
    await refreshExercises({ page: exercisesPage + 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [isLoadingExercises, hasMoreExercises, exercisesPage, refreshExercises]);

  // Load initial data when user changes
  useEffect(() => {
    refreshRoutines({ page: INITIAL_PAGE, pageSize: DEFAULT_PAGE_SIZE })
    refreshLogs({ page: INITIAL_PAGE, pageSize: DEFAULT_PAGE_SIZE })
    refreshStats()
  }, [user, refreshRoutines, refreshLogs])

  // Load exercises once
  useEffect(() => {
    refreshExercises({ page: INITIAL_PAGE, pageSize: DEFAULT_PAGE_SIZE })
  }, [refreshExercises])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    routines,
    logs,
    exercises,
    stats,
    isLoadingRoutines,
    isLoadingLogs,
    isLoadingExercises,
    isLoadingStats,
    hasMoreRoutines,
    hasMoreLogs,
    hasMoreExercises,
    refreshRoutines,
    refreshLogs,
    refreshExercises,
    refreshStats,
    loadMoreRoutines,
    loadMoreLogs,
    loadMoreExercises,
    saveRoutine,
    deleteRoutine,
    saveLog
  }), [
    routines,
    logs,
    exercises,
    stats,
    isLoadingRoutines,
    isLoadingLogs,
    isLoadingExercises,
    isLoadingStats,
    hasMoreRoutines,
    hasMoreLogs,
    hasMoreExercises,
    refreshRoutines,
    refreshLogs,
    refreshExercises,
    refreshStats,
    loadMoreRoutines,
    loadMoreLogs,
    loadMoreExercises,
    saveRoutine,
    deleteRoutine,
    saveLog
  ])

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>
}

export const useTraining = () => {
  const context = useContext(TrainingContext)
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider')
  }
  return context
}
