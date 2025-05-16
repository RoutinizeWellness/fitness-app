/**
 * Servicio para acceder a los sensores del dispositivo
 * Utiliza las Web APIs para acceder a sensores como acelerómetro, giroscopio, etc.
 */

import { supabase } from './supabase-client';

// Tipos para los datos de sensores
export interface SensorData {
  timestamp: number;
  type: string;
  values: number[];
}

export interface StepData {
  timestamp: number;
  count: number;
  cadence?: number; // pasos por minuto
}

export interface HeartRateData {
  timestamp: number;
  bpm: number;
  confidence?: number; // 0-100%
}

export interface HealthData {
  steps: StepData;
  heartRate?: HeartRateData;
}

// Clase para manejar el contador de pasos usando el acelerómetro
export class StepCounter {
  private static instance: StepCounter;
  private accelerometer: DeviceMotionEventAcceleration | null = null;
  private stepCount: number = 0;
  private lastStepTime: number = 0;
  private stepThreshold: number = 1.2; // umbral para detectar un paso
  private stepCooldown: number = 300; // tiempo mínimo entre pasos (ms)
  private listeners: Array<(steps: number) => void> = [];
  private isRunning: boolean = false;
  private storedSteps: number = 0;
  private userId: string | null = null;
  private lastSyncTime: number = 0;
  private syncInterval: number = 60000; // sincronizar cada minuto

  // Obtener la instancia singleton
  public static getInstance(): StepCounter {
    if (!StepCounter.instance) {
      StepCounter.instance = new StepCounter();
    }
    return StepCounter.instance;
  }

  // Constructor privado para singleton
  private constructor() {
    // Intentar cargar el último conteo de pasos almacenado
    this.loadStoredSteps();

    // Configurar sincronización periódica
    setInterval(() => this.syncSteps(), this.syncInterval);
  }

  // Establecer el ID de usuario para sincronización
  public setUserId(userId: string): void {
    this.userId = userId;
    this.loadStoredSteps();
  }

  // Cargar pasos almacenados
  private async loadStoredSteps(): Promise<void> {
    try {
      // Primero intentar cargar desde localStorage para acceso rápido
      const storedSteps = localStorage.getItem('stepCount');
      const storedDate = localStorage.getItem('stepDate');

      if (storedSteps && storedDate) {
        // Verificar si los pasos son de hoy
        const today = new Date().toDateString();
        if (storedDate === today) {
          this.storedSteps = parseInt(storedSteps, 10);
          this.stepCount = this.storedSteps;
          this.notifyListeners();
          console.log('Pasos cargados desde localStorage:', this.stepCount);
        } else {
          // Si no son de hoy, reiniciar contador
          this.resetStepCount();
        }
      }

      // Si hay un usuario, intentar cargar desde Supabase
      if (this.userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('health_data')
          .select('steps')
          .eq('user_id', this.userId)
          .gte('date', today.toISOString())
          .order('date', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          this.storedSteps = data[0].steps;
          this.stepCount = this.storedSteps;
          this.notifyListeners();
          console.log('Pasos cargados desde Supabase:', this.stepCount);

          // Actualizar localStorage
          localStorage.setItem('stepCount', this.stepCount.toString());
          localStorage.setItem('stepDate', new Date().toDateString());
        }
      }
    } catch (error) {
      console.error('Error al cargar pasos almacenados:', error);
    }
  }

