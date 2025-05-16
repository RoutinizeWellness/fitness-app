import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';

// Tipos para evaluaciones y estadísticas
export interface ClientEvaluation {
  id: string;
  user_id: string;
  evaluator_id: string;
  evaluation_date: string;
  overall_score: number; // 1-10
  training_score: number; // 1-10
  nutrition_score: number; // 1-10
  adherence_score: number; // 1-10
  progress_score: number; // 1-10
  notes: string;
  goals_achieved: string[];
  areas_to_improve: string[];
  recommendations: string[];
  next_evaluation_date?: string;
}

export interface ClientStatistics {
  user_id: string;
  training_stats: {
    total_workouts: number;
    completed_workouts: number;
    completion_rate: number;
    average_duration: number; // minutos
    favorite_exercises: Array<{name: string, count: number}>;
    workout_frequency: number; // días por semana
    workout_intensity: number; // 1-10
    workout_volume: number; // series x repeticiones promedio
    progress_rate: number; // 1-10
  };
  nutrition_stats: {
    total_meal_plans: number;
    adherence_rate: number;
    average_calories: number;
    average_protein: number;
    average_carbs: number;
    average_fat: number;
    water_intake: number;
    meal_frequency: number;
    most_consumed_foods: Array<{name: string, count: number}>;
  };
  body_stats: {
    initial_weight?: number;
    current_weight?: number;
    weight_change?: number;
    weight_change_percentage?: number;
    initial_body_fat?: number;
    current_body_fat?: number;
    body_fat_change?: number;
    initial_muscle_mass?: number;
    current_muscle_mass?: number;
    muscle_mass_change?: number;
  };
  wellness_stats: {
    average_sleep_duration: number;
    average_sleep_quality: number;
    average_stress_level: number;
    average_recovery_score: number;
    average_energy_level: number;
    meditation_frequency: number;
  };
  goal_stats: {
    total_goals: number;
    achieved_goals: number;
    in_progress_goals: number;
    achievement_rate: number;
    average_completion_time: number; // días
  };
}

export interface ClientPerformanceHistory {
  user_id: string;
  evaluations: ClientEvaluation[];
  metrics_history: Array<{
    date: string;
    weight?: number;
    body_fat?: number;
    muscle_mass?: number;
    workout_completion_rate?: number;
    nutrition_adherence_rate?: number;
    overall_score?: number;
  }>;
}

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Obtiene las estadísticas de un cliente
 */
