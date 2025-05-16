import { NutritionProfile, MacroDistribution, calculateMacroDistribution } from "@/lib/nutrition-personalization-service"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuidv4 } from 'uuid'

// Tipos para el generador de planes de alimentación
export interface MealPlan {
  id: string
  userId: string
  name: string
  description: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  days: MealPlanDay[]
  createdAt: string
  isActive: boolean
  startDate?: string
  endDate?: string
}

export interface MealPlanDay {
  id: string
  name: string
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes: string
}

export interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time: string
  foods: MealFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  recipe?: string
  preparationTime?: number
  notes?: string
}

export interface MealFood {
  id: string
  name: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  isRecipeIngredient: boolean
}

/**
 * Genera un plan de alimentación basado en el perfil del usuario
 */
export async function generateMealPlan(userId: string, profile: NutritionProfile): Promise<MealPlan | null> {
  try {
    // Calcular distribución de macronutrientes
    const macros = calculateMacroDistribution(profile)

    // Crear el plan básico
    const planId = uuidv4();
    const now = new Date();
    const startDate = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Calcular fecha de fin (7 días después)
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];

    const plan: MealPlan = {
      id: planId,
      userId,
      name: `Plan de ${translateGoal(profile.primaryGoal)}`,
      description: `Plan nutricional personalizado para ${translateGoal(profile.primaryGoal)} adaptado a tus preferencias.`,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
      days: [],
      createdAt: now.toISOString(),
      isActive: true,
      startDate,
      endDate: endDateStr
    }

    // Generar los días del plan (7 días por defecto)
    for (let i = 0; i < 7; i++) {
      const day = generateMealPlanDay(i + 1, profile, macros)
      plan.days.push(day)
    }

    // Guardar el plan en Supabase - Adaptado a la estructura real de la tabla
    const { error } = await supabase
      .from('meal_plans')
      .insert([{
        id: plan.id,
        user_id: userId,
        name: plan.name,
        description: plan.description,
        start_date: plan.startDate,
        end_date: plan.endDate,
        is_active: plan.isActive,
        is_template: false,
        created_at: plan.createdAt,
        updated_at: plan.createdAt
      }])

    if (error) {
      console.error('Error al guardar el plan de alimentación:', error)
      return null
    }

    // Guardar los detalles del plan en otra tabla
    // Crear registros para cada comida de cada día
    const mealPlanDetails = [];

    plan.days.forEach((day, dayIndex) => {
      const dayOfWeek = dayIndex + 1; // 1 = Lunes, 2 = Martes, etc.

      day.meals.forEach(meal => {
        meal.foods.forEach(food => {
          mealPlanDetails.push({
            id: uuidv4(),
            meal_plan_id: plan.id,
            day_of_week: dayOfWeek,
            meal_type: meal.type,
            food_name: food.name,
            servings: food.amount,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            created_at: plan.createdAt,
            updated_at: plan.createdAt
          });
        });
      });
    });

    // Insertar todos los detalles
    const { error: detailsError } = await supabase
      .from('meal_plan_details')
      .insert(mealPlanDetails)

    if (detailsError) {
      console.error('Error al guardar los detalles del plan:', detailsError)
      // No retornamos null aquí para que al menos el plan principal se haya guardado
    }

    return plan
  } catch (error) {
    console.error('Error en generateMealPlan:', error)
    return null
  }
}

/**
 * Genera un día del plan de alimentación
 */
function generateMealPlanDay(dayNumber: number, profile: NutritionProfile, macros: MacroDistribution): MealPlanDay {
  const dayNames = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ]

  const day: MealPlanDay = {
    id: uuidv4(),
    name: dayNames[(dayNumber - 1) % 7],
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    notes: ''
  }

  // Distribuir macros según número de comidas
  const mealDistribution = distributeMacrosByMeal(profile.mealFrequency, macros)

  // Generar las comidas según la frecuencia
  for (let i = 0; i < profile.mealFrequency; i++) {
    const mealType = getMealType(i, profile.mealFrequency)
    const mealTime = getMealTime(i, profile.mealFrequency)
    const mealMacros = mealDistribution[i]

    const meal = generateMeal(mealType, mealTime, profile, mealMacros)
    day.meals.push(meal)

    // Actualizar totales del día
    day.totalCalories += meal.totalCalories
    day.totalProtein += meal.totalProtein
    day.totalCarbs += meal.totalCarbs
    day.totalFat += meal.totalFat
  }

  return day
}