  // Sincronizar pasos con Supabase
  private async syncSteps(): Promise<void> {
    // Verificar si hay un usuario y si el contador está activo
    if (!this.userId) {
      console.log('No hay usuario establecido para sincronizar pasos');
      return;
    }

    if (!this.isRunning) {
      console.log('El contador de pasos no está activo');
      return;
    }

    const now = Date.now();
    // Solo sincronizar si ha pasado el intervalo de sincronización
    if (now - this.lastSyncTime < this.syncInterval) {
      console.log('Aún no es tiempo de sincronizar pasos');
      return;
    }

    try {
      console.log('Iniciando sincronización de pasos para usuario:', this.userId);

      // Verificar si la tabla health_data existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'health_data')
        .single();

      if (tableCheckError) {
        console.warn('Error al verificar tabla health_data:', tableCheckError);
        // Continuar de todos modos, ya que podría ser un error de permisos
      }

      if (!tableExists) {
        console.warn('La tabla health_data no existe, intentando crearla...');
        // En una implementación real, aquí se crearía la tabla
        // Por ahora, solo guardamos en localStorage
        localStorage.setItem('stepCount', this.stepCount.toString());
        localStorage.setItem('stepDate', new Date().toDateString());
        this.lastSyncTime = now;
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar si ya existe un registro para hoy
      const { data, error } = await supabase
        .from('health_data')
        .select('id, steps')
        .eq('user_id', this.userId)
        .gte('date', today.toISOString())
        .limit(1);

      if (error) {
        console.error('Error al consultar datos de salud:', error);
        // Guardar en localStorage como respaldo
        localStorage.setItem('stepCount', this.stepCount.toString());
        localStorage.setItem('stepDate', new Date().toDateString());
        return;
      }

      if (data && data.length > 0) {
        // Actualizar registro existente
        console.log('Actualizando registro existente de pasos:', this.stepCount);
        const { error: updateError } = await supabase
          .from('health_data')
          .update({
            steps: this.stepCount,
            last_updated: new Date().toISOString()
          })
          .eq('id', data[0].id);

        if (updateError) {
          console.error('Error al actualizar pasos:', updateError);
          // Guardar en localStorage como respaldo
          localStorage.setItem('stepCount', this.stepCount.toString());
          localStorage.setItem('stepDate', new Date().toDateString());
          return;
        }
      } else {
        // Crear nuevo registro
        console.log('Creando nuevo registro de pasos:', this.stepCount);
        const { error: insertError } = await supabase
          .from('health_data')
          .insert([{
            user_id: this.userId,
            date: today.toISOString(),
            steps: this.stepCount,
            last_updated: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error al insertar pasos:', insertError);
          // Guardar en localStorage como respaldo
          localStorage.setItem('stepCount', this.stepCount.toString());
          localStorage.setItem('stepDate', new Date().toDateString());
          return;
        }
      }

      // Actualizar tiempo de última sincronización
      this.lastSyncTime = now;
      console.log('Pasos sincronizados con Supabase:', this.stepCount);

      // Actualizar localStorage
      localStorage.setItem('stepCount', this.stepCount.toString());
      localStorage.setItem('stepDate', new Date().toDateString());
    } catch (error) {
      console.error('Error al sincronizar pasos:', error);
      // Guardar en localStorage como respaldo
      localStorage.setItem('stepCount', this.stepCount.toString());
      localStorage.setItem('stepDate', new Date().toDateString());
    }
  }

  // Iniciar el contador de pasos
  public start(): void {
    if (this.isRunning) return;

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleMotion);
      this.isRunning = true;
      console.log('Contador de pasos iniciado');
    } else {
      console.error('DeviceMotionEvent no soportado en este dispositivo');
    }
  }

  // Detener el contador de pasos
  public stop(): void {
    if (!this.isRunning) return;

    window.removeEventListener('devicemotion', this.handleMotion);
    this.isRunning = false;

    // Sincronizar al detener
    this.syncSteps();
    console.log('Contador de pasos detenido');
  }

  // Manejar evento de movimiento con algoritmo mejorado de detección de pasos
  private handleMotion = (event: DeviceMotionEvent): void => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const now = Date.now();

    // Almacenar datos de aceleración para análisis
    this.updateAccelerationBuffer(acceleration, now);

    // Detectar pasos usando un algoritmo más avanzado
    if (this.detectStepFromPattern(now)) {
      this.stepCount++;
      this.lastStepTime = now;
      this.updateCadence(now);
      this.notifyListeners();

      // Sincronizar si es necesario
      if (now - this.lastSyncTime >= this.syncInterval) {
        this.syncSteps();
      }
    }
  };

