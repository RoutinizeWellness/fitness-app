/**
 * Servicio para manejar el almacenamiento local con IndexedDB
 * Proporciona una capa de abstracción para operaciones CRUD en IndexedDB
 */

// Nombre y versión de la base de datos
const DB_NAME = 'routinizeHealthDB';
const DB_VERSION = 1;

// Nombres de los almacenes de objetos (tablas)
export const STORES = {
  HEALTH_DATA: 'healthData',
  HEALTH_GOALS: 'healthGoals',
  PENDING_SYNC: 'pendingSync',
  SENSOR_DATA: 'sensorData',
  BLUETOOTH_DEVICES: 'bluetoothDevices',
  ROUTES: 'routes',
  USER_SETTINGS: 'userSettings',
  OFFLINE_ASSETS: 'offlineAssets'
};

// Tipos para los datos almacenados
export interface HealthDataRecord {
  id: string;
  userId: string;
  date: string;
  steps?: number;
  heart_rate?: number;
  calories_burned?: number;
  active_minutes?: number;
  distance?: number;
  sleep_duration?: number;
  water_intake?: number;
  last_updated: string;
  synced: boolean;
}

export interface HealthGoalsRecord {
  id: string;
  userId: string;
  steps: number;
  heart_rate_min: number;
  heart_rate_max: number;
  calories: number;
  active_minutes: number;
  sleep_duration: number;
  water_intake: number;
  last_updated: string;
  synced: boolean;
}

export interface PendingSyncRecord {
  id: string;
  userId: string;
  store: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  attempts: number;
  priority: number;
}

export interface SensorDataRecord {
  id: string;
  userId: string;
  type: string;
  timestamp: string;
  values: any;
  processed: boolean;
}

export interface RouteRecord {
  id: string;
  userId: string;
  name: string;
  startTime: string;
  endTime?: string;
  totalDistance: number;
  averagePace?: number;
  activityType: string;
  points: any[];
  synced: boolean;
}

export interface UserSettingsRecord {
  id: string;
  userId: string;
  powerSavingMode: boolean;
  syncFrequency: number;
  sensorSamplingRate: number;
  offlineMode: boolean;
  theme: string;
  language: string;
  notifications: boolean;
  last_updated: string;
}