/**
 * Genera una comida basada en el tipo y los macros objetivo
 */
function generateMeal(
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  time: string,
  profile: NutritionProfile,
  targetMacros: { calories: number, protein: number, carbs: number, fat: number }
): Meal {
  const meal: Meal = {
    id: uuidv4(),
    name: getMealName(type),
    type,
    time,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  }

  // Seleccionar alimentos según el tipo de comida y preferencias
  const foods = selectFoodsForMeal(type, profile, targetMacros)
  meal.foods = foods

  // Calcular totales
  foods.forEach(food => {
    meal.totalCalories += food.calories
    meal.totalProtein += food.protein
    meal.totalCarbs += food.carbs
    meal.totalFat += food.fat
  })

  // Añadir receta si es almuerzo o cena
  if (type === 'lunch' || type === 'dinner') {
    meal.recipe = generateRecipe(foods)
    meal.preparationTime = Math.floor(Math.random() * 20) + 10 // 10-30 minutos
  }

  return meal
}

/**
 * Distribuye los macronutrientes entre las comidas del día
 */
function distributeMacrosByMeal(
  mealFrequency: number,
  macros: MacroDistribution
): Array<{ calories: number, protein: number, carbs: number, fat: number }> {
  const distribution: Array<{ calories: number, protein: number, carbs: number, fat: number }> = []

  // Distribución porcentual según número de comidas
  let percentages: number[] = []

  switch (mealFrequency) {
    case 1:
      percentages = [1] // 100%
      break
    case 2:
      percentages = [0.4, 0.6] // 40%, 60%
      break
    case 3:
      percentages = [0.25, 0.45, 0.3] // 25%, 45%, 30%
      break
    case 4:
      percentages = [0.2, 0.35, 0.3, 0.15] // 20%, 35%, 30%, 15%
      break
    case 5:
      percentages = [0.2, 0.1, 0.35, 0.1, 0.25] // 20%, 10%, 35%, 10%, 25%
      break
    case 6:
      percentages = [0.15, 0.1, 0.3, 0.1, 0.25, 0.1] // 15%, 10%, 30%, 10%, 25%, 10%
      break
    default:
      // Distribución equitativa
      const equalPercentage = 1 / mealFrequency
      percentages = Array(mealFrequency).fill(equalPercentage)
  }

  // Calcular macros para cada comida
  for (let i = 0; i < mealFrequency; i++) {
    distribution.push({
      calories: Math.round(macros.calories * percentages[i]),
      protein: Math.round(macros.protein * percentages[i]),
      carbs: Math.round(macros.carbs * percentages[i]),
      fat: Math.round(macros.fat * percentages[i])
    })
  }

  return distribution
}

/**
 * Determina el tipo de comida según el índice y la frecuencia
 */
function getMealType(index: number, mealFrequency: number): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  if (mealFrequency === 1) return 'lunch'
  if (mealFrequency === 2) return index === 0 ? 'breakfast' : 'dinner'
  if (mealFrequency === 3) return ['breakfast', 'lunch', 'dinner'][index]

  // Para 4 o más comidas
  if (index === 0) return 'breakfast'
  if (index === Math.floor(mealFrequency / 2)) return 'lunch'
  if (index === mealFrequency - 1) return 'dinner'
  return 'snack'
}

/**
 * Determina la hora de la comida según el índice y la frecuencia
 */