  // Buffer para almacenar datos recientes de aceleración
  private accelerationBuffer: Array<{x: number, y: number, z: number, timestamp: number}> = [];
  private readonly BUFFER_SIZE = 20;
  private lastPeak = 0;
  private lastValley = 0;
  private cadenceBuffer: number[] = [];
  private readonly CADENCE_BUFFER_SIZE = 10;

  // Actualizar buffer de aceleración
  private updateAccelerationBuffer(acceleration: DeviceMotionEventAcceleration, timestamp: number): void {
    // Añadir nueva lectura
    this.accelerationBuffer.push({
      x: acceleration.x || 0,
      y: acceleration.y || 0,
      z: acceleration.z || 0,
      timestamp
    });

    // Mantener el tamaño del buffer
    if (this.accelerationBuffer.length > this.BUFFER_SIZE) {
      this.accelerationBuffer.shift();
    }
  }

  // Detectar un paso basado en el patrón de aceleración
  private detectStepFromPattern(now: number): boolean {
    if (this.accelerationBuffer.length < 5) return false;
    if (now - this.lastStepTime < this.stepCooldown / 2) return false;

    // Calcular la magnitud de la aceleración para cada punto en el buffer
    const magnitudes = this.accelerationBuffer.map(acc =>
      Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z)
    );

    // Obtener la magnitud actual (último valor)
    const currentMagnitude = magnitudes[magnitudes.length - 1];

    // Calcular la media móvil para suavizar los datos
    const movingAvg = this.calculateMovingAverage(magnitudes, 5);

    // Detectar picos y valles en la señal suavizada
    const isValley = this.isLocalMinimum(movingAvg);
    const isPeak = this.isLocalMaximum(movingAvg);

    // Actualizar último pico/valle
    if (isPeak) {
      this.lastPeak = now;
    } else if (isValley) {
      this.lastValley = now;
    }

    // Un paso se detecta cuando hay un pico seguido de un valle en un intervalo de tiempo adecuado
    // y la diferencia entre el pico y el valle es mayor que el umbral
    if (isPeak && this.lastValley > 0 &&
        now - this.lastValley < 300 &&
        Math.abs(currentMagnitude - movingAvg[0]) > this.stepThreshold) {

      // Verificar que ha pasado suficiente tiempo desde el último paso
      if (now - this.lastStepTime > this.stepCooldown) {
        return true;
      }
    }

    return false;
  }

  // Calcular media móvil
  private calculateMovingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < values.length; i++) {
      let sum = 0;
      let count = 0;

      for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
        sum += values[j];
        count++;
      }

      result.push(sum / count);
    }

    return result;
  }

  // Verificar si un punto es un mínimo local
  private isLocalMinimum(values: number[]): boolean {
    if (values.length < 3) return false;

    const last = values.length - 1;
    return values[last] < values[last - 1] && values[last] < values[last - 2];
  }

  // Verificar si un punto es un máximo local
  private isLocalMaximum(values: number[]): boolean {
    if (values.length < 3) return false;

    const last = values.length - 1;
    return values[last] > values[last - 1] && values[last] > values[last - 2];
  }

  // Actualizar cadencia de pasos
  private updateCadence(now: number): void {
    if (this.lastStepTime === 0) return;

    const timeDiff = now - this.lastStepTime;
    if (timeDiff > 0) {
      // Convertir a pasos por minuto
      const instantCadence = 60000 / timeDiff;

      // Filtrar valores atípicos
      if (instantCadence > 30 && instantCadence < 300) {
        this.cadenceBuffer.push(instantCadence);

        // Mantener el tamaño del buffer
        if (this.cadenceBuffer.length > this.CADENCE_BUFFER_SIZE) {
          this.cadenceBuffer.shift();
        }

        // Calcular cadencia promedio
        const avgCadence = this.cadenceBuffer.reduce((sum, val) => sum + val, 0) / this.cadenceBuffer.length;

        // Guardar en localStorage
        localStorage.setItem('stepCadence', avgCadence.toString());
      }
    }
  }

  // Obtener el conteo actual de pasos
  public getStepCount(): number {
    return this.stepCount;
  }

  // Reiniciar el contador de pasos
  public resetStepCount(): void {
    this.stepCount = 0;
    this.storedSteps = 0;
    this.lastStepTime = 0;
    localStorage.removeItem('stepCount');
    localStorage.removeItem('stepDate');
    this.notifyListeners();
  }

  // Agregar un listener para cambios en el conteo de pasos
  public addStepListener(listener: (steps: number) => void): void {
    this.listeners.push(listener);
    // Notificar inmediatamente con el valor actual
    listener(this.stepCount);
  }

  // Eliminar un listener
  public removeStepListener(listener: (steps: number) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notificar a todos los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.stepCount));
  }
}

