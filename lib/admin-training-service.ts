import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { WorkoutRoutine, WorkoutDay, WorkoutExercise } from './types/training';

/**
 * Obtiene todas las rutinas de entrenamiento de todos los usuarios
 * @param options Opciones de filtrado y paginación
 * @returns Lista de rutinas de entrenamiento
 */
export const getAllUserRoutines = async (options?: {
  limit?: number;
  offset?: number;
  userId?: string;
  isActive?: boolean;
}): Promise<{ data: WorkoutRoutine[] | null; error: PostgrestError | Error | null }> => {
  try {
    let query = supabase
      .from('workout_routines')
      .select(`
        *,
        days:workout_days(
          *,
          exercises:workout_exercises(*)
        ),
        profiles:profiles(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros si se proporcionan
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    // Aplicar paginación
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Procesar los datos para tener la estructura correcta
    const processedData = data?.map(routine => {
      const { days, ...routineData } = routine;
      
      // Procesar los días y sus ejercicios
      const processedDays = days?.map(day => {
        const { exercises, ...dayData } = day;
        return {
          ...dayData,
          exercises: exercises || []
        } as WorkoutDay;
      }) || [];

      return {
        ...routineData,
        days: processedDays
      } as WorkoutRoutine;
    });

    return { data: processedData, error: null };
  } catch (e) {
    console.error('Error en getAllUserRoutines:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getAllUserRoutines')
    };
  }
};

/**
 * Actualiza una rutina de entrenamiento de cualquier usuario (solo para administradores)
 * @param routineId ID de la rutina a actualizar
 * @param routineData Datos actualizados de la rutina
 * @returns Resultado de la operación
 */
export const updateUserRoutine = async (
  routineId: string,
  routineData: Partial<WorkoutRoutine>
): Promise<{ success: boolean; error: PostgrestError | Error | null }> => {
  try {
    // Verificar si el usuario actual es administrador
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    // Verificar si el usuario es administrador
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) throw profileError;
    
    if (!profileData?.is_admin) {
      throw new Error('No tienes permisos de administrador para realizar esta acción');
    }
    
    // Actualizar la rutina
    const { error } = await supabase
      .from('workout_routines')
      .update({
        name: routineData.name,
        description: routineData.description,
        level: routineData.level,
        goal: routineData.goal,
        frequency: routineData.frequency,
        is_active: routineData.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', routineId);
    
    if (error) throw error;
    
    // Si hay días actualizados, manejarlos
    if (routineData.days && routineData.days.length > 0) {
      // Primero, obtener los días actuales para saber cuáles eliminar
      const { data: currentDays, error: daysError } = await supabase
        .from('workout_days')
        .select('id')
        .eq('routine_id', routineId);
      
      if (daysError) throw daysError;
      
      // IDs de días actuales
      const currentDayIds = currentDays?.map(day => day.id) || [];
      // IDs de días en los datos actualizados
      const updatedDayIds = routineData.days.map(day => day.id).filter(id => id);
      
      // Días a eliminar (están en currentDayIds pero no en updatedDayIds)
      const daysToDelete = currentDayIds.filter(id => !updatedDayIds.includes(id));
      
      // Eliminar días que ya no están en la rutina
      if (daysToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('workout_days')
          .delete()
          .in('id', daysToDelete);
        
        if (deleteError) throw deleteError;
      }
      
      // Actualizar o insertar días
      for (const day of routineData.days) {
        if (day.id && currentDayIds.includes(day.id)) {
          // Actualizar día existente
          const { error: updateDayError } = await supabase
            .from('workout_days')
            .update({
              name: day.name,
              order: day.order
            })
            .eq('id', day.id);
          
          if (updateDayError) throw updateDayError;
          
          // Manejar ejercicios del día
          if (day.exercises && day.exercises.length > 0) {
            // Obtener ejercicios actuales
            const { data: currentExercises, error: exercisesError } = await supabase
              .from('workout_exercises')
              .select('id')
              .eq('day_id', day.id);
            
            if (exercisesError) throw exercisesError;
            
            const currentExerciseIds = currentExercises?.map(ex => ex.id) || [];
            const updatedExerciseIds = day.exercises.map(ex => ex.id).filter(id => id);
            
            // Ejercicios a eliminar
            const exercisesToDelete = currentExerciseIds.filter(id => !updatedExerciseIds.includes(id));
            
            if (exercisesToDelete.length > 0) {
              const { error: deleteExError } = await supabase
                .from('workout_exercises')
                .delete()
                .in('id', exercisesToDelete);
              
              if (deleteExError) throw deleteExError;
            }
            
            // Actualizar o insertar ejercicios
            for (const exercise of day.exercises) {
              if (exercise.id && currentExerciseIds.includes(exercise.id)) {
                // Actualizar ejercicio existente
                const { error: updateExError } = await supabase
                  .from('workout_exercises')
                  .update({
                    exercise_id: exercise.exerciseId,
                    order: exercise.order,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    rest: exercise.rest
                  })
                  .eq('id', exercise.id);
                
                if (updateExError) throw updateExError;
              } else {
                // Insertar nuevo ejercicio
                const { error: insertExError } = await supabase
                  .from('workout_exercises')
                  .insert({
                    id: exercise.id || undefined,
                    day_id: day.id,
                    exercise_id: exercise.exerciseId,
                    order: exercise.order,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    rest: exercise.rest
                  });
                
                if (insertExError) throw insertExError;
              }
            }
          }
        } else {
          // Insertar nuevo día
          const { data: newDay, error: insertDayError } = await supabase
            .from('workout_days')
            .insert({
              id: day.id || undefined,
              routine_id: routineId,
              name: day.name,
              order: day.order
            })
            .select('id')
            .single();
          
          if (insertDayError) throw insertDayError;
          
          // Insertar ejercicios del nuevo día
          if (day.exercises && day.exercises.length > 0 && newDay) {
            const exercisesToInsert = day.exercises.map(ex => ({
              id: ex.id || undefined,
              day_id: newDay.id,
              exercise_id: ex.exerciseId,
              order: ex.order,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.rest
            }));
            
            const { error: insertExError } = await supabase
              .from('workout_exercises')
              .insert(exercisesToInsert);
            
            if (insertExError) throw insertExError;
          }
        }
      }
    }
    
    return { success: true, error: null };
  } catch (e) {
    console.error('Error en updateUserRoutine:', e);
    return {
      success: false,
      error: e instanceof PostgrestError ? e : e instanceof Error ? e : new Error('Error desconocido en updateUserRoutine')
    };
  }
};

/**
 * Elimina una rutina de entrenamiento de cualquier usuario (solo para administradores)
 * @param routineId ID de la rutina a eliminar
 * @returns Resultado de la operación
 */
export const deleteUserRoutine = async (
  routineId: string
): Promise<{ success: boolean; error: PostgrestError | Error | null }> => {
  try {
    // Verificar si el usuario actual es administrador
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    // Verificar si el usuario es administrador
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) throw profileError;
    
    if (!profileData?.is_admin) {
      throw new Error('No tienes permisos de administrador para realizar esta acción');
    }
    
    // Eliminar la rutina (las restricciones de clave foránea se encargarán de eliminar días y ejercicios)
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (e) {
    console.error('Error en deleteUserRoutine:', e);
    return {
      success: false,
      error: e instanceof PostgrestError ? e : e instanceof Error ? e : new Error('Error desconocido en deleteUserRoutine')
    };
  }
};
