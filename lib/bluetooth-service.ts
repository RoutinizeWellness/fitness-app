/**
 * Servicio para manejar conexiones Bluetooth con dispositivos de salud
 * Utiliza la Web Bluetooth API para conectar con dispositivos como monitores de frecuencia cardíaca
 */

import { supabase } from './supabase-client';

// Tipos para dispositivos Bluetooth
export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'heart_rate' | 'activity_tracker' | 'smart_watch' | 'cycling_power' | 'running_speed_cadence' | 'glucose' | 'blood_pressure' | 'other';
  connected: boolean;
  lastConnected?: Date;
  batteryLevel?: number;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  capabilities?: string[];
}

// Tipos para datos de dispositivos
export interface DeviceReading {
  timestamp: number;
  deviceId: string;
  type: string;
  value: number | object;
  confidence?: number; // 0-100, confianza en la medición
  metadata?: {
    [key: string]: any;
  };
}

// Tipos para datos de frecuencia cardíaca
export interface HeartRateReading extends DeviceReading {
  value: number;
  energyExpended?: number; // kJ
  rrIntervals?: number[]; // ms, para variabilidad de frecuencia cardíaca
  sensorContact?: boolean;
}

// Tipos para datos de actividad
export interface ActivityReading extends DeviceReading {
  value: {
    steps?: number;
    distance?: number; // metros
    calories?: number;
    activeMinutes?: number;
    cadence?: number; // pasos por minuto
  };
}

// Características Bluetooth estándar para dispositivos de salud
const HEART_RATE_SERVICE = 'heart_rate';
const HEART_RATE_CHARACTERISTIC = 'heart_rate_measurement';
const BATTERY_SERVICE = 'battery_service';
const BATTERY_LEVEL_CHARACTERISTIC = 'battery_level';
const DEVICE_INFORMATION_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';
const MANUFACTURER_NAME_CHARACTERISTIC = '00002a29-0000-1000-8000-00805f9b34fb';
const MODEL_NUMBER_CHARACTERISTIC = '00002a24-0000-1000-8000-00805f9b34fb';
const FIRMWARE_REVISION_CHARACTERISTIC = '00002a26-0000-1000-8000-00805f9b34fb';
const RUNNING_SPEED_CADENCE_SERVICE = '00001814-0000-1000-8000-00805f9b34fb';
const RSC_MEASUREMENT_CHARACTERISTIC = '00002a53-0000-1000-8000-00805f9b34fb';
const CYCLING_POWER_SERVICE = '00001818-0000-1000-8000-00805f9b34fb';
const CYCLING_POWER_MEASUREMENT_CHARACTERISTIC = '00002a63-0000-1000-8000-00805f9b34fb';

// Clase principal para manejar conexiones Bluetooth
export class BluetoothService {
  private static instance: BluetoothService;
  private devices: Map<string, BluetoothDevice & { device?: any }> = new Map();
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private userId: string | null = null;
  private isAvailable: boolean = false;

  // Obtener la instancia singleton
  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  // Constructor privado para singleton
  private constructor() {
    // Verificar si la API de Bluetooth está disponible
    this.checkAvailability();

    // Cargar dispositivos guardados
    this.loadSavedDevices();
  }

  // Verificar si la API de Bluetooth está disponible
  private checkAvailability(): void {
    this.isAvailable = typeof navigator !== 'undefined' &&
                      navigator.bluetooth !== undefined;

    console.log(`Bluetooth API ${this.isAvailable ? 'disponible' : 'no disponible'}`);
  }

  // Establecer el ID de usuario
  public setUserId(userId: string): void {
    this.userId = userId;
    this.loadSavedDevices();
  }

