import { supabase } from "@/lib/supabase-client"

// Tipos para el servicio de análisis de productividad
export interface ProductivityProfile {
  userId: string
  workHours: {
    startTime: string
    endTime: string
    totalHours: number
  }
  breakHabits: {
    frequency: string
    duration: number
  }
  timeManagement: {
    planningHabit: string
    taskPrioritization: string
    deadlineManagement: string
  }
  distractions: string[]
  energyLevels: {
    morning: number
    afternoon: number
    evening: number
    peakTimeOfDay: 'morning' | 'afternoon' | 'evening'
  }
  focusDuration: number
  tools: string[]
  productivityGoal: string
  lastUpdated: string
}

export interface ProductivityScore {
  overall: number // 0-100
  timeManagement: number // 0-100
  focusQuality: number // 0-100
  workLifeBalance: number // 0-100
  toolEfficiency: number // 0-100
}

export interface ProductivityRecommendation {
  id: string
  category: 'time_management' | 'focus' | 'energy' | 'tools' | 'habits' | 'environment'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  implementationDifficulty: 'easy' | 'moderate' | 'challenging'
  expectedImpact: 'high' | 'medium' | 'low'
}

/**
 * Obtiene el perfil de productividad del usuario
 */
export async function getProductivityProfile(userId: string) {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('productivity_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        // Tabla no existe o no se encontraron filas
        console.log('No se encontró perfil de productividad, generando perfil por defecto')
        return { data: generateDefaultProductivityProfile(userId), error: null }
      }
      
      console.error('Error al obtener perfil de productividad:', error)
      return { data: null, error }
    }
    
    if (data) {
      // Transformar datos al formato de la aplicación
      const assessmentData = data.assessment_data
      
      // Extraer distracciones
      const distractions: string[] = []
      if (assessmentData.phoneDistraction) distractions.push('phone')
      if (assessmentData.socialMediaDistraction) distractions.push('social_media')
      if (assessmentData.emailDistraction) distractions.push('email')
      if (assessmentData.colleaguesDistraction) distractions.push('colleagues')
      if (assessmentData.noiseDistraction) distractions.push('noise')
      
      // Extraer herramientas
      const tools: string[] = []
      if (assessmentData.usesToDoList) tools.push('todo_list')
      if (assessmentData.usesCalendar) tools.push('calendar')
      if (assessmentData.usesTimeBlocking) tools.push('time_blocking')
      if (assessmentData.usesPomodoro) tools.push('pomodoro')
      if (assessmentData.usesDigitalTools) tools.push('digital_tools')
      
      // Determinar el momento del día con más energía
      const energyLevels = {
        morning: assessmentData.energyMorning || 3,
        afternoon: assessmentData.energyAfternoon || 3,
        evening: assessmentData.energyEvening || 2,
        peakTimeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening'
      }
      
      if (energyLevels.afternoon > energyLevels.morning && energyLevels.afternoon >= energyLevels.evening) {
        energyLevels.peakTimeOfDay = 'afternoon'
      } else if (energyLevels.evening > energyLevels.morning && energyLevels.evening > energyLevels.afternoon) {
        energyLevels.peakTimeOfDay = 'evening'
      }
      
      // Calcular horas totales de trabajo
      const startTime = assessmentData.workStartTime || '09:00'
      const endTime = assessmentData.workEndTime || '17:00'
      
      const startHours = parseInt(startTime.split(':')[0])
      const startMinutes = parseInt(startTime.split(':')[1])
      const endHours = parseInt(endTime.split(':')[0])
      const endMinutes = parseInt(endTime.split(':')[1])
      
      const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)
      const totalHours = Math.round(totalMinutes / 60 * 10) / 10 // Redondear a 1 decimal
      
      const productivityProfile: ProductivityProfile = {
        userId,
        workHours: {
          startTime,
          endTime,
          totalHours
        },
        breakHabits: {
          frequency: assessmentData.breaksFrequency || 'sometimes',
          duration: assessmentData.breakDuration || 15
        },
        timeManagement: {
          planningHabit: assessmentData.planningHabit || 'sometimes',
          taskPrioritization: assessmentData.taskPrioritization || 'sometimes',
          deadlineManagement: assessmentData.deadlineManagement || 'fair'
        },
        distractions,
        energyLevels,
        focusDuration: assessmentData.concentrationDuration || 45,
        tools,
        productivityGoal: assessmentData.productivityGoal || 'better_focus',
        lastUpdated: data.created_at
      }
      
      return { data: productivityProfile, error: null }
    }
    
    // Si no hay datos, generar perfil por defecto
    return { data: generateDefaultProductivityProfile(userId), error: null }
  } catch (error) {
    console.error('Error en getProductivityProfile:', error)
    return { data: generateDefaultProductivityProfile(userId), error }
  }
}

