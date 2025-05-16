import { TrainingProfile } from "@/lib/training-personalization-service"
import { supabase } from "@/lib/supabase-client"

// Tipos para el generador de planes de entrenamiento
export interface WorkoutPlan {
  id: string
  userId: string
  name: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  goal: string
  duration: number // en semanas
  daysPerWeek: number
  createdAt: string
  isActive: boolean
  days: WorkoutDay[]
}

export interface WorkoutDay {
  id: string
  name: string
  description: string
  targetMuscleGroups: string[]
  exercises: WorkoutExercise[]
  restDay: boolean
  notes: string
}

export interface WorkoutExercise {
  id: string
  name: string
  muscleGroup: string
  sets: number
  repsMin: number
  repsMax: number
  rest: number // en segundos
  tempo: string // ej: "2-0-2-0" (excéntrica-pausa-concéntrica-pausa)
  weight: number // en kg, 0 para peso corporal
  rir: number // repeticiones en reserva
  notes: string
  superset: boolean
  supersetWith: string // ID del ejercicio con el que forma un superset
}

/**
 * Genera un plan de entrenamiento basado en el perfil del usuario
 */
export async function generateWorkoutPlan(userId: string, profile: TrainingProfile): Promise<WorkoutPlan | null> {
  try {
    if (!userId) {
      console.error('Error: userId es requerido para generar un plan de entrenamiento')
      return null
    }

    console.log('Generando plan de entrenamiento para usuario:', userId)
    console.log('Perfil de entrenamiento:', profile)

    // Determinar el tipo de plan basado en el objetivo principal
    const planType = determinePlanType(profile.primaryGoal)
    console.log('Tipo de plan determinado:', planType)

    // Determinar la estructura del plan basada en la disponibilidad semanal
    const daysPerWeek = profile.weeklyAvailability
    console.log('Días por semana:', daysPerWeek)

    // Crear el plan básico
    const planId = crypto.randomUUID()
    console.log('ID del plan generado:', planId)

    const plan: WorkoutPlan = {
      id: planId,
      userId,
      name: `Plan de ${translateGoal(profile.primaryGoal)}`,
      description: `Plan personalizado para ${translateGoal(profile.primaryGoal)} adaptado a tu nivel y disponibilidad.`,
      level: profile.experienceLevel,
      goal: profile.primaryGoal,
      duration: 8, // 8 semanas por defecto
      daysPerWeek,
      createdAt: new Date().toISOString(),
      isActive: true,
      days: []
    }

    console.log('Plan básico creado:', plan)

    // Generar los días de entrenamiento según el tipo de plan y disponibilidad
    try {
      plan.days = generateWorkoutDays(planType, daysPerWeek, profile)
      console.log('Días de entrenamiento generados:', plan.days)
    } catch (error) {
      console.error('Error al generar días de entrenamiento:', error)
      // Si hay un error, crear al menos un día de entrenamiento básico
      plan.days = [
        {
          id: crypto.randomUUID(),
          name: 'Día 1: Cuerpo Completo',
          description: 'Entrenamiento básico de cuerpo completo',
          targetMuscleGroups: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos'],
          exercises: [
            createExercise('Sentadilla', 'Piernas', 3, 8, 12),
            createExercise('Press de Banca', 'Pecho', 3, 8, 12),
            createExercise('Remo con Barra', 'Espalda', 3, 8, 12)
          ],
          restDay: false,
          notes: 'Plan básico generado automáticamente'
        }
      ]
    }

    // Preparar datos para Supabase
    const planData = {
      id: plan.id,
      user_id: userId,
      name: plan.name,
      description: plan.description,
      level: plan.level,
      goal: plan.goal,
      duration: plan.duration,
      days_per_week: plan.daysPerWeek,
      is_active: plan.isActive,
      days: plan.days,
      created_at: plan.createdAt,
      is_template: false // Asegurarse de que no es una plantilla
    }

    console.log('Datos preparados para Supabase:', JSON.stringify(planData))

    // Guardar el plan en Supabase
    try {
      const { error } = await supabase
        .from('workout_routines')
        .insert([planData])

      if (error) {
        console.error('Error al guardar el plan de entrenamiento:', error)

        // Intentar con un enfoque más simple
        console.log('Intentando con un enfoque más simple...')
        const simplePlanData = {
          id: planId,
          user_id: userId,
          name: `Plan de ${translateGoal(profile.primaryGoal)}`,
          description: 'Plan personalizado básico',
          level: profile.experienceLevel,
          goal: profile.primaryGoal,
          duration: 8,
          days_per_week: daysPerWeek,
          is_active: true,
          days: [],
          created_at: new Date().toISOString(),
          is_template: false
        }

        const { error: simpleError } = await supabase
          .from('workout_routines')
          .insert([simplePlanData])

        if (simpleError) {
          console.error('Error al guardar el plan simplificado:', simpleError)
          return null
        }

        console.log('Plan simplificado guardado exitosamente')
        return {
          ...plan,
          days: [] // Plan sin días para evitar errores
        }
      }

      console.log('Plan guardado exitosamente en Supabase')
      return plan
    } catch (insertError) {
      console.error('Error al intentar insertar en Supabase:', insertError)
      return null
    }
  } catch (error) {
    console.error('Error en generateWorkoutPlan:', error)
    return null
  }
}

