import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaces para el módulo de productividad
 */
export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  dueDate?: string
  dueTime?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  tags?: string[]
  category?: string
  estimatedTime?: number // en minutos
  actualTime?: number // en minutos
  createdAt: string
  updatedAt: string
}

export interface FocusSession {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  duration: number // en minutos
  technique: string
  taskId?: string
  distractions?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  category?: string
  startDate: string
  endDate: string
  progress: number // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  goalId: string
  title: string
  dueDate: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductivityStats {
  focusTime: {
    daily: number
    weekly: number
    monthly: number
  }
  tasks: {
    completed: number
    pending: number
    completion_rate: number
  }
  goals: {
    active: number
    completed: number
    average_progress: number
  }
  focus_sessions: {
    count: number
    average_duration: number
    peak_hours: string[]
  }
}

/**
 * Obtiene las tareas del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Tareas o null en caso de error
 */
export const getTasks = async (
  userId: string,
  options?: {
    status?: string
    priority?: string
    category?: string
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<{ data: Task[] | null, error: any }> => {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.priority) {
      query = query.eq('priority', options.priority)
    }

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.startDate) {
      query = query.gte('due_date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('due_date', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener tareas:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos al formato de la interfaz
    const tasks: Task[] = data.map(task => ({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      dueTime: task.due_time,
      priority: task.priority,
      status: task.status,
      tags: task.tags,
      category: task.category,
      estimatedTime: task.estimated_time,
      actualTime: task.actual_time,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }))

    return { data: tasks, error: null }
  } catch (error) {
    console.error('Error al obtener tareas:', error)
    return { data: null, error }
  }
}

/**
 * Guarda una tarea
 * @param task - Datos de la tarea
 * @returns - Tarea guardada o null en caso de error
 */
export const saveTask = async (
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ data: Task | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const taskId = task.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo de la tarea
    const completeTask: Task = {
      id: taskId,
      createdAt: task.id ? (task as any).createdAt || now : now,
      updatedAt: now,
      ...task
    } as Task

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeTask.id,
      user_id: completeTask.userId,
      title: completeTask.title,
      description: completeTask.description,
      due_date: completeTask.dueDate,
      due_time: completeTask.dueTime,
      priority: completeTask.priority,
      status: completeTask.status,
      tags: completeTask.tags,
      category: completeTask.category,
      estimated_time: completeTask.estimatedTime,
      actual_time: completeTask.actualTime,
      created_at: completeTask.createdAt,
      updated_at: completeTask.updatedAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('tasks')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeTask, error }
      }

      console.log('Tarea guardada exitosamente en Supabase')
      return { data: completeTask, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar tarea:', error)
    return { data: null, error }
  }
}

/**
 * Elimina una tarea
 * @param taskId - ID de la tarea
 * @returns - True si se eliminó correctamente, false en caso contrario
 */
export const deleteTask = async (taskId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error al eliminar tarea:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    return { success: false, error }
  }
}

/**
 * Obtiene las sesiones de enfoque del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Sesiones de enfoque o null en caso de error
 */
export const getFocusSessions = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    technique?: string
    limit?: number
  }
): Promise<{ data: FocusSession[] | null, error: any }> => {
  try {
    let query = supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.technique) {
      query = query.eq('technique', options.technique)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener sesiones de enfoque:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos al formato de la interfaz
    const sessions: FocusSession[] = data.map(session => ({
      id: session.id,
      userId: session.user_id,
      date: session.date,
      startTime: session.start_time,
      endTime: session.end_time,
      duration: session.duration,
      technique: session.technique,
      taskId: session.task_id,
      distractions: session.distractions,
      notes: session.notes,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }))

    return { data: sessions, error: null }
  } catch (error) {
    console.error('Error al obtener sesiones de enfoque:', error)
    return { data: null, error }
  }
}

/**
 * Guarda una sesión de enfoque
 * @param session - Datos de la sesión
 * @returns - Sesión guardada o null en caso de error
 */
