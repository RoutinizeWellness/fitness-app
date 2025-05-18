import { supabase } from "@/lib/supabase-client"
import { getEnhancedUserProfile } from "@/lib/services/user-profile-service"

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  category: "fitness" | "nutrition" | "wellness" | "custom"
  type: "habit" | "milestone" | "challenge"
  targetValue?: number
  currentValue?: number
  unit?: string
  startDate: string
  targetDate?: string
  completedDate?: string
  status: "not_started" | "in_progress" | "completed" | "failed" | "abandoned"
  priority: "low" | "medium" | "high"
  frequency?: "daily" | "weekly" | "monthly" | "once"
  reminderEnabled: boolean
  reminderTime?: string
  reminderDays?: string[]
  tags: string[]
  relatedGoals?: string[]
  milestones?: {
    id: string
    title: string
    targetValue?: number
    completed: boolean
    completedDate?: string
  }[]
  progress: number // 0-100
  streakCurrent: number
  streakLongest: number
  metadata?: any
}

export interface GoalTemplate {
  id: string
  title: string
  description: string
  category: "fitness" | "nutrition" | "wellness" | "custom"
  type: "habit" | "milestone" | "challenge"
  defaultTargetValue?: number
  unit?: string
  defaultDuration?: number // días
  suggestedFrequency?: "daily" | "weekly" | "monthly" | "once"
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  defaultMilestones?: {
    title: string
    targetValue?: number
  }[]
  metadata?: any
}

/**
 * Obtiene los objetivos del usuario
 */
export async function getUserGoals(
  userId: string,
  filters: {
    category?: string
    status?: string
    priority?: string
    search?: string
  } = {}
): Promise<Goal[]> {
  try {
    let query = supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
    
    // Aplicar filtros
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    // Ordenar por prioridad y fecha de inicio
    query = query.order('priority', { ascending: false }).order('start_date', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error al obtener objetivos del usuario:', error)
      return []
    }
    
    // Transformar los datos al formato de la interfaz Goal
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      description: item.description,
      category: item.category,
      type: item.type,
      targetValue: item.target_value,
      currentValue: item.current_value,
      unit: item.unit,
      startDate: item.start_date,
      targetDate: item.target_date,
      completedDate: item.completed_date,
      status: item.status,
      priority: item.priority,
      frequency: item.frequency,
      reminderEnabled: item.reminder_enabled,
      reminderTime: item.reminder_time,
      reminderDays: item.reminder_days,
      tags: item.tags,
      relatedGoals: item.related_goals,
      milestones: item.milestones,
      progress: item.progress,
      streakCurrent: item.streak_current,
      streakLongest: item.streak_longest,
      metadata: item.metadata
    }))
  } catch (error) {
    console.error('Error inesperado al obtener objetivos del usuario:', error)
    return []
  }
}

/**
 * Obtiene un objetivo específico del usuario
 */
export async function getUserGoal(userId: string, goalId: string): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('id', goalId)
      .single()
    
    if (error) {
      console.error('Error al obtener objetivo del usuario:', error)
      return null
    }
    
    // Transformar los datos al formato de la interfaz Goal
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      startDate: data.start_date,
      targetDate: data.target_date,
      completedDate: data.completed_date,
      status: data.status,
      priority: data.priority,
      frequency: data.frequency,
      reminderEnabled: data.reminder_enabled,
      reminderTime: data.reminder_time,
      reminderDays: data.reminder_days,
      tags: data.tags,
      relatedGoals: data.related_goals,
      milestones: data.milestones,
      progress: data.progress,
      streakCurrent: data.streak_current,
      streakLongest: data.streak_longest,
      metadata: data.metadata
    }
  } catch (error) {
    console.error('Error inesperado al obtener objetivo del usuario:', error)
    return null
  }
}

/**
 * Crea un nuevo objetivo para el usuario
 */
