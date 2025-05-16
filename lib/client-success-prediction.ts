import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';

// Tipos para el servicio de predicción de éxito del cliente
export interface ClientSuccessPrediction {
  id: string;
  user_id: string;
  success_probability: number;
  risk_factors: string[];
  strengths: string[];
  recommended_interventions: string[];
  prediction_date: string;
  next_assessment_date?: string;
}

export interface ClientEngagementMetrics {
  user_id: string;
  login_frequency: number;
  workout_completion_rate: number;
  nutrition_adherence_rate: number;
  goal_progress_rate: number;
  communication_responsiveness: number;
  feedback_sentiment: number;
  overall_engagement_score: number;
}

export interface ClientRiskFactor {
  id: string;
  name: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high';
  detection_criteria: {
    metric: string;
    threshold: number;
    comparison: 'less_than' | 'greater_than' | 'equal';
  }[];
  recommended_interventions: string[];
}

export interface ClientIntervention {
  id: string;
  name: string;
  description: string;
  type: 'message' | 'adjustment' | 'call' | 'incentive';
  effectiveness_rating: number;
  suitable_for_risk_factors: string[];
  content_template?: string;
}

// Función para analizar los patrones de adherencia temprana
export async function analyzeEarlyAdherencePatterns(userId: string): Promise<{
  data: ClientEngagementMetrics | null;
  error: Error | null;
}> {
  try {
    // Obtener datos de entrenamiento de las últimas 2 semanas
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', twoWeeksAgo.toISOString());
    
    if (workoutsError) throw workoutsError;
    
    // Obtener datos de nutrición de las últimas 2 semanas
    const { data: nutritionEntries, error: nutritionError } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', twoWeeksAgo.toISOString());
    
    if (nutritionError) throw nutritionError;
    
    // Obtener datos de inicio de sesión
    const { data: authEvents, error: authError } = await supabase
      .from('auth_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', twoWeeksAgo.toISOString());
    
    if (authError) throw authError;
    
    // Obtener datos de comunicación y feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('trainer_feedback')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', twoWeeksAgo.toISOString());
    
    if (feedbackError) throw feedbackError;
    
    // Calcular métricas de engagement
    const loginFrequency = authEvents ? authEvents.length / 14 : 0; // Promedio diario
    
    // Calcular tasa de finalización de entrenamientos
    const scheduledWorkouts = 14 * (userId.charCodeAt(0) % 3 + 2) / 7; // Simulación: 2-4 entrenamientos por semana
    const workoutCompletionRate = workouts ? Math.min(100, (workouts.length / scheduledWorkouts) * 100) : 0;
    
    // Calcular adherencia nutricional
    const expectedEntries = 14 * 3; // Asumiendo 3 comidas por día
    const nutritionAdherenceRate = nutritionEntries ? Math.min(100, (nutritionEntries.length / expectedEntries) * 100) : 0;
    
    // Calcular progreso hacia objetivos (simulado)
    const goalProgressRate = Math.random() * 50 + workoutCompletionRate * 0.3 + nutritionAdherenceRate * 0.2;
    
    // Calcular respuesta a comunicaciones
    const communicationResponsiveness = feedback ? 
      feedback.filter((f: any) => f.response_time_minutes < 1440).length / feedback.length * 100 : 50;
    
    // Calcular sentimiento de feedback (simulado)
    const feedbackSentiment = feedback ? 
      feedback.reduce((acc: number, f: any) => acc + (f.sentiment || 0), 0) / feedback.length * 10 : 5;
    
    // Calcular puntuación general de engagement
    const overallEngagementScore = (
      loginFrequency * 10 + 
      workoutCompletionRate * 0.3 + 
      nutritionAdherenceRate * 0.3 + 
      goalProgressRate * 0.2 + 
      communicationResponsiveness * 0.1 + 
      feedbackSentiment * 0.1
    );
    
    const metrics: ClientEngagementMetrics = {
      user_id: userId,
      login_frequency: loginFrequency,
      workout_completion_rate: workoutCompletionRate,
      nutrition_adherence_rate: nutritionAdherenceRate,
      goal_progress_rate: goalProgressRate,
      communication_responsiveness: communicationResponsiveness,
      feedback_sentiment: feedbackSentiment,
      overall_engagement_score: overallEngagementScore
    };
    
    return { data: metrics, error: null };
  } catch (error) {
    console.error('Error al analizar patrones de adherencia:', error);
    return { data: null, error: error as Error };
  }
}