export const getClientStatistics = async (
  userId: string
): Promise<QueryResponse<ClientStatistics>> => {
  try {
    // En una implementación real, aquí se obtendrían datos de varias tablas
    // Para este ejemplo, generamos estadísticas simuladas
    
    // Obtener perfil del usuario para datos básicos
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Obtener rutinas de entrenamiento
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId);
    
    if (workoutsError) throw workoutsError;
    
    // Obtener planes de nutrición
    const { data: mealPlans, error: mealPlansError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId);
    
    if (mealPlansError) throw mealPlansError;
    
    // Generar estadísticas basadas en los datos reales y algunos simulados
    const statistics: ClientStatistics = {
      user_id: userId,
      training_stats: {
        total_workouts: workouts?.length || 0,
        completed_workouts: Math.floor(Math.random() * 50) + 10,
        completion_rate: Math.floor(Math.random() * 30) + 70, // 70-100%
        average_duration: Math.floor(Math.random() * 30) + 45, // 45-75 minutos
        favorite_exercises: [
          { name: "Sentadilla", count: Math.floor(Math.random() * 20) + 10 },
          { name: "Press de banca", count: Math.floor(Math.random() * 20) + 10 },
          { name: "Peso muerto", count: Math.floor(Math.random() * 20) + 10 },
          { name: "Dominadas", count: Math.floor(Math.random() * 20) + 5 },
          { name: "Fondos", count: Math.floor(Math.random() * 20) + 5 }
        ],
        workout_frequency: Math.floor(Math.random() * 3) + 3, // 3-5 días por semana
        workout_intensity: Math.floor(Math.random() * 3) + 7, // 7-9 de 10
        workout_volume: Math.floor(Math.random() * 100) + 100, // 100-200
        progress_rate: Math.floor(Math.random() * 3) + 7 // 7-9 de 10
      },
      nutrition_stats: {
        total_meal_plans: mealPlans?.length || 0,
        adherence_rate: Math.floor(Math.random() * 30) + 70, // 70-100%
        average_calories: Math.floor(Math.random() * 500) + 1800, // 1800-2300 kcal
        average_protein: Math.floor(Math.random() * 50) + 120, // 120-170g
        average_carbs: Math.floor(Math.random() * 100) + 150, // 150-250g
        average_fat: Math.floor(Math.random() * 30) + 50, // 50-80g
        water_intake: Math.floor(Math.random() * 1000) + 2000, // 2000-3000ml
        meal_frequency: Math.floor(Math.random() * 2) + 4, // 4-5 comidas
        most_consumed_foods: [
          { name: "Pollo", count: Math.floor(Math.random() * 20) + 10 },
          { name: "Arroz", count: Math.floor(Math.random() * 20) + 10 },
          { name: "Huevos", count: Math.floor(Math.random() * 20) + 10 },
          { name: "Avena", count: Math.floor(Math.random() * 20) + 5 },
          { name: "Plátano", count: Math.floor(Math.random() * 20) + 5 }
        ]
      },
      body_stats: {
        initial_weight: profile?.weight || 75,
        current_weight: (profile?.weight || 75) - (Math.random() * 5),
        weight_change: -Math.random() * 5,
        weight_change_percentage: -Math.random() * 7,
        initial_body_fat: profile?.body_fat || 20,
        current_body_fat: (profile?.body_fat || 20) - (Math.random() * 3),
        body_fat_change: -Math.random() * 3,
        initial_muscle_mass: profile?.muscle_mass || 35,
        current_muscle_mass: (profile?.muscle_mass || 35) + (Math.random() * 2),
        muscle_mass_change: Math.random() * 2
      },
      wellness_stats: {
        average_sleep_duration: Math.floor(Math.random() * 2) + 7, // 7-8 horas
        average_sleep_quality: Math.floor(Math.random() * 3) + 7, // 7-9 de 10
        average_stress_level: Math.floor(Math.random() * 3) + 3, // 3-5 de 10
        average_recovery_score: Math.floor(Math.random() * 3) + 7, // 7-9 de 10
        average_energy_level: Math.floor(Math.random() * 3) + 7, // 7-9 de 10
        meditation_frequency: Math.floor(Math.random() * 5) + 2 // 2-6 veces por semana
      },
      goal_stats: {
        total_goals: Math.floor(Math.random() * 5) + 5, // 5-9 objetivos
        achieved_goals: Math.floor(Math.random() * 3) + 2, // 2-4 objetivos
        in_progress_goals: Math.floor(Math.random() * 3) + 2, // 2-4 objetivos
        achievement_rate: Math.floor(Math.random() * 30) + 40, // 40-70%
        average_completion_time: Math.floor(Math.random() * 30) + 30 // 30-60 días
      }
    };
    
    return { data: statistics, error: null };
  } catch (e) {
    console.error(`Error en getClientStatistics:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getClientStatistics`)
    };
  }
};

/**
 * Obtiene el historial de rendimiento de un cliente
 */
