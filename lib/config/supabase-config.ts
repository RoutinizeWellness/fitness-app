/**
 * Supabase Configuration
 *
 * This file contains constants for Supabase tables, columns, and other configuration.
 * Use these constants instead of hardcoding table and column names to ensure consistency
 * and make it easier to update if the database schema changes.
 */

// Table names
export const TABLES = {
  // User profiles
  PROFILES: 'profiles',
  USER_INTERFACE_PREFERENCES: 'user_interface_preferences',

  // Training module
  EXERCISES: 'exercises',
  WORKOUT_ROUTINES: 'workout_routines',
  WORKOUT_LOGS: 'workout_logs',
  TRAINING_PROFILES: 'training_profiles',
  PERFORMANCE_METRICS: 'performance_metrics',
  PERIODIZATION_PLANS: 'periodization_plans',
  TRAINING_RECOMMENDATIONS: 'training_recommendations',
  POSTURE_ANALYSIS: 'posture_analysis',

  // Nutrition module
  NUTRITION_PROFILES: 'nutrition_profiles',
  WEIGHT_LOGS: 'weight_logs',
  FOOD_PREFERENCES: 'food_preferences',
  FOOD_DATABASE: 'food_database',
  CUSTOM_FOODS: 'custom_foods',
  NUTRITION_ENTRIES: 'nutrition_entries',
  MEAL_PLANS: 'meal_plans',
  MEAL_PLAN_DETAILS: 'meal_plan_details',
  NUTRITION_GOALS: 'nutrition_goals',
  WATER_LOGS: 'water_logs',
  RECIPES: 'recipes',

  // Wellness module
  MOOD_LOGS: 'mood_logs',
  SLEEP_LOGS: 'sleep_logs',
  BREATHING_SESSIONS: 'breathing_sessions',
  MEDITATION_SESSIONS: 'meditation_sessions',
  MINDFULNESS_EXERCISES: 'mindfulness_exercises',
  WELLNESS_GOALS: 'wellness_goals',
  CORPORATE_WELLNESS_PROGRAMS: 'corporate_wellness_programs',
  CORPORATE_WELLNESS_PARTICIPANTS: 'corporate_wellness_participants',

  // Productivity module
  TASKS: 'tasks',
  FOCUS_SESSIONS: 'focus_sessions',
  HABITS: 'habits',
  HABIT_LOGS: 'habit_logs',
  PRODUCTIVITY_GOALS: 'productivity_goals',
  PRODUCTIVITY_PROFILES: 'productivity_profiles'
}

// Column names for common fields
export const COLUMNS = {
  // Common columns
  ID: 'id',
  USER_ID: 'user_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',

  // Profile columns
  FULL_NAME: 'full_name',
  AVATAR_URL: 'avatar_url',
  WEIGHT: 'weight',
  HEIGHT: 'height',
  GOAL: 'goal',
  LEVEL: 'level',
  IS_ADMIN: 'is_admin',
  EXPERIENCE_LEVEL: 'experience_level',
  INTERFACE_MODE: 'interface_mode',
  EXPERIENCE_DETAILS: 'experience_details',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ADVANCED_FEATURES_ENABLED: 'advanced_features_enabled',

  // Exercise columns
  NAME: 'name',
  DESCRIPTION: 'description',
  CATEGORY: 'category',
  MUSCLE_GROUP: 'muscle_group',
  SECONDARY_MUSCLE_GROUPS: 'secondary_muscle_groups',
  DIFFICULTY: 'difficulty',
  EQUIPMENT: 'equipment',
  IS_COMPOUND: 'is_compound',
  IMAGE_URL: 'image_url',
  VIDEO_URL: 'video_url',
  INSTRUCTIONS: 'instructions',
  TIPS: 'tips',
  ALTERNATIVES: 'alternatives',

  // Workout routine columns
  FREQUENCY: 'frequency',
  DAYS: 'days',
  IS_TEMPLATE: 'is_template',
  IS_PUBLIC: 'is_public',
  PERIODIZATION_TYPE: 'periodization_type',
  MESOCYCLE_DATA: 'mesocycle_data',

  // Workout log columns
  ROUTINE_ID: 'routine_id',
  DAY_ID: 'day_id',
  DATE: 'date',
  START_TIME: 'start_time',
  END_TIME: 'end_time',
  DURATION: 'duration',
  EXERCISES: 'exercises',
  NOTES: 'notes',
  RATING: 'rating',
  FATIGUE_LEVEL: 'fatigue_level',

  // Nutrition columns
  CALORIES: 'calories',
  PROTEIN: 'protein',
  CARBS: 'carbs',
  FAT: 'fat',
  FIBER: 'fiber',
  SUGAR: 'sugar',
  SODIUM: 'sodium',
  CHOLESTEROL: 'cholesterol',
  WATER: 'water',

  // Wellness columns
  MOOD_LEVEL: 'mood_level',
  STRESS_LEVEL: 'stress_level',
  ENERGY_LEVEL: 'energy_level',
  SLEEP_START: 'sleep_start',
  SLEEP_END: 'sleep_end',
  QUALITY: 'quality',
  DEEP_SLEEP: 'deep_sleep',
  REM_SLEEP: 'rem_sleep',
  LIGHT_SLEEP: 'light_sleep',
  AWAKE_TIME: 'awake_time',

  // Productivity columns
  TITLE: 'title',
  DUE_DATE: 'due_date',
  DUE_TIME: 'due_time',
  PRIORITY: 'priority',
  STATUS: 'status',
  TAGS: 'tags',
  ESTIMATED_TIME: 'estimated_time',
  ACTUAL_TIME: 'actual_time'
}

