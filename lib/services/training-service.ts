/**
 * Training Service
 *
 * This service handles all training-related operations with Supabase.
 * It provides methods for:
 * - Managing workout routines
 * - Logging workouts
 * - Tracking performance
 * - Managing periodization plans
 * - Accessing exercise library
 */

import { supabaseService, QueryResponse } from "@/lib/supabase-service"
import { TABLES } from "@/lib/config/supabase-config"
import { v4 as uuidv4 } from "uuid"

// Import types from the types directory
import {
  WorkoutRoutine,
  WorkoutDay,
  ExerciseSet,
  WorkoutLog,
  Exercise
} from '@/lib/types/training'

/**
 * Get a workout routine by ID
 * @param routineId - The ID of the routine
 * @returns The workout routine or null if not found
 */
export const getRoutineById = async (routineId: string): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    console.log("Fetching routine with ID:", routineId)

    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', routineId)
      .single()

    if (error) {
      console.error('Error fetching routine:', error)
      return { data: null, error }
    }

    if (!data) {
      return { data: null, error: new Error('Routine not found') }
    }

    // Transform data to match our application's expected format
    const transformedData: WorkoutRoutine = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description || '',
      level: data.level || 'principiante',
      goal: data.goal || 'general',
      frequency: data.frequency || '3-4 días por semana',
      days: Array.isArray(data.days) ? data.days : [],
      isActive: data.is_active || true,
      isTemplate: data.is_template || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    }

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getRoutineById:', error)
    return { data: null, error }
  }
}

/**
 * Get all workout routines for a user
 * @param userId - The ID of the user
 * @param options - Query options
 * @returns An array of workout routines
 */
export const getUserRoutines = async (
  userId: string,
  options: {
    includeTemplates?: boolean
    includePublic?: boolean
    limit?: number
    offset?: number
    useCache?: boolean
  } = {}
): Promise<QueryResponse<WorkoutRoutine[]>> => {
  if (!userId) {
    return { data: [], error: { message: 'User ID is required' }, status: 400 }
  }

  const {
    includeTemplates = false,
    includePublic = false,
    limit = 20,
    offset = 0,
    useCache = true
  } = options

  let queryOptions: any = {
    select: '*',
    limit,
    offset,
    order: { created_at: 'desc' },
    useCache
  }

  if (includeTemplates && includePublic) {
    queryOptions.or = `user_id.eq.${userId},is_template.eq.true,is_public.eq.true`
  } else if (includeTemplates) {
    queryOptions.or = `user_id.eq.${userId},is_template.eq.true`
  } else if (includePublic) {
    queryOptions.or = `user_id.eq.${userId},is_public.eq.true`
  } else {
    queryOptions.eq = { user_id: userId }
  }

  const response = await supabaseService.query<any[]>(TABLES.WORKOUT_ROUTINES, queryOptions)

  // Transform data to match our application's expected format
  if (response.data) {
    const transformedData: WorkoutRoutine[] = response.data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description || '',
      level: item.level || 'principiante',
      goal: item.goal || 'general',
      frequency: item.frequency || 3,
      days: Array.isArray(item.days) ? item.days : [],
      isActive: item.is_active || true,
      isTemplate: item.is_template || false,
      periodizationType: item.periodization_type,
      mesocycleData: item.mesocycle_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }))

    return { ...response, data: transformedData }
  }

  return response
}

/**
 * Save a workout routine
 * @param routine - The workout routine to save
 * @returns The saved workout routine
 */
