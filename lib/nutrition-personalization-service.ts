import { supabase } from "@/lib/supabase-client"

// Tipos para el servicio de personalización nutricional
export interface NutritionProfile {
  userId: string
  primaryGoal: string
  dietType: string
  mealFrequency: number
  allergies: string[]
  intolerances: string[]
  favoriteProteinSources: string[]
  favoriteCarbohydrateSources: string[]
  favoriteFatSources: string[]
  favoriteVegetables: string[]
  favoriteFruits: string[]
  dislikedFoods: string[]
  currentWeight: number
  height: number
  age: number
  gender: string
  activityLevel: string
  lastUpdated: string
}

export interface MacroDistribution {
  protein: number // en gramos
  carbs: number // en gramos
  fat: number // en gramos
  calories: number // total
}

/**
 * Obtiene el perfil nutricional del usuario
 */
export async function getNutritionProfile(userId: string) {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('nutrition_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        // Tabla no existe o no se encontraron filas
        console.log('No se encontró perfil nutricional, generando perfil por defecto')
        return { data: generateDefaultNutritionProfile(userId), error: null }
      }
      
      console.error('Error al obtener perfil nutricional:', error)
      return { data: null, error }
    }
    
    if (data) {
      // Transformar datos al formato de la aplicación
      const assessmentData = data.assessment_data
      
      const nutritionProfile: NutritionProfile = {
        userId,
        primaryGoal: assessmentData.primaryGoal || 'weight_loss',
        dietType: assessmentData.dietType || 'omnivore',
        mealFrequency: assessmentData.mealFrequency || 3,
        allergies: assessmentData.allergies || [],
        intolerances: assessmentData.intolerances || [],
        favoriteProteinSources: assessmentData.favoriteProteinSources || [],
        favoriteCarbohydrateSources: assessmentData.favoriteCarbohydrateSources || [],
        favoriteFatSources: assessmentData.favoriteFatSources || [],
        favoriteVegetables: assessmentData.favoriteVegetables || [],
        favoriteFruits: assessmentData.favoriteFruits || [],
        dislikedFoods: assessmentData.dislikedFoods || [],
        currentWeight: assessmentData.currentWeight || 70,
        height: assessmentData.height || 170,
        age: assessmentData.age || 30,
        gender: assessmentData.gender || 'male',
        activityLevel: assessmentData.activityLevel || 'moderately_active',
        lastUpdated: data.created_at
      }
      
      return { data: nutritionProfile, error: null }
    }
    
    // Si no hay datos, generar perfil por defecto
    return { data: generateDefaultNutritionProfile(userId), error: null }
  } catch (error) {
    console.error('Error en getNutritionProfile:', error)
    return { data: generateDefaultNutritionProfile(userId), error }
  }
}

/**
 * Calcula las necesidades calóricas diarias del usuario
 */
export function calculateDailyCalories(profile: NutritionProfile): number {
  // Fórmula de Harris-Benedict para calcular el metabolismo basal (BMR)
  let bmr = 0
  
  if (profile.gender === 'male') {
    // Hombres: BMR = 88.362 + (13.397 × peso en kg) + (4.799 × altura en cm) - (5.677 × edad en años)
    bmr = 88.362 + (13.397 * profile.currentWeight) + (4.799 * profile.height) - (5.677 * profile.age)
  } else {
    // Mujeres: BMR = 447.593 + (9.247 × peso en kg) + (3.098 × altura en cm) - (4.330 × edad en años)
    bmr = 447.593 + (9.247 * profile.currentWeight) + (3.098 * profile.height) - (4.330 * profile.age)
  }
  
  // Multiplicador según nivel de actividad
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2, // Poco o ningún ejercicio
    'lightly_active': 1.375, // Ejercicio ligero 1-3 días/semana
    'moderately_active': 1.55, // Ejercicio moderado 3-5 días/semana
    'very_active': 1.725, // Ejercicio intenso 6-7 días/semana
    'extremely_active': 1.9 // Ejercicio muy intenso, trabajo físico o entrenamiento 2x/día
  }
  
  const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.55)
  
  // Ajustar según objetivo
  let calorieTarget = tdee
  
  switch (profile.primaryGoal) {
    case 'weight_loss':
      calorieTarget = tdee * 0.8 // Déficit del 20%
      break
    case 'muscle_gain':
      calorieTarget = tdee * 1.1 // Superávit del 10%
      break
    case 'performance':
      calorieTarget = tdee * 1.05 // Ligero superávit del 5%
      break
    default:
      // Mantenimiento o mejora de salud
      calorieTarget = tdee
  }
  
  return Math.round(calorieTarget)
}

