/**
 * Tipos mejorados para el módulo de nutrición
 * Incluye documentación, interfaces estandarizadas y convenciones de nomenclatura consistentes
 */

/**
 * Perfil nutricional del usuario
 */
export interface NutritionProfile {
  id: string;
  userId: string;
  height: number; // en cm
  currentWeight: number; // en kg
  initialWeight: number; // en kg
  targetWeight: number; // en kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle';
  dietType: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'custom';
  mealsPerDay: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Registro de peso del usuario
 */
export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number; // en kg
  notes?: string;
  createdAt: string;
}

/**
 * Preferencias alimentarias del usuario
 */
export interface FoodPreference {
  id: string;
  userId: string;
  foodCategory: string; // e.g., 'dairy', 'meat', 'vegetables'
  preference: 'like' | 'dislike' | 'allergic' | 'intolerant';
  specificFoods?: string[]; // Alimentos específicos dentro de la categoría
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Entrada de nutrición en el diario del usuario
 */
export interface NutritionEntry {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId: string;
  foodName: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  notes?: string;
  createdAt?: string;
}

/**
 * Alimento en la base de datos
 */
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  imageUrl?: string;
  barcode?: string;
  isVerified?: boolean;
  category?: string;
  alternativeFoods?: string[]; // IDs de alimentos alternativos
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
  userId?: string;
}

/**
 * Alimento personalizado creado por el usuario
 */
export interface CustomFood {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  imageUrl?: string;
  isFavorite?: boolean;
  createdAt?: string;
}

/**
 * Plan de comidas
 */
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isTemplate?: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Detalle de un plan de comidas
 */
export interface MealPlanDetail {
  id: string;
  mealPlanId: string;
  dayOfWeek?: number; // 0-6 (domingo-sábado)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId: string;
  foodName: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  alternativeFoodIds?: string[]; // IDs de alimentos alternativos
  createdAt?: string;
}

/**
 * Objetivos nutricionales del usuario
 */
export interface NutritionGoal {
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  waterIntake?: number; // ml
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Registro de consumo de agua
 */
export interface WaterLog {
  id: string;
  userId: string;
  date: string;
  amount: number;
  unit: 'ml' | 'oz';
  time: string;
  createdAt?: string;
}

/**
 * Recomendación nutricional generada para el usuario
 */
export interface NutritionRecommendation {
  id: string;
  userId: string;
  type: 'meal' | 'food' | 'habit' | 'supplement';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  isImplemented: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Análisis nutricional de la dieta del usuario
 */
export interface NutritionAnalysis {
  userId: string;
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  macroDistribution: {
    protein: number; // porcentaje
    carbs: number; // porcentaje
    fat: number; // porcentaje
  };
  mealDistribution: {
    breakfast: number; // porcentaje
    lunch: number; // porcentaje
    dinner: number; // porcentaje
    snack: number; // porcentaje
  };
  nutrientDeficiencies: string[];
  nutrientExcesses: string[];
  consistencyScore: number; // 0-100
  recommendations: string[];
  createdAt: string;
}

/**
 * Desglose de macronutrientes
 */
export interface MacroBreakdown {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Estadísticas nutricionales diarias
 */
export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalSugar?: number;
  totalSodium?: number;
  totalCholesterol?: number;
  totalWater?: number;
  caloriesGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  fiberGoal?: number;
  sugarGoal?: number;
  sodiumGoal?: number;
  cholesterolGoal?: number;
  waterGoal?: number;
  caloriesPercentage?: number;
  proteinPercentage?: number;
  carbsPercentage?: number;
  fatPercentage?: number;
  fiberPercentage?: number;
  sugarPercentage?: number;
  sodiumPercentage?: number;
  cholesterolPercentage?: number;
  waterPercentage?: number;
  mealBreakdown?: {
    breakfast: MacroBreakdown;
    lunch: MacroBreakdown;
    dinner: MacroBreakdown;
    snack: MacroBreakdown;
  };
  entries?: number;
  meals?: {
    [key: string]: NutritionEntry[];
  };
}

/**
 * Tipo de comida
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Opciones de tipos de comida para UI
 */
export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'dinner', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
];

/**
 * Opciones para búsqueda de entradas de nutrición
 */
export interface NutritionSearchOptions {
  query?: string;
  date?: string;
  mealType?: MealType;
  limit?: number;
  offset?: number;
}

/**
 * Estadísticas nutricionales para análisis
 */
export interface NutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  caloriesTrend: {
    date: string;
    value: number;
  }[];
  macroDistribution: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTypeDistribution: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  topFoods: {
    id: string;
    name: string;
    count: number;
  }[];
  consistencyScore: number;
  streakDays: number;
}
