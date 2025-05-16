import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import {
  NutritionEntry,
  FoodItem,
  CustomFood,
  MealPlan,
  MealPlanDetail,
  NutritionGoal,
  WaterLog,
  NutritionRecommendation,
  NutritionAnalysis,
  DailyNutrition
} from './types/nutrition';

type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Funciones para entradas de nutrición
export const getNutritionEntries = async (
  userId: string,
  options?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    mealType?: string;
    limit?: number;
  }
): Promise<QueryResponse<NutritionEntry[]>> => {
  try {
    let query = supabase
      .from('nutrition')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (options?.date) {
      query = query.eq('date', options.date);
    }

    if (options?.startDate && options?.endDate) {
      query = query.gte('date', options.startDate).lte('date', options.endDate);
    }

    if (options?.mealType) {
      query = query.eq('meal_type', options.mealType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    return { data: data as NutritionEntry[], error };
  } catch (e) {
    console.error(`Error en getNutritionEntries:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getNutritionEntries`)
    };
  }
};

export const getNutritionEntryById = async (id: string): Promise<QueryResponse<NutritionEntry>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as NutritionEntry, error };
  } catch (e) {
    console.error(`Error en getNutritionEntryById:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getNutritionEntryById`)
    };
  }
};

export const addNutritionEntry = async (entry: Omit<NutritionEntry, 'id' | 'created_at'>): Promise<QueryResponse<NutritionEntry>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition')
      .insert([entry])
      .select();

    return { data: data?.[0] as NutritionEntry, error };
  } catch (e) {
    console.error(`Error en addNutritionEntry:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en addNutritionEntry`)
    };
  }
};

export const updateNutritionEntry = async (id: string, updates: Partial<NutritionEntry>): Promise<QueryResponse<NutritionEntry>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition')
      .update(updates)
      .eq('id', id)
      .select();

    return { data: data?.[0] as NutritionEntry, error };
  } catch (e) {
    console.error(`Error en updateNutritionEntry:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en updateNutritionEntry`)
    };
  }
};

export const deleteNutritionEntry = async (id: string): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    const { error } = await supabase
      .from('nutrition')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteNutritionEntry:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en deleteNutritionEntry`)
    };
  }
};

// Funciones para la base de datos de alimentos
export const searchFoodDatabase = async (
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<QueryResponse<FoodItem[]>> => {
  try {
    const { data, error } = await supabase
      .from('food_database')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(options?.limit || 20)
      .offset(options?.offset || 0);

    return { data: data as FoodItem[], error };
  } catch (e) {
    console.error(`Error en searchFoodDatabase:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en searchFoodDatabase`)
    };
  }
};

export const getFoodById = async (id: string): Promise<QueryResponse<FoodItem>> => {
  try {
    const { data, error } = await supabase
      .from('food_database')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as FoodItem, error };
  } catch (e) {
    console.error(`Error en getFoodById:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getFoodById`)
    };
  }
};

// Funciones para alimentos personalizados
export const getUserCustomFoods = async (userId: string): Promise<QueryResponse<CustomFood[]>> => {
  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    return { data: data as CustomFood[], error };
  } catch (e) {
    console.error(`Error en getUserCustomFoods:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getUserCustomFoods`)
    };
  }
};

export const addCustomFood = async (food: Omit<CustomFood, 'id' | 'created_at'>): Promise<QueryResponse<CustomFood>> => {
  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .insert([food])
      .select();

    return { data: data?.[0] as CustomFood, error };
  } catch (e) {
    console.error(`Error en addCustomFood:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en addCustomFood`)
    };
  }
};

export const updateCustomFood = async (id: string, updates: Partial<CustomFood>): Promise<QueryResponse<CustomFood>> => {
  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .update(updates)
      .eq('id', id)
      .select();

    return { data: data?.[0] as CustomFood, error };
  } catch (e) {
    console.error(`Error en updateCustomFood:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en updateCustomFood`)
    };
  }
};

export const deleteCustomFood = async (id: string): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    const { error } = await supabase
      .from('custom_foods')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteCustomFood:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en deleteCustomFood`)
    };
  }
};

// Funciones para planes de comidas
export const getUserMealPlans = async (userId: string): Promise<QueryResponse<MealPlan[]>> => {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as MealPlan[], error };
  } catch (e) {
    console.error(`Error en getUserMealPlans:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getUserMealPlans`)
    };
  }
};

export const getMealPlanById = async (id: string): Promise<QueryResponse<MealPlan>> => {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as MealPlan, error };
  } catch (e) {
    console.error(`Error en getMealPlanById:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getMealPlanById`)
    };
  }
};

export const getMealPlanDetails = async (mealPlanId: string): Promise<QueryResponse<MealPlanDetail[]>> => {
  try {
    const { data, error } = await supabase
      .from('meal_plan_details')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .order('day_of_week')
      .order('meal_type');

    return { data: data as MealPlanDetail[], error };
  } catch (e) {
    console.error(`Error en getMealPlanDetails:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getMealPlanDetails`)
    };
  }
};

