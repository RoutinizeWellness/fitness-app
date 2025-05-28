/**
 * Adaptive Routine Engine - Sistema avanzado de rutinas adaptativas
 * 
 * Este motor proporciona personalización inteligente de rutinas basada en:
 * - Nivel de experiencia del usuario
 * - Preferencias y limitaciones
 * - Rendimiento histórico
 * - Fatiga y recuperación
 * - Equipamiento disponible
 */

import { supabase } from './supabase-client'
import { WorkoutRoutine, WorkoutDay, ExerciseSet, Exercise } from './types/training'
import { getUserFatigue, updateLearningProfile } from './adaptive-learning-service'
import { calculateIdealWeight } from './weight-calculation-algorithm'

export interface UserAdaptiveProfile {
  userId: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  fitnessGoals: string[]
  availableEquipment: string[]
  timeConstraints: {
    sessionsPerWeek: number
    minutesPerSession: number
    preferredDays: string[]
  }
  physicalLimitations: string[]
  preferredExerciseTypes: string[]
  avoidedExercises: string[]
  progressionPreferences: {
    weightIncrement: number
    volumeProgression: 'conservative' | 'moderate' | 'aggressive'
    intensityProgression: 'conservative' | 'moderate' | 'aggressive'
  }
  recoveryCapacity: number // 1-10 scale
  motivationLevel: number // 1-10 scale
  lastUpdated: string
}

export interface AdaptiveRoutineConfig {
  userId: string
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'general_fitness'
  duration: number // weeks
  autoAdjust: boolean
  considerFatigue: boolean
  considerPerformance: boolean
  allowEquipmentSubstitutions: boolean
  difficultyScaling: 'auto' | 'manual'
}

export interface RoutineAdaptation {
  type: 'volume' | 'intensity' | 'exercise_substitution' | 'rest_adjustment' | 'frequency_change'
  reason: string
  originalValue: any
  adaptedValue: any
  confidence: number
  explanation: string
}

export interface SmartRecommendation {
  id: string
  type: 'routine_suggestion' | 'exercise_alternative' | 'progression_adjustment' | 'recovery_recommendation'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable: boolean
  data: any
  confidence: number
  createdAt: string
}

/**
 * Obtiene el perfil adaptativo del usuario
 */
export async function getUserAdaptiveProfile(userId: string): Promise<UserAdaptiveProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_adaptive_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching adaptive profile:', error)
      return null
    }

    if (!data) {
      // Crear perfil por defecto
      return await createDefaultAdaptiveProfile(userId)
    }

    return {
      userId: data.user_id,
      experienceLevel: data.experience_level,
      fitnessGoals: data.fitness_goals || [],
      availableEquipment: data.available_equipment || [],
      timeConstraints: data.time_constraints || {
        sessionsPerWeek: 3,
        minutesPerSession: 60,
        preferredDays: ['monday', 'wednesday', 'friday']
      },
      physicalLimitations: data.physical_limitations || [],
      preferredExerciseTypes: data.preferred_exercise_types || [],
      avoidedExercises: data.avoided_exercises || [],
      progressionPreferences: data.progression_preferences || {
        weightIncrement: 2.5,
        volumeProgression: 'moderate',
        intensityProgression: 'moderate'
      },
      recoveryCapacity: data.recovery_capacity || 7,
      motivationLevel: data.motivation_level || 7,
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error in getUserAdaptiveProfile:', error)
    return null
  }
}

/**
 * Crea un perfil adaptativo por defecto
 */
