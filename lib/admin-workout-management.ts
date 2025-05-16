import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';

// Tipos para rutinas y ejercicios
export interface WorkoutRoutine {
  id: string;
  user_id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general';
  frequency: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  is_template: boolean;
  days: WorkoutDay[];
}

export interface WorkoutDay {
  id: string;
  routine_id: string;
  name: string;
  day_number: number;
  focus: string;
  notes: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  day_id: string;
  exercise_id: string;
  exercise_name: string;
  exercise_type: string;
  muscle_group: string;
  order: number;
  sets: WorkoutSet[];
  rest_time: number;
  notes: string;
  alternatives: string[];
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  rir: number;
  is_warmup: boolean;
  is_dropset: boolean;
  tempo: string;
  completed: boolean;
  actual_reps?: number;
  actual_weight?: number;
  actual_rir?: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: string;
  muscle_group: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  video_url?: string;
  image_url?: string;
  alternatives: string[];
}

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Obtiene todas las rutinas de un usuario
 */
export const getUserWorkoutRoutines = async (
  userId: string
): Promise<QueryResponse<WorkoutRoutine[]>> => {
  try {
    // Obtener rutinas
    const { data: routines, error: routinesError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (routinesError) throw routinesError;
    
    if (!routines || routines.length === 0) {
      return { data: [], error: null };
    }
    
    // Obtener días de entrenamiento para cada rutina
    const routineIds = routines.map(routine => routine.id);
    const { data: days, error: daysError } = await supabase
      .from('workout_days')
      .select('*')
      .in('routine_id', routineIds)
      .order('day_number', { ascending: true });
    
    if (daysError) throw daysError;
    
    // Obtener ejercicios para cada día
    const dayIds = days?.map(day => day.id) || [];
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('day_id', dayIds)
      .order('order', { ascending: true });
    
    if (exercisesError) throw exercisesError;
    
    // Obtener series para cada ejercicio
    const exerciseIds = exercises?.map(exercise => exercise.id) || [];
    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')
      .in('exercise_id', exerciseIds)
      .order('set_number', { ascending: true });
    
    if (setsError) throw setsError;
    
    // Construir rutinas completas
    const completeRoutines: WorkoutRoutine[] = routines.map(routine => {
      const routineDays = days?.filter(day => day.routine_id === routine.id) || [];
      
      const completeDays: WorkoutDay[] = routineDays.map(day => {
        const dayExercises = exercises?.filter(exercise => exercise.day_id === day.id) || [];
        
        const completeExercises: WorkoutExercise[] = dayExercises.map(exercise => {
          const exerciseSets = sets?.filter(set => set.exercise_id === exercise.id) || [];
          
          return {
            ...exercise,
            sets: exerciseSets
          };
        });
        
        return {
          ...day,
          exercises: completeExercises
        };
      });
      
      return {
        ...routine,
        days: completeDays
      };
    });
    
    return { data: completeRoutines, error: null };
  } catch (e) {
    console.error(`Error en getUserWorkoutRoutines:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getUserWorkoutRoutines`)
    };
  }
};

/**
 * Obtiene una rutina específica con todos sus detalles
 */
export const getWorkoutRoutineDetails = async (
  routineId: string
): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    // Obtener rutina
    const { data: routine, error: routineError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('id', routineId)
      .single();
    
    if (routineError) throw routineError;
    
    // Obtener días de entrenamiento
    const { data: days, error: daysError } = await supabase
      .from('workout_days')
      .select('*')
      .eq('routine_id', routineId)
      .order('day_number', { ascending: true });
    
    if (daysError) throw daysError;
    
    // Obtener ejercicios para cada día
    const dayIds = days?.map(day => day.id) || [];
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('day_id', dayIds)
      .order('order', { ascending: true });
    
    if (exercisesError) throw exercisesError;
    
    // Obtener series para cada ejercicio
    const exerciseIds = exercises?.map(exercise => exercise.id) || [];
    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')
      .in('exercise_id', exerciseIds)
      .order('set_number', { ascending: true });
    
    if (setsError) throw setsError;
    
    // Construir rutina completa
    const completeDays: WorkoutDay[] = days?.map(day => {
      const dayExercises = exercises?.filter(exercise => exercise.day_id === day.id) || [];
      
      const completeExercises: WorkoutExercise[] = dayExercises.map(exercise => {
        const exerciseSets = sets?.filter(set => set.exercise_id === exercise.id) || [];
        
        return {
          ...exercise,
          sets: exerciseSets
        };
      });
      
      return {
        ...day,
        exercises: completeExercises
      };
    }) || [];
    
    const completeRoutine: WorkoutRoutine = {
      ...routine,
      days: completeDays
    };
    
    return { data: completeRoutine, error: null };
  } catch (e) {
    console.error(`Error en getWorkoutRoutineDetails:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getWorkoutRoutineDetails`)
    };
  }
};

