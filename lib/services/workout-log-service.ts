import { supabase, handleSupabaseError, TABLES, COLUMNS } from "../supabase-client-enhanced"
import { WorkoutLog, CompletedSet } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"

/**
 * Obtener todos los registros de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns - Lista de registros o error
 */
export const getUserWorkoutLogs = async (userId: string) => {
  try {
    if (!userId) {
      return { data: [], error: new Error("userId es requerido") }
    }

    const { data, error } = await supabase
      .from(TABLES.WORKOUT_LOGS)
      .select("*")
      .eq(COLUMNS.USER_ID, userId)
      .order("date", { ascending: false })

    if (error) {
      return { data: [], error: handleSupabaseError(error, "Error al obtener registros de entrenamiento") }
    }

    // Transformar datos al formato esperado por la aplicación
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
  } catch (e) {
    console.error("Error en getUserWorkoutLogs:", e)
    return { data: [], error: e instanceof Error ? e : new Error("Error desconocido en getUserWorkoutLogs") }
  }
}

/**
 * Obtener un registro de entrenamiento por ID
 * @param logId - ID del registro
 * @returns - Registro o error
 */
export const getWorkoutLogById = async (logId: string) => {
  try {
    if (!logId) {
      return { data: null, error: new Error("logId es requerido") }
    }

    const { data, error } = await supabase
      .from(TABLES.WORKOUT_LOGS)
      .select("*")
      .eq("id", logId)
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al obtener registro de entrenamiento") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutLog = {
      id: data.id,
      userId: data.user_id,
      routineId: data.routine_id,
      routineName: data.routine_name,
      dayId: data.day_id,
      dayName: data.day_name,
      date: data.date,
      duration: data.duration,
      completedSets: data.completed_sets || [],
      notes: data.notes,
      fatigue: data.fatigue,
      mood: data.mood,
      createdAt: data.created_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en getWorkoutLogById:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getWorkoutLogById") }
  }
}

/**
 * Guardar un registro de entrenamiento
 * @param log - Datos del registro
 * @returns - Registro guardado o error
 */
export const saveWorkoutLog = async (log: WorkoutLog) => {
  try {
    // Validar datos del registro
    if (!log.userId) {
      return { data: null, error: new Error("userId es requerido") }
    }

    if (!log.date) {
      return { data: null, error: new Error("date es requerido") }
    }

    // Asignar ID si no tiene
    if (!log.id) {
      log.id = uuidv4()
    }

    // Preparar datos para Supabase
    const logData = {
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

    // Guardar el registro
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_LOGS)
      .upsert(logData)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al guardar registro de entrenamiento") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutLog = {
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

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en saveWorkoutLog:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en saveWorkoutLog") }
  }
}

/**
 * Eliminar un registro de entrenamiento
 * @param logId - ID del registro
 * @param userId - ID del usuario (para verificar propiedad)
 * @returns - Éxito o error
 */
export const deleteWorkoutLog = async (logId: string, userId: string) => {
  try {
    if (!logId) {
      return { success: false, error: new Error("logId es requerido") }
    }

    if (!userId) {
      return { success: false, error: new Error("userId es requerido") }
    }

    // Eliminar el registro
    const { error } = await supabase
      .from(TABLES.WORKOUT_LOGS)
      .delete()
      .eq("id", logId)
      .eq(COLUMNS.USER_ID, userId)

    if (error) {
      return { success: false, error: handleSupabaseError(error, "Error al eliminar registro de entrenamiento") }
    }

    return { success: true, error: null }
  } catch (e) {
    console.error("Error en deleteWorkoutLog:", e)
    return { success: false, error: e instanceof Error ? e : new Error("Error desconocido en deleteWorkoutLog") }
  }
}

/**
 * Añadir un set completado a un registro de entrenamiento
 * @param logId - ID del registro
 * @param set - Datos del set completado
 * @returns - Registro actualizado o error
 */
export const addCompletedSet = async (logId: string, set: CompletedSet) => {
  try {
    if (!logId) {
      return { data: null, error: new Error("logId es requerido") }
    }

    // Obtener el registro actual
    const { data: currentLog, error: getError } = await getWorkoutLogById(logId)

    if (getError) {
      return { data: null, error: getError }
    }

    if (!currentLog) {
      return { data: null, error: new Error("No se encontró el registro de entrenamiento") }
    }

    // Asignar ID al set si no tiene
    if (!set.id) {
      set.id = uuidv4()
    }

    // Añadir el set a la lista de sets completados
    const updatedSets = [...(currentLog.completedSets || []), set]

    // Actualizar el registro
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_LOGS)
      .update({ completed_sets: updatedSets })
      .eq("id", logId)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al añadir set completado") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutLog = {
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

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en addCompletedSet:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addCompletedSet") }
  }
}

/**
 * Obtener estadísticas de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns - Estadísticas o error
 */
export const getTrainingStats = async (userId: string) => {
  try {
    if (!userId) {
      return { data: null, error: new Error("userId es requerido") }
    }

    // Obtener los registros de entrenamiento del usuario
    const { data: logs, error } = await getUserWorkoutLogs(userId)

    if (error) {
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

    // Calcular estadísticas
    const totalWorkouts = logs.length
    const totalDuration = logs.reduce((acc, log) => acc + (log.duration || 0), 0)
    const totalSets = logs.reduce((acc, log) => acc + (log.completedSets?.length || 0), 0)

    // Calcular entrenamientos por semana
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const workoutsThisWeek = logs.filter(log => new Date(log.date) >= oneWeekAgo).length

    // Calcular entrenamientos por mes
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const workoutsThisMonth = logs.filter(log => new Date(log.date) >= oneMonthAgo).length

    // Calcular progreso
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
  } catch (e) {
    console.error("Error en getTrainingStats:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getTrainingStats") }
  }
}
