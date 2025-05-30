import { supabase } from "@/lib/supabase-client"
import { expandedSpanishFoodDatabase, SpanishFood } from "@/lib/data/expanded-spanish-food-database"
import { handleSupabaseError } from "@/lib/utils/error-handler"

export interface NutritionEntry {
  id?: string
  user_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_id?: string
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  created_at?: string
}

export interface MealPlan {
  id?: string
  user_id: string
  name: string
  description?: string
  week_start: string
  meals: {
    [day: string]: {
      breakfast: SpanishFood | null
      lunch: SpanishFood | null
      dinner: SpanishFood | null
      snack?: SpanishFood | null
    }
  }
  preferences: {
    diet_type: string
    allergies: string[]
    budget: string
    cooking_time: string
    servings: number
  }
  shopping_list: ShoppingItem[]
  created_at?: string
}

export interface ShoppingItem {
  ingredient: string
  quantity: string
  category: string
  checked: boolean
}

export interface NutritionGoals {
  id?: string
  user_id: string
  daily_calories: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  fiber_grams?: number
  created_at?: string
}

/**
 * Buscar alimentos en la base de datos española expandida
 */
export const searchSpanishFoods = (query: string, filters?: {
  category?: string
  supermarket?: string
  region?: string
  isVegan?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
}): SpanishFood[] => {
  let results = expandedSpanishFoodDatabase

  // Filtrar por término de búsqueda
  if (query.trim()) {
    const searchTerm = query.toLowerCase()
    results = results.filter(food => 
      food.name.toLowerCase().includes(searchTerm) ||
      food.brand?.toLowerCase().includes(searchTerm) ||
      food.category.toLowerCase().includes(searchTerm) ||
      food.subcategory?.toLowerCase().includes(searchTerm) ||
      food.region?.toLowerCase().includes(searchTerm)
    )
  }

  // Aplicar filtros
  if (filters) {
    if (filters.category) {
      results = results.filter(food => food.category === filters.category)
    }
    if (filters.supermarket) {
      results = results.filter(food => food.supermarket.includes(filters.supermarket!))
    }
    if (filters.region) {
      results = results.filter(food => food.region === filters.region)
    }
    if (filters.isVegan) {
      results = results.filter(food => food.isVegan === true)
    }
    if (filters.isVegetarian) {
      results = results.filter(food => food.isVegetarian === true)
    }
    if (filters.isGlutenFree) {
      results = results.filter(food => food.isGlutenFree === true)
    }
  }

  return results.slice(0, 50) // Limitar resultados
}

/**
 * Obtener alimento por ID
 */
export const getSpanishFoodById = (id: string): SpanishFood | null => {
  return expandedSpanishFoodDatabase.find(food => food.id === id) || null
}

/**
 * Obtener categorías disponibles
 */
export const getSpanishFoodCategories = (): string[] => {
  const categories = new Set(expandedSpanishFoodDatabase.map(food => food.category))
  return Array.from(categories).sort()
}

/**
 * Obtener supermercados disponibles
 */
export const getAvailableSupermarkets = (): string[] => {
  const supermarkets = new Set<string>()
  expandedSpanishFoodDatabase.forEach(food => {
    food.supermarket.forEach(market => supermarkets.add(market))
  })
  return Array.from(supermarkets).sort()
}

/**
 * Obtener regiones disponibles
 */
export const getAvailableRegions = (): string[] => {
  const regions = new Set<string>()
  expandedSpanishFoodDatabase.forEach(food => {
    if (food.region) regions.add(food.region)
  })
  return Array.from(regions).sort()
}

/**
 * Calcular información nutricional para una cantidad específica
 */
export const calculateNutritionForQuantity = (food: SpanishFood, quantity: number): {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
} => {
  const multiplier = quantity / 100 // Los valores nutricionales están por 100g
  
  return {
    calories: Math.round(food.nutritionPer100g.calories * multiplier),
    protein: Math.round(food.nutritionPer100g.protein * multiplier * 10) / 10,
    carbs: Math.round(food.nutritionPer100g.carbs * multiplier * 10) / 10,
    fat: Math.round(food.nutritionPer100g.fat * multiplier * 10) / 10,
    fiber: Math.round((food.nutritionPer100g.fiber || 0) * multiplier * 10) / 10,
    sugar: Math.round((food.nutritionPer100g.sugar || 0) * multiplier * 10) / 10,
    sodium: Math.round((food.nutritionPer100g.sodium || 0) * multiplier * 10) / 10
  }
}

