import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase-client'
import { handleSupabaseError } from '@/lib/error-handlers/supabase-error-handler'

// Tipos para el generador de planes de alimentación
export interface NutritionPlan {
  id: string
  user_id: string
  name: string
  description: string
  target_calories: number
  target_protein: number
  target_carbs: number
  target_fat: number
  days: NutritionPlanDay[]
  created_at: string
  is_active: boolean
  start_date?: string
  end_date?: string
}

export interface NutritionPlanDay {
  id: string
  name: string
  meals: Meal[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  notes: string
}

export interface Meal {
  id: string
  name: string
  time: string
  foods: MealFood[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  notes: string
}

export interface MealFood {
  id: string
  food_id?: string
  name: string
  serving_size: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  is_custom: boolean
}

export interface NutritionProfile {
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain'
  current_weight: number
  target_weight: number
  height: number
  age: number
  gender: 'male' | 'female' | 'other'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  meals_per_day: number
  dietary_restrictions: string[]
  food_preferences: string[]
  allergies: string[]
}

/**
 * Traduce el objetivo nutricional al español
 */
export function translateGoal(goal: string): string {
  switch (goal) {
    case 'weight_loss':
      return 'pérdida de peso'
    case 'maintenance':
      return 'mantenimiento'
    case 'muscle_gain':
      return 'ganancia muscular'
    default:
      return goal
  }
}

/**
 * Calcula las necesidades calóricas basadas en el perfil
 */
export function calculateCalories(profile: NutritionProfile): number {
  // Fórmula de Harris-Benedict para BMR
  let bmr = 0
  
  if (profile.gender === 'male') {
    bmr = 88.362 + (13.397 * profile.current_weight) + (4.799 * profile.height) - (5.677 * profile.age)
  } else {
    bmr = 447.593 + (9.247 * profile.current_weight) + (3.098 * profile.height) - (4.330 * profile.age)
  }
  
  // Multiplicador de actividad
  let activityMultiplier = 1.2 // sedentario
  switch (profile.activity_level) {
    case 'light':
      activityMultiplier = 1.375
      break
    case 'moderate':
      activityMultiplier = 1.55
      break
    case 'active':
      activityMultiplier = 1.725
      break
    case 'very_active':
      activityMultiplier = 1.9
      break
  }
  
  // TDEE (Total Daily Energy Expenditure)
  let tdee = bmr * activityMultiplier
  
  // Ajustar según el objetivo
  switch (profile.goal) {
    case 'weight_loss':
      return Math.round(tdee * 0.8) // déficit del 20%
    case 'muscle_gain':
      return Math.round(tdee * 1.1) // superávit del 10%
    default:
      return Math.round(tdee) // mantenimiento
  }
}

/**
 * Calcula la distribución de macronutrientes basada en el perfil
 */
export function calculateMacros(profile: NutritionProfile, calories: number): {
  protein: number
  carbs: number
  fat: number
} {
  let proteinPercentage = 0
  let carbsPercentage = 0
  let fatPercentage = 0
  
  switch (profile.goal) {
    case 'weight_loss':
      proteinPercentage = 0.35 // 35%
      fatPercentage = 0.35 // 35%
      carbsPercentage = 0.3 // 30%
      break
    case 'muscle_gain':
      proteinPercentage = 0.3 // 30%
      carbsPercentage = 0.45 // 45%
      fatPercentage = 0.25 // 25%
      break
    default: // mantenimiento
      proteinPercentage = 0.3 // 30%
      carbsPercentage = 0.4 // 40%
      fatPercentage = 0.3 // 30%
  }
  
  // Calorías por gramo: proteína 4, carbos 4, grasa 9
  const protein = Math.round((calories * proteinPercentage) / 4)
  const carbs = Math.round((calories * carbsPercentage) / 4)
  const fat = Math.round((calories * fatPercentage) / 9)
  
  return { protein, carbs, fat }
}

/**
 * Genera un día de plan de alimentación
 */
export function generatePlanDay(
  dayNumber: number,
  profile: NutritionProfile,
  calories: number,
  macros: { protein: number, carbs: number, fat: number }
): NutritionPlanDay {
  const dayName = `Día ${dayNumber}`
  const meals: Meal[] = []
  
  // Distribuir calorías y macros entre las comidas
  const mealCount = profile.meals_per_day || 4
  const caloriesPerMeal = Math.round(calories / mealCount)
  const proteinPerMeal = Math.round(macros.protein / mealCount)
  const carbsPerMeal = Math.round(macros.carbs / mealCount)
  const fatPerMeal = Math.round(macros.fat / mealCount)
  
  // Generar comidas
  for (let i = 0; i < mealCount; i++) {
    let mealName = ''
    let mealTime = ''
    
    switch (i) {
      case 0:
        mealName = 'Desayuno'
        mealTime = '08:00'
        break
      case 1:
        mealName = mealCount <= 3 ? 'Almuerzo' : 'Media mañana'
        mealTime = mealCount <= 3 ? '13:00' : '11:00'
        break
      case 2:
        mealName = mealCount <= 3 ? 'Cena' : 'Almuerzo'
        mealTime = mealCount <= 3 ? '20:00' : '14:00'
        break
      case 3:
        mealName = 'Merienda'
        mealTime = '17:00'
        break
      case 4:
        mealName = 'Cena'
        mealTime = '20:00'
        break
      default:
        mealName = `Comida ${i + 1}`
        mealTime = '12:00'
    }
    
    // Crear comida con alimentos de ejemplo
    meals.push({
      id: uuidv4(),
      name: mealName,
      time: mealTime,
      foods: generateSampleFoods(mealName, caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal),
      total_calories: caloriesPerMeal,
      total_protein: proteinPerMeal,
      total_carbs: carbsPerMeal,
      total_fat: fatPerMeal,
      notes: ''
    })
  }
  
  return {
    id: uuidv4(),
    name: dayName,
    meals,
    total_calories: calories,
    total_protein: macros.protein,
    total_carbs: macros.carbs,
    total_fat: macros.fat,
    notes: ''
  }
}

/**
 * Genera alimentos de ejemplo para una comida
 */
function generateSampleFoods(
  mealType: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): MealFood[] {
  const foods: MealFood[] = []
  
  // Alimentos según el tipo de comida
  switch (mealType.toLowerCase()) {
    case 'desayuno':
      foods.push({
        id: uuidv4(),
        name: 'Avena con leche',
        serving_size: 60,
        serving_unit: 'g',
        calories: Math.round(targetCalories * 0.4),
        protein: Math.round(targetProtein * 0.2),
        carbs: Math.round(targetCarbs * 0.5),
        fat: Math.round(targetFat * 0.2),
        is_custom: false
      })
      foods.push({
        id: uuidv4(),
        name: 'Huevos revueltos',
        serving_size: 2,
        serving_unit: 'unidad',
        calories: Math.round(targetCalories * 0.3),
        protein: Math.round(targetProtein * 0.6),
        carbs: Math.round(targetCarbs * 0.1),
        fat: Math.round(targetFat * 0.5),
        is_custom: false
      })
      foods.push({
        id: uuidv4(),
        name: 'Plátano',
        serving_size: 1,
        serving_unit: 'unidad',
        calories: Math.round(targetCalories * 0.3),
        protein: Math.round(targetProtein * 0.2),
        carbs: Math.round(targetCarbs * 0.4),
        fat: Math.round(targetFat * 0.3),
        is_custom: false
      })
      break
      
    // Añadir más casos para otros tipos de comidas
      
    default:
      foods.push({
        id: uuidv4(),
        name: 'Alimento ejemplo',
        serving_size: 100,
        serving_unit: 'g',
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        is_custom: false
      })
  }
  
  return foods
}

/**
 * Genera un plan de alimentación completo
 */
export async function generateNutritionPlan(
  userId: string,
  profile: NutritionProfile
): Promise<{ plan: NutritionPlan | null, error: any }> {
  try {
    // Calcular calorías y macros
    const calories = calculateCalories(profile)
    const macros = calculateMacros(profile, calories)
    
    // Crear plan
    const planId = uuidv4()
    const now = new Date()
    const startDate = now.toISOString().split('T')[0]
    
    // Calcular fecha de fin (7 días después)
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + 6)
    const endDateStr = endDate.toISOString().split('T')[0]
    
    // Crear el plan básico
    const plan: NutritionPlan = {
      id: planId,
      user_id: userId,
      name: `Plan de ${translateGoal(profile.goal)}`,
      description: `Plan nutricional personalizado para ${translateGoal(profile.goal)} adaptado a tus preferencias.`,
      target_calories: calories,
      target_protein: macros.protein,
      target_carbs: macros.carbs,
      target_fat: macros.fat,
      days: [],
      created_at: now.toISOString(),
      is_active: true,
      start_date: startDate,
      end_date: endDateStr
    }
    
    // Generar los días del plan (7 días por defecto)
    for (let i = 0; i < 7; i++) {
      const day = generatePlanDay(i + 1, profile, calories, macros)
      plan.days.push(day)
    }
    
    // Guardar en Supabase si está disponible
    if (supabase) {
      try {
        // Guardar el plan principal
        const { data, error } = await supabase
          .from('nutrition_plans')
          .insert({
            id: plan.id,
            user_id: plan.user_id,
            name: plan.name,
            description: plan.description,
            target_calories: plan.target_calories,
            target_protein: plan.target_protein,
            target_carbs: plan.target_carbs,
            target_fat: plan.target_fat,
            is_active: plan.is_active,
            start_date: plan.start_date,
            end_date: plan.end_date
          })
          .select()
          .single()
        
        if (error) {
          console.warn('Error al guardar plan de nutrición en Supabase:', error)
          // Devolver el plan generado aunque no se haya guardado
          return { plan, error }
        }
        
        // Guardar los días y comidas en transacciones separadas
        // (Implementación simplificada - en una aplicación real se usarían transacciones)
      } catch (dbError) {
        console.error('Error al guardar plan en la base de datos:', dbError)
        // Devolver el plan generado aunque no se haya guardado
        return { plan, error: dbError }
      }
    }
    
    return { plan, error: null }
  } catch (error) {
    console.error('Error al generar plan de nutrición:', error)
    return { plan: null, error }
  }
}
