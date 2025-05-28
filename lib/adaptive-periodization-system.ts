/**
 * Sistema de Periodización Adaptativa
 * 
 * Ajusta automáticamente las fases de entrenamiento basándose en:
 * - Progreso del usuario
 * - Niveles de fatiga
 * - Adherencia al programa
 * - Objetivos específicos
 */

import { supabase } from './supabase-client'
import { getUserAdaptiveProfile } from './adaptive-routine-engine'
import { analyzeFatigueTrends, getRecentFatigueMetrics } from './fatigue-detection-system'
import { WorkoutRoutine, WorkoutDay } from './types/training'

export interface PeriodizationPhase {
  id: string
  name: string
  type: 'anatomical_adaptation' | 'hypertrophy' | 'strength' | 'power' | 'peaking' | 'deload' | 'transition'
  duration: number // weeks
  objectives: string[]
  volumeMultiplier: number // relative to baseline
  intensityRange: { min: number; max: number } // % of 1RM
  frequencyMultiplier: number // relative to baseline
  characteristics: {
    setsRange: { min: number; max: number }
    repsRange: { min: number; max: number }
    restPeriods: { min: number; max: number } // seconds
    exerciseSelection: 'general' | 'specific' | 'competition'
  }
}

export interface PeriodizationPlan {
  id: string
  userId: string
  name: string
  totalDuration: number // weeks
  currentPhase: number
  phases: PeriodizationPhase[]
  adaptiveSettings: {
    autoAdjust: boolean
    fatigueThreshold: number
    progressThreshold: number
    adherenceThreshold: number
  }
  createdAt: string
  lastAdjusted: string
}

export interface PhaseTransition {
  fromPhase: PeriodizationPhase
  toPhase: PeriodizationPhase
  reason: string
  triggeredBy: 'time' | 'progress' | 'fatigue' | 'adherence' | 'manual'
  confidence: number
  expectedOutcome: string
}

export interface ProgressMetrics {
  userId: string
  phaseId: string
  week: number
  volumeCompleted: number
  intensityAchieved: number
  adherenceRate: number
  fatigueLevel: number
  performanceGains: number
  satisfactionLevel: number
}

const STANDARD_PHASES: PeriodizationPhase[] = [
  {
    id: 'anatomical_adaptation',
    name: 'Adaptación Anatómica',
    type: 'anatomical_adaptation',
    duration: 4,
    objectives: [
      'Preparar tejidos conectivos',
      'Establecer patrones de movimiento',
      'Construir base aeróbica',
      'Mejorar movilidad y estabilidad'
    ],
    volumeMultiplier: 0.8,
    intensityRange: { min: 50, max: 70 },
    frequencyMultiplier: 1.0,
    characteristics: {
      setsRange: { min: 2, max: 3 },
      repsRange: { min: 12, max: 20 },
      restPeriods: { min: 60, max: 90 },
      exerciseSelection: 'general'
    }
  },
  {
    id: 'hypertrophy',
    name: 'Hipertrofia',
    type: 'hypertrophy',
    duration: 6,
    objectives: [
      'Maximizar crecimiento muscular',
      'Aumentar volumen de entrenamiento',
      'Mejorar capacidad de trabajo',
      'Desarrollar masa muscular'
    ],
    volumeMultiplier: 1.3,
    intensityRange: { min: 65, max: 80 },
    frequencyMultiplier: 1.2,
    characteristics: {
      setsRange: { min: 3, max: 5 },
      repsRange: { min: 8, max: 15 },
      restPeriods: { min: 90, max: 120 },
      exerciseSelection: 'general'
    }
  },
  {
    id: 'strength',
    name: 'Fuerza',
    type: 'strength',
    duration: 4,
    objectives: [
      'Maximizar fuerza máxima',
      'Mejorar eficiencia neuromuscular',
      'Aumentar 1RM',
      'Perfeccionar técnica en cargas altas'
    ],
    volumeMultiplier: 0.9,
    intensityRange: { min: 80, max: 95 },
    frequencyMultiplier: 1.0,
    characteristics: {
      setsRange: { min: 3, max: 6 },
      repsRange: { min: 1, max: 6 },
      restPeriods: { min: 180, max: 300 },
      exerciseSelection: 'specific'
    }
  },
  {
    id: 'deload',
    name: 'Descarga',
    type: 'deload',
    duration: 1,
    objectives: [
      'Facilitar recuperación',
      'Consolidar adaptaciones',
      'Reducir fatiga acumulada',
      'Preparar para nueva fase'
    ],
    volumeMultiplier: 0.6,
    intensityRange: { min: 60, max: 75 },
    frequencyMultiplier: 0.8,
    characteristics: {
      setsRange: { min: 2, max: 3 },
      repsRange: { min: 8, max: 12 },
      restPeriods: { min: 90, max: 120 },
      exerciseSelection: 'general'
    }
  }
]

