// Exportar el cliente de Supabase
export { supabase } from './supabase-client';

// Importar tipos necesarios
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

// Definir tipos comunes
export type Workout = {
  id: string;
  user_id: string;
  date: string;
  type: string;
  name: string;
  sets?: string | null;
  reps?: string | null;
  weight?: string | null;
  duration?: string | null;
  distance?: string | null;
  notes?: string | null;
  created_at: string;
};

export type Mood = {
  id: string;
  user_id: string;
  date: string;
  mood_level: number;
  stress_level: number;
  sleep_hours: number;
  notes?: string | null;
  created_at: string;
};

export type Plan = {
  id: string;
  user_id: string;
  day: string;
  activities: {
    tipo: string;
    descripcion: string;
    icono: string;
  }[];
  created_at: string;
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

export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  level?: string | null;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
};

export type CommunityActivity = {
  id: string;
  user_id: string;
  type: string; // 'post', 'workout', 'achievement', etc.
  content: string;
  image_url?: string | null;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string | null;
  };
};

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscle_groups?: string[] | null;
  category: string;
  sub_category?: string | null;
  difficulty: string;
  equipment: string;
  description: string;
  image_url: string;
  video_url?: string | null;
  instructions?: string | null;
  tips?: string | null;
  variations?: string[] | null;
  calories_burned?: number | null;
  is_compound?: boolean;
  movement_pattern?: string | null;
  force_type?: string | null; // push, pull, etc.
  mechanics?: string | null; // isolation, compound
  created_at?: string;
  updated_at?: string;
  popularity?: number;
  average_rating?: number;
  tags?: string[] | null;
};

// Exportar funcionalidades de autenticación desde el cliente unificado
export { supabase } from './supabase-unified';

// Exportar funcionalidades de queries
export {
  // Funciones genéricas
  fetchOne,
  fetchByUserId,
  insert,
  update,
  remove,

  // Funciones específicas para workouts
  getWorkouts,
  getWorkoutById,
  addWorkout,
  updateWorkout,
  deleteWorkout,

  // Funciones específicas para moods
  getMoods,
  getMoodById,
  addMood,
  updateMood,
  deleteMood,

  // Funciones específicas para plans
  getPlans,
  getPlanById,
  addPlan,
  updatePlan,
  deletePlan,

  // Funciones específicas para nutrition
  getNutritionEntries,
  getNutritionEntryById,
  addNutritionEntry,
  updateNutritionEntry,
  deleteNutritionEntry,

  // Funciones específicas para profiles
  getUserProfile,
  createUserProfile,
  updateUserProfile,

  // Funciones específicas para community
  getCommunityActivities,
  getUserCommunityActivities,
  getCommunityActivityById,
  addCommunityActivity,
  updateCommunityActivity,
  deleteCommunityActivity,

  // Funciones para ejercicios
  getExercises,
  getExerciseById,
  searchExercises,
  getExerciseAlternatives,

  // Funciones avanzadas
  getWorkoutStats,
  getMoodTrends,
  searchWorkouts,
  getNutritionStats
} from './supabase-queries';

export type {
  QueryResponse
} from './supabase-queries';

// Exportar funcionalidades de storage
export {
  uploadFile,
  downloadFile,
  getPublicUrl,
  listFiles,
  removeFile,
  createBucketIfNotExists,

  // Funciones específicas para la aplicación
  uploadProfileImage,
  uploadWorkoutImage,
  uploadNutritionImage,
  uploadCommunityImage,
  getUserFiles,
  removeUserFile
} from './supabase-storage';

export type {
  StorageResponse,
  FileInfo,
  UploadOptions,
  DownloadOptions,
  ListOptions
} from './supabase-storage';

// Exportar funcionalidades de realtime
export {
  RealtimeSubscription,
  subscribeToWorkouts,
  subscribeToMoods,
  subscribeToPlans,
  subscribeToNutrition,
  subscribeToCommunityActivities,
  subscribeToUserProfile,
  subscribeToTable,
  subscribeToEvent
} from './supabase-realtime';

export type {
  SubscriptionCallback,
  SubscriptionOptions
} from './supabase-realtime';

// Función de utilidad para verificar la conexión a Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Error al verificar la conexión con Supabase:', error);
      return false;
    }

    console.log('Conexión a Supabase establecida correctamente');
    return true;
  } catch (err) {
    console.error('Error al verificar la conexión con Supabase:', err);
    return false;
  }
};