/**
 * Determina el tipo de plan basado en el objetivo principal
 */
function determinePlanType(primaryGoal: string): 'strength' | 'hypertrophy' | 'endurance' | 'general' {
  switch (primaryGoal) {
    case 'strength':
      return 'strength'
    case 'muscle_gain':
      return 'hypertrophy'
    case 'endurance':
      return 'endurance'
    default:
      return 'general'
  }
}

/**
 * Genera los días de entrenamiento según el tipo de plan y disponibilidad
 */
function generateWorkoutDays(planType: 'strength' | 'hypertrophy' | 'endurance' | 'general', daysPerWeek: number, profile: TrainingProfile): WorkoutDay[] {
  const days: WorkoutDay[] = []

  // Mapeo de días de la semana a números para ordenar
  const dayOrder: Record<string, number> = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
    'Domingo': 7
  }

  // Ordenar los días de entrenamiento seleccionados
  const selectedDays = [...profile.trainingDays].sort((a, b) => dayOrder[a] - dayOrder[b])

  console.log('Días de entrenamiento seleccionados (ordenados):', selectedDays)

  // Si no hay días seleccionados, usar un enfoque basado en la frecuencia
  if (!selectedDays.length) {
    console.log('No hay días seleccionados, usando enfoque basado en frecuencia')

    // Implementación básica para diferentes frecuencias semanales
    if (daysPerWeek <= 2) {
      // Para 1-2 días: Entrenamientos de cuerpo completo
      for (let i = 0; i < daysPerWeek; i++) {
        days.push(generateFullBodyWorkout(i + 1, planType, profile))
      }
    } else if (daysPerWeek <= 4) {
      // Para 3-4 días: División upper/lower
      for (let i = 0; i < daysPerWeek; i++) {
        if (i % 2 === 0) {
          days.push(generateUpperBodyWorkout(i + 1, planType, profile))
        } else {
          days.push(generateLowerBodyWorkout(i + 1, planType, profile))
        }
      }
    } else {
      // Para 5+ días: División por grupos musculares (PPL o similar)
      const muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos']
      for (let i = 0; i < daysPerWeek; i++) {
        if (i < muscleGroups.length) {
          days.push(generateMuscleGroupWorkout(i + 1, muscleGroups[i], planType, profile))
        } else {
          // Si hay más días que grupos musculares, añadir días de especialización
          days.push(generateSpecializationWorkout(i + 1, planType, profile))
        }
      }
    }
  } else {
    console.log('Usando días seleccionados para generar el plan')

    // Usar los días seleccionados por el usuario
    if (selectedDays.length <= 2) {
      // Para 1-2 días: Entrenamientos de cuerpo completo
      selectedDays.forEach((day, index) => {
        const workoutDay = generateFullBodyWorkout(index + 1, planType, profile)
        workoutDay.name = `${day}: Cuerpo Completo`
        days.push(workoutDay)
      })
    } else if (selectedDays.length <= 4) {
      // Para 3-4 días: División upper/lower
      selectedDays.forEach((day, index) => {
        if (index % 2 === 0) {
          const workoutDay = generateUpperBodyWorkout(index + 1, planType, profile)
          workoutDay.name = `${day}: Tren Superior`
          days.push(workoutDay)
        } else {
          const workoutDay = generateLowerBodyWorkout(index + 1, planType, profile)
          workoutDay.name = `${day}: Tren Inferior`
          days.push(workoutDay)
        }
      })
    } else {
      // Para 5+ días: Priorizar grupos musculares seleccionados
      let muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos']

      // Si hay grupos musculares prioritarios, reorganizar la lista
      if (profile.priorityMuscleGroups && profile.priorityMuscleGroups.length > 0) {
        console.log('Grupos musculares prioritarios:', profile.priorityMuscleGroups)

        // Mapear grupos musculares prioritarios a los grupos principales
        const priorityMapping: Record<string, string> = {
          'Pecho': 'Pecho',
          'Espalda': 'Espalda',
          'Hombros': 'Hombros',
          'Bíceps': 'Brazos',
          'Tríceps': 'Brazos',
          'Cuádriceps': 'Piernas',
          'Isquiotibiales': 'Piernas',
          'Glúteos': 'Piernas',
          'Pantorrillas': 'Piernas',
          'Abdominales': 'Core',
          'Core': 'Core',
          'Antebrazos': 'Brazos'
        }

        // Convertir grupos prioritarios a grupos principales
        const priorityMainGroups = profile.priorityMuscleGroups
          .map(group => priorityMapping[group] || group)
          .filter((value, index, self) => self.indexOf(value) === index) // Eliminar duplicados

        // Reorganizar la lista de grupos musculares
        muscleGroups = [
          ...priorityMainGroups,
          ...muscleGroups.filter(group => !priorityMainGroups.includes(group))
        ]

        console.log('Grupos musculares reorganizados:', muscleGroups)
      }

      selectedDays.forEach((day, index) => {
        if (index < muscleGroups.length) {
          const workoutDay = generateMuscleGroupWorkout(index + 1, muscleGroups[index], planType, profile)
          workoutDay.name = `${day}: ${muscleGroups[index]}`
          days.push(workoutDay)
        } else {
          const workoutDay = generateSpecializationWorkout(index + 1, planType, profile)
          workoutDay.name = `${day}: Especialización`
          days.push(workoutDay)
        }
      })
    }
  }

  return days
}

