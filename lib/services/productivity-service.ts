/**
 * Productivity Service
 *
 * This service handles all productivity-related operations with Supabase.
 * It provides methods for:
 * - Managing tasks
 * - Tracking focus sessions
 * - Managing daily routines
 * - Setting and tracking productivity goals
 */

import { supabaseService, QueryResponse } from "@/lib/supabase-service"
import { TABLES } from "@/lib/config/supabase-config"
import { v4 as uuidv4 } from "uuid"
import {
  Task,
  FocusSession,
  DailyRoutine,
  RoutineItem,
  ProductivityStats,
  TaskPriority,
  TaskStatus,
  FocusTechnique,
  RoutineType
} from '@/lib/types/wellness'

/**
 * Productivity Service Class
 */
export class ProductivityService {
  /**
   * Get tasks for a user
   * @param userId - User ID
   * @param options - Query options
   * @returns - List of tasks
   */
  static async getTasks(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: TaskStatus | TaskStatus[];
      priority?: TaskPriority;
      category?: string;
      dueDate?: { from?: string; to?: string };
      orderBy?: { column: string; ascending: boolean };
      useCache?: boolean;
    } = {}
  ): Promise<QueryResponse<Task[]>> {
    if (!userId) {
      return { data: [], error: { message: 'User ID is required' }, status: 400 }
    }

    const {
      limit = 30,
      offset = 0,
      status,
      priority,
      category,
      dueDate,
      orderBy,
      useCache = true
    } = options

    let queryOptions: any = {
      select: '*',
      eq: { user_id: userId },
      limit,
      offset,
      useCache
    }

    if (status) {
      if (Array.isArray(status)) {
        queryOptions.in = { status }
      } else {
        queryOptions.eq = { ...queryOptions.eq, status }
      }
    }

    if (priority) {
      queryOptions.eq = { ...queryOptions.eq, priority }
    }

    if (category) {
      queryOptions.eq = { ...queryOptions.eq, category }
    }

    if (dueDate) {
      if (dueDate.from) {
        queryOptions.gte = { due_date: dueDate.from }
      }
      if (dueDate.to) {
        queryOptions.lte = { due_date: dueDate.to }
      }
    }

    if (orderBy) {
      queryOptions.order = { [orderBy.column]: orderBy.ascending ? 'asc' : 'desc' }
    } else {
      // Default: order by due date (ascending) and priority (descending)
      queryOptions.order = { due_date: 'asc', priority: 'desc' }
    }

    const response = await supabaseService.query<any[]>(TABLES.TASKS, queryOptions)

    // Transform database data to interface format
    if (response.data) {
      const tasks: Task[] = response.data.map(task => ({
        id: task.id,
        userId: task.user_id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        dueTime: task.due_time,
        priority: task.priority as TaskPriority,
        status: task.status as TaskStatus,
        tags: task.tags,
        category: task.category,
        estimatedTime: task.estimated_time,
        actualTime: task.actual_time,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }))

      return { ...response, data: tasks }
    }

    return response
  }

  /**
   * Save a task
   * @param task - Task data
   * @returns - Saved task
   */
  static async saveTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<QueryResponse<Task>> {
    // Validate task data
    if (!task.userId) {
      return { data: null, error: { message: 'User ID is required' }, status: 400 }
    }

    if (!task.title) {
      return { data: null, error: { message: 'Title is required' }, status: 400 }
    }

    // Create a unique ID if not provided
    const taskId = task.id || uuidv4()
    const now = new Date().toISOString()

    // Convert data to database format
    const dbTask = {
      id: taskId,
      user_id: task.userId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      due_time: task.dueTime,
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      tags: task.tags,
      category: task.category,
      estimated_time: task.estimatedTime,
      actual_time: task.actualTime,
      created_at: task.id ? undefined : now,
      updated_at: now
    }

    // Insert or update the task
    const response = await supabaseService.insert<any>(
      TABLES.TASKS,
      dbTask,
      { upsert: true }
    )

    // Transform the result to interface format
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data

      const savedTask: Task = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date,
        dueTime: data.due_time,
        priority: data.priority as TaskPriority,
        status: data.status as TaskStatus,
        tags: data.tags,
        category: data.category,
        estimatedTime: data.estimated_time,
        actualTime: data.actual_time,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { ...response, data: savedTask }
    }

    return response
  }

  /**
   * Delete a task
   * @param taskId - Task ID
   * @returns - Query response
   */
  static async deleteTask(taskId: string): Promise<QueryResponse<Task>> {
    if (!taskId) {
      return { data: null, error: { message: 'Task ID is required' }, status: 400 }
    }

    return supabaseService.delete<Task>(
      TABLES.TASKS,
      { eq: { id: taskId } }
    )
  }

  /**
   * Update task status
   * @param taskId - Task ID
   * @param status - New status
   * @returns - Updated task
   */
  static async updateTaskStatus(
    taskId: string,
    status: TaskStatus
  ): Promise<QueryResponse<Task>> {
    if (!taskId) {
      return { data: null, error: { message: 'Task ID is required' }, status: 400 }
    }

    const now = new Date().toISOString()

    const response = await supabaseService.update<any>(
      TABLES.TASKS,
      {
        status,
        updated_at: now
      },
      { eq: { id: taskId } }
    )

    // Transform the result to interface format
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data

      const updatedTask: Task = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date,
        dueTime: data.due_time,
        priority: data.priority as TaskPriority,
        status: data.status as TaskStatus,
        tags: data.tags,
        category: data.category,
        estimatedTime: data.estimated_time,
        actualTime: data.actual_time,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { ...response, data: updatedTask }
    }

    return response
  }

  /**
   * Guarda una sesión de enfoque
   * @param session - Datos de la sesión
   * @returns - Sesión guardada o null en caso de error
   */
  static async saveFocusSession(
    session: Omit<FocusSession, 'id' | 'createdAt'> & { id?: string }
  ): Promise<{ data: FocusSession | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const sessionId = session.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbSession = {
        id: sessionId,
        user_id: session.userId,
        date: session.date,
        start_time: session.startTime,
        end_time: session.endTime,
        duration: session.duration,
        technique: session.technique,
        task_id: session.taskId,
        distractions: session.distractions,
        productivity_score: session.productivityScore,
        notes: session.notes,
        created_at: session.id ? undefined : now
      }

      // Insertar o actualizar la sesión
      const { data, error } = await supabase
        .from('focus_sessions')
        .upsert(dbSession)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedSession: FocusSession = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
        technique: data.technique as FocusTechnique,
        taskId: data.task_id,
        distractions: data.distractions,
        productivityScore: data.productivity_score,
        notes: data.notes,
        createdAt: data.created_at
      }

      return { data: savedSession, error: null }
    } catch (error) {
      console.error('Error al guardar sesión de enfoque:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene las sesiones de enfoque de un usuario
   * @param userId - ID del usuario
   * @param options - Opciones de consulta
   * @returns - Lista de sesiones de enfoque
   */
  static async getFocusSessions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      orderBy?: { column: string; ascending: boolean };
    } = {}
  ): Promise<{ data: FocusSession[] | null; error: any }> {
    try {
      const { limit = 30, offset = 0, startDate, endDate, orderBy } = options

      let query = supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending })
      } else {
        query = query.order('date', { ascending: false })
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Convertir los datos de la base de datos al formato de la interfaz
      const focusSessions = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        date: session.date,
        startTime: session.start_time,
        endTime: session.end_time,
        duration: session.duration,
        technique: session.technique as FocusTechnique,
        taskId: session.task_id,
        distractions: session.distractions,
        productivityScore: session.productivity_score,
        notes: session.notes,
        createdAt: session.created_at
      }))

      return { data: focusSessions, error: null }
    } catch (error) {
      console.error('Error al obtener sesiones de enfoque:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene o crea una rutina diaria para un usuario
   * @param userId - ID del usuario
   * @param type - Tipo de rutina (morning, evening)
   * @returns - Rutina diaria
   */
  static async getDailyRoutine(
    userId: string,
    type: RoutineType
  ): Promise<{ data: DailyRoutine | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró ninguna rutina, crear una por defecto
          return this.createDefaultDailyRoutine(userId, type)
        }
        throw error
      }

      // Convertir los datos al formato de la interfaz
      const routine: DailyRoutine = {
        id: data.id,
        userId: data.user_id,
        type: data.type as RoutineType,
        items: data.items,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: routine, error: null }
    } catch (error) {
      console.error('Error al obtener rutina diaria:', error)
      return { data: null, error }
    }
  }

  /**
   * Crea una rutina diaria por defecto
   * @param userId - ID del usuario
   * @param type - Tipo de rutina
   * @returns - Rutina diaria creada
   */
  private static async createDefaultDailyRoutine(
    userId: string,
    type: RoutineType
  ): Promise<{ data: DailyRoutine | null; error: any }> {
    try {
      let defaultItems: RoutineItem[] = []

      if (type === 'morning') {
        defaultItems = [
          { title: 'Beber un vaso de agua', completed: false, order: 1 },
          { title: 'Meditar 5 minutos', completed: false, order: 2 },
          { title: 'Estiramientos', completed: false, order: 3 },
          { title: 'Planificar el día', completed: false, order: 4 }
        ]
      } else if (type === 'evening') {
        defaultItems = [
          { title: 'Revisar tareas completadas', completed: false, order: 1 },
          { title: 'Planificar el día siguiente', completed: false, order: 2 },
          { title: 'Apagar pantallas 30 min antes de dormir', completed: false, order: 3 },
          { title: 'Leer 15 minutos', completed: false, order: 4 }
        ]
      }

      const defaultRoutine: DailyRoutine = {
        userId,
        type,
        items: defaultItems,
        isActive: true
      }

      return this.saveDailyRoutine(defaultRoutine)
    } catch (error) {
      console.error('Error al crear rutina diaria por defecto:', error)
      return { data: null, error }
    }
  }

  /**
   * Guarda una rutina diaria
   * @param routine - Datos de la rutina
   * @returns - Rutina guardada o null en caso de error
   */
  static async saveDailyRoutine(
    routine: Omit<DailyRoutine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<{ data: DailyRoutine | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const routineId = routine.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbRoutine = {
        id: routineId,
        user_id: routine.userId,
        type: routine.type,
        items: routine.items,
        is_active: routine.isActive,
        created_at: routine.id ? undefined : now,
        updated_at: now
      }

      // Insertar o actualizar la rutina
      const { data, error } = await supabase
        .from('daily_routines')
        .upsert(dbRoutine)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedRoutine: DailyRoutine = {
        id: data.id,
        userId: data.user_id,
        type: data.type as RoutineType,
        items: data.items,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: savedRoutine, error: null }
    } catch (error) {
      console.error('Error al guardar rutina diaria:', error)
      return { data: null, error }
    }
  }

  /**
   * Obtiene estadísticas de productividad para un usuario
   * @param userId - ID del usuario
   * @param days - Número de días para calcular estadísticas
   * @returns - Estadísticas de productividad
   */
  static async getProductivityStats(
    userId: string,
    days: number = 30
  ): Promise<{ data: ProductivityStats | null; error: any }> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Obtener tareas
      const { data: tasks, error: tasksError } = await this.getTasks(userId, {
        dueDate: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        }
      })

      if (tasksError) {
        throw tasksError
      }

      // Obtener sesiones de enfoque
      const { data: focusSessions, error: sessionsError } = await this.getFocusSessions(userId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      if (sessionsError) {
        throw sessionsError
      }

      // Calcular estadísticas
      const completedTasks = tasks ? tasks.filter(task => task.status === 'completed') : []
      const pendingTasks = tasks ? tasks.filter(task => task.status === 'pending' || task.status === 'in_progress') : []
      const completionRate = tasks && tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

      // Calcular tiempo de enfoque
      const totalFocusTime = focusSessions ? focusSessions.reduce((sum, session) => sum + session.duration, 0) : 0
      const dailyFocusTime = totalFocusTime / days
      const weeklyFocusTime = dailyFocusTime * 7

      // Calcular horas pico de productividad
      const hourCounts: Record<number, number> = {}
      if (focusSessions) {
        focusSessions.forEach(session => {
          const hour = parseInt(session.startTime.split(':')[0])
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        })
      }

      // Obtener las 3 horas más productivas
      const peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => `${hour}:00`)

      // Calcular adherencia a rutinas
      const routineAdherence = 85 // Valor de ejemplo, se implementaría la lógica real

      const stats: ProductivityStats = {
        focusTime: {
          daily: dailyFocusTime,
          weekly: weeklyFocusTime,
          monthly: totalFocusTime
        },
        tasks: {
          completed: completedTasks.length,
          pending: pendingTasks.length,
          completionRate
        },
        focusSessions: {
          count: focusSessions ? focusSessions.length : 0,
          averageDuration: focusSessions && focusSessions.length > 0
            ? totalFocusTime / focusSessions.length
            : 0,
          peakHours
        },
        routineAdherence
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error al obtener estadísticas de productividad:', error)
      return { data: null, error }
    }
  }
}