async function createDefaultAdaptiveProfile(userId: string): Promise<UserAdaptiveProfile> {
  const defaultProfile: UserAdaptiveProfile = {
    userId,
    experienceLevel: 'intermediate',
    fitnessGoals: ['general_fitness'],
    availableEquipment: ['barbell', 'dumbbell', 'bodyweight'],
    timeConstraints: {
      sessionsPerWeek: 3,
      minutesPerSession: 60,
      preferredDays: ['monday', 'wednesday', 'friday']
    },
    physicalLimitations: [],
    preferredExerciseTypes: ['compound', 'isolation'],
    avoidedExercises: [],
    progressionPreferences: {
      weightIncrement: 2.5,
      volumeProgression: 'moderate',
      intensityProgression: 'moderate'
    },
    recoveryCapacity: 7,
    motivationLevel: 7,
    lastUpdated: new Date().toISOString()
  }

  // Guardar en base de datos
  const { error } = await supabase
    .from('user_adaptive_profiles')
    .insert({
      user_id: userId,
      experience_level: defaultProfile.experienceLevel,
      fitness_goals: defaultProfile.fitnessGoals,
      available_equipment: defaultProfile.availableEquipment,
      time_constraints: defaultProfile.timeConstraints,
      physical_limitations: defaultProfile.physicalLimitations,
      preferred_exercise_types: defaultProfile.preferredExerciseTypes,
      avoided_exercises: defaultProfile.avoidedExercises,
      progression_preferences: defaultProfile.progressionPreferences,
      recovery_capacity: defaultProfile.recoveryCapacity,
      motivation_level: defaultProfile.motivationLevel,
      last_updated: defaultProfile.lastUpdated
    })

  if (error) {
    console.error('Error creating default adaptive profile:', error)
  }

  return defaultProfile
}

/**
 * Actualiza el perfil adaptativo del usuario
 */