/**
 * Genera un entrenamiento de cuerpo completo
 */
function generateFullBodyWorkout(dayNumber: number, planType: string, profile: TrainingProfile): WorkoutDay {
  // Implementación básica
  return {
    id: crypto.randomUUID(),
    name: `Día ${dayNumber}: Cuerpo Completo`,
    description: 'Entrenamiento que trabaja todos los grupos musculares principales',
    targetMuscleGroups: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos'],
    exercises: generateExercisesForFullBody(planType, profile),
    restDay: false,
    notes: 'Realiza un calentamiento adecuado antes de comenzar'
  }
}

/**
 * Genera un entrenamiento de tren superior
 */
function generateUpperBodyWorkout(dayNumber: number, planType: string, profile: TrainingProfile): WorkoutDay {
  return {
    id: crypto.randomUUID(),
    name: `Día ${dayNumber}: Tren Superior`,
    description: 'Entrenamiento enfocado en los músculos de la parte superior del cuerpo',
    targetMuscleGroups: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    exercises: generateExercisesForUpperBody(planType, profile),
    restDay: false,
    notes: 'Enfócate en la conexión mente-músculo'
  }
}

/**
 * Genera un entrenamiento de tren inferior
 */
function generateLowerBodyWorkout(dayNumber: number, planType: string, profile: TrainingProfile): WorkoutDay {
  return {
    id: crypto.randomUUID(),
    name: `Día ${dayNumber}: Tren Inferior`,
    description: 'Entrenamiento enfocado en los músculos de la parte inferior del cuerpo',
    targetMuscleGroups: ['Piernas', 'Glúteos', 'Core'],
    exercises: generateExercisesForLowerBody(planType, profile),
    restDay: false,
    notes: 'Asegúrate de mantener una buena técnica en todos los ejercicios'
  }
}

