/**
 * Servicio para sincronizar datos entre IndexedDB y Supabase
 * Maneja la sincronización en segundo plano y la resolución de conflictos
 */

import { supabase } from './supabase-client';
import { IndexedDBService, STORES, PendingSyncRecord } from './indexed-db-service';
import { v4 as uuidv4 } from 'uuid';

// Configuración de sincronización
interface SyncConfig {
  // Intervalo de sincronización en milisegundos
  syncInterval: number;
  // Número máximo de intentos de sincronización
  maxRetries: number;
  // Tiempo de espera entre reintentos en milisegundos
  retryDelay: number;
  // Tamaño máximo del lote para sincronización
  batchSize: number;
  // Prioridad de sincronización por almacén (mayor número = mayor prioridad)
  priorities: Record<string, number>;
  // Estrategia de resolución de conflictos por almacén
  conflictResolution: Record<string, 'client-wins' | 'server-wins' | 'manual'>;
}

// Configuración predeterminada
const DEFAULT_CONFIG: SyncConfig = {
  syncInterval: 60000, // 1 minuto
  maxRetries: 5,
  retryDelay: 30000, // 30 segundos
  batchSize: 50,
  priorities: {
    [STORES.HEALTH_DATA]: 10,
    [STORES.HEALTH_GOALS]: 9,
    [STORES.ROUTES]: 8,
    [STORES.BLUETOOTH_DEVICES]: 7,
    [STORES.SENSOR_DATA]: 6,
    [STORES.USER_SETTINGS]: 5
  },
  conflictResolution: {
    [STORES.HEALTH_DATA]: 'server-wins',
    [STORES.HEALTH_GOALS]: 'client-wins',
    [STORES.ROUTES]: 'client-wins',
    [STORES.BLUETOOTH_DEVICES]: 'server-wins',
    [STORES.SENSOR_DATA]: 'client-wins',
    [STORES.USER_SETTINGS]: 'client-wins'
  }
};

// Estado de la conexión
enum ConnectionState {
  ONLINE,
  OFFLINE,
  RECONNECTING
}

// Clase principal para sincronización
export class SyncService {
  private static instance: SyncService;
  private indexedDB: IndexedDBService;
  private config: SyncConfig;
  private syncTimer: number | null = null;
  private isSyncing: boolean = false;
  private userId: string | null = null;
  private connectionState: ConnectionState = ConnectionState.ONLINE;
  private listeners: Array<(state: ConnectionState) => void> = [];
  private syncListeners: Array<(progress: number, total: number) => void> = [];
  private lastSyncTime: number = 0;
  private networkStatusListener: any = null;
  
