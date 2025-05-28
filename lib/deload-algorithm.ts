import { supabase } from './supabase-client';
import { WorkoutSession } from './types/training';

// Tipos para el algoritmo de deload
export interface FatigueMetrics {
  userId: string;
  overallFatigue: number; // 0-100
  muscleGroupFatigue: Record<string, number>; // Grupo muscular -> nivel de fatiga (0-100)
  performanceDecline: number; // % de disminución en rendimiento
  recoveryQuality: number; // 0-100
  sleepQuality: number; // 0-100
  soreness: number; // 0-100
  readiness: number; // 0-100
  stressLevel: number; // 0-100
  rpeAverage: number; // 0-10
  rirAverage: number; // 0-5
  volumeTolerance: number; // 0-100
  intensityTolerance: number; // 0-100
  lastDeloadDate?: string;
  weeksSinceLastDeload: number;
  recommendedDeload: boolean;
  deloadUrgency: 'low' | 'moderate' | 'high' | 'critical';
  deloadType: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery';
  deloadDuration: number; // en días
  notes: string;
}

export interface PerformanceData {
  exercise: string;
  muscleGroup: string;
  date: string;
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  volume: number; // peso * reps * sets
  relativeIntensity: number; // % de 1RM estimado
  performanceIndex: number; // índice de rendimiento calculado
}

export interface DeloadRecommendation {
  isRecommended: boolean;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  type: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery';
  duration: number; // en días
  volumeReduction: number; // % de reducción
  intensityReduction: number; // % de reducción
  frequencyReduction: number; // % de reducción
  targetMuscleGroups: string[]; // grupos musculares que necesitan más descanso
  reasoning: string[];
  suggestedActivities: string[];
  expectedRecoveryTime: number; // en días
  expectedPerformanceImprovement: number; // % estimado
}

/**
 * Calcula las métricas de fatiga para un usuario
 * @param userId ID del usuario
 * @returns Métricas de fatiga
 */