// Clase principal para manejar IndexedDB
export class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBDatabase | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<boolean> | null = null;
  private openRequests: IDBOpenDBRequest[] = [];

  // Obtener la instancia singleton
  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  // Constructor privado para singleton
  private constructor() {}

  // Inicializar la base de datos
  public async init(): Promise<boolean> {
    // Si ya está inicializada, devolver true
    if (this.db) return true;

    // Si ya está inicializando, esperar a que termine
    if (this.isInitializing) {
      return this.initPromise || false;
    }

    this.isInitializing = true;
    this.initPromise = new Promise<boolean>((resolve, reject) => {
      try {
        // Verificar si IndexedDB está disponible
        if (!window.indexedDB) {
          console.error('IndexedDB no está disponible en este navegador');
          this.isInitializing = false;
          resolve(false);
          return;
        }

        // Abrir la base de datos
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        this.openRequests.push(request);

        // Manejar errores
        request.onerror = (event) => {
          console.error('Error al abrir IndexedDB:', request.error);
          this.isInitializing = false;
          resolve(false);
        };

        // Manejar éxito
        request.onsuccess = (event) => {
          this.db = request.result;
          console.log('IndexedDB inicializada correctamente');
          
          // Configurar manejo de errores
          this.db.onerror = (event) => {
            console.error('Error en IndexedDB:', (event.target as any).error);
          };
          
          this.isInitializing = false;
          resolve(true);
          
          // Limpiar solicitudes abiertas
          this.openRequests = this.openRequests.filter(req => req !== request);
        };

        // Manejar actualización de la base de datos
        request.onupgradeneeded = (event) => {
          const db = request.result;
          
          // Crear almacenes de objetos si no existen
          if (!db.objectStoreNames.contains(STORES.HEALTH_DATA)) {
            const healthDataStore = db.createObjectStore(STORES.HEALTH_DATA, { keyPath: 'id' });
            healthDataStore.createIndex('userId', 'userId', { unique: false });
            healthDataStore.createIndex('date', 'date', { unique: false });
            healthDataStore.createIndex('synced', 'synced', { unique: false });
            healthDataStore.createIndex('userId_date', ['userId', 'date'], { unique: true });
          }
          
          if (!db.objectStoreNames.contains(STORES.HEALTH_GOALS)) {
            const healthGoalsStore = db.createObjectStore(STORES.HEALTH_GOALS, { keyPath: 'id' });
            healthGoalsStore.createIndex('userId', 'userId', { unique: true });
            healthGoalsStore.createIndex('synced', 'synced', { unique: false });
          }
          
          if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
            const pendingSyncStore = db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'id' });
            pendingSyncStore.createIndex('userId', 'userId', { unique: false });
            pendingSyncStore.createIndex('store', 'store', { unique: false });
            pendingSyncStore.createIndex('timestamp', 'timestamp', { unique: false });
            pendingSyncStore.createIndex('priority', 'priority', { unique: false });
          }
          
          if (!db.objectStoreNames.contains(STORES.SENSOR_DATA)) {
            const sensorDataStore = db.createObjectStore(STORES.SENSOR_DATA, { keyPath: 'id' });
            sensorDataStore.createIndex('userId', 'userId', { unique: false });
            sensorDataStore.createIndex('type', 'type', { unique: false });
            sensorDataStore.createIndex('timestamp', 'timestamp', { unique: false });
            sensorDataStore.createIndex('processed', 'processed', { unique: false });
          }
          
          if (!db.objectStoreNames.contains(STORES.BLUETOOTH_DEVICES)) {
            const bluetoothDevicesStore = db.createObjectStore(STORES.BLUETOOTH_DEVICES, { keyPath: 'id' });
            bluetoothDevicesStore.createIndex('userId', 'userId', { unique: false });
            bluetoothDevicesStore.createIndex('deviceId', 'deviceId', { unique: true });
          }
          
          if (!db.objectStoreNames.contains(STORES.ROUTES)) {
            const routesStore = db.createObjectStore(STORES.ROUTES, { keyPath: 'id' });
            routesStore.createIndex('userId', 'userId', { unique: false });
            routesStore.createIndex('startTime', 'startTime', { unique: false });
            routesStore.createIndex('synced', 'synced', { unique: false });
          }
          
          if (!db.objectStoreNames.contains(STORES.USER_SETTINGS)) {
            const userSettingsStore = db.createObjectStore(STORES.USER_SETTINGS, { keyPath: 'id' });
            userSettingsStore.createIndex('userId', 'userId', { unique: true });
          }
          
          if (!db.objectStoreNames.contains(STORES.OFFLINE_ASSETS)) {
            const offlineAssetsStore = db.createObjectStore(STORES.OFFLINE_ASSETS, { keyPath: 'id' });
            offlineAssetsStore.createIndex('url', 'url', { unique: true });
            offlineAssetsStore.createIndex('type', 'type', { unique: false });
            offlineAssetsStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      } catch (error) {
        console.error('Error inesperado al inicializar IndexedDB:', error);
        this.isInitializing = false;
        resolve(false);
      }
    });

    return this.initPromise;
  }

  // Cerrar la base de datos
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    // Abortar cualquier solicitud pendiente
    this.openRequests.forEach(request => {
      try {
        request.transaction?.abort();
      } catch (e) {
        // Ignorar errores al abortar
      }
    });
    this.openRequests = [];
  }

  // Métodos CRUD genéricos
  
  // Añadir un registro
  public async add<T>(storeName: string, data: T): Promise<string | null> {
    if (!await this.init()) return null;
    if (!this.db) return null;
    
    return new Promise<string | null>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Asegurarse de que el objeto tiene un ID
        const dataWithId = this.ensureId(data);
        
        const request = store.add(dataWithId);
        
        request.onsuccess = () => {
          resolve(dataWithId.id);
        };
        
        request.onerror = () => {
          console.error(`Error al añadir registro en ${storeName}:`, request.error);
          resolve(null);
        };
      } catch (error) {
        console.error(`Error inesperado al añadir registro en ${storeName}:`, error);
        resolve(null);
      }
    });
  }
  
  // Obtener un registro por ID
  public async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!await this.init()) return null;
    if (!this.db) return null;
    
    return new Promise<T | null>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = () => {
          console.error(`Error al obtener registro de ${storeName}:`, request.error);
          resolve(null);
        };
      } catch (error) {
        console.error(`Error inesperado al obtener registro de ${storeName}:`, error);
        resolve(null);
      }
    });
  }
  
  // Actualizar un registro
  public async update<T>(storeName: string, data: T): Promise<boolean> {
    if (!await this.init()) return false;
    if (!this.db) return false;
    
    return new Promise<boolean>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          console.error(`Error al actualizar registro en ${storeName}:`, request.error);
          resolve(false);
        };
      } catch (error) {
        console.error(`Error inesperado al actualizar registro en ${storeName}:`, error);
        resolve(false);
      }
    });
  }
  
  // Eliminar un registro
  public async delete(storeName: string, id: string): Promise<boolean> {
    if (!await this.init()) return false;
    if (!this.db) return false;
    
    return new Promise<boolean>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          console.error(`Error al eliminar registro de ${storeName}:`, request.error);
          resolve(false);
        };
      } catch (error) {
        console.error(`Error inesperado al eliminar registro de ${storeName}:`, error);
        resolve(false);
      }
    });
  }
  
  // Obtener todos los registros
  public async getAll<T>(storeName: string): Promise<T[]> {
    if (!await this.init()) return [];
    if (!this.db) return [];
    
    return new Promise<T[]>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          console.error(`Error al obtener todos los registros de ${storeName}:`, request.error);
          resolve([]);
        };
      } catch (error) {
        console.error(`Error inesperado al obtener todos los registros de ${storeName}:`, error);
        resolve([]);
      }
    });
  }
  
  // Obtener registros por índice
  public async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    if (!await this.init()) return [];
    if (!this.db) return [];
    
    return new Promise<T[]>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          console.error(`Error al obtener registros por índice ${indexName} de ${storeName}:`, request.error);
          resolve([]);
        };
      } catch (error) {
        console.error(`Error inesperado al obtener registros por índice ${indexName} de ${storeName}:`, error);
        resolve([]);
      }
    });
  }
  
  // Limpiar un almacén
  public async clear(storeName: string): Promise<boolean> {
    if (!await this.init()) return false;
    if (!this.db) return false;
    
    return new Promise<boolean>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          console.error(`Error al limpiar almacén ${storeName}:`, request.error);
          resolve(false);
        };
      } catch (error) {
        console.error(`Error inesperado al limpiar almacén ${storeName}:`, error);
        resolve(false);
      }
    });
  }
  
  // Contar registros
  public async count(storeName: string): Promise<number> {
    if (!await this.init()) return 0;
    if (!this.db) return 0;
    
    return new Promise<number>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => {
          resolve(request.result || 0);
        };
        
        request.onerror = () => {
          console.error(`Error al contar registros en ${storeName}:`, request.error);
          resolve(0);
        };
      } catch (error) {
        console.error(`Error inesperado al contar registros en ${storeName}:`, error);
        resolve(0);
      }
    });
  }
  
  // Asegurarse de que un objeto tiene un ID
  private ensureId<T>(data: T): T & { id: string } {
    if ((data as any).id) {
      return data as T & { id: string };
    }
    
    // Generar un ID único
    const id = crypto.randomUUID ? crypto.randomUUID() : 
               `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    return { ...data as object, id } as T & { id: string };
  }
}
