import { supabase } from "@/lib/supabase-client"

// Tipos para el servicio de análisis de sueño
export interface SleepProfile {
  userId: string
  averageSleepDuration: number
  bedTime: string
  wakeTime: string
  sleepLatency: number
  sleepQuality: string
  wakeUpFrequency: string
  morningFeel: string
  environmentFactors: {
    roomTemperature: string
    noiseLevel: string
    lightLevel: string
  }
  sleepDisruptors: string[]
  sleepDisorders: string[]
  sleepGoal: string
  lastUpdated: string
}

export interface SleepScore {
  overall: number // 0-100
  duration: number // 0-100
  quality: number // 0-100
  consistency: number // 0-100
  efficiency: number // 0-100
}

export interface SleepRecommendation {
  id: string
  category: 'environment' | 'habits' | 'schedule' | 'relaxation' | 'nutrition'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  implementationDifficulty: 'easy' | 'moderate' | 'challenging'
  expectedImpact: 'high' | 'medium' | 'low'
}

/**
 * Obtiene el perfil de sueño del usuario
 */
export async function getSleepProfile(userId: string) {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('sleep_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        // Tabla no existe o no se encontraron filas
        console.log('No se encontró perfil de sueño, generando perfil por defecto')
        return { data: generateDefaultSleepProfile(userId), error: null }
      }
      
      console.error('Error al obtener perfil de sueño:', error)
      return { data: null, error }
    }
    
    if (data) {
      // Transformar datos al formato de la aplicación
      const assessmentData = data.assessment_data
      
      // Extraer disruptores de sueño
      const sleepDisruptors: string[] = []
      if (assessmentData.caffeineBefore) sleepDisruptors.push('caffeine')
      if (assessmentData.alcoholBefore) sleepDisruptors.push('alcohol')
      if (assessmentData.screenTimeBefore) sleepDisruptors.push('screen_time')
      if (assessmentData.exerciseBefore) sleepDisruptors.push('exercise')
      if (assessmentData.heavyMealBefore) sleepDisruptors.push('heavy_meal')
      
      // Extraer trastornos del sueño
      const sleepDisorders: string[] = []
      if (assessmentData.snoring) sleepDisorders.push('snoring')
      if (assessmentData.sleepApnea) sleepDisorders.push('sleep_apnea')
      if (assessmentData.insomnia) sleepDisorders.push('insomnia')
      if (assessmentData.restlessLegs) sleepDisorders.push('restless_legs')
      if (assessmentData.nightmares) sleepDisorders.push('nightmares')
      if (assessmentData.sleepwalking) sleepDisorders.push('sleepwalking')
      
      const sleepProfile: SleepProfile = {
        userId,
        averageSleepDuration: assessmentData.averageSleepDuration || 7,
        bedTime: assessmentData.bedTime || '23:00',
        wakeTime: assessmentData.wakeTime || '07:00',
        sleepLatency: assessmentData.sleepLatency || 15,
        sleepQuality: assessmentData.sleepQuality || 'fair',
        wakeUpFrequency: assessmentData.wakeUpFrequency || 'sometimes',
        morningFeel: assessmentData.morningFeel || 'neutral',
        environmentFactors: {
          roomTemperature: assessmentData.roomTemperature || 'comfortable',
          noiseLevel: assessmentData.noiseLevel || 'quiet',
          lightLevel: assessmentData.lightLevel || 'dark'
        },
        sleepDisruptors,
        sleepDisorders,
        sleepGoal: assessmentData.sleepGoal || 'feel_more_rested',
        lastUpdated: data.created_at
      }
      
      return { data: sleepProfile, error: null }
    }
    
    // Si no hay datos, generar perfil por defecto
    return { data: generateDefaultSleepProfile(userId), error: null }
  } catch (error) {
    console.error('Error en getSleepProfile:', error)
    return { data: generateDefaultSleepProfile(userId), error }
  }
}

/**
 * Calcula la puntuación de sueño basada en el perfil
 */