export const saveFocusSession = async (
  session: Omit<FocusSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ data: FocusSession | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const sessionId = session.id || uuidv4()
    const now = new Date().toISOString()

    // Crear el objeto completo de la sesión
    const completeSession: FocusSession = {
      id: sessionId,
      createdAt: session.id ? (session as any).createdAt || now : now,
      updatedAt: now,
      ...session
    } as FocusSession

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeSession.id,
      user_id: completeSession.userId,
      date: completeSession.date,
      start_time: completeSession.startTime,
      end_time: completeSession.endTime,
      duration: completeSession.duration,
      technique: completeSession.technique,
      task_id: completeSession.taskId,
      distractions: completeSession.distractions,
      notes: completeSession.notes,
      created_at: completeSession.createdAt,
      updated_at: completeSession.updatedAt
    }

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar en Supabase:', error)
        return { data: completeSession, error }
      }

      console.log('Sesión de enfoque guardada exitosamente en Supabase')
      return { data: completeSession, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar sesión de enfoque:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los objetivos del usuario
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Objetivos o null en caso de error
 */
export const getGoals = async (
  userId: string,
  options?: {
    status?: string
    category?: string
    limit?: number
  }
): Promise<{ data: Goal[] | null, error: any }> => {
  try {
    let query = supabase
      .from('goals')
      .select('*, milestones(*)')
      .eq('user_id', userId)
      .order('end_date', { ascending: true })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener objetivos:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Transformar los datos al formato de la interfaz
    const goals: Goal[] = data.map(goal => {
      // Transformar los hitos
      const milestones: Milestone[] = goal.milestones ? goal.milestones.map((milestone: any) => ({
        id: milestone.id,
        goalId: milestone.goal_id,
        title: milestone.title,
        dueDate: milestone.due_date,
        isCompleted: milestone.is_completed,
        createdAt: milestone.created_at,
        updatedAt: milestone.updated_at
      })) : []

      return {
        id: goal.id,
        userId: goal.user_id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        startDate: goal.start_date,
        endDate: goal.end_date,
        progress: goal.progress,
        status: goal.status,
        milestones,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at
      }
    })

    return { data: goals, error: null }
  } catch (error) {
    console.error('Error al obtener objetivos:', error)
    return { data: null, error }
  }
}

/**
 * Guarda un objetivo
 * @param goal - Datos del objetivo
 * @returns - Objetivo guardado o null en caso de error
 */
export const saveGoal = async (
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ data: Goal | null, error: any }> => {
  try {
    // Crear un ID único si no se proporciona
    const goalId = goal.id || uuidv4()
    const now = new Date().toISOString()

    // Extraer los hitos para guardarlos por separado
    const milestones = goal.milestones || []

    // Crear el objeto completo del objetivo (sin hitos)
    const completeGoal: Goal = {
      id: goalId,
      createdAt: goal.id ? (goal as any).createdAt || now : now,
      updatedAt: now,
      ...goal,
      milestones: [] // Los guardaremos por separado
    } as Goal

    // Preparar datos para Supabase (convertir camelCase a snake_case)
    const supabaseData = {
      id: completeGoal.id,
      user_id: completeGoal.userId,
      title: completeGoal.title,
      description: completeGoal.description,
      category: completeGoal.category,
      start_date: completeGoal.startDate,
      end_date: completeGoal.endDate,
      progress: completeGoal.progress,
      status: completeGoal.status,
      created_at: completeGoal.createdAt,
      updated_at: completeGoal.updatedAt
    }

    // Intentar guardar el objetivo en Supabase
    try {
      const { data, error } = await supabase
        .from('goals')
        .upsert(supabaseData)
        .select()

      if (error) {
        console.error('Error al guardar objetivo en Supabase:', error)
        return { data: completeGoal, error }
      }

      // Guardar los hitos
      if (milestones.length > 0) {
        // Preparar los datos de los hitos
        const milestonesData = milestones.map(milestone => ({
          id: milestone.id || uuidv4(),
          goal_id: goalId,
          title: milestone.title,
          due_date: milestone.dueDate,
          is_completed: milestone.isCompleted,
          created_at: milestone.createdAt || now,
          updated_at: now
        }))

        // Guardar los hitos en Supabase
        const { error: milestonesError } = await supabase
          .from('milestones')
          .upsert(milestonesData)

        if (milestonesError) {
          console.error('Error al guardar hitos en Supabase:', milestonesError)
        }

        // Actualizar el objeto completo con los hitos
        completeGoal.milestones = milestones.map((milestone, index) => ({
          ...milestone,
          id: milestonesData[index].id,
          goalId,
          createdAt: milestonesData[index].created_at,
          updatedAt: milestonesData[index].updated_at
        }))
      }

      console.log('Objetivo guardado exitosamente en Supabase')
      return { data: completeGoal, error: null }
    } catch (supabaseError) {
      console.error('Error al ejecutar upsert en Supabase:', supabaseError)
      return { data: null, error: supabaseError }
    }
  } catch (error) {
    console.error('Error al guardar objetivo:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene estadísticas de productividad
 * @param userId - ID del usuario
 * @param options - Opciones de filtrado
 * @returns - Estadísticas o null en caso de error
 */
export const getProductivityStats = async (
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
): Promise<{ data: ProductivityStats | null, error: any }> => {
  try {
    // Obtener fecha actual y fechas para filtros
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Obtener sesiones de enfoque
    const { data: focusSessions, error: focusError } = await getFocusSessions(userId, {
      startDate: monthStart.toISOString()
    })

    if (focusError) {
      console.error('Error al obtener sesiones de enfoque:', focusError)
      return { data: null, error: focusError }
    }

    // Obtener tareas
    const { data: tasks, error: tasksError } = await getTasks(userId)

    if (tasksError) {
      console.error('Error al obtener tareas:', tasksError)
      return { data: null, error: tasksError }
    }

    // Obtener objetivos
    const { data: goals, error: goalsError } = await getGoals(userId)

    if (goalsError) {
      console.error('Error al obtener objetivos:', goalsError)
      return { data: null, error: goalsError }
    }

    // Calcular estadísticas de sesiones de enfoque
    const todaySessions = focusSessions?.filter(session => session.date === today) || []
    const weekSessions = focusSessions?.filter(session => new Date(session.date) >= weekStart) || []
    const monthSessions = focusSessions || []

    const dailyFocusTime = todaySessions.reduce((acc, session) => acc + session.duration, 0)
    const weeklyFocusTime = weekSessions.reduce((acc, session) => acc + session.duration, 0)
    const monthlyFocusTime = monthSessions.reduce((acc, session) => acc + session.duration, 0)

    // Calcular estadísticas de tareas
    const completedTasks = tasks?.filter(task => task.status === 'completed') || []
    const pendingTasks = tasks?.filter(task => task.status === 'pending' || task.status === 'in_progress') || []

    const completionRate = tasks && tasks.length > 0
      ? (completedTasks.length / tasks.length) * 100
      : 0

    // Calcular estadísticas de objetivos
    const activeGoals = goals?.filter(goal => goal.status === 'in_progress') || []
    const completedGoals = goals?.filter(goal => goal.status === 'completed') || []

    const averageProgress = activeGoals.length > 0
      ? activeGoals.reduce((acc, goal) => acc + goal.progress, 0) / activeGoals.length
      : 0

    // Calcular horas pico
    const hourCounts: Record<string, number> = {}

    focusSessions?.forEach(session => {
      const startHour = session.startTime.split(':')[0]
      hourCounts[startHour] = (hourCounts[startHour] || 0) + 1
    })

    // Obtener las 3 horas con más sesiones
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)

    return {
      data: {
        focusTime: {
          daily: dailyFocusTime,
          weekly: weeklyFocusTime,
          monthly: monthlyFocusTime
        },
        tasks: {
          completed: completedTasks.length,
          pending: pendingTasks.length,
          completion_rate: completionRate
        },
        goals: {
          active: activeGoals.length,
          completed: completedGoals.length,
          average_progress: averageProgress
        },
        focus_sessions: {
          count: focusSessions?.length || 0,
          average_duration: focusSessions && focusSessions.length > 0
            ? focusSessions.reduce((acc, session) => acc + session.duration, 0) / focusSessions.length
            : 0,
          peak_hours: peakHours
        }
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de productividad:', error)
    return { data: null, error }
  }
}