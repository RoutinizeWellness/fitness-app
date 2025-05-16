import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { PostgrestError } from '@supabase/supabase-js';
import { UserPattern, QueryResponse } from './learning-algorithm';

// Tipos para datos de wearables
export type WearableData = {
  id: string;
  user_id: string;
  date: string;
  device_type: 'fitbit' | 'garmin' | 'apple_health' | 'google_fit' | 'other';
  steps?: number;
  calories_burned?: number;
  active_minutes?: number;
  heart_rate?: {
    resting: number;
    average: number;
    max: number;
    zones?: {
      fat_burn: number;
      cardio: number;
      peak: number;
    };
  };
  sleep?: {
    duration: number; // minutos
    deep: number; // minutos
    light: number; // minutos
    rem: number; // minutos
    awake: number; // minutos
    score?: number; // 0-100
  };
  stress_level?: number; // 1-100
  data_json?: any;
  created_at: string;
};

// Tipos para patrones de recuperación
export type RecoveryPattern = {
  sleep_quality: number; // 0-100
  resting_heart_rate: number;
  heart_rate_variability?: number;
  stress_level: number; // 0-100
  recovery_score: number; // 0-100
  ready_to_train: boolean;
};

/**
 * Guarda datos de wearables en la base de datos
 */
export async function saveWearableData(
  userId: string,
  data: Omit<WearableData, 'id' | 'user_id' | 'created_at'>
): Promise<QueryResponse<{ id: string }>> {
  try {
    const { data: response, error } = await supabase
      .from('wearable_data')
      .insert([{
        id: uuidv4(),
        user_id: userId,
        date: data.date,
        device_type: data.device_type,
        steps: data.steps,
        calories_burned: data.calories_burned,
        active_minutes: data.active_minutes,
        heart_rate: data.heart_rate,
        sleep: data.sleep,
        stress_level: data.stress_level,
        data_json: data.data_json,
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: response as { id: string }, error: null };
  } catch (e) {
    console.error('Error en saveWearableData:', e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en saveWearableData')
    };
  }
}

/**
 * Obtiene datos de wearables para un usuario
 */
export async function getWearableData(
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<QueryResponse<WearableData[]>> {
  try {
    let query = supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId);

    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data: data as WearableData[], error: null };
  } catch (e) {
    console.error(`Error en getWearableData para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en getWearableData')
    };
  }
}

/**
 * Analiza patrones de sueño y recuperación
 */
export async function analyzeRecoveryPatterns(
  userId: string
): Promise<QueryResponse<UserPattern>> {
  try {
    // Obtener datos de wearables de los últimos 14 días
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: wearableData, error: wearableError } = await getWearableData(userId, {
      startDate: twoWeeksAgo.toISOString().split('T')[0]
    });

    if (wearableError) {
      return { data: null, error: wearableError };
    }

    if (!wearableData || wearableData.length < 3) {
      return {
        data: null,
        error: new Error('No hay suficientes datos de wearables para analizar patrones de recuperación')
      };
    }

    // Analizar patrones de sueño
    const sleepData = wearableData.filter(d => d.sleep && d.sleep.duration > 0);
    const sleepPatterns = {
      average_duration: 0,
      average_deep: 0,
      average_rem: 0,
      average_score: 0,
      optimal_sleep_duration: 0,
      sleep_consistency: 0
    };

    if (sleepData.length >= 3) {
      // Calcular promedios
      sleepPatterns.average_duration = sleepData.reduce((sum, d) => sum + d.sleep!.duration, 0) / sleepData.length;
      sleepPatterns.average_deep = sleepData.reduce((sum, d) => sum + (d.sleep!.deep || 0), 0) / sleepData.length;
      sleepPatterns.average_rem = sleepData.reduce((sum, d) => sum + (d.sleep!.rem || 0), 0) / sleepData.length;
      
      const scoresData = sleepData.filter(d => d.sleep!.score);
      if (scoresData.length > 0) {
        sleepPatterns.average_score = scoresData.reduce((sum, d) => sum + (d.sleep!.score || 0), 0) / scoresData.length;
      }

      // Determinar duración óptima de sueño
      // Comparar días con mejor puntuación de sueño
      const sortedBySleepScore = [...sleepData].sort((a, b) => 
        (b.sleep!.score || 0) - (a.sleep!.score || 0)
      );
      
      if (sortedBySleepScore.length > 0) {
        // Tomar el promedio de los 3 mejores días o menos si no hay suficientes
        const topDays = sortedBySleepScore.slice(0, Math.min(3, sortedBySleepScore.length));
        sleepPatterns.optimal_sleep_duration = topDays.reduce((sum, d) => sum + d.sleep!.duration, 0) / topDays.length;
      }

      // Calcular consistencia de sueño (variación en la hora de acostarse)
      // Esto requeriría datos más detallados que no tenemos en este modelo simplificado
      sleepPatterns.sleep_consistency = 70; // Valor por defecto
    }

    // Analizar patrones de frecuencia cardíaca
    const heartRateData = wearableData.filter(d => d.heart_rate && d.heart_rate.resting > 0);
    const heartRatePatterns = {
      average_resting: 0,
      min_resting: 0,
      max_resting: 0,
      resting_trend: 'stable' as 'decreasing' | 'increasing' | 'stable'
    };

    if (heartRateData.length >= 3) {
      // Calcular promedios y extremos
      heartRatePatterns.average_resting = heartRateData.reduce((sum, d) => sum + d.heart_rate!.resting, 0) / heartRateData.length;
      heartRatePatterns.min_resting = Math.min(...heartRateData.map(d => d.heart_rate!.resting));
      heartRatePatterns.max_resting = Math.max(...heartRateData.map(d => d.heart_rate!.resting));

      // Determinar tendencia
      // Ordenar por fecha (más antiguo primero)
      const sortedByDate = [...heartRateData].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      if (sortedByDate.length >= 5) {
        // Calcular tendencia usando los últimos 5 días
        const recentData = sortedByDate.slice(-5);
        const firstHalf = recentData.slice(0, 2);
        const secondHalf = recentData.slice(-2);
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.heart_rate!.resting, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.heart_rate!.resting, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference < -2) {
          heartRatePatterns.resting_trend = 'decreasing';
        } else if (difference > 2) {
          heartRatePatterns.resting_trend = 'increasing';
        } else {
          heartRatePatterns.resting_trend = 'stable';
        }
      }
    }

    // Analizar patrones de estrés
    const stressData = wearableData.filter(d => d.stress_level !== undefined);
    const stressPatterns = {
      average_stress: 0,
      high_stress_days: 0,
      low_stress_days: 0
    };

    if (stressData.length >= 3) {
      stressPatterns.average_stress = stressData.reduce((sum, d) => sum + (d.stress_level || 0), 0) / stressData.length;
      stressPatterns.high_stress_days = stressData.filter(d => (d.stress_level || 0) > 70).length;
      stressPatterns.low_stress_days = stressData.filter(d => (d.stress_level || 0) < 30).length;
    }

    // Calcular patrones de recuperación diaria
    const recoveryPatterns: RecoveryPattern[] = [];
    
    for (const data of wearableData) {
      if (data.sleep || data.heart_rate || data.stress_level) {
        // Calcular puntuación de sueño
        const sleepQuality = data.sleep && data.sleep.score 
          ? data.sleep.score 
          : data.sleep && data.sleep.duration > 0
            ? Math.min(100, (data.sleep.duration / 480) * 100) // 8 horas = 100%
            : 50; // Valor por defecto
        
        // Obtener frecuencia cardíaca en reposo
        const restingHR = data.heart_rate && data.heart_rate.resting > 0
          ? data.heart_rate.resting
          : 65; // Valor por defecto
        
        // Obtener nivel de estrés
        const stressLevel = data.stress_level !== undefined
          ? data.stress_level
          : 50; // Valor por defecto
        
        // Calcular puntuación de recuperación
        // 50% sueño, 30% frecuencia cardíaca, 20% estrés
        const sleepScore = sleepQuality * 0.5;
        const hrScore = (100 - Math.min(100, Math.max(0, (restingHR - 40) * 1.67))) * 0.3; // 40-100 BPM mapeado a 100-0
        const stressScore = (100 - stressLevel) * 0.2;
        
        const recoveryScore = sleepScore + hrScore + stressScore;
        
        recoveryPatterns.push({
          sleep_quality: sleepQuality,
          resting_heart_rate: restingHR,
          stress_level: stressLevel,
          recovery_score: recoveryScore,
          ready_to_train: recoveryScore >= 70
        });
      }
    }

    // Crear patrón de recuperación
    const pattern: UserPattern = {
      id: uuidv4(),
      user_id: userId,
      pattern_type: 'recovery_pattern',
      pattern_data: {
        sleep_patterns: sleepPatterns,
        heart_rate_patterns: heartRatePatterns,
        stress_patterns: stressPatterns,
        daily_recovery: recoveryPatterns,
        optimal_recovery_time: calculateOptimalRecoveryTime(recoveryPatterns),
        recovery_recommendations: generateRecoveryRecommendations(sleepPatterns, heartRatePatterns, stressPatterns)
      },
      confidence: Math.min(wearableData.length * 5, 90),
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Guardar el patrón en la base de datos
    const { data: savedPattern, error: saveError } = await supabase
      .from('user_patterns')
      .upsert([{
        id: pattern.id,
        user_id: pattern.user_id,
        pattern_type: pattern.pattern_type,
        pattern_data: pattern.pattern_data,
        confidence: pattern.confidence,
        last_updated: pattern.last_updated,
        created_at: pattern.created_at
      }], {
        onConflict: 'user_id, pattern_type'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error al guardar patrón de recuperación:', saveError);
    }

    return { data: pattern, error: null };
  } catch (e) {
    console.error(`Error en analyzeRecoveryPatterns para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en analyzeRecoveryPatterns')
    };
  }
}

/**
 * Calcula el tiempo óptimo de recuperación basado en patrones
 */
function calculateOptimalRecoveryTime(recoveryPatterns: RecoveryPattern[]): number {
  if (recoveryPatterns.length < 3) {
    return 24; // Valor por defecto en horas
  }

  // Ordenar por puntuación de recuperación (menor a mayor)
  const sortedPatterns = [...recoveryPatterns].sort((a, b) => a.recovery_score - b.recovery_score);
  
  // Calcular tiempo promedio para recuperarse de puntuaciones bajas a altas
  const lowRecovery = sortedPatterns.slice(0, Math.floor(sortedPatterns.length / 3));
  const highRecovery = sortedPatterns.slice(-Math.floor(sortedPatterns.length / 3));
  
  if (lowRecovery.length > 0 && highRecovery.length > 0) {
    // Estimar 24 horas para pasar de puntuación baja a alta
    const avgLowScore = lowRecovery.reduce((sum, p) => sum + p.recovery_score, 0) / lowRecovery.length;
    const avgHighScore = highRecovery.reduce((sum, p) => sum + p.recovery_score, 0) / highRecovery.length;
    const scoreDifference = avgHighScore - avgLowScore;
    
    if (scoreDifference > 0) {
      // Estimar tiempo de recuperación basado en la diferencia de puntuación
      // Asumimos que una diferencia de 30 puntos requiere aproximadamente 24 horas
      return Math.max(12, Math.min(48, (scoreDifference / 30) * 24));
    }
  }
  
  return 24; // Valor por defecto en horas
}

/**
 * Genera recomendaciones de recuperación basadas en patrones
 */
function generateRecoveryRecommendations(
  sleepPatterns: any,
  heartRatePatterns: any,
  stressPatterns: any
): string[] {
  const recommendations: string[] = [];

  // Recomendaciones de sueño
  if (sleepPatterns.average_duration < 420) { // Menos de 7 horas
    recommendations.push('Aumenta tu tiempo de sueño a al menos 7-8 horas para mejorar la recuperación');
  }
  
  if (sleepPatterns.average_deep < 60) { // Menos de 1 hora de sueño profundo
    recommendations.push('Mejora la calidad de tu sueño evitando pantallas antes de dormir y manteniendo un horario regular');
  }
  
  if (sleepPatterns.optimal_sleep_duration > 0 && Math.abs(sleepPatterns.average_duration - sleepPatterns.optimal_sleep_duration) > 60) {
    recommendations.push(`Intenta dormir aproximadamente ${Math.round(sleepPatterns.optimal_sleep_duration / 60)} horas, que parece ser tu duración óptima`);
  }

  // Recomendaciones de frecuencia cardíaca
  if (heartRatePatterns.resting_trend === 'increasing') {
    recommendations.push('Tu frecuencia cardíaca en reposo está aumentando, lo que puede indicar fatiga acumulada. Considera reducir la intensidad de tus entrenamientos');
  }
  
  if (heartRatePatterns.average_resting > 70) {
    recommendations.push('Tu frecuencia cardíaca en reposo es relativamente alta. Considera incorporar más entrenamiento aeróbico de baja intensidad');
  }

  // Recomendaciones de estrés
  if (stressPatterns.average_stress > 70) {
    recommendations.push('Tus niveles de estrés son elevados. Incorpora técnicas de relajación como meditación o respiración profunda');
  }
  
  if (stressPatterns.high_stress_days > stressPatterns.low_stress_days * 2) {
    recommendations.push('Estás experimentando muchos días de alto estrés. Considera reducir la intensidad de tus entrenamientos en estos días');
  }

  // Si no hay recomendaciones específicas
  if (recommendations.length === 0) {
    recommendations.push('Tus patrones de recuperación parecen adecuados. Continúa con tu rutina actual');
  }

  return recommendations;
}

/**
 * Determina si el usuario está listo para entrenar hoy
 */
export async function isReadyToTrain(
  userId: string
): Promise<QueryResponse<{ ready: boolean; recovery_score: number; recommendations: string[] }>> {
  try {
    // Obtener datos de wearables de hoy
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayData, error: dataError } = await getWearableData(userId, {
      startDate: today,
      endDate: today
    });

    if (dataError) {
      return { data: null, error: dataError };
    }

    // Si no hay datos de hoy, obtener el patrón de recuperación más reciente
    if (!todayData || todayData.length === 0) {
      const { data: recoveryPattern, error: patternError } = await supabase
        .from('user_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_type', 'recovery_pattern')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (patternError) {
        return { 
          data: { 
            ready: true, // Por defecto, asumimos que está listo
            recovery_score: 75,
            recommendations: ['No hay suficientes datos para determinar tu estado de recuperación']
          }, 
          error: null 
        };
      }

      // Usar el último día de datos de recuperación
      const dailyRecovery = recoveryPattern.pattern_data.daily_recovery;
      if (dailyRecovery && dailyRecovery.length > 0) {
        const lastRecovery = dailyRecovery[dailyRecovery.length - 1];
        
        return {
          data: {
            ready: lastRecovery.ready_to_train,
            recovery_score: lastRecovery.recovery_score,
            recommendations: recoveryPattern.pattern_data.recovery_recommendations || []
          },
          error: null
        };
      }

      return { 
        data: { 
          ready: true, // Por defecto, asumimos que está listo
          recovery_score: 75,
          recommendations: ['No hay suficientes datos para determinar tu estado de recuperación']
        }, 
        error: null 
      };
    }

    // Calcular estado de recuperación con los datos de hoy
    const todayWearable = todayData[0];
    
    // Calcular puntuación de sueño
    const sleepQuality = todayWearable.sleep && todayWearable.sleep.score 
      ? todayWearable.sleep.score 
      : todayWearable.sleep && todayWearable.sleep.duration > 0
        ? Math.min(100, (todayWearable.sleep.duration / 480) * 100) // 8 horas = 100%
        : 50; // Valor por defecto
    
    // Obtener frecuencia cardíaca en reposo
    const restingHR = todayWearable.heart_rate && todayWearable.heart_rate.resting > 0
      ? todayWearable.heart_rate.resting
      : 65; // Valor por defecto
    
    // Obtener nivel de estrés
    const stressLevel = todayWearable.stress_level !== undefined
      ? todayWearable.stress_level
      : 50; // Valor por defecto
    
    // Calcular puntuación de recuperación
    // 50% sueño, 30% frecuencia cardíaca, 20% estrés
    const sleepScore = sleepQuality * 0.5;
    const hrScore = (100 - Math.min(100, Math.max(0, (restingHR - 40) * 1.67))) * 0.3; // 40-100 BPM mapeado a 100-0
    const stressScore = (100 - stressLevel) * 0.2;
    
    const recoveryScore = sleepScore + hrScore + stressScore;
    const readyToTrain = recoveryScore >= 70;

    // Generar recomendaciones
    let recommendations: string[] = [];
    
    if (readyToTrain) {
      if (recoveryScore >= 90) {
        recommendations.push('Excelente recuperación. Ideal para un entrenamiento de alta intensidad');
      } else {
        recommendations.push('Buena recuperación. Adecuado para un entrenamiento normal');
      }
    } else {
      if (recoveryScore < 50) {
        recommendations.push('Baja recuperación. Considera un día de descanso o actividad muy ligera');
      } else {
        recommendations.push('Recuperación moderada. Reduce la intensidad del entrenamiento hoy');
      }
      
      // Añadir recomendaciones específicas
      if (sleepQuality < 60) {
        recommendations.push('Tu calidad de sueño es baja. Prioriza mejorar tu descanso');
      }
      
      if (restingHR > 70) {
        recommendations.push('Tu frecuencia cardíaca en reposo está elevada, lo que indica fatiga');
      }
      
      if (stressLevel > 70) {
        recommendations.push('Tus niveles de estrés son altos. Considera técnicas de relajación');
      }
    }

    return {
      data: {
        ready: readyToTrain,
        recovery_score: Math.round(recoveryScore),
        recommendations
      },
      error: null
    };
  } catch (e) {
    console.error(`Error en isReadyToTrain para userId=${userId}:`, e);
    return {
      data: null,
      error: e instanceof PostgrestError ? e : new Error('Error desconocido en isReadyToTrain')
    };
  }
}
