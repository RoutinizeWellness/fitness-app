import { supabase } from './supabase-client';
import { DeloadRecommendation, generateDeloadRecommendation } from './deload-algorithm';
import { TrainingProgram, MesoCycle, MicroCycle, WorkoutDay } from './types/training-program';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interfaz para el historial de deload
 */
export interface DeloadHistory {
  id: string;
  userId: string;
  date: string;
  duration: number;
  type: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery';
  reason: string;
  fatigueLevel: number;
  performanceDecline: number;
  targetMuscleGroups: string[];
  notes?: string;
  createdAt: string;
}

/**
 * Interfaz para la configuración de deload
 */
export interface DeloadConfig {
  userId: string;
  autoDeload: boolean;
  deloadFrequency: number; // Cada cuántas semanas
  preferredDeloadType: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery';
  preferredDeloadDuration: number; // En días
  volumeReductionPercentage: number;
  intensityReductionPercentage: number;
  frequencyReductionPercentage: number;
  notifyBeforeDeload: boolean;
  notificationDays: number; // Días antes del deload para notificar
  lastUpdated: string;
}

/**
 * Obtiene la configuración de deload de un usuario
 * @param userId ID del usuario
 * @returns Configuración de deload
 */
export async function getDeloadConfig(userId: string): Promise<DeloadConfig | null> {
  try {
    const { data, error } = await supabase
      .from('deload_config')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No existe configuración, crear una por defecto
        return createDefaultDeloadConfig(userId);
      }
      
      console.error('Error al obtener configuración de deload:', error);
      return null;
    }
    
    return {
      userId: data.user_id,
      autoDeload: data.auto_deload,
      deloadFrequency: data.deload_frequency,
      preferredDeloadType: data.preferred_deload_type,
      preferredDeloadDuration: data.preferred_deload_duration,
      volumeReductionPercentage: data.volume_reduction_percentage,
      intensityReductionPercentage: data.intensity_reduction_percentage,
      frequencyReductionPercentage: data.frequency_reduction_percentage,
      notifyBeforeDeload: data.notify_before_deload,
      notificationDays: data.notification_days,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error en getDeloadConfig:', error);
    return null;
  }
}

/**
 * Crea una configuración de deload por defecto
 * @param userId ID del usuario
 * @returns Configuración de deload por defecto
 */
