/**
 * Servicio para gestionar el análisis de rendimiento avanzado
 * Incluye funciones para analizar el rendimiento, calcular métricas y gestionar volumen
 */

import { supabase } from '@/lib/supabase-client';
import { 
  PerformanceAnalysis,
  PerformanceMetric,
  MuscleGroupVolumeConfig
} from '@/lib/types/advanced-training';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obtiene los análisis de rendimiento de un usuario
 * @param userId - ID del usuario
 * @param limit - Número máximo de análisis a obtener
 * @returns Lista de análisis de rendimiento o null si hay error
 */
export async function getUserPerformanceAnalyses(userId: string, limit: number = 10): Promise<PerformanceAnalysis[] | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_performance_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error al obtener análisis de rendimiento:', error);
      return null;
    }

    return data as PerformanceAnalysis[];
  } catch (error) {
    console.error('Error en getUserPerformanceAnalyses:', error);
    return null;
  }
}

/**
 * Obtiene un análisis de rendimiento por su ID
 * @param analysisId - ID del análisis
 * @returns Análisis de rendimiento o null si no existe
 */
export async function getPerformanceAnalysisById(analysisId: string): Promise<PerformanceAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_performance_analysis')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) {
      console.error('Error al obtener análisis de rendimiento:', error);
      return null;
    }

    return data as PerformanceAnalysis;
  } catch (error) {
    console.error('Error en getPerformanceAnalysisById:', error);
    return null;
  }
}

/**
 * Crea un nuevo análisis de rendimiento
 * @param analysis - Datos del análisis
 * @returns Análisis creado o null si hay error
 */
export async function createPerformanceAnalysis(analysis: Omit<PerformanceAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceAnalysis | null> {
  try {
    const newAnalysis = {
      ...analysis,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('advanced_performance_analysis')
      .insert(newAnalysis)
      .select()
      .single();

    if (error) {
      console.error('Error al crear análisis de rendimiento:', error);
      return null;
    }

    return data as PerformanceAnalysis;
  } catch (error) {
    console.error('Error en createPerformanceAnalysis:', error);
    return null;
  }
}

/**
 * Actualiza un análisis de rendimiento existente
 * @param analysisId - ID del análisis
 * @param updates - Datos a actualizar
 * @returns Análisis actualizado o null si hay error
 */
export async function updatePerformanceAnalysis(analysisId: string, updates: Partial<PerformanceAnalysis>): Promise<PerformanceAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('advanced_performance_analysis')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar análisis de rendimiento:', error);
      return null;
    }

    return data as PerformanceAnalysis;
  } catch (error) {
    console.error('Error en updatePerformanceAnalysis:', error);
    return null;
  }
}

/**
 * Calcula el 1RM estimado basado en peso y repeticiones
 * @param weight - Peso levantado (kg)
 * @param reps - Repeticiones realizadas
 * @param formula - Fórmula a utilizar (brzycki, epley, lander, lombardi, mayhew, oconner, wathan)
 * @returns 1RM estimado
 */
export function calculate1RM(weight: number, reps: number, formula: string = 'brzycki'): number {
  if (reps <= 0 || weight <= 0) {
    return 0;
  }

  // Si es 1 repetición, el 1RM es el peso levantado
  if (reps === 1) {
    return weight;
  }

  switch (formula.toLowerCase()) {
    case 'brzycki':
      return weight * (36 / (37 - reps));
    case 'epley':
      return weight * (1 + 0.0333 * reps);
    case 'lander':
      return (100 * weight) / (101.3 - 2.67123 * reps);
    case 'lombardi':
      return weight * Math.pow(reps, 0.1);
    case 'mayhew':
      return (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));
    case 'oconner':
      return weight * (1 + 0.025 * reps);
    case 'wathan':
      return (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps));
    default:
      return weight * (36 / (37 - reps)); // Brzycki por defecto
  }
}

/**
 * Calcula el volumen de entrenamiento (series x repeticiones x peso)
 * @param sets - Número de series
 * @param reps - Número de repeticiones por serie
 * @param weight - Peso utilizado (kg)
 * @returns Volumen de entrenamiento
 */
export function calculateVolumeLoad(sets: number, reps: number, weight: number): number {
  return sets * reps * weight;
}

/**
 * Calcula la fatiga acumulada basada en volumen, intensidad y frecuencia
 * @param volumeLoad - Carga de volumen total
 * @param intensity - Intensidad media (1-10)
 * @param frequency - Frecuencia semanal
 * @param recoveryCapacity - Capacidad de recuperación del usuario (1-10)
 * @returns Nivel de fatiga estimado (1-10)
 */
