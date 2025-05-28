/**
 * Servicio para gestionar ejercicios para principiantes absolutos en fitness
 */

import { supabase } from '@/lib/supabase-client';
import { 
  BeginnerExercise, 
  DifficultyLevel, 
  ExerciseType, 
  MuscleGroup, 
  RequiredEquipment 
} from '@/lib/types/beginner-training';

/**
 * Obtiene todos los ejercicios para principiantes
 * @returns Lista de ejercicios o null si hay error
 */
export async function getAllBeginnerExercises(): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Error al obtener ejercicios para principiantes:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getAllBeginnerExercises:', error);
    return null;
  }
}

/**
 * Obtiene un ejercicio por su ID
 * @param exerciseId - ID del ejercicio
 * @returns Ejercicio o null si no existe
 */
export async function getBeginnerExerciseById(exerciseId: string): Promise<BeginnerExercise | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      console.error('Error al obtener ejercicio para principiantes:', error);
      return null;
    }

    return data as BeginnerExercise;
  } catch (error) {
    console.error('Error en getBeginnerExerciseById:', error);
    return null;
  }
}

/**
 * Filtra ejercicios por dificultad
 * @param difficulty - Nivel de dificultad
 * @returns Lista de ejercicios filtrados o null si hay error
 */
export async function getExercisesByDifficulty(difficulty: DifficultyLevel): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .eq('difficulty', difficulty)
      .order('name');

    if (error) {
      console.error('Error al filtrar ejercicios por dificultad:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getExercisesByDifficulty:', error);
    return null;
  }
}

/**
 * Filtra ejercicios por tipo
 * @param type - Tipo de ejercicio
 * @returns Lista de ejercicios filtrados o null si hay error
 */
export async function getExercisesByType(type: ExerciseType): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .eq('type', type)
      .order('difficulty');

    if (error) {
      console.error('Error al filtrar ejercicios por tipo:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getExercisesByType:', error);
    return null;
  }
}

/**
 * Filtra ejercicios por grupo muscular
 * @param muscleGroup - Grupo muscular
 * @param isPrimary - Si es un grupo muscular primario o secundario
 * @returns Lista de ejercicios filtrados o null si hay error
 */
export async function getExercisesByMuscleGroup(
  muscleGroup: MuscleGroup, 
  isPrimary: boolean = true
): Promise<BeginnerExercise[] | null> {
  try {
    const field = isPrimary ? 'muscles->primary' : 'muscles->secondary';
    
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .contains(field, [muscleGroup])
      .order('difficulty');

    if (error) {
      console.error('Error al filtrar ejercicios por grupo muscular:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getExercisesByMuscleGroup:', error);
    return null;
  }
}

/**
 * Filtra ejercicios por equipamiento
 * @param equipment - Equipamiento requerido
 * @returns Lista de ejercicios filtrados o null si hay error
 */
export async function getExercisesByEquipment(equipment: RequiredEquipment): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .contains('equipment', [equipment])
      .order('difficulty');

    if (error) {
      console.error('Error al filtrar ejercicios por equipamiento:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getExercisesByEquipment:', error);
    return null;
  }
}

/**
 * Obtiene ejercicios sin equipamiento
 * @returns Lista de ejercicios sin equipamiento o null si hay error
 */
export async function getBodyweightExercises(): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .contains('equipment', ['none'])
      .order('difficulty');

    if (error) {
      console.error('Error al obtener ejercicios sin equipamiento:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getBodyweightExercises:', error);
    return null;
  }
}

/**
 * Busca ejercicios por nombre o descripción
 * @param query - Texto a buscar
 * @returns Lista de ejercicios que coinciden con la búsqueda o null si hay error
 */
export async function searchExercises(query: string): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('difficulty');

    if (error) {
      console.error('Error al buscar ejercicios:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en searchExercises:', error);
    return null;
  }
}

/**
 * Obtiene ejercicios recomendados para principiantes absolutos
 * @returns Lista de ejercicios recomendados o null si hay error
 */
export async function getRecommendedExercisesForBeginners(): Promise<BeginnerExercise[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_exercises')
      .select('*')
      .in('difficulty', ['level_0', 'level_1'])
      .order('difficulty');

    if (error) {
      console.error('Error al obtener ejercicios recomendados para principiantes:', error);
      return null;
    }

    return data as BeginnerExercise[];
  } catch (error) {
    console.error('Error en getRecommendedExercisesForBeginners:', error);
    return null;
  }
}