function getMealTime(index: number, mealFrequency: number): string {
  if (mealFrequency === 1) return '13:00'
  if (mealFrequency === 2) return index === 0 ? '08:00' : '20:00'
  if (mealFrequency === 3) return ['08:00', '13:00', '20:00'][index]

  // Para 4 o más comidas, distribuir a lo largo del día
  const startHour = 7 // 7 AM
  const endHour = 21 // 9 PM
  const totalHours = endHour - startHour
  const hourStep = totalHours / (mealFrequency - 1)

  const hour = Math.round(startHour + (index * hourStep))
  return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * Genera un nombre para la comida según el tipo
 */
function getMealName(type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): string {
  const names: Record<string, string[]> = {
    breakfast: ['Desayuno Energético', 'Desayuno Completo', 'Desayuno Nutritivo', 'Desayuno Equilibrado'],
    lunch: ['Almuerzo Completo', 'Comida Principal', 'Almuerzo Nutritivo', 'Comida Equilibrada'],
    dinner: ['Cena Ligera', 'Cena Nutritiva', 'Cena Equilibrada', 'Cena Saludable'],
    snack: ['Merienda Saludable', 'Snack Energético', 'Tentempié Nutritivo', 'Refrigerio Equilibrado']
  }

  const options = names[type] || ['Comida']
  return options[Math.floor(Math.random() * options.length)]
}

// Funciones auxiliares para seleccionar alimentos según el tipo de comida
function selectFoodsForMeal(
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  profile: NutritionProfile,
  targetMacros: { calories: number, protein: number, carbs: number, fat: number }
): MealFood[] {
  // Implementación básica con alimentos predefinidos según el tipo de comida
  switch (type) {
    case 'breakfast':
      return selectBreakfastFoods(profile, targetMacros)
    case 'lunch':
      return selectLunchFoods(profile, targetMacros)
    case 'dinner':
      return selectDinnerFoods(profile, targetMacros)
    case 'snack':
      return selectSnackFoods(profile, targetMacros)
    default:
      return []
  }
}

function selectBreakfastFoods(profile: NutritionProfile, targetMacros: { calories: number, protein: number, carbs: number, fat: number }): MealFood[] {
  return [
    createFood('Avena', 50, 'g', 180, 6, 30, 3),
    createFood('Plátano', 1, 'unidad', 105, 1, 27, 0),
    createFood('Leche', 250, 'ml', 125, 8, 12, 5),
    createFood('Nueces', 15, 'g', 98, 2, 2, 10)
  ]
}

function selectLunchFoods(profile: NutritionProfile, targetMacros: { calories: number, protein: number, carbs: number, fat: number }): MealFood[] {
  return [
    createFood('Pechuga de pollo', 150, 'g', 165, 31, 0, 3.6),
    createFood('Arroz integral', 80, 'g', 112, 2.6, 23, 0.9),
    createFood('Brócoli', 100, 'g', 34, 2.8, 7, 0.4),
    createFood('Aceite de oliva', 10, 'ml', 90, 0, 0, 10)
  ]
}

function selectDinnerFoods(profile: NutritionProfile, targetMacros: { calories: number, protein: number, carbs: number, fat: number }): MealFood[] {
  return [
    createFood('Salmón', 125, 'g', 208, 23, 0, 13),
    createFood('Batata', 100, 'g', 86, 1.6, 20, 0.1),
    createFood('Espinacas', 100, 'g', 23, 2.9, 3.6, 0.4),
    createFood('Aguacate', 50, 'g', 80, 1, 4, 7)
  ]
}

function selectSnackFoods(profile: NutritionProfile, targetMacros: { calories: number, protein: number, carbs: number, fat: number }): MealFood[] {
  return [
    createFood('Yogur griego', 150, 'g', 133, 15, 7, 4),
    createFood('Manzana', 1, 'unidad', 72, 0.4, 19, 0.2),
    createFood('Almendras', 15, 'g', 87, 3.2, 3, 7.5)
  ]
}

/**
 * Crea un objeto de alimento con valores predeterminados
 */
function createFood(name: string, amount: number, unit: string, calories: number, protein: number, carbs: number, fat: number): MealFood {
  return {
    id: uuidv4(),
    name,
    amount,
    unit,
    calories,
    protein,
    carbs,
    fat,
    isRecipeIngredient: false
  }
}

/**
 * Genera una receta simple basada en los alimentos
 */
function generateRecipe(foods: MealFood[]): string {
  const ingredients = foods.map(food => `${food.amount} ${food.unit} de ${food.name}`).join('\n- ')

  return `Ingredientes:
- ${ingredients}

Preparación:
1. Prepara todos los ingredientes.
2. Cocina los alimentos según sea necesario.
3. Combina todos los ingredientes en un plato.
4. ¡Disfruta de tu comida!`
}

/**
 * Traduce el objetivo a español para mostrar en la UI
 */
function translateGoal(goal: string): string {
  const translations: Record<string, string> = {
    'weight_loss': 'Pérdida de Peso',
    'muscle_gain': 'Ganancia Muscular',
    'maintenance': 'Mantenimiento',
    'performance': 'Rendimiento',
    'health_improvement': 'Mejora de la Salud'
  }

  return translations[goal] || 'Nutrición Personalizada'
}