// Clase para manejar el monitor de frecuencia cardíaca
export class HeartRateMonitor {
  private static instance: HeartRateMonitor;
  private heartRate: number = 0;
  private listeners: Array<(heartRate: number) => void> = [];
  private isRunning: boolean = false;
  private userId: string | null = null;
  private lastSyncTime: number = 0;
  private syncInterval: number = 60000; // sincronizar cada minuto

  // Obtener la instancia singleton
  public static getInstance(): HeartRateMonitor {
    if (!HeartRateMonitor.instance) {
      HeartRateMonitor.instance = new HeartRateMonitor();
    }
    return HeartRateMonitor.instance;
  }

  // Constructor privado para singleton
  private constructor() {
    // Cargar último valor almacenado
    this.loadStoredHeartRate();

    // Configurar sincronización periódica
    setInterval(() => this.syncHeartRate(), this.syncInterval);

    // Simular cambios en la frecuencia cardíaca para demostración
    // En una implementación real, esto usaría la Web Bluetooth API
    setInterval(() => {
      if (this.isRunning) {
        // Simular variaciones naturales en la frecuencia cardíaca
        const variation = Math.random() * 5 - 2.5; // -2.5 a 2.5
        this.heartRate = Math.max(60, Math.min(100, this.heartRate + variation));
        this.notifyListeners();
      }
    }, 3000);
  }

  // Establecer el ID de usuario para sincronización
  public setUserId(userId: string): void {
    this.userId = userId;
    this.loadStoredHeartRate();
  }

  // Cargar frecuencia cardíaca almacenada
  private async loadStoredHeartRate(): Promise<void> {
    try {
      // Primero intentar cargar desde localStorage
      const storedHeartRate = localStorage.getItem('heartRate');

      if (storedHeartRate) {
        this.heartRate = parseInt(storedHeartRate, 10);
        this.notifyListeners();
      } else {
        // Valor predeterminado
        this.heartRate = 72;
      }

      // Si hay un usuario, intentar cargar desde Supabase
      if (this.userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('health_data')
          .select('heart_rate')
          .eq('user_id', this.userId)
          .gte('date', today.toISOString())
          .order('date', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0 && data[0].heart_rate) {
          this.heartRate = data[0].heart_rate;
          this.notifyListeners();

          // Actualizar localStorage
          localStorage.setItem('heartRate', this.heartRate.toString());
        }
      }
    } catch (error) {
      console.error('Error al cargar frecuencia cardíaca almacenada:', error);
    }
  }

