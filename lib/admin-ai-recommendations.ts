import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';

// Tipos para las recomendaciones
export interface AIRecommendation {
  id: string;
  user_id: string;
  category: 'training' | 'nutrition' | 'sleep' | 'general';
  title: string;
  description: string;
  impact_level: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  created_at: string;
  applied: boolean;
  applied_at?: string;
  result?: string;
  metrics_before?: any;
  metrics_after?: any;
}

export interface UserMetrics {
  user_id: string;
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  training_frequency?: number;
  training_intensity?: number;
  sleep_quality?: number;
  sleep_duration?: number;
  stress_level?: number;
  nutrition_adherence?: number;
  calories_intake?: number;
  protein_intake?: number;
  carbs_intake?: number;
  fat_intake?: number;
  water_intake?: number;
  steps?: number;
  active_minutes?: number;
  last_updated: string;
}

export interface UserProgress {
  user_id: string;
  metrics: UserMetrics[];
  trend: {
    weight: 'increasing' | 'decreasing' | 'stable';
    body_fat: 'increasing' | 'decreasing' | 'stable';
    muscle_mass: 'increasing' | 'decreasing' | 'stable';
    training_adherence: 'increasing' | 'decreasing' | 'stable';
    nutrition_adherence: 'increasing' | 'decreasing' | 'stable';
    sleep_quality: 'increasing' | 'decreasing' | 'stable';
  };
  goal_progress: number; // 0-100
}

// Tipo para respuestas de consultas
type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Genera recomendaciones de IA para un usuario específico
 */