/**
 * Actualiza una rutina de entrenamiento
 */
export const updateWorkoutRoutine = async (
  routineId: string,
  routineData: Partial<WorkoutRoutine>
): Promise<QueryResponse<boolean>> => {
  try {
    // Actualizar rutina principal
    const { days, ...routineInfo } = routineData;
    
    if (Object.keys(routineInfo).length > 0) {
      const { error: routineError } = await supabase
        .from('workout_routines')
        .update({
          ...routineInfo,
          updated_at: new Date().toISOString()
        })
        .eq('id', routineId);
      
      if (routineError) throw routineError;
    }
    
    // Si hay días para actualizar
    if (days && days.length > 0) {
      for (const day of days) {
        // Actualizar día
        const { exercises, ...dayInfo } = day;
        
        if (Object.keys(dayInfo).length > 0 && dayInfo.id) {
          const { error: dayError } = await supabase
            .from('workout_days')
            .update(dayInfo)
            .eq('id', dayInfo.id);
          
          if (dayError) throw dayError;
        }
        
        // Si hay ejercicios para actualizar
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            // Actualizar ejercicio
            const { sets, ...exerciseInfo } = exercise;
            
            if (Object.keys(exerciseInfo).length > 0 && exerciseInfo.id) {
              const { error: exerciseError } = await supabase
                .from('workout_exercises')
                .update(exerciseInfo)
                .eq('id', exerciseInfo.id);
              
              if (exerciseError) throw exerciseError;
            }
            
            // Si hay series para actualizar
            if (sets && sets.length > 0) {
              for (const set of sets) {
                if (set.id) {
                  const { error: setError } = await supabase
                    .from('workout_sets')
                    .update(set)
                    .eq('id', set.id);
                  
                  if (setError) throw setError;
                }
              }
            }
          }
        }
      }
    }
    
    return { data: true, error: null };
  } catch (e) {
    console.error(`Error en updateWorkoutRoutine:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en updateWorkoutRoutine`)
    };
  }
};

/**
 * Crea una nueva rutina para un usuario
 */
export const createWorkoutRoutineForUser = async (
  userId: string,
  routineData: Omit<WorkoutRoutine, 'id' | 'created_at' | 'updated_at'>
): Promise<QueryResponse<WorkoutRoutine>> => {
  try {
    // Crear rutina principal
    const { days, ...routineInfo } = routineData;
    
    const { data: newRoutine, error: routineError } = await supabase
      .from('workout_routines')
      .insert({
        ...routineInfo,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (routineError) throw routineError;
    
    // Si hay días para crear
    if (days && days.length > 0) {
      for (const day of days) {
        const { exercises, ...dayInfo } = day;
        
        // Crear día
        const { data: newDay, error: dayError } = await supabase
          .from('workout_days')
          .insert({
            ...dayInfo,
            routine_id: newRoutine.id
          })
          .select()
          .single();
        
        if (dayError) throw dayError;
        
        // Si hay ejercicios para crear
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            const { sets, ...exerciseInfo } = exercise;
            
            // Crear ejercicio
            const { data: newExercise, error: exerciseError } = await supabase
              .from('workout_exercises')
              .insert({
                ...exerciseInfo,
                day_id: newDay.id
              })
              .select()
              .single();
            
            if (exerciseError) throw exerciseError;
            
            // Si hay series para crear
            if (sets && sets.length > 0) {
              for (const set of sets) {
                const { error: setError } = await supabase
                  .from('workout_sets')
                  .insert({
                    ...set,
                    exercise_id: newExercise.id
                  });
                
                if (setError) throw setError;
              }
            }
          }
        }
      }
    }
    
    // Obtener la rutina completa
    const { data: completeRoutine } = await getWorkoutRoutineDetails(newRoutine.id);
    
    return { data: completeRoutine, error: null };
  } catch (e) {
    console.error(`Error en createWorkoutRoutineForUser:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en createWorkoutRoutineForUser`)
    };
  }
};

/**
 * Obtiene ejercicios para sugerir alternativas
 */
export const getExerciseAlternatives = async (
  muscleGroup: string,
  difficulty: string = 'all'
): Promise<QueryResponse<Exercise[]>> => {
  try {
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('muscle_group', muscleGroup);
    
    if (difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (e) {
    console.error(`Error en getExerciseAlternatives:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getExerciseAlternatives`)
    };
  }
};