/**
 * Genera un entrenamiento para un grupo muscular específico
 */
function generateMuscleGroupWorkout(dayNumber: number, muscleGroup: string, planType: string, profile: TrainingProfile): WorkoutDay {
  return {
    id: crypto.randomUUID(),
    name: `Día ${dayNumber}: ${muscleGroup}`,
    description: `Entrenamiento enfocado en ${muscleGroup.toLowerCase()}`,
    targetMuscleGroups: [muscleGroup],
    exercises: generateExercisesForMuscleGroup(muscleGroup, planType, profile),
    restDay: false,
    notes: 'Busca la progresión en cada ejercicio'
  }
}

/**
 * Genera un entrenamiento de especialización
 */
function generateSpecializationWorkout(dayNumber: number, planType: string, profile: TrainingProfile): WorkoutDay {
  // Por defecto, especialización en puntos débiles o grupos musculares rezagados
  return {
    id: crypto.randomUUID(),
    name: `Día ${dayNumber}: Especialización`,
    description: 'Entrenamiento enfocado en mejorar puntos débiles',
    targetMuscleGroups: ['Varios'],
    exercises: generateExercisesForSpecialization(planType, profile),
    restDay: false,
    notes: 'Este día está diseñado para trabajar en tus puntos débiles'
  }
}

// Funciones auxiliares para generar ejercicios (implementación básica)
function generateExercisesForFullBody(planType: string, profile: TrainingProfile): WorkoutExercise[] {
  // Implementación básica con ejercicios genéricos
  return [
    createExercise('Sentadilla', 'Piernas', 3, 8, 12),
    createExercise('Press de Banca', 'Pecho', 3, 8, 12),
    createExercise('Remo con Barra', 'Espalda', 3, 8, 12),
    createExercise('Press Militar', 'Hombros', 3, 8, 12),
    createExercise('Curl de Bíceps', 'Brazos', 3, 8, 12),
    createExercise('Extensión de Tríceps', 'Brazos', 3, 8, 12)
  ]
}

function generateExercisesForUpperBody(planType: string, profile: TrainingProfile): WorkoutExercise[] {
  return [
    createExercise('Press de Banca', 'Pecho', 4, 8, 12),
    createExercise('Aperturas con Mancuernas', 'Pecho', 3, 10, 15),
    createExercise('Dominadas', 'Espalda', 4, 6, 10),
    createExercise('Remo con Mancuerna', 'Espalda', 3, 10, 15),
    createExercise('Press Militar', 'Hombros', 4, 8, 12),
    createExercise('Elevaciones Laterales', 'Hombros', 3, 12, 15),
    createExercise('Curl de Bíceps', 'Brazos', 3, 10, 15),
    createExercise('Extensión de Tríceps', 'Brazos', 3, 10, 15)
  ]
}

function generateExercisesForLowerBody(planType: string, profile: TrainingProfile): WorkoutExercise[] {
  return [
    createExercise('Sentadilla', 'Piernas', 4, 8, 12),
    createExercise('Peso Muerto', 'Piernas', 4, 6, 10),
    createExercise('Extensión de Cuádriceps', 'Piernas', 3, 10, 15),
    createExercise('Curl de Isquiotibiales', 'Piernas', 3, 10, 15),
    createExercise('Elevación de Pantorrillas', 'Piernas', 4, 12, 20),
    createExercise('Hip Thrust', 'Glúteos', 4, 10, 15),
    createExercise('Plancha', 'Core', 3, 30, 60) // Segundos en lugar de repeticiones
  ]
}

