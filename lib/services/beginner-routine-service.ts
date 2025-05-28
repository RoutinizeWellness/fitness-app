/**
 * Servicio para gestionar rutinas de entrenamiento para principiantes absolutos en fitness
 */

import { supabase } from '@/lib/supabase-client';
import { 
  BeginnerRoutine, 
  DifficultyLevel, 
  TrainingType, 
  RequiredEquipment 
} from '@/lib/types/beginner-training';

/**
 * Obtiene todas las rutinas para principiantes
 * @returns Lista de rutinas o null si hay error
 */
export async function getAllBeginnerRoutines(): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Error al obtener rutinas para principiantes:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getAllBeginnerRoutines:', error);
    return null;
  }
}

/**
 * Obtiene una rutina por su ID
 * @param routineId - ID de la rutina
 * @returns Rutina o null si no existe
 */
export async function getBeginnerRoutineById(routineId: string): Promise<BeginnerRoutine | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (error) {
      console.error('Error al obtener rutina para principiantes:', error);
      return null;
    }

    return data as BeginnerRoutine;
  } catch (error) {
    console.error('Error en getBeginnerRoutineById:', error);
    return null;
  }
}

/**
 * Filtra rutinas por dificultad
 * @param difficulty - Nivel de dificultad
 * @returns Lista de rutinas filtradas o null si hay error
 */
export async function getRoutinesByDifficulty(difficulty: DifficultyLevel): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .eq('difficulty', difficulty)
      .order('name');

    if (error) {
      console.error('Error al filtrar rutinas por dificultad:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getRoutinesByDifficulty:', error);
    return null;
  }
}

/**
 * Filtra rutinas por tipo de entrenamiento
 * @param type - Tipo de entrenamiento
 * @returns Lista de rutinas filtradas o null si hay error
 */
export async function getRoutinesByType(type: TrainingType): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .eq('type', type)
      .order('difficulty');

    if (error) {
      console.error('Error al filtrar rutinas por tipo:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getRoutinesByType:', error);
    return null;
  }
}

/**
 * Filtra rutinas por duración
 * @param maxDuration - Duración máxima en minutos
 * @returns Lista de rutinas filtradas o null si hay error
 */
export async function getRoutinesByDuration(maxDuration: number): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .lte('duration', maxDuration)
      .order('duration');

    if (error) {
      console.error('Error al filtrar rutinas por duración:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getRoutinesByDuration:', error);
    return null;
  }
}

/**
 * Filtra rutinas por equipamiento
 * @param equipment - Equipamiento disponible
 * @returns Lista de rutinas filtradas o null si hay error
 */
export async function getRoutinesByEquipment(equipment: RequiredEquipment[]): Promise<BeginnerRoutine[] | null> {
  try {
    // Obtener todas las rutinas
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .order('difficulty');

    if (error) {
      console.error('Error al obtener rutinas:', error);
      return null;
    }

    // Filtrar rutinas que solo requieren el equipamiento disponible
    const filteredRoutines = data.filter(routine => {
      return routine.equipment_needed.every(item => equipment.includes(item as RequiredEquipment));
    });

    return filteredRoutines as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getRoutinesByEquipment:', error);
    return null;
  }
}

/**
 * Obtiene rutinas sin equipamiento
 * @returns Lista de rutinas sin equipamiento o null si hay error
 */
export async function getBodyweightRoutines(): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .contains('equipment_needed', ['none'])
      .order('difficulty');

    if (error) {
      console.error('Error al obtener rutinas sin equipamiento:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getBodyweightRoutines:', error);
    return null;
  }
}

/**
 * Busca rutinas por nombre o descripción
 * @param query - Texto a buscar
 * @returns Lista de rutinas que coinciden con la búsqueda o null si hay error
 */
export async function searchRoutines(query: string): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('difficulty');

    if (error) {
      console.error('Error al buscar rutinas:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en searchRoutines:', error);
    return null;
  }
}

/**
 * Obtiene rutinas recomendadas para principiantes absolutos
 * @returns Lista de rutinas recomendadas o null si hay error
 */
export async function getRecommendedRoutinesForBeginners(): Promise<BeginnerRoutine[] | null> {
  try {
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .in('difficulty', ['level_0', 'level_1'])
      .order('difficulty');

    if (error) {
      console.error('Error al obtener rutinas recomendadas para principiantes:', error);
      return null;
    }

    return data as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getRecommendedRoutinesForBeginners:', error);
    return null;
  }
}

/**
 * Obtiene rutinas adecuadas para usuarios con limitaciones específicas
 * @param limitations - Lista de limitaciones
 * @returns Lista de rutinas adecuadas o null si hay error
 */
export async function getRoutinesForLimitations(limitations: string[]): Promise<BeginnerRoutine[] | null> {
  try {
    // Obtener todas las rutinas
    const { data, error } = await supabase
      .from('beginner_routines')
      .select('*')
      .order('difficulty');

    if (error) {
      console.error('Error al obtener rutinas:', error);
      return null;
    }

    // Filtrar rutinas adecuadas para las limitaciones
    const filteredRoutines = data.filter(routine => {
      return limitations.every(limitation => 
        routine.suitable_for.limitations.includes(limitation)
      );
    });

    return filteredRoutines as BeginnerRoutine[];
  } catch (error) {
    console.error('Error en getRoutinesForLimitations:', error);
    return null;
  }
}
