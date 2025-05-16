import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { Exercise } from './supabase';
import { QueryResponse } from './supabase-queries';

// Tipos para rutinas de entrenamiento
export type WorkoutRoutineExercise = {
  exercise_id: string;
  sets: number;
  reps: string;
  rest: number;
  weight?: string;
  notes?: string;
  exercise?: Exercise; // Para incluir los detalles del ejercicio
};

export type WorkoutRoutine = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_template: boolean;
  exercises: WorkoutRoutineExercise[];
  created_at: string;
  updated_at?: string;
};

// Funciones para obtener rutinas de entrenamiento
export const getWorkoutRoutines = async (
  userId: string,
  options?: {
    includeTemplates?: boolean;
    includeExerciseDetails?: boolean;
  }
): Promise<QueryResponse<WorkoutRoutine[]>> => {
  try {
    let query = supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId);

    if (options?.includeTemplates) {
      query = supabase
        .from('workout_routines')
        .select('*')
        .or(`user_id.eq.${userId},is_template.eq.true`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    let routines = data as WorkoutRoutine[];

    // Si se solicitan detalles de ejercicios, obtenerlos
    if (options?.includeExerciseDetails && routines.length > 0) {
      // Obtener todos los IDs de ejercicios únicos
      const exerciseIds = new Set<string>();
      routines.forEach(routine => {
        routine.exercises.forEach(ex => {
          exerciseIds.add(ex.exercise_id);
        });
      });

      // Obtener detalles de todos los ejercicios
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', Array.from(exerciseIds));

      if (exercisesError) {
        console.error('Error al obtener detalles de ejercicios:', exercisesError);
      } else if (exercisesData) {
        // Crear un mapa de ejercicios para búsqueda rápida
        const exercisesMap = new Map<string, Exercise>();
        exercisesData.forEach(ex => {
          exercisesMap.set(ex.id, ex as Exercise);
        });

        // Añadir detalles de ejercicios a cada rutina
        routines = routines.map(routine => ({
          ...routine,
          exercises: routine.exercises.map(ex => ({
            ...ex,
            exercise: exercisesMap.get(ex.exercise_id)
          }))
        }));
      }
    }

    return { data: routines, error: null };
  } catch (e) {
    console.error('Error en getWorkoutRoutines:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getWorkoutRoutines')
    };
  }
};

export const getWorkoutRoutineById = async (
  id: string,
  options?: {
    includeExerciseDetails?: boolean;
  }
): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    let routine = data as WorkoutRoutine;

    // Si se solicitan detalles de ejercicios, obtenerlos
    if (options?.includeExerciseDetails) {
      // Obtener todos los IDs de ejercicios únicos
      const exerciseIds = routine.exercises.map(ex => ex.exercise_id);

      // Obtener detalles de todos los ejercicios
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

      if (exercisesError) {
        console.error('Error al obtener detalles de ejercicios:', exercisesError);
      } else if (exercisesData) {
        // Crear un mapa de ejercicios para búsqueda rápida
        const exercisesMap = new Map<string, Exercise>();
        exercisesData.forEach(ex => {
          exercisesMap.set(ex.id, ex as Exercise);
        });

        // Añadir detalles de ejercicios a la rutina
        routine = {
          ...routine,
          exercises: routine.exercises.map(ex => ({
            ...ex,
            exercise: exercisesMap.get(ex.exercise_id)
          }))
        };
      }
    }

    return { data: routine, error: null };
  } catch (e) {
    console.error(`Error en getWorkoutRoutineById para id=${id}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getWorkoutRoutineById')
    };
  }
};

export const createWorkoutRoutine = async (
  routine: Omit<WorkoutRoutine, 'id' | 'created_at'>
): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    const { data, error } = await supabase
      .from('workout_routines')
      .insert([routine])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as WorkoutRoutine, error: null };
  } catch (e) {
    console.error('Error en createWorkoutRoutine:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en createWorkoutRoutine')
    };
  }
};

export const updateWorkoutRoutine = async (
  id: string,
  updates: Partial<WorkoutRoutine>
): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    const { data, error } = await supabase
      .from('workout_routines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as WorkoutRoutine, error: null };
  } catch (e) {
    console.error(`Error en updateWorkoutRoutine para id=${id}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en updateWorkoutRoutine')
    };
  }
};

export const deleteWorkoutRoutine = async (
  id: string
): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteWorkoutRoutine para id=${id}:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en deleteWorkoutRoutine')
    };
  }
};

// Función para recomendar rutinas basadas en el nivel y objetivos del usuario
export const recommendWorkoutRoutines = async (
  userId: string,
  options?: {
    level?: string;
    goal?: string;
    includeExerciseDetails?: boolean;
  }
): Promise<QueryResponse<WorkoutRoutine[]>> => {
  try {
    // Primero obtenemos el perfil del usuario si no se proporcionan opciones
    if (!options?.level || !options?.goal) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, goal')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error al obtener perfil del usuario:', profileError);
      } else if (profile) {
        options = {
          ...options,
          level: options?.level || profile.level,
          goal: options?.goal || profile.goal
        };
      }
    }

    // Obtener rutinas de plantilla que coincidan con el nivel del usuario
    let query = supabase
      .from('workout_routines')
      .select('*')
      .eq('is_template', true);

    if (options?.level) {
      query = query.eq('level', options.level);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    let routines = data as WorkoutRoutine[];

    // Si se solicitan detalles de ejercicios, obtenerlos
    if (options?.includeExerciseDetails && routines.length > 0) {
      // Obtener todos los IDs de ejercicios únicos
      const exerciseIds = new Set<string>();
      routines.forEach(routine => {
        routine.exercises.forEach(ex => {
          exerciseIds.add(ex.exercise_id);
        });
      });

      // Obtener detalles de todos los ejercicios
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', Array.from(exerciseIds));

      if (exercisesError) {
        console.error('Error al obtener detalles de ejercicios:', exercisesError);
      } else if (exercisesData) {
        // Crear un mapa de ejercicios para búsqueda rápida
        const exercisesMap = new Map<string, Exercise>();
        exercisesData.forEach(ex => {
          exercisesMap.set(ex.id, ex as Exercise);
        });

        // Añadir detalles de ejercicios a cada rutina
        routines = routines.map(routine => ({
          ...routine,
          exercises: routine.exercises.map(ex => ({
            ...ex,
            exercise: exercisesMap.get(ex.exercise_id)
          }))
        }));
      }
    }

    return { data: routines, error: null };
  } catch (e) {
    console.error('Error en recommendWorkoutRoutines:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en recommendWorkoutRoutines')
    };
  }
};
