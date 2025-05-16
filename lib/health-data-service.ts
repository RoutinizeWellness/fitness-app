/**
 * Servicio para gestionar datos de salud
 * Proporciona funciones para obtener, guardar y sincronizar datos de salud
 */

import { supabase } from './supabase-client';
import { StepCounter, HeartRateMonitor } from './sensor-service';

// Tipos para datos de salud
export interface HealthDataRecord {
  id?: string;
  user_id: string;
  date: string;
  steps?: number;
  heart_rate?: number;
  calories_burned?: number;
  active_minutes?: number;
  distance?: number;
  sleep_duration?: number;
  water_intake?: number;
  last_updated: string;
}

export interface HealthGoals {
  steps: number;
  heart_rate_min: number;
  heart_rate_max: number;
  calories: number;
  active_minutes: number;
  sleep_duration: number;
  water_intake: number;
}

export interface HealthStats {
  steps: {
    current: number;
    goal: number;
    percentage: number;
  };
  heart_rate: {
    current: number;
    min: number;
    max: number;
    status: 'normal' | 'high' | 'low';
  };
  calories: {
    burned: number;
    goal: number;
    percentage: number;
  };
  sleep: {
    duration: number;
    goal: number;
    percentage: number;
  };
  water: {
    intake: number;
    goal: number;
    percentage: number;
  };
}

// Valores predeterminados para metas de salud
const DEFAULT_HEALTH_GOALS: HealthGoals = {
  steps: 10000,
  heart_rate_min: 60,
  heart_rate_max: 100,
  calories: 2200,
  active_minutes: 30,
  sleep_duration: 8,
  water_intake: 2.5
};

// Clase principal para gestionar datos de salud
export class HealthDataService {
  private static instance: HealthDataService;
  private userId: string | null = null;
  private stepCounter: StepCounter;
  private heartRateMonitor: HeartRateMonitor;
  private healthGoals: HealthGoals = DEFAULT_HEALTH_GOALS;
  private isInitialized: boolean = false;

  // Obtener la instancia singleton
  public static getInstance(): HealthDataService {
    if (!HealthDataService.instance) {
      HealthDataService.instance = new HealthDataService();
    }
    return HealthDataService.instance;
  }

  // Constructor privado para singleton
  private constructor() {
    this.stepCounter = StepCounter.getInstance();
    this.heartRateMonitor = HeartRateMonitor.getInstance();

    // Cargar metas de salud desde localStorage
    this.loadHealthGoals();
  }

