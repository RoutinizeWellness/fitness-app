import { createClient } from './client'
import { PostgrestError } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient()

export interface NutritionGoal {
  id: string
  user_id: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  water?: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface WaterLog {
  id: string
  user_id: string
  date: string
  amount: number
  created_at: string
}

export interface NutritionEntry {
  id: string
  user_id: string
  date: string
  meal_type: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: number
  unit: string
  notes?: string
  created_at: string
}

export interface DailyNutritionStats {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_entries: number
  meals: {
    [key: string]: NutritionEntry[]
  }
}

type QueryResponse<T> = {
  data: T | null
  error: PostgrestError | Error | null
}

// Funciones para objetivos nutricionales
export const getUserNutritionGoals = async (userId: string): Promise<QueryResponse<NutritionGoal>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error al obtener objetivos nutricionales:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error('Error en getUserNutritionGoals:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

export const setNutritionGoals = async (
  goals: Omit<NutritionGoal, 'id' | 'created_at' | 'updated_at'>
): Promise<QueryResponse<NutritionGoal>> => {
  try {
    // Desactivar objetivos anteriores
    await supabase
      .from('nutrition_goals')
      .update({ is_active: false })
      .eq('user_id', goals.user_id)
      .eq('is_active', true)

    // Crear nuevos objetivos
    const { data, error } = await supabase
      .from('nutrition_goals')
      .insert([{
        ...goals,
        start_date: goals.start_date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single()

    if (error) {
      console.error('Error al establecer objetivos nutricionales:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error('Error en setNutritionGoals:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

// Funciones para registro de agua
export const getWaterLog = async (userId: string, date: string): Promise<QueryResponse<WaterLog[]>> => {
  try {
    const { data, error } = await supabase
      .from('water_log')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener registro de agua:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (e) {
    console.error('Error en getWaterLog:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

export const addWaterEntry = async (
  entry: Omit<WaterLog, 'id' | 'created_at'>
): Promise<QueryResponse<WaterLog>> => {
  try {
    const { data, error } = await supabase
      .from('water_log')
      .insert([entry])
      .select()
      .single()

    if (error) {
      console.error('Error al agregar entrada de agua:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error('Error en addWaterEntry:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

export const deleteWaterEntry = async (id: string): Promise<QueryResponse<null>> => {
  try {
    const { error } = await supabase
      .from('water_log')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar entrada de agua:', error)
      return { data: null, error }
    }

    return { data: null, error: null }
  } catch (e) {
    console.error('Error en deleteWaterEntry:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

// Funciones para entradas de nutrición
export const getNutritionEntries = async (
  userId: string,
  options?: {
    date?: string
    startDate?: string
    endDate?: string
    mealType?: string
    limit?: number
  }
): Promise<QueryResponse<NutritionEntry[]>> => {
  try {
    let query = supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)

    if (options?.date) {
      query = query.eq('date', options.date)
    }

    if (options?.startDate && options?.endDate) {
      query = query.gte('date', options.startDate).lte('date', options.endDate)
    }

    if (options?.mealType) {
      query = query.eq('meal_type', options.mealType)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener entradas de nutrición:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (e) {
    console.error('Error en getNutritionEntries:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

export const addNutritionEntry = async (
  entry: Omit<NutritionEntry, 'id' | 'created_at'>
): Promise<QueryResponse<NutritionEntry>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert([entry])
      .select()
      .single()

    if (error) {
      console.error('Error al agregar entrada de nutrición:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error('Error en addNutritionEntry:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

export const updateNutritionEntry = async (
  id: string,
  updates: Partial<NutritionEntry>
): Promise<QueryResponse<NutritionEntry>> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar entrada de nutrición:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error('Error en updateNutritionEntry:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

export const deleteNutritionEntry = async (id: string): Promise<QueryResponse<null>> => {
  try {
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar entrada de nutrición:', error)
      return { data: null, error }
    }

    return { data: null, error: null }
  } catch (e) {
    console.error('Error en deleteNutritionEntry:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}

// Función para obtener estadísticas diarias
export const getDailyNutritionStats = async (
  userId: string,
  date: string
): Promise<QueryResponse<DailyNutritionStats>> => {
  try {
    const { data: entries, error } = await getNutritionEntries(userId, { date })

    if (error) {
      return { data: null, error }
    }

    // Agrupar entradas por tipo de comida
    const mealGroups: { [key: string]: NutritionEntry[] } = {}
    entries?.forEach(entry => {
      if (!mealGroups[entry.meal_type]) {
        mealGroups[entry.meal_type] = []
      }
      mealGroups[entry.meal_type].push(entry)
    })

    // Calcular totales
    const stats: DailyNutritionStats = {
      date,
      total_calories: entries?.reduce((sum, entry) => sum + entry.calories, 0) || 0,
      total_protein: entries?.reduce((sum, entry) => sum + entry.protein, 0) || 0,
      total_carbs: entries?.reduce((sum, entry) => sum + entry.carbs, 0) || 0,
      total_fat: entries?.reduce((sum, entry) => sum + entry.fat, 0) || 0,
      total_entries: entries?.length || 0,
      meals: mealGroups
    }

    return { data: stats, error: null }
  } catch (e) {
    console.error('Error en getDailyNutritionStats:', e)
    return {
      data: null,
      error: e instanceof Error ? e : new Error('Error desconocido')
    }
  }
}
