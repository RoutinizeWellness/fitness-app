import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';
import {
  NutritionProfile,
  FoodItem,
  MealPlan,
  NutritionGoal,
  DietType
} from './types/nutrition';
import { calculateBMR, calculateTDEE } from './nutrition-profile-service';

// Tipos para el servicio de dietas personalizadas
export interface PersonalizedDiet {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  diet_type: DietType;
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  meals_per_day: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  notes?: string;
  adjustments_history?: DietAdjustment[];
  training_sync_enabled?: boolean;
}

export interface PersonalizedDietDay {
  id: string;
  diet_id: string;
  day_name: string;
  day_type: 'training' | 'rest' | 'low_carb' | 'high_carb' | 'standard';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: PersonalizedDietMeal[];
  notes?: string;
}

export interface PersonalizedDietMeal {
  id: string;
  diet_day_id: string;
  meal_name: string;
  meal_time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: PersonalizedDietFood[];
  notes?: string;
}

export interface PersonalizedDietFood {
  id: string;
  meal_id: string;
  food_id: string;
  food_name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_required: boolean;
  alternatives?: string[];
}

export interface DietAdjustment {
  date: string;
  adjusted_by: string;
  previous_calories: number;
  new_calories: number;
  previous_macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  new_macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  reason: string;
  notes?: string;
}

export interface DietAdherenceData {
  user_id: string;
  diet_id: string;
  date: string;
  adherence_score: number;
  calories_consumed: number;
  calories_target: number;
  protein_consumed: number;
  protein_target: number;
  carbs_consumed: number;
  carbs_target: number;
  fat_consumed: number;
  fat_target: number;
  meals_logged: number;
  meals_target: number;
  notes?: string;
}

