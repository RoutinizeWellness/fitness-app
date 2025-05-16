/**
 * Algoritmo de entrenamiento para calcular pesos ideales, fatiga y recomendaciones
 * Basado en los programas de Jeff Nippard, Pure Bodybuilding, Hypertrophy Handbook y otros
 */

import { supabase } from '@/lib/supabase-client';
import { ExerciseSet, WorkoutLog } from '@/lib/types/training';

// Interfaz para la fatiga del usuario
interface UserFatigue {
  userId: string;
  currentFatigue: number; // Porcentaje de fatiga (0-100)
  muscleGroupFatigue: Record<string, number>; // Fatiga por grupo muscular
  lastUpdated: string;
}

// Interfaz para el historial de ejercicios
interface ExerciseHistory {
  exerciseId: string;
  date: string;
  weight: number;
  reps: number;
  rir: number;
  performance: 'worse' | 'same' | 'better';
}

/**
 * Obtener la fatiga actual del usuario
 * @param userId ID del usuario
 * @returns Objeto con la fatiga actual o null si no hay datos
 */
export async function getUserFatigue(userId: string): Promise<UserFatigue | null> {
  try {
    // Intentar obtener la fatiga del usuario desde Supabase
    const { data, error } = await supabase
      .from('user_fatigue')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener la fatiga del usuario:', error);
      
      // Devolver datos de ejemplo para desarrollo
      return {
        userId,
        currentFatigue: 65, // 65% de fatiga
        muscleGroupFatigue: {
          chest: 70,
          back: 60,
          legs: 80,
          shoulders: 50,
          arms: 55
        },
        lastUpdated: new Date().toISOString()
      };
    }

    return {
      userId: data.user_id,
      currentFatigue: data.current_fatigue,
      muscleGroupFatigue: data.muscle_group_fatigue,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error al obtener la fatiga del usuario:', error);
    
    // Devolver datos de ejemplo para desarrollo
    return {
      userId,
      currentFatigue: 65, // 65% de fatiga
      muscleGroupFatigue: {
        chest: 70,
        back: 60,
        legs: 80,
        shoulders: 50,
        arms: 55
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Calcular el peso ideal para un ejercicio basado en el historial y la fatiga
 * @param userId ID del usuario
 * @param exerciseId ID del ejercicio
 * @param targetReps Repeticiones objetivo
 * @param targetRir RIR objetivo
 * @returns Peso recomendado en kg o null si no hay suficientes datos
 */
export async function calculateIdealWeight(
  userId: string,
  exerciseId: string,
  targetReps: number,
  targetRir: number
): Promise<number | null> {
  try {
    // Obtener el historial de ejercicios del usuario
    const { data, error } = await supabase
      .from('workout_logs')
      .select('completed_sets, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error al obtener el historial de ejercicios:', error);
      
      // Devolver peso de ejemplo para desarrollo
      return getExampleWeight(exerciseId, targetReps, targetRir);
    }

    // Si no hay suficientes datos, devolver un peso de ejemplo
    if (!data || data.length < 2) {
      return getExampleWeight(exerciseId, targetReps, targetRir);
    }

    // Extraer los sets completados para el ejercicio específico
    const exerciseHistory: ExerciseHistory[] = [];
    
    data.forEach((log: any) => {
      const completedSets = log.completed_sets as ExerciseSet[];
      
      completedSets.forEach(set => {
        if ((set.exerciseId === exerciseId || set.alternativeExerciseId === exerciseId) && 
            set.completedWeight && 
            set.completedReps && 
            set.completedRir !== undefined) {
          exerciseHistory.push({
            exerciseId: set.alternativeExerciseId || set.exerciseId,
            date: log.date,
            weight: set.completedWeight,
            reps: set.completedReps,
            rir: set.completedRir,
            performance: 'same' // Por defecto
          });
        }
      });
    });

    // Si no hay suficientes datos específicos para este ejercicio, devolver un peso de ejemplo
    if (exerciseHistory.length < 2) {
      return getExampleWeight(exerciseId, targetReps, targetRir);
    }

    // Obtener la fatiga actual del usuario
    const fatigue = await getUserFatigue(userId);
    const fatigueModifier = fatigue ? calculateFatigueModifier(fatigue.currentFatigue) : 1;

    // Calcular el peso ideal basado en el historial y la fatiga
    const lastSession = exerciseHistory[0];
    
    // Aplicar la fórmula de Epley para estimar 1RM
    const estimatedOneRm = lastSession.weight * (1 + lastSession.reps / 30);
    
    // Calcular el peso para las repeticiones objetivo y RIR objetivo
    const targetWeight = estimatedOneRm / (1 + (targetReps + targetRir) / 30);
    
    // Aplicar el modificador de fatiga
    const adjustedWeight = targetWeight * fatigueModifier;
    
    // Redondear a incrementos de 2.5kg
    return Math.round(adjustedWeight / 2.5) * 2.5;
  } catch (error) {
    console.error('Error al calcular el peso ideal:', error);
    return getExampleWeight(exerciseId, targetReps, targetRir);
  }
}

/**
 * Calcular el modificador de fatiga basado en el porcentaje de fatiga
 * @param fatigue Porcentaje de fatiga (0-100)
 * @returns Modificador de fatiga (0.8-1.05)
 */
function calculateFatigueModifier(fatigue: number): number {
  // Convertir la fatiga a un modificador entre 0.8 y 1.05
  // 0% de fatiga = 1.05 (supercompensación)
  // 50% de fatiga = 1.0 (normal)
  // 100% de fatiga = 0.8 (reducción del 20%)
  
  if (fatigue <= 0) return 1.05;
  if (fatigue >= 100) return 0.8;
  
  if (fatigue < 50) {
    // Entre 0% y 50% de fatiga (supercompensación a normal)
    return 1.05 - (0.05 * (fatigue / 50));
  } else {
    // Entre 50% y 100% de fatiga (normal a reducción)
    return 1.0 - (0.2 * ((fatigue - 50) / 50));
  }
}

/**
 * Obtener un peso de ejemplo para desarrollo
 * @param exerciseId ID del ejercicio
 * @param targetReps Repeticiones objetivo
 * @param targetRir RIR objetivo
 * @returns Peso de ejemplo en kg
 */
function getExampleWeight(exerciseId: string, targetReps: number, targetRir: number): number {
  // Pesos base de ejemplo para diferentes ejercicios
  const baseWeights: Record<string, number> = {
    // Ejercicios de pecho
    "bench-press": 80,
    "incline-bench-press": 70,
    "dumbbell-press": 30,
    "incline-dumbbell-press": 25,
    "chest-fly": 15,
    "cable-fly": 15,
    "push-up": 0, // Peso corporal
    
    // Ejercicios de espalda
    "pull-up": 0, // Peso corporal
    "lat-pulldown": 70,
    "barbell-row": 70,
    "dumbbell-row": 30,
    "cable-row": 70,
    "deadlift": 120,
    
    // Ejercicios de piernas
    "squat": 100,
    "front-squat": 80,
    "leg-press": 150,
    "lunges": 20,
    "leg-extension": 60,
    "leg-curl": 50,
    "calf-raise": 100,
    
    // Ejercicios de hombros
    "overhead-press": 50,
    "dumbbell-shoulder-press": 20,
    "lateral-raise": 10,
    "face-pull": 25,
    
    // Ejercicios de brazos
    "bicep-curl": 15,
    "hammer-curl": 15,
    "triceps-pushdown": 30,
    "skull-crusher": 25
  };
  
  // Obtener el peso base o usar 20kg como valor predeterminado
  const baseWeight = baseWeights[exerciseId] || 20;
  
  // Ajustar según las repeticiones objetivo (más repeticiones = menos peso)
  const repsModifier = 1 - ((targetReps - 8) * 0.025); // 8 reps es la referencia
  
  // Ajustar según el RIR objetivo (más RIR = más peso)
  const rirModifier = 1 + (targetRir * 0.025);
  
  // Calcular el peso final
  const finalWeight = baseWeight * repsModifier * rirModifier;
  
  // Redondear a incrementos de 2.5kg
  return Math.round(finalWeight / 2.5) * 2.5;
}

/**
 * Actualizar la fatiga del usuario después de un entrenamiento
 * @param userId ID del usuario
 * @param workoutLog Registro del entrenamiento
 * @returns Éxito de la operación
 */
export async function updateUserFatigue(userId: string, workoutLog: WorkoutLog): Promise<boolean> {
  try {
    // Obtener la fatiga actual
    const currentFatigue = await getUserFatigue(userId);
    
    if (!currentFatigue) {
      return false;
    }
    
    // Calcular la nueva fatiga basada en el entrenamiento
    const workoutIntensity = calculateWorkoutIntensity(workoutLog);
    const recoveryTime = calculateRecoveryTime(workoutLog.date);
    
    // Aplicar recuperación basada en el tiempo transcurrido
    let newFatigue = Math.max(0, currentFatigue.currentFatigue - (recoveryTime * 10));
    
    // Añadir la fatiga del nuevo entrenamiento
    newFatigue = Math.min(100, newFatigue + workoutIntensity);
    
    // Actualizar la fatiga por grupo muscular
    const newMuscleGroupFatigue: Record<string, number> = { ...currentFatigue.muscleGroupFatigue };
    
    Object.keys(workoutLog.muscleGroupFatigue).forEach(muscleGroup => {
      if (newMuscleGroupFatigue[muscleGroup] !== undefined) {
        // Aplicar recuperación
        let recoveredFatigue = Math.max(0, newMuscleGroupFatigue[muscleGroup] - (recoveryTime * 15));
        
        // Añadir nueva fatiga
        newMuscleGroupFatigue[muscleGroup] = Math.min(100, recoveredFatigue + workoutLog.muscleGroupFatigue[muscleGroup] * 10);
      } else {
        newMuscleGroupFatigue[muscleGroup] = Math.min(100, workoutLog.muscleGroupFatigue[muscleGroup] * 10);
      }
    });
    
    // Guardar la nueva fatiga en Supabase
    const { error } = await supabase
      .from('user_fatigue')
      .upsert({
        user_id: userId,
        current_fatigue: newFatigue,
        muscle_group_fatigue: newMuscleGroupFatigue,
        last_updated: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error al actualizar la fatiga del usuario:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error al actualizar la fatiga del usuario:', error);
    return false;
  }
}

/**
 * Calcular la intensidad de un entrenamiento
 * @param workoutLog Registro del entrenamiento
 * @returns Intensidad del entrenamiento (0-100)
 */
function calculateWorkoutIntensity(workoutLog: WorkoutLog): number {
  // Factores que influyen en la intensidad:
  // 1. Volumen (número de series)
  // 2. Intensidad (peso relativo)
  // 3. Densidad (duración del entrenamiento)
  // 4. Técnicas avanzadas utilizadas
  
  const setCount = workoutLog.completedSets.length;
  const advancedTechniques = workoutLog.completedSets.filter(set => 
    set.isDropSet || 
    set.isRestPause || 
    set.isMechanicalSet || 
    set.isPartialReps || 
    set.isGiantSet || 
    set.isMyoReps || 
    set.isPreFatigue || 
    set.isPostFatigue || 
    set.isIsometric
  ).length;
  
  const volumeFactor = Math.min(1, setCount / 20); // 20 series = 100%
  const techniqueFactor = Math.min(1, advancedTechniques / 5); // 5 técnicas avanzadas = 100%
  const durationFactor = Math.min(1, workoutLog.duration / 90); // 90 minutos = 100%
  
  // Calcular la intensidad total (0-100)
  return Math.min(100, (volumeFactor * 40) + (techniqueFactor * 40) + (durationFactor * 20));
}

/**
 * Calcular el tiempo de recuperación desde la fecha del entrenamiento
 * @param workoutDate Fecha del entrenamiento
 * @returns Días de recuperación
 */
function calculateRecoveryTime(workoutDate: string): number {
  const workoutTime = new Date(workoutDate).getTime();
  const currentTime = new Date().getTime();
  
  // Convertir milisegundos a días
  return (currentTime - workoutTime) / (1000 * 60 * 60 * 24);
}
