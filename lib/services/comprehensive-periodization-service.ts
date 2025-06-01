import { supabase } from "@/lib/supabase-client"
import { handleSupabaseError } from "@/lib/utils/error-handler"

// ===== TIPOS DE DATOS PARA PERIODIZACIÓN =====

export interface PeriodizationPlan {
  id: string
  user_id: string
  name: string
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'powerlifting' | 'general_fitness'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_weeks: number
  macrocycles: Macrocycle[]
  created_at: string
  updated_at: string
}

export interface Macrocycle {
  id: string
  plan_id: string
  name: string
  phase: 'accumulation' | 'intensification' | 'realization' | 'deload'
  duration_weeks: number
  mesocycles: Mesocycle[]
  goals: string[]
}

export interface Mesocycle {
  id: string
  macrocycle_id: string
  name: string
  week_start: number
  duration_weeks: number
  focus: 'volume' | 'intensity' | 'technique' | 'recovery'
  microcycles: Microcycle[]
  volume_progression: number[]
  intensity_progression: number[]
}

export interface Microcycle {
  id: string
  mesocycle_id: string
  week_number: number
  training_days: TrainingDay[]
  volume_target: number
  intensity_target: number
  deload_week: boolean
}

export interface TrainingDay {
  id: string
  microcycle_id: string
  day_number: number
  name: string
  muscle_groups: string[]
  exercises: PeriodizedExercise[]
  total_volume: number
  average_intensity: number
}

export interface PeriodizedExercise {
  id: string
  day_id: string
  exercise_id: string
  exercise_name: string
  sets: number
  reps: string
  intensity_percentage: number
  rir_target: number
  volume_landmarks: VolumeLandmarks
  progression_scheme: ProgressionScheme
  alternatives: string[]
}

// ===== VOLUME LANDMARKS (MEV/MAV/MRV) =====

export interface VolumeLandmarks {
  muscle_group: string
  mev: number // Minimum Effective Volume
  mav: number // Maximum Adaptive Volume
  mrv: number // Maximum Recoverable Volume
  current_volume: number
  weekly_sets: number
}

export interface MuscleGroupVolume {
  muscle_group: string
  weekly_sets: number
  mev: number
  mav: number
  mrv: number
  current_status: 'below_mev' | 'optimal' | 'approaching_mrv' | 'above_mrv'
  recommendation: string
}

// ===== RIR (RATE IN RESERVE) SYSTEM =====

export interface RiRProgression {
  week: number
  target_rir: number
  intensity_percentage: number
  volume_adjustment: number
  autoregulation_notes: string
}

export interface ProgressionScheme {
  type: 'linear' | 'double_progression' | 'wave_loading' | 'autoregulation'
  parameters: {
    weight_increment?: number
    rep_increment?: number
    rir_progression?: RiRProgression[]
    deload_percentage?: number
  }
}

// ===== SERVICIO PRINCIPAL DE PERIODIZACIÓN =====