// Función para crear una dieta personalizada
export async function createPersonalizedDiet(
  userId: string,
  dietType: DietType,
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle',
  mealsPerDay: number,
  createdBy?: string,
  preferences?: {
    excludedFoods?: string[];
    preferredFoods?: string[];
    mealTimes?: string[];
    carbCycling?: boolean;
    trainingSync?: boolean;
  }
): Promise<{
  data: PersonalizedDiet | null;
  error: Error | null;
}> {
  try {
    // Obtener perfil nutricional del usuario
    const { data: nutritionProfile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    // Obtener perfil de entrenamiento para sincronización
    const { data: trainingProfile, error: trainingError } = await supabase
      .from('user_training_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // No lanzamos error si no hay perfil de entrenamiento, simplemente lo manejamos

    // Calcular necesidades calóricas
    const bmr = calculateBMR(
      nutritionProfile.current_weight,
      nutritionProfile.height,
      nutritionProfile.age || 30,
      nutritionProfile.gender || 'male'
    );

    const tdee = calculateTDEE(bmr, nutritionProfile.activity_level);

    // Ajustar calorías según objetivo
    let caloriesTarget: number;

    switch (goal) {
      case 'lose_weight':
        caloriesTarget = tdee * 0.8; // Déficit del 20%
        break;
      case 'maintain':
        caloriesTarget = tdee;
        break;
      case 'gain_weight':
        caloriesTarget = tdee * 1.1; // Superávit del 10%
        break;
      case 'gain_muscle':
        caloriesTarget = tdee * 1.15; // Superávit del 15%
        break;
      default:
        caloriesTarget = tdee;
    }

    // Redondear calorías al múltiplo de 50 más cercano
    caloriesTarget = Math.round(caloriesTarget / 50) * 50;

    // Calcular macronutrientes
    let proteinTarget: number;
    let fatTarget: number;
    let carbsTarget: number;

    // Proteína basada en peso corporal y objetivo
    if (goal === 'lose_weight') {
      proteinTarget = nutritionProfile.current_weight * 2.2; // 2.2g por kg para preservar masa muscular
    } else if (goal === 'gain_muscle') {
      proteinTarget = nutritionProfile.current_weight * 2.0; // 2.0g por kg para construcción muscular
    } else {
      proteinTarget = nutritionProfile.current_weight * 1.8; // 1.8g por kg para mantenimiento
    }

    // Grasa mínima saludable (30% de calorías)
    fatTarget = (caloriesTarget * 0.3) / 9;

    // Carbohidratos para completar calorías restantes
    const proteinCalories = proteinTarget * 4;
    const fatCalories = fatTarget * 9;
    carbsTarget = (caloriesTarget - proteinCalories - fatCalories) / 4;

    // Ajustar según tipo de dieta
    if (dietType === 'keto') {
      // Keto: 70% grasa, 25% proteína, 5% carbos
      fatTarget = (caloriesTarget * 0.7) / 9;
      proteinTarget = (caloriesTarget * 0.25) / 4;
      carbsTarget = (caloriesTarget * 0.05) / 4;
    } else if (dietType === 'low_carb') {
      // Baja en carbos: 50% grasa, 30% proteína, 20% carbos
      fatTarget = (caloriesTarget * 0.5) / 9;
      proteinTarget = (caloriesTarget * 0.3) / 4;
      carbsTarget = (caloriesTarget * 0.2) / 4;
    } else if (dietType === 'high_protein') {
      // Alta en proteína: 30% grasa, 40% proteína, 30% carbos
      fatTarget = (caloriesTarget * 0.3) / 9;
      proteinTarget = (caloriesTarget * 0.4) / 4;
      carbsTarget = (caloriesTarget * 0.3) / 4;
    }

    // Redondear macros
    proteinTarget = Math.round(proteinTarget);
    carbsTarget = Math.round(carbsTarget);
    fatTarget = Math.round(fatTarget);

    // Crear dieta personalizada
    const diet: PersonalizedDiet = {
      id: uuidv4(),
      user_id: userId,
      name: `Dieta ${dietType} - ${goal.replace('_', ' ')}`,
      description: `Dieta personalizada para ${goal.replace('_', ' ')}`,
      diet_type: dietType,
      calories_target: caloriesTarget,
      protein_target: proteinTarget,
      carbs_target: carbsTarget,
      fat_target: fatTarget,
      meals_per_day: mealsPerDay,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy,
      is_active: true,
      start_date: new Date().toISOString(),
      training_sync_enabled: preferences?.trainingSync || false
    };

    // Guardar dieta en Supabase
    const { error: dietError } = await supabase
      .from('personalized_diets')
      .insert({
        id: diet.id,
        user_id: diet.user_id,
        name: diet.name,
        description: diet.description,
        diet_type: diet.diet_type,
        calories_target: diet.calories_target,
        protein_target: diet.protein_target,
        carbs_target: diet.carbs_target,
        fat_target: diet.fat_target,
        meals_per_day: diet.meals_per_day,
        created_at: diet.created_at,
        updated_at: diet.updated_at,
        created_by: diet.created_by,
        is_active: diet.is_active,
        start_date: diet.start_date,
        training_sync_enabled: diet.training_sync_enabled
      });

    if (dietError) throw dietError;

    // Crear días de dieta
    await createDietDays(diet, preferences?.carbCycling || false, trainingProfile?.frequency || 4);

    return { data: diet, error: null };
  } catch (error) {
    console.error('Error al crear dieta personalizada:', error);
    return { data: null, error: error as Error };
  }
}

// Función para crear días de dieta
async function createDietDays(
  diet: PersonalizedDiet,
  carbCycling: boolean,
  trainingDaysPerWeek: number
): Promise<void> {
  try {
    const dayTypes = ['standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard'];

    // Si hay ciclado de carbohidratos, configurar días altos y bajos
    if (carbCycling) {
      // Distribuir días de entrenamiento y descanso
      for (let i = 0; i < trainingDaysPerWeek; i++) {
        dayTypes[i] = 'training';
      }

      for (let i = trainingDaysPerWeek; i < 7; i++) {
        dayTypes[i] = 'rest';
      }

      // Asignar días altos en carbos a días de entrenamiento y bajos a días de descanso
      for (let i = 0; i < 7; i++) {
        if (dayTypes[i] === 'training') {
          dayTypes[i] = 'high_carb';
        } else if (dayTypes[i] === 'rest') {
          dayTypes[i] = 'low_carb';
        }
      }
    }

    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Crear cada día
    for (let i = 0; i < 7; i++) {
      const dayType = dayTypes[i] as 'standard' | 'high_carb' | 'low_carb';

      // Ajustar macros según tipo de día
      let dayCalories = diet.calories_target;
      let dayProtein = diet.protein_target;
      let dayCarbs = diet.carbs_target;
      let dayFat = diet.fat_target;

      if (dayType === 'high_carb') {
        dayCalories = Math.round(diet.calories_target * 1.1); // 10% más calorías
        dayCarbs = Math.round(diet.carbs_target * 1.3); // 30% más carbos
        dayFat = Math.round(diet.fat_target * 0.8); // 20% menos grasa
      } else if (dayType === 'low_carb') {
        dayCalories = Math.round(diet.calories_target * 0.9); // 10% menos calorías
        dayCarbs = Math.round(diet.carbs_target * 0.5); // 50% menos carbos
        dayFat = Math.round(diet.fat_target * 1.2); // 20% más grasa
      }

      const dietDay: PersonalizedDietDay = {
        id: uuidv4(),
        diet_id: diet.id,
        day_name: dayNames[i],
        day_type: dayType,
        calories: dayCalories,
        protein: dayProtein,
        carbs: dayCarbs,
        fat: dayFat,
        meals: [],
        notes: `Día de ${dayType === 'standard' ? 'alimentación estándar' :
                dayType === 'high_carb' ? 'carbohidratos altos' : 'carbohidratos bajos'}`
      };

      // Guardar día en Supabase
      const { error: dayError } = await supabase
        .from('personalized_diet_days')
        .insert({
          id: dietDay.id,
          diet_id: dietDay.diet_id,
          day_name: dietDay.day_name,
          day_type: dietDay.day_type,
          calories: dietDay.calories,
          protein: dietDay.protein,
          carbs: dietDay.carbs,
          fat: dietDay.fat,
          notes: dietDay.notes
        });

      if (dayError) throw dayError;

      // Crear comidas para este día
      await createMealsForDay(dietDay, diet.meals_per_day);
    }
  } catch (error) {
    console.error('Error al crear días de dieta:', error);
    throw error;
  }
}

// Función para crear comidas para un día
async function createMealsForDay(
  dietDay: PersonalizedDietDay,
  mealsPerDay: number
): Promise<void> {
  try {
    // Definir nombres y horas de comidas según cantidad
    const mealNames: string[] = [];
    const mealTimes: string[] = [];

    if (mealsPerDay === 3) {
      mealNames.push('Desayuno', 'Almuerzo', 'Cena');
      mealTimes.push('08:00', '13:00', '20:00');
    } else if (mealsPerDay === 4) {
      mealNames.push('Desayuno', 'Almuerzo', 'Merienda', 'Cena');
      mealTimes.push('08:00', '13:00', '17:00', '20:00');
    } else if (mealsPerDay === 5) {
      mealNames.push('Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena');
      mealTimes.push('08:00', '11:00', '14:00', '17:00', '20:00');
    } else if (mealsPerDay === 6) {
      mealNames.push('Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Post-cena');
      mealTimes.push('07:00', '10:00', '13:00', '16:00', '19:00', '22:00');
    } else {
      // Por defecto 3 comidas
      mealNames.push('Desayuno', 'Almuerzo', 'Cena');
      mealTimes.push('08:00', '13:00', '20:00');
    }

    // Distribuir calorías y macros entre comidas
    const caloriesPerMeal = Math.round(dietDay.calories / mealsPerDay);
    const proteinPerMeal = Math.round(dietDay.protein / mealsPerDay);
    const carbsPerMeal = Math.round(dietDay.carbs / mealsPerDay);
    const fatPerMeal = Math.round(dietDay.fat / mealsPerDay);

    // Crear cada comida
    for (let i = 0; i < mealsPerDay; i++) {
      const meal: PersonalizedDietMeal = {
        id: uuidv4(),
        diet_day_id: dietDay.id,
        meal_name: mealNames[i],
        meal_time: mealTimes[i],
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: carbsPerMeal,
        fat: fatPerMeal,
        foods: [],
        notes: `${mealNames[i]} para día de ${dietDay.day_type}`
      };

      // Guardar comida en Supabase
      const { error: mealError } = await supabase
        .from('personalized_diet_meals')
        .insert({
          id: meal.id,
          diet_day_id: meal.diet_day_id,
          meal_name: meal.meal_name,
          meal_time: meal.meal_time,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          notes: meal.notes
        });

      if (mealError) throw mealError;
    }
  } catch (error) {
    console.error('Error al crear comidas para día:', error);
    throw error;
  }
}

// Función para obtener dieta personalizada activa
export async function getActivePersonalizedDiet(userId: string): Promise<{
  data: PersonalizedDiet | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener dieta personalizada activa:', error);
    return { data: null, error: error as Error };
  }
}

// Función para obtener días de dieta
export async function getDietDays(dietId: string): Promise<{
  data: PersonalizedDietDay[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_days')
      .select('*')
      .eq('diet_id', dietId)
      .order('id');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener días de dieta:', error);
    return { data: null, error: error as Error };
  }
}

// Función para obtener comidas de un día
export async function getDietMeals(dayId: string): Promise<{
  data: PersonalizedDietMeal[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_meals')
      .select('*')
      .eq('diet_day_id', dayId)
      .order('meal_time');

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener comidas de día:', error);
    return { data: null, error: error as Error };
  }
}

// Función para registrar adherencia a la dieta
export async function recordDietAdherence(
  adherenceData: Omit<DietAdherenceData, 'id' | 'created_at'>
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const { error } = await supabase
      .from('diet_adherence')
      .insert({
        user_id: adherenceData.user_id,
        diet_id: adherenceData.diet_id,
        date: adherenceData.date,
        adherence_score: adherenceData.adherence_score,
        calories_consumed: adherenceData.calories_consumed,
        calories_target: adherenceData.calories_target,
        protein_consumed: adherenceData.protein_consumed,
        protein_target: adherenceData.protein_target,
        carbs_consumed: adherenceData.carbs_consumed,
        carbs_target: adherenceData.carbs_target,
        fat_consumed: adherenceData.fat_consumed,
        fat_target: adherenceData.fat_target,
        meals_logged: adherenceData.meals_logged,
        meals_target: adherenceData.meals_target,
        notes: adherenceData.notes,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al registrar adherencia a dieta:', error);
    return { success: false, error: error as Error };
  }
}

// Función para obtener una dieta personalizada por ID
export async function getPersonalizedDiet(dietId: string): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diets')
      .select('*')
      .eq('id', dietId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener dieta personalizada:', error);
    return { data: null, error: error as Error };
  }
}

// Función para obtener alimentos de una comida
export async function getDietFoods(mealId: string): Promise<{
  data: any[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_foods')
      .select('*')
      .eq('meal_id', mealId);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener alimentos de comida:', error);
    return { data: null, error: error as Error };
  }
}

// Función para obtener todas las dietas personalizadas de un usuario
export async function getUserDiets(userId: string): Promise<{
  data: any[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener dietas del usuario:', error);
    return { data: null, error: error as Error };
  }
}

// Función para actualizar una dieta personalizada
export async function updatePersonalizedDiet(
  dietId: string,
  updates: Partial<PersonalizedDiet>
): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', dietId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar dieta personalizada:', error);
    return { data: null, error: error as Error };
  }
}