export const getClientPerformanceHistory = async (
  userId: string
): Promise<QueryResponse<ClientPerformanceHistory>> => {
  try {
    // En una implementación real, aquí se obtendrían datos históricos
    // Para este ejemplo, generamos datos simulados
    
    // Generar fechas para los últimos 6 meses
    const dates: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      dates.push(date.toISOString());
    }
    
    // Generar evaluaciones simuladas
    const evaluations: ClientEvaluation[] = dates.map((date, index) => ({
      id: `eval_${userId}_${index}`,
      user_id: userId,
      evaluator_id: "admin_user_id",
      evaluation_date: date,
      overall_score: Math.min(10, 6 + index * 0.5), // Mejora gradual
      training_score: Math.min(10, 6 + index * 0.6),
      nutrition_score: Math.min(10, 5 + index * 0.7),
      adherence_score: Math.min(10, 7 + index * 0.4),
      progress_score: Math.min(10, 6 + index * 0.5),
      notes: `Evaluación mensual ${index + 1}. ${index > 2 ? 'Muestra progreso consistente.' : 'Necesita mejorar consistencia.'}`,
      goals_achieved: index > 0 ? [`Meta ${index}`, `Meta ${index + 1}`] : [],
      areas_to_improve: [
        "Consistencia en entrenamiento",
        "Ingesta de proteínas",
        "Calidad del sueño"
      ],
      recommendations: [
        "Aumentar frecuencia de entrenamiento",
        "Mejorar hidratación",
        "Implementar rutina de sueño"
      ],
      next_evaluation_date: index < 5 ? dates[index + 1] : undefined
    }));
    
    // Generar métricas históricas
    const metricsHistory = dates.map((date, index) => {
      const baseWeight = 75;
      const baseBodyFat = 20;
      const baseMuscle = 35;
      
      return {
        date,
        weight: baseWeight - (index * 0.5),
        body_fat: baseBodyFat - (index * 0.3),
        muscle_mass: baseMuscle + (index * 0.2),
        workout_completion_rate: 70 + (index * 3),
        nutrition_adherence_rate: 65 + (index * 4),
        overall_score: 6 + (index * 0.5)
      };
    });
    
    const performanceHistory: ClientPerformanceHistory = {
      user_id: userId,
      evaluations,
      metrics_history: metricsHistory
    };
    
    return { data: performanceHistory, error: null };
  } catch (e) {
    console.error(`Error en getClientPerformanceHistory:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getClientPerformanceHistory`)
    };
  }
};

/**
 * Crea una nueva evaluación para un cliente
 */
export const createClientEvaluation = async (
  evaluation: Omit<ClientEvaluation, 'id'>
): Promise<QueryResponse<ClientEvaluation>> => {
  try {
    // En una implementación real, aquí se guardaría en la base de datos
    // Para este ejemplo, simulamos una respuesta exitosa
    
    const newEvaluation: ClientEvaluation = {
      ...evaluation,
      id: `eval_${Date.now()}`
    };
    
    return { data: newEvaluation, error: null };
  } catch (e) {
    console.error(`Error en createClientEvaluation:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en createClientEvaluation`)
    };
  }
};

/**
 * Obtiene las evaluaciones de un cliente
 */
export const getClientEvaluations = async (
  userId: string
): Promise<QueryResponse<ClientEvaluation[]>> => {
  try {
    // En una implementación real, aquí se obtendrían de la base de datos
    // Para este ejemplo, generamos evaluaciones simuladas
    
    const now = new Date();
    const evaluations: ClientEvaluation[] = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      
      evaluations.push({
        id: `eval_${userId}_${i}`,
        user_id: userId,
        evaluator_id: "admin_user_id",
        evaluation_date: date.toISOString(),
        overall_score: Math.min(10, 6 + i * 0.5),
        training_score: Math.min(10, 6 + i * 0.6),
        nutrition_score: Math.min(10, 5 + i * 0.7),
        adherence_score: Math.min(10, 7 + i * 0.4),
        progress_score: Math.min(10, 6 + i * 0.5),
        notes: `Evaluación mensual ${i + 1}. ${i > 2 ? 'Muestra progreso consistente.' : 'Necesita mejorar consistencia.'}`,
        goals_achieved: i > 0 ? [`Meta ${i}`, `Meta ${i + 1}`] : [],
        areas_to_improve: [
          "Consistencia en entrenamiento",
          "Ingesta de proteínas",
          "Calidad del sueño"
        ],
        recommendations: [
          "Aumentar frecuencia de entrenamiento",
          "Mejorar hidratación",
          "Implementar rutina de sueño"
        ]
      });
    }
    
    return { data: evaluations, error: null };
  } catch (e) {
    console.error(`Error en getClientEvaluations:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getClientEvaluations`)
    };
  }
};
