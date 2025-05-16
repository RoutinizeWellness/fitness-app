import { v4 as uuidv4 } from 'uuid'
import { Habit } from './habits-service'
import { MindfulnessExercise } from './mindfulness-service'
import { CorporateWellnessProgram, CorporateChallenge } from './corporate-wellness-service'
import { WorkScheduleTemplate } from './habits-service'

/**
 * Datos de ejemplo para hábitos
 */
export const getSampleHabits = (userId: string): Habit[] => {
  return [
    {
      id: uuidv4(),
      userId,
      title: 'Meditación matutina',
      description: '10 minutos de meditación para empezar el día con claridad mental',
      category: 'morning_routine',
      frequency: ['daily'],
      timeOfDay: '07:00',
      duration: 10,
      reminder: true,
      reminderTime: '15min_before',
      streak: 3,
      longestStreak: 5,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: 'Revisar correos',
      description: 'Revisar y responder correos importantes',
      category: 'work',
      frequency: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeOfDay: '09:30',
      duration: 30,
      reminder: true,
      reminderTime: '15min_before',
      streak: 1,
      longestStreak: 10,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: 'Ejercicio',
      description: '30 minutos de actividad física',
      category: 'health',
      frequency: ['monday', 'wednesday', 'friday'],
      timeOfDay: '18:00',
      duration: 30,
      reminder: true,
      reminderTime: '30min_before',
      streak: 0,
      longestStreak: 8,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: 'Lectura antes de dormir',
      description: '20 minutos de lectura para relajarse',
      category: 'evening',
      frequency: ['daily'],
      timeOfDay: '22:00',
      duration: 20,
      reminder: true,
      reminderTime: '15min_before',
      streak: 5,
      longestStreak: 15,
      startDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

/**
 * Datos de ejemplo para plantillas de horarios españoles
 */
export const getSampleWorkScheduleTemplates = (): WorkScheduleTemplate[] => {
  return [
    {
      id: uuidv4(),
      name: 'Horario estándar español',
      description: 'Horario laboral típico español con pausa para comida',
      schedule: {
        monday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        tuesday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        wednesday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        thursday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
        friday: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }]
      },
      isSpanish: true,
      includesSiesta: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Horario con siesta',
      description: 'Horario laboral español con pausa para comida y siesta',
      schedule: {
        monday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        tuesday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        wednesday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        thursday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }],
        friday: [{ start: '09:00', end: '14:00' }, { start: '16:30', end: '19:30' }]
      },
      isSpanish: true,
      includesSiesta: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Jornada intensiva',
      description: 'Horario laboral español de jornada continua',
      schedule: {
        monday: [{ start: '08:00', end: '15:00' }],
        tuesday: [{ start: '08:00', end: '15:00' }],
        wednesday: [{ start: '08:00', end: '15:00' }],
        thursday: [{ start: '08:00', end: '15:00' }],
        friday: [{ start: '08:00', end: '15:00' }]
      },
      isSpanish: true,
      includesSiesta: false,
      createdAt: new Date().toISOString()
    }
  ]
}

/**
 * Datos de ejemplo para ejercicios de mindfulness
 */
