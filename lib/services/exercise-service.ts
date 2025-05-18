import { supabase, handleSupabaseError, TABLES, COLUMNS, STORAGE } from "../supabase-client-enhanced"
import { Exercise } from "@/lib/types/training"
import { v4 as uuidv4 } from "uuid"

/**
 * Obtener todos los ejercicios
 * @returns - Lista de ejercicios o error
 */
export const getAllExercises = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.EXERCISES)
      .select("*")
      .order("name")

    if (error) {
      return { data: [], error: handleSupabaseError(error, "Error al obtener ejercicios") }
    }

    // Transformar datos al formato esperado por la aplicación
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
  } catch (e) {
    console.error("Error en getAllExercises:", e)
    return { data: [], error: e instanceof Error ? e : new Error("Error desconocido en getAllExercises") }
  }
}

/**
 * Buscar ejercicios por nombre, categoría o grupo muscular
 * @param query - Texto de búsqueda
 * @returns - Lista de ejercicios que coinciden con la búsqueda o error
 */
export const searchExercises = async (query: string) => {
  try {
    if (!query || query.trim() === '') {
      return getAllExercises()
    }

    const normalizedQuery = query.toLowerCase().trim()

    const { data, error } = await supabase
      .from(TABLES.EXERCISES)
      .select("*")
      .or(`name.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`)
      .order("name")

    if (error) {
      return { data: [], error: handleSupabaseError(error, "Error al buscar ejercicios") }
    }

    // Transformar datos al formato esperado por la aplicación
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
  } catch (e) {
    console.error("Error en searchExercises:", e)
    return { data: [], error: e instanceof Error ? e : new Error("Error desconocido en searchExercises") }
  }
}

/**
 * Obtener un ejercicio por ID
 * @param exerciseId - ID del ejercicio
 * @returns - Ejercicio o error
 */
export const getExerciseById = async (exerciseId: string) => {
  try {
    if (!exerciseId) {
      return { data: null, error: new Error("exerciseId es requerido") }
    }

    const { data, error } = await supabase
      .from(TABLES.EXERCISES)
      .select("*")
      .eq("id", exerciseId)
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al obtener ejercicio") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: Exercise = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      muscleGroup: data.muscle_group || [],
      secondaryMuscleGroups: data.secondary_muscle_groups || [],
      difficulty: data.difficulty || 'intermediate',
      equipment: data.equipment || [],
      isCompound: data.is_compound || false,
      imageUrl: data.image_url,
      videoUrl: data.video_url,
      instructions: data.instructions,
      tips: data.tips,
      alternatives: data.alternatives,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en getExerciseById:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en getExerciseById") }
  }
}

/**
 * Crear un nuevo ejercicio
 * @param exercise - Datos del ejercicio
 * @returns - Ejercicio creado o error
 */
