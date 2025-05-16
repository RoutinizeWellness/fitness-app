import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'
import { 
  TrainerModification, 
  TrainerFeedback, 
  TrainerClient,
  WorkoutRoutine,
  WorkoutDay,
  ExerciseSet
} from '@/lib/types/training'

/**
 * Obtiene los clientes de un entrenador
 * @param trainerId - ID del entrenador
 * @returns - Lista de clientes o null en caso de error
 */
export async function getTrainerClients(trainerId: string) {
  try {
    const { data, error } = await supabase
      .from('trainer_clients')
      .select(`
        *,
        user:users(id, email, first_name, last_name, avatar_url)
      `)
      .eq('trainer_id', trainerId)
      .order('last_interaction', { ascending: false })
    
    if (error) {
      console.error('Error al obtener clientes del entrenador:', error)
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: [], error: null }
    }
    
    // Transformar los datos al formato esperado por la aplicación
    const clients: (TrainerClient & { user: any })[] = data.map(client => ({
      trainerId: client.trainer_id,
      userId: client.user_id,
      status: client.status,
      startDate: client.start_date,
      endDate: client.end_date || undefined,
      assignedRoutines: client.assigned_routines || [],
      notes: client.notes || undefined,
      goals: client.goals || undefined,
      lastInteraction: client.last_interaction,
      user: client.user
    }))
    
    return { data: clients, error: null }
  } catch (error) {
    console.error('Error general en getTrainerClients:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene las modificaciones realizadas por un entrenador
 * @param trainerId - ID del entrenador
 * @param options - Opciones de filtrado
 * @returns - Lista de modificaciones o null en caso de error
 */
export async function getTrainerModifications(
  trainerId: string,
  options?: {
    userId?: string
    status?: 'pending' | 'applied' | 'rejected'
    limit?: number
  }
) {
  try {
    let query = supabase
      .from('trainer_modifications')
      .select(`
        *,
        user:users!trainer_modifications_user_id_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
    
    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error al obtener modificaciones del entrenador:', error)
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: [], error: null }
    }
    
    // Transformar los datos al formato esperado por la aplicación
    const modifications: (TrainerModification & { user: any })[] = data.map(mod => ({
      id: mod.id,
      trainerId: mod.trainer_id,
      userId: mod.user_id,
      routineId: mod.routine_id,
      dayId: mod.day_id || undefined,
      exerciseId: mod.exercise_id || undefined,
      modificationType: mod.modification_type,
      originalValue: mod.original_value,
      newValue: mod.new_value,
      reason: mod.reason,
      status: mod.status,
      createdAt: mod.created_at,
      appliedAt: mod.applied_at || undefined,
      user: mod.user
    }))
    
    return { data: modifications, error: null }
  } catch (error) {
    console.error('Error general en getTrainerModifications:', error)
    return { data: null, error }
  }
}

/**
 * Crea una nueva modificación de entrenador
 * @param modification - Datos de la modificación
 * @returns - Modificación creada o null en caso de error
 */
export async function createTrainerModification(
  modification: Omit<TrainerModification, 'id' | 'createdAt' | 'status'> & { id?: string }
) {
  try {
    const modificationId = modification.id || uuidv4()
    const now = new Date().toISOString()
    
    // Preparar los datos para Supabase
    const supabaseData = {
      id: modificationId,
      trainer_id: modification.trainerId,
      user_id: modification.userId,
      routine_id: modification.routineId,
      day_id: modification.dayId || null,
      exercise_id: modification.exerciseId || null,
      modification_type: modification.modificationType,
      original_value: modification.originalValue || null,
      new_value: modification.newValue || null,
      reason: modification.reason,
      status: 'pending',
      created_at: now
    }
    
    // Guardar en Supabase
    const { data, error } = await supabase
      .from('trainer_modifications')
      .insert(supabaseData)
      .select()
    
    if (error) {
      console.error('Error al crear modificación de entrenador:', error)
      return { data: null, error }
    }
    
    // Actualizar la fecha de última interacción con el cliente
    await supabase
      .from('trainer_clients')
      .update({ last_interaction: now })
      .eq('trainer_id', modification.trainerId)
      .eq('user_id', modification.userId)
    
    // Transformar los datos al formato esperado por la aplicación
    const createdModification: TrainerModification = {
      id: modificationId,
      trainerId: modification.trainerId,
      userId: modification.userId,
      routineId: modification.routineId,
      dayId: modification.dayId,
      exerciseId: modification.exerciseId,
      modificationType: modification.modificationType,
      originalValue: modification.originalValue,
      newValue: modification.newValue,
      reason: modification.reason,
      status: 'pending',
      createdAt: now
    }
    
    return { data: createdModification, error: null }
  } catch (error) {
    console.error('Error general en createTrainerModification:', error)
    return { data: null, error }
  }
}

/**
 * Actualiza el estado de una modificación
 * @param modificationId - ID de la modificación
 * @param status - Nuevo estado
 * @returns - Modificación actualizada o null en caso de error
 */
export async function updateModificationStatus(
  modificationId: string,
  status: 'applied' | 'rejected'
) {
  try {
    const now = new Date().toISOString()
    
    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('trainer_modifications')
      .update({
        status,
        applied_at: status === 'applied' ? now : null
      })
      .eq('id', modificationId)
      .select()
    
    if (error) {
      console.error('Error al actualizar estado de modificación:', error)
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: null, error: new Error('No se encontró la modificación') }
    }
    
    // Transformar los datos al formato esperado por la aplicación
    const updatedModification: TrainerModification = {
      id: data[0].id,
      trainerId: data[0].trainer_id,
      userId: data[0].user_id,
      routineId: data[0].routine_id,
      dayId: data[0].day_id || undefined,
      exerciseId: data[0].exercise_id || undefined,
      modificationType: data[0].modification_type,
      originalValue: data[0].original_value,
      newValue: data[0].new_value,
      reason: data[0].reason,
      status: data[0].status,
      createdAt: data[0].created_at,
      appliedAt: data[0].applied_at || undefined
    }
    
    return { data: updatedModification, error: null }
  } catch (error) {
    console.error('Error general en updateModificationStatus:', error)
    return { data: null, error }
  }
}

/**
 * Aplica una modificación a una rutina
 * @param modificationId - ID de la modificación
 * @returns - Resultado de la operación
 */
export async function applyModification(modificationId: string) {
  try {
    // Obtener la modificación
    const { data: modification, error: modError } = await supabase
      .from('trainer_modifications')
      .select('*')
      .eq('id', modificationId)
      .single()
    
    if (modError || !modification) {
      console.error('Error al obtener modificación:', modError)
      return { success: false, error: modError || new Error('No se encontró la modificación') }
    }
    
    // Verificar que la modificación esté pendiente
    if (modification.status !== 'pending') {
      return { success: false, error: new Error('La modificación ya ha sido procesada') }
    }
    
    // Obtener la rutina
    const { data: routine, error: routineError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', modification.routine_id)
      .single()
    
    if (routineError || !routine) {
      console.error('Error al obtener rutina:', routineError)
      return { success: false, error: routineError || new Error('No se encontró la rutina') }
    }
    
    // Aplicar la modificación según su tipo
    let updateData: any = {}
    
    switch (modification.modification_type) {
      case 'adjust_routine':
        // Actualizar propiedades generales de la rutina
        updateData = { ...modification.new_value }
        break
        
      case 'add_exercise':
      case 'remove_exercise':
      case 'replace_exercise':
      case 'adjust_sets':
      case 'adjust_reps':
      case 'adjust_weight':
        // Estas modificaciones requieren actualizar los días de la rutina
        // Se manejan a través de las tablas workout_days y workout_exercise_sets
        await applyExerciseModification(modification)
        break
        
      default:
        return { success: false, error: new Error('Tipo de modificación no soportado') }
    }
    
    // Si hay datos para actualizar la rutina principal, hacerlo
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('workout_routines')
        .update(updateData)
        .eq('id', modification.routine_id)
      
      if (updateError) {
        console.error('Error al actualizar rutina:', updateError)
        return { success: false, error: updateError }
      }
    }
    
    // Actualizar el estado de la modificación
    const { error: statusError } = await updateModificationStatus(modificationId, 'applied')
    
    if (statusError) {
      console.error('Error al actualizar estado de modificación:', statusError)
      return { success: false, error: statusError }
    }
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Error general en applyModification:', error)
    return { success: false, error }
  }
}

/**
 * Aplica una modificación relacionada con ejercicios
 * @param modification - Datos de la modificación
 * @returns - Resultado de la operación
 */
async function applyExerciseModification(modification: any) {
  // Implementación específica para cada tipo de modificación
  switch (modification.modification_type) {
    case 'add_exercise':
      // Añadir un nuevo ejercicio al día
      return await addExerciseToDay(
        modification.day_id,
        modification.new_value
      )
      
    case 'remove_exercise':
      // Eliminar un ejercicio del día
      return await removeExerciseFromDay(
        modification.day_id,
        modification.exercise_id
      )
      
    case 'replace_exercise':
      // Reemplazar un ejercicio por otro
      return await replaceExercise(
        modification.day_id,
        modification.exercise_id,
        modification.new_value
      )
      
    case 'adjust_sets':
    case 'adjust_reps':
    case 'adjust_weight':
      // Ajustar propiedades de los sets
      return await adjustExerciseSets(
        modification.day_id,
        modification.exercise_id,
        modification.new_value
      )
      
    default:
      throw new Error('Tipo de modificación no soportado')
  }
}

// Funciones auxiliares para aplicar modificaciones específicas
async function addExerciseToDay(dayId: string, exerciseData: any) {
  // Implementación para añadir un ejercicio
  // ...
  return { success: true, error: null }
}

async function removeExerciseFromDay(dayId: string, exerciseId: string) {
  // Implementación para eliminar un ejercicio
  // ...
  return { success: true, error: null }
}

async function replaceExercise(dayId: string, oldExerciseId: string, newExerciseId: string) {
  // Implementación para reemplazar un ejercicio
  // ...
  return { success: true, error: null }
}

async function adjustExerciseSets(dayId: string, exerciseId: string, adjustments: any) {
  // Implementación para ajustar sets
  // ...
  return { success: true, error: null }
}
