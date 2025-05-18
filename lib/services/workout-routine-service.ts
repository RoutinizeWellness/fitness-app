import { supabase, handleSupabaseError, TABLES, COLUMNS } from "../supabase-client-enhanced"
import { WorkoutRoutine, WorkoutDay } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"

/**
 * Obtener todas las rutinas de entrenamiento de un usuario
 * @param userId - ID del usuario
 * @returns - Lista de rutinas o error
 */
export const getUserRoutines = async (userId: string) => {
  try {
    if (!userId) {
      return { data: [], error: new Error("userId es requerido") }
    }

    const { data, error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .select("*")
      .eq(COLUMNS.USER_ID, userId)
      .order(COLUMNS.CREATED_AT, { ascending: false })

    if (error) {
      return { data: [], error: handleSupabaseError(error, "Error al obtener rutinas de entrenamiento") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description || "",
      level: item.level || "principiante",
      goal: item.goal || "general",
      frequency: item.frequency || "3-4 días por semana",
      days: Array.isArray(item.days) ? item.days : [],
      isActive: item.is_active || true,
      isTemplate: item.is_template || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }))

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en getUserRoutines:", e)
    return { data: [], error: e instanceof Error ? e : new Error("Error desconocido en getUserRoutines") }
  }
}

/**
 * Obtener una rutina de entrenamiento por ID
 * @param routineId - ID de la rutina
 * @returns - Rutina o error
 */