export const createMealPlan = async (
  mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>,
  details: Omit<MealPlanDetail, 'id' | 'meal_plan_id' | 'created_at'>[]
): Promise<QueryResponse<MealPlan>> => {
  try {
    // Iniciar transacción
    const { data: planData, error: planError } = await supabase
      .from('meal_plans')
      .insert([mealPlan])
      .select();

    if (planError || !planData || planData.length === 0) {
      throw planError || new Error('No se pudo crear el plan de comidas');
    }

    const mealPlanId = planData[0].id;

    // Añadir detalles del plan
    const detailsWithPlanId = details.map(detail => ({
      ...detail,
      meal_plan_id: mealPlanId
    }));

    const { error: detailsError } = await supabase
      .from('meal_plan_details')
      .insert(detailsWithPlanId);

    if (detailsError) {
      throw detailsError;
    }

    return { data: planData[0] as MealPlan, error: null };
  } catch (e) {
    console.error(`Error en createMealPlan:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en createMealPlan`)
    };
  }
};

export const updateMealPlan = async (
  id: string,
  updates: Partial<MealPlan>
): Promise<QueryResponse<MealPlan>> => {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id)
      .select();

    return { data: data?.[0] as MealPlan, error };
  } catch (e) {
    console.error(`Error en updateMealPlan:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en updateMealPlan`)
    };
  }
};

export const deleteMealPlan = async (id: string): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    // Primero eliminar los detalles del plan
    const { error: detailsError } = await supabase
      .from('meal_plan_details')
      .delete()
      .eq('meal_plan_id', id);

    if (detailsError) {
      throw detailsError;
    }

    // Luego eliminar el plan
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteMealPlan:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en deleteMealPlan`)
    };
  }
};

// Funciones para objetivos nutricionales
export const getUserNutritionGoals = async (userId: string): Promise<QueryResponse<NutritionGoal>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    return { data: data as NutritionGoal, error };
  } catch (e) {
    console.error(`Error en getUserNutritionGoals:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getUserNutritionGoals`)
    };
  }
};

export const setNutritionGoals = async (
  goals: Omit<NutritionGoal, 'id' | 'created_at' | 'updated_at'>
): Promise<QueryResponse<NutritionGoal>> => {
  try {
    // Desactivar objetivos anteriores
    await supabase
      .from('nutrition_goals')
      .update({ is_active: false })
      .eq('user_id', goals.user_id)
      .eq('is_active', true);

    // Crear nuevos objetivos
    const { data, error } = await supabase
      .from('nutrition_goals')
      .insert([goals])
      .select();

    return { data: data?.[0] as NutritionGoal, error };
  } catch (e) {
    console.error(`Error en setNutritionGoals:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en setNutritionGoals`)
    };
  }
};

// Funciones para registro de agua
export const getWaterLog = async (
  userId: string,
  date: string
): Promise<QueryResponse<WaterLog[]>> => {
  try {
    const { data, error } = await supabase
      .from('water_log')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at');

    return { data: data as WaterLog[], error };
  } catch (e) {
    console.error(`Error en getWaterLog:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getWaterLog`)
    };
  }
};

export const addWaterEntry = async (
  entry: Omit<WaterLog, 'id' | 'created_at'>
): Promise<QueryResponse<WaterLog>> => {
  try {
    const { data, error } = await supabase
      .from('water_log')
      .insert([entry])
      .select();

    return { data: data?.[0] as WaterLog, error };
  } catch (e) {
    console.error(`Error en addWaterEntry:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en addWaterEntry`)
    };
  }
};

export const deleteWaterEntry = async (id: string): Promise<{ error: PostgrestError | Error | null }> => {
  try {
    const { error } = await supabase
      .from('water_log')
      .delete()
      .eq('id', id);

    return { error };
  } catch (e) {
    console.error(`Error en deleteWaterEntry:`, e);
    return {
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en deleteWaterEntry`)
    };
  }
};

// Funciones para recomendaciones nutricionales
export const getNutritionRecommendations = async (
  userId: string
): Promise<QueryResponse<NutritionRecommendation[]>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as NutritionRecommendation[], error };
  } catch (e) {
    console.error(`Error en getNutritionRecommendations:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getNutritionRecommendations`)
    };
  }
};

// Funciones para análisis nutricional
export const getNutritionAnalysis = async (
  userId: string,
  period: string = 'week'
): Promise<QueryResponse<NutritionAnalysis>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    return { data: data as NutritionAnalysis, error };
  } catch (e) {
    console.error(`Error en getNutritionAnalysis:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getNutritionAnalysis`)
    };
  }
};

// Función para obtener estadísticas diarias de nutrición
export const getDailyNutritionStats = async (
  userId: string,
  date: string
): Promise<QueryResponse<DailyNutrition>> => {
  try {
    const { data: entries, error } = await getNutritionEntries(userId, { date });

    if (error) {
      throw error;
    }

    // Agrupar entradas por tipo de comida
    const mealGroups: { [key: string]: NutritionEntry[] } = {};
    entries?.forEach(entry => {
      if (!mealGroups[entry.meal_type]) {
        mealGroups[entry.meal_type] = [];
      }
      mealGroups[entry.meal_type].push(entry);
    });

    // Calcular totales
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      entries: entries?.length || 0,
      meals: mealGroups
    };

    entries?.forEach(entry => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.protein || 0;
      totals.carbs += entry.carbs || 0;
      totals.fat += entry.fat || 0;
    });

    return { data: totals, error: null };
  } catch (e) {
    console.error(`Error en getDailyNutritionStats:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getDailyNutritionStats`)
    };
  }
};