export const generateUserRecommendations = async (
  userId: string
): Promise<QueryResponse<AIRecommendation[]>> => {
  try {
    // En una implementación real, aquí se llamaría a un modelo de IA
    // Para este ejemplo, generamos recomendaciones simuladas basadas en datos del usuario
    
    // Obtener datos del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Obtener rutinas de entrenamiento del usuario
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', userId);
    
    if (workoutsError) throw workoutsError;
    
    // Obtener planes de nutrición del usuario
    const { data: mealPlans, error: mealPlansError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId);
    
    if (mealPlansError) throw mealPlansError;
    
    // Generar recomendaciones basadas en los datos
    const recommendations: AIRecommendation[] = [];
    
    // Recomendaciones de entrenamiento
    if (workouts && workouts.length > 0) {
      const workout = workouts[0]; // Usar la rutina más reciente
      
      if (workout.frequency < 3) {
        recommendations.push({
          id: `tr_${Date.now()}_1`,
          user_id: userId,
          category: 'training',
          title: 'Aumentar frecuencia de entrenamiento',
          description: 'El usuario está entrenando menos de 3 días por semana. Considere aumentar la frecuencia a 3-4 días para optimizar resultados.',
          impact_level: 'high',
          confidence: 85,
          created_at: new Date().toISOString(),
          applied: false
        });
      }
      
      if (workout.level === 'beginner' && new Date(workout.created_at).getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000) {
        recommendations.push({
          id: `tr_${Date.now()}_2`,
          user_id: userId,
          category: 'training',
          title: 'Progresión de nivel de entrenamiento',
          description: 'El usuario ha estado en nivel principiante por más de 3 meses. Considere actualizar su rutina a nivel intermedio.',
          impact_level: 'medium',
          confidence: 75,
          created_at: new Date().toISOString(),
          applied: false
        });
      }
    } else {
      recommendations.push({
        id: `tr_${Date.now()}_3`,
        user_id: userId,
        category: 'training',
        title: 'Crear rutina de entrenamiento',
        description: 'El usuario no tiene ninguna rutina de entrenamiento asignada. Cree una rutina personalizada basada en sus objetivos.',
        impact_level: 'high',
        confidence: 95,
        created_at: new Date().toISOString(),
        applied: false
      });
    }
    
    // Recomendaciones de nutrición
    if (mealPlans && mealPlans.length > 0) {
      const mealPlan = mealPlans[0]; // Usar el plan más reciente
      
      if (profile.goal === 'muscle_gain' && mealPlan.protein < 1.6 * (profile.weight || 70)) {
        recommendations.push({
          id: `nut_${Date.now()}_1`,
          user_id: userId,
          category: 'nutrition',
          title: 'Aumentar ingesta de proteínas',
          description: `Para el objetivo de ganancia muscular, se recomienda aumentar la ingesta de proteínas a al menos ${Math.round(1.8 * (profile.weight || 70))}g diarios.`,
          impact_level: 'high',
          confidence: 90,
          created_at: new Date().toISOString(),
          applied: false
        });
      }
      
      if (profile.goal === 'weight_loss' && mealPlan.calories > (profile.weight || 70) * 22) {
        recommendations.push({
          id: `nut_${Date.now()}_2`,
          user_id: userId,
          category: 'nutrition',
          title: 'Ajustar ingesta calórica',
          description: `Para el objetivo de pérdida de peso, se recomienda reducir la ingesta calórica a aproximadamente ${Math.round((profile.weight || 70) * 20)} calorías diarias.`,
          impact_level: 'high',
          confidence: 85,
          created_at: new Date().toISOString(),
          applied: false
        });
      }
    } else {
      recommendations.push({
        id: `nut_${Date.now()}_3`,
        user_id: userId,
        category: 'nutrition',
        title: 'Crear plan de nutrición',
        description: 'El usuario no tiene ningún plan de nutrición asignado. Cree un plan personalizado basado en sus objetivos y preferencias.',
        impact_level: 'high',
        confidence: 95,
        created_at: new Date().toISOString(),
        applied: false
      });
    }
    
    // Recomendaciones generales
    recommendations.push({
      id: `gen_${Date.now()}_1`,
      user_id: userId,
      category: 'general',
      title: 'Programar seguimiento mensual',
      description: 'Programe una revisión mensual para evaluar el progreso del usuario y ajustar su plan según sea necesario.',
      impact_level: 'medium',
      confidence: 80,
      created_at: new Date().toISOString(),
      applied: false
    });
    
    // Recomendaciones de sueño (simuladas)
    recommendations.push({
      id: `sleep_${Date.now()}_1`,
      user_id: userId,
      category: 'sleep',
      title: 'Mejorar calidad del sueño',
      description: 'Los datos indican patrones de sueño irregulares. Recomiende técnicas de mejora del sueño y establezca una rutina nocturna.',
      impact_level: 'medium',
      confidence: 70,
      created_at: new Date().toISOString(),
      applied: false
    });
    
    return { data: recommendations, error: null };
  } catch (e) {
    console.error(`Error en generateUserRecommendations:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en generateUserRecommendations`)
    };
  }
};

/**
 * Genera recomendaciones globales para todos los usuarios
 */
export const generateGlobalRecommendations = async (): Promise<QueryResponse<AIRecommendation[]>> => {
  try {
    // En una implementación real, aquí se analizarían datos de todos los usuarios
    // Para este ejemplo, generamos recomendaciones simuladas
    
    const recommendations: AIRecommendation[] = [
      {
        id: `global_${Date.now()}_1`,
        user_id: 'all',
        category: 'training',
        title: 'Actualizar plantillas de entrenamiento',
        description: 'El análisis de datos muestra que el 70% de los usuarios están utilizando las mismas 3 plantillas de entrenamiento. Considere crear nuevas variantes para aumentar la variedad.',
        impact_level: 'medium',
        confidence: 85,
        created_at: new Date().toISOString(),
        applied: false
      },
      {
        id: `global_${Date.now()}_2`,
        user_id: 'all',
        category: 'nutrition',
        title: 'Mejorar adherencia a planes nutricionales',
        description: 'Los datos muestran una caída del 30% en la adherencia a los planes nutricionales después de 4 semanas. Considere implementar un sistema de recordatorios o gamificación.',
        impact_level: 'high',
        confidence: 90,
        created_at: new Date().toISOString(),
        applied: false
      },
      {
        id: `global_${Date.now()}_3`,
        user_id: 'all',
        category: 'general',
        title: 'Usuarios inactivos',
        description: 'Hay 15 usuarios que no han iniciado sesión en los últimos 30 días. Considere enviar un correo electrónico de reactivación con incentivos.',
        impact_level: 'medium',
        confidence: 95,
        created_at: new Date().toISOString(),
        applied: false
      },
      {
        id: `global_${Date.now()}_4`,
        user_id: 'all',
        category: 'sleep',
        title: 'Contenido sobre sueño',
        description: 'El módulo de sueño tiene la menor participación. Considere crear más contenido educativo sobre la importancia del sueño en la recuperación y el rendimiento.',
        impact_level: 'low',
        confidence: 75,
        created_at: new Date().toISOString(),
        applied: false
      }
    ];
    
    return { data: recommendations, error: null };
  } catch (e) {
    console.error(`Error en generateGlobalRecommendations:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en generateGlobalRecommendations`)
    };
  }
};

