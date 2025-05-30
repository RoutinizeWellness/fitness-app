import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'
import {
  SleepEntry,
  SleepGoal,
  NapEntry,
  SleepStats,
  DeviceSource
} from '@/lib/types/wellness'

/**
 * Servicio para gestionar los datos de sueño
 */
export class SleepService {
  /**
   * Obtiene los registros de sueño de un usuario
   * @param userId - ID del usuario
   * @param options - Opciones de consulta
   * @returns - Lista de registros de sueño
   */
  static async getSleepEntries(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      orderBy?: { column: string; ascending: boolean };
    } = {}
  ): Promise<{ data: SleepEntry[] | null; error: any }> {
    try {
      const { limit = 30, offset = 0, startDate, endDate, orderBy } = options

      let query = supabase
        .from('sleep_entries')
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
      const sleepEntries = data.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        date: entry.date,
        startTime: entry.start_time,
        endTime: entry.end_time,
        duration: entry.duration,
        quality: entry.quality,
        deepSleep: entry.deep_sleep,
        remSleep: entry.rem_sleep,
        lightSleep: entry.light_sleep,
        awakeTime: entry.awake_time,
        hrv: entry.hrv,
        restingHeartRate: entry.resting_heart_rate,
        bodyTemperature: entry.body_temperature,
        factors: entry.factors,
        notes: entry.notes,
        deviceSource: entry.device_source as DeviceSource,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }))

      return { data: sleepEntries, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener registros de sueño'
      console.error('Error al obtener registros de sueño:', {
        error: errorMessage,
        userId,
        options,
        details: error
      })
      return { data: null, error: { message: errorMessage, details: error } }
    }
  }

  /**
   * Guarda un registro de sueño
   * @param entry - Datos del registro
   * @returns - Registro guardado o null en caso de error
   */
  static async saveSleepEntry(
    entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<{ data: SleepEntry | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const entryId = entry.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbEntry = {
        id: entryId,
        user_id: entry.userId,
        date: entry.date,
        start_time: entry.startTime,
        end_time: entry.endTime,
        duration: entry.duration,
        quality: entry.quality,
        deep_sleep: entry.deepSleep,
        rem_sleep: entry.remSleep,
        light_sleep: entry.lightSleep,
        awake_time: entry.awakeTime,
        hrv: entry.hrv,
        resting_heart_rate: entry.restingHeartRate,
        body_temperature: entry.bodyTemperature,
        factors: entry.factors,
        notes: entry.notes,
        device_source: entry.deviceSource,
        created_at: entry.id ? undefined : now,
        updated_at: now
      }

      // Insertar o actualizar el registro
      const { data, error } = await supabase
        .from('sleep_entries')
        .upsert(dbEntry)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedEntry: SleepEntry = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
        quality: data.quality,
        deepSleep: data.deep_sleep,
        remSleep: data.rem_sleep,
        lightSleep: data.light_sleep,
        awakeTime: data.awake_time,
        hrv: data.hrv,
        restingHeartRate: data.resting_heart_rate,
        bodyTemperature: data.body_temperature,
        factors: data.factors,
        notes: data.notes,
        deviceSource: data.device_source as DeviceSource,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: savedEntry, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar registro de sueño'
      console.error('Error al guardar registro de sueño:', {
        error: errorMessage,
        userId: entry.userId,
        date: entry.date,
        details: error
      })
      return { data: null, error: { message: errorMessage, details: error } }
    }
  }

  /**
   * Elimina un registro de sueño
   * @param entryId - ID del registro
   * @returns - Éxito o error
   */
  static async deleteSleepEntry(entryId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('sleep_entries')
        .delete()
        .eq('id', entryId)

      if (error) {
        throw error
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error al eliminar registro de sueño:', error)
      return { success: false, error }
    }
  }

  /**
   * Obtiene o crea un objetivo de sueño para un usuario
   * @param userId - ID del usuario
   * @returns - Objetivo de sueño
   */
  static async getSleepGoal(userId: string): Promise<{ data: SleepGoal | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró ningún objetivo, crear uno por defecto
          return this.createDefaultSleepGoal(userId)
        }
        throw error
      }

      // Convertir los datos al formato de la interfaz
      const sleepGoal: SleepGoal = {
        id: data.id,
        userId: data.user_id,
        targetDuration: data.target_duration,
        targetBedtime: data.target_bedtime,
        targetWakeTime: data.target_wake_time,
        targetDeepSleepPercentage: data.target_deep_sleep_percentage,
        targetRemSleepPercentage: data.target_rem_sleep_percentage,
        targetHrv: data.target_hrv,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: sleepGoal, error: null }
    } catch (error) {
      console.error('Error al obtener objetivo de sueño:', error)
      return { data: null, error }
    }
  }

  /**
   * Crea un objetivo de sueño por defecto
   * @param userId - ID del usuario
   * @returns - Objetivo de sueño creado
   */
  private static async createDefaultSleepGoal(userId: string): Promise<{ data: SleepGoal | null; error: any }> {
    try {
      const defaultGoal: SleepGoal = {
        userId,
        targetDuration: 480, // 8 horas en minutos
        targetBedtime: '23:00',
        targetWakeTime: '07:00',
        targetDeepSleepPercentage: 20,
        targetRemSleepPercentage: 25,
        isActive: true
      }

      return this.saveSleepGoal(defaultGoal)
    } catch (error) {
      console.error('Error al crear objetivo de sueño por defecto:', error)
      return { data: null, error }
    }
  }

  /**
   * Guarda un objetivo de sueño
   * @param goal - Datos del objetivo
   * @returns - Objetivo guardado o null en caso de error
   */
  static async saveSleepGoal(
    goal: Omit<SleepGoal, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<{ data: SleepGoal | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const goalId = goal.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbGoal = {
        id: goalId,
        user_id: goal.userId,
        target_duration: goal.targetDuration,
        target_bedtime: goal.targetBedtime,
        target_wake_time: goal.targetWakeTime,
        target_deep_sleep_percentage: goal.targetDeepSleepPercentage,
        target_rem_sleep_percentage: goal.targetRemSleepPercentage,
        target_hrv: goal.targetHrv,
        is_active: goal.isActive,
        created_at: goal.id ? undefined : now,
        updated_at: now
      }

      // Insertar o actualizar el objetivo
      const { data, error } = await supabase
        .from('sleep_goals')
        .upsert(dbGoal)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedGoal: SleepGoal = {
        id: data.id,
        userId: data.user_id,
        targetDuration: data.target_duration,
        targetBedtime: data.target_bedtime,
        targetWakeTime: data.target_wake_time,
        targetDeepSleepPercentage: data.target_deep_sleep_percentage,
        targetRemSleepPercentage: data.target_rem_sleep_percentage,
        targetHrv: data.target_hrv,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: savedGoal, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar objetivo de sueño'
      console.error('Error al guardar objetivo de sueño:', {
        error: errorMessage,
        userId: goal.userId,
        targetDuration: goal.targetDuration,
        details: error
      })
      return { data: null, error: { message: errorMessage, details: error } }
    }
  }

  /**
   * Obtiene estadísticas de sueño para un usuario
   * @param userId - ID del usuario
   * @param days - Número de días para calcular estadísticas
   * @returns - Estadísticas de sueño
   */
  static async getSleepStats(userId: string, days: number = 30): Promise<{ data: SleepStats | null; error: any }> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: entries, error } = await this.getSleepEntries(userId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        orderBy: { column: 'date', ascending: true }
      })

      if (error) {
        throw error
      }

      if (!entries || entries.length === 0) {
        return {
          data: {
            averageDuration: 0,
            averageQuality: 0,
            trends: {
              duration: [],
              quality: []
            },
            dates: []
          },
          error: null
        }
      }

      // Calcular estadísticas
      const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0)
      const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0)
      const totalDeepSleep = entries.reduce((sum, entry) => sum + (entry.deepSleep || 0), 0)
      const totalRemSleep = entries.reduce((sum, entry) => sum + (entry.remSleep || 0), 0)
      const totalLightSleep = entries.reduce((sum, entry) => sum + (entry.lightSleep || 0), 0)
      const totalHrv = entries.reduce((sum, entry) => sum + (entry.hrv || 0), 0)
      const totalRhr = entries.reduce((sum, entry) => sum + (entry.restingHeartRate || 0), 0)

      const hrvEntries = entries.filter(entry => entry.hrv !== undefined && entry.hrv !== null)
      const rhrEntries = entries.filter(entry => entry.restingHeartRate !== undefined && entry.restingHeartRate !== null)
      const deepSleepEntries = entries.filter(entry => entry.deepSleep !== undefined && entry.deepSleep !== null)
      const remSleepEntries = entries.filter(entry => entry.remSleep !== undefined && entry.remSleep !== null)
      const lightSleepEntries = entries.filter(entry => entry.lightSleep !== undefined && entry.lightSleep !== null)

      const stats: SleepStats = {
        averageDuration: totalDuration / entries.length,
        averageQuality: totalQuality / entries.length,
        averageDeepSleep: deepSleepEntries.length > 0 ? totalDeepSleep / deepSleepEntries.length : undefined,
        averageRemSleep: remSleepEntries.length > 0 ? totalRemSleep / remSleepEntries.length : undefined,
        averageLightSleep: lightSleepEntries.length > 0 ? totalLightSleep / lightSleepEntries.length : undefined,
        averageHrv: hrvEntries.length > 0 ? totalHrv / hrvEntries.length : undefined,
        averageRestingHeartRate: rhrEntries.length > 0 ? totalRhr / rhrEntries.length : undefined,
        sleepDebt: this.calculateSleepDebt(entries),
        consistencyScore: this.calculateConsistencyScore(entries),
        trends: {
          duration: entries.map(entry => entry.duration),
          quality: entries.map(entry => entry.quality),
          deepSleep: deepSleepEntries.length > 0 ? deepSleepEntries.map(entry => entry.deepSleep!) : undefined,
          remSleep: remSleepEntries.length > 0 ? remSleepEntries.map(entry => entry.remSleep!) : undefined,
          hrv: hrvEntries.length > 0 ? hrvEntries.map(entry => entry.hrv!) : undefined
        },
        dates: entries.map(entry => entry.date)
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error al obtener estadísticas de sueño:', error)
      return { data: null, error }
    }
  }

  /**
   * Calcula la deuda de sueño
   * @param entries - Registros de sueño
   * @returns - Deuda de sueño en minutos
   */
  private static calculateSleepDebt(entries: SleepEntry[]): number {
    if (entries.length === 0) return 0

    // Obtener el objetivo de sueño (8 horas por defecto)
    const targetDuration = 480 // 8 horas en minutos

    // Calcular la deuda de sueño acumulada en los últimos 7 días
    const last7Days = entries.slice(-7)
    if (last7Days.length === 0) return 0

    const totalDebt = last7Days.reduce((debt, entry) => {
      const dailyDebt = entry.duration < targetDuration ? targetDuration - entry.duration : 0
      return debt + dailyDebt
    }, 0)

    return totalDebt
  }

  /**
   * Calcula la puntuación de consistencia
   * @param entries - Registros de sueño
   * @returns - Puntuación de consistencia (0-100)
   */
  private static calculateConsistencyScore(entries: SleepEntry[]): number {
    if (entries.length < 3) return 0

    // Calcular la desviación estándar de los horarios
    const bedtimes = entries.map(entry => this.timeToMinutes(entry.startTime))
    const waketimes = entries.map(entry => this.timeToMinutes(entry.endTime))

    const bedtimeStdDev = this.calculateStandardDeviation(bedtimes)
    const waketimeStdDev = this.calculateStandardDeviation(waketimes)

    // Convertir la desviación estándar a una puntuación (menor desviación = mayor puntuación)
    // Máxima desviación considerada: 120 minutos (2 horas)
    const maxStdDev = 120
    const bedtimeScore = Math.max(0, 100 - (bedtimeStdDev / maxStdDev) * 100)
    const waketimeScore = Math.max(0, 100 - (waketimeStdDev / maxStdDev) * 100)

    // Promedio de las puntuaciones
    return (bedtimeScore + waketimeScore) / 2
  }

  /**
   * Convierte una hora en formato HH:MM a minutos desde medianoche
   * @param time - Hora en formato HH:MM
   * @returns - Minutos desde medianoche
   */
  private static timeToMinutes(time: string): number {
    if (!time || typeof time !== 'string') {
      console.warn('timeToMinutes: Invalid time provided:', time)
      return 0
    }

    const timeParts = time.split(':')
    if (timeParts.length !== 2) {
      console.warn('timeToMinutes: Invalid time format:', time)
      return 0
    }

    const [hours, minutes] = timeParts.map(Number)

    if (isNaN(hours) || isNaN(minutes)) {
      console.warn('timeToMinutes: Non-numeric time parts:', time)
      return 0
    }

    return hours * 60 + minutes
  }

  /**
   * Calcula la desviación estándar de un conjunto de valores
   * @param values - Valores
   * @returns - Desviación estándar
   */
  private static calculateStandardDeviation(values: number[]): number {
    const n = values.length
    if (n === 0) return 0

    const mean = values.reduce((sum, value) => sum + value, 0) / n
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / n
    return Math.sqrt(variance)
  }
}