async function createDefaultDeloadConfig(userId: string): Promise<DeloadConfig | null> {
  try {
    const defaultConfig: DeloadConfig = {
      userId,
      autoDeload: true,
      deloadFrequency: 6, // Cada 6 semanas
      preferredDeloadType: 'volume',
      preferredDeloadDuration: 7, // 7 días
      volumeReductionPercentage: 50,
      intensityReductionPercentage: 20,
      frequencyReductionPercentage: 30,
      notifyBeforeDeload: true,
      notificationDays: 3, // 3 días antes
      lastUpdated: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('deload_config')
      .insert([{
        user_id: userId,
        auto_deload: defaultConfig.autoDeload,
        deload_frequency: defaultConfig.deloadFrequency,
        preferred_deload_type: defaultConfig.preferredDeloadType,
        preferred_deload_duration: defaultConfig.preferredDeloadDuration,
        volume_reduction_percentage: defaultConfig.volumeReductionPercentage,
        intensity_reduction_percentage: defaultConfig.intensityReductionPercentage,
        frequency_reduction_percentage: defaultConfig.frequencyReductionPercentage,
        notify_before_deload: defaultConfig.notifyBeforeDeload,
        notification_days: defaultConfig.notificationDays,
        last_updated: defaultConfig.lastUpdated
      }]);
    
    if (error) {
      console.error('Error al crear configuración de deload por defecto:', error);
      return null;
    }
    
    return defaultConfig;
  } catch (error) {
    console.error('Error en createDefaultDeloadConfig:', error);
    return null;
  }
}

/**
 * Actualiza la configuración de deload de un usuario
 * @param userId ID del usuario
 * @param config Nueva configuración
 * @returns Éxito de la operación
 */
export async function updateDeloadConfig(userId: string, config: Partial<DeloadConfig>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('deload_config')
      .update({
        auto_deload: config.autoDeload,
        deload_frequency: config.deloadFrequency,
        preferred_deload_type: config.preferredDeloadType,
        preferred_deload_duration: config.preferredDeloadDuration,
        volume_reduction_percentage: config.volumeReductionPercentage,
        intensity_reduction_percentage: config.intensityReductionPercentage,
        frequency_reduction_percentage: config.frequencyReductionPercentage,
        notify_before_deload: config.notifyBeforeDeload,
        notification_days: config.notificationDays,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al actualizar configuración de deload:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en updateDeloadConfig:', error);
    return false;
  }
}

/**
 * Obtiene el historial de deload de un usuario
 * @param userId ID del usuario
 * @returns Historial de deload
 */
export async function getDeloadHistory(userId: string): Promise<DeloadHistory[]> {
  try {
    const { data, error } = await supabase
      .from('deload_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error al obtener historial de deload:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      date: item.date,
      duration: item.duration,
      type: item.type,
      reason: item.reason,
      fatigueLevel: item.fatigue_level,
      performanceDecline: item.performance_decline,
      targetMuscleGroups: item.target_muscle_groups,
      notes: item.notes,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error en getDeloadHistory:', error);
    return [];
  }
}

/**
 * Registra un deload en el historial
 * @param userId ID del usuario
 * @param deload Datos del deload
 * @returns Éxito de la operación
 */
export async function recordDeload(
  userId: string,
  deload: {
    date: string;
    duration: number;
    type: 'volume' | 'intensity' | 'frequency' | 'complete' | 'active_recovery';
    reason: string;
    fatigueLevel: number;
    performanceDecline: number;
    targetMuscleGroups: string[];
    notes?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('deload_history')
      .insert([{
        id: uuidv4(),
        user_id: userId,
        date: deload.date,
        duration: deload.duration,
        type: deload.type,
        reason: deload.reason,
        fatigue_level: deload.fatigueLevel,
        performance_decline: deload.performanceDecline,
        target_muscle_groups: deload.targetMuscleGroups,
        notes: deload.notes,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error al registrar deload:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en recordDeload:', error);
    return false;
  }
}

/**
 * Genera un microciclo de deload basado en una recomendación
 * @param userId ID del usuario
 * @param recommendation Recomendación de deload
 * @param originalMicroCycle Microciclo original a modificar
 * @returns Microciclo de deload
 */
export function generateDeloadMicroCycle(
  userId: string,
  recommendation: DeloadRecommendation,
  originalMicroCycle: MicroCycle
): MicroCycle {
  // Crear copia del microciclo original
  const deloadMicroCycle: MicroCycle = {
    ...originalMicroCycle,
    id: uuidv4(),
    name: `Deload - ${originalMicroCycle.name}`,
    description: `Microciclo de deload generado automáticamente. Tipo: ${recommendation.type}`,
    isDeload: true,
    deloadType: recommendation.type,
    intensity: 'low',
    volume: 'low',
    days: []
  };
  
  // Modificar días según tipo de deload
  deloadMicroCycle.days = originalMicroCycle.days.map(day => {
    // Crear copia del día
    const deloadDay: WorkoutDay = {
      ...day,
      id: uuidv4(),
      name: `Deload - ${day.name}`,
      description: `Día de deload generado automáticamente.`,
      exercises: []
    };
    
    // Modificar ejercicios según tipo de deload
    if (day.exercises) {
      deloadDay.exercises = day.exercises.map(exercise => {
        const deloadExercise = { ...exercise };
        
        // Aplicar reducciones según tipo de deload
        switch (recommendation.type) {
          case 'volume':
            // Reducir series y mantener intensidad
            deloadExercise.sets = Math.max(1, Math.floor(exercise.sets * (1 - recommendation.volumeReduction / 100)));
            break;
          case 'intensity':
            // Reducir peso y mantener volumen
            deloadExercise.weight = Math.floor(exercise.weight * (1 - recommendation.intensityReduction / 100));
            // Aumentar repeticiones para compensar
            deloadExercise.reps = Math.min(15, exercise.reps + 2);
            break;
          case 'frequency':
            // Mantener ejercicios compuestos y eliminar algunos de aislamiento
            if (exercise.is_compound) {
              // Mantener ejercicios compuestos con ligera reducción
              deloadExercise.sets = Math.max(1, exercise.sets - 1);
              deloadExercise.weight = Math.floor(exercise.weight * 0.9);
            } else {
              // Reducir significativamente ejercicios de aislamiento
              deloadExercise.sets = Math.max(1, Math.floor(exercise.sets * 0.5));
            }
            break;
          case 'complete':
            // Reducción drástica de volumen e intensidad
            deloadExercise.sets = Math.max(1, Math.floor(exercise.sets * 0.3));
            deloadExercise.weight = Math.floor(exercise.weight * 0.7);
            deloadExercise.reps = Math.min(15, exercise.reps + 3);
            break;
          case 'active_recovery':
            // Sustituir por ejercicios de recuperación activa
            deloadExercise.sets = 2;
            deloadExercise.weight = Math.floor(exercise.weight * 0.6);
            deloadExercise.reps = 12;
            deloadExercise.tempo = '2-1-2-0'; // Tempo controlado
            deloadExercise.rir = 4; // RIR alto
            break;
        }
        
        return deloadExercise;
      });
      
      // Si es deload de frecuencia, eliminar algunos días
      if (recommendation.type === 'frequency' && recommendation.frequencyReduction > 0) {
        // Determinar si este día debe ser de descanso
        const shouldRest = recommendation.targetMuscleGroups.some(group => 
          day.targetMuscleGroups && day.targetMuscleGroups.includes(group)
        );
        
        if (shouldRest) {
          deloadDay.restDay = true;
          deloadDay.exercises = [];
          deloadDay.name = `Descanso (Deload)`;
          deloadDay.description = `Día de descanso como parte del deload de frecuencia.`;
        }
      }
    }
    
    return deloadDay;
  });
  
  // Si es deload de frecuencia, ajustar duración
  if (recommendation.type === 'frequency') {
    deloadMicroCycle.duration = Math.max(7, Math.ceil(originalMicroCycle.duration * (1 - recommendation.frequencyReduction / 100)));
  }
  
  return deloadMicroCycle;
}

/**
 * Aplica un deload a un programa de entrenamiento
 * @param userId ID del usuario
 * @param programId ID del programa
 * @param recommendation Recomendación de deload
 * @returns Éxito de la operación
 */
export async function applyDeloadToProgram(
  userId: string,
  programId: string,
  recommendation: DeloadRecommendation
): Promise<boolean> {
  try {
    // Obtener programa actual
    const { data: programData, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('user_id', userId)
      .single();
    
    if (programError) {
      console.error('Error al obtener programa de entrenamiento:', programError);
      return false;
    }
    
    const program: TrainingProgram = programData.program_data;
    
    // Determinar dónde aplicar el deload según la estructura del programa
    if (program.structure === 'mesocycle' && program.mesoCycles && program.mesoCycles.length > 0) {
      // Obtener el mesociclo activo
      const activeMesoCycle = program.mesoCycles[program.mesoCycles.length - 1];
      
      // Obtener el último microciclo
      const lastMicroCycle = activeMesoCycle.microCycles[activeMesoCycle.microCycles.length - 1];
      
      // Generar microciclo de deload
      const deloadMicroCycle = generateDeloadMicroCycle(userId, recommendation, lastMicroCycle);
      
      // Añadir microciclo de deload al mesociclo
      activeMesoCycle.microCycles.push(deloadMicroCycle);
      activeMesoCycle.includesDeload = true;
      activeMesoCycle.deloadStrategy = recommendation.type;
      
      // Actualizar duración del mesociclo
      activeMesoCycle.duration += Math.ceil(deloadMicroCycle.duration / 7);
      
      // Actualizar programa
      const { error: updateError } = await supabase
        .from('training_programs')
        .update({
          program_data: program,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);
      
      if (updateError) {
        console.error('Error al actualizar programa con deload:', updateError);
        return false;
      }
      
      // Registrar deload en historial
      await recordDeload(userId, {
        date: new Date().toISOString(),
        duration: recommendation.duration,
        type: recommendation.type,
        reason: recommendation.reasoning.join(', '),
        fatigueLevel: 0, // Obtener de las métricas de fatiga
        performanceDecline: recommendation.expectedPerformanceImprovement,
        targetMuscleGroups: recommendation.targetMuscleGroups,
        notes: `Deload aplicado al programa ${program.name}`
      });
      
      return true;
    } else if (program.structure === 'macrocycle' && program.macroCycle) {
      // Implementación para macrociclos
      // Similar a la de mesociclos pero con más niveles de anidación
      return false; // No implementado aún
    } else if (program.structure === 'simple' && program.routines) {
      // Implementación para programas simples
      // Crear una rutina de deload basada en las existentes
      return false; // No implementado aún
    }
    
    return false;
  } catch (error) {
    console.error('Error en applyDeloadToProgram:', error);
    return false;
  }
}

/**
 * Verifica si un usuario necesita un deload
 * @param userId ID del usuario
 * @returns Recomendación de deload si es necesario
 */
export async function checkDeloadNeeded(userId: string): Promise<DeloadRecommendation | null> {
  try {
    // Obtener recomendación de deload
    const recommendation = await generateDeloadRecommendation(userId);
    
    // Si no hay recomendación o no se recomienda deload, retornar null
    if (!recommendation || !recommendation.isRecommended) {
      return null;
    }
    
    return recommendation;
  } catch (error) {
    console.error('Error en checkDeloadNeeded:', error);
    return null;
  }
}
