import { createClient, SupabaseClient, PostgrestError } from "@supabase/supabase-js"

// Usar variables de entorno para las credenciales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://soviwrzrgskhvgcmujfj.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s"

// Configuración para reintentos
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// Clase para mejorar el cliente de Supabase
class EnhancedSupabaseClient {
  private client: SupabaseClient
  private connectionStatus: 'unknown' | 'connected' | 'disconnected' = 'unknown'
  private connectionPromise: Promise<boolean> | null = null
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos por defecto

  constructor() {
    // Crear el cliente de Supabase con opciones mejoradas
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: {
          'x-application-name': 'routinize-fitness-app',
        },
      },
    })

    // Verificar la conexión al inicializar
    this.checkConnection()
  }

  // Método para acceder al cliente original de Supabase
  get supabase(): SupabaseClient {
    return this.client
  }

  // Verificar la conexión a Supabase
  async checkConnection(): Promise<boolean> {
    // Si ya hay una verificación en curso, devolver esa promesa
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    // Crear una nueva promesa para verificar la conexión
    this.connectionPromise = new Promise(async (resolve) => {
      try {
        console.log("Verificando conexión a Supabase...")
        const { error } = await this.client.from('profiles').select('count', { count: 'exact', head: true })

        if (error) {
          console.error("Error de conexión a Supabase:", error)
          this.connectionStatus = 'disconnected'
          resolve(false)
        } else {
          console.log("Conexión a Supabase establecida correctamente")
          this.connectionStatus = 'connected'
          resolve(true)
        }
      } catch (err) {
        console.error("Error al verificar la conexión con Supabase:", err)
        this.connectionStatus = 'disconnected'
        resolve(false)
      } finally {
        // Limpiar la promesa después de un tiempo para permitir futuras verificaciones
        setTimeout(() => {
          this.connectionPromise = null
        }, 10000)
      }
    })

    return this.connectionPromise
  }

  // Método para ejecutar una operación con reintentos
  async withRetry<T>(operation: () => Promise<{ data: T | null, error: PostgrestError | null }>, 
                    cacheKey?: string, 
                    cacheTTL?: number): Promise<{ data: T | null, error: PostgrestError | null }> {
    // Verificar caché si se proporciona una clave
    if (cacheKey) {
      const cachedResult = this.getFromCache<T>(cacheKey)
      if (cachedResult) {
        return { data: cachedResult, error: null }
      }
    }

    let retries = 0
    let lastError: PostgrestError | null = null

    while (retries < MAX_RETRIES) {
      try {
        // Verificar la conexión antes de intentar la operación
        if (this.connectionStatus === 'disconnected') {
          const isConnected = await this.checkConnection()
          if (!isConnected) {
            retries++
            if (retries < MAX_RETRIES) {
              await this.delay(RETRY_DELAY_MS * retries)
              continue
            } else {
              return { 
                data: null, 
                error: { message: "No se pudo establecer conexión con Supabase después de varios intentos" } as PostgrestError 
              }
            }
          }
        }

        // Ejecutar la operación
        const result = await operation()

        // Si hay un error, intentar de nuevo
        if (result.error) {
          lastError = result.error
          retries++
          if (retries < MAX_RETRIES) {
            await this.delay(RETRY_DELAY_MS * retries)
            continue
          }
          return result
        }

        // Si la operación fue exitosa y hay una clave de caché, guardar el resultado
        if (cacheKey && result.data) {
          this.saveToCache(cacheKey, result.data, cacheTTL)
        }

        return result
      } catch (e) {
        console.error(`Error en la operación (intento ${retries + 1}/${MAX_RETRIES}):`, e)
        lastError = e instanceof Error 
          ? { message: e.message } as PostgrestError 
          : { message: "Error desconocido" } as PostgrestError
        
        retries++
        if (retries < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * retries)
        }
      }
    }

    return { data: null, error: lastError }
  }

  // Método para guardar en caché
  private saveToCache<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now()
    this.cache.set(key, { data, timestamp })
    
    // Programar la limpieza de la caché
    const actualTTL = ttl || this.CACHE_TTL_MS
    setTimeout(() => {
      const cached = this.cache.get(key)
      if (cached && cached.timestamp === timestamp) {
        this.cache.delete(key)
      }
    }, actualTTL)
  }

  // Método para obtener de la caché
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }

  // Método para invalidar la caché
  invalidateCache(keyPrefix?: string): void {
    if (keyPrefix) {
      // Eliminar solo las entradas que comienzan con el prefijo
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.cache.delete(key)
        }
      }
    } else {
      // Limpiar toda la caché
      this.cache.clear()
    }
  }

  // Método de utilidad para esperar
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Crear y exportar una instancia del cliente mejorado
export const enhancedSupabase = new EnhancedSupabaseClient()

// Exportar el cliente de Supabase para compatibilidad con el código existente
export const supabase = enhancedSupabase.supabase