export async function updateUserAdaptiveProfile(
  userId: string, 
  updates: Partial<UserAdaptiveProfile>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_adaptive_profiles')
      .upsert({
        user_id: userId,
        ...updates,
        last_updated: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating adaptive profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateUserAdaptiveProfile:', error)
    return false
  }
}

/**
 * Adapta una rutina basada en el perfil del usuario y datos de rendimiento
 */
export async function adaptRoutineForUser(
  routine: WorkoutRoutine,
  config: AdaptiveRoutineConfig
): Promise<{
  adaptedRoutine: WorkoutRoutine
  adaptations: RoutineAdaptation[]
  recommendations: SmartRecommendation[]
}> {
  const adaptations: RoutineAdaptation[] = []
  const recommendations: SmartRecommendation[] = []
  
  // Obtener perfil adaptativo
  const profile = await getUserAdaptiveProfile(config.userId)
  if (!profile) {
    throw new Error('No se pudo obtener el perfil adaptativo del usuario')
  }

  // Obtener datos de fatiga si está habilitado
  let fatigueData = null
  if (config.considerFatigue) {
    fatigueData = await getUserFatigue(config.userId)
  }

  // Clonar rutina para modificación
  const adaptedRoutine: WorkoutRoutine = JSON.parse(JSON.stringify(routine))

  // 1. Adaptar basado en nivel de experiencia
  await adaptForExperienceLevel(adaptedRoutine, profile, adaptations)

  // 2. Adaptar basado en equipamiento disponible
  if (config.allowEquipmentSubstitutions) {
    await adaptForAvailableEquipment(adaptedRoutine, profile, adaptations)
  }

  // 3. Adaptar basado en limitaciones de tiempo
  await adaptForTimeConstraints(adaptedRoutine, profile, adaptations)

  // 4. Adaptar basado en fatiga
  if (config.considerFatigue && fatigueData) {
    await adaptForFatigue(adaptedRoutine, fatigueData, adaptations)
  }

  // 5. Adaptar basado en limitaciones físicas
  await adaptForPhysicalLimitations(adaptedRoutine, profile, adaptations)

  // 6. Generar recomendaciones inteligentes
  recommendations.push(...await generateSmartRecommendations(profile, adaptedRoutine, config))

  return {
    adaptedRoutine,
    adaptations,
    recommendations
  }
}

/**
 * Adapta la rutina basada en el nivel de experiencia
 */
async function adaptForExperienceLevel(
  routine: WorkoutRoutine,
  profile: UserAdaptiveProfile,
  adaptations: RoutineAdaptation[]
): Promise<void> {
  const experienceMultipliers = {
    beginner: { volume: 0.7, intensity: 0.8, complexity: 0.6 },
    intermediate: { volume: 1.0, intensity: 1.0, complexity: 1.0 },
    advanced: { volume: 1.2, intensity: 1.1, complexity: 1.3 },
    expert: { volume: 1.4, intensity: 1.2, complexity: 1.5 }
  }

  const multiplier = experienceMultipliers[profile.experienceLevel]

  for (const day of routine.days) {
    for (const exerciseSet of day.exerciseSets) {
      // Ajustar volumen (número de series)
      const originalSets = exerciseSet.sets.length
      const adaptedSets = Math.max(1, Math.round(originalSets * multiplier.volume))
      
      if (adaptedSets !== originalSets) {
        // Ajustar número de series
        if (adaptedSets > originalSets) {
          // Agregar series
          const lastSet = exerciseSet.sets[exerciseSet.sets.length - 1]
          for (let i = originalSets; i < adaptedSets; i++) {
            exerciseSet.sets.push({ ...lastSet })
          }
        } else {
          // Remover series
          exerciseSet.sets = exerciseSet.sets.slice(0, adaptedSets)
        }

        adaptations.push({
          type: 'volume',
          reason: `Ajuste por nivel de experiencia: ${profile.experienceLevel}`,
          originalValue: originalSets,
          adaptedValue: adaptedSets,
          confidence: 0.9,
          explanation: `Se ${adaptedSets > originalSets ? 'aumentó' : 'redujo'} el volumen para adaptarse al nivel ${profile.experienceLevel}`
        })
      }

      // Ajustar intensidad (RIR)
      for (const set of exerciseSet.sets) {
        if (set.targetRir !== undefined) {
          const originalRir = set.targetRir
          const adaptedRir = profile.experienceLevel === 'beginner' 
            ? Math.max(2, originalRir + 1)
            : profile.experienceLevel === 'expert'
            ? Math.max(0, originalRir - 1)
            : originalRir

          if (adaptedRir !== originalRir) {
            set.targetRir = adaptedRir
            
            adaptations.push({
              type: 'intensity',
              reason: `Ajuste de RIR por nivel de experiencia`,
              originalValue: originalRir,
              adaptedValue: adaptedRir,
              confidence: 0.85,
              explanation: `RIR ajustado para nivel ${profile.experienceLevel}`
            })
          }
        }
      }
    }
  }
}

/**
 * Adapta la rutina basada en equipamiento disponible
 */
async function adaptForAvailableEquipment(
  routine: WorkoutRoutine,
  profile: UserAdaptiveProfile,
  adaptations: RoutineAdaptation[]
): Promise<void> {
  // Obtener ejercicios disponibles
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')

  if (!exercises) return

  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]))

  for (const day of routine.days) {
    for (const exerciseSet of day.exerciseSets) {
      const exercise = exerciseMap.get(exerciseSet.exerciseId)
      if (!exercise) continue

      // Verificar si el ejercicio requiere equipamiento no disponible
      const requiredEquipment = exercise.equipment || []
      const hasRequiredEquipment = requiredEquipment.every(eq => 
        profile.availableEquipment.includes(eq)
      )

      if (!hasRequiredEquipment) {
        // Buscar ejercicio alternativo
        const alternative = findExerciseAlternative(exercise, profile.availableEquipment, exercises)
        
        if (alternative) {
          const originalExerciseId = exerciseSet.exerciseId
          exerciseSet.exerciseId = alternative.id

          adaptations.push({
            type: 'exercise_substitution',
            reason: 'Equipamiento no disponible',
            originalValue: exercise.name,
            adaptedValue: alternative.name,
            confidence: 0.8,
            explanation: `Se sustituyó ${exercise.name} por ${alternative.name} debido a limitaciones de equipamiento`
          })
        }
      }
    }
  }
}

/**
 * Busca un ejercicio alternativo basado en equipamiento disponible
 */
function findExerciseAlternative(
  originalExercise: Exercise,
  availableEquipment: string[],
  allExercises: Exercise[]
): Exercise | null {
  // Buscar ejercicios que trabajen los mismos grupos musculares
  const alternatives = allExercises.filter(ex => {
    // Mismo grupo muscular principal
    const sameMainMuscle = ex.primaryMuscleGroup === originalExercise.primaryMuscleGroup
    
    // Equipamiento disponible
    const equipmentAvailable = (ex.equipment || []).every(eq => 
      availableEquipment.includes(eq)
    )
    
    // No es el mismo ejercicio
    const differentExercise = ex.id !== originalExercise.id

    return sameMainMuscle && equipmentAvailable && differentExercise
  })

  // Priorizar por tipo de ejercicio (compuesto vs aislamiento)
  const sameType = alternatives.filter(ex => ex.type === originalExercise.type)
  
  return sameType.length > 0 ? sameType[0] : alternatives[0] || null
}