  // Cargar dispositivos guardados
  private async loadSavedDevices(): Promise<void> {
    if (!this.userId) return;

    try {
      // Verificar si estamos en el navegador
      if (typeof window !== 'undefined' && window.localStorage) {
        // Cargar desde localStorage primero para acceso rápido
        const storedDevices = localStorage.getItem('bluetoothDevices');
        if (storedDevices) {
          try {
            const devices = JSON.parse(storedDevices) as BluetoothDevice[];
            devices.forEach(device => {
              this.devices.set(device.id, { ...device, connected: false });
            });
          } catch (e) {
            console.warn('Error al parsear dispositivos de localStorage:', e);
            // Si hay error en el parsing, limpiar localStorage
            localStorage.removeItem('bluetoothDevices');
          }
        }
      }

      // Verificar si la tabla existe antes de consultar
      try {
        // Luego intentar cargar desde Supabase
        const { data, error } = await supabase
          .from('bluetooth_devices')
          .select('*')
          .eq('user_id', this.userId);

        if (error) {
          // Si el error es porque la tabla no existe, lo manejamos silenciosamente
          if (error.code === '42P01') { // Código PostgreSQL para "tabla no existe"
            console.info('La tabla bluetooth_devices no existe todavía');
            return;
          }
          throw error;
        }

        if (data && data.length > 0) {
          // Actualizar dispositivos con datos de Supabase
          data.forEach(device => {
            this.devices.set(device.device_id, {
              id: device.device_id,
              name: device.name,
              type: device.type,
              connected: false,
              lastConnected: device.last_connected
            });
          });

          // Actualizar localStorage si estamos en el navegador
          if (typeof window !== 'undefined' && window.localStorage) {
            this.saveDevicesToLocalStorage();
          }
        }
      } catch (supabaseError) {
        console.warn('Error al consultar tabla bluetooth_devices:', supabaseError);
        // Continuamos sin error fatal
      }
    } catch (error) {
      console.error('Error al cargar dispositivos Bluetooth:', error);
    }
  }