  // Sincronizar frecuencia cardíaca con Supabase
  private async syncHeartRate(): Promise<void> {
    // Verificar si hay un usuario y si el monitor está activo
    if (!this.userId) {
      console.log('No hay usuario establecido para sincronizar frecuencia cardíaca');
      return;
    }

    if (!this.isRunning) {
      console.log('El monitor de frecuencia cardíaca no está activo');
      return;
    }

    const now = Date.now();
    if (now - this.lastSyncTime < this.syncInterval) {
      console.log('Aún no es tiempo de sincronizar frecuencia cardíaca');
      return;
    }

    try {
      console.log('Iniciando sincronización de frecuencia cardíaca para usuario:', this.userId);

      // Verificar si la tabla health_data existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'health_data')
        .single();

      if (tableCheckError) {
        console.warn('Error al verificar tabla health_data:', tableCheckError);
        // Continuar de todos modos, ya que podría ser un error de permisos
      }

      if (!tableExists) {
        console.warn('La tabla health_data no existe, intentando crearla...');
        // En una implementación real, aquí se crearía la tabla
        // Por ahora, solo guardamos en localStorage
        localStorage.setItem('heartRate', this.heartRate.toString());
        this.lastSyncTime = now;
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar si ya existe un registro para hoy
      const { data, error } = await supabase
        .from('health_data')
        .select('id, heart_rate')
        .eq('user_id', this.userId)
        .gte('date', today.toISOString())
        .limit(1);

      if (error) {
        console.error('Error al consultar datos de salud para frecuencia cardíaca:', error);
        // Guardar en localStorage como respaldo
        localStorage.setItem('heartRate', this.heartRate.toString());
        return;
      }

      if (data && data.length > 0) {
        // Actualizar registro existente
        console.log('Actualizando registro existente de frecuencia cardíaca:', this.heartRate);
        const { error: updateError } = await supabase
          .from('health_data')
          .update({
            heart_rate: this.heartRate,
            last_updated: new Date().toISOString()
          })
          .eq('id', data[0].id);

        if (updateError) {
          console.error('Error al actualizar frecuencia cardíaca:', updateError);
          // Guardar en localStorage como respaldo
          localStorage.setItem('heartRate', this.heartRate.toString());
          return;
        }
      } else {
        // Crear nuevo registro
        console.log('Creando nuevo registro de frecuencia cardíaca:', this.heartRate);
        const { error: insertError } = await supabase
          .from('health_data')
          .insert([{
            user_id: this.userId,
            date: today.toISOString(),
            heart_rate: this.heartRate,
            last_updated: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error al insertar frecuencia cardíaca:', insertError);
          // Guardar en localStorage como respaldo
          localStorage.setItem('heartRate', this.heartRate.toString());
          return;
        }
      }

      // Actualizar tiempo de última sincronización
      this.lastSyncTime = now;
      console.log('Frecuencia cardíaca sincronizada con Supabase:', this.heartRate);

      // Actualizar localStorage
      localStorage.setItem('heartRate', this.heartRate.toString());
    } catch (error) {
      console.error('Error al sincronizar frecuencia cardíaca:', error);
      // Guardar en localStorage como respaldo
      localStorage.setItem('heartRate', this.heartRate.toString());
    }
  }

  // Iniciar el monitor
  public start(): void {
    if (this.isRunning) return;

    // En una implementación real, aquí se conectaría con un dispositivo Bluetooth
    // o se usaría otra API para obtener la frecuencia cardíaca
    this.isRunning = true;
    console.log('Monitor de frecuencia cardíaca iniciado');
  }

  // Detener el monitor
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    // Sincronizar al detener
    this.syncHeartRate();
    console.log('Monitor de frecuencia cardíaca detenido');
  }

  // Obtener la frecuencia cardíaca actual
  public getHeartRate(): number {
    return Math.round(this.heartRate);
  }

  // Agregar un listener para cambios en la frecuencia cardíaca
  public addHeartRateListener(listener: (heartRate: number) => void): void {
    this.listeners.push(listener);
    // Notificar inmediatamente con el valor actual
    listener(Math.round(this.heartRate));
  }

  // Eliminar un listener
  public removeHeartRateListener(listener: (heartRate: number) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notificar a todos los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(Math.round(this.heartRate)));
  }
}