export async function createUserGoal(userId: string, goal: Omit<Goal, "id" | "userId" | "progress" | "streakCurrent" | "streakLongest">): Promise<Goal | null> {
  try {
    // Calcular el progreso inicial
    let initialProgress = 0
    if (goal.currentValue !== undefined && goal.targetValue !== undefined && goal.targetValue > 0) {
      initialProgress = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
    }
    
    // Preparar los datos para guardar
    const goalData = {
      user_id: userId,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      type: goal.type,
      target_value: goal.targetValue,
      current_value: goal.currentValue || 0,
      unit: goal.unit,
      start_date: goal.startDate,
      target_date: goal.targetDate,
      completed_date: goal.completedDate,
      status: goal.status || "not_started",
      priority: goal.priority,
      frequency: goal.frequency,
      reminder_enabled: goal.reminderEnabled,
      reminder_time: goal.reminderTime,
      reminder_days: goal.reminderDays,
      tags: goal.tags || [],
      related_goals: goal.relatedGoals || [],
      milestones: goal.milestones || [],
      progress: initialProgress,
      streak_current: 0,
      streak_longest: 0,
      metadata: goal.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('user_goals')
      .insert([goalData])
      .select()
    
    if (error) {
      console.error('Error al crear objetivo del usuario:', error)
      return null
    }
    
    // Transformar los datos al formato de la interfaz Goal
    return {
      id: data[0].id,
      userId: data[0].user_id,
      title: data[0].title,
      description: data[0].description,
      category: data[0].category,
      type: data[0].type,
      targetValue: data[0].target_value,
      currentValue: data[0].current_value,
      unit: data[0].unit,
      startDate: data[0].start_date,
      targetDate: data[0].target_date,
      completedDate: data[0].completed_date,
      status: data[0].status,
      priority: data[0].priority,
      frequency: data[0].frequency,
      reminderEnabled: data[0].reminder_enabled,
      reminderTime: data[0].reminder_time,
      reminderDays: data[0].reminder_days,
      tags: data[0].tags,
      relatedGoals: data[0].related_goals,
      milestones: data[0].milestones,
      progress: data[0].progress,
      streakCurrent: data[0].streak_current,
      streakLongest: data[0].streak_longest,
      metadata: data[0].metadata
    }
  } catch (error) {
    console.error('Error inesperado al crear objetivo del usuario:', error)
    return null
  }
}

/**
 * Actualiza un objetivo existente del usuario
 */
export async function updateUserGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
  try {
    // Preparar los datos para actualizar
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Mapear los campos de la interfaz Goal a los campos de la base de datos
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue
    if (updates.unit !== undefined) updateData.unit = updates.unit
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate
    if (updates.completedDate !== undefined) updateData.completed_date = updates.completedDate
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.reminderEnabled !== undefined) updateData.reminder_enabled = updates.reminderEnabled
    if (updates.reminderTime !== undefined) updateData.reminder_time = updates.reminderTime
    if (updates.reminderDays !== undefined) updateData.reminder_days = updates.reminderDays
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.relatedGoals !== undefined) updateData.related_goals = updates.relatedGoals
    if (updates.milestones !== undefined) updateData.milestones = updates.milestones
    if (updates.progress !== undefined) updateData.progress = updates.progress
    if (updates.streakCurrent !== undefined) updateData.streak_current = updates.streakCurrent
    if (updates.streakLongest !== undefined) updateData.streak_longest = updates.streakLongest
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata
    
    // Calcular el progreso si se actualizó el valor actual o el valor objetivo
    if ((updates.currentValue !== undefined || updates.targetValue !== undefined) && 
        !updates.progress) {
      // Obtener el objetivo actual para calcular el progreso
      const currentGoal = await getUserGoal(userId, goalId)
      
      if (currentGoal) {
        const currentValue = updates.currentValue !== undefined ? updates.currentValue : currentGoal.currentValue
        const targetValue = updates.targetValue !== undefined ? updates.targetValue : currentGoal.targetValue
        
        if (currentValue !== undefined && targetValue !== undefined && targetValue > 0) {
          updateData.progress = Math.min(Math.round((currentValue / targetValue) * 100), 100)
        }
      }
    }
    
    // Actualizar el estado a "completed" si el progreso es 100%
    if (updateData.progress === 100 && (!updates.status || updates.status !== "completed")) {
      updateData.status = "completed"
      updateData.completed_date = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('user_goals')
      .update(updateData)
      .eq('user_id', userId)
      .eq('id', goalId)
      .select()
    
    if (error) {
      console.error('Error al actualizar objetivo del usuario:', error)
      return null
    }
    
    if (!data || data.length === 0) {
      console.error('No se encontró el objetivo a actualizar')
      return null
    }
    
    // Transformar los datos al formato de la interfaz Goal
    return {
      id: data[0].id,
      userId: data[0].user_id,
      title: data[0].title,
      description: data[0].description,
      category: data[0].category,
      type: data[0].type,
      targetValue: data[0].target_value,
      currentValue: data[0].current_value,
      unit: data[0].unit,
      startDate: data[0].start_date,
      targetDate: data[0].target_date,
      completedDate: data[0].completed_date,
      status: data[0].status,
      priority: data[0].priority,
      frequency: data[0].frequency,
      reminderEnabled: data[0].reminder_enabled,
      reminderTime: data[0].reminder_time,
      reminderDays: data[0].reminder_days,
      tags: data[0].tags,
      relatedGoals: data[0].related_goals,
      milestones: data[0].milestones,
      progress: data[0].progress,
      streakCurrent: data[0].streak_current,
      streakLongest: data[0].streak_longest,
      metadata: data[0].metadata
    }
  } catch (error) {
    console.error('Error inesperado al actualizar objetivo del usuario:', error)
    return null
  }
}