// Función para predecir el éxito del cliente
export async function predictClientSuccess(userId: string): Promise<{
  data: ClientSuccessPrediction | null;
  error: Error | null;
}> {
  try {
    // Analizar patrones de adherencia temprana
    const { data: engagementMetrics, error: engagementError } = await analyzeEarlyAdherencePatterns(userId);
    
    if (engagementError) throw engagementError;
    if (!engagementMetrics) throw new Error('No se pudieron obtener métricas de engagement');
    
    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Obtener evaluación de condición física
    const { data: fitnessAssessment, error: fitnessError } = await supabase
      .from('fitness_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single();
    
    if (fitnessError && fitnessError.code !== 'PGRST116') throw fitnessError;
    
    // Identificar factores de riesgo
    const riskFactors: string[] = [];
    
    if (engagementMetrics.workout_completion_rate < 70) {
      riskFactors.push('baja_adherencia_entrenamiento');
    }
    
    if (engagementMetrics.nutrition_adherence_rate < 60) {
      riskFactors.push('baja_adherencia_nutricion');
    }
    
    if (engagementMetrics.login_frequency < 0.5) {
      riskFactors.push('baja_frecuencia_uso');
    }
    
    if (engagementMetrics.communication_responsiveness < 50) {
      riskFactors.push('baja_respuesta_comunicacion');
    }
    
    if (fitnessAssessment && fitnessAssessment.injuries && fitnessAssessment.injuries.length > 0) {
      riskFactors.push('historial_lesiones');
    }
    
    // Identificar fortalezas
    const strengths: string[] = [];
    
    if (engagementMetrics.workout_completion_rate >= 85) {
      strengths.push('alta_adherencia_entrenamiento');
    }
    
    if (engagementMetrics.nutrition_adherence_rate >= 80) {
      strengths.push('alta_adherencia_nutricion');
    }
    
    if (engagementMetrics.login_frequency >= 1) {
      strengths.push('uso_frecuente_app');
    }
    
    if (engagementMetrics.feedback_sentiment >= 8) {
      strengths.push('feedback_positivo');
    }
    
    // Calcular probabilidad de éxito
    let successProbability = 50; // Base
    
    // Ajustar por factores de riesgo
    successProbability -= riskFactors.length * 10;
    
    // Ajustar por fortalezas
    successProbability += strengths.length * 10;
    
    // Ajustar por engagement general
    successProbability += (engagementMetrics.overall_engagement_score - 50) * 0.5;
    
    // Limitar a 0-100
    successProbability = Math.max(0, Math.min(100, successProbability));
    
    // Generar intervenciones recomendadas
    const recommendedInterventions: string[] = [];
    
    if (riskFactors.includes('baja_adherencia_entrenamiento')) {
      recommendedInterventions.push('simplificar_rutina');
      recommendedInterventions.push('mensaje_motivacional_entrenamiento');
    }
    
    if (riskFactors.includes('baja_adherencia_nutricion')) {
      recommendedInterventions.push('plan_nutricional_simplificado');
      recommendedInterventions.push('recordatorios_comidas');
    }
    
    if (riskFactors.includes('baja_frecuencia_uso')) {
      recommendedInterventions.push('notificacion_reenganche');
      recommendedInterventions.push('llamada_seguimiento');
    }
    
    if (riskFactors.includes('historial_lesiones')) {
      recommendedInterventions.push('ajuste_ejercicios_lesiones');
    }
    
    // Crear predicción
    const prediction: ClientSuccessPrediction = {
      id: uuidv4(),
      user_id: userId,
      success_probability: successProbability,
      risk_factors: riskFactors,
      strengths: strengths,
      recommended_interventions: recommendedInterventions,
      prediction_date: new Date().toISOString(),
      next_assessment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 semanas después
    };
    
    // Guardar predicción en la base de datos
    const { error: saveError } = await supabase
      .from('client_success_predictions')
      .insert(prediction);
    
    if (saveError) throw saveError;
    
    return { data: prediction, error: null };
  } catch (error) {
    console.error('Error al predecir éxito del cliente:', error);
    return { data: null, error: error as Error };
  }
}