function generateExercisesForMuscleGroup(muscleGroup: string, planType: string, profile: TrainingProfile): WorkoutExercise[] {
  // Implementación básica según el grupo muscular
  switch (muscleGroup) {
    case 'Pecho':
      return [
        createExercise('Press de Banca', 'Pecho', 4, 8, 12),
        createExercise('Press Inclinado', 'Pecho', 4, 8, 12),
        createExercise('Aperturas con Mancuernas', 'Pecho', 3, 10, 15),
        createExercise('Fondos', 'Pecho', 3, 8, 12),
        createExercise('Pullover', 'Pecho', 3, 10, 15)
      ]
    case 'Espalda':
      return [
        createExercise('Dominadas', 'Espalda', 4, 6, 10),
        createExercise('Remo con Barra', 'Espalda', 4, 8, 12),
        createExercise('Remo con Mancuerna', 'Espalda', 3, 10, 15),
        createExercise('Jalón al Pecho', 'Espalda', 3, 10, 15),
        createExercise('Hiperextensiones', 'Espalda', 3, 12, 15)
      ]
    case 'Piernas':
      return [
        createExercise('Sentadilla', 'Piernas', 4, 8, 12),
        createExercise('Peso Muerto', 'Piernas', 4, 6, 10),
        createExercise('Prensa de Piernas', 'Piernas', 3, 10, 15),
        createExercise('Extensión de Cuádriceps', 'Piernas', 3, 10, 15),
        createExercise('Curl de Isquiotibiales', 'Piernas', 3, 10, 15),
        createExercise('Elevación de Pantorrillas', 'Piernas', 4, 12, 20)
      ]
    case 'Hombros':
      return [
        createExercise('Press Militar', 'Hombros', 4, 8, 12),
        createExercise('Elevaciones Laterales', 'Hombros', 4, 12, 15),
        createExercise('Elevaciones Frontales', 'Hombros', 3, 12, 15),
        createExercise('Remo al Mentón', 'Hombros', 3, 10, 15),
        createExercise('Pájaros', 'Hombros', 3, 12, 15)
      ]
    case 'Brazos':
      return [
        createExercise('Curl de Bíceps con Barra', 'Brazos', 4, 8, 12),
        createExercise('Curl de Bíceps con Mancuernas', 'Brazos', 3, 10, 15),
        createExercise('Curl Martillo', 'Brazos', 3, 10, 15),
        createExercise('Extensión de Tríceps', 'Brazos', 4, 10, 15),
        createExercise('Fondos para Tríceps', 'Brazos', 3, 8, 12),
        createExercise('Press Francés', 'Brazos', 3, 10, 15)
      ]
    default:
      return generateExercisesForFullBody(planType, profile)
  }
}

function generateExercisesForSpecialization(planType: string, profile: TrainingProfile): WorkoutExercise[] {
  // Por defecto, ejercicios variados para trabajar puntos débiles
  return [
    createExercise('Sentadilla Búlgara', 'Piernas', 4, 8, 12),
    createExercise('Press de Banca Cerrado', 'Pecho', 4, 8, 12),
    createExercise('Face Pull', 'Hombros', 3, 12, 15),
    createExercise('Curl de Muñecas', 'Antebrazos', 3, 15, 20),
    createExercise('Plancha Lateral', 'Core', 3, 30, 60) // Segundos en lugar de repeticiones
  ]
}

/**
 * Crea un objeto de ejercicio con valores predeterminados
 */
function createExercise(name: string, muscleGroup: string, sets: number, repsMin: number, repsMax: number): WorkoutExercise {
  return {
    id: crypto.randomUUID(),
    name,
    muscleGroup,
    sets,
    repsMin,
    repsMax,
    rest: 90, // 90 segundos por defecto
    tempo: "2-0-2-0", // Tempo neutral por defecto
    weight: 0, // Peso a determinar por el usuario
    rir: 2, // 2 repeticiones en reserva por defecto
    notes: "",
    superset: false,
    supersetWith: ""
  }
}

/**
 * Traduce el objetivo a español para mostrar en la UI
 */
function translateGoal(goal: string): string {
  const translations: Record<string, string> = {
    'fat_loss': 'Pérdida de Grasa',
    'muscle_gain': 'Ganancia Muscular',
    'strength': 'Fuerza',
    'endurance': 'Resistencia',
    'general_fitness': 'Fitness General',
    'athletic_performance': 'Rendimiento Atlético',
    'mobility': 'Movilidad',
    'toning': 'Tonificación'
  }

  return translations[goal] || 'Fitness General'
}
