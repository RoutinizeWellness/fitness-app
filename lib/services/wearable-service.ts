import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'
import {
  WearableIntegration,
  DeviceSource,
  SleepEntry
} from '@/lib/types/wellness'
import { SleepService } from './sleep-service'

/**
 * Servicio para gestionar la integración con dispositivos wearables
 */
export class WearableService {
  /**
   * Obtiene la configuración de integración con wearables para un usuario
   * @param userId - ID del usuario
   * @param deviceType - Tipo de dispositivo
   * @returns - Configuración de integración
   */
  static async getWearableIntegration(
    userId: string,
    deviceType: DeviceSource
  ): Promise<{ data: WearableIntegration | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wearable_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('device_type', deviceType)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró ninguna integración, crear una por defecto
          return this.createDefaultWearableIntegration(userId, deviceType)
        }
        throw error
      }

      // Convertir los datos al formato de la interfaz
      const integration: WearableIntegration = {
        id: data.id,
        userId: data.user_id,
        deviceType: data.device_type as DeviceSource,
        isConnected: data.is_connected,
        authToken: data.auth_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: data.token_expires_at,
        lastSyncAt: data.last_sync_at,
        settings: data.settings,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: integration, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener integración con wearable'
      console.error('Error al obtener integración con wearable:', {
        error: errorMessage,
        userId,
        deviceType,
        details: error
      })
      return { data: null, error: { message: errorMessage, details: error } }
    }
  }

  /**
   * Crea una configuración de integración con wearables por defecto
   * @param userId - ID del usuario
   * @param deviceType - Tipo de dispositivo
   * @returns - Configuración de integración creada
   */
  private static async createDefaultWearableIntegration(
    userId: string,
    deviceType: DeviceSource
  ): Promise<{ data: WearableIntegration | null; error: any }> {
    try {
      const defaultIntegration: WearableIntegration = {
        userId,
        deviceType,
        isConnected: false,
        settings: {
          syncFrequency: 'daily',
          syncTime: '04:00',
          metrics: {
            sleep: true,
            hrv: true,
            restingHeartRate: true,
            bodyTemperature: true
          }
        }
      }

      return this.saveWearableIntegration(defaultIntegration)
    } catch (error) {
      console.error('Error al crear integración con wearable por defecto:', error)
      return { data: null, error }
    }
  }

  /**
   * Guarda la configuración de integración con wearables
   * @param integration - Datos de la integración
   * @returns - Integración guardada o null en caso de error
   */
  static async saveWearableIntegration(
    integration: Omit<WearableIntegration, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<{ data: WearableIntegration | null; error: any }> {
    try {
      // Crear un ID único si no se proporciona
      const integrationId = integration.id || uuidv4()
      const now = new Date().toISOString()

      // Convertir los datos al formato de la base de datos
      const dbIntegration = {
        id: integrationId,
        user_id: integration.userId,
        device_type: integration.deviceType,
        is_connected: integration.isConnected,
        auth_token: integration.authToken,
        refresh_token: integration.refreshToken,
        token_expires_at: integration.tokenExpiresAt,
        last_sync_at: integration.lastSyncAt,
        settings: integration.settings,
        created_at: integration.id ? undefined : now,
        updated_at: now
      }

      // Insertar o actualizar la integración
      const { data, error } = await supabase
        .from('wearable_integrations')
        .upsert(dbIntegration)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Convertir el resultado al formato de la interfaz
      const savedIntegration: WearableIntegration = {
        id: data.id,
        userId: data.user_id,
        deviceType: data.device_type as DeviceSource,
        isConnected: data.is_connected,
        authToken: data.auth_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: data.token_expires_at,
        lastSyncAt: data.last_sync_at,
        settings: data.settings,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: savedIntegration, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar integración con wearable'
      console.error('Error al guardar integración con wearable:', {
        error: errorMessage,
        userId: integration.userId,
        deviceType: integration.deviceType,
        details: error
      })
      return { data: null, error: { message: errorMessage, details: error } }
    }
  }

  /**
   * Conecta un dispositivo wearable
   * @param userId - ID del usuario
   * @param deviceType - Tipo de dispositivo
   * @param authData - Datos de autenticación
   * @returns - Integración actualizada o null en caso de error
   */
  static async connectWearable(
    userId: string,
    deviceType: DeviceSource,
    authData: {
      authToken: string;
      refreshToken?: string;
      expiresIn?: number;
    }
  ): Promise<{ data: WearableIntegration | null; error: any }> {
    try {
      // Obtener la integración actual
      const { data: currentIntegration, error } = await this.getWearableIntegration(userId, deviceType)

      if (error) {
        throw error
      }

      // Calcular fecha de expiración del token
      let tokenExpiresAt = null
      if (authData.expiresIn) {
        const expirationDate = new Date()
        expirationDate.setSeconds(expirationDate.getSeconds() + authData.expiresIn)
        tokenExpiresAt = expirationDate.toISOString()
      }

      // Actualizar la integración
      const updatedIntegration: WearableIntegration = {
        ...currentIntegration!,
        isConnected: true,
        authToken: authData.authToken,
        refreshToken: authData.refreshToken || currentIntegration?.refreshToken,
        tokenExpiresAt,
        lastSyncAt: new Date().toISOString()
      }

      return this.saveWearableIntegration(updatedIntegration)
    } catch (error) {
      console.error('Error al conectar wearable:', error)
      return { data: null, error }
    }
  }

  /**
   * Desconecta un dispositivo wearable
   * @param userId - ID del usuario
   * @param deviceType - Tipo de dispositivo
   * @returns - Integración actualizada o null en caso de error
   */
  static async disconnectWearable(
    userId: string,
    deviceType: DeviceSource
  ): Promise<{ data: WearableIntegration | null; error: any }> {
    try {
      // Obtener la integración actual
      const { data: currentIntegration, error } = await this.getWearableIntegration(userId, deviceType)

      if (error) {
        throw error
      }

      // Actualizar la integración
      const updatedIntegration: WearableIntegration = {
        ...currentIntegration!,
        isConnected: false,
        authToken: null,
        refreshToken: null,
        tokenExpiresAt: null
      }

      return this.saveWearableIntegration(updatedIntegration)
    } catch (error) {
      console.error('Error al desconectar wearable:', error)
      return { data: null, error }
    }
  }

  /**
   * Sincroniza datos de un dispositivo wearable
   * @param userId - ID del usuario
   * @param deviceType - Tipo de dispositivo
   * @returns - Éxito o error
   */
  static async syncWearableData(
    userId: string,
    deviceType: DeviceSource
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Obtener la integración
      const { data: integration, error } = await this.getWearableIntegration(userId, deviceType)

      if (error) {
        throw error
      }

      if (!integration || !integration.isConnected) {
        return { success: false, error: 'El dispositivo no está conectado' }
      }

      // Obtener datos del dispositivo
      const wearableData = await this.fetchWearableData(integration)

      // Guardar datos de sueño
      if (wearableData.sleep) {
        for (const sleepEntry of wearableData.sleep) {
          await SleepService.saveSleepEntry(sleepEntry)
        }
      }

      // Actualizar fecha de última sincronización
      const updatedIntegration: WearableIntegration = {
        ...integration,
        lastSyncAt: new Date().toISOString()
      }

      await this.saveWearableIntegration(updatedIntegration)

      return { success: true, error: null }
    } catch (error) {
      console.error('Error al sincronizar datos del wearable:', error)
      return { success: false, error }
    }
  }

  /**
   * Obtiene datos de un dispositivo wearable
   * @param integration - Configuración de integración
   * @returns - Datos del dispositivo
   */
  private static async fetchWearableData(
    integration: WearableIntegration
  ): Promise<{
    sleep?: SleepEntry[];
    [key: string]: any;
  }> {
    // Esta función simula la obtención de datos de un dispositivo wearable
    // En una implementación real, se conectaría a la API del dispositivo

    switch (integration.deviceType) {
      case 'oura':
        return this.fetchOuraData(integration)
      case 'whoop':
        return this.fetchWhoopData(integration)
      case 'garmin':
        return this.fetchGarminData(integration)
      case 'apple_watch':
        return this.fetchAppleWatchData(integration)
      case 'fitbit':
        return this.fetchFitbitData(integration)
      case 'polar':
        return this.fetchPolarData(integration)
      default:
        return {}
    }
  }

  /**
   * Obtiene datos de Oura Ring
   * @param integration - Configuración de integración
   * @returns - Datos de Oura Ring
   */
  private static async fetchOuraData(
    integration: WearableIntegration
  ): Promise<{ sleep: SleepEntry[] }> {
    // Simular datos de Oura Ring
    // En una implementación real, se conectaría a la API de Oura

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const sleepEntry: SleepEntry = {
      userId: integration.userId,
      date: yesterday.toISOString().split('T')[0],
      startTime: '23:30',
      endTime: '07:30',
      duration: 480, // 8 horas en minutos
      quality: 8,
      deepSleep: 120, // 2 horas en minutos
      remSleep: 120, // 2 horas en minutos
      lightSleep: 240, // 4 horas en minutos
      hrv: 65,
      restingHeartRate: 52,
      deviceSource: 'oura',
      factors: {
        alcohol: false,
        caffeine: false,
        screens: true,
        stress: false,
        exercise: true,
        lateMeal: false,
        noise: false,
        temperature: false
      }
    }

    return { sleep: [sleepEntry] }
  }

  /**
   * Obtiene datos de Whoop
   * @param integration - Configuración de integración
   * @returns - Datos de Whoop
   */
  private static async fetchWhoopData(
    integration: WearableIntegration
  ): Promise<{ sleep: SleepEntry[] }> {
    // Simular datos de Whoop
    // En una implementación real, se conectaría a la API de Whoop

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const sleepEntry: SleepEntry = {
      userId: integration.userId,
      date: yesterday.toISOString().split('T')[0],
      startTime: '23:15',
      endTime: '07:00',
      duration: 465, // 7.75 horas en minutos
      quality: 7,
      deepSleep: 100, // 1.67 horas en minutos
      remSleep: 115, // 1.92 horas en minutos
      lightSleep: 250, // 4.17 horas en minutos
      hrv: 58,
      restingHeartRate: 54,
      deviceSource: 'whoop',
      factors: {
        alcohol: false,
        caffeine: false,
        screens: true,
        stress: true,
        exercise: true,
        lateMeal: false,
        noise: false,
        temperature: false
      }
    }

    return { sleep: [sleepEntry] }
  }

  /**
   * Obtiene datos de Garmin
   * @param integration - Configuración de integración
   * @returns - Datos de Garmin
   */
  private static async fetchGarminData(
    integration: WearableIntegration
  ): Promise<{ sleep: SleepEntry[] }> {
    // Implementación similar a las anteriores
    return { sleep: [] }
  }

  /**
   * Obtiene datos de Apple Watch
   * @param integration - Configuración de integración
   * @returns - Datos de Apple Watch
   */
  private static async fetchAppleWatchData(
    integration: WearableIntegration
  ): Promise<{ sleep: SleepEntry[] }> {
    // Implementación similar a las anteriores
    return { sleep: [] }
  }

  /**
   * Obtiene datos de Fitbit
   * @param integration - Configuración de integración
   * @returns - Datos de Fitbit
   */
  private static async fetchFitbitData(
    integration: WearableIntegration
  ): Promise<{ sleep: SleepEntry[] }> {
    // Implementación similar a las anteriores
    return { sleep: [] }
  }

  /**
   * Obtiene datos de Polar
   * @param integration - Configuración de integración
   * @returns - Datos de Polar
   */
  private static async fetchPolarData(
    integration: WearableIntegration
  ): Promise<{ sleep: SleepEntry[] }> {
    // Implementación similar a las anteriores
    return { sleep: [] }
  }
}