export async function calculateFatigueMetrics(userId: string): Promise<FatigueMetrics | null> {
  try {
    // Obtener las últimas sesiones de entrenamiento (últimas 4 semanas)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fourWeeksAgo.toISOString())
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error al obtener sesiones de entrenamiento:', error);
      return null;
    }
    
    if (!sessions || sessions.length === 0) {
      console.log('No hay sesiones de entrenamiento recientes para calcular fatiga');
      return null;
    }
    
    // Obtener la última fecha de deload
    const { data: deloadData, error: deloadError } = await supabase
      .from('deload_history')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1);
    
    if (deloadError) {
      console.error('Error al obtener historial de deload:', deloadError);
    }
    
    const lastDeloadDate = deloadData && deloadData.length > 0 ? deloadData[0].date : null;
    const weeksSinceLastDeload = lastDeloadDate 
      ? Math.floor((new Date().getTime() - new Date(lastDeloadDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) 
      : 12; // Si no hay deload previo, asumimos 12 semanas
    
    // Calcular fatiga por grupo muscular
    const muscleGroupFatigue: Record<string, number> = {};
    const muscleGroupSessions: Record<string, WorkoutSession[]> = {};
    
    // Agrupar sesiones por grupo muscular
    sessions.forEach(session => {
      const exercises = session.exercises || [];
      exercises.forEach(exercise => {
        const muscleGroups = exercise.muscle_groups || [];
        muscleGroups.forEach(group => {
          if (!muscleGroupSessions[group]) {
            muscleGroupSessions[group] = [];
          }
          muscleGroupSessions[group].push(session);
        });
      });
    });
    
    // Calcular fatiga para cada grupo muscular
    Object.keys(muscleGroupSessions).forEach(group => {
      const groupSessions = muscleGroupSessions[group];
      
      // Calcular fatiga basada en frecuencia, volumen e intensidad
      const frequency = groupSessions.length;
      const averageVolume = groupSessions.reduce((sum, session) => {
        const exercises = session.exercises || [];
        const groupExercises = exercises.filter(ex => (ex.muscle_groups || []).includes(group));
        const volume = groupExercises.reduce((v, ex) => v + (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0), 0);
        return sum + volume;
      }, 0) / frequency;
      
      const averageRPE = groupSessions.reduce((sum, session) => {
        return sum + (session.rpe || 0);
      }, 0) / frequency;
      
      // Calcular fatiga (algoritmo simplificado)
      const volumeFactor = Math.min(averageVolume / 5000, 1) * 40; // 40% de la fatiga
      const frequencyFactor = Math.min(frequency / 12, 1) * 30; // 30% de la fatiga
      const intensityFactor = (averageRPE / 10) * 30; // 30% de la fatiga
      
      muscleGroupFatigue[group] = Math.min(Math.round(volumeFactor + frequencyFactor + intensityFactor), 100);
    });
    
    // Calcular fatiga general
    const overallFatigue = Object.values(muscleGroupFatigue).reduce((sum, fatigue) => sum + fatigue, 0) / 
      Math.max(Object.keys(muscleGroupFatigue).length, 1);
    
    // Calcular disminución de rendimiento
    const performanceDecline = calculatePerformanceDecline(sessions);
    
    // Obtener datos de sueño y estrés (si están disponibles)
    const { data: wellnessData, error: wellnessError } = await supabase
      .from('wellness_logs')
      .select('sleep_quality, stress_level, soreness, readiness')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7); // Últimos 7 días
    
    if (wellnessError) {
      console.error('Error al obtener datos de bienestar:', wellnessError);
    }
    
    // Calcular promedios de bienestar
    const sleepQuality = wellnessData 
      ? wellnessData.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / wellnessData.length 
      : 70; // Valor por defecto
    
    const stressLevel = wellnessData 
      ? wellnessData.reduce((sum, log) => sum + (log.stress_level || 0), 0) / wellnessData.length 
      : 50; // Valor por defecto
    
    const soreness = wellnessData 
      ? wellnessData.reduce((sum, log) => sum + (log.soreness || 0), 0) / wellnessData.length 
      : 50; // Valor por defecto
    
    const readiness = wellnessData 
      ? wellnessData.reduce((sum, log) => sum + (log.readiness || 0), 0) / wellnessData.length 
      : 70; // Valor por defecto
    
    // Calcular RPE y RIR promedio
    const rpeAverage = sessions.reduce((sum, session) => sum + (session.rpe || 0), 0) / sessions.length;
    const rirAverage = sessions.reduce((sum, session) => sum + (session.rir || 2), 0) / sessions.length;
    
    // Calcular tolerancia a volumen e intensidad
    const volumeTolerance = 100 - (overallFatigue * 0.5) - (soreness * 0.3) - (stressLevel * 0.2);
    const intensityTolerance = 100 - (overallFatigue * 0.4) - (sleepQuality * 0.3) - (readiness * 0.3);
    
    // Determinar si se recomienda deload
    const recommendedDeload = determineDeloadNecessity(
      overallFatigue,
      performanceDecline,
      weeksSinceLastDeload,
      readiness,
      soreness
    );
    
    // Determinar urgencia del deload
    const deloadUrgency = determineDeloadUrgency(
      overallFatigue,
      performanceDecline,
      weeksSinceLastDeload,
      readiness
    );
    
    // Determinar tipo de deload
    const deloadType = determineDeloadType(
      muscleGroupFatigue,
      performanceDecline,
      rpeAverage,
      volumeTolerance,
      intensityTolerance
    );
    
    // Determinar duración del deload
    const deloadDuration = determineDeloadDuration(
      overallFatigue,
      deloadUrgency,
      deloadType
    );
    
    // Crear notas
    const notes = generateDeloadNotes(
      muscleGroupFatigue,
      performanceDecline,
      weeksSinceLastDeload,
      deloadType
    );
    
    return {
      userId,
      overallFatigue,
      muscleGroupFatigue,
      performanceDecline,
      recoveryQuality: 100 - overallFatigue,
      sleepQuality,
      soreness,
      readiness,
      stressLevel,
      rpeAverage,
      rirAverage,
      volumeTolerance,
      intensityTolerance,
      lastDeloadDate: lastDeloadDate || undefined,
      weeksSinceLastDeload,
      recommendedDeload,
      deloadUrgency,
      deloadType,
      deloadDuration,
      notes
    };
  } catch (error) {
    console.error('Error al calcular métricas de fatiga:', error);
    return null;
  }
}

/**
 * Calcula la disminución de rendimiento basada en sesiones recientes
 * @param sessions Sesiones de entrenamiento
 * @returns Porcentaje de disminución de rendimiento
 */