export class ComprehensivePeriodizationService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Crear plan de periodización completo
   */
  async createPeriodizationPlan(
    goal: string,
    level: string,
    duration_weeks: number,
    preferences: any
  ): Promise<PeriodizationPlan | null> {
    try {
      // Generar estructura de periodización
      const macrocycles = this.generateMacrocycles(goal, level, duration_weeks)
      
      const planData = {
        user_id: this.userId,
        name: `Plan ${goal} - ${level} (${duration_weeks} semanas)`,
        goal: goal as any,
        level: level as any,
        duration_weeks,
        macrocycles
      }

      const { data, error } = await supabase
        .from('periodization_plans')
        .insert(planData)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, { context: 'Crear plan de periodización', showToast: true })
        return null
      }

      return data as PeriodizationPlan

    } catch (error) {
      console.error('Error al crear plan de periodización:', error)
      return null
    }
  }

  /**
   * Generar macrociclos basados en objetivo y nivel
   */
  private generateMacrocycles(goal: string, level: string, totalWeeks: number): Macrocycle[] {
    const macrocycles: Macrocycle[] = []

    switch (goal) {
      case 'strength':
        return this.generateStrengthMacrocycles(level, totalWeeks)
      case 'hypertrophy':
        return this.generateHypertrophyMacrocycles(level, totalWeeks)
      case 'powerlifting':
        return this.generatePowerliftingMacrocycles(level, totalWeeks)
      default:
        return this.generateGeneralFitnessMacrocycles(level, totalWeeks)
    }
  }

  /**
   * Generar macrociclos para fuerza
   */
  private generateStrengthMacrocycles(level: string, totalWeeks: number): Macrocycle[] {
    const phases = [
      { phase: 'accumulation', percentage: 0.4, goals: ['Construir base de volumen', 'Técnica'] },
      { phase: 'intensification', percentage: 0.35, goals: ['Aumentar intensidad', 'Fuerza específica'] },
      { phase: 'realization', percentage: 0.2, goals: ['Picos de fuerza', 'Testing'] },
      { phase: 'deload', percentage: 0.05, goals: ['Recuperación', 'Mantenimiento'] }
    ]

    return phases.map((phase, index) => ({
      id: `macro_${index + 1}`,
      plan_id: '',
      name: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}`,
      phase: phase.phase as any,
      duration_weeks: Math.round(totalWeeks * phase.percentage),
      mesocycles: this.generateMesocycles(phase.phase, Math.round(totalWeeks * phase.percentage), level),
      goals: phase.goals
    }))
  }

  /**
   * Generar macrociclos para hipertrofia
   */
  private generateHypertrophyMacrocycles(level: string, totalWeeks: number): Macrocycle[] {
    const phases = [
      { phase: 'accumulation', percentage: 0.5, goals: ['Volumen alto', 'Adaptaciones metabólicas'] },
      { phase: 'intensification', percentage: 0.3, goals: ['Intensidad moderada', 'Fuerza-resistencia'] },
      { phase: 'realization', percentage: 0.15, goals: ['Definición', 'Mantenimiento'] },
      { phase: 'deload', percentage: 0.05, goals: ['Recuperación activa'] }
    ]

    return phases.map((phase, index) => ({
      id: `macro_${index + 1}`,
      plan_id: '',
      name: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}`,
      phase: phase.phase as any,
      duration_weeks: Math.round(totalWeeks * phase.percentage),
      mesocycles: this.generateMesocycles(phase.phase, Math.round(totalWeeks * phase.percentage), level),
      goals: phase.goals
    }))
  }

  /**
   * Generar macrociclos para powerlifting
   */
  private generatePowerliftingMacrocycles(level: string, totalWeeks: number): Macrocycle[] {
    const phases = [
      { phase: 'accumulation', percentage: 0.45, goals: ['Volumen en movimientos básicos', 'Técnica perfecta'] },
      { phase: 'intensification', percentage: 0.35, goals: ['Intensidad alta', 'Especificidad'] },
      { phase: 'realization', percentage: 0.15, goals: ['Picos de fuerza', 'Competición'] },
      { phase: 'deload', percentage: 0.05, goals: ['Recuperación completa'] }
    ]

    return phases.map((phase, index) => ({
      id: `macro_${index + 1}`,
      plan_id: '',
      name: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}`,
      phase: phase.phase as any,
      duration_weeks: Math.round(totalWeeks * phase.percentage),
      mesocycles: this.generateMesocycles(phase.phase, Math.round(totalWeeks * phase.percentage), level),
      goals: phase.goals
    }))
  }

  /**
   * Generar macrociclos para fitness general
   */
  private generateGeneralFitnessMacrocycles(level: string, totalWeeks: number): Macrocycle[] {
    const phases = [
      { phase: 'accumulation', percentage: 0.6, goals: ['Adaptación general', 'Técnica básica'] },
      { phase: 'intensification', percentage: 0.25, goals: ['Mejora específica', 'Variedad'] },
      { phase: 'realization', percentage: 0.1, goals: ['Evaluación', 'Mantenimiento'] },
      { phase: 'deload', percentage: 0.05, goals: ['Recuperación'] }
    ]

    return phases.map((phase, index) => ({
      id: `macro_${index + 1}`,
      plan_id: '',
      name: `${phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}`,
      phase: phase.phase as any,
      duration_weeks: Math.round(totalWeeks * phase.percentage),
      mesocycles: this.generateMesocycles(phase.phase, Math.round(totalWeeks * phase.percentage), level),
      goals: phase.goals
    }))
  }

  /**
   * Generar mesociclos dentro de un macrociclo
   */
  private generateMesocycles(phase: string, weeks: number, level: string): Mesocycle[] {
    const mesocycles: Mesocycle[] = []
    const mesocycleLength = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 4

    let currentWeek = 1
    let mesocycleCount = 1

    while (currentWeek <= weeks) {
      const remainingWeeks = weeks - currentWeek + 1
      const duration = Math.min(mesocycleLength, remainingWeeks)

      const mesocycle: Mesocycle = {
        id: `meso_${mesocycleCount}`,
        macrocycle_id: '',
        name: `Mesociclo ${mesocycleCount}`,
        week_start: currentWeek,
        duration_weeks: duration,
        focus: this.getMesocycleFocus(phase, mesocycleCount),
        microcycles: this.generateMicrocycles(duration, phase, level),
        volume_progression: this.generateVolumeProgression(duration, phase),
        intensity_progression: this.generateIntensityProgression(duration, phase)
      }

      mesocycles.push(mesocycle)
      currentWeek += duration
      mesocycleCount++
    }

    return mesocycles
  }

  /**
   * Determinar el enfoque del mesociclo
   */
  private getMesocycleFocus(phase: string, mesocycleNumber: number): 'volume' | 'intensity' | 'technique' | 'recovery' {
    switch (phase) {
      case 'accumulation':
        return mesocycleNumber === 1 ? 'technique' : 'volume'
      case 'intensification':
        return 'intensity'
      case 'realization':
        return mesocycleNumber === 1 ? 'intensity' : 'recovery'
      case 'deload':
        return 'recovery'
      default:
        return 'volume'
    }
  }

  /**
   * Generar progresión de volumen
   */
  private generateVolumeProgression(weeks: number, phase: string): number[] {
    const progression: number[] = []
    
    switch (phase) {
      case 'accumulation':
        // Progresión ascendente de volumen
        for (let i = 0; i < weeks; i++) {
          progression.push(70 + (i * 5)) // 70%, 75%, 80%, etc.
        }
        break
      case 'intensification':
        // Volumen moderado y estable
        for (let i = 0; i < weeks; i++) {
          progression.push(60 - (i * 2)) // 60%, 58%, 56%, etc.
        }
        break
      case 'realization':
        // Volumen bajo
        for (let i = 0; i < weeks; i++) {
          progression.push(40 - (i * 5)) // 40%, 35%, 30%, etc.
        }
        break
      case 'deload':
        // Volumen muy bajo
        for (let i = 0; i < weeks; i++) {
          progression.push(30)
        }
        break
      default:
        for (let i = 0; i < weeks; i++) {
          progression.push(70)
        }
    }

    return progression
  }

  /**
   * Generar progresión de intensidad
   */
  private generateIntensityProgression(weeks: number, phase: string): number[] {
    const progression: number[] = []
    
    switch (phase) {
      case 'accumulation':
        // Intensidad moderada y estable
        for (let i = 0; i < weeks; i++) {
          progression.push(70 + (i * 2)) // 70%, 72%, 74%, etc.
        }
        break
      case 'intensification':
        // Intensidad ascendente
        for (let i = 0; i < weeks; i++) {
          progression.push(80 + (i * 3)) // 80%, 83%, 86%, etc.
        }
        break
      case 'realization':
        // Intensidad muy alta
        for (let i = 0; i < weeks; i++) {
          progression.push(90 + (i * 2)) // 90%, 92%, 94%, etc.
        }
        break
      case 'deload':
        // Intensidad baja
        for (let i = 0; i < weeks; i++) {
          progression.push(60)
        }
        break
      default:
        for (let i = 0; i < weeks; i++) {
          progression.push(75)
        }
    }

    return progression
  }

  /**
   * Generar microciclos
   */
  private generateMicrocycles(weeks: number, phase: string, level: string): Microcycle[] {
    const microcycles: Microcycle[] = []

    for (let week = 1; week <= weeks; week++) {
      const isDeloadWeek = phase === 'deload' || (week === weeks && phase !== 'realization')
      
      const microcycle: Microcycle = {
        id: `micro_${week}`,
        mesocycle_id: '',
        week_number: week,
        training_days: this.generateTrainingDays(level, phase, isDeloadWeek),
        volume_target: this.calculateVolumeTarget(phase, week, weeks),
        intensity_target: this.calculateIntensityTarget(phase, week, weeks),
        deload_week: isDeloadWeek
      }

      microcycles.push(microcycle)
    }

    return microcycles
  }

  /**
   * Generar días de entrenamiento
   */
  private generateTrainingDays(level: string, phase: string, isDeload: boolean): TrainingDay[] {
    const daysPerWeek = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5
    const days: TrainingDay[] = []

    // Plantillas de entrenamiento según nivel
    const templates = {
      beginner: ['Full Body A', 'Full Body B', 'Full Body C'],
      intermediate: ['Upper Body', 'Lower Body', 'Push', 'Pull'],
      advanced: ['Push', 'Pull', 'Legs', 'Upper', 'Lower']
    }

    const template = templates[level as keyof typeof templates]

    for (let day = 1; day <= daysPerWeek; day++) {
      const dayName = template[(day - 1) % template.length]
      
      const trainingDay: TrainingDay = {
        id: `day_${day}`,
        microcycle_id: '',
        day_number: day,
        name: dayName,
        muscle_groups: this.getMuscleGroupsForDay(dayName),
        exercises: this.generateExercisesForDay(dayName, phase, isDeload),
        total_volume: 0,
        average_intensity: 0
      }

      days.push(trainingDay)
    }

    return days
  }

  /**
   * Obtener grupos musculares para un día
   */
  private getMuscleGroupsForDay(dayName: string): string[] {
    const muscleGroups: { [key: string]: string[] } = {
      'Full Body A': ['Pecho', 'Espalda', 'Piernas', 'Hombros'],
      'Full Body B': ['Piernas', 'Pecho', 'Espalda', 'Brazos'],
      'Full Body C': ['Espalda', 'Piernas', 'Hombros', 'Core'],
      'Upper Body': ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
      'Lower Body': ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas'],
      'Push': ['Pecho', 'Hombros', 'Tríceps'],
      'Pull': ['Espalda', 'Bíceps', 'Antebrazos'],
      'Legs': ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas']
    }

    return muscleGroups[dayName] || []
  }

  /**
   * Generar ejercicios para un día
   */
  private generateExercisesForDay(dayName: string, phase: string, isDeload: boolean): PeriodizedExercise[] {
    // Esta función se expandirá con la base de datos de ejercicios
    // Por ahora, retorna ejercicios básicos
    const exercises: PeriodizedExercise[] = []

    const baseExercises = this.getBaseExercisesForDay(dayName)
    
    baseExercises.forEach((exercise, index) => {
      const periodizedExercise: PeriodizedExercise = {
        id: `ex_${index + 1}`,
        day_id: '',
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        sets: isDeload ? Math.max(2, exercise.sets - 1) : exercise.sets,
        reps: exercise.reps,
        intensity_percentage: this.calculateIntensityForExercise(phase, exercise.type, isDeload),
        rir_target: this.calculateRiRTarget(phase, isDeload),
        volume_landmarks: this.getVolumeLandmarksForMuscleGroup(exercise.primary_muscle),
        progression_scheme: this.getProgressionScheme(phase, exercise.type),
        alternatives: exercise.alternatives
      }

      exercises.push(periodizedExercise)
    })

    return exercises
  }

  /**
   * Obtener ejercicios base para un día
   */
  private getBaseExercisesForDay(dayName: string): any[] {
    const exerciseTemplates: { [key: string]: any[] } = {
      'Full Body A': [
        { id: 'squat', name: 'Sentadilla', sets: 3, reps: '8-10', type: 'compound', primary_muscle: 'Piernas', alternatives: ['Sentadilla frontal', 'Prensa'] },
        { id: 'bench', name: 'Press de banca', sets: 3, reps: '8-10', type: 'compound', primary_muscle: 'Pecho', alternatives: ['Press inclinado', 'Flexiones'] },
        { id: 'row', name: 'Remo con barra', sets: 3, reps: '8-10', type: 'compound', primary_muscle: 'Espalda', alternatives: ['Remo con mancuernas', 'Dominadas'] }
      ],
      'Push': [
        { id: 'bench', name: 'Press de banca', sets: 4, reps: '6-8', type: 'compound', primary_muscle: 'Pecho', alternatives: ['Press inclinado', 'Press con mancuernas'] },
        { id: 'ohp', name: 'Press militar', sets: 3, reps: '8-10', type: 'compound', primary_muscle: 'Hombros', alternatives: ['Press con mancuernas', 'Press Arnold'] },
        { id: 'dips', name: 'Fondos', sets: 3, reps: '10-12', type: 'compound', primary_muscle: 'Tríceps', alternatives: ['Press francés', 'Extensiones'] }
      ],
      'Pull': [
        { id: 'deadlift', name: 'Peso muerto', sets: 3, reps: '5-6', type: 'compound', primary_muscle: 'Espalda', alternatives: ['Peso muerto rumano', 'Peso muerto sumo'] },
        { id: 'pullups', name: 'Dominadas', sets: 3, reps: '8-10', type: 'compound', primary_muscle: 'Espalda', alternatives: ['Jalones', 'Remo invertido'] },
        { id: 'curls', name: 'Curl con barra', sets: 3, reps: '10-12', type: 'isolation', primary_muscle: 'Bíceps', alternatives: ['Curl con mancuernas', 'Curl martillo'] }
      ],
      'Legs': [
        { id: 'squat', name: 'Sentadilla', sets: 4, reps: '6-8', type: 'compound', primary_muscle: 'Cuádriceps', alternatives: ['Sentadilla frontal', 'Prensa'] },
        { id: 'rdl', name: 'Peso muerto rumano', sets: 3, reps: '8-10', type: 'compound', primary_muscle: 'Isquiotibiales', alternatives: ['Curl femoral', 'Buenos días'] },
        { id: 'lunges', name: 'Zancadas', sets: 3, reps: '12-15', type: 'compound', primary_muscle: 'Glúteos', alternatives: ['Sentadilla búlgara', 'Step ups'] }
      ]
    }

    return exerciseTemplates[dayName] || exerciseTemplates['Full Body A']
  }

  /**
   * Calcular intensidad para ejercicio
   */
  private calculateIntensityForExercise(phase: string, exerciseType: string, isDeload: boolean): number {
    if (isDeload) return 60

    const baseIntensity = {
      'accumulation': exerciseType === 'compound' ? 75 : 70,
      'intensification': exerciseType === 'compound' ? 85 : 75,
      'realization': exerciseType === 'compound' ? 90 : 80,
      'deload': 60
    }

    return baseIntensity[phase as keyof typeof baseIntensity] || 75
  }

  /**
   * Calcular objetivo RiR
   */
  private calculateRiRTarget(phase: string, isDeload: boolean): number {
    if (isDeload) return 4

    const rirTargets = {
      'accumulation': 3,
      'intensification': 2,
      'realization': 1,
      'deload': 4
    }

    return rirTargets[phase as keyof typeof rirTargets] || 3
  }

  /**
   * Obtener volume landmarks para grupo muscular
   */
  private getVolumeLandmarksForMuscleGroup(muscleGroup: string): VolumeLandmarks {
    const landmarks: { [key: string]: VolumeLandmarks } = {
      'Pecho': { muscle_group: 'Pecho', mev: 8, mav: 18, mrv: 22, current_volume: 0, weekly_sets: 0 },
      'Espalda': { muscle_group: 'Espalda', mev: 10, mav: 20, mrv: 25, current_volume: 0, weekly_sets: 0 },
      'Piernas': { muscle_group: 'Piernas', mev: 12, mav: 20, mrv: 25, current_volume: 0, weekly_sets: 0 },
      'Hombros': { muscle_group: 'Hombros', mev: 8, mav: 16, mrv: 20, current_volume: 0, weekly_sets: 0 },
      'Brazos': { muscle_group: 'Brazos', mev: 6, mav: 14, mrv: 18, current_volume: 0, weekly_sets: 0 }
    }

    return landmarks[muscleGroup] || landmarks['Pecho']
  }

  /**
   * Obtener esquema de progresión
   */
  private getProgressionScheme(phase: string, exerciseType: string): ProgressionScheme {
    switch (phase) {
      case 'accumulation':
        return {
          type: 'double_progression',
          parameters: {
            rep_increment: 1,
            weight_increment: 2.5,
            rir_progression: [
              { week: 1, target_rir: 3, intensity_percentage: 75, volume_adjustment: 1.0, autoregulation_notes: 'Enfoque en técnica' },
              { week: 2, target_rir: 3, intensity_percentage: 77, volume_adjustment: 1.05, autoregulation_notes: 'Incremento gradual' },
              { week: 3, target_rir: 2, intensity_percentage: 80, volume_adjustment: 1.1, autoregulation_notes: 'Mayor intensidad' }
            ]
          }
        }
      case 'intensification':
        return {
          type: 'linear',
          parameters: {
            weight_increment: 2.5,
            rir_progression: [
              { week: 1, target_rir: 2, intensity_percentage: 85, volume_adjustment: 0.9, autoregulation_notes: 'Intensidad alta' },
              { week: 2, target_rir: 1, intensity_percentage: 87, volume_adjustment: 0.85, autoregulation_notes: 'Cerca del fallo' },
              { week: 3, target_rir: 1, intensity_percentage: 90, volume_adjustment: 0.8, autoregulation_notes: 'Máxima intensidad' }
            ]
          }
        }
      default:
        return {
          type: 'autoregulation',
          parameters: {
            rir_progression: [
              { week: 1, target_rir: 3, intensity_percentage: 75, volume_adjustment: 1.0, autoregulation_notes: 'Autorregulación basada en sensaciones' }
            ]
          }
        }
    }
  }

  /**
   * Calcular objetivos de volumen e intensidad
   */
  private calculateVolumeTarget(phase: string, week: number, totalWeeks: number): number {
    const progression = this.generateVolumeProgression(totalWeeks, phase)
    return progression[week - 1] || 70
  }

  private calculateIntensityTarget(phase: string, week: number, totalWeeks: number): number {
    const progression = this.generateIntensityProgression(totalWeeks, phase)
    return progression[week - 1] || 75
  }
}

export default ComprehensivePeriodizationService