/**
 * Adapta la rutina basada en limitaciones de tiempo
 */
async function adaptForTimeConstraints(
  routine: WorkoutRoutine,
  profile: UserAdaptiveProfile,
  adaptations: RoutineAdaptation[]
): Promise<void> {
  const { minutesPerSession } = profile.timeConstraints

  for (const day of routine.days) {
    // Estimar duración del entrenamiento
    const estimatedDuration = estimateWorkoutDuration(day)
    
    if (estimatedDuration > minutesPerSession) {
      // Reducir volumen para ajustarse al tiempo disponible
      const reductionFactor = minutesPerSession / estimatedDuration
      
      for (const exerciseSet of day.exerciseSets) {
        const originalSets = exerciseSet.sets.length
        const adaptedSets = Math.max(1, Math.round(originalSets * reductionFactor))
        
        if (adaptedSets < originalSets) {
          exerciseSet.sets = exerciseSet.sets.slice(0, adaptedSets)
          
          adaptations.push({
            type: 'volume',
            reason: 'Limitación de tiempo',
            originalValue: originalSets,
            adaptedValue: adaptedSets,
            confidence: 0.7,
            explanation: `Se redujo el volumen para ajustarse a ${minutesPerSession} minutos disponibles`
          })
        }
      }
    }
  }
}

/**
 * Estima la duración de un entrenamiento en minutos
 */
function estimateWorkoutDuration(day: WorkoutDay): number {
  let totalMinutes = 10 // Calentamiento base

  for (const exerciseSet of day.exerciseSets) {
    const sets = exerciseSet.sets.length
    const avgReps = exerciseSet.sets.reduce((sum, set) => sum + (set.targetReps || 10), 0) / sets
    
    // Tiempo por serie: 30 segundos por rep + 2 minutos de descanso
    const timePerSet = (avgReps * 0.5) + 2
    totalMinutes += sets * timePerSet
  }

  return Math.round(totalMinutes)
}

/**
 * Adapta la rutina basada en datos de fatiga
 */
async function adaptForFatigue(
  routine: WorkoutRoutine,
  fatigueData: any,
  adaptations: RoutineAdaptation[]
): Promise<void> {
  const fatigueLevel = fatigueData.currentFatigue

  if (fatigueLevel > 70) {
    // Fatiga alta: reducir intensidad y volumen
    for (const day of routine.days) {
      for (const exerciseSet of day.exerciseSets) {
        // Reducir número de series
        const originalSets = exerciseSet.sets.length
        const adaptedSets = Math.max(1, Math.round(originalSets * 0.8))
        
        if (adaptedSets < originalSets) {
          exerciseSet.sets = exerciseSet.sets.slice(0, adaptedSets)
        }

        // Aumentar RIR
        for (const set of exerciseSet.sets) {
          if (set.targetRir !== undefined) {
            set.targetRir = Math.min(4, set.targetRir + 1)
          }
        }
      }
    }

    adaptations.push({
      type: 'volume',
      reason: `Fatiga alta detectada (${fatigueLevel}/100)`,
      originalValue: 'Volumen e intensidad normales',
      adaptedValue: 'Volumen e intensidad reducidos',
      confidence: 0.9,
      explanation: 'Se redujo la carga de entrenamiento debido a alta fatiga acumulada'
    })
  }
}

/**
 * Adapta la rutina basada en limitaciones físicas
 */