function calculatePerformanceDecline(sessions: any[]): number {
  // Implementación simplificada - en una versión real, esto sería más complejo
  // y analizaría la progresión de pesos, repeticiones, etc.
  
  if (sessions.length < 4) return 0;
  
  // Agrupar sesiones por semana
  const weeklyPerformance: Record<number, number> = {};
  const now = new Date();
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.date);
    const weeksDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksDiff >= 0 && weeksDiff < 4) {
      if (!weeklyPerformance[weeksDiff]) {
        weeklyPerformance[weeksDiff] = 0;
      }
      
      // Calcular índice de rendimiento para la sesión
      const exercises = session.exercises || [];
      const performanceIndex = exercises.reduce((sum, ex) => {
        const volume = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
        return sum + volume;
      }, 0);
      
      weeklyPerformance[weeksDiff] += performanceIndex;
    }
  });
  
  // Calcular tendencia de rendimiento
  const weeks = Object.keys(weeklyPerformance).map(Number).sort();
  
  if (weeks.length < 2) return 0;
  
  // Comparar rendimiento de la semana más reciente con el promedio de las anteriores
  const currentWeekPerformance = weeklyPerformance[weeks[0]] || 0;
  const previousWeeksAvg = weeks.slice(1).reduce((sum, week) => sum + (weeklyPerformance[week] || 0), 0) / (weeks.length - 1);
  
  if (previousWeeksAvg === 0) return 0;
  
  const performanceChange = (currentWeekPerformance - previousWeeksAvg) / previousWeeksAvg * 100;
  
  // Si es negativo, hay disminución de rendimiento
  return performanceChange < 0 ? Math.abs(performanceChange) : 0;
}

/**
 * Determina si es necesario un deload
 */
function determineDeloadNecessity(
  overallFatigue: number,
  performanceDecline: number,
  weeksSinceLastDeload: number,
  readiness: number,
  soreness: number
): boolean {
  // Criterios para recomendar deload
  const fatigueThreshold = 70; // Fatiga general > 70%
  const performanceThreshold = 5; // Disminución de rendimiento > 5%
  const weekThreshold = 6; // Más de 6 semanas desde el último deload
  const readinessThreshold = 60; // Preparación < 60%
  const sorenessThreshold = 70; // Dolor muscular > 70%
  
  // Sistema de puntos para determinar necesidad de deload
  let points = 0;
  
  if (overallFatigue > fatigueThreshold) points += 2;
  if (performanceDecline > performanceThreshold) points += 3;
  if (weeksSinceLastDeload > weekThreshold) points += 1;
  if (readiness < readinessThreshold) points += 1;
  if (soreness > sorenessThreshold) points += 1;
  
  // Si acumula 4 o más puntos, se recomienda deload
  return points >= 4;
}

/**
 * Determina la urgencia del deload
 */
function determineDeloadUrgency(
  overallFatigue: number,
  performanceDecline: number,
  weeksSinceLastDeload: number,
  readiness: number
): 'low' | 'moderate' | 'high' | 'critical' {
  // Sistema de puntos para determinar urgencia
  let points = 0;
  
  // Fatiga general
  if (overallFatigue > 90) points += 4;
  else if (overallFatigue > 80) points += 3;
  else if (overallFatigue > 70) points += 2;
  else if (overallFatigue > 60) points += 1;
  
  // Disminución de rendimiento
  if (performanceDecline > 15) points += 4;
  else if (performanceDecline > 10) points += 3;
  else if (performanceDecline > 5) points += 2;
  else if (performanceDecline > 2) points += 1;
  
  // Semanas desde último deload
  if (weeksSinceLastDeload > 12) points += 3;
  else if (weeksSinceLastDeload > 8) points += 2;
  else if (weeksSinceLastDeload > 6) points += 1;
  
  // Preparación
  if (readiness < 40) points += 3;
  else if (readiness < 50) points += 2;
  else if (readiness < 60) points += 1;
  
  // Determinar urgencia según puntos
  if (points >= 10) return 'critical';
  if (points >= 7) return 'high';
  if (points >= 4) return 'moderate';
  return 'low';
}

/**
 * Determina el tipo de deload más adecuado
 */
function determineDeloadType(
  muscleGroupFatigue: Record<string, number>,
  performanceDecline: number,
  rpeAverage: number,
  volumeTolerance: number,
  intensityTolerance: number
): 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery' {
  // Si la tolerancia al volumen es baja pero la tolerancia a la intensidad es alta
  if (volumeTolerance < 40 && intensityTolerance > 60) {
    return 'volume';
  }
  
  // Si la tolerancia a la intensidad es baja pero la tolerancia al volumen es alta
  if (intensityTolerance < 40 && volumeTolerance > 60) {
    return 'intensity';
  }
  
  // Si ambas tolerancias son moderadas
  if (volumeTolerance < 60 && intensityTolerance < 60) {
    return 'frequency';
  }
  
  // Si ambas tolerancias son muy bajas o el RPE promedio es muy alto
  if ((volumeTolerance < 30 && intensityTolerance < 30) || rpeAverage > 8.5) {
    return 'complete';
  }
  
  // Si la disminución de rendimiento es alta pero las tolerancias no son tan bajas
  if (performanceDecline > 10 && volumeTolerance > 40 && intensityTolerance > 40) {
    return 'active_recovery';
  }
  
  // Por defecto, deload de volumen
  return 'volume';
}

