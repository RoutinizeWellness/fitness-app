import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';

// Tipos para el servicio de feedback
export interface ClientFeedback {
  id: string;
  user_id: string;
  feedback_type: 'workout' | 'nutrition' | 'general' | 'feature';
  content: string;
  rating?: number;
  sentiment?: number;
  created_at: string;
  metadata?: {
    workout_id?: string;
    exercise_id?: string;
    meal_id?: string;
    feature_id?: string;
    difficulty_level?: number;
    energy_level?: number;
    pain_level?: number;
    satisfaction_level?: number;
  };
}

export interface WorkoutFeedback extends ClientFeedback {
  workout_id: string;
  difficulty_level: number;
  energy_level: number;
  pain_level?: number;
  enjoyed: boolean;
  completed_all_exercises: boolean;
}

export interface NutritionFeedback extends ClientFeedback {
  meal_id?: string;
  diet_id?: string;
  satisfaction_level: number;
  fullness_level: number;
  adherence_level: number;
  taste_rating: number;
}

export interface FeedbackSummary {
  user_id: string;
  average_workout_difficulty: number;
  average_workout_energy: number;
  average_workout_pain?: number;
  workout_completion_rate: number;
  average_nutrition_satisfaction: number;
  average_nutrition_adherence: number;
  overall_satisfaction: number;
  common_issues: string[];
  positive_aspects: string[];
  feedback_count: number;
  last_feedback_date: string;
}

export interface ScheduledCheckIn {
  id: string;
  user_id: string;
  professional_id: string;
  check_in_type: 'workout' | 'nutrition' | 'general' | 'body_composition';
  scheduled_date: string;
  completed: boolean;
  completed_date?: string;
  questions: {
    id: string;
    question: string;
    response_type: 'text' | 'rating' | 'boolean' | 'multiple_choice';
    options?: string[];
    required: boolean;
  }[];
  responses?: {
    question_id: string;
    response: string | number | boolean;
  }[];
}

// Función para enviar feedback de entrenamiento
export async function submitWorkoutFeedback(feedback: Omit<WorkoutFeedback, 'id' | 'created_at'>): Promise<{
  data: WorkoutFeedback | null;
  error: Error | null;
}> {
  try {
    const newFeedback: WorkoutFeedback = {
      id: uuidv4(),
      user_id: feedback.user_id,
      feedback_type: 'workout',
      content: feedback.content,
      workout_id: feedback.workout_id,
      difficulty_level: feedback.difficulty_level,
      energy_level: feedback.energy_level,
      pain_level: feedback.pain_level,
      enjoyed: feedback.enjoyed,
      completed_all_exercises: feedback.completed_all_exercises,
      created_at: new Date().toISOString(),
      metadata: {
        workout_id: feedback.workout_id,
        difficulty_level: feedback.difficulty_level,
        energy_level: feedback.energy_level,
        pain_level: feedback.pain_level
      }
    };
    
    // Calcular sentimiento basado en el contenido y otros factores
    const sentiment = calculateSentiment(feedback.content, feedback.enjoyed, feedback.pain_level);
    newFeedback.sentiment = sentiment;
    
    // Guardar en Supabase
    const { data, error } = await supabase
      .from('client_feedback')
      .insert(newFeedback)
      .select()
      .single();
    
    if (error) throw error;
    
    // Actualizar estadísticas de entrenamiento
    await updateWorkoutStats(feedback.user_id, feedback.workout_id, {
      difficulty: feedback.difficulty_level,
      energy: feedback.energy_level,
      pain: feedback.pain_level,
      completed: feedback.completed_all_exercises
    });
    
    return { data, error: null };
  } catch (error) {
    console.error('Error al enviar feedback de entrenamiento:', error);
    return { data: null, error: error as Error };
  }
}

// Función para enviar feedback nutricional
export async function submitNutritionFeedback(feedback: Omit<NutritionFeedback, 'id' | 'created_at'>): Promise<{
  data: NutritionFeedback | null;
  error: Error | null;
}> {
  try {
    const newFeedback: NutritionFeedback = {
      id: uuidv4(),
      user_id: feedback.user_id,
      feedback_type: 'nutrition',
      content: feedback.content,
      meal_id: feedback.meal_id,
      diet_id: feedback.diet_id,
      satisfaction_level: feedback.satisfaction_level,
      fullness_level: feedback.fullness_level,
      adherence_level: feedback.adherence_level,
      taste_rating: feedback.taste_rating,
      created_at: new Date().toISOString(),
      metadata: {
        meal_id: feedback.meal_id,
        satisfaction_level: feedback.satisfaction_level,
        energy_level: feedback.fullness_level
      }
    };
    
    // Calcular sentimiento basado en el contenido y otros factores
    const sentiment = calculateSentiment(
      feedback.content, 
      feedback.satisfaction_level > 3, 
      undefined, 
      feedback.taste_rating
    );
    newFeedback.sentiment = sentiment;
    
    // Guardar en Supabase
    const { data, error } = await supabase
      .from('client_feedback')
      .insert(newFeedback)
      .select()
      .single();
    
    if (error) throw error;
    
    // Actualizar estadísticas nutricionales
    await updateNutritionStats(feedback.user_id, feedback.meal_id, {
      satisfaction: feedback.satisfaction_level,
      fullness: feedback.fullness_level,
      adherence: feedback.adherence_level,
      taste: feedback.taste_rating
    });
    
    return { data, error: null };
  } catch (error) {
    console.error('Error al enviar feedback nutricional:', error);
    return { data: null, error: error as Error };
  }
}