/**
 * Calcula la puntuación de productividad basada en el perfil
 */
export function calculateProductivityScore(profile: ProductivityProfile): ProductivityScore {
  // Puntuación de gestión del tiempo (0-100)
  let timeManagementScore = 0
  
  // Componente de planificación
  switch (profile.timeManagement.planningHabit) {
    case 'daily':
      timeManagementScore += 25
      break
    case 'often':
      timeManagementScore += 20
      break
    case 'sometimes':
      timeManagementScore += 15
      break
    case 'rarely':
      timeManagementScore += 10
      break
    case 'never':
      timeManagementScore += 5
      break
  }
  
  // Componente de priorización
  switch (profile.timeManagement.taskPrioritization) {
    case 'always':
      timeManagementScore += 25
      break
    case 'often':
      timeManagementScore += 20
      break
    case 'sometimes':
      timeManagementScore += 15
      break
    case 'rarely':
      timeManagementScore += 10
      break
    case 'never':
      timeManagementScore += 5
      break
  }
  
  // Componente de gestión de plazos
  switch (profile.timeManagement.deadlineManagement) {
    case 'very_good':
      timeManagementScore += 25
      break
    case 'good':
      timeManagementScore += 20
      break
    case 'fair':
      timeManagementScore += 15
      break
    case 'poor':
      timeManagementScore += 10
      break
    case 'very_poor':
      timeManagementScore += 5
      break
  }
  
  // Componente de herramientas de gestión del tiempo
  const timeManagementTools = profile.tools.filter(tool => 
    ['calendar', 'time_blocking', 'todo_list'].includes(tool)
  ).length
  
  timeManagementScore += timeManagementTools * 8 // Máximo 24 puntos adicionales
  
  // Ajustar al máximo de 100
  timeManagementScore = Math.min(100, timeManagementScore)
  
  // Puntuación de calidad de concentración (0-100)
  let focusQualityScore = 0
  
  // Componente de duración de concentración
  if (profile.focusDuration >= 90) {
    focusQualityScore += 40
  } else if (profile.focusDuration >= 60) {
    focusQualityScore += 30
  } else if (profile.focusDuration >= 45) {
    focusQualityScore += 25
  } else if (profile.focusDuration >= 30) {
    focusQualityScore += 20
  } else if (profile.focusDuration >= 15) {
    focusQualityScore += 15
  } else {
    focusQualityScore += 10
  }
  
  // Componente de distracciones (menos distracciones = mejor puntuación)
  const distractionPenalty = profile.distractions.length * 5
  focusQualityScore += Math.max(0, 30 - distractionPenalty)
  
  // Componente de técnicas de concentración
  if (profile.tools.includes('pomodoro')) {
    focusQualityScore += 15
  }
  
  // Componente de frecuencia de descansos
  switch (profile.breakHabits.frequency) {
    case 'very_often':
    case 'often':
      focusQualityScore += 15
      break
    case 'sometimes':
      focusQualityScore += 10
      break
    case 'rarely':
    case 'never':
      focusQualityScore += 5
      break
  }
  
  // Ajustar al máximo de 100
  focusQualityScore = Math.min(100, focusQualityScore)
  
  // Puntuación de equilibrio trabajo-vida (0-100)
  let workLifeBalanceScore = 0
  
  // Componente de horas de trabajo (ideal: 7-9 horas)
  if (profile.workHours.totalHours <= 8) {
    workLifeBalanceScore += 40
  } else if (profile.workHours.totalHours <= 9) {
    workLifeBalanceScore += 35
  } else if (profile.workHours.totalHours <= 10) {
    workLifeBalanceScore += 25
  } else {
    workLifeBalanceScore += 15
  }
  
  // Componente de descansos
  if (profile.breakHabits.frequency === 'very_often' || profile.breakHabits.frequency === 'often') {
    workLifeBalanceScore += 30
  } else if (profile.breakHabits.frequency === 'sometimes') {
    workLifeBalanceScore += 20
  } else {
    workLifeBalanceScore += 10
  }
  
  // Componente de duración de descansos
  if (profile.breakHabits.duration >= 15) {
    workLifeBalanceScore += 30
  } else if (profile.breakHabits.duration >= 10) {
    workLifeBalanceScore += 20
  } else {
    workLifeBalanceScore += 10
  }
  
  // Ajustar al máximo de 100
  workLifeBalanceScore = Math.min(100, workLifeBalanceScore)
  
  // Puntuación de eficiencia de herramientas (0-100)
  const toolEfficiencyScore = Math.min(100, profile.tools.length * 20)
  
  // Puntuación general (promedio ponderado)
  const overall = Math.round(
    (timeManagementScore * 0.3) +
    (focusQualityScore * 0.3) +
    (workLifeBalanceScore * 0.2) +
    (toolEfficiencyScore * 0.2)
  )
  
  return {
    overall,
    timeManagement: timeManagementScore,
    focusQuality: focusQualityScore,
    workLifeBalance: workLifeBalanceScore,
    toolEfficiency: toolEfficiencyScore
  }
}