/**
 * Elimina un objetivo del usuario
 */
export async function deleteUserGoal(userId: string, goalId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId)
      .eq('id', goalId)
    
    if (error) {
      console.error('Error al eliminar objetivo del usuario:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error inesperado al eliminar objetivo del usuario:', error)
    return false
  }
}

/**
 * Registra progreso en un objetivo
 */
export async function trackGoalProgress(
  userId: string, 
  goalId: string, 
  value: number,
  note?: string
): Promise<Goal | null> {
  try {
    // Obtener el objetivo actual
    const goal = await getUserGoal(userId, goalId)
    
    if (!goal) {
      console.error('No se encontró el objetivo')
      return null
    }
    
    // Calcular el nuevo valor actual
    const newCurrentValue = (goal.currentValue || 0) + value
    
    // Calcular el nuevo progreso
    let newProgress = goal.progress
    if (goal.targetValue !== undefined && goal.targetValue > 0) {
      newProgress = Math.min(Math.round((newCurrentValue / goal.targetValue) * 100), 100)
    }
    
    // Determinar si el objetivo se ha completado
    let newStatus = goal.status
    let completedDate = goal.completedDate
    
    if (newProgress >= 100 && goal.status !== "completed") {
      newStatus = "completed"
      completedDate = new Date().toISOString()
    }
    
    // Actualizar el objetivo
    const updatedGoal = await updateUserGoal(userId, goalId, {
      currentValue: newCurrentValue,
      progress: newProgress,
      status: newStatus,
      completedDate
    })
    
    // Registrar el progreso en el historial
    await supabase
      .from('goal_progress_history')
      .insert([{
        user_id: userId,
        goal_id: goalId,
        value,
        note,
        created_at: new Date().toISOString()
      }])
    
    return updatedGoal
  } catch (error) {
    console.error('Error inesperado al registrar progreso del objetivo:', error)
    return null
  }
}

/**
 * Obtiene el historial de progreso de un objetivo
 */
export async function getGoalProgressHistory(
  userId: string, 
  goalId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('goal_progress_history')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error al obtener historial de progreso:', error)
      return []
    }
    
    return data
  } catch (error) {
    console.error('Error inesperado al obtener historial de progreso:', error)
    return []
  }
}

/**
 * Actualiza el estado de un hito de un objetivo
 */
export async function updateGoalMilestone(
  userId: string, 
  goalId: string, 
  milestoneId: string, 
  completed: boolean
): Promise<Goal | null> {
  try {
    // Obtener el objetivo actual
    const goal = await getUserGoal(userId, goalId)
    
    if (!goal || !goal.milestones) {
      console.error('No se encontró el objetivo o no tiene hitos')
      return null
    }
    
    // Encontrar y actualizar el hito
    const updatedMilestones = goal.milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          completed,
          completedDate: completed ? new Date().toISOString() : undefined
        }
      }
      return milestone
    })
    
    // Actualizar el objetivo con los hitos actualizados
    return await updateUserGoal(userId, goalId, {
      milestones: updatedMilestones
    })
  } catch (error) {
    console.error('Error inesperado al actualizar hito del objetivo:', error)
    return null
  }
}

/**
 * Obtiene plantillas de objetivos recomendadas para el usuario
 */
export async function getRecommendedGoalTemplates(userId: string): Promise<GoalTemplate[]> {
  try {
    // Obtener el perfil del usuario para personalizar las recomendaciones
    const userProfile = await getEnhancedUserProfile(userId)
    
    if (!userProfile) {
      console.error('No se pudo obtener el perfil del usuario')
      return []
    }
    
    // Obtener todas las plantillas disponibles
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
    
    if (error) {
      console.error('Error al obtener plantillas de objetivos:', error)
      return []
    }
    
    // Filtrar y ordenar las plantillas según el perfil del usuario
    const templates = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      type: item.type,
      defaultTargetValue: item.default_target_value,
      unit: item.unit,
      defaultDuration: item.default_duration,
      suggestedFrequency: item.suggested_frequency,
      difficulty: item.difficulty,
      tags: item.tags,
      defaultMilestones: item.default_milestones,
      metadata: item.metadata
    }))
    
    // Personalizar las recomendaciones según el perfil del usuario
    const personalizedTemplates = personalizeGoalTemplates(templates, userProfile)
    
    return personalizedTemplates
  } catch (error) {
    console.error('Error inesperado al obtener plantillas de objetivos recomendadas:', error)
    return []
  }
}