  // Obtener la instancia singleton
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }
  
  // Constructor privado para singleton
  private constructor() {
    this.indexedDB = IndexedDBService.getInstance();
    this.config = { ...DEFAULT_CONFIG };
    
    // Inicializar monitoreo de conexión
    this.initNetworkMonitoring();
  }
  
  // Inicializar monitoreo de conexión
  private initNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Verificar estado inicial
      this.connectionState = navigator.onLine ? ConnectionState.ONLINE : ConnectionState.OFFLINE;
      
      // Configurar listeners para cambios de conexión
      this.networkStatusListener = {
        online: () => this.handleConnectionChange(true),
        offline: () => this.handleConnectionChange(false)
      };
      
      window.addEventListener('online', this.networkStatusListener.online);
      window.addEventListener('offline', this.networkStatusListener.offline);
    }
  }
  
  // Manejar cambios en la conexión
  private handleConnectionChange(isOnline: boolean): void {
    const previousState = this.connectionState;
    
    if (isOnline) {
      this.connectionState = ConnectionState.ONLINE;
      console.log('Conexión restablecida. Iniciando sincronización...');
      
      // Intentar sincronizar datos pendientes
      this.syncPendingData();
    } else {
      this.connectionState = ConnectionState.OFFLINE;
      console.log('Conexión perdida. Cambiando a modo offline...');
    }
    
    // Notificar a los listeners si el estado cambió
    if (previousState !== this.connectionState) {
      this.notifyConnectionListeners();
    }
  }
  
  // Notificar a los listeners de conexión
  private notifyConnectionListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.connectionState);
      } catch (error) {
        console.error('Error en listener de conexión:', error);
      }
    });
  }
  
  // Notificar a los listeners de sincronización
  private notifySyncListeners(progress: number, total: number): void {
    this.syncListeners.forEach(listener => {
      try {
        listener(progress, total);
      } catch (error) {
        console.error('Error en listener de sincronización:', error);
      }
    });
  }
  
  // Establecer el ID de usuario
  public setUserId(userId: string): void {
    this.userId = userId;
  }
  
  // Configurar el servicio
  public configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  // Iniciar sincronización automática
  public startAutoSync(): void {
    if (this.syncTimer !== null) {
      this.stopAutoSync();
    }
    
    this.syncTimer = window.setInterval(() => {
      this.syncPendingData();
    }, this.config.syncInterval);
    
    console.log(`Sincronización automática iniciada (intervalo: ${this.config.syncInterval}ms)`);
  }
  
  // Detener sincronización automática
  public stopAutoSync(): void {
    if (this.syncTimer !== null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('Sincronización automática detenida');
    }
  }
  
  // Agregar listener de conexión
  public addConnectionListener(listener: (state: ConnectionState) => void): void {
    this.listeners.push(listener);
    // Notificar inmediatamente con el estado actual
    listener(this.connectionState);
  }
  
  // Eliminar listener de conexión
  public removeConnectionListener(listener: (state: ConnectionState) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  // Agregar listener de sincronización
  public addSyncListener(listener: (progress: number, total: number) => void): void {
    this.syncListeners.push(listener);
  }
  
  // Eliminar listener de sincronización
  public removeSyncListener(listener: (progress: number, total: number) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }
  
  // Obtener estado de conexión
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  // Verificar si está en línea
  public isOnline(): boolean {
    return this.connectionState === ConnectionState.ONLINE;
  }
  
  // Obtener tiempo de última sincronización
  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }
  
  // Sincronizar datos pendientes
  public async syncPendingData(): Promise<boolean> {
    // Verificar si ya está sincronizando
    if (this.isSyncing) {
      console.log('Ya hay una sincronización en progreso');
      return false;
    }
    
    // Verificar si hay conexión
    if (this.connectionState === ConnectionState.OFFLINE) {
      console.log('No hay conexión. No se puede sincronizar');
      return false;
    }
    
    // Verificar si hay un usuario
    if (!this.userId) {
      console.log('No hay usuario. No se puede sincronizar');
      return false;
    }
    
    try {
      this.isSyncing = true;
      
      // Obtener registros pendientes de sincronización
      const pendingRecords = await this.getPendingSyncRecords();
      
      if (pendingRecords.length === 0) {
        console.log('No hay datos pendientes de sincronización');
        this.isSyncing = false;
        return true;
      }
      
      console.log(`Sincronizando ${pendingRecords.length} registros pendientes...`);
      
      // Procesar registros en lotes
      const batches = this.createBatches(pendingRecords);
      let processedCount = 0;
      let successCount = 0;
      
      for (const batch of batches) {
        // Notificar progreso
        this.notifySyncListeners(processedCount, pendingRecords.length);
        
        // Procesar lote
        const batchResults = await this.processBatch(batch);
        
        // Actualizar contadores
        processedCount += batch.length;
        successCount += batchResults.filter(r => r).length;
      }
      
      // Notificar progreso final
      this.notifySyncListeners(pendingRecords.length, pendingRecords.length);
      
      // Actualizar tiempo de última sincronización
      this.lastSyncTime = Date.now();
      
      console.log(`Sincronización completada. ${successCount}/${pendingRecords.length} registros sincronizados correctamente`);
      
      return successCount === pendingRecords.length;
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Obtener registros pendientes de sincronización
  private async getPendingSyncRecords(): Promise<PendingSyncRecord[]> {
    if (!this.userId) return [];
    
    // Obtener todos los registros pendientes
    const allRecords = await this.indexedDB.getByIndex<PendingSyncRecord>(
      STORES.PENDING_SYNC,
      'userId',
      this.userId
    );
    
    // Ordenar por prioridad (mayor primero) y timestamp (más antiguo primero)
    return allRecords.sort((a, b) => {
      // Primero por prioridad
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;
      
      // Luego por timestamp
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }
  
  // Crear lotes para procesamiento
  private createBatches<T>(items: T[]): T[][] {
    const batches: T[][] = [];
    const batchSize = this.config.batchSize;
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  // Procesar un lote de registros
  private async processBatch(records: PendingSyncRecord[]): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const record of records) {
      try {
        // Procesar según la operación
        let success = false;
        
        switch (record.operation) {
          case 'create':
            success = await this.syncCreate(record);
            break;
          case 'update':
            success = await this.syncUpdate(record);
            break;
          case 'delete':
            success = await this.syncDelete(record);
            break;
        }
        
        // Si tuvo éxito, eliminar de pendientes
        if (success) {
          await this.indexedDB.delete(STORES.PENDING_SYNC, record.id);
        } else {
          // Incrementar intentos
          record.attempts += 1;
          
          // Si excede los intentos máximos, marcar como fallido permanente
          if (record.attempts >= this.config.maxRetries) {
            console.warn(`Registro ${record.id} excedió el número máximo de intentos. Se eliminará.`);
            await this.indexedDB.delete(STORES.PENDING_SYNC, record.id);
          } else {
            // Actualizar registro con nuevo intento
            await this.indexedDB.update(STORES.PENDING_SYNC, record);
          }
        }
        
        results.push(success);
      } catch (error) {
        console.error(`Error al procesar registro ${record.id}:`, error);
        results.push(false);
      }
    }
    
    return results;
  }
  
  // Sincronizar creación
  private async syncCreate(record: PendingSyncRecord): Promise<boolean> {
    try {
      // Mapear almacén a tabla de Supabase
      const tableName = this.getSupabaseTableName(record.store);
      
      // Preparar datos para Supabase (convertir a snake_case)
      const data = this.prepareDataForSupabase(record.data);
      
      // Insertar en Supabase
      const { error } = await supabase
        .from(tableName)
        .insert([data]);
      
      if (error) {
        console.error(`Error al crear registro en Supabase (${tableName}):`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error inesperado al sincronizar creación:`, error);
      return false;
    }
  }
  
  // Sincronizar actualización
  private async syncUpdate(record: PendingSyncRecord): Promise<boolean> {
    try {
      // Mapear almacén a tabla de Supabase
      const tableName = this.getSupabaseTableName(record.store);
      
      // Preparar datos para Supabase (convertir a snake_case)
      const data = this.prepareDataForSupabase(record.data);
      
      // Verificar si hay conflictos
      const conflictResolution = this.config.conflictResolution[record.store] || 'server-wins';
      
      if (conflictResolution === 'server-wins') {
        // Verificar versión en servidor
        const { data: serverData, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', record.recordId)
          .single();
        
        if (fetchError) {
          // Si no existe en el servidor, tratar como creación
          return this.syncCreate(record);
        }
        
        // Comparar timestamps
        const serverTimestamp = new Date(serverData.last_updated || serverData.updated_at || 0).getTime();
        const clientTimestamp = new Date(data.last_updated || data.updated_at || 0).getTime();
        
        if (serverTimestamp > clientTimestamp) {
          console.log(`Conflicto resuelto a favor del servidor para ${record.recordId}`);
          return true; // Considerar como sincronizado (el servidor gana)
        }
      }
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', record.recordId);
      
      if (error) {
        console.error(`Error al actualizar registro en Supabase (${tableName}):`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error inesperado al sincronizar actualización:`, error);
      return false;
    }
  }
  
  // Sincronizar eliminación
  private async syncDelete(record: PendingSyncRecord): Promise<boolean> {
    try {
      // Mapear almacén a tabla de Supabase
      const tableName = this.getSupabaseTableName(record.store);
      
      // Eliminar de Supabase
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', record.recordId);
      
      if (error) {
        console.error(`Error al eliminar registro de Supabase (${tableName}):`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error inesperado al sincronizar eliminación:`, error);
      return false;
    }
  }
  
  // Mapear almacén a tabla de Supabase
  private getSupabaseTableName(storeName: string): string {
    const mapping: Record<string, string> = {
      [STORES.HEALTH_DATA]: 'health_data',
      [STORES.HEALTH_GOALS]: 'health_goals',
      [STORES.ROUTES]: 'routes',
      [STORES.BLUETOOTH_DEVICES]: 'bluetooth_devices',
      [STORES.SENSOR_DATA]: 'sensor_data',
      [STORES.USER_SETTINGS]: 'user_settings'
    };
    
    return mapping[storeName] || storeName;
  }
  
  // Preparar datos para Supabase (convertir a snake_case)
  private prepareDataForSupabase(data: any): any {
    if (!data) return data;
    
    const result: any = {};
    
    // Convertir camelCase a snake_case
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = value;
    }
    
    return result;
  }
  
  // Agregar operación pendiente
  public async addPendingOperation(
    store: string,
    operation: 'create' | 'update' | 'delete',
    recordId: string,
    data?: any
  ): Promise<string | null> {
    if (!this.userId) return null;
    
    const pendingRecord: Omit<PendingSyncRecord, 'id'> = {
      userId: this.userId,
      store,
      recordId,
      operation,
      data: data || null,
      timestamp: new Date().toISOString(),
      attempts: 0,
      priority: this.config.priorities[store] || 0
    };
    
    return this.indexedDB.add<Omit<PendingSyncRecord, 'id'>>(STORES.PENDING_SYNC, pendingRecord);
  }
  
  // Limpiar
  public destroy(): void {
    // Detener sincronización automática
    this.stopAutoSync();
    
    // Eliminar listeners de red
    if (this.networkStatusListener) {
      window.removeEventListener('online', this.networkStatusListener.online);
      window.removeEventListener('offline', this.networkStatusListener.offline);
    }
  }
}

// Exportar tipo de estado de conexión
export { ConnectionState };