  // Guardar dispositivos en localStorage
  private saveDevicesToLocalStorage(): void {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const devices = Array.from(this.devices.values()).map(({ device, ...rest }) => rest);
      localStorage.setItem('bluetoothDevices', JSON.stringify(devices));
    } catch (error) {
      console.warn('Error al guardar dispositivos en localStorage:', error);
    }
  }

  // Guardar dispositivo en Supabase
  private async saveDeviceToSupabase(device: BluetoothDevice): Promise<void> {
    if (!this.userId) return;

    try {
      // Verificar si el dispositivo ya existe
      const { data, error } = await supabase
        .from('bluetooth_devices')
        .select('id')
        .eq('user_id', this.userId)
        .eq('device_id', device.id)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Actualizar dispositivo existente
        const { error: updateError } = await supabase
          .from('bluetooth_devices')
          .update({
            name: device.name,
            type: device.type,
            last_connected: new Date().toISOString()
          })
          .eq('id', data[0].id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('bluetooth_devices')
          .insert([{
            user_id: this.userId,
            device_id: device.id,
            name: device.name,
            type: device.type,
            last_connected: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error al guardar dispositivo Bluetooth:', error);
    }
  }

  // Verificar si Bluetooth está disponible
  public isBluetoothAvailable(): boolean {
    return this.isAvailable;
  }

  // Obtener dispositivos guardados
  public getSavedDevices(): BluetoothDevice[] {
    return Array.from(this.devices.values()).map(({ device, ...rest }) => rest);
  }

  // Buscar dispositivos de frecuencia cardíaca
  public async scanForHeartRateDevices(): Promise<BluetoothDevice[]> {
    if (!this.isAvailable) {
      throw new Error('Bluetooth no disponible en este dispositivo');
    }

    try {
      // Solicitar dispositivo con servicio de frecuencia cardíaca
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: [
          'battery_service',
          DEVICE_INFORMATION_SERVICE
        ]
      });

      if (!device) {
        throw new Error('No se seleccionó ningún dispositivo');
      }

      // Crear objeto de dispositivo
      const bluetoothDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || `Dispositivo ${device.id.substring(0, 8)}`,
        type: 'heart_rate',
        connected: false,
        capabilities: ['heart_rate']
      };

      // Intentar obtener información adicional del dispositivo
      try {
        const server = await device.gatt.connect();

        // Obtener nivel de batería si está disponible
        try {
          const batteryService = await server.getPrimaryService(BATTERY_SERVICE);
          const batteryChar = await batteryService.getCharacteristic(BATTERY_LEVEL_CHARACTERISTIC);
          const batteryValue = await batteryChar.readValue();
          bluetoothDevice.batteryLevel = batteryValue.getUint8(0);
        } catch (e) {
          console.log('Información de batería no disponible');
        }

        // Obtener información del dispositivo si está disponible
        try {
          const infoService = await server.getPrimaryService(DEVICE_INFORMATION_SERVICE);

          try {
            const manufacturerChar = await infoService.getCharacteristic(MANUFACTURER_NAME_CHARACTERISTIC);
            const manufacturerValue = await manufacturerChar.readValue();
            bluetoothDevice.manufacturer = new TextDecoder().decode(manufacturerValue);
          } catch (e) {
            console.log('Información de fabricante no disponible');
          }

          try {
            const modelChar = await infoService.getCharacteristic(MODEL_NUMBER_CHARACTERISTIC);
            const modelValue = await modelChar.readValue();
            bluetoothDevice.model = new TextDecoder().decode(modelValue);
          } catch (e) {
            console.log('Información de modelo no disponible');
          }

          try {
            const firmwareChar = await infoService.getCharacteristic(FIRMWARE_REVISION_CHARACTERISTIC);
            const firmwareValue = await firmwareChar.readValue();
            bluetoothDevice.firmwareVersion = new TextDecoder().decode(firmwareValue);
          } catch (e) {
            console.log('Información de firmware no disponible');
          }
        } catch (e) {
          console.log('Servicio de información no disponible');
        }

        // Desconectar después de obtener la información
        device.gatt.disconnect();
      } catch (e) {
        console.warn('No se pudo obtener información adicional del dispositivo:', e);
      }

      // Guardar dispositivo
      this.devices.set(device.id, {
        ...bluetoothDevice,
        device,
        connected: false
      });

      // Guardar en localStorage
      this.saveDevicesToLocalStorage();

      // Guardar en Supabase
      await this.saveDeviceToSupabase(bluetoothDevice);

      return [bluetoothDevice];
    } catch (error) {
      console.error('Error al buscar dispositivos de frecuencia cardíaca:', error);
      throw error;
    }
  }

  // Buscar dispositivos de actividad física
  public async scanForActivityTrackers(): Promise<BluetoothDevice[]> {
    if (!this.isAvailable) {
      throw new Error('Bluetooth no disponible en este dispositivo');
    }

    try {
      // Solicitar dispositivo con servicios relevantes para actividad física
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [RUNNING_SPEED_CADENCE_SERVICE] },
          { services: [CYCLING_POWER_SERVICE] },
          // Añadir más filtros según sea necesario
        ],
        optionalServices: [
          'battery_service',
          DEVICE_INFORMATION_SERVICE
        ]
      });

      if (!device) {
        throw new Error('No se seleccionó ningún dispositivo');
      }

      // Determinar el tipo de dispositivo basado en los servicios disponibles
      let deviceType: BluetoothDevice['type'] = 'activity_tracker';
      const capabilities: string[] = [];

      // Conectar para verificar servicios disponibles
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      for (const service of services) {
        const serviceUuid = service.uuid;

        if (serviceUuid === RUNNING_SPEED_CADENCE_SERVICE) {
          capabilities.push('running_speed_cadence');
          deviceType = 'running_speed_cadence';
        } else if (serviceUuid === CYCLING_POWER_SERVICE) {
          capabilities.push('cycling_power');
          deviceType = 'cycling_power';
        } else if (serviceUuid === HEART_RATE_SERVICE) {
          capabilities.push('heart_rate');
        }
      }

      // Crear objeto de dispositivo
      const bluetoothDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || `Dispositivo ${device.id.substring(0, 8)}`,
        type: deviceType,
        connected: false,
        capabilities
      };

      // Obtener información adicional del dispositivo
      try {
        // Obtener nivel de batería si está disponible
        try {
          const batteryService = await server.getPrimaryService(BATTERY_SERVICE);
          const batteryChar = await batteryService.getCharacteristic(BATTERY_LEVEL_CHARACTERISTIC);
          const batteryValue = await batteryChar.readValue();
          bluetoothDevice.batteryLevel = batteryValue.getUint8(0);
        } catch (e) {
          console.log('Información de batería no disponible');
        }

        // Obtener información del dispositivo si está disponible
        try {
          const infoService = await server.getPrimaryService(DEVICE_INFORMATION_SERVICE);

          try {
            const manufacturerChar = await infoService.getCharacteristic(MANUFACTURER_NAME_CHARACTERISTIC);
            const manufacturerValue = await manufacturerChar.readValue();
            bluetoothDevice.manufacturer = new TextDecoder().decode(manufacturerValue);
          } catch (e) {
            console.log('Información de fabricante no disponible');
          }

          try {
            const modelChar = await infoService.getCharacteristic(MODEL_NUMBER_CHARACTERISTIC);
            const modelValue = await modelChar.readValue();
            bluetoothDevice.model = new TextDecoder().decode(modelValue);
          } catch (e) {
            console.log('Información de modelo no disponible');
          }

          try {
            const firmwareChar = await infoService.getCharacteristic(FIRMWARE_REVISION_CHARACTERISTIC);
            const firmwareValue = await firmwareChar.readValue();
            bluetoothDevice.firmwareVersion = new TextDecoder().decode(firmwareValue);
          } catch (e) {
            console.log('Información de firmware no disponible');
          }
        } catch (e) {
          console.log('Servicio de información no disponible');
        }
      } catch (e) {
        console.warn('No se pudo obtener información adicional del dispositivo:', e);
      }

      // Desconectar después de obtener la información
      device.gatt.disconnect();

      // Guardar dispositivo
      this.devices.set(device.id, {
        ...bluetoothDevice,
        device,
        connected: false
      });

      // Guardar en localStorage
      this.saveDevicesToLocalStorage();

      // Guardar en Supabase
      await this.saveDeviceToSupabase(bluetoothDevice);

      return [bluetoothDevice];
    } catch (error) {
      console.error('Error al buscar dispositivos de actividad física:', error);
      throw error;
    }
  }

  // Conectar a un dispositivo de frecuencia cardíaca
  public async connectToHeartRateDevice(deviceId: string): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Bluetooth no disponible en este dispositivo');
    }

    const deviceEntry = this.devices.get(deviceId);
    if (!deviceEntry) {
      throw new Error(`Dispositivo ${deviceId} no encontrado`);
    }

    try {
      // Si no tenemos el objeto de dispositivo, necesitamos volver a escanear
      if (!deviceEntry.device) {
        throw new Error('Dispositivo no disponible, vuelve a escanear');
      }

      // Conectar al dispositivo
      await deviceEntry.device.gatt.connect();

      // Obtener servicio de frecuencia cardíaca
      const server = await deviceEntry.device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      // Suscribirse a notificaciones
      await characteristic.startNotifications();

      // Manejar notificaciones
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const heartRateReading = this.parseHeartRate(value);

        // Completar datos del dispositivo
        heartRateReading.deviceId = deviceId;

        // Notificar a los listeners
        this.notifyListeners('heart_rate', heartRateReading);

        // Si hay intervalos RR, notificar también para análisis de VFC
        if (heartRateReading.rrIntervals && heartRateReading.rrIntervals.length > 0) {
          this.notifyListeners('heart_rate_variability', {
            timestamp: heartRateReading.timestamp,
            deviceId: deviceId,
            type: 'heart_rate_variability',
            value: {
              rrIntervals: heartRateReading.rrIntervals,
              averageRR: this.average(heartRateReading.rrIntervals),
              sdnn: this.standardDeviation(heartRateReading.rrIntervals)
            },
            confidence: heartRateReading.confidence
          });
        }
      });

      // Intentar obtener nivel de batería
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');

        // Leer nivel de batería inicial
        const batteryValue = await batteryChar.readValue();
        const batteryLevel = batteryValue.getUint8(0);

        // Actualizar nivel de batería en el dispositivo
        deviceEntry.batteryLevel = batteryLevel;

        // Suscribirse a notificaciones de batería si es posible
        try {
          await batteryChar.startNotifications();
          batteryChar.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const batteryLevel = value.getUint8(0);

            // Actualizar nivel de batería en el dispositivo
            deviceEntry.batteryLevel = batteryLevel;
            this.devices.set(deviceId, deviceEntry);

            // Notificar a los listeners
            this.notifyListeners('battery_level', {
              timestamp: Date.now(),
              deviceId: deviceId,
              type: 'battery_level',
              value: batteryLevel
            });
          });
        } catch (e) {
          console.log('No se pudo suscribir a notificaciones de batería');
        }
      } catch (e) {
        console.log('Servicio de batería no disponible');
      }

      // Actualizar estado del dispositivo
      deviceEntry.connected = true;
      this.devices.set(deviceId, deviceEntry);

      // Actualizar en Supabase
      await this.saveDeviceToSupabase({
        ...deviceEntry,
        connected: true,
        lastConnected: new Date()
      });

      return true;
    } catch (error) {
      console.error(`Error al conectar al dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  // Conectar a un dispositivo de actividad física
  public async connectToActivityTracker(deviceId: string): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Bluetooth no disponible en este dispositivo');
    }

    const deviceEntry = this.devices.get(deviceId);
    if (!deviceEntry) {
      throw new Error(`Dispositivo ${deviceId} no encontrado`);
    }

    try {
      // Si no tenemos el objeto de dispositivo, necesitamos volver a escanear
      if (!deviceEntry.device) {
        throw new Error('Dispositivo no disponible, vuelve a escanear');
      }

      // Conectar al dispositivo
      await deviceEntry.device.gatt.connect();
      const server = await deviceEntry.device.gatt.connect();

      // Verificar qué servicios están disponibles
      const capabilities = deviceEntry.capabilities || [];

      // Conectar a servicio de velocidad y cadencia de carrera si está disponible
      if (capabilities.includes('running_speed_cadence')) {
        try {
          const rscService = await server.getPrimaryService(RUNNING_SPEED_CADENCE_SERVICE);
          const rscChar = await rscService.getCharacteristic(RSC_MEASUREMENT_CHARACTERISTIC);

          // Suscribirse a notificaciones
          await rscChar.startNotifications();

          // Manejar notificaciones
          rscChar.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const activityReading = this.parseRunningSpeedCadence(value);

            // Completar datos del dispositivo
            activityReading.deviceId = deviceId;

            // Notificar a los listeners
            this.notifyListeners('running_speed_cadence', activityReading);
          });

          console.log('Conectado a servicio de velocidad y cadencia de carrera');
        } catch (e) {
          console.error('Error al conectar al servicio de velocidad y cadencia:', e);
        }
      }

      // Conectar a servicio de potencia de ciclismo si está disponible
      if (capabilities.includes('cycling_power')) {
        try {
          const powerService = await server.getPrimaryService(CYCLING_POWER_SERVICE);
          const powerChar = await powerService.getCharacteristic(CYCLING_POWER_MEASUREMENT_CHARACTERISTIC);

          // Suscribirse a notificaciones
          await powerChar.startNotifications();

          // Manejar notificaciones (implementación simplificada)
          powerChar.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;

            // Parseo simplificado, en una implementación real sería más completo
            const flags = value.getUint16(0, true);
            const power = value.getInt16(2, true); // Potencia instantánea en vatios

            // Notificar a los listeners
            this.notifyListeners('cycling_power', {
              timestamp: Date.now(),
              deviceId: deviceId,
              type: 'cycling_power',
              value: power,
              confidence: 95,
              metadata: {
                flags
              }
            });
          });

          console.log('Conectado a servicio de potencia de ciclismo');
        } catch (e) {
          console.error('Error al conectar al servicio de potencia:', e);
        }
      }

      // Conectar a servicio de frecuencia cardíaca si está disponible
      if (capabilities.includes('heart_rate')) {
        try {
          const hrService = await server.getPrimaryService(HEART_RATE_SERVICE);
          const hrChar = await hrService.getCharacteristic(HEART_RATE_CHARACTERISTIC);

          // Suscribirse a notificaciones
          await hrChar.startNotifications();

          // Manejar notificaciones
          hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const heartRateReading = this.parseHeartRate(value);

            // Completar datos del dispositivo
            heartRateReading.deviceId = deviceId;

            // Notificar a los listeners
            this.notifyListeners('heart_rate', heartRateReading);
          });

          console.log('Conectado a servicio de frecuencia cardíaca');
        } catch (e) {
          console.error('Error al conectar al servicio de frecuencia cardíaca:', e);
        }
      }

      // Intentar obtener nivel de batería
      try {
        const batteryService = await server.getPrimaryService(BATTERY_SERVICE);
        const batteryChar = await batteryService.getCharacteristic(BATTERY_LEVEL_CHARACTERISTIC);

        // Leer nivel de batería inicial
        const batteryValue = await batteryChar.readValue();
        const batteryLevel = batteryValue.getUint8(0);

        // Actualizar nivel de batería en el dispositivo
        deviceEntry.batteryLevel = batteryLevel;

        // Suscribirse a notificaciones de batería si es posible
        try {
          await batteryChar.startNotifications();
          batteryChar.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const batteryLevel = value.getUint8(0);

            // Actualizar nivel de batería en el dispositivo
            deviceEntry.batteryLevel = batteryLevel;
            this.devices.set(deviceId, deviceEntry);

            // Notificar a los listeners
            this.notifyListeners('battery_level', {
              timestamp: Date.now(),
              deviceId: deviceId,
              type: 'battery_level',
              value: batteryLevel
            });
          });
        } catch (e) {
          console.log('No se pudo suscribir a notificaciones de batería');
        }
      } catch (e) {
        console.log('Servicio de batería no disponible');
      }

      // Actualizar estado del dispositivo
      deviceEntry.connected = true;
      this.devices.set(deviceId, deviceEntry);

      // Actualizar en Supabase
      await this.saveDeviceToSupabase({
        ...deviceEntry,
        connected: true,
        lastConnected: new Date()
      });

      return true;
    } catch (error) {
      console.error(`Error al conectar al dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  // Método auxiliar para calcular promedio
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Método auxiliar para calcular desviación estándar
  private standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = this.average(values);
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const avgSquareDiff = this.average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  // Desconectar de un dispositivo
  public async disconnectDevice(deviceId: string): Promise<boolean> {
    const deviceEntry = this.devices.get(deviceId);
    if (!deviceEntry || !deviceEntry.device) {
      return false;
    }

    try {
      // Desconectar GATT
      if (deviceEntry.device.gatt.connected) {
        deviceEntry.device.gatt.disconnect();
      }

      // Actualizar estado
      deviceEntry.connected = false;
      this.devices.set(deviceId, deviceEntry);

      return true;
    } catch (error) {
      console.error(`Error al desconectar dispositivo ${deviceId}:`, error);
      return false;
    }
  }

  // Parsear datos de frecuencia cardíaca según la especificación Bluetooth
  private parseHeartRate(value: DataView): HeartRateReading {
    // Bit 0 del primer byte indica el formato (0: UINT8, 1: UINT16)
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    const contactDetected = ((flags >> 1) & 0x1) === 1;
    const contactSensorPresent = ((flags >> 2) & 0x1) === 1;
    const energyExpendedPresent = ((flags >> 3) & 0x1) === 1;
    const rrIntervalsPresent = ((flags >> 4) & 0x1) === 1;

    // Leer valor según formato
    let heartRate: number;
    let offset = 1;

    if (rate16Bits) {
      heartRate = value.getUint16(offset, true);
      offset += 2;
    } else {
      heartRate = value.getUint8(offset);
      offset += 1;
    }

    // Leer energía expendida si está presente
    let energyExpended: number | undefined;
    if (energyExpendedPresent) {
      energyExpended = value.getUint16(offset, true);
      offset += 2;
    }

    // Leer intervalos RR si están presentes
    const rrIntervals: number[] = [];
    if (rrIntervalsPresent) {
      // Cada intervalo RR es un uint16 (2 bytes)
      // Calcular cuántos intervalos hay en los bytes restantes
      const remainingBytes = value.byteLength - offset;
      const numIntervals = Math.floor(remainingBytes / 2);

      for (let i = 0; i < numIntervals; i++) {
        // Los intervalos RR están en unidades de 1/1024 segundos
        const rrInterval = value.getUint16(offset, true);
        // Convertir a milisegundos
        rrIntervals.push((rrInterval * 1000) / 1024);
        offset += 2;
      }
    }

    return {
      timestamp: Date.now(),
      deviceId: '', // Se completará al notificar
      type: 'heart_rate',
      value: heartRate,
      energyExpended,
      rrIntervals: rrIntervals.length > 0 ? rrIntervals : undefined,
      sensorContact: contactSensorPresent ? contactDetected : undefined,
      confidence: contactDetected ? 95 : 80 // Mayor confianza si hay contacto con el sensor
    };
  }

  // Parsear datos de velocidad y cadencia de carrera
  private parseRunningSpeedCadence(value: DataView): ActivityReading {
    const flags = value.getUint8(0);
    const isInstantaneousPacePresent = ((flags >> 0) & 0x1) === 1;
    const isInstantaneousCadencePresent = ((flags >> 1) & 0x1) === 1;
    const isInstantaneousStridePresent = ((flags >> 2) & 0x1) === 1;
    const isDistancePresent = ((flags >> 3) & 0x1) === 1;

    let offset = 1;

    // Velocidad instantánea en m/s (uint16)
    const speed = value.getUint16(offset, true) / 256;
    offset += 2;

    // Cadencia instantánea en pasos/minuto (uint8)
    let cadence = 0;
    if (isInstantaneousCadencePresent) {
      cadence = value.getUint8(offset);
      offset += 1;
    }

    // Distancia recorrida en metros (uint32)
    let distance = 0;
    if (isDistancePresent) {
      distance = value.getUint32(offset, true);
      offset += 4;
    }

    // Calcular calorías quemadas (estimación basada en velocidad y distancia)
    // Esta es una estimación muy básica, en una implementación real se usarían
    // algoritmos más sofisticados que consideren peso, altura, etc.
    const calories = distance > 0 ? Math.round(distance * 0.06) : Math.round(speed * 60 * 0.06);

    return {
      timestamp: Date.now(),
      deviceId: '', // Se completará al notificar
      type: 'running_speed_cadence',
      value: {
        steps: undefined, // No proporcionado directamente por este servicio
        distance,
        calories,
        cadence,
        // Convertir m/s a min/km para ritmo
        pace: speed > 0 ? (1000 / 60) / speed : 0
      },
      confidence: 90,
      metadata: {
        speedMps: speed,
        instantaneousPacePresent: isInstantaneousPacePresent,
        instantaneousCadencePresent: isInstantaneousCadencePresent,
        instantaneousStridePresent: isInstantaneousStridePresent,
        distancePresent: isDistancePresent
      }
    };
  }

  // Agregar listener para datos de dispositivos
  public addDeviceListener(type: string, listener: (data: DeviceReading) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)?.push(listener);
  }

  // Eliminar listener
  public removeDeviceListener(type: string, listener: (data: DeviceReading) => void): void {
    if (!this.listeners.has(type)) return;

    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      this.listeners.set(type, typeListeners.filter(l => l !== listener));
    }
  }

  // Notificar a los listeners
  private notifyListeners(type: string, data: DeviceReading): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener(data));
    }
  }
}