/**
 * Genera recomendaciones personalizadas basadas en el perfil de productividad
 */
export function generateProductivityRecommendations(profile: ProductivityProfile): ProductivityRecommendation[] {
  const recommendations: ProductivityRecommendation[] = []
  
  // Recomendaciones basadas en la gestión del tiempo
  if (profile.timeManagement.planningHabit === 'never' || profile.timeManagement.planningHabit === 'rarely') {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'time_management',
      title: 'Implementa planificación diaria',
      description: 'Dedica 10-15 minutos cada mañana (o la noche anterior) a planificar tu día. Identifica tus 3 tareas más importantes y programa cuándo las harás.',
      priority: 'high',
      implementationDifficulty: 'easy',
      expectedImpact: 'high'
    })
  }
  
  if (profile.timeManagement.taskPrioritization === 'never' || profile.timeManagement.taskPrioritization === 'rarely') {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'time_management',
      title: 'Utiliza la matriz de Eisenhower',
      description: 'Clasifica tus tareas en cuatro cuadrantes: Urgente e Importante, No Urgente pero Importante, Urgente pero No Importante, y Ni Urgente Ni Importante. Enfócate primero en el cuadrante "Importante pero No Urgente".',
      priority: 'high',
      implementationDifficulty: 'moderate',
      expectedImpact: 'high'
    })
  }
  
  // Recomendaciones basadas en la concentración
  if (profile.focusDuration < 45) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'focus',
      title: 'Técnica Pomodoro',
      description: 'Trabaja en intervalos de 25 minutos con descansos de 5 minutos entre ellos. Después de 4 intervalos, toma un descanso más largo de 15-30 minutos.',
      priority: 'high',
      implementationDifficulty: 'easy',
      expectedImpact: 'high'
    })
  }
  
  if (profile.distractions.includes('phone')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'environment',
      title: 'Modo "No molestar" en el teléfono',
      description: 'Activa el modo "No molestar" en tu teléfono durante los períodos de trabajo concentrado. Considera usar aplicaciones que bloqueen las distracciones.',
      priority: 'high',
      implementationDifficulty: 'easy',
      expectedImpact: 'high'
    })
  }
  
  if (profile.distractions.includes('social_media')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'habits',
      title: 'Programa tiempo específico para redes sociales',
      description: 'En lugar de revisar las redes sociales constantemente, programa 2-3 momentos específicos al día para hacerlo. Usa extensiones de navegador para bloquear estas páginas durante tus horas de trabajo.',
      priority: 'medium',
      implementationDifficulty: 'moderate',
      expectedImpact: 'high'
    })
  }
  
  // Recomendaciones basadas en la energía
  recommendations.push({
    id: crypto.randomUUID(),
    category: 'energy',
    title: `Aprovecha tu pico de energía (${translateTimeOfDay(profile.energyLevels.peakTimeOfDay)})`,
    description: `Programa tus tareas más importantes y que requieren mayor concentración durante la ${translateTimeOfDay(profile.energyLevels.peakTimeOfDay)}, cuando tu nivel de energía es más alto.`,
    priority: 'medium',
    implementationDifficulty: 'easy',
    expectedImpact: 'high'
  })
  
  // Recomendaciones basadas en herramientas
  if (!profile.tools.includes('calendar')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'tools',
      title: 'Utiliza un calendario digital',
      description: 'Implementa un calendario digital (Google Calendar, Outlook, etc.) para programar tus actividades, establecer recordatorios y visualizar mejor tu tiempo disponible.',
      priority: 'medium',
      implementationDifficulty: 'easy',
      expectedImpact: 'medium'
    })
  }
  
  if (!profile.tools.includes('time_blocking')) {
    recommendations.push({
      id: crypto.randomUUID(),
      category: 'time_management',
      title: 'Implementa el bloqueo de tiempo',
      description: 'Reserva bloques específicos de tiempo en tu calendario para diferentes tipos de tareas. Esto te ayuda a enfocarte en una sola cosa y evitar el multitasking.',
      priority: 'medium',
      implementationDifficulty: 'moderate',
      expectedImpact: 'high'
    })
  }
  
  // Recomendaciones basadas en el objetivo principal
  switch (profile.productivityGoal) {
    case 'better_focus':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'environment',
        title: 'Crea un espacio de trabajo sin distracciones',
        description: 'Designa un espacio específico para el trabajo, libre de distracciones. Mantén tu escritorio ordenado y considera usar auriculares con cancelación de ruido.',
        priority: 'high',
        implementationDifficulty: 'moderate',
        expectedImpact: 'high'
      })
      break
    case 'time_management':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'time_management',
        title: 'Auditoría semanal de tiempo',
        description: 'Dedica 30 minutos cada semana a revisar cómo has usado tu tiempo. Identifica patrones, actividades que consumen demasiado tiempo y oportunidades de mejora.',
        priority: 'high',
        implementationDifficulty: 'moderate',
        expectedImpact: 'high'
      })
      break
    case 'work_life_balance':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'habits',
        title: 'Establece límites claros',
        description: 'Define horarios específicos para comenzar y terminar tu jornada laboral. Comunica estos límites a colegas y familiares, y respétalos tú mismo.',
        priority: 'high',
        implementationDifficulty: 'challenging',
        expectedImpact: 'high'
      })
      break
    case 'reduce_procrastination':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'habits',
        title: 'Técnica de los 2 minutos',
        description: 'Si una tarea toma menos de 2 minutos, hazla inmediatamente en lugar de posponerla. Para tareas más grandes, comprométete a trabajar solo 5 minutos en ellas - a menudo, una vez que empiezas, es más fácil continuar.',
        priority: 'high',
        implementationDifficulty: 'easy',
        expectedImpact: 'high'
      })
      break
    case 'increase_energy':
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'energy',
        title: 'Implementa descansos activos',
        description: 'En lugar de revisar el teléfono durante los descansos, haz una actividad física breve: estiramientos, una caminata corta o ejercicios de respiración. Esto ayuda a recargar tu energía mental.',
        priority: 'high',
        implementationDifficulty: 'easy',
        expectedImpact: 'high'
      })
      break
  }
  
  return recommendations
}

/**
 * Genera un perfil de productividad por defecto
 */
function generateDefaultProductivityProfile(userId: string): ProductivityProfile {
  return {
    userId,
    workHours: {
      startTime: "09:00",
      endTime: "17:00",
      totalHours: 8
    },
    breakHabits: {
      frequency: 'sometimes',
      duration: 15
    },
    timeManagement: {
      planningHabit: 'sometimes',
      taskPrioritization: 'sometimes',
      deadlineManagement: 'fair'
    },
    distractions: ['phone', 'social_media'],
    energyLevels: {
      morning: 4,
      afternoon: 3,
      evening: 2,
      peakTimeOfDay: 'morning'
    },
    focusDuration: 45,
    tools: ['todo_list', 'calendar'],
    productivityGoal: 'better_focus',
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Traduce el momento del día a español
 */
function translateTimeOfDay(timeOfDay: 'morning' | 'afternoon' | 'evening'): string {
  switch (timeOfDay) {
    case 'morning':
      return 'mañana'
    case 'afternoon':
      return 'tarde'
    case 'evening':
      return 'noche'
  }
}