export function calculateSleepScore(profile: SleepProfile): SleepScore {
  // Puntuación de duración (0-100)
  // Ideal: 7-9 horas para adultos
  let durationScore = 0
  if (profile.averageSleepDuration >= 7 && profile.averageSleepDuration <= 9) {
    durationScore = 100
  } else if (profile.averageSleepDuration >= 6 && profile.averageSleepDuration < 7) {
    durationScore = 80
  } else if (profile.averageSleepDuration > 9 && profile.averageSleepDuration <= 10) {
    durationScore = 80
  } else if (profile.averageSleepDuration >= 5 && profile.averageSleepDuration < 6) {
    durationScore = 60
  } else if (profile.averageSleepDuration > 10 && profile.averageSleepDuration <= 11) {
    durationScore = 60
  } else if (profile.averageSleepDuration >= 4 && profile.averageSleepDuration < 5) {
    durationScore = 40
  } else if (profile.averageSleepDuration > 11) {
    durationScore = 40
  } else {
    durationScore = 20
  }
  
  // Puntuación de calidad (0-100)
  let qualityScore = 0
  switch (profile.sleepQuality) {
    case 'very_good':
      qualityScore = 100
      break
    case 'good':
      qualityScore = 80
      break
    case 'fair':
      qualityScore = 60
      break
    case 'poor':
      qualityScore = 40
      break
    case 'very_poor':
      qualityScore = 20
      break
    default:
      qualityScore = 60
  }
  
  // Ajustar según frecuencia de despertares
  switch (profile.wakeUpFrequency) {
    case 'never':
      qualityScore = Math.min(100, qualityScore + 10)
      break
    case 'rarely':
      qualityScore = Math.min(100, qualityScore + 5)
      break
    case 'sometimes':
      // Sin cambios
      break
    case 'often':
      qualityScore = Math.max(0, qualityScore - 10)
      break
    case 'very_often':
      qualityScore = Math.max(0, qualityScore - 20)
      break
  }
  
  // Puntuación de consistencia (0-100)
  // Basada en la regularidad del horario de sueño
  // Implementación simplificada
  const consistencyScore = 70 // Valor por defecto
  
  // Puntuación de eficiencia (0-100)
  // Basada en el tiempo para quedarse dormido y la sensación al despertar
  let efficiencyScore = 0
  
  // Componente de latencia de sueño
  if (profile.sleepLatency <= 10) {
    efficiencyScore += 50
  } else if (profile.sleepLatency <= 20) {
    efficiencyScore += 40
  } else if (profile.sleepLatency <= 30) {
    efficiencyScore += 30
  } else if (profile.sleepLatency <= 45) {
    efficiencyScore += 20
  } else if (profile.sleepLatency <= 60) {
    efficiencyScore += 10
  } else {
    efficiencyScore += 0
  }
  
  // Componente de sensación al despertar
  switch (profile.morningFeel) {
    case 'very_rested':
      efficiencyScore += 50
      break
    case 'rested':
      efficiencyScore += 40
      break
    case 'neutral':
      efficiencyScore += 30
      break
    case 'tired':
      efficiencyScore += 20
      break
    case 'very_tired':
      efficiencyScore += 10
      break
    default:
      efficiencyScore += 30
  }
  
  // Puntuación general (promedio ponderado)
  const overall = Math.round(
    (durationScore * 0.25) +
    (qualityScore * 0.3) +
    (consistencyScore * 0.2) +
    (efficiencyScore * 0.25)
  )
  
  return {
    overall,
    duration: durationScore,
    quality: qualityScore,
    consistency: consistencyScore,
    efficiency: efficiencyScore
  }
}

/**
 * Genera recomendaciones personalizadas basadas en el perfil de sueño
 */