export const saveWorkoutRoutine = async (routine: WorkoutRoutine): Promise<QueryResponse<WorkoutRoutine>> => {
  // Validate routine data
  if (!routine.id) {
    routine.id = uuidv4()
  }

  if (!routine.userId) {
    return { data: null, error: { message: 'User ID is required' }, status: 400 }
  }

  if (!routine.name) {
    return { data: null, error: { message: 'Routine name is required' }, status: 400 }
  }

  // Prepare data for Supabase
  const supabaseData = {
    id: routine.id,
    user_id: routine.userId,
    name: routine.name,
    description: routine.description || '',
    level: routine.level || 'principiante',
    goal: routine.goal || 'general',
    frequency: routine.frequency || 3,
    days: routine.days || [],
    is_active: routine.isActive,
    is_template: routine.isTemplate || false,
    periodization_type: routine.periodizationType,
    mesocycle_data: routine.mesocycleData,
    created_at: routine.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Check if the routine exists
  const existingResponse = await supabaseService.query<any>(TABLES.WORKOUT_ROUTINES, {
    select: 'id',
    eq: { id: routine.id },
    single: true
  })

  let response

  if (!existingResponse.data) {
    // If it doesn't exist, insert it
    response = await supabaseService.insert<any>(TABLES.WORKOUT_ROUTINES, supabaseData)
  } else {
    // If it exists, update it
    response = await supabaseService.update<any>(
      TABLES.WORKOUT_ROUTINES,
      supabaseData,
      { eq: { id: routine.id } }
    )
  }

  // Transform the returned data to match our application's expected format
  if (response.data) {
    const item = Array.isArray(response.data) ? response.data[0] : response.data

    const savedRoutine: WorkoutRoutine = {
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description || '',
      level: item.level || 'principiante',
      goal: item.goal || 'general',
      frequency: item.frequency || 3,
      days: Array.isArray(item.days) ? item.days : [],
      isActive: item.is_active || true,
      isTemplate: item.is_template || false,
      periodizationType: item.periodization_type,
      mesocycleData: item.mesocycle_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }

    return { ...response, data: savedRoutine }
  }

  return response
}

/**
 * Delete a workout routine
 * @param routineId - The ID of the routine to delete
 * @param userId - The ID of the user who owns the routine
 * @returns Query response
 */
export const deleteWorkoutRoutine = async (
  routineId: string,
  userId: string
): Promise<QueryResponse<WorkoutRoutine>> => {
  if (!routineId) {
    return { data: null, error: { message: 'Routine ID is required' }, status: 400 }
  }

  if (!userId) {
    return { data: null, error: { message: 'User ID is required' }, status: 400 }
  }

  // Delete the routine
  return supabaseService.delete<WorkoutRoutine>(
    TABLES.WORKOUT_ROUTINES,
    {
      eq: {
        id: routineId,
        user_id: userId
      }
    }
  )
}

/**
 * Get all workout logs for a user
 * @param userId - The ID of the user
 * @param options - Query options
 * @returns An array of workout logs
 */
export const getWorkoutLogs = async (
  userId: string,
  options: {
    startDate?: string
    endDate?: string
    routineId?: string
    limit?: number
    offset?: number
    useCache?: boolean
  } = {}
): Promise<QueryResponse<WorkoutLog[]>> => {
  if (!userId) {
    return { data: [], error: { message: 'User ID is required' }, status: 400 }
  }

  const {
    startDate,
    endDate,
    routineId,
    limit = 20,
    offset = 0,
    useCache = true
  } = options

  let queryOptions: any = {
    select: '*',
    eq: { user_id: userId },
    limit,
    offset,
    order: { date: 'desc' },
    useCache
  }

  if (routineId) {
    queryOptions.eq = { ...queryOptions.eq, routine_id: routineId }
  }

  if (startDate) {
    queryOptions.gte = { date: startDate }
  }

  if (endDate) {
    queryOptions.lte = { date: endDate }
  }

  const response = await supabaseService.query<any[]>(TABLES.WORKOUT_LOGS, queryOptions)

  // Transform data to match our application's expected format
  if (response.data) {
    const transformedData: WorkoutLog[] = response.data.map(item => ({
      id: item.id,
      userId: item.user_id,
      routineId: item.routine_id,
      routineName: item.routine_name,
      dayId: item.day_id,
      dayName: item.day_name,
      date: item.date,
      duration: item.duration,
      completedSets: item.completed_sets || [],
      notes: item.notes,
      fatigue: item.fatigue,
      mood: item.mood,
      createdAt: item.created_at
    }))

    return { ...response, data: transformedData }
  }

  return response
}

/**
 * Save a workout log
 * @param log - The workout log to save
 * @returns The saved workout log
 */
export const saveWorkoutLog = async (log: WorkoutLog): Promise<QueryResponse<WorkoutLog>> => {
  // Validate log data
  if (!log.id) {
    log.id = uuidv4()
  }

  if (!log.userId) {
    return { data: null, error: { message: 'User ID is required' }, status: 400 }
  }

  if (!log.date) {
    return { data: null, error: { message: 'Date is required' }, status: 400 }
  }

  // Prepare data for Supabase
  const supabaseData = {
    id: log.id,
    user_id: log.userId,
    routine_id: log.routineId,
    routine_name: log.routineName,
    day_id: log.dayId,
    day_name: log.dayName,
    date: log.date,
    duration: log.duration,
    completed_sets: log.completedSets || [],
    notes: log.notes,
    fatigue: log.fatigue,
    mood: log.mood,
    created_at: log.createdAt || new Date().toISOString()
  }

  // Use upsert to handle both insert and update
  const response = await supabaseService.insert<any>(
    TABLES.WORKOUT_LOGS,
    supabaseData,
    { upsert: true }
  )

  // Transform the returned data to match our application's expected format
  if (response.data) {
    const item = Array.isArray(response.data) ? response.data[0] : response.data

    const savedLog: WorkoutLog = {
      id: item.id,
      userId: item.user_id,
      routineId: item.routine_id,
      routineName: item.routine_name,
      dayId: item.day_id,
      dayName: item.day_name,
      date: item.date,
      duration: item.duration,
      completedSets: item.completed_sets || [],
      notes: item.notes,
      fatigue: item.fatigue,
      mood: item.mood,
      createdAt: item.created_at
    }

    return { ...response, data: savedLog }
  }

  return response
}

/**
 * Get all exercises
 * @param options - Query options
 * @returns An array of exercises
 */
export const getExercises = async (options: {
  category?: string
  muscle_group?: string
  difficulty?: string
  equipment?: string
  is_compound?: boolean
  limit?: number
  offset?: number
  search?: string
  useCache?: boolean
} = {}): Promise<QueryResponse<Exercise[]>> => {
  const {
    category,
    muscle_group,
    difficulty,
    equipment,
    is_compound,
    limit = 100,
    offset = 0,
    search,
    useCache = true
  } = options

  let queryOptions: any = {
    select: '*',
    order: { name: 'asc' },
    limit,
    offset,
    useCache
  }

  // Add filters
  if (category) {
    queryOptions.eq = { ...queryOptions.eq, category }
  }

  if (difficulty) {
    queryOptions.eq = { ...queryOptions.eq, difficulty }
  }

  if (is_compound !== undefined) {
    queryOptions.eq = { ...queryOptions.eq, is_compound }
  }

  // For array fields, use contains
  if (muscle_group) {
    queryOptions.contains = { ...queryOptions.contains, muscle_group: [muscle_group] }
  }

  if (equipment) {
    queryOptions.contains = { ...queryOptions.contains, equipment: [equipment] }
  }

  // For search, use ilike on name or description
  if (search) {
    queryOptions.or = `name.ilike.%${search}%,description.ilike.%${search}%`
  }

  const response = await supabaseService.query<any[]>(TABLES.EXERCISES, queryOptions)

  // Transform data to match our application's expected format
  if (response.data) {
    const transformedData: Exercise[] = response.data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      muscleGroup: item.muscle_group || [],
      secondaryMuscleGroups: item.secondary_muscle_groups || [],
      difficulty: item.difficulty || 'intermediate',
      equipment: item.equipment || [],
      isCompound: item.is_compound || false,
      imageUrl: item.image_url,
      videoUrl: item.video_url,
      instructions: item.instructions,
      tips: item.tips,
      alternatives: item.alternatives,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return { ...response, data: transformedData }
  }

  return response
}

/**
 * Search exercises by name, category, or muscle group
 * @param query - The search query
 * @param options - Additional search options
 * @returns An array of exercises that match the query
 */
export const searchExercises = async (
  query: string,
  options: {
    limit?: number
    offset?: number
    useCache?: boolean
  } = {}
): Promise<QueryResponse<Exercise[]>> => {
  if (!query || query.trim() === '') {
    return getExercises(options)
  }

  const { limit = 20, offset = 0, useCache = true } = options
  const normalizedQuery = query.toLowerCase().trim()

  // Use the getExercises function with search parameter
  return getExercises({
    search: normalizedQuery,
    limit,
    offset,
    useCache
  })
}

/**
 * Get training statistics for a user
 * @param userId - The ID of the user
 * @returns Training statistics
 */
export const getTrainingStats = async (userId: string): Promise<QueryResponse<any>> => {
  try {
    if (!userId) {
      return { data: null, error: new Error('User ID is required') }
    }

    // Get workout logs
    const { data: logs, error } = await getWorkoutLogs(userId)

    if (error) {
      console.error('Error fetching workout logs for stats:', error)
      return { data: null, error }
    }

    if (!logs || logs.length === 0) {
      return {
        data: {
          totalWorkouts: 0,
          totalDuration: 0,
          totalSets: 0,
          workoutsThisWeek: 0,
          workoutsThisMonth: 0,
          progressData: []
        },
        error: null
      }
    }

    // Calculate statistics
    const totalWorkouts = logs.length
    const totalDuration = logs.reduce((acc, log) => acc + (log.duration || 0), 0)
    const totalSets = logs.reduce((acc, log) => acc + (log.completedSets?.length || 0), 0)

    // Calculate workouts per week
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const workoutsThisWeek = logs.filter(log => new Date(log.date) >= oneWeekAgo).length

    // Calculate workouts per month
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const workoutsThisMonth = logs.filter(log => new Date(log.date) >= oneMonthAgo).length

    // Calculate progress
    const progressData = logs.map(log => ({
      date: log.date,
      duration: log.duration,
      sets: log.completedSets?.length || 0
    }))

    return {
      data: {
        totalWorkouts,
        totalDuration,
        totalSets,
        workoutsThisWeek,
        workoutsThisMonth,
        progressData
      },
      error: null
    }
  } catch (error) {
    console.error('Error in getTrainingStats:', error)
    return { data: null, error }
  }
}

/**
 * Get a workout template by ID
 * @param templateId - The ID of the template
 * @returns The workout template
 */
export const getTemplateById = async (templateId: string): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', templateId)
      .eq('is_template', true)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return { data: null, error }
    }

    if (!data) {
      return { data: null, error: new Error('Template not found') }
    }

    // Transform data to match our application's expected format
    const transformedData: WorkoutRoutine = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description || '',
      level: data.level || 'principiante',
      goal: data.goal || 'general',
      frequency: data.frequency || '3-4 días por semana',
      days: Array.isArray(data.days) ? data.days : [],
      isActive: data.is_active || true,
      isTemplate: true,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    }

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getTemplateById:', error)
    return { data: null, error }
  }
}

