// Tipos para el módulo de nutrición

// Perfil nutricional del usuario
export type NutritionProfile = {
  id: string;
  user_id: string;
  height: number; // en cm
  current_weight: number; // en kg
  initial_weight: number; // en kg
  target_weight: number; // en kg
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle';
  diet_type: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'custom';
  meals_per_day: number;
  created_at: string;
  updated_at: string;
};

// Registro de peso
export type WeightLog = {
  id: string;
  user_id: string;
  date: string;
  weight: number; // en kg
  notes?: string;
  created_at: string;
};

// Preferencias alimentarias
export type FoodPreference = {
  id: string;
  user_id: string;
  food_category: string; // e.g., 'dairy', 'meat', 'vegetables'
  preference: 'like' | 'dislike' | 'allergic' | 'intolerant';
  specific_foods?: string[]; // Alimentos específicos dentro de la categoría
  notes?: string;
  created_at: string;
  updated_at: string;
};

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
  created_at?: string;
}

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
  created_at?: string;
  updated_at?: string;
  isCustom?: boolean;
  userId?: string;
}

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
  created_at?: string;
}

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
  created_at?: string;
  updated_at?: string;
}

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
  created_at?: string;
}

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
  created_at?: string;
  updated_at?: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string;
  amount: number;
  unit: 'ml' | 'oz';
  time: string;
  created_at?: string;
}

export type NutritionRecommendation = {
  id: string;
  user_id: string;
  recommendation_type: string; // 'meal', 'food', 'plan', 'goal', 'recipe'
  title: string;
  description: string;
  data: any;
  confidence: number; // 0-100
  is_applied: boolean;
  reason: string; // Razón de la recomendación
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at?: string;
  is_read: boolean;
};

export type NutritionAnalysis = {
  id: string;
  user_id: string;
  analysis_date: string;
  period: string; // 'day', 'week', 'month'
  calories_avg?: number;
  protein_avg?: number;
  carbs_avg?: number;
  fat_avg?: number;
  adherence_score?: number; // 0-100
  consistency_score?: number; // 0-100
  variety_score?: number; // 0-100
  weight_change?: number; // Cambio de peso en el período
  top_foods?: Array<{food_id: string, name: string, frequency: number}>; // Alimentos más consumidos
  nutritional_gaps?: Array<{nutrient: string, deficit: number}>; // Déficits nutricionales
  recommendations?: string[]; // Recomendaciones basadas en el análisis
  analysis_data?: any;
  created_at: string;
};

export interface MacroBreakdown {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'dinner', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
];

export interface NutritionSearchOptions {
  query?: string;
  date?: string;
  mealType?: MealType;
  limit?: number;
  offset?: number;
}

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

// Receta
export type Recipe = {
  id: string;
  name: string;
  description?: string;
  preparation_time: number; // en minutos
  cooking_time: number; // en minutos
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition_per_serving: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  tags: string[];
  image_url?: string;
  created_by: string; // user_id del creador
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

// Ingrediente de receta
export type RecipeIngredient = {
  food_id?: string;
  name: string;
  quantity: number;
  unit: string;
};