// Función para actualizar un día de dieta
export async function updateDietDay(
  dayId: string,
  updates: Partial<any>
): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_days')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', dayId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar día de dieta:', error);
    return { data: null, error: error as Error };
  }
}

// Función para actualizar una comida de dieta
export async function updateDietMeal(
  mealId: string,
  updates: Partial<any>
): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_meals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', mealId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar comida de dieta:', error);
    return { data: null, error: error as Error };
  }
}

// Función para actualizar un alimento de dieta
export async function updateDietFood(
  foodId: string,
  updates: Partial<any>
): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('personalized_diet_foods')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', foodId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar alimento de dieta:', error);
    return { data: null, error: error as Error };
  }
}

// Función para eliminar un alimento de dieta
export async function deleteDietFood(
  foodId: string
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const { error } = await supabase
      .from('personalized_diet_foods')
      .delete()
      .eq('id', foodId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar alimento de dieta:', error);
    return { success: false, error: error as Error };
  }
}

// Función para añadir un alimento a una comida
export async function addDietFood(
  mealId: string,
  food: {
    name: string;
    serving_size: number;
    serving_unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    const newFood = {
      id: uuidv4(),
      meal_id: mealId,
      name: food.name,
      serving_size: food.serving_size,
      serving_unit: food.serving_unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('personalized_diet_foods')
      .insert(newFood)
      .select()
      .single();

    if (error) throw error;

    // Actualizar los totales de la comida
    const { data: mealData, error: mealError } = await supabase
      .from('personalized_diet_meals')
      .select('*')
      .eq('id', mealId)
      .single();

    if (mealError) throw mealError;

    const updatedMeal = {
      total_calories: mealData.total_calories + food.calories,
      total_protein: mealData.total_protein + food.protein,
      total_carbs: mealData.total_carbs + food.carbs,
      total_fat: mealData.total_fat + food.fat,
      updated_at: new Date().toISOString()
    };

    await updateDietMeal(mealId, updatedMeal);

    // Actualizar los totales del día
    const { data: dayData, error: dayError } = await supabase
      .from('personalized_diet_days')
      .select('*')
      .eq('id', mealData.diet_day_id)
      .single();

    if (dayError) throw dayError;

    const updatedDay = {
      total_calories: dayData.total_calories + food.calories,
      total_protein: dayData.total_protein + food.protein,
      total_carbs: dayData.total_carbs + food.carbs,
      total_fat: dayData.total_fat + food.fat,
      updated_at: new Date().toISOString()
    };

    await updateDietDay(dayData.id, updatedDay);

    return { data, error: null };
  } catch (error) {
    console.error('Error al añadir alimento a comida:', error);
    return { data: null, error: error as Error };
  }
}
