import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { QueryResponse } from './supabase-queries';
import { getWorkouts } from './supabase-queries';
import { getBodyMeasurements, getWearableData } from './body-measurements';

// Tipos para objetivos
export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'weight' | 'strength' | 'cardio' | 'nutrition' | 'habit' | 'custom';
  target_value: number;
  current_value: number;
  deadline?: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
};

// Funciones para objetivos
// Función para verificar si la tabla goals existe
export const checkGoalsTable = async (): Promise<boolean> => {
  try {
    // Intentar hacer una consulta simple a la tabla goals
    const { data, error } = await supabase
      .from('goals')
      .select('id')
      .limit(1);

    // Si no hay error, la tabla existe
    return !error;
  } catch (e) {
    console.error('Error al verificar tabla goals:', e);
    return false;
  }
};

// Función para obtener objetivos
export const getGoals = async (
  userId: string,
  options?: {
    category?: string;
    completed?: boolean;
    orderBy?: { column: string; ascending: boolean };
  }
): Promise<QueryResponse<Goal[]>> => {
  try {
    // Verificar si la tabla existe
    const tableExists = await checkGoalsTable();
    if (!tableExists) {
      console.warn('La tabla goals no existe o no es accesible');
      return { data: [], error: new Error('La tabla goals no existe o no es accesible') };
    }

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    // Filtrar por categoría si se proporciona
    if (options?.category) {
      query = query.eq('category', options.category);
    }

    // Filtrar por estado de completado si se proporciona
    if (options?.completed !== undefined) {
      query = query.eq('completed', options.completed);
    }

    // Aplicar ordenamiento si se proporciona
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
    } else {
      // Por defecto, ordenar por fecha de creación descendente
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    // Si hay un error, devolver un array vacío para evitar errores en el cliente
    if (error) {
      console.error(`Error en getGoals para userId=${userId}:`, error);
      return { data: [], error };
    }

    return { data: data as Goal[], error: null };
  } catch (e) {
    console.error(`Error en getGoals para userId=${userId}:`, e);
    return {
      data: [],
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getGoals')
    };
  }
};

export const getGoalById = async (id: string): Promise<QueryResponse<Goal>> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Goal, error };
  } catch (e) {
    console.error(`Error en getGoalById para id=${id}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getGoalById')
    };
  }
};

export const createGoal = async (
  goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>
): Promise<QueryResponse<Goal>> => {
  try {
    // Verificar si la tabla existe
    const tableExists = await checkGoalsTable();
    if (!tableExists) {
      console.warn('La tabla goals no existe o no es accesible');
      return { data: null, error: new Error('La tabla goals no existe o no es accesible') };
    }

    // Validar datos del objetivo
    if (!goal.title || !goal.title.trim()) {
      return { data: null, error: new Error('El título del objetivo es obligatorio') };
    }

    if (!goal.target_value || goal.target_value <= 0) {
      return { data: null, error: new Error('El valor objetivo debe ser mayor que cero') };
    }

    if (goal.current_value < 0) {
      goal.current_value = 0; // Asegurar que el valor actual no sea negativo
    }

    // Asegurar que la categoría es válida
    if (!['weight', 'strength', 'cardio', 'nutrition', 'habit', 'custom'].includes(goal.category)) {
      goal.category = 'custom'; // Establecer categoría por defecto si no es válida
    }

    // Crear el objetivo
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        ...goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear objetivo:', error);
      return { data: null, error };
    }

    return { data: data as Goal, error: null };
  } catch (e) {
    console.error('Error en createGoal:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en createGoal')
    };
  }
};

export const updateGoal = async (
  id: string,
  updates: Partial<Goal>
): Promise<QueryResponse<Goal>> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data: data as Goal, error };
  } catch (e) {
    console.error(`Error en updateGoal para id=${id}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en updateGoal')
    };
  }
};

export const deleteGoal = async (
  id: string
): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteGoal para id=${id}:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en deleteGoal')
    };
  }
};