export function generateSleepRecommendations(profile: SleepProfile): SleepRecommendation[] {
  const recommendations: SleepRecommendation[] = []
  
  // Recomendaciones basadas en la duración del sueño
  if (profile.averageSleepDuration < 7) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'schedule',
      title: 'Aumenta tu tiempo de sueño',
      description: 'Intenta acostarte 30 minutos antes cada noche hasta alcanzar al menos 7 horas de sueño.',
      priority: 'high',
      implementationDifficulty: 'moderate',
      expectedImpact: 'high'
    })
  } else if (profile.averageSleepDuration > 9) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'schedule',
      title: 'Optimiza tu tiempo de sueño',
      description: 'Dormir demasiado puede afectar tu energía. Intenta establecer un horario más consistente con 7-8 horas de sueño.',
      priority: 'medium',
      implementationDifficulty: 'moderate',
      expectedImpact: 'medium'
    })
  }
  
  // Recomendaciones basadas en factores ambientales
  if (profile.environmentFactors.lightLevel !== 'very_dark' && profile.environmentFactors.lightLevel !== 'dark') {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'environment',
      title: 'Optimiza la oscuridad en tu habitación',
      description: 'Usa cortinas opacas o un antifaz para dormir en completa oscuridad, lo que mejora la producción de melatonina.',
      priority: 'high',
      implementationDifficulty: 'easy',
      expectedImpact: 'high'
    })
  }
  
  if (profile.environmentFactors.noiseLevel !== 'very_quiet' && profile.environmentFactors.noiseLevel !== 'quiet') {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'environment',
      title: 'Reduce el ruido ambiental',
      description: 'Utiliza tapones para los oídos o una máquina de ruido blanco para enmascarar sonidos perturbadores.',
      priority: 'medium',
      implementationDifficulty: 'easy',
      expectedImpact: 'high'
    })
  }
  
  if (profile.environmentFactors.roomTemperature === 'too_warm' || profile.environmentFactors.roomTemperature === 'warm') {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'environment',
      title: 'Ajusta la temperatura de tu habitación',
      description: 'Mantén tu habitación entre 16-19°C (60-67°F), que es el rango óptimo para dormir.',
      priority: 'medium',
      implementationDifficulty: 'moderate',
      expectedImpact: 'medium'
    })
  }
  
  // Recomendaciones basadas en disruptores
  if (profile.sleepDisruptors.includes('caffeine')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'nutrition',
      title: 'Limita la cafeína',
      description: 'Evita el consumo de cafeína (café, té, refrescos, chocolate) al menos 6 horas antes de acostarte.',
      priority: 'high',
      implementationDifficulty: 'moderate',
      expectedImpact: 'high'
    })
  }
  
  if (profile.sleepDisruptors.includes('alcohol')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'nutrition',
      title: 'Reduce el alcohol antes de dormir',
      description: 'Aunque el alcohol puede ayudarte a conciliar el sueño, reduce su calidad. Evítalo al menos 3 horas antes de acostarte.',
      priority: 'high',
      implementationDifficulty: 'moderate',
      expectedImpact: 'high'
    })
  }
  
  if (profile.sleepDisruptors.includes('screen_time')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'habits',
      title: 'Implementa un toque de queda digital',
      description: 'Apaga todos los dispositivos electrónicos al menos 1 hora antes de acostarte para reducir la exposición a la luz azul.',
      priority: 'high',
      implementationDifficulty: 'challenging',
      expectedImpact: 'high'
    })
  }
  
  // Recomendaciones basadas en el objetivo principal
  switch (profile.sleepGoal) {
    case 'fall_asleep_faster':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'relaxation',
        title: 'Técnica de respiración 4-7-8',
        description: 'Inhala por 4 segundos, mantén la respiración por 7 segundos, y exhala por 8 segundos. Repite 4 veces antes de dormir.',
        priority: 'high',
        implementationDifficulty: 'easy',
        expectedImpact: 'high'
      })
      break
    case 'sleep_longer':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'schedule',
        title: 'Establece un horario consistente',
        description: 'Acuéstate y levántate a la misma hora todos los días, incluso los fines de semana, para regular tu reloj biológico.',
        priority: 'high',
        implementationDifficulty: 'moderate',
        expectedImpact: 'high'
      })
      break
    case 'reduce_wakeups':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'habits',
        title: 'Limita los líquidos antes de dormir',
        description: 'Reduce la ingesta de líquidos 2-3 horas antes de acostarte para minimizar la necesidad de levantarte al baño.',
        priority: 'medium',
        implementationDifficulty: 'easy',
        expectedImpact: 'medium'
      })
      break
    case 'feel_more_rested':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'schedule',
        title: 'Optimiza tus ciclos de sueño',
        description: 'Intenta dormir en múltiplos de 90 minutos (duración aproximada de un ciclo de sueño completo) para despertar al final de un ciclo.',
        priority: 'medium',
        implementationDifficulty: 'moderate',
        expectedImpact: 'high'
      })
      break
    case 'consistent_schedule':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'habits',
        title: 'Rutina relajante antes de dormir',
        description: 'Establece una rutina de 30 minutos antes de acostarte: baño tibio, lectura relajante o meditación para señalar a tu cuerpo que es hora de dormir.',
        priority: 'high',
        implementationDifficulty: 'moderate',
        expectedImpact: 'high'
      })
      break
  }
  
  return recommendations
}

/**
 * Genera un perfil de sueño por defecto
 */
function generateDefaultSleepProfile(userId: string): SleepProfile {
  return {
    userId,
    averageSleepDuration: 7,
    bedTime: "23:00",
    wakeTime: "07:00",
    sleepLatency: 15,
    sleepQuality: 'fair',
    wakeUpFrequency: 'sometimes',
    morningFeel: 'neutral',
    environmentFactors: {
      roomTemperature: 'comfortable',
      noiseLevel: 'quiet',
      lightLevel: 'dark'
    },
    sleepDisruptors: ['screen_time'],
    sleepDisorders: [],
    sleepGoal: 'feel_more_rested',
    lastUpdated: new Date().toISOString()
  }
}
