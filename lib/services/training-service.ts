import { supabase } from '@/lib/supabase-client'
import {
  WorkoutRoutine,
  WorkoutDay,
  ExerciseSet,
  WorkoutLog,
  Exercise,
  QueryResponse
} from '@/lib/types/training'
import { v4 as uuidv4 } from 'uuid'

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
 * @returns An array of workout routines
 */
export const getUserRoutines = async (userId: string): Promise<QueryResponse<WorkoutRoutine[]>> => {
  try {
    if (!userId) {
      return { data: [], error: new Error('User ID is required') }
    }

    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching routines:', error)
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
      isTemplate: item.is_template || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }))

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getUserRoutines:', error)
    return { data: [], error }
  }
}

/**
 * Save a workout routine
 * @param routine - The workout routine to save
 * @returns The saved workout routine
 */
export const saveWorkoutRoutine = async (routine: WorkoutRoutine): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    // Validate routine data
    if (!routine.id) {
      routine.id = uuidv4()
    }

    if (!routine.userId) {
      return { data: null, error: new Error('User ID is required') }
    }

    if (!routine.name) {
      return { data: null, error: new Error('Routine name is required') }
    }

    // Prepare data for Supabase
    const supabaseData = {
      id: routine.id,
      user_id: routine.userId,
      name: routine.name,
      description: routine.description || '',
      level: routine.level || 'principiante',
      goal: routine.goal || 'general',
      frequency: routine.frequency || '3-4 días por semana',
      days: routine.days || [],
      is_active: routine.isActive,
      is_template: routine.isTemplate || false,
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if the routine exists
    const { data: existingData, error: checkError } = await supabase
      .from('workout_routines')
      .select('id')
      .eq('id', routine.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking if routine exists:', checkError)
      return { data: null, error: checkError }
    }

    let result

    if (!existingData) {
      // If it doesn't exist, insert it
      result = await supabase
        .from('workout_routines')
        .insert(supabaseData)
        .select()
    } else {
      // If it exists, update it
      result = await supabase
        .from('workout_routines')
        .update(supabaseData)
        .eq('id', routine.id)
        .select()
    }

    const { data, error } = result

    if (error) {
      console.error('Error saving routine:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: null, error: new Error('No data returned after saving routine') }
    }

    // Transform the returned data to match our application's expected format
    const savedRoutine: WorkoutRoutine = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description || '',
      level: data[0].level || 'principiante',
      goal: data[0].goal || 'general',
      frequency: data[0].frequency || '3-4 días por semana',
      days: Array.isArray(data[0].days) ? data[0].days : [],
      isActive: data[0].is_active || true,
      isTemplate: data[0].is_template || false,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at || data[0].created_at
    }

    return { data: savedRoutine, error: null }
  } catch (error) {
    console.error('Error in saveWorkoutRoutine:', error)
    return { data: null, error }
  }
}

/**
 * Delete a workout routine
 * @param routineId - The ID of the routine to delete
 * @param userId - The ID of the user who owns the routine
 * @returns A success flag and any error
 */
export const deleteWorkoutRoutine = async (routineId: string, userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    if (!routineId) {
      return { success: false, error: new Error('Routine ID is required') }
    }

    if (!userId) {
      return { success: false, error: new Error('User ID is required') }
    }

    // Delete the routine
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting routine:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteWorkoutRoutine:', error)
    return { success: false, error }
  }
}

/**
 * Get all workout logs for a user
 * @param userId - The ID of the user
 * @returns An array of workout logs
 */
export const getWorkoutLogs = async (userId: string): Promise<QueryResponse<WorkoutLog[]>> => {
  try {
    if (!userId) {
      return { data: [], error: new Error('User ID is required') }
    }

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching workout logs:', error)
      return { data: [], error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transform data to match our application's expected format
    const transformedData: WorkoutLog[] = data.map(item => ({
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

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getWorkoutLogs:', error)
    return { data: [], error }
  }
}

/**
 * Save a workout log
 * @param log - The workout log to save
 * @returns The saved workout log
 */
export const saveWorkoutLog = async (log: WorkoutLog): Promise<QueryResponse<WorkoutLog>> => {
  try {
    // Validate log data
    if (!log.id) {
      log.id = uuidv4()
    }

    if (!log.userId) {
      return { data: null, error: new Error('User ID is required') }
    }

    if (!log.date) {
      return { data: null, error: new Error('Date is required') }
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

    // Save the log
    const { data, error } = await supabase
      .from('workout_logs')
      .upsert(supabaseData)
      .select()

    if (error) {
      console.error('Error saving workout log:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: null, error: new Error('No data returned after saving workout log') }
    }

    // Transform the returned data to match our application's expected format
    const savedLog: WorkoutLog = {
      id: data[0].id,
      userId: data[0].user_id,
      routineId: data[0].routine_id,
      routineName: data[0].routine_name,
      dayId: data[0].day_id,
      dayName: data[0].day_name,
      date: data[0].date,
      duration: data[0].duration,
      completedSets: data[0].completed_sets || [],
      notes: data[0].notes,
      fatigue: data[0].fatigue,
      mood: data[0].mood,
      createdAt: data[0].created_at
    }

    return { data: savedLog, error: null }
  } catch (error) {
    console.error('Error in saveWorkoutLog:', error)
    return { data: null, error }
  }
}

/**
 * Get all exercises
 * @returns An array of exercises
 */
export const getExercises = async (): Promise<QueryResponse<Exercise[]>> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching exercises:', error)
      return { data: [], error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transform data to match our application's expected format
    const transformedData: Exercise[] = data.map(item => ({
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

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getExercises:', error)
    return { data: [], error }
  }
}

/**
 * Search exercises by name, category, or muscle group
 * @param query - The search query
 * @returns An array of exercises that match the query
 */
export const searchExercises = async (query: string): Promise<QueryResponse<Exercise[]>> => {
  try {
    if (!query || query.trim() === '') {
      return getExercises()
    }

    const normalizedQuery = query.toLowerCase().trim()

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`name.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`)
      .order('name')

    if (error) {
      console.error('Error searching exercises:', error)
      return { data: [], error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transform data to match our application's expected format
    const transformedData: Exercise[] = data.map(item => ({
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

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in searchExercises:', error)
    return { data: [], error }
  }
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
