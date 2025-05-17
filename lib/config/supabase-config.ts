/**
 * Configuración centralizada para Supabase
 */

// Tablas de Supabase
export const TABLES = {
  PROFILES: 'profiles',
  WORKOUT_ROUTINES: 'workout_routines',
  WORKOUT_LOGS: 'workout_logs',
  EXERCISES: 'exercises',
  TRAINING_PROFILES: 'training_profiles',
  POSTURE_ANALYSIS: 'posture_analysis',
  TRAINING_RECOMMENDATIONS: 'training_recommendations'
}

// Columnas comunes
export const COLUMNS = {
  ID: 'id',
  USER_ID: 'user_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
}

// Configuración de almacenamiento
export const STORAGE = {
  AVATARS: 'avatars',
  EXERCISE_IMAGES: 'exercise_images',
  EXERCISE_VIDEOS: 'exercise_videos',
  POSTURE_ANALYSIS: 'posture_analysis'
}

// Configuración de autenticación
export const AUTH = {
  REDIRECT_URL: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  RESET_PASSWORD_URL: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : ''
}

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

// Configuración de caché
export const CACHE = {
  TTL: 5 * 60 * 1000, // 5 minutos en milisegundos
  PROFILES: 'profiles',
  WORKOUT_ROUTINES: 'workout_routines',
  WORKOUT_LOGS: 'workout_logs',
  EXERCISES: 'exercises'
}