export const getSampleMindfulnessExercises = (): MindfulnessExercise[] => {
  return [
    {
      id: uuidv4(),
      title: 'Respiración 4-7-8',
      description: 'Técnica de respiración para reducir el estrés y la ansiedad',
      category: 'breathing',
      duration: 5,
      difficulty: 'beginner',
      instructions: [
        { text: 'Siéntate en una posición cómoda con la espalda recta', duration: 30 },
        { text: 'Inhala por la nariz durante 4 segundos', duration: 4 },
        { text: 'Mantén la respiración durante 7 segundos', duration: 7 },
        { text: 'Exhala completamente por la boca durante 8 segundos', duration: 8 },
        { text: 'Repite el ciclo 4 veces', duration: 76 }
      ],
      benefits: ['Reduce estrés', 'Mejora el sueño', 'Disminuye ansiedad'],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Meditación de atención plena',
      description: 'Práctica de mindfulness para estar presente en el momento',
      category: 'meditation',
      duration: 10,
      difficulty: 'beginner',
      instructions: [
        { text: 'Siéntate en una posición cómoda con la espalda recta', duration: 30 },
        { text: 'Cierra los ojos y respira naturalmente', duration: 30 },
        { text: 'Centra tu atención en tu respiración', duration: 60 },
        { text: 'Observa cómo el aire entra y sale de tu cuerpo', duration: 120 },
        { text: 'Si tu mente divaga, vuelve suavemente a la respiración', duration: 180 },
        { text: 'Continúa observando tu respiración sin juzgar', duration: 180 }
      ],
      benefits: ['Mejora concentración', 'Reduce estrés', 'Aumenta autoconciencia'],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Visualización de lugar seguro',
      description: 'Técnica de visualización para reducir el estrés',
      category: 'visualization',
      duration: 8,
      difficulty: 'beginner',
      instructions: [
        { text: 'Siéntate o recuéstate en una posición cómoda', duration: 30 },
        { text: 'Cierra los ojos y respira profundamente', duration: 30 },
        { text: 'Imagina un lugar donde te sientas completamente seguro y en paz', duration: 60 },
        { text: 'Observa los detalles: colores, sonidos, olores, texturas', duration: 120 },
        { text: 'Siente la paz y seguridad de este lugar', duration: 120 },
        { text: 'Permanece en este lugar seguro, disfrutando de la sensación', duration: 120 }
      ],
      benefits: ['Reduce ansiedad', 'Promueve relajación', 'Mejora estado de ánimo'],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Body scan',
      description: 'Técnica de relajación progresiva para reducir tensión física',
      category: 'body_scan',
      duration: 15,
      difficulty: 'intermediate',
      instructions: [
        { text: 'Recuéstate en una posición cómoda', duration: 30 },
        { text: 'Cierra los ojos y respira profundamente', duration: 30 },
        { text: 'Lleva tu atención a los pies y observa las sensaciones', duration: 60 },
        { text: 'Sube gradualmente por las piernas, observando cada parte', duration: 120 },
        { text: 'Continúa subiendo por el torso, brazos y hombros', duration: 120 },
        { text: 'Finaliza con el cuello, cara y cabeza', duration: 120 },
        { text: 'Observa todo tu cuerpo como una unidad', duration: 60 },
        { text: 'Respira profundamente y abre los ojos lentamente', duration: 30 }
      ],
      benefits: ['Reduce tensión muscular', 'Mejora conciencia corporal', 'Promueve relajación profunda'],
      createdAt: new Date().toISOString()
    }
  ]
}

/**
 * Datos de ejemplo para programas de bienestar corporativo
 */
export const getSampleCorporateWellnessPrograms = (companyId: string): CorporateWellnessProgram[] => {
  return [
    {
      id: uuidv4(),
      companyId,
      name: 'Bienestar en el trabajo',
      description: 'Programa para mejorar el bienestar de los empleados',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      goals: {
        sleep_improvement: 20,
        stress_reduction: 30,
        activity_increase: 25
      },
      participantsCount: 42,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

/**
 * Datos de ejemplo para retos corporativos
 */
export const getSampleCorporateChallenges = (programId: string): CorporateChallenge[] => {
  return [
    {
      id: uuidv4(),
      programId,
      title: '10,000 pasos diarios',
      description: 'Alcanza un promedio de 10,000 pasos diarios durante una semana',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      challengeType: 'steps',
      targetValue: 10000,
      reward: 'Día libre adicional',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      programId,
      title: 'Meditación diaria',
      description: 'Completa 5 sesiones de meditación de al menos 10 minutos',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      challengeType: 'stress',
      targetValue: 5,
      reward: 'Sesión de masaje',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      programId,
      title: 'Mejora del sueño',
      description: 'Logra un promedio de 7 horas de sueño durante dos semanas',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      challengeType: 'sleep',
      targetValue: 7,
      reward: 'Auriculares con cancelación de ruido',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]
}

/**
 * Datos de ejemplo para estadísticas anónimas de bienestar corporativo
 */
export const getSampleCorporateWellnessStats = (companyId: string) => {
  return {
    id: uuidv4(),
    companyId,
    date: new Date().toISOString(),
    statsType: 'summary',
    statsData: {
      sleep_optimal_percentage: 68,
      stress_reduction: 15,
      stress_absences_reduction: 22,
      popular_challenges: [
        {
          title: '10,000 pasos diarios',
          type: 'steps',
          participants: 38,
          completion_rate: 72
        },
        {
          title: 'Meditación diaria',
          type: 'stress',
          participants: 25,
          completion_rate: 64
        },
        {
          title: 'Mejora del sueño',
          type: 'sleep',
          participants: 31,
          completion_rate: 58
        }
      ]
    },
    createdAt: new Date().toISOString()
  }
}