// Función para obtener un resumen del feedback del cliente
export async function getClientFeedbackSummary(userId: string): Promise<{
  data: FeedbackSummary | null;
  error: Error | null;
}> {
  try {
    // Obtener todo el feedback del usuario
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('client_feedback')
      .select('*')
      .eq('user_id', userId);
    
    if (feedbackError) throw feedbackError;
    
    if (!feedbackData || feedbackData.length === 0) {
      return { 
        data: null, 
        error: new Error('No hay feedback disponible para este usuario') 
      };
    }
    
    // Filtrar por tipo de feedback
    const workoutFeedback = feedbackData.filter(f => f.feedback_type === 'workout') as WorkoutFeedback[];
    const nutritionFeedback = feedbackData.filter(f => f.feedback_type === 'nutrition') as NutritionFeedback[];
    
    // Calcular promedios para entrenamiento
    const avgWorkoutDifficulty = workoutFeedback.length > 0 
      ? workoutFeedback.reduce((sum, f) => sum + f.difficulty_level, 0) / workoutFeedback.length 
      : 0;
    
    const avgWorkoutEnergy = workoutFeedback.length > 0 
      ? workoutFeedback.reduce((sum, f) => sum + f.energy_level, 0) / workoutFeedback.length 
      : 0;
    
    const workoutPainFeedback = workoutFeedback.filter(f => f.pain_level !== undefined);
    const avgWorkoutPain = workoutPainFeedback.length > 0 
      ? workoutPainFeedback.reduce((sum, f) => sum + (f.pain_level || 0), 0) / workoutPainFeedback.length 
      : undefined;
    
    const workoutCompletionRate = workoutFeedback.length > 0 
      ? workoutFeedback.filter(f => f.completed_all_exercises).length / workoutFeedback.length * 100 
      : 0;
    
    // Calcular promedios para nutrición
    const avgNutritionSatisfaction = nutritionFeedback.length > 0 
      ? nutritionFeedback.reduce((sum, f) => sum + f.satisfaction_level, 0) / nutritionFeedback.length 
      : 0;
    
    const avgNutritionAdherence = nutritionFeedback.length > 0 
      ? nutritionFeedback.reduce((sum, f) => sum + f.adherence_level, 0) / nutritionFeedback.length 
      : 0;
    
    // Calcular satisfacción general
    const overallSatisfaction = feedbackData.length > 0 
      ? feedbackData.reduce((sum, f) => sum + (f.sentiment || 0), 0) / feedbackData.length * 10 
      : 0;
    
    // Identificar problemas comunes y aspectos positivos mediante análisis de sentimiento
    const commonIssues: string[] = [];
    const positiveAspects: string[] = [];
    
    // Analizar feedback negativo
    const negativeFeedback = feedbackData.filter(f => (f.sentiment || 0) < 0);
    if (negativeFeedback.length > 0) {
      if (negativeFeedback.filter(f => f.feedback_type === 'workout' && (f.metadata?.difficulty_level || 0) > 4).length > 2) {
        commonIssues.push('entrenamientos_demasiado_dificiles');
      }
      
      if (negativeFeedback.filter(f => f.feedback_type === 'workout' && (f.metadata?.pain_level || 0) > 3).length > 1) {
        commonIssues.push('dolor_durante_ejercicios');
      }
      
      if (negativeFeedback.filter(f => f.feedback_type === 'nutrition' && (f.metadata?.satisfaction_level || 0) < 3).length > 2) {
        commonIssues.push('insatisfaccion_con_dieta');
      }
    }
    
    // Analizar feedback positivo
    const positiveFeedback = feedbackData.filter(f => (f.sentiment || 0) > 0);
    if (positiveFeedback.length > 0) {
      if (positiveFeedback.filter(f => f.feedback_type === 'workout' && (f.metadata?.energy_level || 0) > 4).length > 2) {
        positiveAspects.push('buena_energia_post_entrenamiento');
      }
      
      if (positiveFeedback.filter(f => f.feedback_type === 'nutrition' && (f.metadata?.satisfaction_level || 0) > 4).length > 2) {
        positiveAspects.push('alta_satisfaccion_con_comidas');
      }
    }
    
    // Crear resumen
    const summary: FeedbackSummary = {
      user_id: userId,
      average_workout_difficulty: avgWorkoutDifficulty,
      average_workout_energy: avgWorkoutEnergy,
      average_workout_pain: avgWorkoutPain,
      workout_completion_rate: workoutCompletionRate,
      average_nutrition_satisfaction: avgNutritionSatisfaction,
      average_nutrition_adherence: avgNutritionAdherence,
      overall_satisfaction: overallSatisfaction,
      common_issues: commonIssues,
      positive_aspects: positiveAspects,
      feedback_count: feedbackData.length,
      last_feedback_date: feedbackData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at
    };
    
    return { data: summary, error: null };
  } catch (error) {
    console.error('Error al obtener resumen de feedback:', error);
    return { data: null, error: error as Error };
  }
}