async function adaptForPhysicalLimitations(
  routine: WorkoutRoutine,
  profile: UserAdaptiveProfile,
  adaptations: RoutineAdaptation[]
): Promise<void> {
  if (profile.physicalLimitations.length === 0) return

  // Obtener ejercicios
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')

  if (!exercises) return

  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]))

  for (const day of routine.days) {
    for (let i = day.exerciseSets.length - 1; i >= 0; i--) {
      const exerciseSet = day.exerciseSets[i]
      const exercise = exerciseMap.get(exerciseSet.exerciseId)
      
      if (!exercise) continue

      // Verificar si el ejercicio está en la lista de evitados
      const shouldAvoid = profile.avoidedExercises.includes(exercise.id) ||
                         profile.physicalLimitations.some(limitation => 
                           exercise.contraindications?.includes(limitation)
                         )

      if (shouldAvoid) {
        // Buscar alternativa o remover
        const alternative = findSafeAlternative(exercise, profile, exercises)
        
        if (alternative) {
          exerciseSet.exerciseId = alternative.id
          
          adaptations.push({
            type: 'exercise_substitution',
            reason: 'Limitación física',
            originalValue: exercise.name,
            adaptedValue: alternative.name,
            confidence: 0.85,
            explanation: `Se sustituyó por limitaciones físicas del usuario`
          })
        } else {
          // Remover ejercicio si no hay alternativa
          day.exerciseSets.splice(i, 1)
          
          adaptations.push({
            type: 'exercise_substitution',
            reason: 'Limitación física - ejercicio removido',
            originalValue: exercise.name,
            adaptedValue: 'Ejercicio removido',
            confidence: 0.9,
            explanation: `Se removió el ejercicio por limitaciones físicas sin alternativa segura`
          })
        }
      }
    }
  }
}

/**
 * Busca una alternativa segura para un ejercicio
 */
function findSafeAlternative(
  originalExercise: Exercise,
  profile: UserAdaptiveProfile,
  allExercises: Exercise[]
): Exercise | null {
  return allExercises.find(ex => {
    // Mismo grupo muscular
    const sameMainMuscle = ex.primaryMuscleGroup === originalExercise.primaryMuscleGroup
    
    // No está en la lista de evitados
    const notAvoided = !profile.avoidedExercises.includes(ex.id)
    
    // No tiene contraindicaciones para las limitaciones del usuario
    const isSafe = !profile.physicalLimitations.some(limitation =>
      ex.contraindications?.includes(limitation)
    )
    
    // Equipamiento disponible
    const equipmentAvailable = (ex.equipment || []).every(eq => 
      profile.availableEquipment.includes(eq)
    )

    return sameMainMuscle && notAvoided && isSafe && equipmentAvailable && ex.id !== originalExercise.id
  }) || null
}

/**
 * Genera recomendaciones inteligentes
 */
async function generateSmartRecommendations(
  profile: UserAdaptiveProfile,
  routine: WorkoutRoutine,
  config: AdaptiveRoutineConfig
): Promise<SmartRecommendation[]> {
  const recommendations: SmartRecommendation[] = []

  // Recomendación de progresión
  if (profile.experienceLevel === 'beginner') {
    recommendations.push({
      id: `progression_${Date.now()}`,
      type: 'progression_adjustment',
      title: 'Progresión Gradual Recomendada',
      description: 'Como principiante, enfócate en dominar la técnica antes de aumentar peso. Aumenta el peso solo cuando puedas completar todas las series con 2+ RIR.',
      priority: 'high',
      actionable: true,
      data: { suggestedProgression: 'technique_first' },
      confidence: 0.9,
      createdAt: new Date().toISOString()
    })
  }

  // Recomendación de frecuencia
  if (profile.timeConstraints.sessionsPerWeek < 3) {
    recommendations.push({
      id: `frequency_${Date.now()}`,
      type: 'routine_suggestion',
      title: 'Aumentar Frecuencia de Entrenamiento',
      description: 'Para mejores resultados, considera entrenar al menos 3 veces por semana. Esto permitirá mejor distribución del volumen y recuperación.',
      priority: 'medium',
      actionable: true,
      data: { suggestedFrequency: 3 },
      confidence: 0.8,
      createdAt: new Date().toISOString()
    })
  }

  // Recomendación de equipamiento
  const basicEquipment = ['barbell', 'dumbbell', 'bench']
  const missingEquipment = basicEquipment.filter(eq => !profile.availableEquipment.includes(eq))
  
  if (missingEquipment.length > 0) {
    recommendations.push({
      id: `equipment_${Date.now()}`,
      type: 'routine_suggestion',
      title: 'Equipamiento Recomendado',
      description: `Considera agregar: ${missingEquipment.join(', ')}. Esto ampliará significativamente tus opciones de ejercicios.`,
      priority: 'low',
      actionable: false,
      data: { missingEquipment },
      confidence: 0.7,
      createdAt: new Date().toISOString()
    })
  }

  return recommendations
}
