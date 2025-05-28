/**
 * Servicio para gestionar el entrenamiento avanzado
 * Incluye funciones para manejar macrociclos, mesociclos, microciclos y sesiones
 */

import { supabase } from '@/lib/supabase-client';
import { 
  Macrocycle, 
  Mesocycle, 
  Microcycle, 
  AdvancedTrainingSession,
  AdvancedExerciseConfig,
  AdvancedTechniqueConfig,
  AdvancedTrainingProfile,
  PeriodizationModel,
  AdvancedTrainingGoal,
  TrainingPhase
} from '@/lib/types/advanced-training';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obtiene todos los macrociclos de un usuario
 * @param userId - ID del usuario
 * @returns Lista de macrociclos o null si hay error
 */
export async function getUserMacrocycles(userId: string): Promise<Macrocycle[] | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_macrocycles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener macrociclos:', error);
      return null;
    }

    return data as Macrocycle[];
  } catch (error) {
    console.error('Error en getUserMacrocycles:', error);
    return null;
  }
}

/**
 * Obtiene un macrociclo por su ID
 * @param macrocycleId - ID del macrociclo
 * @returns Macrociclo o null si no existe
 */
export async function getMacrocycleById(macrocycleId: string): Promise<Macrocycle | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_macrocycles')
      .select('*')
      .eq('id', macrocycleId)
      .single();

    if (error) {
      console.error('Error al obtener macrociclo:', error);
      return null;
    }

    return data as Macrocycle;
  } catch (error) {
    console.error('Error en getMacrocycleById:', error);
    return null;
  }
}

/**
 * Crea un nuevo macrociclo
 * @param macrocycle - Datos del macrociclo
 * @returns Macrociclo creado o null si hay error
 */
export async function createMacrocycle(macrocycle: Omit<Macrocycle, 'id' | 'created_at' | 'updated_at'>): Promise<Macrocycle | null> {
  try {
    const newMacrocycle = {
      ...macrocycle,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('advanced_macrocycles')
      .insert(newMacrocycle)
      .select()
      .single();

    if (error) {
      console.error('Error al crear macrociclo:', error);
      return null;
    }

    return data as Macrocycle;
  } catch (error) {
    console.error('Error en createMacrocycle:', error);
    return null;
  }
}

/**
 * Actualiza un macrociclo existente
 * @param macrocycleId - ID del macrociclo
 * @param updates - Datos a actualizar
 * @returns Macrociclo actualizado o null si hay error
 */
export async function updateMacrocycle(macrocycleId: string, updates: Partial<Macrocycle>): Promise<Macrocycle | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_macrocycles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', macrocycleId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar macrociclo:', error);
      return null;
    }

    return data as Macrocycle;
  } catch (error) {
    console.error('Error en updateMacrocycle:', error);
    return null;
  }
}

/**
 * Elimina un macrociclo
 * @param macrocycleId - ID del macrociclo
 * @returns true si se eliminó correctamente, false si hubo error
 */
export async function deleteMacrocycle(macrocycleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('advanced_macrocycles')
      .delete()
      .eq('id', macrocycleId);

    if (error) {
      console.error('Error al eliminar macrociclo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en deleteMacrocycle:', error);
    return false;
  }
}

/**
 * Obtiene todos los mesociclos de un macrociclo
 * @param macrocycleId - ID del macrociclo
 * @returns Lista de mesociclos o null si hay error
 */
export async function getMesocyclesByMacrocycle(macrocycleId: string): Promise<Mesocycle[] | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_mesocycles')
      .select('*')
      .eq('macrocycle_id', macrocycleId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error al obtener mesociclos:', error);
      return null;
    }

    return data as Mesocycle[];
  } catch (error) {
    console.error('Error en getMesocyclesByMacrocycle:', error);
    return null;
  }
}

/**
 * Crea un nuevo mesociclo
 * @param mesocycle - Datos del mesociclo
 * @returns Mesociclo creado o null si hay error
 */