/**
 * Personaliza las plantillas de objetivos según el perfil del usuario
 */
function personalizeGoalTemplates(
  templates: GoalTemplate[], 
  userProfile: any
): GoalTemplate[] {
  // Obtener los objetivos del usuario según sus preferencias
  const trainingGoals = userProfile.preferences?.trainingPreferences?.trainingGoals || []
  const fitnessLevel = userProfile.preferences?.trainingPreferences?.trainingExperience || "beginner"
  
  // Filtrar plantillas relevantes según los objetivos del usuario
  let relevantTemplates = templates.filter(template => {
    // Si es un objetivo de fitness, verificar si coincide con los objetivos del usuario
    if (template.category === "fitness") {
      // Si el usuario tiene objetivos específicos, filtrar por ellos
      if (trainingGoals.length > 0) {
        return template.tags.some(tag => trainingGoals.includes(tag))
      }
    }
    
    return true
  })
  
  // Filtrar por nivel de dificultad apropiado
  const difficultyMap = {
    "beginner": ["beginner"],
    "intermediate": ["beginner", "intermediate"],
    "advanced": ["beginner", "intermediate", "advanced"]
  }
  
  relevantTemplates = relevantTemplates.filter(template => 
    difficultyMap[fitnessLevel as keyof typeof difficultyMap].includes(template.difficulty)
  )
  
  // Ordenar por relevancia (los que coinciden con más tags del usuario primero)
  relevantTemplates.sort((a, b) => {
    const aRelevance = a.tags.filter(tag => trainingGoals.includes(tag)).length
    const bRelevance = b.tags.filter(tag => trainingGoals.includes(tag)).length
    return bRelevance - aRelevance
  })
  
  return relevantTemplates
}

/**
 * Crea un objetivo a partir de una plantilla
 */
export async function createGoalFromTemplate(
  userId: string, 
  templateId: string,
  customizations?: Partial<Goal>
): Promise<Goal | null> {
  try {
    // Obtener la plantilla
    const { data: templateData, error: templateError } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (templateError) {
      console.error('Error al obtener plantilla de objetivo:', templateError)
      return null
    }
    
    // Crear el objetivo a partir de la plantilla
    const template = templateData
    const startDate = customizations?.startDate || new Date().toISOString().split('T')[0]
    
    // Calcular la fecha objetivo si la plantilla tiene duración predeterminada
    let targetDate = customizations?.targetDate
    if (!targetDate && template.default_duration) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + template.default_duration)
      targetDate = date.toISOString().split('T')[0]
    }
    
    // Crear los hitos a partir de la plantilla
    const milestones = template.default_milestones?.map((milestone, index) => ({
      id: `milestone-${Date.now()}-${index}`,
      title: milestone.title,
      targetValue: milestone.targetValue,
      completed: false
    })) || []
    
    // Crear el objetivo
    const newGoal: Omit<Goal, "id" | "userId" | "progress" | "streakCurrent" | "streakLongest"> = {
      title: customizations?.title || template.title,
      description: customizations?.description || template.description,
      category: customizations?.category || template.category,
      type: customizations?.type || template.type,
      targetValue: customizations?.targetValue !== undefined ? customizations.targetValue : template.default_target_value,
      currentValue: customizations?.currentValue || 0,
      unit: customizations?.unit || template.unit,
      startDate,
      targetDate,
      status: "not_started",
      priority: customizations?.priority || "medium",
      frequency: customizations?.frequency || template.suggested_frequency,
      reminderEnabled: customizations?.reminderEnabled !== undefined ? customizations.reminderEnabled : true,
      reminderTime: customizations?.reminderTime,
      reminderDays: customizations?.reminderDays,
      tags: customizations?.tags || template.tags,
      milestones: customizations?.milestones || milestones,
      metadata: {
        ...template.metadata,
        ...customizations?.metadata,
        templateId: template.id
      }
    }
    
    // Crear el objetivo en la base de datos
    return await createUserGoal(userId, newGoal)
  } catch (error) {
    console.error('Error inesperado al crear objetivo a partir de plantilla:', error)
    return null
  }
}