/**
 * Obtiene el progreso de un usuario
 */
export const getUserProgress = async (userId: string): Promise<QueryResponse<UserProgress>> => {
  try {
    // En una implementación real, aquí se obtendrían métricas históricas del usuario
    // Para este ejemplo, generamos datos simulados
    
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Obtener perfil del usuario para datos básicos
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Generar métricas simuladas basadas en el objetivo del usuario
    const isWeightLoss = profile.goal === 'weight_loss';
    const isMuscleGain = profile.goal === 'muscle_gain';
    
    const baseWeight = profile.weight || 75;
    const baseBodyFat = profile.body_fat || 20;
    const baseMuscle = profile.muscle_mass || 35;
    
    const metrics: UserMetrics[] = [
      {
        user_id: userId,
        weight: baseWeight,
        body_fat: baseBodyFat,
        muscle_mass: baseMuscle,
        training_frequency: 3,
        training_intensity: 7,
        sleep_quality: 6,
        sleep_duration: 7,
        stress_level: 6,
        nutrition_adherence: 70,
        calories_intake: 2200,
        protein_intake: 120,
        carbs_intake: 220,
        fat_intake: 70,
        water_intake: 2000,
        steps: 7000,
        active_minutes: 30,
        last_updated: threeMonthsAgo.toISOString()
      },
      {
        user_id: userId,
        weight: isWeightLoss ? baseWeight - 1 : (isMuscleGain ? baseWeight + 0.5 : baseWeight),
        body_fat: isWeightLoss ? baseBodyFat - 1 : (isMuscleGain ? baseBodyFat - 0.5 : baseBodyFat),
        muscle_mass: isMuscleGain ? baseMuscle + 0.5 : baseMuscle,
        training_frequency: 3,
        training_intensity: 7,
        sleep_quality: 7,
        sleep_duration: 7,
        stress_level: 5,
        nutrition_adherence: 75,
        calories_intake: 2150,
        protein_intake: 130,
        carbs_intake: 210,
        fat_intake: 65,
        water_intake: 2200,
        steps: 7500,
        active_minutes: 35,
        last_updated: twoMonthsAgo.toISOString()
      },
      {
        user_id: userId,
        weight: isWeightLoss ? baseWeight - 2 : (isMuscleGain ? baseWeight + 1 : baseWeight),
        body_fat: isWeightLoss ? baseBodyFat - 2 : (isMuscleGain ? baseBodyFat - 1 : baseBodyFat),
        muscle_mass: isMuscleGain ? baseMuscle + 1 : baseMuscle,
        training_frequency: 4,
        training_intensity: 8,
        sleep_quality: 7,
        sleep_duration: 7.5,
        stress_level: 4,
        nutrition_adherence: 80,
        calories_intake: 2100,
        protein_intake: 140,
        carbs_intake: 200,
        fat_intake: 65,
        water_intake: 2500,
        steps: 8000,
        active_minutes: 40,
        last_updated: oneMonthAgo.toISOString()
      },
      {
        user_id: userId,
        weight: isWeightLoss ? baseWeight - 3 : (isMuscleGain ? baseWeight + 1.5 : baseWeight),
        body_fat: isWeightLoss ? baseBodyFat - 3 : (isMuscleGain ? baseBodyFat - 1.5 : baseBodyFat),
        muscle_mass: isMuscleGain ? baseMuscle + 1.5 : baseMuscle,
        training_frequency: 4,
        training_intensity: 8,
        sleep_quality: 8,
        sleep_duration: 8,
        stress_level: 3,
        nutrition_adherence: 85,
        calories_intake: 2050,
        protein_intake: 150,
        carbs_intake: 190,
        fat_intake: 60,
        water_intake: 2800,
        steps: 9000,
        active_minutes: 45,
        last_updated: now.toISOString()
      }
    ];
    
    // Calcular tendencias
    const firstMetric = metrics[0];
    const lastMetric = metrics[metrics.length - 1];
    
    const weightDiff = lastMetric.weight! - firstMetric.weight!;
    const bodyFatDiff = lastMetric.body_fat! - firstMetric.body_fat!;
    const muscleDiff = lastMetric.muscle_mass! - firstMetric.muscle_mass!;
    const trainingDiff = lastMetric.training_frequency! - firstMetric.training_frequency!;
    const nutritionDiff = lastMetric.nutrition_adherence! - firstMetric.nutrition_adherence!;
    const sleepDiff = lastMetric.sleep_quality! - firstMetric.sleep_quality!;
    
    // Calcular progreso hacia el objetivo
    let goalProgress = 0;
    
    if (isWeightLoss) {
      // Para pérdida de peso, consideramos reducción de peso y grasa corporal
      const weightLossGoal = baseWeight * 0.1; // 10% del peso inicial
      const fatLossGoal = baseBodyFat * 0.2; // 20% de la grasa corporal inicial
      
      const weightProgress = Math.min(100, Math.abs(weightDiff) / weightLossGoal * 100);
      const fatProgress = Math.min(100, Math.abs(bodyFatDiff) / fatLossGoal * 100);
      
      goalProgress = (weightProgress + fatProgress) / 2;
    } else if (isMuscleGain) {
      // Para ganancia muscular, consideramos aumento de masa muscular
      const muscleGainGoal = baseMuscle * 0.05; // 5% de la masa muscular inicial
      
      goalProgress = Math.min(100, Math.abs(muscleDiff) / muscleGainGoal * 100);
    } else {
      // Para mantenimiento, consideramos adherencia a entrenamiento y nutrición
      goalProgress = (lastMetric.training_frequency! / 5 * 100 + lastMetric.nutrition_adherence!) / 2;
    }
    
    const progress: UserProgress = {
      user_id: userId,
      metrics,
      trend: {
        weight: weightDiff < -0.5 ? 'decreasing' : (weightDiff > 0.5 ? 'increasing' : 'stable'),
        body_fat: bodyFatDiff < -0.5 ? 'decreasing' : (bodyFatDiff > 0.5 ? 'increasing' : 'stable'),
        muscle_mass: muscleDiff > 0.5 ? 'increasing' : (muscleDiff < -0.5 ? 'decreasing' : 'stable'),
        training_adherence: trainingDiff > 0 ? 'increasing' : (trainingDiff < 0 ? 'decreasing' : 'stable'),
        nutrition_adherence: nutritionDiff > 5 ? 'increasing' : (nutritionDiff < -5 ? 'decreasing' : 'stable'),
        sleep_quality: sleepDiff > 0 ? 'increasing' : (sleepDiff < 0 ? 'decreasing' : 'stable')
      },
      goal_progress: Math.round(goalProgress)
    };
    
    return { data: progress, error: null };
  } catch (e) {
    console.error(`Error en getUserProgress:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en getUserProgress`)
    };
  }
};

/**
 * Marca una recomendación como aplicada
 */
export const applyRecommendation = async (
  recommendationId: string,
  notes?: string
): Promise<QueryResponse<boolean>> => {
  try {
    // En una implementación real, aquí se actualizaría la recomendación en la base de datos
    // Para este ejemplo, simplemente devolvemos éxito
    
    return { data: true, error: null };
  } catch (e) {
    console.error(`Error en applyRecommendation:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error(`Error desconocido en applyRecommendation`)
    };
  }
};