export const getRoutineById = async (routineId: string) => {
  try {
    if (!routineId) {
      return { data: null, error: new Error("routineId es requerido") }
    }

    const { data, error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .select("*")
      .eq("id", routineId)
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al obtener rutina de entrenamiento") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description || "",
      level: data.level || "principiante",
      goal: data.goal || "general",
      frequency: data.frequency || "3-4 días por semana",
      days: Array.isArray(data.days) ? data.days : [],
      isActive: data.is_active || true,
      isTemplate: data.is_template || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en getRoutineById:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getRoutineById") }
  }
}

/**
 * Guardar una rutina de entrenamiento
 * @param routine - Datos de la rutina
 * @returns - Rutina guardada o error
 */
export const saveWorkoutRoutine = async (routine: WorkoutRoutine) => {
  try {
    // Validar datos de la rutina
    if (!routine.id) {
      routine.id = uuidv4()
    }

    if (!routine.userId) {
      return { data: null, error: new Error("userId es requerido") }
    }

    if (!routine.name) {
      return { data: null, error: new Error("name es requerido") }
    }

    // Preparar datos para Supabase
    const routineData = {
      id: routine.id,
      user_id: routine.userId,
      name: routine.name,
      description: routine.description || "",
      level: routine.level || "principiante",
      goal: routine.goal || "general",
      frequency: routine.frequency || "3-4 días por semana",
      days: routine.days || [],
      is_active: routine.isActive,
      is_template: routine.isTemplate || false,
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Verificar si la rutina existe
    const { data: existingData, error: checkError } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .select("id")
      .eq("id", routine.id)
      .maybeSingle()

    if (checkError) {
      return { data: null, error: handleSupabaseError(checkError, "Error al verificar si la rutina existe") }
    }

    let result

    if (!existingData) {
      // Si no existe, insertarla
      result = await supabase
        .from(TABLES.WORKOUT_ROUTINES)
        .insert(routineData)
        .select()
    } else {
      // Si existe, actualizarla
      result = await supabase
        .from(TABLES.WORKOUT_ROUTINES)
        .update(routineData)
        .eq("id", routine.id)
        .select()
    }

    const { data, error } = result

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al guardar rutina de entrenamiento") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description || "",
      level: data[0].level || "principiante",
      goal: data[0].goal || "general",
      frequency: data[0].frequency || "3-4 días por semana",
      days: Array.isArray(data[0].days) ? data[0].days : [],
      isActive: data[0].is_active || true,
      isTemplate: data[0].is_template || false,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at || data[0].created_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en saveWorkoutRoutine:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en saveWorkoutRoutine") }
  }
}

/**
 * Eliminar una rutina de entrenamiento
 * @param routineId - ID de la rutina
 * @param userId - ID del usuario (para verificar propiedad)
 * @returns - Éxito o error
 */
export const deleteWorkoutRoutine = async (routineId: string, userId: string) => {
  try {
    if (!routineId) {
      return { success: false, error: new Error("routineId es requerido") }
    }

    if (!userId) {
      return { success: false, error: new Error("userId es requerido") }
    }

    // Eliminar la rutina
    const { error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .delete()
      .eq("id", routineId)
      .eq(COLUMNS.USER_ID, userId)

    if (error) {
      return { success: false, error: handleSupabaseError(error, "Error al eliminar rutina de entrenamiento") }
    }

    return { success: true, error: null }
  } catch (e) {
    console.error("Error en deleteWorkoutRoutine:", e)
    return { success: false, error: e instanceof Error ? e : new Error("Error desconocido en deleteWorkoutRoutine") }
  }
}

/**
 * Añadir un día a una rutina de entrenamiento
 * @param routineId - ID de la rutina
 * @param day - Datos del día
 * @returns - Rutina actualizada o error
 */
export const addDayToRoutine = async (routineId: string, day: WorkoutDay) => {
  try {
    if (!routineId) {
      return { data: null, error: new Error("routineId es requerido") }
    }

    // Obtener la rutina actual
    const { data: currentRoutine, error: getError } = await getRoutineById(routineId)

    if (getError) {
      return { data: null, error: getError }
    }

    if (!currentRoutine) {
      return { data: null, error: new Error("No se encontró la rutina de entrenamiento") }
    }

    // Asignar ID al día si no tiene
    if (!day.id) {
      day.id = uuidv4()
    }

    // Añadir el día a la lista de días
    const updatedDays = [...(currentRoutine.days || []), day]

    // Actualizar la rutina
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .update({ 
        days: updatedDays,
        updated_at: new Date().toISOString()
      })
      .eq("id", routineId)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al añadir día a la rutina") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description || "",
      level: data[0].level || "principiante",
      goal: data[0].goal || "general",
      frequency: data[0].frequency || "3-4 días por semana",
      days: Array.isArray(data[0].days) ? data[0].days : [],
      isActive: data[0].is_active || true,
      isTemplate: data[0].is_template || false,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at || data[0].created_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en addDayToRoutine:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en addDayToRoutine") }
  }
}

/**
 * Actualizar un día de una rutina de entrenamiento
 * @param routineId - ID de la rutina
 * @param dayId - ID del día
 * @param updates - Datos a actualizar
 * @returns - Rutina actualizada o error
 */
export const updateDayInRoutine = async (routineId: string, dayId: string, updates: Partial<WorkoutDay>) => {
  try {
    if (!routineId) {
      return { data: null, error: new Error("routineId es requerido") }
    }

    if (!dayId) {
      return { data: null, error: new Error("dayId es requerido") }
    }

    // Obtener la rutina actual
    const { data: currentRoutine, error: getError } = await getRoutineById(routineId)

    if (getError) {
      return { data: null, error: getError }
    }

    if (!currentRoutine) {
      return { data: null, error: new Error("No se encontró la rutina de entrenamiento") }
    }

    // Encontrar el día a actualizar
    const dayIndex = currentRoutine.days.findIndex(d => d.id === dayId)

    if (dayIndex === -1) {
      return { data: null, error: new Error("No se encontró el día en la rutina") }
    }

    // Actualizar el día
    const updatedDays = [...currentRoutine.days]
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      ...updates
    }

    // Actualizar la rutina
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .update({ 
        days: updatedDays,
        updated_at: new Date().toISOString()
      })
      .eq("id", routineId)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al actualizar día en la rutina") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description || "",
      level: data[0].level || "principiante",
      goal: data[0].goal || "general",
      frequency: data[0].frequency || "3-4 días por semana",
      days: Array.isArray(data[0].days) ? data[0].days : [],
      isActive: data[0].is_active || true,
      isTemplate: data[0].is_template || false,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at || data[0].created_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en updateDayInRoutine:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en updateDayInRoutine") }
  }
}

/**
 * Eliminar un día de una rutina de entrenamiento
 * @param routineId - ID de la rutina
 * @param dayId - ID del día
 * @returns - Rutina actualizada o error
 */
export const deleteDayFromRoutine = async (routineId: string, dayId: string) => {
  try {
    if (!routineId) {
      return { data: null, error: new Error("routineId es requerido") }
    }

    if (!dayId) {
      return { data: null, error: new Error("dayId es requerido") }
    }

    // Obtener la rutina actual
    const { data: currentRoutine, error: getError } = await getRoutineById(routineId)

    if (getError) {
      return { data: null, error: getError }
    }

    if (!currentRoutine) {
      return { data: null, error: new Error("No se encontró la rutina de entrenamiento") }
    }

    // Filtrar el día a eliminar
    const updatedDays = currentRoutine.days.filter(d => d.id !== dayId)

    // Actualizar la rutina
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .update({ 
        days: updatedDays,
        updated_at: new Date().toISOString()
      })
      .eq("id", routineId)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al eliminar día de la rutina") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      description: data[0].description || "",
      level: data[0].level || "principiante",
      goal: data[0].goal || "general",
      frequency: data[0].frequency || "3-4 días por semana",
      days: Array.isArray(data[0].days) ? data[0].days : [],
      isActive: data[0].is_active || true,
      isTemplate: data[0].is_template || false,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at || data[0].created_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en deleteDayFromRoutine:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en deleteDayFromRoutine") }
  }
}

/**
 * Obtener todas las plantillas de rutinas
 * @returns - Lista de plantillas o error
 */
export const getWorkoutTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_ROUTINES)
      .select("*")
      .eq("is_template", true)
      .order(COLUMNS.CREATED_AT, { ascending: false })

    if (error) {
      return { data: [], error: handleSupabaseError(error, "Error al obtener plantillas de rutinas") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: WorkoutRoutine[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description || "",
      level: item.level || "principiante",
      goal: item.goal || "general",
      frequency: item.frequency || "3-4 días por semana",
      days: Array.isArray(item.days) ? item.days : [],
      isActive: item.is_active || true,
      isTemplate: true,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }))

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en getWorkoutTemplates:", e)
    return { data: [], error: e instanceof Error ? e : new Error("Error desconocido en getWorkoutTemplates") }
  }
}

/**
 * Crear una rutina a partir de una plantilla
 * @param templateId - ID de la plantilla
 * @param userId - ID del usuario
 * @returns - Rutina creada o error
 */
export const createRoutineFromTemplate = async (templateId: string, userId: string) => {
  try {
    if (!templateId) {
      return { data: null, error: new Error("templateId es requerido") }
    }

    if (!userId) {
      return { data: null, error: new Error("userId es requerido") }
    }

    // Obtener la plantilla
    const { data: template, error: templateError } = await getRoutineById(templateId)

    if (templateError) {
      return { data: null, error: templateError }
    }

    if (!template) {
      return { data: null, error: new Error("No se encontró la plantilla") }
    }

    // Crear una nueva rutina basada en la plantilla
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
        id: uuidv4() // Generar nuevos IDs para cada día
      })),
      isActive: true,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Guardar la nueva rutina
    return saveWorkoutRoutine(newRoutine)
  } catch (e) {
    console.error("Error en createRoutineFromTemplate:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en createRoutineFromTemplate") }
  }
}