// Función para programar un check-in con el cliente
export async function scheduleClientCheckIn(checkIn: Omit<ScheduledCheckIn, 'id'>): Promise<{
  data: ScheduledCheckIn | null;
  error: Error | null;
}> {
  try {
    const newCheckIn: ScheduledCheckIn = {
      id: uuidv4(),
      ...checkIn,
      completed: false
    };
    
    // Guardar en Supabase
    const { data, error } = await supabase
      .from('scheduled_check_ins')
      .insert(newCheckIn)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error al programar check-in:', error);
    return { data: null, error: error as Error };
  }
}

// Función para completar un check-in programado
export async function completeCheckIn(
  checkInId: string, 
  responses: { question_id: string; response: string | number | boolean }[]
): Promise<{
  data: ScheduledCheckIn | null;
  error: Error | null;
}> {
  try {
    // Obtener el check-in
    const { data: checkIn, error: getError } = await supabase
      .from('scheduled_check_ins')
      .select('*')
      .eq('id', checkInId)
      .single();
    
    if (getError) throw getError;
    
    // Actualizar el check-in
    const { data, error: updateError } = await supabase
      .from('scheduled_check_ins')
      .update({
        completed: true,
        completed_date: new Date().toISOString(),
        responses
      })
      .eq('id', checkInId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Procesar las respuestas para generar feedback automático
    await processCheckInResponses(data);
    
    return { data, error: null };
  } catch (error) {
    console.error('Error al completar check-in:', error);
    return { data: null, error: error as Error };
  }
}

// Funciones auxiliares
function calculateSentiment(
  content: string, 
  positive: boolean = false, 
  painLevel?: number, 
  satisfactionRating?: number
): number {
  // Implementación simple de análisis de sentimiento
  // En una implementación real, se usaría un servicio de NLP
  
  // Palabras positivas y negativas para análisis básico
  const positiveWords = [
    'bueno', 'excelente', 'genial', 'increíble', 'fantástico', 'me gusta', 'satisfecho',
    'feliz', 'contento', 'energía', 'motivado', 'progreso', 'mejora', 'fácil', 'cómodo'
  ];
  
  const negativeWords = [
    'malo', 'terrible', 'difícil', 'duro', 'cansado', 'agotado', 'dolor', 'molestia',
    'insatisfecho', 'descontento', 'hambre', 'aburrido', 'monótono', 'complicado'
  ];
  
  // Contar palabras positivas y negativas
  const lowerContent = content.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) negativeCount++;
  });
  
  // Calcular puntuación base
  let score = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);
  
  // Ajustar por factores adicionales
  if (positive) score += 0.2;
  if (painLevel && painLevel > 3) score -= 0.3;
  if (satisfactionRating) score += (satisfactionRating - 3) * 0.1;
  
  // Limitar entre -1 y 1
  return Math.max(-1, Math.min(1, score));
}

async function updateWorkoutStats(
  userId: string, 
  workoutId: string, 
  stats: { 
    difficulty: number; 
    energy: number; 
    pain?: number; 
    completed: boolean 
  }
): Promise<void> {
  try {
    // Obtener estadísticas actuales
    const { data: currentStats, error: statsError } = await supabase
      .from('workout_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .single();
    
    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }
    
    if (currentStats) {
      // Actualizar estadísticas existentes
      await supabase
        .from('workout_stats')
        .update({
          difficulty_ratings: [...(currentStats.difficulty_ratings || []), stats.difficulty],
          energy_ratings: [...(currentStats.energy_ratings || []), stats.energy],
          pain_ratings: stats.pain ? [...(currentStats.pain_ratings || []), stats.pain] : currentStats.pain_ratings,
          completion_count: currentStats.completion_count + (stats.completed ? 1 : 0),
          total_attempts: currentStats.total_attempts + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStats.id);
    } else {
      // Crear nuevas estadísticas
      await supabase
        .from('workout_stats')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          difficulty_ratings: [stats.difficulty],
          energy_ratings: [stats.energy],
          pain_ratings: stats.pain ? [stats.pain] : [],
          completion_count: stats.completed ? 1 : 0,
          total_attempts: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error al actualizar estadísticas de entrenamiento:', error);
  }
}

async function updateNutritionStats(
  userId: string, 
  mealId?: string, 
  stats?: { 
    satisfaction: number; 
    fullness: number; 
    adherence: number; 
    taste: number 
  }
): Promise<void> {
  // Implementación similar a updateWorkoutStats
  // Se omite por brevedad
}

async function processCheckInResponses(checkIn: ScheduledCheckIn): Promise<void> {
  // Procesar respuestas para generar recomendaciones automáticas
  // Se omite por brevedad
}
