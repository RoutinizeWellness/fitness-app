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

export type NutritionEntry = {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string | null;
  created_at: string;
};

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  serving_size: string;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  image_url?: string;
  barcode?: string;
  is_verified?: boolean;
  category?: string;
  alternative_foods?: string[]; // IDs de alimentos alternativos
  created_at?: string;
  updated_at?: string;
};

export type CustomFood = FoodItem & {
  user_id: string;
  is_favorite: boolean;
};

export type MealPlan = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
};

export type MealPlanDetail = {
  id: string;
  meal_plan_id: string;
  day_of_week: number; // 0-6 (domingo-sábado)
  meal_type: string; // 'desayuno', 'almuerzo', 'cena', 'snack'
  food_id?: string;
  custom_food_id?: string;
  food_name: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  alternative_food_ids?: string[]; // IDs de alimentos alternativos
  created_at: string;
  updated_at?: string;
};

export type NutritionGoal = {
  id: string;
  user_id: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  water?: number; // ml
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
};

export type WaterLog = {
  id: string;
  user_id: string;
  date: string;
  amount: number; // ml
  created_at: string;
};

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

export type MacroBreakdown = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyNutrition = MacroBreakdown & {
  entries: number;
  meals: {
    [key: string]: NutritionEntry[];
  };
};

export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack';

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'desayuno', label: 'Desayuno' },
  { value: 'almuerzo', label: 'Almuerzo' },
  { value: 'cena', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
];

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
