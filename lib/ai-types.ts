// Tipos para las funcionalidades de IA

export interface AIRecommendation {
  id: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'mindfulness';
  title: string;
  description: string;
  confidence: number; // 0-100
  reason: string;
  exercises?: string[]; // IDs de ejercicios recomendados
  tags: string[];
  created_at: string;
}

export interface AIWorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  sessions_per_week: number;
  focus_areas: string[];
  workouts: AIWorkout[];
  created_at: string;
}

export interface AIWorkout {
  id: string;
  day: number; // 1-7 (lunes-domingo)
  title: string;
  description: string;
  duration_minutes: number;
  exercises: AIWorkoutExercise[];
  intensity: 'low' | 'moderate' | 'high';
}

export interface AIWorkoutExercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  notes?: string;
}

export interface AIProgressAnalysis {
  id: string;
  period: 'week' | 'month' | '3months';
  start_date: string;
  end_date: string;
  summary: string;
  metrics: {
    volume_change: number; // porcentaje
    strength_change: number; // porcentaje
    consistency: number; // 0-100
    recovery_quality: number; // 0-100
  };
  insights: string[];
  recommendations: string[];
  created_at: string;
}

export interface AIQuery {
  query: string;
  context?: {
    user_id?: string;
    recent_workouts?: boolean;
    fitness_level?: string;
    goals?: string[];
    limitations?: string[];
  };
}

export interface AIResponse {
  answer: string;
  sources?: {
    title: string;
    url?: string;
  }[];
  related_exercises?: string[]; // IDs de ejercicios relacionados
}