  // Inicializar el servicio con el ID de usuario
  public async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.userId === userId) return;

    this.userId = userId;
    this.stepCounter.setUserId(userId);
    this.heartRateMonitor.setUserId(userId);

    // Cargar metas de salud desde Supabase
    await this.loadHealthGoalsFromSupabase();

    // Iniciar sensores
    this.stepCounter.start();
    this.heartRateMonitor.start();

    this.isInitialized = true;
    console.log('HealthDataService inicializado para el usuario:', userId);
  }

  // Cargar metas de salud desde localStorage
  private loadHealthGoals(): void {
    try {
      const storedGoals = localStorage.getItem('healthGoals');
      if (storedGoals) {
        this.healthGoals = { ...DEFAULT_HEALTH_GOALS, ...JSON.parse(storedGoals) };
      }
    } catch (error) {
      console.error('Error al cargar metas de salud:', error);
    }
  }

  // Cargar metas de salud desde Supabase
  private async loadHealthGoalsFromSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      console.log('Verificando si existe la tabla health_goals...');

      // Verificar si la tabla health_goals existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'health_goals')
        .single();

      if (tableCheckError) {
        console.warn('Error al verificar tabla health_goals:', tableCheckError);
        // Continuar usando los valores predeterminados
        console.log('Usando valores predeterminados para metas de salud');
        this.healthGoals = DEFAULT_HEALTH_GOALS;
        localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));
        return;
      }

      if (!tableExists) {
        console.warn('La tabla health_goals no existe, usando valores predeterminados');
        this.healthGoals = DEFAULT_HEALTH_GOALS;
        localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));
        return;
      }

      console.log('Consultando metas de salud para el usuario:', this.userId);
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', this.userId)
        .limit(1);

      if (error) {
        console.error('Error al consultar metas de salud:', error);
        // Usar valores predeterminados
        this.healthGoals = DEFAULT_HEALTH_GOALS;
        localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));
        return;
      }

      if (data && data.length > 0) {
        console.log('Metas de salud encontradas:', data[0]);
        // Combinar con valores predeterminados
        this.healthGoals = {
          ...DEFAULT_HEALTH_GOALS,
          ...data[0]
        };

        // Guardar en localStorage
        localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));
      } else {
        console.log('No se encontraron metas de salud, usando valores predeterminados');
        // Si no hay metas guardadas, usar valores predeterminados
        this.healthGoals = DEFAULT_HEALTH_GOALS;
        localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));

        // Intentar crear un registro con los valores predeterminados
        try {
          await this.saveHealthGoals(DEFAULT_HEALTH_GOALS);
        } catch (saveError) {
          console.error('Error al guardar metas de salud predeterminadas:', saveError);
        }
      }
    } catch (error) {
      console.error('Error al cargar metas de salud desde Supabase:', error);
      // Usar valores predeterminados
      this.healthGoals = DEFAULT_HEALTH_GOALS;
      localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));
    }
  }

  // Guardar metas de salud
  public async saveHealthGoals(goals: Partial<HealthGoals>): Promise<void> {
    if (!this.userId) return;

    try {
      // Actualizar metas locales
      this.healthGoals = {
        ...this.healthGoals,
        ...goals
      };

      // Guardar en localStorage
      localStorage.setItem('healthGoals', JSON.stringify(this.healthGoals));

      // Verificar si ya existe un registro
      const { data, error } = await supabase
        .from('health_goals')
        .select('id')
        .eq('user_id', this.userId)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Actualizar registro existente
        const { error: updateError } = await supabase
          .from('health_goals')
          .update({
            ...goals,
            last_updated: new Date().toISOString()
          })
          .eq('id', data[0].id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('health_goals')
          .insert([{
            user_id: this.userId,
            ...this.healthGoals,
            last_updated: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error al guardar metas de salud:', error);
    }
  }

  // Obtener estadísticas de salud actuales
  public getHealthStats(): HealthStats {
    const steps = this.stepCounter.getStepCount();
    const heartRate = this.heartRateMonitor.getHeartRate();

    // Calcular estado de la frecuencia cardíaca
    let heartRateStatus: 'normal' | 'high' | 'low' = 'normal';
    if (heartRate < this.healthGoals.heart_rate_min) {
      heartRateStatus = 'low';
    } else if (heartRate > this.healthGoals.heart_rate_max) {
      heartRateStatus = 'high';
    }

    // Obtener otros datos de localStorage o usar valores simulados
    const caloriesBurned = this.calculateCaloriesBurned(steps);
    const sleepDuration = this.getSleepDuration();
    const waterIntake = this.getWaterIntake();

    return {
      steps: {
        current: steps,
        goal: this.healthGoals.steps,
        percentage: Math.min(100, (steps / this.healthGoals.steps) * 100)
      },
      heart_rate: {
        current: heartRate,
        min: this.healthGoals.heart_rate_min,
        max: this.healthGoals.heart_rate_max,
        status: heartRateStatus
      },
      calories: {
        burned: caloriesBurned,
        goal: this.healthGoals.calories,
        percentage: Math.min(100, (caloriesBurned / this.healthGoals.calories) * 100)
      },
      sleep: {
        duration: sleepDuration,
        goal: this.healthGoals.sleep_duration,
        percentage: Math.min(100, (sleepDuration / this.healthGoals.sleep_duration) * 100)
      },
      water: {
        intake: waterIntake,
        goal: this.healthGoals.water_intake,
        percentage: Math.min(100, (waterIntake / this.healthGoals.water_intake) * 100)
      }
    };
  }

  // Calcular calorías quemadas basadas en pasos y datos del usuario
  private calculateCaloriesBurned(steps: number): number {
    // Obtener datos del usuario desde localStorage (en una implementación real, estos vendrían de la base de datos)
    const userWeight = parseFloat(localStorage.getItem('userWeight') || '70'); // kg
    const userHeight = parseFloat(localStorage.getItem('userHeight') || '170'); // cm
    const userAge = parseFloat(localStorage.getItem('userAge') || '30'); // años
    const userGender = localStorage.getItem('userGender') || 'male'; // male/female

    // Calcular MET (Metabolic Equivalent of Task) basado en la cadencia de pasos
    // Valores aproximados: caminar = 3-4 MET, correr = 7-9 MET
    const stepsPerMinute = this.getStepsPerMinute();
    let met = 3.0; // valor por defecto para caminar

    if (stepsPerMinute < 80) {
      // Caminar lento
      met = 2.5;
    } else if (stepsPerMinute < 100) {
      // Caminar normal
      met = 3.5;
    } else if (stepsPerMinute < 120) {
      // Caminar rápido
      met = 4.5;
    } else if (stepsPerMinute < 150) {
      // Trotar
      met = 7.0;
    } else {
      // Correr
      met = 9.0;
    }

    // Calcular BMR (Basal Metabolic Rate) usando la fórmula de Mifflin-St Jeor
    let bmr = 0;
    if (userGender === 'male') {
      bmr = 10 * userWeight + 6.25 * userHeight - 5 * userAge + 5;
    } else {
      bmr = 10 * userWeight + 6.25 * userHeight - 5 * userAge - 161;
    }

    // Calorías por minuto = (MET * BMR) / (24 * 60)
    const caloriesPerMinute = (met * bmr) / 1440;

    // Estimar tiempo de actividad basado en pasos (asumiendo una cadencia promedio)
    const avgStepsPerMinute = stepsPerMinute || 100; // valor por defecto si no hay datos
    const activityMinutes = steps / avgStepsPerMinute;

    // Calcular calorías totales
    return Math.round(caloriesPerMinute * activityMinutes);
  }

  // Obtener cadencia de pasos (pasos por minuto)
  private getStepsPerMinute(): number {
    // En una implementación real, esto calcularía la cadencia basada en datos recientes
    // Por ahora, usamos un valor simulado o almacenado
    const storedCadence = localStorage.getItem('stepCadence');
    if (storedCadence) {
      return parseFloat(storedCadence);
    }

    // Valor por defecto
    return 100;
  }

  // Obtener duración del sueño (simulado)
  private getSleepDuration(): number {
    // En una implementación real, esto vendría de un dispositivo o entrada del usuario
    const storedSleep = localStorage.getItem('sleepDuration');
    return storedSleep ? parseFloat(storedSleep) : 7.2;
  }

  // Obtener ingesta de agua (simulado)
  private getWaterIntake(): number {
    // En una implementación real, esto vendría de la entrada del usuario
    const storedWater = localStorage.getItem('waterIntake');
    return storedWater ? parseFloat(storedWater) : 1.6;
  }

  // Registrar duración del sueño
  public async logSleepDuration(hours: number): Promise<void> {
    if (!this.userId) return;

    try {
      // Guardar en localStorage
      localStorage.setItem('sleepDuration', hours.toString());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar si ya existe un registro para hoy
      const { data, error } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', this.userId)
        .gte('date', today.toISOString())
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Actualizar registro existente
        const { error: updateError } = await supabase
          .from('health_data')
          .update({
            sleep_duration: hours,
            last_updated: new Date().toISOString()
          })
          .eq('id', data[0].id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('health_data')
          .insert([{
            user_id: this.userId,
            date: today.toISOString(),
            sleep_duration: hours,
            last_updated: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error al registrar duración del sueño:', error);
    }
  }

  // Registrar ingesta de agua
  public async logWaterIntake(liters: number): Promise<void> {
    if (!this.userId) return;

    try {
      // Guardar en localStorage
      localStorage.setItem('waterIntake', liters.toString());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar si ya existe un registro para hoy
      const { data, error } = await supabase
        .from('health_data')
        .select('id, water_intake')
        .eq('user_id', this.userId)
        .gte('date', today.toISOString())
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Actualizar registro existente (acumulativo)
        const currentIntake = data[0].water_intake || 0;
        const { error: updateError } = await supabase
          .from('health_data')
          .update({
            water_intake: liters,
            last_updated: new Date().toISOString()
          })
          .eq('id', data[0].id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('health_data')
          .insert([{
            user_id: this.userId,
            date: today.toISOString(),
            water_intake: liters,
            last_updated: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error al registrar ingesta de agua:', error);
    }
  }

  // Agregar listener para cambios en el conteo de pasos
  public addStepListener(listener: (steps: number) => void): void {
    this.stepCounter.addStepListener(listener);
  }

  // Eliminar listener de pasos
  public removeStepListener(listener: (steps: number) => void): void {
    this.stepCounter.removeStepListener(listener);
  }

  // Agregar listener para cambios en la frecuencia cardíaca
  public addHeartRateListener(listener: (heartRate: number) => void): void {
    this.heartRateMonitor.addHeartRateListener(listener);
  }

  // Eliminar listener de frecuencia cardíaca
  public removeHeartRateListener(listener: (heartRate: number) => void): void {
    this.heartRateMonitor.removeHeartRateListener(listener);
  }

  // Detener todos los sensores
  public stopSensors(): void {
    this.stepCounter.stop();
    this.heartRateMonitor.stop();
  }
}