// Storage bucket names
export const STORAGE = {
  AVATARS: 'avatars',
  EXERCISE_IMAGES: 'exercise_images',
  EXERCISE_VIDEOS: 'exercise_videos',
  POSTURE_ANALYSIS: 'posture_analysis',
  RECIPE_IMAGES: 'recipe_images',
  FOOD_IMAGES: 'food_images'
}

// Authentication configuration
export const AUTH = {
  REDIRECT_URL: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback',
  RESET_PASSWORD_URL: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : 'http://localhost:3000/auth/reset-password'
}

// Pagination configuration
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

// Cache configuration
export const CACHE = {
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  PROFILES: 'profiles',
  WORKOUT_ROUTINES: 'workout_routines',
  WORKOUT_LOGS: 'workout_logs',
  EXERCISES: 'exercises'
}

// Experience levels
export const EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ELITE: 'elite'
}

// Interface modes
export const INTERFACE_MODES = {
  BEGINNER: 'beginner',
  ADVANCED: 'advanced'
}

// Training goals
export const TRAINING_GOALS = {
  STRENGTH: 'strength',
  HYPERTROPHY: 'hypertrophy',
  ENDURANCE: 'endurance',
  POWER: 'power',
  WEIGHT_LOSS: 'weight_loss',
  GENERAL_FITNESS: 'general_fitness',
  SPORT_SPECIFIC: 'sport_specific'
}

// Nutrition goals
export const NUTRITION_GOALS = {
  LOSE_WEIGHT: 'lose_weight',
  MAINTAIN: 'maintain',
  GAIN_WEIGHT: 'gain_weight',
  GAIN_MUSCLE: 'gain_muscle'
}

// Diet types
export const DIET_TYPES = {
  STANDARD: 'standard',
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  KETO: 'keto',
  PALEO: 'paleo',
  MEDITERRANEAN: 'mediterranean',
  CUSTOM: 'custom'
}

// Activity levels
export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary',
  LIGHT: 'light',
  MODERATE: 'moderate',
  ACTIVE: 'active',
  VERY_ACTIVE: 'very_active'
}

// Periodization types
export const PERIODIZATION_TYPES = {
  LINEAR: 'linear',
  UNDULATING: 'undulating',
  BLOCK: 'block',
  CONJUGATE: 'conjugate',
  REVERSE_LINEAR: 'reverse_linear',
  CONCURRENT: 'concurrent'
}

// Task priorities
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

// Task statuses
export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Habit frequencies
export const HABIT_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom'
}

// Meal types
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
}

// Recipe difficulties
export const RECIPE_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

export default {
  TABLES,
  COLUMNS,
  STORAGE,
  AUTH,
  PAGINATION,
  CACHE,
  EXPERIENCE_LEVELS,
  INTERFACE_MODES,
  TRAINING_GOALS,
  NUTRITION_GOALS,
  DIET_TYPES,
  ACTIVITY_LEVELS,
  PERIODIZATION_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  HABIT_FREQUENCIES,
  MEAL_TYPES,
  RECIPE_DIFFICULTIES
}
