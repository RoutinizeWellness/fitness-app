import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { NutritionProfile, WeightLog, FoodPreference } from './types/nutrition';

type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Funciones para el perfil nutricional
export const getNutritionProfile = async (userId: string): Promise<QueryResponse<NutritionProfile>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener perfil nutricional:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const createNutritionProfile = async (profile: Omit<NutritionProfile, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResponse<NutritionProfile>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al crear perfil nutricional:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const updateNutritionProfile = async (userId: string, updates: Partial<NutritionProfile>): Promise<QueryResponse<NutritionProfile>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar perfil nutricional:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Funciones para el registro de peso
export const getWeightLogs = async (
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<QueryResponse<WeightLog[]>> => {
  try {
    let query = supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener registros de peso:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const addWeightLog = async (weightLog: Omit<WeightLog, 'id' | 'created_at'>): Promise<QueryResponse<WeightLog>> => {
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert(weightLog)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al añadir registro de peso:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const updateWeightLog = async (id: string, updates: Partial<WeightLog>): Promise<QueryResponse<WeightLog>> => {
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar registro de peso:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const deleteWeightLog = async (id: string): Promise<QueryResponse<null>> => {
  try {
    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null };
  } catch (error) {
    console.error('Error al eliminar registro de peso:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Funciones para preferencias alimentarias
export const getFoodPreferences = async (userId: string): Promise<QueryResponse<FoodPreference[]>> => {
  try {
    const { data, error } = await supabase
      .from('food_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener preferencias alimentarias:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const addFoodPreference = async (preference: Omit<FoodPreference, 'id' | 'created_at' | 'updated_at'>): Promise<QueryResponse<FoodPreference>> => {
  try {
    const { data, error } = await supabase
      .from('food_preferences')
      .insert(preference)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al añadir preferencia alimentaria:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const updateFoodPreference = async (id: string, updates: Partial<FoodPreference>): Promise<QueryResponse<FoodPreference>> => {
  try {
    const { data, error } = await supabase
      .from('food_preferences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar preferencia alimentaria:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

export const deleteFoodPreference = async (id: string): Promise<QueryResponse<null>> => {
  try {
    const { error } = await supabase
      .from('food_preferences')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null };
  } catch (error) {
    console.error('Error al eliminar preferencia alimentaria:', error);
    return { data: null, error: error as PostgrestError | Error };
  }
};

// Calcular BMR (Basal Metabolic Rate) usando la fórmula de Mifflin-St Jeor
export const calculateBMR = (
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: 'male' | 'female'
): number => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Calcular TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  const activityMultipliers = {
    sedentary: 1.2, // Poco o ningún ejercicio
    light: 1.375, // Ejercicio ligero 1-3 días/semana
    moderate: 1.55, // Ejercicio moderado 3-5 días/semana
    active: 1.725, // Ejercicio intenso 6-7 días/semana
    very_active: 1.9 // Ejercicio muy intenso, trabajo físico o entrenamiento 2x/día
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// Calcular macronutrientes recomendados basados en el objetivo
export const calculateMacros = (
  tdee: number,
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle',
  weight: number // kg
): { calories: number; protein: number; carbs: number; fat: number } => {
  let calories = tdee;
  let proteinPerKg = 1.6; // g por kg de peso corporal
  
  // Ajustar calorías según el objetivo
  switch (goal) {
    case 'lose_weight':
      calories = Math.round(tdee * 0.8); // Déficit del 20%
      proteinPerKg = 2.0; // Mayor proteína para preservar masa muscular
      break;
    case 'maintain':
      calories = tdee;
      proteinPerKg = 1.6;
      break;
    case 'gain_weight':
      calories = Math.round(tdee * 1.1); // Superávit del 10%
      proteinPerKg = 1.6;
      break;
    case 'gain_muscle':
      calories = Math.round(tdee * 1.15); // Superávit del 15%
      proteinPerKg = 2.2; // Mayor proteína para construcción muscular
      break;
  }
  
  // Calcular macros
  const protein = Math.round(weight * proteinPerKg); // g
  const fat = Math.round((calories * 0.25) / 9); // 25% de calorías de grasa, 9 cal/g
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4); // Resto de calorías de carbohidratos, 4 cal/g
  
  return { calories, protein, carbs, fat };
};