export const createExercise = async (exercise: Partial<Exercise>) => {
  try {
    if (!exercise.name) {
      return { data: null, error: new Error("El nombre del ejercicio es requerido") }
    }

    // Preparar datos para Supabase
    const exerciseData = {
      id: exercise.id || uuidv4(),
      name: exercise.name,
      description: exercise.description || "",
      category: exercise.category || "otros",
      muscle_group: exercise.muscleGroup || [],
      secondary_muscle_groups: exercise.secondaryMuscleGroups || [],
      difficulty: exercise.difficulty || "intermediate",
      equipment: exercise.equipment || [],
      is_compound: exercise.isCompound || false,
      image_url: exercise.imageUrl || null,
      video_url: exercise.videoUrl || null,
      instructions: exercise.instructions || "",
      tips: exercise.tips || [],
      alternatives: exercise.alternatives || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from(TABLES.EXERCISES)
      .insert([exerciseData])
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al crear ejercicio") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: Exercise = {
      id: data[0].id,
      name: data[0].name,
      description: data[0].description,
      category: data[0].category,
      muscleGroup: data[0].muscle_group || [],
      secondaryMuscleGroups: data[0].secondary_muscle_groups || [],
      difficulty: data[0].difficulty || 'intermediate',
      equipment: data[0].equipment || [],
      isCompound: data[0].is_compound || false,
      imageUrl: data[0].image_url,
      videoUrl: data[0].video_url,
      instructions: data[0].instructions,
      tips: data[0].tips,
      alternatives: data[0].alternatives,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en createExercise:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en createExercise") }
  }
}

/**
 * Actualizar un ejercicio existente
 * @param exerciseId - ID del ejercicio
 * @param updates - Datos a actualizar
 * @returns - Ejercicio actualizado o error
 */
export const updateExercise = async (exerciseId: string, updates: Partial<Exercise>) => {
  try {
    if (!exerciseId) {
      return { data: null, error: new Error("exerciseId es requerido") }
    }

    // Preparar datos para Supabase
    const exerciseData = {
      name: updates.name,
      description: updates.description,
      category: updates.category,
      muscle_group: updates.muscleGroup,
      secondary_muscle_groups: updates.secondaryMuscleGroups,
      difficulty: updates.difficulty,
      equipment: updates.equipment,
      is_compound: updates.isCompound,
      image_url: updates.imageUrl,
      video_url: updates.videoUrl,
      instructions: updates.instructions,
      tips: updates.tips,
      alternatives: updates.alternatives,
      updated_at: new Date().toISOString()
    }

    // Eliminar propiedades undefined
    Object.keys(exerciseData).forEach(key => {
      if (exerciseData[key] === undefined) {
        delete exerciseData[key]
      }
    })

    const { data, error } = await supabase
      .from(TABLES.EXERCISES)
      .update(exerciseData)
      .eq("id", exerciseId)
      .select()

    if (error) {
      return { data: null, error: handleSupabaseError(error, "Error al actualizar ejercicio") }
    }

    // Transformar datos al formato esperado por la aplicación
    const transformedData: Exercise = {
      id: data[0].id,
      name: data[0].name,
      description: data[0].description,
      category: data[0].category,
      muscleGroup: data[0].muscle_group || [],
      secondaryMuscleGroups: data[0].secondary_muscle_groups || [],
      difficulty: data[0].difficulty || 'intermediate',
      equipment: data[0].equipment || [],
      isCompound: data[0].is_compound || false,
      imageUrl: data[0].image_url,
      videoUrl: data[0].video_url,
      instructions: data[0].instructions,
      tips: data[0].tips,
      alternatives: data[0].alternatives,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    }

    return { data: transformedData, error: null }
  } catch (e) {
    console.error("Error en updateExercise:", e)
    return { data: null, error: e instanceof Error ? e : new Error("Error desconocido en updateExercise") }
  }
}

/**
 * Eliminar un ejercicio
 * @param exerciseId - ID del ejercicio
 * @returns - Éxito o error
 */
export const deleteExercise = async (exerciseId: string) => {
  try {
    if (!exerciseId) {
      return { success: false, error: new Error("exerciseId es requerido") }
    }

    const { error } = await supabase
      .from(TABLES.EXERCISES)
      .delete()
      .eq("id", exerciseId)

    if (error) {
      return { success: false, error: handleSupabaseError(error, "Error al eliminar ejercicio") }
    }

    return { success: true, error: null }
  } catch (e) {
    console.error("Error en deleteExercise:", e)
    return { success: false, error: e instanceof Error ? e : new Error("Error desconocido en deleteExercise") }
  }
}

/**
 * Subir imagen de ejercicio
 * @param exerciseId - ID del ejercicio
 * @param file - Archivo de imagen
 * @returns - URL de la imagen o error
 */
export const uploadExerciseImage = async (exerciseId: string, file: File) => {
  try {
    if (!exerciseId) {
      return { url: null, error: new Error("exerciseId es requerido") }
    }

    if (!file) {
      return { url: null, error: new Error("Archivo no válido") }
    }

    if (!file.type.startsWith('image/')) {
      return { url: null, error: new Error("El archivo debe ser una imagen") }
    }

    // Generar un nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${exerciseId}-${Date.now()}.${fileExt}`
    const filePath = `${exerciseId}/${fileName}`

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(STORAGE.EXERCISE_IMAGES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { url: null, error: handleSupabaseError(error, "Error al subir imagen de ejercicio") }
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase
      .storage
      .from(STORAGE.EXERCISE_IMAGES)
      .getPublicUrl(data.path)

    // Actualizar el ejercicio con la nueva URL de la imagen
    const { data: exercise, error: updateError } = await updateExercise(exerciseId, {
      imageUrl: publicUrl
    })

    if (updateError) {
      return { url: publicUrl, error: handleSupabaseError(updateError, "Error al actualizar ejercicio con nueva imagen") }
    }

    return { url: publicUrl, error: null }
  } catch (e) {
    console.error("Error en uploadExerciseImage:", e)
    return { url: null, error: e instanceof Error ? e : new Error("Error desconocido en uploadExerciseImage") }
  }
}

/**
 * Subir video de ejercicio
 * @param exerciseId - ID del ejercicio
 * @param file - Archivo de video
 * @returns - URL del video o error
 */
export const uploadExerciseVideo = async (exerciseId: string, file: File) => {
  try {
    if (!exerciseId) {
      return { url: null, error: new Error("exerciseId es requerido") }
    }

    if (!file) {
      return { url: null, error: new Error("Archivo no válido") }
    }

    if (!file.type.startsWith('video/')) {
      return { url: null, error: new Error("El archivo debe ser un video") }
    }

    // Generar un nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${exerciseId}-${Date.now()}.${fileExt}`
    const filePath = `${exerciseId}/${fileName}`

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(STORAGE.EXERCISE_VIDEOS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { url: null, error: handleSupabaseError(error, "Error al subir video de ejercicio") }
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase
      .storage
      .from(STORAGE.EXERCISE_VIDEOS)
      .getPublicUrl(data.path)

    // Actualizar el ejercicio con la nueva URL del video
    const { data: exercise, error: updateError } = await updateExercise(exerciseId, {
      videoUrl: publicUrl
    })

    if (updateError) {
      return { url: publicUrl, error: handleSupabaseError(updateError, "Error al actualizar ejercicio con nuevo video") }
    }

    return { url: publicUrl, error: null }
  } catch (e) {
    console.error("Error en uploadExerciseVideo:", e)
    return { url: null, error: e instanceof Error ? e : new Error("Error desconocido en uploadExerciseVideo") }
  }
}