/**
 * Determina la duración recomendada del deload
 */
function determineDeloadDuration(
  overallFatigue: number,
  deloadUrgency: 'low' | 'moderate' | 'high' | 'critical',
  deloadType: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery'
): number {
  // Duración base según tipo de deload
  const baseDuration: Record<string, number> = {
    'volume': 7,
    'intensity': 7,
    'frequency': 7,
    'complete': 7,
    'active_recovery': 5
  };
  
  // Ajustar según urgencia
  const urgencyMultiplier: Record<string, number> = {
    'low': 1,
    'moderate': 1,
    'high': 1.5,
    'critical': 2
  };
  
  // Ajustar según fatiga general
  let fatigueAdjustment = 0;
  if (overallFatigue > 90) fatigueAdjustment = 3;
  else if (overallFatigue > 80) fatigueAdjustment = 2;
  else if (overallFatigue > 70) fatigueAdjustment = 1;
  
  // Calcular duración final
  return Math.round(baseDuration[deloadType] * urgencyMultiplier[deloadUrgency] + fatigueAdjustment);
}

/**
 * Genera notas explicativas sobre el deload
 */
function generateDeloadNotes(
  muscleGroupFatigue: Record<string, number>,
  performanceDecline: number,
  weeksSinceLastDeload: number,
  deloadType: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery'
): string {
  // Identificar grupos musculares más fatigados
  const sortedMuscleGroups = Object.entries(muscleGroupFatigue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([group, fatigue]) => `${group} (${fatigue}%)`);
  
  // Generar notas
  let notes = `Recomendación de deload basada en:\n`;
  notes += `- Grupos musculares más fatigados: ${sortedMuscleGroups.join(', ')}\n`;
  notes += `- Disminución de rendimiento: ${performanceDecline.toFixed(1)}%\n`;
  notes += `- Semanas desde último deload: ${weeksSinceLastDeload}\n\n`;
  
  // Añadir recomendaciones según tipo de deload
  switch (deloadType) {
    case 'volume':
      notes += `Tipo de deload: Reducción de volumen\n`;
      notes += `- Reducir el volumen total en un 40-50%\n`;
      notes += `- Mantener la intensidad (peso) similar\n`;
      notes += `- Reducir el número de series por ejercicio\n`;
      break;
    case 'intensity':
      notes += `Tipo de deload: Reducción de intensidad\n`;
      notes += `- Reducir la intensidad (peso) en un 20-30%\n`;
      notes += `- Mantener el volumen similar\n`;
      notes += `- Enfocarse en la técnica y la conexión mente-músculo\n`;
      break;
    case 'frequency':
      notes += `Tipo de deload: Reducción de frecuencia\n`;
      notes += `- Reducir el número de sesiones semanales\n`;
      notes += `- Mantener intensidad y volumen por sesión\n`;
      notes += `- Priorizar descanso y recuperación\n`;
      break;
    case 'complete':
      notes += `Tipo de deload: Descanso completo\n`;
      notes += `- Reducir significativamente volumen e intensidad\n`;
      notes += `- Considerar algunos días de descanso completo\n`;
      notes += `- Enfocarse en recuperación, nutrición y sueño\n`;
      break;
    case 'active_recovery':
      notes += `Tipo de deload: Recuperación activa\n`;
      notes += `- Sustituir algunos entrenamientos por actividades de baja intensidad\n`;
      notes += `- Incluir más trabajo de movilidad y flexibilidad\n`;
      notes += `- Mantener el movimiento sin generar fatiga adicional\n`;
      break;
  }
  
  return notes;
}

/**
 * Genera una recomendación de deload detallada
 * @param userId ID del usuario
 * @returns Recomendación de deload
 */