/**
 * Calcula la distribución de macronutrientes según el perfil y objetivo
 */
export function calculateMacroDistribution(profile: NutritionProfile): MacroDistribution {
  const dailyCalories = calculateDailyCalories(profile)
  
  // Valores por defecto
  let proteinPercentage = 0.3 // 30% de las calorías
  let fatPercentage = 0.3 // 30% de las calorías
  let carbPercentage = 0.4 // 40% de las calorías
  
  // Ajustar según objetivo y tipo de dieta
  switch (profile.primaryGoal) {
    case 'weight_loss':
      proteinPercentage = 0.35
      fatPercentage = 0.35
      carbPercentage = 0.3
      break
    case 'muscle_gain':
      proteinPercentage = 0.3
      fatPercentage = 0.25
      carbPercentage = 0.45
      break
    case 'performance':
      proteinPercentage = 0.25
      fatPercentage = 0.25
      carbPercentage = 0.5
      break
  }
  
  // Ajustar según tipo de dieta
  switch (profile.dietType) {
    case 'keto':
      proteinPercentage = 0.3
      fatPercentage = 0.65
      carbPercentage = 0.05
      break
    case 'paleo':
      proteinPercentage = 0.35
      fatPercentage = 0.4
      carbPercentage = 0.25
      break
    case 'vegan':
    case 'vegetarian':
      // Ligeramente menos proteína, más carbohidratos
      proteinPercentage = Math.max(0.2, proteinPercentage - 0.05)
      carbPercentage = Math.min(0.6, carbPercentage + 0.05)
      break
  }
  
  // Calcular gramos de cada macronutriente
  // Proteína: 4 calorías por gramo
  // Carbohidratos: 4 calorías por gramo
  // Grasas: 9 calorías por gramo
  const proteinGrams = Math.round((dailyCalories * proteinPercentage) / 4)
  const carbGrams = Math.round((dailyCalories * carbPercentage) / 4)
  const fatGrams = Math.round((dailyCalories * fatPercentage) / 9)
  
  // Verificar que los gramos de proteína sean suficientes (mínimo 1.6g por kg de peso corporal para ganancia muscular)
  if (profile.primaryGoal === 'muscle_gain' && proteinGrams < profile.currentWeight * 1.6) {
    const minProteinGrams = Math.round(profile.currentWeight * 1.6)
    const additionalProteinCalories = (minProteinGrams - proteinGrams) * 4
    
    // Redistribuir las calorías
    const remainingCalories = dailyCalories - (minProteinGrams * 4)
    const newFatGrams = Math.round((remainingCalories * (fatPercentage / (fatPercentage + carbPercentage))) / 9)
    const newCarbGrams = Math.round((remainingCalories * (carbPercentage / (fatPercentage + carbPercentage))) / 4)
    
    return {
      protein: minProteinGrams,
      carbs: newCarbGrams,
      fat: newFatGrams,
      calories: dailyCalories
    }
  }
  
  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    calories: dailyCalories
  }
}

/**
 * Genera un perfil nutricional por defecto
 */
function generateDefaultNutritionProfile(userId: string): NutritionProfile {
  return {
    userId,
    primaryGoal: 'weight_loss',
    dietType: 'omnivore',
    mealFrequency: 3,
    allergies: [],
    intolerances: [],
    favoriteProteinSources: ['pollo', 'huevos', 'atún'],
    favoriteCarbohydrateSources: ['arroz', 'patatas', 'pan integral'],
    favoriteFatSources: ['aceite de oliva', 'aguacate', 'frutos secos'],
    favoriteVegetables: ['brócoli', 'espinacas', 'zanahorias'],
    favoriteFruits: ['plátano', 'manzana', 'fresas'],
    dislikedFoods: [],
    currentWeight: 70,
    height: 170,
    age: 30,
    gender: 'male',
    activityLevel: 'moderately_active',
    lastUpdated: new Date().toISOString()
  }
}