export function calculateFatigue(
  volumeLoad: number,
  intensity: number,
  frequency: number,
  recoveryCapacity: number = 5
): number {
  // Normalizar los valores
  const normalizedVolume = Math.min(volumeLoad / 10000, 10);
  const normalizedIntensity = Math.min(intensity, 10);
  const normalizedFrequency = Math.min(frequency / 7, 1) * 10;
  const normalizedRecovery = Math.min(recoveryCapacity, 10);

  // Calcular fatiga (fórmula simplificada)
  const rawFatigue = (normalizedVolume * 0.4) + 
                    (normalizedIntensity * 0.4) + 
                    (normalizedFrequency * 0.2);
  
  // Ajustar por capacidad de recuperación
  const adjustedFatigue = rawFatigue * (10 / normalizedRecovery);
  
  // Limitar a escala 1-10
  return Math.min(Math.max(Math.round(adjustedFatigue * 10) / 10, 1), 10);
}

/**
 * Calcula los puntos de referencia de volumen para un grupo muscular
 * @param muscleGroup - Grupo muscular
 * @param trainingAge - Años de entrenamiento
 * @param recoveryCapacity - Capacidad de recuperación (1-10)
 * @returns Configuración de volumen para el grupo muscular
 */
export function calculateVolumeLandmarks(
  muscleGroup: string,
  trainingAge: number,
  recoveryCapacity: number
): MuscleGroupVolumeConfig {
  // Valores base por grupo muscular (series semanales)
  const baseValues: Record<string, { mev: number, mav: number, mrv: number, frequency: number, recovery: number }> = {
    chest: { mev: 8, mav: 12, mrv: 20, frequency: 2, recovery: 48 },
    back: { mev: 10, mav: 16, mrv: 25, frequency: 2, recovery: 72 },
    shoulders: { mev: 8, mav: 14, mrv: 22, frequency: 2, recovery: 48 },
    quads: { mev: 8, mav: 12, mrv: 20, frequency: 2, recovery: 72 },
    hamstrings: { mev: 6, mav: 10, mrv: 16, frequency: 2, recovery: 72 },
    glutes: { mev: 4, mav: 8, mrv: 16, frequency: 2, recovery: 48 },
    biceps: { mev: 6, mav: 10, mrv: 16, frequency: 2, recovery: 48 },
    triceps: { mev: 6, mav: 10, mrv: 16, frequency: 2, recovery: 48 },
    calves: { mev: 6, mav: 12, mrv: 20, frequency: 3, recovery: 24 },
    abs: { mev: 4, mav: 8, mrv: 16, frequency: 3, recovery: 24 },
    // Valores por defecto para otros grupos musculares
    default: { mev: 6, mav: 10, mrv: 16, frequency: 2, recovery: 48 }
  };

  // Obtener valores base para el grupo muscular o usar valores por defecto
  const baseConfig = baseValues[muscleGroup] || baseValues.default;
  
  // Ajustar por años de entrenamiento (más años = más volumen necesario)
  const trainingAgeMultiplier = Math.min(1 + (trainingAge * 0.05), 1.5);
  
  // Ajustar por capacidad de recuperación (mejor recuperación = más volumen tolerable)
  const recoveryMultiplier = 0.7 + (recoveryCapacity * 0.06);
  
  // Calcular valores ajustados
  const mev = Math.round(baseConfig.mev * trainingAgeMultiplier);
  const mav = Math.round(baseConfig.mav * trainingAgeMultiplier * recoveryMultiplier);
  const mrv = Math.round(baseConfig.mrv * trainingAgeMultiplier * recoveryMultiplier);
  
  // Calcular frecuencia óptima
  const minFrequency = Math.max(1, Math.floor(baseConfig.frequency * 0.8));
  const optFrequency = baseConfig.frequency;
  const maxFrequency = Math.ceil(baseConfig.frequency * recoveryMultiplier);
  
  return {
    muscle_group: muscleGroup,
    weekly_sets: {
      minimum: mev,
      optimal: mav,
      maximum: mrv
    },
    frequency: {
      minimum: minFrequency,
      optimal: optFrequency,
      maximum: maxFrequency
    },
    recovery_time: baseConfig.recovery,
    priority_level: 3, // Valor por defecto
    notes: `Valores calculados para ${muscleGroup} basados en ${trainingAge} años de entrenamiento y capacidad de recuperación ${recoveryCapacity}/10.`
  };
}
