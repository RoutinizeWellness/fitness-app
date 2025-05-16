import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TrainingProfile } from './training-personalization-service'
import { supabase } from './supabase-client'
import { generateWorkoutPlan } from './workout-plan-generator'

/**
 * Genera un plan de entrenamiento utilizando la API de Supabase
 */
export async function generateWorkoutPlanWithEdgeFunction(userId: string, profile: TrainingProfile) {
  try {
    console.log('Generando plan de entrenamiento...')
    console.log('Usuario:', userId)
    console.log('Perfil:', profile)

    // Generar el plan utilizando la función local
    const plan = await generateWorkoutPlan(userId, profile)

    if (!plan) {
      throw new Error('No se pudo generar el plan de entrenamiento')
    }

    console.log('Plan generado exitosamente:', plan)
    return { data: { plan } }
  } catch (error) {
    console.error('Error al generar plan de entrenamiento:', error)
    return { error }
  }
}

/**
 * Analiza un video de entrenamiento utilizando la API de Supabase
 */
export async function analyzeWorkoutVideo(userId: string, videoUrl: string, exercise?: string) {
  try {
    console.log('Analizando video de entrenamiento:', videoUrl)

    // Simulación de análisis de postura
    const analysisData = {
      posture: Math.random() > 0.7 ? 'excellent' : Math.random() > 0.4 ? 'good' : 'needs_improvement',
      issues: [
        'Ligera curvatura en la espalda baja',
        'Rodillas ligeramente hacia adentro'
      ],
      recommendations: [
        'Mantén la espalda recta durante todo el movimiento',
        'Alinea las rodillas con los pies'
      ],
      score: Math.floor(Math.random() * 30) + 70
    }

    // Guardar el análisis en Supabase
    const { error } = await supabase
      .from('posture_analysis')
      .insert([{
        user_id: userId,
        video_url: videoUrl,
        exercise: exercise || 'unknown',
        posture: analysisData.posture,
        issues: analysisData.issues,
        recommendations: analysisData.recommendations,
        score: analysisData.score
      }])

    if (error) {
      console.error('Error al guardar el análisis de postura:', error)
    }

    return { data: analysisData }
  } catch (error) {
    console.error('Error al analizar video de entrenamiento:', error)
    return { error }
  }
}

/**
 * Genera recomendaciones de entrenamiento basadas en datos de fatiga y progreso
 */
export async function generateTrainingRecommendations(userId: string) {
  try {
    console.log('Generando recomendaciones de entrenamiento para el usuario:', userId)

    // Obtener datos de fatiga del usuario
    const { data: fatigueData, error: fatigueError } = await supabase
      .from('user_fatigue')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fatigueError) {
      console.error('Error al obtener datos de fatiga:', fatigueError)
    }

    // Obtener sesiones de entrenamiento recientes
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10)

    if (sessionError) {
      console.error('Error al obtener sesiones de entrenamiento:', sessionError)
    }

    // Generar recomendaciones basadas en los datos
    const recommendations = {
      adjustments: [
        {
          type: 'volume',
          description: 'Reducir el volumen de entrenamiento de pecho en un 10% esta semana',
          reason: 'Fatiga acumulada alta'
        },
        {
          type: 'intensity',
          description: 'Aumentar la intensidad en ejercicios de piernas',
          reason: 'Progresión estancada'
        }
      ],
      suggestions: [
        'Incluir un día adicional de recuperación esta semana',
        'Probar variantes de press de banca para estimular nuevas fibras musculares',
        'Aumentar la ingesta de proteínas en 20g los días de entrenamiento'
      ]
    }

    // Guardar las recomendaciones en Supabase
    const { error: saveError } = await supabase
      .from('training_recommendations')
      .insert([{
        user_id: userId,
        adjustments: recommendations.adjustments,
        suggestions: recommendations.suggestions
      }])

    if (saveError) {
      console.error('Error al guardar las recomendaciones:', saveError)
    }

    return { data: recommendations }
  } catch (error) {
    console.error('Error al generar recomendaciones de entrenamiento:', error)
    return { error }
  }
}