export async function generateDeloadRecommendation(userId: string): Promise<DeloadRecommendation | null> {
  try {
    const fatigueMetrics = await calculateFatigueMetrics(userId);
    
    if (!fatigueMetrics || !fatigueMetrics.recommendedDeload) {
      return null;
    }
    
    // Determinar grupos musculares que necesitan más descanso
    const targetMuscleGroups = Object.entries(fatigueMetrics.muscleGroupFatigue)
      .filter(([, fatigue]) => fatigue > 70)
      .map(([group]) => group);
    
    // Determinar reducciones según tipo de deload
    let volumeReduction = 0;
    let intensityReduction = 0;
    let frequencyReduction = 0;
    
    switch (fatigueMetrics.deloadType) {
      case 'volume':
        volumeReduction = 50;
        intensityReduction = 0;
        frequencyReduction = 0;
        break;
      case 'intensity':
        volumeReduction = 0;
        intensityReduction = 30;
        frequencyReduction = 0;
        break;
      case 'frequency':
        volumeReduction = 0;
        intensityReduction = 0;
        frequencyReduction = 30;
        break;
      case 'complete':
        volumeReduction = 70;
        intensityReduction = 50;
        frequencyReduction = 30;
        break;
      case 'active_recovery':
        volumeReduction = 50;
        intensityReduction = 30;
        frequencyReduction = 0;
        break;
    }
    
    // Generar razonamiento
    const reasoning = [];
    
    if (fatigueMetrics.overallFatigue > 70) {
      reasoning.push(`Nivel de fatiga general elevado (${fatigueMetrics.overallFatigue.toFixed(1)}%)`);
    }
    
    if (fatigueMetrics.performanceDecline > 5) {
      reasoning.push(`Disminución del rendimiento (${fatigueMetrics.performanceDecline.toFixed(1)}%)`);
    }
    
    if (fatigueMetrics.weeksSinceLastDeload > 6) {
      reasoning.push(`${fatigueMetrics.weeksSinceLastDeload} semanas desde el último deload`);
    }
    
    if (fatigueMetrics.readiness < 60) {
      reasoning.push(`Nivel de preparación bajo (${fatigueMetrics.readiness.toFixed(1)}%)`);
    }
    
    if (fatigueMetrics.soreness > 70) {
      reasoning.push(`Nivel de dolor muscular elevado (${fatigueMetrics.soreness.toFixed(1)}%)`);
    }
    
    // Sugerir actividades según tipo de deload
    const suggestedActivities = [];
    
    switch (fatigueMetrics.deloadType) {
      case 'volume':
        suggestedActivities.push('Reducir el número de series por ejercicio');
        suggestedActivities.push('Mantener la intensidad (peso) similar');
        suggestedActivities.push('Eliminar series de aislamiento');
        break;
      case 'intensity':
        suggestedActivities.push('Reducir el peso en todos los ejercicios');
        suggestedActivities.push('Enfocarse en la técnica perfecta');
        suggestedActivities.push('Aumentar el tiempo bajo tensión');
        break;
      case 'frequency':
        suggestedActivities.push('Reducir el número de sesiones semanales');
        suggestedActivities.push('Aumentar los días de descanso entre entrenamientos');
        suggestedActivities.push('Combinar grupos musculares para reducir frecuencia');
        break;
      case 'complete':
        suggestedActivities.push('Tomar 2-3 días de descanso completo');
        suggestedActivities.push('Realizar sesiones muy ligeras los días restantes');
        suggestedActivities.push('Priorizar sueño y nutrición');
        break;
      case 'active_recovery':
        suggestedActivities.push('Sustituir entrenamientos por caminatas, natación o ciclismo ligero');
        suggestedActivities.push('Realizar sesiones de movilidad y flexibilidad');
        suggestedActivities.push('Practicar técnicas de relajación y recuperación');
        break;
    }
    
    // Estimar tiempo de recuperación y mejora de rendimiento
    const expectedRecoveryTime = fatigueMetrics.deloadDuration + Math.round(fatigueMetrics.overallFatigue / 20);
    const expectedPerformanceImprovement = Math.round(5 + (fatigueMetrics.performanceDecline / 2));
    
    return {
      isRecommended: true,
      urgency: fatigueMetrics.deloadUrgency,
      type: fatigueMetrics.deloadType,
      duration: fatigueMetrics.deloadDuration,
      volumeReduction,
      intensityReduction,
      frequencyReduction,
      targetMuscleGroups,
      reasoning,
      suggestedActivities,
      expectedRecoveryTime,
      expectedPerformanceImprovement
    };
  } catch (error) {
    console.error('Error al generar recomendación de deload:', error);
    return null;
  }
}