/**
 * Crea un plan de periodización personalizado
 */
export async function createPeriodizationPlan(
  userId: string,
  goal: 'strength' | 'hypertrophy' | 'power' | 'general_fitness',
  duration: number = 16
): Promise<PeriodizationPlan> {
  try {
    const profile = await getUserAdaptiveProfile(userId)
    if (!profile) {
      throw new Error('No se pudo obtener el perfil del usuario')
    }

    // Seleccionar y adaptar fases según objetivo y experiencia
    const selectedPhases = selectPhasesForGoal(goal, profile.experienceLevel, duration)
    
    const plan: PeriodizationPlan = {
      id: `plan_${userId}_${Date.now()}`,
      userId,
      name: `Plan ${goal} - ${duration} semanas`,
      totalDuration: duration,
      currentPhase: 0,
      phases: selectedPhases,
      adaptiveSettings: {
        autoAdjust: true,
        fatigueThreshold: 75,
        progressThreshold: 0.8,
        adherenceThreshold: 0.8
      },
      createdAt: new Date().toISOString(),
      lastAdjusted: new Date().toISOString()
    }

    // Guardar en base de datos
    const { data, error } = await supabase
      .from('periodization_plans')
      .insert({
        id: plan.id,
        user_id: plan.userId,
        name: plan.name,
        total_duration: plan.totalDuration,
        current_phase: plan.currentPhase,
        phases: plan.phases,
        adaptive_settings: plan.adaptiveSettings,
        created_at: plan.createdAt,
        last_adjusted: plan.lastAdjusted
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating periodization plan:', error)
      throw error
    }

    return plan
  } catch (error) {
    console.error('Error in createPeriodizationPlan:', error)
    throw error
  }
}

/**
 * Selecciona fases apropiadas según objetivo y experiencia
 */
function selectPhasesForGoal(
  goal: string,
  experienceLevel: string,
  totalDuration: number
): PeriodizationPhase[] {
  const phases: PeriodizationPhase[] = []

  switch (goal) {
    case 'strength':
      if (experienceLevel === 'beginner') {
        phases.push(
          { ...STANDARD_PHASES[0], duration: 6 }, // Adaptación anatómica extendida
          { ...STANDARD_PHASES[1], duration: 6 }, // Hipertrofia
          { ...STANDARD_PHASES[2], duration: 3 }, // Fuerza reducida
          { ...STANDARD_PHASES[3] } // Deload
        )
      } else {
        phases.push(
          { ...STANDARD_PHASES[0], duration: 2 }, // Adaptación anatómica corta
          { ...STANDARD_PHASES[1], duration: 4 }, // Hipertrofia
          { ...STANDARD_PHASES[2], duration: 6 }, // Fuerza extendida
          { ...STANDARD_PHASES[3] } // Deload
        )
      }
      break

    case 'hypertrophy':
      phases.push(
        { ...STANDARD_PHASES[0], duration: 3 },
        { ...STANDARD_PHASES[1], duration: 8 },
        { ...STANDARD_PHASES[2], duration: 3 },
        { ...STANDARD_PHASES[3] }
      )
      break

    case 'general_fitness':
      phases.push(
        { ...STANDARD_PHASES[0], duration: 4 },
        { ...STANDARD_PHASES[1], duration: 6 },
        { ...STANDARD_PHASES[2], duration: 4 },
        { ...STANDARD_PHASES[3] }
      )
      break

    default:
      // Plan balanceado por defecto
      phases.push(...STANDARD_PHASES)
  }

  // Ajustar duración total si es necesario
  const currentTotal = phases.reduce((sum, phase) => sum + phase.duration, 0)
  if (currentTotal !== totalDuration) {
    const scaleFactor = totalDuration / currentTotal
    phases.forEach(phase => {
      phase.duration = Math.max(1, Math.round(phase.duration * scaleFactor))
    })
  }

  return phases
}

/**
 * Evalúa si es necesario cambiar de fase
 */
export async function evaluatePhaseTransition(planId: string): Promise<PhaseTransition | null> {
  try {
    // Obtener plan actual
    const { data: planData, error } = await supabase
      .from('periodization_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error || !planData) {
      console.error('Error fetching periodization plan:', error)
      return null
    }

    const plan: PeriodizationPlan = {
      id: planData.id,
      userId: planData.user_id,
      name: planData.name,
      totalDuration: planData.total_duration,
      currentPhase: planData.current_phase,
      phases: planData.phases,
      adaptiveSettings: planData.adaptive_settings,
      createdAt: planData.created_at,
      lastAdjusted: planData.last_adjusted
    }

    const currentPhase = plan.phases[plan.currentPhase]
    if (!currentPhase) return null

    // Obtener métricas recientes
    const [fatigueMetrics, progressMetrics] = await Promise.all([
      getRecentFatigueMetrics(plan.userId, 7),
      getProgressMetrics(plan.userId, currentPhase.id)
    ])

    // Evaluar criterios de transición
    const evaluation = await evaluateTransitionCriteria(
      plan,
      currentPhase,
      fatigueMetrics,
      progressMetrics
    )

    if (evaluation.shouldTransition) {
      const nextPhaseIndex = plan.currentPhase + 1
      const nextPhase = plan.phases[nextPhaseIndex]

      if (nextPhase) {
        return {
          fromPhase: currentPhase,
          toPhase: nextPhase,
          reason: evaluation.reason,
          triggeredBy: evaluation.trigger,
          confidence: evaluation.confidence,
          expectedOutcome: evaluation.expectedOutcome
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error evaluating phase transition:', error)
    return null
  }
}

/**
 * Evalúa criterios específicos para transición de fase
 */
async function evaluateTransitionCriteria(
  plan: PeriodizationPlan,
  currentPhase: PeriodizationPhase,
  fatigueMetrics: any[],
  progressMetrics: ProgressMetrics[]
): Promise<{
  shouldTransition: boolean
  reason: string
  trigger: 'time' | 'progress' | 'fatigue' | 'adherence'
  confidence: number
  expectedOutcome: string
}> {
  // Calcular tiempo en fase actual
  const weeksInPhase = progressMetrics.length
  const phaseCompletion = weeksInPhase / currentPhase.duration

  // Criterio 1: Tiempo completado
  if (phaseCompletion >= 1.0) {
    return {
      shouldTransition: true,
      reason: 'Duración de fase completada según cronograma',
      trigger: 'time',
      confidence: 0.9,
      expectedOutcome: 'Progresión natural a siguiente fase'
    }
  }

  // Criterio 2: Fatiga excesiva
  if (fatigueMetrics.length > 0) {
    const avgFatigue = fatigueMetrics.reduce((sum, m) => sum + m.overallFatigueScore, 0) / fatigueMetrics.length
    
    if (avgFatigue > plan.adaptiveSettings.fatigueThreshold && phaseCompletion >= 0.75) {
      return {
        shouldTransition: true,
        reason: 'Fatiga acumulada excesiva detectada',
        trigger: 'fatigue',
        confidence: 0.85,
        expectedOutcome: 'Reducción de fatiga y mejor recuperación'
      }
    }
  }

  // Criterio 3: Progreso estancado
  if (progressMetrics.length >= 3) {
    const recentProgress = progressMetrics.slice(-3)
    const avgProgress = recentProgress.reduce((sum, m) => sum + m.performanceGains, 0) / recentProgress.length
    
    if (avgProgress < plan.adaptiveSettings.progressThreshold && phaseCompletion >= 0.5) {
      return {
        shouldTransition: true,
        reason: 'Progreso estancado - necesidad de nuevo estímulo',
        trigger: 'progress',
        confidence: 0.75,
        expectedOutcome: 'Renovación del estímulo de entrenamiento'
      }
    }
  }

  // Criterio 4: Baja adherencia
  if (progressMetrics.length >= 2) {
    const recentAdherence = progressMetrics.slice(-2)
    const avgAdherence = recentAdherence.reduce((sum, m) => sum + m.adherenceRate, 0) / recentAdherence.length
    
    if (avgAdherence < plan.adaptiveSettings.adherenceThreshold && phaseCompletion >= 0.5) {
      return {
        shouldTransition: true,
        reason: 'Baja adherencia al programa actual',
        trigger: 'adherence',
        confidence: 0.7,
        expectedOutcome: 'Mejora en motivación y adherencia'
      }
    }
  }

  return {
    shouldTransition: false,
    reason: 'Criterios de transición no cumplidos',
    trigger: 'time',
    confidence: 0.6,
    expectedOutcome: 'Continuación de fase actual'
  }
}

/**
 * Obtiene métricas de progreso para una fase específica
 */
async function getProgressMetrics(userId: string, phaseId: string): Promise<ProgressMetrics[]> {
  try {
    const { data, error } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('phase_id', phaseId)
      .order('week', { ascending: true })

    if (error) {
      console.error('Error fetching progress metrics:', error)
      return []
    }

    return data.map(row => ({
      userId: row.user_id,
      phaseId: row.phase_id,
      week: row.week,
      volumeCompleted: row.volume_completed,
      intensityAchieved: row.intensity_achieved,
      adherenceRate: row.adherence_rate,
      fatigueLevel: row.fatigue_level,
      performanceGains: row.performance_gains,
      satisfactionLevel: row.satisfaction_level
    }))
  } catch (error) {
    console.error('Error in getProgressMetrics:', error)
    return []
  }
}

/**
 * Ejecuta transición de fase
 */
export async function executePhaseTransition(planId: string, transition: PhaseTransition): Promise<boolean> {
  try {
    // Actualizar plan en base de datos
    const { error } = await supabase
      .from('periodization_plans')
      .update({
        current_phase: supabase.rpc('increment_current_phase', { plan_id: planId }),
        last_adjusted: new Date().toISOString()
      })
      .eq('id', planId)

    if (error) {
      console.error('Error executing phase transition:', error)
      return false
    }

    // Registrar transición
    await supabase
      .from('phase_transitions')
      .insert({
        plan_id: planId,
        from_phase_id: transition.fromPhase.id,
        to_phase_id: transition.toPhase.id,
        reason: transition.reason,
        triggered_by: transition.triggeredBy,
        confidence: transition.confidence,
        created_at: new Date().toISOString()
      })

    return true
  } catch (error) {
    console.error('Error in executePhaseTransition:', error)
    return false
  }
}

/**
 * Adapta rutina según fase actual de periodización
 */
export async function adaptRoutineToPhase(
  routine: WorkoutRoutine,
  phase: PeriodizationPhase
): Promise<WorkoutRoutine> {
  const adaptedRoutine = { ...routine }

  // Adaptar cada día de entrenamiento
  adaptedRoutine.days = routine.days.map(day => adaptDayToPhase(day, phase))

  return adaptedRoutine
}

/**
 * Adapta un día de entrenamiento según la fase
 */
function adaptDayToPhase(day: WorkoutDay, phase: PeriodizationPhase): WorkoutDay {
  const adaptedDay = { ...day }

  adaptedDay.exerciseSets = day.exerciseSets.map(exerciseSet => {
    const adaptedExerciseSet = { ...exerciseSet }
    
    adaptedExerciseSet.sets = exerciseSet.sets.map(set => {
      const adaptedSet = { ...set }
      
      // Ajustar repeticiones según fase
      if (set.targetReps) {
        const midReps = (phase.characteristics.repsRange.min + phase.characteristics.repsRange.max) / 2
        adaptedSet.targetReps = Math.round(midReps)
      }
      
      // Ajustar tiempo de descanso
      const midRest = (phase.characteristics.restPeriods.min + phase.characteristics.restPeriods.max) / 2
      adaptedSet.restTime = Math.round(midRest)
      
      // Ajustar intensidad (esto requeriría conocer el 1RM del usuario)
      // Por ahora, ajustamos el RIR basado en el rango de intensidad
      if (phase.intensityRange.max > 85) {
        adaptedSet.targetRir = 1 // Alta intensidad
      } else if (phase.intensityRange.max > 75) {
        adaptedSet.targetRir = 2 // Intensidad moderada-alta
      } else {
        adaptedSet.targetRir = 3 // Intensidad moderada
      }
      
      return adaptedSet
    })
    
    // Ajustar número de series según fase
    const targetSets = Math.round((phase.characteristics.setsRange.min + phase.characteristics.setsRange.max) / 2)
    const currentSets = adaptedExerciseSet.sets.length
    
    if (targetSets > currentSets) {
      // Agregar series
      const lastSet = adaptedExerciseSet.sets[adaptedExerciseSet.sets.length - 1]
      for (let i = currentSets; i < targetSets; i++) {
        adaptedExerciseSet.sets.push({ ...lastSet })
      }
    } else if (targetSets < currentSets) {
      // Remover series
      adaptedExerciseSet.sets = adaptedExerciseSet.sets.slice(0, targetSets)
    }
    
    return adaptedExerciseSet
  })

  return adaptedDay
}

/**
 * Obtiene el plan de periodización activo del usuario
 */
export async function getActivePeriodizationPlan(userId: string): Promise<PeriodizationPlan | null> {
  try {
    const { data, error } = await supabase
      .from('periodization_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      totalDuration: data.total_duration,
      currentPhase: data.current_phase,
      phases: data.phases,
      adaptiveSettings: data.adaptive_settings,
      createdAt: data.created_at,
      lastAdjusted: data.last_adjusted
    }
  } catch (error) {
    console.error('Error getting active periodization plan:', error)
    return null
  }
}