/**
 * Añadir entrada de nutrición
 */
export const addNutritionEntry = async (entry: Omit<NutritionEntry, 'id' | 'created_at'>): Promise<NutritionEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert(entry)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, { context: 'Añadir entrada de nutrición', showToast: true })
      return null
    }

    return data
  } catch (error) {
    console.error('Error al añadir entrada de nutrición:', error)
    return null
  }
}

/**
 * Obtener entradas de nutrición por fecha
 */
export const getNutritionEntriesByDate = async (userId: string, date: string): Promise<NutritionEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error, { context: 'Obtener entradas de nutrición', showToast: true })
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error al obtener entradas de nutrición:', error)
    return []
  }
}

/**
 * Actualizar entrada de nutrición
 */
export const updateNutritionEntry = async (id: string, updates: Partial<NutritionEntry>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('nutrition_entries')
      .update(updates)
      .eq('id', id)

    if (error) {
      handleSupabaseError(error, { context: 'Actualizar entrada de nutrición', showToast: true })
      return false
    }

    return true
  } catch (error) {
    console.error('Error al actualizar entrada de nutrición:', error)
    return false
  }
}

/**
 * Eliminar entrada de nutrición
 */
export const deleteNutritionEntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('id', id)

    if (error) {
      handleSupabaseError(error, { context: 'Eliminar entrada de nutrición', showToast: true })
      return false
    }

    return true
  } catch (error) {
    console.error('Error al eliminar entrada de nutrición:', error)
    return false
  }
}

/**
 * Crear plan de comidas
 */
export const createMealPlan = async (plan: Omit<MealPlan, 'id' | 'created_at'>): Promise<MealPlan | null> => {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert(plan)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, { context: 'Crear plan de comidas', showToast: true })
      return null
    }

    return data
  } catch (error) {
    console.error('Error al crear plan de comidas:', error)
    return null
  }
}

/**
 * Obtener plan de comidas actual
 */
export const getCurrentMealPlan = async (userId: string): Promise<MealPlan | null> => {
  try {
    // Obtener el plan de la semana actual
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, { context: 'Obtener plan de comidas actual', showToast: false })
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error al obtener plan de comidas actual:', error)
    return null
  }
}

/**
 * Obtener objetivos nutricionales
 */
export const getNutritionGoals = async (userId: string): Promise<NutritionGoals | null> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, { context: 'Obtener objetivos nutricionales', showToast: false })
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error al obtener objetivos nutricionales:', error)
    return null
  }
}

/**
 * Crear o actualizar objetivos nutricionales
 */
export const upsertNutritionGoals = async (goals: Omit<NutritionGoals, 'id' | 'created_at'>): Promise<NutritionGoals | null> => {
  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert(goals, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, { context: 'Actualizar objetivos nutricionales', showToast: true })
      return null
    }

    return data
  } catch (error) {
    console.error('Error al actualizar objetivos nutricionales:', error)
    return null
  }
}

/**
 * Calcular resumen nutricional diario
 */
export const calculateDailyNutritionSummary = (entries: NutritionEntry[]) => {
  const summary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    mealBreakdown: {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      snack: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
  }

  entries.forEach(entry => {
    summary.calories += entry.calories
    summary.protein += entry.protein
    summary.carbs += entry.carbs
    summary.fat += entry.fat
    summary.fiber += entry.fiber || 0
    summary.sugar += entry.sugar || 0
    summary.sodium += entry.sodium || 0

    // Agregar a desglose por comida
    if (summary.mealBreakdown[entry.meal_type]) {
      summary.mealBreakdown[entry.meal_type].calories += entry.calories
      summary.mealBreakdown[entry.meal_type].protein += entry.protein
      summary.mealBreakdown[entry.meal_type].carbs += entry.carbs
      summary.mealBreakdown[entry.meal_type].fat += entry.fat
    }
  })

  return summary
}

export default {
  searchSpanishFoods,
  getSpanishFoodById,
  getSpanishFoodCategories,
  getAvailableSupermarkets,
  getAvailableRegions,
  calculateNutritionForQuantity,
  addNutritionEntry,
  getNutritionEntriesByDate,
  updateNutritionEntry,
  deleteNutritionEntry,
  createMealPlan,
  getCurrentMealPlan,
  getNutritionGoals,
  upsertNutritionGoals,
  calculateDailyNutritionSummary
}