// Función para actualizar automáticamente el progreso de los objetivos
export const updateGoalProgress = async (
  userId: string,
  goalId?: string
): Promise<QueryResponse<Goal[]>> => {
  try {
    // Verificar si la tabla existe
    const tableExists = await checkGoalsTable();
    if (!tableExists) {
      console.warn('La tabla goals no existe o no es accesible');
      return { data: [], error: new Error('La tabla goals no existe o no es accesible') };
    }

    // Obtener objetivos a actualizar
    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false);

    if (goalId) {
      query = query.eq('id', goalId);
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error(`Error al obtener objetivos para userId=${userId}:`, error);
      return { data: [], error };
    }

    if (!goals || goals.length === 0) {
      return { data: [], error: null };
    }

    const updatedGoals: Goal[] = [];
    const updatePromises = goals.map(async (goal: Goal) => {
      let currentValue = goal.current_value;
      let completed = goal.completed;

      // Actualizar el valor actual según la categoría del objetivo
      switch (goal.category) {
        case 'weight':
          // Obtener la medida de peso más reciente
          const { data: measurements } = await getBodyMeasurements(userId, {
            limit: 1,
            orderBy: { column: 'date', ascending: false }
          });
          if (measurements && measurements.length > 0 && measurements[0].weight) {
            currentValue = measurements[0].weight;
          }
          break;

        case 'strength':
          // Para objetivos de fuerza, podríamos buscar el peso máximo levantado en un ejercicio específico
          // Esto requeriría información adicional en el objetivo, como el ejercicio específico
          break;

        case 'cardio':
          // Para objetivos de cardio, podríamos buscar la distancia recorrida o tiempo de actividad
          // Obtener datos de wearables para cardio
          const { data: wearableData } = await getWearableData(userId, {
            limit: 7 // Últimos 7 días
          });
          if (wearableData && wearableData.length > 0) {
            // Sumar minutos activos de los últimos 7 días
            const activeMinutes = wearableData.reduce((sum, data) =>
              sum + (data.active_minutes || 0), 0);
            currentValue = activeMinutes;
          }
          break;

        case 'nutrition':
          // Para objetivos de nutrición, podríamos buscar el consumo de calorías o macronutrientes
          break;

        case 'habit':
          // Para objetivos de hábitos, podríamos contar la frecuencia de una actividad
          // Por ejemplo, días consecutivos de entrenamiento
          const { data: workouts } = await getWorkouts(userId, {
            limit: 30, // Últimos 30 días
            orderBy: { column: 'date', ascending: false }
          });
          if (workouts) {
            // Contar entrenamientos en los últimos 30 días
            currentValue = workouts.length;
          }
          break;

        default:
          // Para objetivos personalizados, mantener el valor actual
          break;
      }

      // Verificar si el objetivo se ha completado
      if (goal.category === 'weight') {
        // Para peso, el objetivo puede ser reducir (target < inicial) o aumentar (target > inicial)
        const isWeightLossGoal = goal.target_value < goal.current_value;
        completed = isWeightLossGoal
          ? currentValue <= goal.target_value
          : currentValue >= goal.target_value;
      } else {
        // Para otros objetivos, se completa cuando se alcanza o supera el valor objetivo
        completed = currentValue >= goal.target_value;
      }

      // Actualizar el objetivo en la base de datos
      if (currentValue !== goal.current_value || completed !== goal.completed) {
        const { data: updatedGoal, error: updateError } = await supabase
          .from('goals')
          .update({ current_value: currentValue, completed, updated_at: new Date().toISOString() })
          .eq('id', goal.id)
          .select()
          .single();

        if (updateError) {
          console.error(`Error al actualizar objetivo ${goal.id}:`, updateError);
        } else if (updatedGoal) {
          updatedGoals.push(updatedGoal as Goal);
        }
      } else {
        updatedGoals.push(goal as Goal);
      }
    });

    await Promise.all(updatePromises);

    return { data: updatedGoals, error: null };
  } catch (e) {
    console.error(`Error en updateGoalProgress para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en updateGoalProgress')
    };
  }
};

// Función para sugerir objetivos basados en el perfil y actividad del usuario
export const suggestGoals = async (
  userId: string
): Promise<QueryResponse<Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]>> => {
  try {
    // Verificar si la tabla de perfiles existe
    try {
      const { error: profileTableError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);

      if (profileTableError) {
        console.warn('La tabla profiles no existe o no es accesible');
        // Devolver objetivos predeterminados si no hay perfil
        return {
          data: [
            {
              title: 'Completar 10 entrenamientos',
              description: 'Establece una rutina regular de ejercicio',
              category: 'habit',
              target_value: 10,
              current_value: 0,
              completed: false
            },
            {
              title: 'Aumentar actividad cardiovascular',
              description: 'Incrementar minutos de actividad cardio semanal',
              category: 'cardio',
              target_value: 150, // 150 minutos semanales (recomendación OMS)
              current_value: 0,
              completed: false
            }
          ],
          error: null
        };
      }
    } catch (e) {
      console.error('Error al verificar tabla profiles:', e);
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('weight, height, goal, level')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.warn(`No se encontró perfil para userId=${userId}:`, profileError);
      // Devolver objetivos predeterminados si no hay perfil
      return {
        data: [
          {
            title: 'Completar 10 entrenamientos',
            description: 'Establece una rutina regular de ejercicio',
            category: 'habit',
            target_value: 10,
            current_value: 0,
            completed: false
          },
          {
            title: 'Aumentar actividad cardiovascular',
            description: 'Incrementar minutos de actividad cardio semanal',
            category: 'cardio',
            target_value: 150, // 150 minutos semanales (recomendación OMS)
            current_value: 0,
            completed: false
          }
        ],
        error: null
      };
    }

    // Obtener medidas corporales recientes
    const { data: measurements } = await getBodyMeasurements(userId, {
      limit: 1,
      orderBy: { column: 'date', ascending: false }
    });

    // Obtener entrenamientos recientes
    const { data: workouts } = await getWorkouts(userId, {
      limit: 10,
      orderBy: { column: 'date', ascending: false }
    });

    // Generar sugerencias de objetivos basadas en los datos del usuario
    const suggestedGoals: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>[] = [];

    // Objetivo de peso basado en el perfil y medidas
    if (profile?.goal === 'lose_weight' && (profile?.weight || (measurements && measurements[0]?.weight))) {
      const currentWeight = measurements && measurements[0]?.weight ? measurements[0].weight : profile.weight;
      if (currentWeight) {
        suggestedGoals.push({
          title: 'Perder peso',
          description: 'Reducir tu peso corporal de forma saludable',
          category: 'weight',
          target_value: currentWeight * 0.95, // Sugerir perder 5%
          current_value: currentWeight,
          completed: false
        });
      }
    } else if (profile?.goal === 'build_muscle' && (profile?.weight || (measurements && measurements[0]?.weight))) {
      const currentWeight = measurements && measurements[0]?.weight ? measurements[0].weight : profile.weight;
      if (currentWeight) {
        suggestedGoals.push({
          title: 'Aumentar masa muscular',
          description: 'Incrementar tu peso corporal con masa muscular',
          category: 'weight',
          target_value: currentWeight * 1.05, // Sugerir ganar 5%
          current_value: currentWeight,
          completed: false
        });
      }
    }

    // Objetivo de actividad física basado en entrenamientos recientes
    if (workouts) {
      const workoutCount = workouts.length;
      suggestedGoals.push({
        title: 'Consistencia en entrenamientos',
        description: 'Mantener una rutina regular de ejercicio',
        category: 'habit',
        target_value: workoutCount + 8, // 8 entrenamientos más
        current_value: workoutCount,
        completed: false
      });
    }

    // Objetivo de cardio
    suggestedGoals.push({
      title: 'Aumentar actividad cardiovascular',
      description: 'Incrementar minutos de actividad cardio semanal',
      category: 'cardio',
      target_value: 150, // 150 minutos semanales (recomendación OMS)
      current_value: 0,
      completed: false
    });

    // Asegurarse de que siempre devolvemos al menos un objetivo sugerido
    if (suggestedGoals.length === 0) {
      suggestedGoals.push({
        title: 'Completar 10 entrenamientos',
        description: 'Establece una rutina regular de ejercicio',
        category: 'habit',
        target_value: 10,
        current_value: 0,
        completed: false
      });
    }

    return { data: suggestedGoals, error: null };
  } catch (e) {
    console.error(`Error en suggestGoals para userId=${userId}:`, e);
    // Devolver objetivos predeterminados en caso de error
    return {
      data: [
        {
          title: 'Completar 10 entrenamientos',
          description: 'Establece una rutina regular de ejercicio',
          category: 'habit',
          target_value: 10,
          current_value: 0,
          completed: false
        },
        {
          title: 'Aumentar actividad cardiovascular',
          description: 'Incrementar minutos de actividad cardio semanal',
          category: 'cardio',
          target_value: 150,
          current_value: 0,
          completed: false
        }
      ],
      error: null
    };
  }
};