export async function createMesocycle(mesocycle: Omit<Mesocycle, 'id' | 'created_at' | 'updated_at'>): Promise<Mesocycle | null> {
  try {
    const newMesocycle = {
      ...mesocycle,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('advanced_mesocycles')
      .insert(newMesocycle)
      .select()
      .single();

    if (error) {
      console.error('Error al crear mesociclo:', error);
      return null;
    }

    return data as Mesocycle;
  } catch (error) {
    console.error('Error en createMesocycle:', error);
    return null;
  }
}

/**
 * Obtiene todos los microciclos de un mesociclo
 * @param mesocycleId - ID del mesociclo
 * @returns Lista de microciclos o null si hay error
 */
export async function getMicrocyclesByMesocycle(mesocycleId: string): Promise<Microcycle[] | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_microcycles')
      .select('*')
      .eq('mesocycle_id', mesocycleId)
      .order('week_number', { ascending: true });

    if (error) {
      console.error('Error al obtener microciclos:', error);
      return null;
    }

    return data as Microcycle[];
  } catch (error) {
    console.error('Error en getMicrocyclesByMesocycle:', error);
    return null;
  }
}

/**
 * Crea un nuevo microciclo
 * @param microcycle - Datos del microciclo
 * @returns Microciclo creado o null si hay error
 */
export async function createMicrocycle(microcycle: Omit<Microcycle, 'id' | 'created_at' | 'updated_at'>): Promise<Microcycle | null> {
  try {
    const newMicrocycle = {
      ...microcycle,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('advanced_microcycles')
      .insert(newMicrocycle)
      .select()
      .single();

    if (error) {
      console.error('Error al crear microciclo:', error);
      return null;
    }

    return data as Microcycle;
  } catch (error) {
    console.error('Error en createMicrocycle:', error);
    return null;
  }
}

/**
 * Obtiene todas las sesiones de entrenamiento de un microciclo
 * @param microcycleId - ID del microciclo
 * @returns Lista de sesiones o null si hay error
 */
export async function getSessionsByMicrocycle(microcycleId: string): Promise<AdvancedTrainingSession[] | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_training_sessions')
      .select('*')
      .eq('microcycle_id', microcycleId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error al obtener sesiones:', error);
      return null;
    }

    return data as AdvancedTrainingSession[];
  } catch (error) {
    console.error('Error en getSessionsByMicrocycle:', error);
    return null;
  }
}

/**
 * Crea una nueva sesión de entrenamiento
 * @param session - Datos de la sesión
 * @returns Sesión creada o null si hay error
 */
export async function createTrainingSession(session: Omit<AdvancedTrainingSession, 'id' | 'created_at' | 'updated_at'>): Promise<AdvancedTrainingSession | null> {
  try {
    const newSession = {
      ...session,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('advanced_training_sessions')
      .insert(newSession)
      .select()
      .single();

    if (error) {
      console.error('Error al crear sesión de entrenamiento:', error);
      return null;
    }

    return data as AdvancedTrainingSession;
  } catch (error) {
    console.error('Error en createTrainingSession:', error);
    return null;
  }
}

/**
 * Obtiene el perfil de entrenamiento avanzado de un usuario
 * @param userId - ID del usuario
 * @returns Perfil de entrenamiento o null si no existe
 */
export async function getAdvancedTrainingProfile(userId: string): Promise<AdvancedTrainingProfile | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_training_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener perfil de entrenamiento avanzado:', error);
      return null;
    }

    return data as AdvancedTrainingProfile;
  } catch (error) {
    console.error('Error en getAdvancedTrainingProfile:', error);
    return null;
  }
}

/**
 * Crea o actualiza el perfil de entrenamiento avanzado de un usuario
 * @param profile - Datos del perfil
 * @returns Perfil actualizado o null si hay error
 */
export async function updateAdvancedTrainingProfile(profile: Partial<AdvancedTrainingProfile> & { user_id: string }): Promise<AdvancedTrainingProfile | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_training_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar perfil de entrenamiento avanzado:', error);
      return null;
    }

    return data as AdvancedTrainingProfile;
  } catch (error) {
    console.error('Error en updateAdvancedTrainingProfile:', error);
    return null;
  }
}