/**
 * Get all workout templates
 * @returns An array of workout templates
 */
export const getWorkoutTemplates = async (): Promise<QueryResponse<WorkoutRoutine[]>> => {
  try {
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('is_template', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return { data: [], error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transform data to match our application's expected format
    const transformedData: WorkoutRoutine[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description || '',
      level: item.level || 'principiante',
      goal: item.goal || 'general',
      frequency: item.frequency || '3-4 días por semana',
      days: Array.isArray(item.days) ? item.days : [],
      isActive: item.is_active || true,
      isTemplate: true,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }))

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getWorkoutTemplates:', error)
    return { data: [], error }
  }
}

/**
 * Create a workout routine from a template
 * @param templateId - The ID of the template
 * @param userId - The ID of the user
 * @returns The created workout routine
 */
export const createRoutineFromTemplate = async (templateId: string, userId: string): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    if (!templateId) {
      return { data: null, error: new Error('Template ID is required') }
    }

    if (!userId) {
      return { data: null, error: new Error('User ID is required') }
    }

    // Get the template
    const { data: template, error: templateError } = await getTemplateById(templateId)

    if (templateError || !template) {
      console.error('Error fetching template:', templateError)
      return { data: null, error: templateError || new Error('Template not found') }
    }

    // Create a new routine based on the template
    const newRoutine: WorkoutRoutine = {
      id: uuidv4(),
      userId,
      name: template.name,
      description: template.description,
      level: template.level,
      goal: template.goal,
      frequency: template.frequency,
      days: template.days.map(day => ({
        ...day,
        id: uuidv4() // Generate new IDs for each day
      })),
      isActive: true,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save the new routine
    return saveWorkoutRoutine(newRoutine)
  } catch (error) {
    console.error('Error in createRoutineFromTemplate:', error)
    return { data: null, error }
  }
}
